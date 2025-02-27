package memman

import "github.com/STBoyden/memchanger/internal/procman"

type windowsMemoryManager struct{}

var _ MemoryManager = (*windowsMemoryManager)(nil)

func getMemoryManager() *windowsMemoryManager {
	return &windowsMemoryManager{}
}

func (wmm *windowsMemoryManager) LoadProcess(processInformation procman.ProcessInformation) error {
	return nil
}

func (wmm *windowsMemoryManager) GetHeapAddressRange() (*AddressRange, error) {
	return nil, nil
}

func (wmm *windowsMemoryManager) ReadMemory(offset int64, size int) ([]byte, error) {
	return nil, nil
}

func (wmm *windowsMemoryManager) WriteMemory(offset int64, value any) (int, error) {
	return 0, nil
}
