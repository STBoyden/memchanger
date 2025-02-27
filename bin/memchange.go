package main

import (
	"fmt"
	"memchange/pkg/procman"
)

func main() {
	procIDs, _ := procman.GetProcessManager().GetProcessIDs()

	for _, id := range procIDs {
		procInfo, _ := procman.GetProcessManager().GetProcessInformation(id)

		fmt.Printf("Process name: %s; Process ID: %d\n", procInfo.Name, procInfo.ID)
	}
}
