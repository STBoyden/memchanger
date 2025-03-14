package main

import (
	"context"
	"fmt"

	"github.com/STBoyden/memchanger/internal/memman"
	"github.com/STBoyden/memchanger/internal/procman"
)

// App struct
type App struct {
	ctx            context.Context
	processManager *procman.ProcessManager
	memoryManager  *memman.MemoryManager
}

func NewApp(processManager *procman.ProcessManager, memoryManager *memman.MemoryManager) *App {
	return &App{processManager: processManager, memoryManager: memoryManager}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.processManager.SetContext(ctx)
	a.memoryManager.SetContext(ctx)
}

func (a *App) GetMemoryManager() *memman.MemoryManager {
	return a.memoryManager
}

func (a *App) GetProcessManager() *procman.ProcessManager {
	return a.processManager
}

func (a *App) GetAllRunningProcesses() []string {
	processes, err := a.processManager.GetProcessIDs()
	if err != nil {
		return nil
	}

	processNames := []string{}
	for _, pid := range processes {
		procInfo, err := a.processManager.GetProcessInformation(pid)
		if err != nil {
			continue
		}

		processNames = append(processNames, fmt.Sprintf("%s (%d)", procInfo.Name, pid))
	}

	return processNames
}
