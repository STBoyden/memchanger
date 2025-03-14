package memory

import "fmt"

type LoadProcessErrorReason string
type ReadWriteMemoryErrorReason string

const (
	// NoSuchProcess LoadProcessErrorReason = "No such process"

	ProcessNotLoaded       ReadWriteMemoryErrorReason = "Process not loaded"
	GivenAddressOutOfRange                            = "Given offset out of range of process heap"
	SizeTooBig                                        = "Size of value at given offset is too big for heap"
	InvalidValueType                                  = "Invalid value type"
)

// type LoadProcessError struct {
// 	reason LoadProcessErrorReason
// }

// func (lpe *LoadProcessError) Error() string {
// 	return fmt.Sprintf("Failed to load process: %s", lpe.reason)
// }

// var _ error = (*LoadProcessError)(nil)

type ReadWriteMemoryError struct {
	reason ReadWriteMemoryErrorReason
}

func (rme *ReadWriteMemoryError) Error() string {
	return fmt.Sprintf("Failed to read memory of process: %s", rme.reason)
}

var _ error = (*ReadWriteMemoryError)(nil)
