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
	mem, err := memman.ReadMemoryHelper[byte](memoryManager, 0x2)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return
	} else {
		fmt.Printf("mem: %v\n", mem)
	}

	mem[0] = 1
	written, err := memoryManager.WriteMemory(0x2, mem)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return
	} else {
		fmt.Printf("written: %d byte(s)\n", written)
	}

	mem, err = memman.ReadMemoryHelper[byte](memoryManager, 0x2)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return
	} else {
		fmt.Printf("mem: %v\n", mem)
	}

	mem[0] = 0
	written, err = memoryManager.WriteMemory(0x2, mem)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return
	} else {
		fmt.Printf("written: %d byte(s)\n", written)
	}

	mem, err = memman.ReadMemoryHelper[byte](memoryManager, 0x2)
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return
	} else {
		fmt.Printf("mem: %v\n", mem)
	}
}
