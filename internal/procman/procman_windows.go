package procman

import "context"

type windowsProcessManager struct {
	ctx context.Context
}

var _ platformProcessManager = (*windowsProcessManager)(nil)

func getProcessManager() *windowsProcessManager {
	return &windowsProcessManager{}
}

func (w *windowsProcessManager) GetProcessIDs() ([]int, error) {
	return nil, nil
}

func (w *windowsProcessManager) GetProcessInformation(processID int) (*ProcessInformation, error) {
	return nil, nil
}

func (w *windowsProcessManager) SetContext(ctx context.Context) {
	w.ctx = ctx
}
