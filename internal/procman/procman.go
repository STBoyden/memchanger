package procman

import "context"

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
	PlatformInformation platformProcessInformation // Any platform-specific information about the process (may be nil)
}

type ProcessManager struct {
	platformManager platformProcessManager
}

func (p *ProcessManager) SetContext(ctx context.Context) {
	p.platformManager.SetContext(ctx)
}

func (p *ProcessManager) GetProcessIDs() ([]int, error) {
	return p.platformManager.GetProcessIDs()
}

func (p *ProcessManager) GetProcessInformation(processID int) (*ProcessInformation, error) {
	return p.platformManager.GetProcessInformation(processID)
}

// platformProcessManager is an interface for getting information about running
// processes from operating system for the current user
type platformProcessManager interface {
	SetContext(context.Context)                                       // SetContext sets the context for the process manager
	GetProcessIDs() ([]int, error)                                    // Get a list of all the currently running process IDs for the current user
	GetProcessInformation(processID int) (*ProcessInformation, error) // Get information about a specific process
}

// GetProcessManager returns a ProcessManager instance for the current platform.
// On Linux, it returns a linuxProcessManager instance. On Windows, it returns a
// windowsProcessManager instance
func GetProcessManager() *ProcessManager {
	return &ProcessManager{platformManager: getProcessManager()}
}
