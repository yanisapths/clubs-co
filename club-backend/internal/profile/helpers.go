package profile

import (
	"encoding/json"

	"github.com/lib/pq"
)

func joinClauses(parts []string) string {
	result := ""
	for i, p := range parts {
		if i > 0 {
			result += ", "
		}
		result += p
	}
	return result
}

var _ = json.Marshal
var _ = pq.Array 