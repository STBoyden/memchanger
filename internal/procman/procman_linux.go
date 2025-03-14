package procman

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/wneessen/go-fileperm"
)

// LinuxProcessInformation contains specific information about a process on
// Linux
type LinuxProcessInformation struct {
	ctx context.Context

	MemoryFilePath string // Path to the mem file for the process
	MapFilePath    string // Path to the map file for the process
	SMapFilePath   string // Path to the smap file for the process
	StatusFilePath string // Path to the status file for the process
}

func (lpi *LinuxProcessInformation) GetPlatformType() platform {
	return Linux
}

var _ platformProcessInformation = (*LinuxProcessInformation)(nil)

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

func (l *linuxProcessManager) GetProcessInformation(processID int) (*ProcessInformation, error) {
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

	procInfo := ProcessInformation{
		PID:                processID,
		ExecutableFilePath: executableFilePath,
		PlatformInformation: &LinuxProcessInformation{
			MemoryFilePath: fmt.Sprintf("/proc/%d/mem", processID),
			MapFilePath:    fmt.Sprintf("/proc/%d/maps", processID),
			SMapFilePath:   fmt.Sprintf("/proc/%d/smaps", processID),
			StatusFilePath: procStatusFile,
		}}

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
