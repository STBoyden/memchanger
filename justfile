[linux]
build:
    go tool github.com/wailsapp/wails/v2/cmd/wails build -tags webkit2_41

[linux]
run:
    go tool github.com/wailsapp/wails/v2/cmd/wails dev -tags webkit2_41

[windows]
build:
    go tool github.com/wailsapp/wails/v2/cmd/wails build

[windows]
run:
    go tool github.com/wailsapp/wails/v2/cmd/wails dev

lint:
    go tool github.com/golangci/golangci-lint/cmd/golangci-lint run