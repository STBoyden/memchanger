export namespace common {
	
	export class ProcessInformation {
	    Name: string;
	    WindowName: string;
	    PID: number;
	    ExecutableFilePath: string;
	    HeapSize: number;
	    PlatformInformation: any;
	
	    static createFrom(source: any = {}) {
	        return new ProcessInformation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.WindowName = source["WindowName"];
	        this.PID = source["PID"];
	        this.ExecutableFilePath = source["ExecutableFilePath"];
	        this.HeapSize = source["HeapSize"];
	        this.PlatformInformation = source["PlatformInformation"];
	    }
	}

}

export namespace memory {
	
	export class AddressRange {
	    Start: number;
	    End: number;
	
	    static createFrom(source: any = {}) {
	        return new AddressRange(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Start = source["Start"];
	        this.End = source["End"];
	    }
	}
	export class MemoryManager {
	
	
	    static createFrom(source: any = {}) {
	        return new MemoryManager(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace process {
	
	export class ProcessManager {
	
	
	    static createFrom(source: any = {}) {
	        return new ProcessManager(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace system {
	
	export class SystemInformation {
	    GoOS: string;
	    Kernel: string;
	    Core: string;
	    Platform: string;
	    OS: string;
	    Hostname: string;
	    CPUs: number;
	    BrandName: string;
	    VendorID: number;
	    VendorString: string;
	    HypervisorVendorID: number;
	    HypervisorVendorString: string;
	    PhysicalCores: number;
	    ThreadsPerCore: number;
	    LogicalCores: number;
	    Family: number;
	    Model: number;
	    Stepping: number;
	    CacheLine: number;
	    Hz: number;
	    BoostFreq: number;
	    // Go type: struct { L1I int; L1D int; L2 int; L3 int }
	    Cache: any;
	    // Go type: cpuid
	    SGX: any;
	    // Go type: cpuid
	    AMDMemEncryption: any;
	    AVX10Level: number;
	    SystemRam: number;
	    UsedSystemRam: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemInformation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.GoOS = source["GoOS"];
	        this.Kernel = source["Kernel"];
	        this.Core = source["Core"];
	        this.Platform = source["Platform"];
	        this.OS = source["OS"];
	        this.Hostname = source["Hostname"];
	        this.CPUs = source["CPUs"];
	        this.BrandName = source["BrandName"];
	        this.VendorID = source["VendorID"];
	        this.VendorString = source["VendorString"];
	        this.HypervisorVendorID = source["HypervisorVendorID"];
	        this.HypervisorVendorString = source["HypervisorVendorString"];
	        this.PhysicalCores = source["PhysicalCores"];
	        this.ThreadsPerCore = source["ThreadsPerCore"];
	        this.LogicalCores = source["LogicalCores"];
	        this.Family = source["Family"];
	        this.Model = source["Model"];
	        this.Stepping = source["Stepping"];
	        this.CacheLine = source["CacheLine"];
	        this.Hz = source["Hz"];
	        this.BoostFreq = source["BoostFreq"];
	        this.Cache = this.convertValues(source["Cache"], Object);
	        this.SGX = this.convertValues(source["SGX"], null);
	        this.AMDMemEncryption = this.convertValues(source["AMDMemEncryption"], null);
	        this.AVX10Level = source["AVX10Level"];
	        this.SystemRam = source["SystemRam"];
	        this.UsedSystemRam = source["UsedSystemRam"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

