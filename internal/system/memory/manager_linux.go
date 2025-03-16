package memory

import (
	"bufio"
	"context"
	"encoding/binary"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/STBoyden/memchanger/internal/system/common"
)

type linuxMemoryManager struct {
	ctx              context.Context
	heapAddressRange *AddressRange
	procInfo         *common.LinuxProcessInformation
}

var _ platformMemoryManager = (*linuxMemoryManager)(nil)

func getMemoryManager() *linuxMemoryManager {
	return &linuxMemoryManager{}
}

func parseAddress(addressRangeStr string) (int64, int64, error) {
	splits := strings.SplitN(addressRangeStr, "-", 2)

	startAddr, err := strconv.ParseInt(splits[0], 16, 64)
	if err != nil {
		return 0, 0, err
	}

	endAddr, err := strconv.ParseInt(splits[1], 16, 64)
	if err != nil {
		return 0, 0, err
	}

	return startAddr, endAddr, nil
}

func (l *linuxMemoryManager) parseMemoryMap(mapFile string) error {
	file, err := os.Open(mapFile)
	if err != nil {
		return err
	}

	scanner := bufio.NewScanner(file)
	skippedLine := false
	heapStartAddr := int64(0)
	heapEndAddr := int64(0)
	for scanner.Scan() {
		if !skippedLine {
			skippedLine = true
			continue
		}

		line := scanner.Text()
		splits := strings.Split(line, " ")
		filtered := []string{}

		for _, split := range splits {
			if split != "" {
				filtered = append(filtered, split)
			}
		}

		for index, split := range filtered {
			filtered[index] = strings.TrimSpace(split)
		}

		if len(filtered) == 6 && strings.Contains(filtered[5], "[heap]") {
			start, end, _ := parseAddress(filtered[0])

			heapEndAddr = end

			if heapStartAddr == 0 {
				heapStartAddr = start
			}
		} else {
			continue
		}
	}

	l.heapAddressRange = &AddressRange{Start: heapStartAddr, End: heapEndAddr}

	return nil
}

func (l *linuxMemoryManager) LoadProcess(processInformation *common.ProcessInformation) error {
	l.procInfo = processInformation.PlatformInformation.(*common.LinuxProcessInformation)
	err := l.parseMemoryMap(l.procInfo.MapFilePath)
	if err != nil {
		return err
	}

	processInformation.HeapSize = l.heapAddressRange.Size()

	return err
}

func (l *linuxMemoryManager) GetHeapAddressRange() (*AddressRange, error) {
	if l.heapAddressRange == nil {
		return nil, ErrProcessNotLoaded
	}

	return l.heapAddressRange, nil
}

func (l *linuxMemoryManager) ReadMemory(offset int64, size int) ([]byte, error) {
	if l.heapAddressRange == nil {
		return nil, ErrProcessNotLoaded
	}

	address := int64(l.heapAddressRange.Start) + int64(offset)

	if address > l.heapAddressRange.End {
		return nil, ErrGivenAddressOutOfRange
	}

	memFile, err := os.OpenFile(l.procInfo.MemoryFilePath, os.O_RDONLY, 0)
	if err != nil {
		return nil, err
	}
	defer memFile.Close()

	bytes := make([]byte, size)
	_, _ = memFile.Seek(address, 0)
	_, _ = memFile.Read(bytes)

	return bytes, nil
}

func (l *linuxMemoryManager) WriteMemory(offset int64, value any) (int, error) {
	if l.heapAddressRange == nil {
		return 0, ErrProcessNotLoaded
	}

	address := int64(l.heapAddressRange.Start) + int64(offset)
	size := (int)(reflect.TypeOf(value).Elem().Size())

	if address > l.heapAddressRange.End {
		return 0, ErrGivenAddressOutOfRange
	}
	if address+int64(size) > l.heapAddressRange.End {
		return 0, ErrSizeTooBig
	}

	bytes := make([]byte, size)
	switch value := value.(type) {
	case []byte:
		bytes = value
	case int8:
		bytes = append(bytes, byte(value))
	case byte:
		bytes = append(bytes, value)
	case string:
		bytes = []byte(value)
	case int16:
		binary.NativeEndian.PutUint16(bytes, uint16(value))
	case uint16:
		binary.NativeEndian.PutUint16(bytes, value)
	case float32:
		binary.NativeEndian.PutUint32(bytes, uint32(value))
	case int32:
		binary.NativeEndian.PutUint32(bytes, uint32(value))
	case int:
		binary.NativeEndian.PutUint32(bytes, uint32(value))
	case uint:
		binary.NativeEndian.PutUint32(bytes, uint32(value))
	case uint32:
		binary.NativeEndian.PutUint32(bytes, value)
	case float64:
		binary.NativeEndian.PutUint64(bytes, uint64(value))
	case int64:
		binary.NativeEndian.PutUint64(bytes, uint64(value))
	case uint64:
		binary.NativeEndian.PutUint64(bytes, value)
	default:
		return 0, ErrInvalidValueType
	}

	memFile, err := os.OpenFile(l.procInfo.MemoryFilePath, os.O_WRONLY, 0)
	if err != nil {
		return 0, err
	}
	defer memFile.Close()

	_, _ = memFile.Seek(address, 0)
	return memFile.Write(bytes)
}

func (l *linuxMemoryManager) SetContext(ctx context.Context) {
	l.ctx = ctx
}
