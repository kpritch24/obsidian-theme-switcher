import { Theme } from "./Theme";
import { HCA_LIGHT_THEME } from "./themes/HCALight";
import { KIRO_DARK_THEME } from "./themes/KiroDark";
import { DRACULA_DARK_THEME } from "./themes/DraculaDark";
import { TROPICAL_DARK_THEME } from "./themes/TropicalDark";

export { 
    HCA_LIGHT_THEME,
    KIRO_DARK_THEME, 
    DRACULA_DARK_THEME, 
    TROPICAL_DARK_THEME 
};

export const DEFAULT_THEMES: Theme[] = [
    HCA_LIGHT_THEME,
    KIRO_DARK_THEME, 
    DRACULA_DARK_THEME, 
    TROPICAL_DARK_THEME
];
