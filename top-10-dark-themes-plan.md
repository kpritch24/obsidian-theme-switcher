# Plan: Add Top 10 Dark Themes

## Summary
Add the top 10 most popular dark themes from the 2025 developer themes list to the Obsidian themes plugin.

## Themes to Implement

| # | Theme | ID | Source |
|---|-------|-----|--------|
| 1 | One Dark Pro | `one-dark-pro` | [GitHub](https://github.com/Binaryify/OneDark-Pro) |
| 2 | Gruvbox Dark | `gruvbox-dark` | [GitHub](https://github.com/morhetz/gruvbox) |
| 3 | Nord | `nord` | [nordtheme.com](https://www.nordtheme.com/docs/colors-and-palettes) |
| 4 | Material Oceanic | `material-oceanic` | [material-theme.com](https://material-theme.com/docs/reference/color-palette/) |
| 5 | Monokai Pro | `monokai-pro` | [monokai.pro](https://monokai.pro/) |
| 6 | Night Owl | `night-owl` | [GitHub](https://github.com/sdras/night-owl-vscode-theme) |
| 7 | Solarized Dark | `solarized-dark` | [ethanschoonover.com](https://ethanschoonover.com/solarized/) |
| 8 | Ayu Dark | `ayu-dark` | [GitHub](https://github.com/ayu-theme/ayu-colors) |
| 9 | GitHub Dark | `github-dark` | [Primer](https://primer.style/design/foundations/color/) |
| 10 | Rosé Pine | `rose-pine` | [rosepinetheme.com](https://rosepinetheme.com/palette/) |

## Files to Create

| File | Theme |
|------|-------|
| `src/models/themes/OneDarkPro.ts` | One Dark Pro |
| `src/models/themes/GruvboxDark.ts` | Gruvbox Dark |
| `src/models/themes/Nord.ts` | Nord |
| `src/models/themes/MaterialOceanic.ts` | Material Oceanic |
| `src/models/themes/MonokaiPro.ts` | Monokai Pro |
| `src/models/themes/NightOwl.ts` | Night Owl |
| `src/models/themes/SolarizedDark.ts` | Solarized Dark |
| `src/models/themes/AyuDark.ts` | Ayu Dark |
| `src/models/themes/GitHubDark.ts` | GitHub Dark |
| `src/models/themes/RosePine.ts` | Rosé Pine |

## File to Modify
- `src/models/DefaultThemes.ts` - Import and register all 10 new themes

---

## Color Palettes (Official Sources)

### 1. One Dark Pro
```
Background: #282c34
Foreground: #abb2bf
Red: #e06c75
Green: #98c379
Yellow: #e5c07b
Blue: #61afef
Cyan: #56b6c2
Purple: #c678dd
Orange: #d19a66
Selection: #67769660
Line highlight: #2c313c
Comment: #5c6370
```

### 2. Gruvbox Dark (medium contrast)
```
Background (dark0): #282828
Background (dark1): #3c3836
Background (dark2): #504945
Foreground: #ebdbb2
Gray: #928374
Red: #fb4934 (bright) / #cc241d (neutral)
Green: #b8bb26 (bright) / #98971a (neutral)
Yellow: #fabd2f (bright) / #d79921 (neutral)
Blue: #83a598 (bright) / #458588 (neutral)
Purple: #d3869b (bright) / #b16286 (neutral)
Aqua: #8ec07c (bright) / #689d6a (neutral)
Orange: #fe8019 (bright) / #d65d0e (neutral)
```

### 3. Nord
```
Polar Night (backgrounds):
  nord0: #2e3440 (primary bg)
  nord1: #3b4252 (secondary)
  nord2: #434c5e (highlight)
  nord3: #4c566a (comments)
Snow Storm (text):
  nord4: #d8dee9 (primary text)
  nord5: #e5e9f0 (brighter)
  nord6: #eceff4 (brightest)
Frost (accents):
  nord7: #8fbcbb (teal)
  nord8: #88c0d0 (cyan)
  nord9: #81a1c1 (blue)
  nord10: #5e81ac (dark blue)
Aurora (colors):
  nord11: #bf616a (red)
  nord12: #d08770 (orange)
  nord13: #ebcb8b (yellow)
  nord14: #a3be8c (green)
  nord15: #b48ead (purple)
```

### 4. Material Oceanic
```
Background: #263238
Background Alt: #1e272c
Foreground: #b0bec5
Selection: #546e7a
Comment: #546e7a
Red: #ff5370
Orange: #f78c6c
Yellow: #ffcb6b
Green: #c3e88d
Cyan: #89ddff
Blue: #82aaff
Purple: #c792ea
Pink: #f07178
```

### 5. Monokai Pro
```
Background: #2d2a2e
Background Alt: #221f22
Foreground: #fcfcfa
Red: #ff6188
Orange: #fc9867
Yellow: #ffd866
Green: #a9dc76
Cyan: #78dce8
Purple: #ab9df2
Dimmed1: #c1c0c0
Dimmed2: #939293
Dimmed3: #727072
Dimmed4: #5b595c
Dimmed5: #403e41
```

### 6. Night Owl
```
Background: #011627
Background Alt: #0b2942
Foreground: #d6deeb
Selection: #5f7e9790
Comment: #637777
Red: #ef5350
Green: #22da6e / #addb67
Yellow: #ecc48d / #ffeb95
Blue: #82aaff
Cyan: #7fdbca
Purple: #c792ea
Orange: #f78c6c
Accent: #7e57c2
```

### 7. Solarized Dark
```
Base colors:
  base03: #002b36 (primary bg)
  base02: #073642 (secondary bg)
  base01: #586e75 (comments)
  base00: #657b83
  base0: #839496 (primary text)
  base1: #93a1a1
Accents:
  yellow: #b58900
  orange: #cb4b16
  red: #dc322f
  magenta: #d33682
  violet: #6c71c4
  blue: #268bd2
  cyan: #2aa198
  green: #859900
```

### 8. Ayu Dark
```
Background: #0f1419
Background Alt: #0d1017
Foreground: #bfbdb6
Selection: #273747
Comment: #5c6773
Red: #f07178
Orange: #ff8f40
Yellow: #ffb454
Green: #aad94c
Cyan: #95e6cb
Blue: #59c2ff
Purple: #d2a6ff
Accent: #e6b450
```

### 9. GitHub Dark
```
Background: #0d1117
Background Alt: #161b22
Foreground: #c9d1d9
Selection: #3b5070
Comment: #8b949e
Red: #ff7b72
Orange: #ffa657
Yellow: #e3b341
Green: #7ee787
Cyan: #a5d6ff
Blue: #79c0ff
Purple: #d2a8ff
Pink: #ff9bce
Accent: #58a6ff
```

### 10. Rosé Pine
```
Base: #191724
Surface: #1f1d2e
Overlay: #26233a
Muted: #6e6a86
Subtle: #908caa
Text: #e0def4
Love (red): #eb6f92
Gold (yellow): #f6c177
Rose (pink): #ebbcba
Pine (teal): #31748f
Foam (cyan): #9ccfd8
Iris (purple): #c4a7e7
Highlight Low: #21202e
Highlight Med: #403d52
Highlight High: #524f67
```

---

## Semantic Variable Mapping Strategy

All themes will follow this consistent mapping pattern:

| Semantic Variable | Maps To |
|-------------------|---------|
| BACKGROUND-PRIMARY | Primary background |
| BACKGROUND-SECONDARY | Secondary/darker background |
| BACKGROUND-HIGHTLIGHT | Selection/highlight color |
| BACKGROUND-CURRENT-LINE | Line highlight |
| TEXT | Primary foreground |
| TITLE | Accent color (cyan/blue) |
| ACCENT | Primary accent |
| ACTION | Interactive elements (purple/magenta) |
| LIST | Secondary accent (green/teal) |
| HEADER | Headers color (purple/blue) |
| CARET | Cursor color |
| LINK | Link color (cyan/blue) |
| BOLD | Bold text (orange) |
| ITALICS | Italic text (purple/magenta) |
| HIGHLIGHT | Highlighted text (yellow) |
| STRIKETHROUGH | Dimmed/comment color |
| LINE_BREAK | Subtle divider |
| TAGS | Tag color (teal/cyan) |
| HEADER-1 through HEADER-6 | Distinct colors for each level |

---

## Implementation Steps

1. **Create 10 theme files** in `src/models/themes/`
   - Each follows the existing pattern (see CatppuccinMocha.ts for reference)
   - Use `isBuiltin: false` for consistency with existing themes
   - Use kebab-case for `id` field
   - Include official palette as `colors` with prefixed names
   - Map semantic variables in `assignments`

2. **Update DefaultThemes.ts**
   - Add imports for all 10 new themes
   - Add to named exports
   - Add to `DEFAULT_THEMES` array

3. **Build and test**
   - Run `npm run build`
   - Verify themes appear in Obsidian
   - Test theme switching

---

## Theme File Template

```typescript
import { Theme } from "../Theme";

/**
 * [Theme Name] - [description]
 * Official palette from [source URL]
 */
export const THEME_NAME_THEME: Theme = {
    id: "theme-id",
    name: "Theme Display Name",
    mode: "dark",
    isBuiltin: false,
    colors: {
        "prefix-bg": "#000000",
        "prefix-fg": "#ffffff",
        // ... all palette colors
    },
    assignments: {
        "BACKGROUND-PRIMARY": "var(--prefix-bg)",
        "BACKGROUND-SECONDARY": "var(--prefix-bg-alt)",
        "BACKGROUND-HIGHTLIGHT": "var(--prefix-selection)",
        "BACKGROUND-CURRENT-LINE": "var(--prefix-line)",
        "TEXT": "var(--prefix-fg)",
        "TITLE": "var(--prefix-cyan)",
        "ACCENT": "var(--prefix-blue)",
        "ACTION": "var(--prefix-purple)",
        "LIST": "var(--prefix-green)",
        "HEADER": "var(--prefix-purple)",
        "CARET": "var(--prefix-accent)",
        "LINK": "var(--prefix-cyan)",
        "BOLD": "var(--prefix-orange)",
        "ITALICS": "var(--prefix-purple)",
        "HIGHLIGHT": "var(--prefix-yellow)",
        "STRIKETHROUGH": "var(--prefix-comment)",
        "LINE_BREAK": "var(--prefix-dimmed)",
        "TAGS": "var(--prefix-teal)",
        "HEADER-1": "var(--prefix-purple)",
        "HEADER-2": "var(--prefix-blue)",
        "HEADER-3": "var(--prefix-cyan)",
        "HEADER-4": "var(--prefix-green)",
        "HEADER-5": "var(--prefix-orange)",
        "HEADER-6": "var(--prefix-yellow)",
    },
};
```
