package procman

type windowsProcessManager struct{}

var _ ProcessManager = (*windowsProcessManager)(nil)

func getProcessManager() *windowsProcessManager {
	return &windowsProcessManager{}
}

func (wpm *windowsProcessManager) GetProcessIDs() ([]int, error) {
	return nil, nil
}

func (wpm *windowsProcessManager) GetProcessInformation(processID int) (*ProcessInformation, error) {
	return nil, nil
}
