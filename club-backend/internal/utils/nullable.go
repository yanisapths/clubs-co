package utils

import "encoding/json"

// NullableString distinguishes between:
//   - field absent from JSON  → Present = false
//   - field sent as null      → Present = true, Value = nil
//   - field sent as "..."     → Present = true, Value = &"..."
type NullableString struct {
	Value   *string
	Present bool
}

func (n *NullableString) UnmarshalJSON(data []byte) error {
	n.Present = true
	if string(data) == "null" {
		n.Value = nil
		return nil
	}
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	n.Value = &s
	return nil
}