import { useState } from "react";
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

// Mock data for processes
const mockProcesses = [
  { pid: 1234, name: "chrome.exe", memoryUsage: "256 MB" },
  { pid: 2345, name: "firefox.exe", memoryUsage: "189 MB" },
  { pid: 3456, name: "notepad.exe", memoryUsage: "12 MB" },
  { pid: 4567, name: "vscode.exe", memoryUsage: "423 MB" },
  { pid: 5678, name: "terminal", memoryUsage: "45 MB" },
  { pid: 6789, name: "systemd", memoryUsage: "32 MB" },
];

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

// Mock system information
const mockSystemInfo = {
  os: {
    name: "Windows 10 Pro",
    version: "21H2 (Build 19044.1826)",
    architecture: "x64",
  },
  cpu: {
    model: "Intel(R) Core(TM) i7-10700K @ 3.80GHz",
    cores: 8,
    threads: 16,
    usage: 23,
  },
  memory: {
    total: "32.0 GB",
    used: "12.4 GB",
    free: "19.6 GB",
    usagePercent: 39,
  },
  processes: {
    total: 142,
    threads: 2156,
    handles: 78432,
  },
};

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
    const addr = `0x${(baseAddr + i * 16).toString(16).toUpperCase().padStart(8, "0")}`;
    const hexValues = [];
    const asciiValues = [];

    for (let j = 0; j < 16; j++) {
      // Generate some pseudo-random but consistent hex values
      const value = (baseAddr + i * 16 + j) % 256;
      hexValues.push(value.toString(16).padStart(2, "0"));

      // Convert to ASCII if printable, otherwise show a dot
      asciiValues.push(
        value >= 32 && value <= 126 ? String.fromCharCode(value) : ".",
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

export default function App() {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [searchPattern, setSearchPattern] = useState("");
  const [searchType, setSearchType] = useState("hex");
  const [activeTab, setActiveTab] = useState("processes");
  const [hexDump, setHexDump] = useState<any[]>([]);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showMemoryMap, setShowMemoryMap] = useState(false);

  const handleProcessSelect = (pid: string) => {
    setSelectedProcess(pid);
    setActiveTab("memory-regions");
    // In a real app, we would fetch the actual memory regions for this process
  };

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
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Heap Memory Inspector</h1>
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

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">PID</TableHead>
                    <TableHead>Process Name</TableHead>
                    <TableHead>Memory Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProcesses.map((process) => (
                    <TableRow key={process.pid}>
                      <TableCell className="font-mono">{process.pid}</TableCell>
                      <TableCell className="font-medium">
                        {process.name}
                      </TableCell>
                      <TableCell>{process.memoryUsage}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            handleProcessSelect(process.pid.toString())
                          }
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    mockProcesses.find(
                      (p) => p.pid.toString() === selectedProcess,
                    )?.name
                  }{" "}
                  (PID: {selectedProcess})
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
                    mockProcesses.find(
                      (p) => p.pid.toString() === selectedProcess,
                    )?.name
                  }{" "}
                  (PID: {selectedProcess}) - Found {mockSearchResults.length}{" "}
                  matches for "{searchPattern || "your search"}"
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
      <Dialog open={showSystemInfo} onOpenChange={setShowSystemInfo}>
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
                <div className="text-sm">{mockSystemInfo.os.name}</div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="text-sm">{mockSystemInfo.os.version}</div>
                <div className="text-sm text-muted-foreground">
                  Architecture
                </div>
                <div className="text-sm">{mockSystemInfo.os.architecture}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">CPU</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Model</div>
                <div className="text-sm">{mockSystemInfo.cpu.model}</div>
                <div className="text-sm text-muted-foreground">
                  Cores / Threads
                </div>
                <div className="text-sm">
                  {mockSystemInfo.cpu.cores} / {mockSystemInfo.cpu.threads}
                </div>
                <div className="text-sm text-muted-foreground">Usage</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={mockSystemInfo.cpu.usage}
                    className="h-2 w-[100px]"
                  />
                  <span className="text-sm">{mockSystemInfo.cpu.usage}%</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Memory</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-sm">{mockSystemInfo.memory.total}</div>
                <div className="text-sm text-muted-foreground">Used</div>
                <div className="text-sm">{mockSystemInfo.memory.used}</div>
                <div className="text-sm text-muted-foreground">Free</div>
                <div className="text-sm">{mockSystemInfo.memory.free}</div>
                <div className="text-sm text-muted-foreground">Usage</div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={mockSystemInfo.memory.usagePercent}
                    className="h-2 w-[100px]"
                  />
                  <span className="text-sm">
                    {mockSystemInfo.memory.usagePercent}%
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
                <div className="text-sm">{mockSystemInfo.processes.total}</div>
                <div className="text-sm text-muted-foreground">Threads</div>
                <div className="text-sm">
                  {mockSystemInfo.processes.threads}
                </div>
                <div className="text-sm text-muted-foreground">Handles</div>
                <div className="text-sm">
                  {mockSystemInfo.processes.handles}
                </div>
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
