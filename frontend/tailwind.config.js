/** @type {import('tailwindcss').Config} */
export default {
  // force reload 1
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ─── Color Tokens (TransitOps / Stitch Design System) ──────────────────
      colors: {
        // Primary — Mauve/Plum brand
        "primary":                    "#714b67",
        "on-primary":                 "#ffffff",
        "primary-container":          "#ffd7f1",
        "on-primary-container":       "#2f1029",
        "primary-fixed":              "#ffd7f1",
        "primary-fixed-dim":          "#e9b8d9",
        "on-primary-fixed":           "#2f1029",
        "on-primary-fixed-variant":   "#5f3b56",
        "inverse-primary":            "#e9b8d9",

        // Secondary — Teal brand
        "secondary":                  "#017E84",
        "on-secondary":               "#ffffff",
        "secondary-container":        "#92eff5",
        "on-secondary-container":     "#006e73",
        "secondary-fixed":            "#95f1f8",
        "secondary-fixed-dim":        "#78d5db",
        "on-secondary-fixed":         "#002022",
        "on-secondary-fixed-variant": "#004f53",

        // Tertiary — Amber/Gold accent
        "tertiary":                   "#533c00",
        "on-tertiary":                "#ffffff",
        "tertiary-container":         "#705300",
        "on-tertiary-container":      "#ffc530",
        "tertiary-fixed":             "#ffdf9e",
        "tertiary-fixed-dim":         "#fabd00",
        "on-tertiary-fixed":          "#261a00",
        "on-tertiary-fixed-variant":  "#5b4300",

        // Error
        "error":                      "#ba1a1a",
        "on-error":                   "#ffffff",
        "error-container":            "#ffdad6",
        "on-error-container":         "#93000a",

        // Surface / Background
        "background":                 "#f7f9ff",
        "on-background":              "#181c20",
        "surface":                    "#f7f9ff",
        "on-surface":                 "#181c20",
        "surface-variant":            "#e0e3e8",
        "on-surface-variant":         "#4e444a",
        "surface-bright":             "#f7f9ff",
        "surface-dim":                "#d7dadf",
        "surface-tint":               "#79526f",

        // Surface containers
        "surface-container-lowest":   "#ffffff",
        "surface-container-low":      "#f1f4f9",
        "surface-container":          "#ebeef3",
        "surface-container-high":     "#e5e8ee",
        "surface-container-highest":  "#e0e3e8",
        "surface-gray":               "#E9ECEF",
        "background-white":           "#FFFFFF",

        // Outline
        "outline":                    "#80747a",
        "outline-variant":            "#d1c3ca",
        "border-subtle":              "#DEE2E6",

        // Inverse
        "inverse-surface":            "#2d3135",
        "inverse-on-surface":         "#eef1f6",

        // Brand-specific
        "odoo-teal":                  "#017E84",
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        "DEFAULT":  "0.125rem",  // 2px
        "lg":       "0.25rem",   // 4px
        "xl":       "0.5rem",    // 8px
        "2xl":      "0.75rem",   // 12px
        "full":     "9999px",
      },

      // ─── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        "xxs":            "4px",
        "xs":             "8px",
        "sm":             "12px",
        "md":             "16px",
        "lg":             "24px",
        "xl":             "32px",
        "gutter":         "16px",
        "margin":         "24px",
        "margin-mobile":  "16px",
        "margin-desktop": "32px",
        "base":           "4px",
        "max-width":      "1440px",
        // legacy tokens kept for compatibility
        "stack-sm":       "8px",
        "stack-md":       "16px",
        "stack-lg":       "32px",
        "unit":           "8px",
        "container-max":  "1440px",
      },

      // ─── Font Families ──────────────────────────────────────────────────────
      fontFamily: {
        "sans":           ["Hanken Grotesk", "sans-serif"],
        "display-lg":     ["Hanken Grotesk"],
        "headline-lg":    ["Hanken Grotesk"],
        "headline-md":    ["Hanken Grotesk"],
        "headline-sm":    ["Hanken Grotesk"],
        "title-md":       ["Hanken Grotesk"],
        "title-sm":       ["Hanken Grotesk"],
        "title-lg":       ["Hanken Grotesk"],
        "body-lg":        ["Hanken Grotesk"],
        "body-md":        ["Hanken Grotesk"],
        "body-sm":        ["Hanken Grotesk"],
        "label-caps":     ["Hanken Grotesk"],
        "label-md":       ["Hanken Grotesk"],
        "label-sm":       ["Hanken Grotesk"],
        "caption":        ["Hanken Grotesk"],
        "data-mono":      ["JetBrains Mono", "monospace"],
        // legacy
        "hero-lg":        ["Hanken Grotesk"],
        "hero-lg-mobile": ["Hanken Grotesk"],
        "display-md":     ["Hanken Grotesk"],
      },

      // ─── Font Sizes ─────────────────────────────────────────────────────────
      fontSize: {
        "display-lg":     ["32px", { lineHeight: "40px",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg":    ["32px", { lineHeight: "40px",  fontWeight: "600" }],
        "headline-md":    ["24px", { lineHeight: "32px",  fontWeight: "600" }],
        "headline-sm":    ["18px", { lineHeight: "24px",  fontWeight: "600" }],
        "title-md":       ["20px", { lineHeight: "28px",  fontWeight: "600" }],
        "title-sm":       ["18px", { lineHeight: "24px",  fontWeight: "600" }],
        "title-lg":       ["24px", { lineHeight: "32px",  fontWeight: "600" }],
        "body-lg":        ["16px", { lineHeight: "24px",  fontWeight: "400" }],
        "body-md":        ["14px", { lineHeight: "20px",  fontWeight: "400" }],
        "body-sm":        ["13px", { lineHeight: "18px",  fontWeight: "400" }],
        "label-caps":     ["12px", { lineHeight: "16px",  letterSpacing: "0.05em", fontWeight: "700" }],
        "label-md":       ["12px", { lineHeight: "16px",  letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm":       ["11px", { lineHeight: "14px",  fontWeight: "500" }],
        "data-mono":      ["13px", { lineHeight: "18px",  fontWeight: "500" }],
        "caption":        ["12px", { lineHeight: "16px",  fontWeight: "400" }],
        // legacy
        "hero-lg":        ["48px", { lineHeight: "1.2",   letterSpacing: "-0.02em", fontWeight: "800" }],
        "hero-lg-mobile": ["32px", { lineHeight: "1.2",   fontWeight: "800" }],
        "display-md":     ["32px", { lineHeight: "1.3",   fontWeight: "700" }],
      },
    },
  },
  plugins: [],
}
