package system

import (
	"github.com/matishsiao/goInfo"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemInformation struct {
	goInfo.GoInfoObject

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

	return &SystemInformation{GoInfoObject: info, SystemRam: memoryInfo.Total, UsedSystemRam: memoryInfo.Used}
}
