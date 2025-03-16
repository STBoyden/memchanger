import { useEffect, useMemo, useState } from "react";
import { Search, Filter, RefreshCw, Download, Layers, Cpu } from "lucide-react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { system, common } from "../wailsjs/go/models";
import {
  GetAllRunningProcesses,
  GetProcessManager,
  GetSystemInformation,
} from "../wailsjs/go/main/App";
import * as processManager from "../wailsjs/go/process/ProcessManager";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";

const MIBIBYTE = 1024 * 1024;
const GIBIBYTE = MIBIBYTE * 1024;

// Mock data for memory regions
const mockMemoryRegions = [
  {
    address: "0x00A1B2C3",
    size: "4 KB",
    protection: "RW",
    type: "Heap",
    module: "N/A",
  },
  {
    address: "0x00D4E5F6",
    size: "8 KB",
    protection: "RW",
    type: "Heap",
    module: "N/A",
  },
  {
    address: "0x00G7H8I9",
    size: "16 KB",
    protection: "RW",
    type: "Heap",
    module: "N/A",
  },
  {
    address: "0x00J1K2L3",
    size: "32 KB",
    protection: "RW",
    type: "Heap",
    module: "N/A",
  },
  {
    address: "0x00M4N5O6",
    size: "64 KB",
    protection: "RW",
    type: "Heap",
    module: "N/A",
  },
];

// Mock data for search results
const mockSearchResults = [
  {
    address: "0x00A1B2C3",
    value: "48 65 6C 6C 6F 20 57 6F 72 6C 64",
    ascii: "Hello World",
  },
  {
    address: "0x00A1B2D4",
    value: "75 73 65 72 6E 61 6D 65 3A 61 64 6D 69 6E",
    ascii: "username:admin",
  },
  {
    address: "0x00D4E5F6",
    value: "70 61 73 73 77 6F 72 64 31 32 33 34",
    ascii: "password1234",
  },
];

// Mock memory map data
const mockMemoryMap = [
  {
    start: "0x00100000",
    end: "0x00120000",
    size: "128 KB",
    type: "Code",
    protection: "RX",
    module: "kernel32.dll",
  },
  {
    start: "0x00400000",
    end: "0x00410000",
    size: "64 KB",
    type: "Code",
    protection: "RX",
    module: "ntdll.dll",
  },
  {
    start: "0x00800000",
    end: "0x00900000",
    size: "1 MB",
    type: "Data",
    protection: "RW",
    module: "user32.dll",
  },
  {
    start: "0x01000000",
    end: "0x01100000",
    size: "1 MB",
    type: "Heap",
    protection: "RW",
    module: "N/A",
  },
  {
    start: "0x02000000",
    end: "0x02080000",
    size: "512 KB",
    type: "Stack",
    protection: "RW",
    module: "N/A",
  },
  {
    start: "0x10000000",
    end: "0x10400000",
    size: "4 MB",
    type: "Mapped",
    protection: "R",
    module: "mapped_file.dat",
  },
  {
    start: "0x20000000",
    end: "0x20100000",
    size: "1 MB",
    type: "Private",
    protection: "RW",
    module: "N/A",
  },
  {
    start: "0x30000000",
    end: "0x30010000",
    size: "64 KB",
    type: "Shared",
    protection: "RW",
    module: "shared_memory",
  },
  {
    start: "0x7FFE0000",
    end: "0x7FFF0000",
    size: "64 KB",
    type: "System",
    protection: "R",
    module: "System",
  },
  {
    start: "0x7FFF0000",
    end: "0x80000000",
    size: "64 KB",
    type: "Reserved",
    protection: "--",
    module: "N/A",
  },
];

// Mock memory dump data (hex view)
const generateHexDump = (startAddress: string) => {
  const rows = [];
  const baseAddr = Number.parseInt(startAddress.replace("0x", ""), 16);

  for (let i = 0; i < 16; i++) {
    const addr = `0x${(baseAddr + i * 16)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0")}`;
    const hexValues = [];
    const asciiValues = [];

    for (let j = 0; j < 16; j++) {
      // Generate some pseudo-random but consistent hex values
      const value = (baseAddr + i * 16 + j) % 256;
      hexValues.push(value.toString(16).padStart(2, "0"));

      // Convert to ASCII if printable, otherwise show a dot
      asciiValues.push(
        value >= 32 && value <= 126 ? String.fromCharCode(value) : "."
      );
    }

    rows.push({
      address: addr,
      hexValues,
      asciiValues,
    });
  }

  return rows;
};

function ProcessTable({
  processes,
  pageSize,
  setSelectedProcess,
  setActiveTab,
}: {
  processes: common.ProcessInformation[];
  pageSize: 10 | 20 | 50 | 100;
  setSelectedProcess: (value: common.ProcessInformation) => void;
  setActiveTab: (value: string) => void;
}) {
  const handleProcessSelect = (pid: number) => {
    processManager.GetProcessInformation(pid).then((info) => {
      setSelectedProcess(info);
      setActiveTab("memory-regions");
    });
  };

  const [pagination, setPagination] = useState<{
    pageSize: number;
    pageIndex: number;
  }>({ pageSize, pageIndex: 0 });

  const columnHelper = createColumnHelper<common.ProcessInformation>();

  const defaultColumns = useMemo(
    () => [
      columnHelper.accessor("PID", { id: "pid", header: "PID" }),
      columnHelper.accessor("Name", { id: "name", header: "Process name" }),
      columnHelper.accessor("HeapSize", {
        id: "heap_size",
        header: "Heap size (KB)",
        cell: (bytes) => {
          let amount = bytes.getValue();
          if (amount === -1) {
            amount = 0;
          } else {
            amount = Math.round(amount / 1000);
          }

          return `${amount} KB`;
        },
      }),
      columnHelper.accessor("PID", {
        header: "Actions",
        cell: (pid) => (
          <Button
            variant={"ghost"}
            onClick={() => handleProcessSelect(pid.getValue())}
          >
            Inspect
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: processes,
    columns: defaultColumns,
    onPaginationChange: setPagination,
    rowCount: processes.length,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow id={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableCell
                id={header.id}
                colSpan={header.colSpan}
                className="font-bold"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getPaginationRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={
                  ["pid", "heap_size"].includes(cell.column.id)
                    ? "font-mono"
                    : ""
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableCell colSpan={defaultColumns.length + 1}>
          <Button
            variant={"secondary"}
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant={"secondary"}
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </TableCell>
      </TableFooter>
    </Table>
  );
}

export default function App() {
  const [selectedProcess, setSelectedProcess] =
    useState<common.ProcessInformation | null>(null);
  const [searchPattern, setSearchPattern] = useState("");
  const [searchType, setSearchType] = useState("hex");
  const [activeTab, setActiveTab] = useState("processes");
  const [hexDump, setHexDump] = useState<any[]>([]);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showMemoryMap, setShowMemoryMap] = useState(false);
  const [processes, setProcesses] = useState<
    common.ProcessInformation[] | null
  >(null);
  const [systemInfo, setSystemInfo] = useState<system.SystemInformation | null>(
    null
  );

  useEffect(() => {
    if (processes == null) {
      GetAllRunningProcesses().then((procs) => {
        setProcesses(procs);
      });
    }
  });

  useEffect(() => {
    if (systemInfo == null) {
      GetSystemInformation().then((sysInfo) => {
        setSystemInfo(sysInfo);
      });
    }
  });

  const handleRegionSelect = (address: string) => {
    setHexDump(generateHexDump(address));
    setActiveTab("memory-view");
  };

  const handleSearch = () => {
    if (selectedProcess) {
      setActiveTab("search-results");
      // In a real app, we would perform the actual memory search here
    }
  };

  return (
    <div className="container mx-auto py-6 h-full">
      <header className="flex justify-between items-center mb-6 w-full">
        <div className="w-full">
          <h1 className="text-3xl font-bold">MemChanger</h1>
          <p className="text-muted-foreground">
            Inspect and search process memory across platforms
          </p>
        </div>
        <div className="flex items-center">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="memory-regions" disabled={!selectedProcess}>
            Memory Regions
          </TabsTrigger>
          <TabsTrigger value="memory-view" disabled={hexDump.length === 0}>
            Memory View
          </TabsTrigger>
          <TabsTrigger value="search-results" disabled={!selectedProcess}>
            Search Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Running Processes</CardTitle>
              <CardDescription>
                Select a process to inspect its heap memory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  placeholder="Filter processes..."
                  className="max-w-sm"
                  onChange={(e) => console.log(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {processes && (
                <ProcessTable
                  processes={processes}
                  pageSize={10}
                  setSelectedProcess={setSelectedProcess}
                  setActiveTab={setActiveTab}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory-regions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Memory Regions</CardTitle>
                <CardDescription>
                  Process:{" "}
                  {
                    processes?.find((p) => p.PID === selectedProcess?.PID)
                      ?.WindowName
                  }{" "}
                  (PID: {selectedProcess?.PID ?? "unknown"})
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("processes")}
              >
                Back to Processes
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Address</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Protection</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMemoryRegions.map((region) => (
                    <TableRow key={region.address}>
                      <TableCell className="font-mono">
                        {region.address}
                      </TableCell>
                      <TableCell>{region.size}</TableCell>
                      <TableCell>{region.protection}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{region.type}</Badge>
                      </TableCell>
                      <TableCell>{region.module}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleRegionSelect(region.address)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Memory</CardTitle>
              <CardDescription>
                Search for patterns in the process memory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="grid gap-2 flex-1">
                    <Input
                      placeholder={
                        searchType === "hex"
                          ? "Enter hex pattern (e.g., FF 00 AB 12)"
                          : "Enter text to search"
                      }
                      value={searchPattern}
                      onChange={(e) => setSearchPattern(e.target.value)}
                    />
                  </div>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hex">Hex Values</SelectItem>
                      <SelectItem value="text">ASCII Text</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                      <SelectItem value="float">Float</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchPattern.trim()}
                  >
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="search-all" />
                    <label
                      htmlFor="search-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Search all memory regions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="case-sensitive" />
                    <label
                      htmlFor="case-sensitive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Case sensitive
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory-view" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Memory View</CardTitle>
                <CardDescription>
                  Viewing memory at address:{" "}
                  {hexDump.length > 0 ? hexDump[0].address : ""}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("memory-regions")}
                >
                  Back to Regions
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Address</TableHead>
                      <TableHead colSpan={16}>Hex Values</TableHead>
                      <TableHead className="w-[120px]">ASCII</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hexDump.map((row) => (
                      <TableRow key={row.address}>
                        <TableCell className="text-muted-foreground">
                          {row.address}
                        </TableCell>
                        {row.hexValues.map((hex: string, i: number) => (
                          <TableCell key={i} className="px-1 py-2 text-center">
                            {hex}
                          </TableCell>
                        ))}
                        <TableCell className="font-mono">
                          {row.asciiValues.join("")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search-results" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Process:{" "}
                  {
                    processes?.find((p) => p.PID === selectedProcess?.PID)
                      ?.WindowName
                  }{" "}
                  (PID: {selectedProcess?.PID ?? "unknown"}) - Found{" "}
                  {mockSearchResults.length} matches for "
                  {searchPattern || "your search"}"
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("memory-regions")}
                >
                  New Search
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Address</TableHead>
                    <TableHead>Hex Values</TableHead>
                    <TableHead>ASCII</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSearchResults.map((result) => (
                    <TableRow key={result.address}>
                      <TableCell className="font-mono">
                        {result.address}
                      </TableCell>
                      <TableCell className="font-mono">
                        {result.value}
                      </TableCell>
                      <TableCell>{result.ascii}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleRegionSelect(result.address);
                          }}
                        >
                          View in Context
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Info Dialog */}
      <Dialog
        open={systemInfo != null && showSystemInfo}
        onOpenChange={setShowSystemInfo}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>System Information</DialogTitle>
            <DialogDescription>
              Current system resources and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Operating System</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="text-sm">{`${systemInfo?.OS}`}</div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="text-sm">{systemInfo?.Core}</div>
                <div className="text-sm text-muted-foreground">Hostname</div>
                <div className="text-sm">{systemInfo?.Hostname}</div>
                <div className="text-sm text-muted-foreground">
                  Architecture
                </div>

                <div className="text-sm">{systemInfo?.Platform}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">CPU</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Model</div>
                <div className="text-sm">{systemInfo?.BrandName}</div>
                <div className="text-sm text-muted-foreground">
                  Physical Cores / Logical Cores
                </div>
                <div className="text-sm">
                  {systemInfo?.PhysicalCores} / {systemInfo?.LogicalCores}
                </div>
                <div className="text-sm text-muted-foreground">Usage</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(systemInfo?.Hz!! / systemInfo?.BoostFreq!!) * 100}
                    className="h-2 w-[100px]"
                  />
                  <span className="text-sm">
                    {Math.round(
                      (systemInfo?.Hz!! / systemInfo?.BoostFreq!!) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Memory</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-sm">
                  {`${(systemInfo?.SystemRam!! / GIBIBYTE).toFixed(1)} GB`}
                </div>
                <div className="text-sm text-muted-foreground">Used</div>
                <div className="text-sm">
                  {" "}
                  {`${(systemInfo?.UsedSystemRam!! / GIBIBYTE).toFixed(1)} GB`}
                </div>
                <div className="text-sm text-muted-foreground">Free</div>
                <div className="text-sm">
                  {" "}
                  {`${(
                    (systemInfo?.SystemRam!! - systemInfo?.UsedSystemRam!!) /
                    GIBIBYTE
                  ).toFixed(1)} GB`}
                </div>
                <div className="text-sm text-muted-foreground">Usage</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      (systemInfo?.UsedSystemRam!! / systemInfo?.SystemRam!!) *
                      100
                    }
                    className="h-2 w-[100px]"
                  />
                  <span className="text-sm">
                    {Math.round(
                      (systemInfo?.UsedSystemRam!! / systemInfo?.SystemRam!!) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Processes</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">
                  Total Processes
                </div>
                <div className="text-sm">{systemInfo?.Processes}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Memory Map Dialog */}
      <Dialog open={showMemoryMap} onOpenChange={setShowMemoryMap}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>System Memory Map</DialogTitle>
            <DialogDescription>
              Overview of all memory regions in the system
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Start Address</TableHead>
                  <TableHead className="w-[120px]">End Address</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Protection</TableHead>
                  <TableHead>Module</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMemoryMap.map((region, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{region.start}</TableCell>
                    <TableCell className="font-mono">{region.end}</TableCell>
                    <TableCell>{region.size}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{region.type}</Badge>
                    </TableCell>
                    <TableCell>{region.protection}</TableCell>
                    <TableCell>{region.module}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-background"
          onClick={() => setShowSystemInfo(true)}
        >
          <Cpu className="mr-2 h-4 w-4" /> System Info
        </Button>
      </div>
    </div>
  );
}
