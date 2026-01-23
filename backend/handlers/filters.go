package handlers

import (
	"strings"
)

// Default allowed stores for USA demo (as per project requirements).
// You can override per-request with ?stores=Amazon,BestBuy,Walmart,Apple
var DefaultAllowedStores = []string{
	"Amazon",
	"BestBuy",
	"Walmart",
	"Apple",
	"Samsung",
	"Google",
	"OnePlus",
	"Motorola",
	"Xiaomi",
	"Lenovo",
	"ASUS",
	"Dell",
	"HP",
	"Microsoft",
	"LG",
	"Framework",
	"JBL",
	"Acer",
}

func parseStoresParam(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return DefaultAllowedStores
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	seen := map[string]bool{}
	for _, p := range parts {
		s := strings.TrimSpace(p)
		if s == "" {
			continue
		}
		key := strings.ToLower(s)
		if seen[key] {
			continue
		}
		seen[key] = true
		out = append(out, s)
	}
	if len(out) == 0 {
		return DefaultAllowedStores
	}
	return out
}

func parseConditionParam(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "New"
	}
	// Keep it flexible, but normalize common values.
	if strings.EqualFold(raw, "new") {
		return "New"
	}
	return raw
}
