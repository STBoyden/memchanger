package main

import (
	"embed"

	"github.com/STBoyden/memchanger/internal/memory"
	"github.com/STBoyden/memchanger/internal/process"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	processManager := process.GetProcessManager()
	memoryManager := memory.GetMemoryManager()

	// Create an instance of the app structure
	app := NewApp(processManager, memoryManager)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "MemChanger",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app, processManager, memoryManager,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
