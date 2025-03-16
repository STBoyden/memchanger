package system

import (
	"github.com/STBoyden/memchanger/internal/system/process"
	"github.com/klauspost/cpuid/v2"
	"github.com/matishsiao/goInfo"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemInformation struct {
	goInfo.GoInfoObject
	cpuid.CPUInfo

	SystemRam     uint64
	UsedSystemRam uint64
	Processes     int
}

func GetSystemInformation() *SystemInformation {
	info, err := goInfo.GetInfo()
	if err != nil {
		panic("unsupported system")
	}

	memoryInfo, err := mem.VirtualMemory()
	if err != nil {
		panic("cannot get memory information")
	}

	processManager := process.GetProcessManager()
	processIDs, err := processManager.GetProcessIDs()
	if err != nil {
		panic("cannot get processes")
	}

	return &SystemInformation{GoInfoObject: info, CPUInfo: cpuid.CPU, SystemRam: memoryInfo.Total, UsedSystemRam: memoryInfo.Used, Processes: len(processIDs)}
}
