package memory

type AddressRange struct {
	Start int64 // Start byte address
	End   int64 // End byte address
}

// Size gets the size of the AddressRange in bytes
func (a *AddressRange) Size() int64 {
	return (a.End - a.Start)
}
