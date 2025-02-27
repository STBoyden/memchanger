package procman

type PlatformProcessInformation interface{}

// ProcessInformation contains information about a process
type ProcessInformation struct {
	Name                string                     // Name of the process
	ID                  int                        // System process ID
	PlatformInformation PlatformProcessInformation // Any platform-specific information about the process (may be nil)
}

// ProcessManager is an interface for getting information about running
// processes from operating system for the current user
type ProcessManager interface {
	GetProcessIDs() ([]int, error)                                    // Get a list of all the currently running process IDs for the current user
	GetProcessInformation(processID int) (*ProcessInformation, error) // Get information about a specific process
}

// GetProcessManager returns a ProcessManager instance for the current platform.
// On Linux, it returns a linuxProcessManager instance. On Windows, it returns a
// windowsProcessManager instance.
func GetProcessManager() ProcessManager {
	return getProcessManager()
}
