package memman

import (
	"reflect"

	"github.com/STBoyden/memchanger/internal/procman"
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

type MemoryManager interface {
	LoadProcess(processInformation procman.ProcessInformation) error // LoadProcess loads the process memory information into the memory manager
	GetHeapAddressRange() (*AddressRange, error)                     // GetHeapAddressRange returns the address range of the heap of the loaded process
	ReadMemory(offset int64, size int) ([]byte, error)               // ReadMemory gets a particular value in the memory of the loaded process
	WriteMemory(offset int64, value any) (int, error)                // WriteMemory writes a particular value in the memory of the loaded process
}

// ReadMemoryHelper is a helper function to read memory using the size of a
// given T type.
func ReadMemoryHelper[T any](memoryManager MemoryManager, address int64) ([]byte, error) {
	size := (int)(reflect.TypeOf((*T)(nil)).Elem().Size())
	return memoryManager.ReadMemory(address, size)
}

func GetMemoryManager() MemoryManager {
	return getMemoryManager()
}
