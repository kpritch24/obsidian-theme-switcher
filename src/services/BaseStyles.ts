import { App } from "obsidian";

/**
 * Load CSS file from disk
 */
async function loadCSSFile(app: App, basePath: string, filename: string): Promise<string> {
	try {
		const path = `${basePath}/styles/${filename}`;
		const content = await app.vault.adapter.read(path);
		return content;
	} catch (error) {
		console.error(`Failed to load CSS file: ${filename}`, error);
		return "";
	}
}

/**
 * Get base structural styles (always applied)
 */
export async function getBaseStructuralStyles(app: App, basePath: string): Promise<string> {
	return await loadCSSFile(app, basePath, "base.css");
}

/**
 * Get dark mode styles
 */
export async function getBaseDarkStyles(app: App, basePath: string): Promise<string> {
	return await loadCSSFile(app, basePath, "base-dark.css");
}

/**
 * Get light mode styles
 */
export async function getBaseLightStyles(app: App, basePath: string): Promise<string> {
	return await loadCSSFile(app, basePath, "base-light.css");
}

/**
 * Get window controls styles
 */
export async function getWindowStyles(app: App, basePath: string): Promise<string> {
	return await loadCSSFile(app, basePath, "window.css");
}
