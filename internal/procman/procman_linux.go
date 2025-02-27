package procman

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/wneessen/go-fileperm"
)

type linuxProcessManager struct{}

var _ ProcessManager = (*linuxProcessManager)(nil)

func getProcessManager() *linuxProcessManager {
	return &linuxProcessManager{}
}

func (lpm *linuxProcessManager) GetProcessIDs() ([]int, error) {
	// all the currently running processes are available in /proc folder on linux
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

func (lpm *linuxProcessManager) GetProcessInformation(processID int) (*ProcessInformation, error) {
	procStatusFile := fmt.Sprintf("/proc/%d/status", processID)

	file, err := os.Open(procStatusFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	procInfo := ProcessInformation{ID: processID}

	scanner := bufio.NewScanner(file)
	lines := 0
	for scanner.Scan() {
		if lines >= 1 {
			break
		}

		split := strings.Split(scanner.Text(), ":")
		name := strings.TrimSpace(split[1])

		procInfo.Name = name

		lines++
	}

	return &procInfo, nil
}
