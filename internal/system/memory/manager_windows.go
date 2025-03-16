package memory

import (
	"context"

	"github.com/STBoyden/memchanger/internal/system/common"
)

type windowsMemoryManager struct {
	ctx context.Context
}

var _ platformMemoryManager = (*windowsMemoryManager)(nil)

func getMemoryManager() *windowsMemoryManager {
	return &windowsMemoryManager{}
}

func (w *windowsMemoryManager) LoadProcess(processInformation *common.ProcessInformation) error {
	return nil
}

func (w *windowsMemoryManager) GetHeapAddressRange() (*AddressRange, error) {
	return nil, nil
}

func (w *windowsMemoryManager) ReadMemory(offset int64, size int) ([]byte, error) {
	return nil, nil
}

func (w *windowsMemoryManager) WriteMemory(offset int64, value any) (int, error) {
	return 0, nil
}

func (w *windowsMemoryManager) SetContext(ctx context.Context) {
	w.ctx = ctx
}
