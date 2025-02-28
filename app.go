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
	memoryManager  memman.MemoryManager
	processManager procman.ProcessManager
}

// NewApp creates a new App application struct
func NewApp(processManager procman.ProcessManager, memoryManager memman.MemoryManager) *App {
	return &App{memoryManager: memoryManager, processManager: processManager}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
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
