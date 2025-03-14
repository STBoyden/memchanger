export namespace common {
	
	export class ProcessInformation {
	    Name: string;
	    WindowName: string;
	    PID: number;
	    ExecutableFilePath: string;
	    HeapMemoryUsage: number;
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
	        this.HeapMemoryUsage = source["HeapMemoryUsage"];
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

