package memory

import (
	"errors"
)

var (
	ErrProcessNotLoaded       = errors.New("process not loaded")
	ErrGivenAddressOutOfRange = errors.New("given offset out of range of process heap")
	ErrSizeTooBig             = errors.New("size of value at given offset is too big for heap")
	ErrInvalidValueType       = errors.New("invalid value type")
)
