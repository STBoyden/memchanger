package process

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/STBoyden/memchanger/internal/system/common"
	"github.com/wneessen/go-fileperm"
)

// linuxProcessManager is a ProcessManager implementation for Linux
type linuxProcessManager struct {
	ctx context.Context
}

var _ platformProcessManager = (*linuxProcessManager)(nil)

func getProcessManager() *linuxProcessManager {
	return &linuxProcessManager{}
}

func (l *linuxProcessManager) GetProcessIDs() ([]int, error) {
	// all the currently running processes are available in /proc folder on
	// linux
	procEntries, err := os.ReadDir("/proc")
	if err != nil {
		return nil, err
	}

	procIDs := []int{}
	for _, e := range procEntries {
		// process folders are just integers, any file that *isn't* is not a
		// process and should be ignored
		id, err := strconv.Atoi(e.Name())
		if err != nil {
			continue
		}

		perms, err := fileperm.New(fmt.Sprintf("/proc/%s/mem", e.Name()))
		if err != nil {
			continue
		}

		// we want to filter out any and all processes that are not owned or at
		// least read/writable by the current user
		if !perms.UserWriteReadable() {
			continue
		}

		procIDs = append(procIDs, id)
	}

	return procIDs, nil
}

func (l *linuxProcessManager) GetProcessInformation(processID int) (*common.ProcessInformation, error) {
	procStatusFile := fmt.Sprintf("/proc/%d/status", processID)

	file, err := os.Open(procStatusFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	executableFilePath, err := os.Readlink(fmt.Sprintf("/proc/%d/exe", processID))
	if err != nil {
		executableFilePath = "< none found >"
	}

	procInfo := common.ProcessInformation{
		PID:                processID,
		ExecutableFilePath: executableFilePath,
		HeapSize:           0,
		PlatformInformation: &common.LinuxProcessInformation{
			MemoryFilePath: fmt.Sprintf("/proc/%d/mem", processID),
			MapFilePath:    fmt.Sprintf("/proc/%d/maps", processID),
			SMapFilePath:   fmt.Sprintf("/proc/%d/smaps", processID),
			StatusFilePath: procStatusFile,
		},
	}

	scanner := bufio.NewScanner(file)
	lines := 0
	for scanner.Scan() {
		if lines >= 1 {
			break
		}

		split := strings.Split(scanner.Text(), ":")
		name := strings.TrimSpace(split[1])

		procInfo.Name = name
		procInfo.WindowName = name

		lines++
	}

	return &procInfo, nil
}

func (l *linuxProcessManager) SetContext(ctx context.Context) {
	l.ctx = ctx
}
