import { App } from "obsidian";
import { Theme } from "../models/Theme";
import {
	getBaseStructuralStyles,
	getBaseDarkStyles,
	getBaseLightStyles,
	getWindowStyles
} from "./BaseStyles";

/**
 * Service for managing CSS injection and generation
 */
export class StyleService {
	private styleElement: HTMLStyleElement | null = null;
	private readonly styleId = "theme-switcher-styles";
	private app: App;
	private basePath: string;

	// Cache for loaded CSS files
	private cssCache: {
		base?: string;
		dark?: string;
		light?: string;
		window?: string;
	} = {};

	constructor(app: App, basePath: string) {
		this.app = app;
		this.basePath = basePath;
	}

	/**
	 * Load and cache base CSS files
	 */
	private async loadBaseStyles(): Promise<void> {
		if (!this.cssCache.base) {
			this.cssCache.base = await getBaseStructuralStyles();
		}
		if (!this.cssCache.dark) {
			this.cssCache.dark = await getBaseDarkStyles();
		}
		if (!this.cssCache.light) {
			this.cssCache.light = await getBaseLightStyles();
		}
	}

	/**
	 * Clear CSS cache to force reload from disk
	 */
	clearCache(): void {
		this.cssCache = {};
	}

	/**
	 * Apply a theme by injecting its CSS into the document
	 */
	async applyTheme(theme: Theme): Promise<void> {
		await this.loadBaseStyles();
		const css = await this.generateCSS(theme);
		this.injectCSS(css);
	}

	/**
	 * Apply only base styles without any color theme
	 */
	async applyBaseStyles(): Promise<void> {
		await this.loadBaseStyles();
		const css = await this.generateBaseCSS();
		this.injectCSS(css);
	}

	/**
	 * Detect if Obsidian is in dark mode
	 */
	private isDarkMode(): boolean {
		return document.body.classList.contains('theme-dark');
	}

	/**
	 * Remove all applied theme styles
	 */
	removeTheme(): void {
		if (this.styleElement) {
			this.styleElement.remove();
			this.styleElement = null;
		}
	}

	/**
	 * Generate base CSS only (no color theme)
	 */
	private async generateBaseCSS(): Promise<string> {
		const lines: string[] = [];
		const isDark = this.isDarkMode();

		// Layer 1: Base structural styles (always applied)
		lines.push("/* ========================================");
		lines.push("   Layer 1: Base Structural Styles");
		lines.push("   (from base.css - always applied)");
		lines.push("   ======================================== */");
		lines.push("");
		lines.push(this.cssCache.base || "");
		lines.push("");

		// Layer 2: Mode-specific base styles (dark or light)
		lines.push("/* ========================================");
		lines.push(`   Layer 2: ${isDark ? 'Dark' : 'Light'} Mode Base Styles`);
		lines.push(`   (from base-${isDark ? 'dark' : 'light'}.css)`);
		lines.push("   ======================================== */");
		lines.push("");
		lines.push(isDark ? (this.cssCache.dark || "") : (this.cssCache.light || ""));
		lines.push("");

		lines.push("/* No color theme selected */");
		lines.push("");

		// Window controls styles (separate from theme layers)
		lines.push("/* ========================================");
		lines.push("   Window Controls Styles");
		lines.push("   (from window.css)");
		lines.push("   ======================================== */");
		lines.push("");
		const windowStyles = await getWindowStyles();
		lines.push(windowStyles);

		return lines.join("\n");
	}

	/**
	 * Generate CSS from a theme
	 */
	private async generateCSS(theme: Theme): Promise<string> {
		const lines: string[] = [];
		const isDark = this.isDarkMode();

		// Layer 1: Base structural styles (always applied)
		lines.push("/* ========================================");
		lines.push("   Layer 1: Base Structural Styles");
		lines.push("   (from base.css - always applied)");
		lines.push("   ======================================== */");
		lines.push("");
		lines.push(this.cssCache.base || "");
		lines.push("");

		// Layer 2: Mode-specific base styles (dark or light)
		lines.push("/* ========================================");
		lines.push(`   Layer 2: ${isDark ? 'Dark' : 'Light'} Mode Base Styles`);
		lines.push(`   (from base-${isDark ? 'dark' : 'light'}.css)`);
		lines.push("   ======================================== */");
		lines.push("");
		lines.push(isDark ? (this.cssCache.dark || "") : (this.cssCache.light || ""));
		lines.push("");

		// Layer 3: Theme color palette
		lines.push("/* ========================================");
		lines.push("   Layer 3: Theme Color Palette");
		lines.push("   ======================================== */");
		lines.push(":root {");

		// Add color palette
		for (const [colorName, colorValue] of Object.entries(theme.colors)) {
			lines.push(`    --${colorName}: ${colorValue};`);
		}

		lines.push("}");
		lines.push("");

		// Layer 4: Semantic color assignments
		lines.push("/* ========================================");
		lines.push("   Layer 4: Semantic Color Assignments");
		lines.push("   ======================================== */");
		lines.push(":root {");

		// Add semantic assignments
		for (const [varName, varValue] of Object.entries(theme.assignments)) {
			if (varValue) {
				lines.push(`    --${varName}: ${varValue};`);
			}
		}

		lines.push("}");
		lines.push("");

		// Window controls styles (separate from theme layers)
		lines.push("/* ========================================");
		lines.push("   Window Controls Styles");
		lines.push("   (from window.css)");
		lines.push("   ======================================== */");
		lines.push("");
		const windowStyles = await getWindowStyles();
		lines.push(windowStyles);

		return lines.join("\n");
	}

	/**
	 * Inject CSS into the document head
	 */
	private injectCSS(css: string): void {
		// Remove existing style element if present
		this.removeTheme();

		// Create new style element
		this.styleElement = document.createElement("style");
		this.styleElement.id = this.styleId;
		this.styleElement.textContent = css;

		// Append to document head
		document.head.appendChild(this.styleElement);
	}

	/**
	 * Get the currently applied CSS
	 */
	getCurrentCSS(): string | null {
		return this.styleElement?.textContent || null;
	}

	/**
	 * Check if a theme is currently applied
	 */
	isThemeApplied(): boolean {
		return this.styleElement !== null;
	}
}
