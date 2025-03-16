package main

import (
	"context"

	"github.com/STBoyden/memchanger/internal/system"
	"github.com/STBoyden/memchanger/internal/system/common"
	"github.com/STBoyden/memchanger/internal/system/memory"
	"github.com/STBoyden/memchanger/internal/system/process"
)

// App struct
type App struct {
	ctx               context.Context
	processManager    *process.ProcessManager
	memoryManager     *memory.MemoryManager
	systemInformation *system.SystemInformation
}

func NewApp(processManager *process.ProcessManager, memoryManager *memory.MemoryManager) *App {
	return &App{processManager: processManager, memoryManager: memoryManager, systemInformation: system.GetSystemInformation()}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.processManager.SetContext(ctx)
	a.memoryManager.SetContext(ctx)
}

func (a *App) GetMemoryManager() *memory.MemoryManager {
	return a.memoryManager
}

func (a *App) GetProcessManager() *process.ProcessManager {
	return a.processManager
}

func (a *App) GetSystemInformation() *system.SystemInformation {
	return a.systemInformation
}

func (a *App) GetAllRunningProcesses() []common.ProcessInformation {
	processes, err := a.processManager.GetProcessIDs()
	if err != nil {
		return nil
	}

	processList := []common.ProcessInformation{}
	for _, pid := range processes {
		procInfo, err := a.processManager.GetProcessInformation(pid)
		if err != nil {
			continue
		}

		err = a.memoryManager.LoadProcess(procInfo)
		if err != nil {
			continue
		}

		processList = append(processList, *procInfo)
	}

	return processList
}
