package main

import (
	"embed"

	"github.com/STBoyden/memchanger/internal/memman"
	"github.com/STBoyden/memchanger/internal/procman"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	processManager := procman.GetProcessManager()
	memoryManager := memman.GetMemoryManager()

	// Create an instance of the app structure
	app := NewApp(processManager, memoryManager)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "MemChanger",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
