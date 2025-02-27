package cmd

import (
	"fmt"

	"github.com/STBoyden/memchanger/internal/memman"
	"github.com/STBoyden/memchanger/internal/procman"
)

func Run() {
	procIDs, _ := procman.GetProcessManager().GetProcessIDs()

	procInfo, _ := procman.GetProcessManager().GetProcessInformation(procIDs[0])
	fmt.Printf("PID: %d\n", procInfo.PID)
	memoryManager := memman.GetMemoryManager()

	memoryManager.LoadProcess(*procInfo)
	mem, err := memman.ReadMemoryHelper[int](memoryManager, 0x2)
	if err != nil {
		fmt.Printf("error: %v\n", err)
	} else {
		fmt.Printf("mem: %v\n", mem)
	}
}
