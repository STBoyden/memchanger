package procman

type PlatformProcessInformation interface{}

type ProcessInformation struct {
	Name                string
	ID                  int
	PlatformInformation PlatformProcessInformation
}

type ProcessManager interface {
	GetProcessIDs() ([]int, error)
	GetProcessInformation(processID int) (*ProcessInformation, error)
}
