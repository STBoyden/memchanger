package common

type platform int

const (
	Linux platform = iota
	Windows
)

type platformProcessInformation interface {
	GetPlatformType() platform // Get platform type for this process information, useful for conditional casting
}

// ProcessInformation contains information about a process
type ProcessInformation struct {
	Name                string                     // Name of the process
	WindowName          string                     // Name of the window of the process (if it has one). On Linux, this is the same as Name.
	PID                 int                        // System process ID
	ExecutableFilePath  string                     // Path to the executable file for the process
	HeapMemoryUsage     int64                      // Memory usage in bytes
	PlatformInformation platformProcessInformation // Any platform-specific information about the process (may be nil)
}
