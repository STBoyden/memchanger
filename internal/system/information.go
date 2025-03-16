package system

import (
	"github.com/klauspost/cpuid/v2"
	"github.com/matishsiao/goInfo"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemInformation struct {
	goInfo.GoInfoObject
	cpuid.CPUInfo

	SystemRam     uint64
	UsedSystemRam uint64
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

	return &SystemInformation{GoInfoObject: info, CPUInfo: cpuid.CPU, SystemRam: memoryInfo.Total, UsedSystemRam: memoryInfo.Used}
}
