package common

// LinuxProcessInformation contains specific information about a process on
// Linux
type LinuxProcessInformation struct {
	MemoryFilePath string // Path to the mem file for the process
	MapFilePath    string // Path to the map file for the process
	SMapFilePath   string // Path to the smap file for the process
	StatusFilePath string // Path to the status file for the process
}

func (lpi *LinuxProcessInformation) GetPlatformType() platform {
	return Linux
}

var _ platformProcessInformation = (*LinuxProcessInformation)(nil)
