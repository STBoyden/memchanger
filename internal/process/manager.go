package process

import (
	"context"

	"github.com/STBoyden/memchanger/internal/common"
)

// ProcessManager is the exported struct that simply contains a platformManager field.
type ProcessManager struct {
	platformManager platformProcessManager
}

func (p *ProcessManager) SetContext(ctx context.Context) {
	p.platformManager.SetContext(ctx)
}

func (p *ProcessManager) GetProcessIDs() ([]int, error) {
	return p.platformManager.GetProcessIDs()
}

func (p *ProcessManager) GetProcessInformation(processID int) (*common.ProcessInformation, error) {
	return p.platformManager.GetProcessInformation(processID)
}

// platformProcessManager is an interface for getting information about running
// processes from operating system for the current user
type platformProcessManager interface {
	SetContext(context.Context)                                              // SetContext sets the context for the process manager
	GetProcessIDs() ([]int, error)                                           // Get a list of all the currently running process IDs for the current user
	GetProcessInformation(processID int) (*common.ProcessInformation, error) // Get information about a specific process
}

// GetProcessManager returns a ProcessManager instance for the current platform.
// On Linux, it returns a linuxProcessManager instance. On Windows, it returns a
// windowsProcessManager instance
func GetProcessManager() *ProcessManager {
	return &ProcessManager{platformManager: getProcessManager()}
}
