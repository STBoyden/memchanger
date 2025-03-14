package memman

import (
	"context"
	"reflect"

	"github.com/STBoyden/memchanger/internal/common"
)

const KIBIBYTE = 1024
const MEBIBYTE = KIBIBYTE * KIBIBYTE
const GIBIBYTE = MEBIBYTE * KIBIBYTE
const KILOBYTE = 1000
const MEGABYTE = KILOBYTE * KILOBYTE
const GIGABYTE = MEGABYTE * KILOBYTE

type AddressRange struct {
	Start int64 // Start byte address
	End   int64 // End byte address
}

// Size gets the size of the AddressRange in bytes
func (a *AddressRange) Size() int64 {
	return (a.End - a.Start)
}

// MemoryManager is the exported struct that simply contains a platformManager field.
type MemoryManager struct {
	platformManager platformMemoryManager
}

func (m *MemoryManager) LoadProcess(processInformation common.ProcessInformation) error {
	return m.platformManager.LoadProcess(processInformation)
}

func (m *MemoryManager) GetHeapAddressRange() (*AddressRange, error) {
	return m.platformManager.GetHeapAddressRange()
}

func (m *MemoryManager) ReadMemory(offset int64, size int) ([]byte, error) {
	return m.platformManager.ReadMemory(offset, size)
}

func (m *MemoryManager) WriteMemory(offset int64, value any) (int, error) {
	return m.platformManager.WriteMemory(offset, value)
}

func (m *MemoryManager) SetContext(ctx context.Context) {
	m.platformManager.SetContext(ctx)
}

type platformMemoryManager interface {
	SetContext(context.Context)                                     // SetContext sets the context for the memory manager
	LoadProcess(processInformation common.ProcessInformation) error // LoadProcess loads the process memory information into the memory manager
	GetHeapAddressRange() (*AddressRange, error)                    // GetHeapAddressRange returns the address range of the heap of the loaded process
	ReadMemory(offset int64, size int) ([]byte, error)              // ReadMemory gets a particular value in the memory of the loaded process
	WriteMemory(offset int64, value any) (int, error)               // WriteMemory writes a particular value in the memory of the loaded process
}

// ReadMemoryHelper is a helper function to read memory using the size of a
// given T type.
func ReadMemoryHelper[T any](memoryManager MemoryManager, address int64) ([]byte, error) {
	size := (int)(reflect.TypeOf((*T)(nil)).Elem().Size())
	return memoryManager.platformManager.ReadMemory(address, size)
}

// GetMemoryManager returns the memory manager for the current platform. On
// Linux, it returns a linuxMemoryManager instance. On Windows, it returns a
// windowsMemoryManager instance.
func GetMemoryManager() *MemoryManager {
	return &MemoryManager{platformManager: getMemoryManager()}
}
