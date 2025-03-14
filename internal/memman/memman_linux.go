package memman

import (
	"bufio"
	"context"
	"encoding/binary"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/STBoyden/memchanger/internal/procman"
)

type linuxMemoryManager struct {
	ctx              context.Context
	heapAddressRange *AddressRange
	procInfo         *procman.LinuxProcessInformation
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

func (l *linuxMemoryManager) LoadProcess(processInformation procman.ProcessInformation) error {
	l.procInfo = processInformation.PlatformInformation.(*procman.LinuxProcessInformation)
	err := l.parseMemoryMap(l.procInfo.MapFilePath)

	return err
}

func (l *linuxMemoryManager) GetHeapAddressRange() (*AddressRange, error) {
	if l.heapAddressRange == nil {
		return nil, &ReadWriteMemoryError{reason: ProcessNotLoaded}
	}

	return l.heapAddressRange, nil
}

func (l *linuxMemoryManager) ReadMemory(offset int64, size int) ([]byte, error) {
	if l.heapAddressRange == nil {
		return nil, &ReadWriteMemoryError{reason: ProcessNotLoaded}
	}

	address := int64(l.heapAddressRange.Start) + int64(offset)

	if address > l.heapAddressRange.End {
		return nil, &ReadWriteMemoryError{reason: GivenAddressOutOfRange}
	}

	memFile, err := os.OpenFile(l.procInfo.MemoryFilePath, os.O_RDONLY, 0)
	if err != nil {
		return nil, err
	}
	defer memFile.Close()

	bytes := make([]byte, size, size)
	memFile.Seek(address, 0)
	memFile.Read(bytes)

	return bytes, nil
}

func (l *linuxMemoryManager) WriteMemory(offset int64, value any) (int, error) {
	if l.heapAddressRange == nil {
		return 0, &ReadWriteMemoryError{reason: ProcessNotLoaded}
	}

	address := int64(l.heapAddressRange.Start) + int64(offset)
	size := (int)(reflect.TypeOf(value).Elem().Size())

	if address > l.heapAddressRange.End {
		return 0, &ReadWriteMemoryError{reason: GivenAddressOutOfRange}
	}
	if address+int64(size) > l.heapAddressRange.End {
		return 0, &ReadWriteMemoryError{reason: SizeTooBig}
	}

	bytes := make([]byte, size, size)
	switch value.(type) {
	case []byte:
		bytes = value.([]byte)
		break
	case byte:
	case int8:
		bytes = append(bytes, value.(byte))
		break
	case string:
		bytes = []byte(value.(string))
		break
	case int16:
	case uint16:
		binary.LittleEndian.PutUint16(bytes, value.(uint16))
		break
	case float32:
	case int32:
	case int:
	case uint32:
	case uint:
		binary.LittleEndian.PutUint32(bytes, value.(uint32))
		break
	case float64:
	case int64:
	case uint64:
		binary.LittleEndian.PutUint64(bytes, value.(uint64))
		break
	default:
		return 0, &ReadWriteMemoryError{reason: InvalidValueType}
	}

	memFile, err := os.OpenFile(l.procInfo.MemoryFilePath, os.O_WRONLY, 0)
	if err != nil {
		return 0, err
	}
	defer memFile.Close()

	memFile.Seek(address, 0)
	return memFile.Write(bytes)
}

func (l *linuxMemoryManager) SetContext(ctx context.Context) {
	l.ctx = ctx
}
