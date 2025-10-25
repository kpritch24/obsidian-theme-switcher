import { Plugin } from "obsidian";
import { ThemeService } from "./src/services/ThemeService";
import { StyleService } from "./src/services/StyleService";
import { WindowService, VibrancyType } from "./src/services/WindowService";
import { ThemeSwitcherSettingTab } from "./src/settings";
import { Theme } from "./src/models/Theme";

interface WindowSettings {
	alwaysOnTop: boolean;
	opacity: number;
	vibrancy: VibrancyType;
}

interface ThemeSwitcherSettings {
	themes: Theme[];
	activeThemeId: string | null;
	windowSettings: WindowSettings;
}

const DEFAULT_SETTINGS: ThemeSwitcherSettings = {
	themes: [],
	activeThemeId: null,
	windowSettings: {
		alwaysOnTop: false,
		opacity: 1.0,
		vibrancy: "default",
	},
};

export default class ThemeSwitcherPlugin extends Plugin {
	settings: ThemeSwitcherSettings;
	themeService: ThemeService;
	styleService: StyleService;
	windowService: WindowService;
	private themeChangeObserver: MutationObserver | null = null;
	private statusBarItem: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		// Initialize services
		this.themeService = new ThemeService(this.settings.themes);
		this.styleService = new StyleService(this.app, this.manifest.dir || "");
		this.windowService = new WindowService();

		// Always apply base styles, with or without a color theme
		await this.applyCurrentTheme();

		// Apply window settings (desktop only)
		if (this.windowService.isDesktop()) {
			this.applyWindowSettings();
			this.setupStatusBar();
			this.registerWindowCommands();
		}

		// Watch for Obsidian theme mode changes (light/dark)
		this.setupThemeModeObserver();

		// Add settings tab
		this.addSettingTab(new ThemeSwitcherSettingTab(this.app, this));

		// Add theme commands
		this.addCommand({
			id: "cycle-theme-next",
			name: "Next theme",
			callback: () => this.cycleTheme(1),
		});

		this.addCommand({
			id: "cycle-theme-previous",
			name: "Previous theme",
			callback: () => this.cycleTheme(-1),
		});

		this.addCommand({
			id: "toggle-theme",
			name: "Toggle theme on/off",
			callback: () => this.toggleTheme(),
		});

		this.addCommand({
			id: "reload-css",
			name: "Reload CSS from disk",
			hotkeys: [{
				modifiers: ["Mod"],
				key: "r",
			}],
			callback: async () => {
				this.styleService.clearCache();
				await this.applyCurrentTheme();
			},
		});
	}

	/**
	 * Apply the current theme (or just base styles if no theme selected)
	 */
	private async applyCurrentTheme() {
		if (this.settings.activeThemeId) {
			const activeTheme = this.themeService.getTheme(this.settings.activeThemeId);
			if (activeTheme) {
				await this.styleService.applyTheme(activeTheme);
			} else {
				// Theme not found, apply base styles only
				await this.styleService.applyBaseStyles();
			}
		} else {
			// No theme selected, apply base styles only
			await this.styleService.applyBaseStyles();
		}
	}

	/**
	 * Setup observer to watch for light/dark mode changes
	 */
	private setupThemeModeObserver() {
		this.themeChangeObserver = new MutationObserver(() => {
			// When Obsidian switches between light and dark mode, reapply current theme
			this.applyCurrentTheme();
		});

		// Observe class changes on body element (Obsidian adds/removes theme-dark class)
		this.themeChangeObserver.observe(document.body, {
			attributes: true,
			attributeFilter: ['class']
		});
	}

	onunload() {
		// Remove applied styles when plugin is disabled
		this.styleService.removeTheme();

		// Reset window settings to defaults (desktop only)
		if (this.windowService.isDesktop()) {
			this.windowService.resetToDefaults();
		}

		// Disconnect theme mode observer
		if (this.themeChangeObserver) {
			this.themeChangeObserver.disconnect();
			this.themeChangeObserver = null;
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// Update themes from service before saving
		this.settings.themes = this.themeService.toJSON();
		await this.saveData(this.settings);
	}

	/**
	 * Set the active theme
	 */
	async setActiveTheme(themeId: string | null) {
		this.settings.activeThemeId = themeId;
		await this.applyCurrentTheme();
		await this.saveSettings();
	}

	/**
	 * Cycle through themes
	 */
	cycleTheme(direction: 1 | -1) {
		const themes = this.themeService.getAllThemes();
		if (themes.length === 0) {
			return;
		}

		let currentIndex = -1;
		if (this.settings.activeThemeId) {
			currentIndex = themes.findIndex(t => t.id === this.settings.activeThemeId);
		}

		// Calculate next index
		let nextIndex = currentIndex + direction;
		if (nextIndex >= themes.length) {
			nextIndex = 0;
		} else if (nextIndex < 0) {
			nextIndex = themes.length - 1;
		}

		const nextTheme = themes[nextIndex];
		this.setActiveTheme(nextTheme.id);
	}

	/**
	 * Toggle theme on/off
	 */
	toggleTheme() {
		if (this.styleService.isThemeApplied()) {
			this.styleService.removeTheme();
		} else if (this.settings.activeThemeId) {
			const theme = this.themeService.getTheme(this.settings.activeThemeId);
			if (theme) {
				this.styleService.applyTheme(theme);
			}
		}
	}

	/**
	 * Get the currently active theme
	 */
	getActiveTheme(): Theme | undefined {
		if (this.settings.activeThemeId) {
			return this.themeService.getTheme(this.settings.activeThemeId);
		}
		return undefined;
	}

	/**
	 * Apply window settings from saved preferences
	 */
	applyWindowSettings() {
		const { alwaysOnTop, opacity, vibrancy } = this.settings.windowSettings;
		this.windowService.setAlwaysOnTop(alwaysOnTop);
		this.windowService.setOpacity(opacity);
		this.windowService.setVibrancy(vibrancy);
	}

	/**
	 * Setup status bar menu with window controls (desktop only)
	 */
	setupStatusBar() {
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.addClass("theme-statusbar-button");

		// Add window icon
		const icon = this.statusBarItem.createEl("span", {
			cls: "theme-statusbar-icon",
			text: "🪟",
		});

		// Create popup menu
		const menu = this.statusBarItem.createDiv({ cls: "theme-statusbar-menu" });
		menu.style.display = "none";

		// Always on top toggle
		const alwaysOnTopContainer = menu.createDiv({ cls: "theme-menu-item" });
		alwaysOnTopContainer.createSpan({ text: "Always on top" });
		const alwaysOnTopToggle = alwaysOnTopContainer.createEl("input", {
			type: "checkbox",
		});
		alwaysOnTopToggle.checked = this.settings.windowSettings.alwaysOnTop;
		alwaysOnTopToggle.addEventListener("change", async () => {
			this.settings.windowSettings.alwaysOnTop = alwaysOnTopToggle.checked;
			this.windowService.setAlwaysOnTop(alwaysOnTopToggle.checked);
			await this.saveSettings();
		});

		// Opacity slider with tooltip
		const opacityContainer = menu.createDiv({ cls: "theme-menu-item theme-menu-slider" });
		opacityContainer.createSpan({ text: "Opacity" });
		const opacitySlider = opacityContainer.createEl("input", {
			type: "range",
			cls: "slider",
			attr: {
				min: "50",
				max: "100",
				value: String(this.settings.windowSettings.opacity * 100),
			},
		});

		// Create tooltip element
		const opacityTooltip = opacityContainer.createDiv({ cls: "slider-tooltip" });
		opacityTooltip.setText(`${Math.round(this.settings.windowSettings.opacity * 100)}`);
		opacityTooltip.style.display = "none";

		// Show tooltip on hover and update on drag
		opacitySlider.addEventListener("mouseenter", () => {
			opacityTooltip.style.display = "block";
		});
		opacitySlider.addEventListener("mouseleave", () => {
			opacityTooltip.style.display = "none";
		});
		opacitySlider.addEventListener("input", async () => {
			const opacity = parseInt(opacitySlider.value) / 100;
			opacityTooltip.setText(opacitySlider.value);
			// Update tooltip position
			const percent = (parseInt(opacitySlider.value) - 50) / 50;
			opacityTooltip.style.left = `calc(${percent * 100}% - 12px)`;
			this.settings.windowSettings.opacity = opacity;
			this.windowService.setOpacity(opacity);
			await this.saveSettings();
		});
		// Initialize tooltip position
		const initialPercent = (this.settings.windowSettings.opacity * 100 - 50) / 50;
		opacityTooltip.style.left = `calc(${initialPercent * 100}% - 12px)`;

		// Vibrancy dropdown (macOS only)
		if (this.windowService.isMacOS()) {
			const vibrancyContainer = menu.createDiv({ cls: "theme-menu-item theme-menu-dropdown" });
			vibrancyContainer.createSpan({ text: "Vibrancy" });
			const vibrancyDropdown = vibrancyContainer.createEl("select");

			// Import vibrancy options
			const { VIBRANCY_OPTIONS } = require("./src/services/WindowService");
			VIBRANCY_OPTIONS.forEach((option: string) => {
				vibrancyDropdown.createEl("option", {
					value: option,
					text: option
				});
			});
			vibrancyDropdown.value = this.settings.windowSettings.vibrancy;

			vibrancyDropdown.addEventListener("change", async () => {
				this.settings.windowSettings.vibrancy = vibrancyDropdown.value as any;
				this.windowService.setVibrancy(vibrancyDropdown.value as any);
				await this.saveSettings();
			});
		}

		// Active theme dropdown
		const themeContainer = menu.createDiv({ cls: "theme-menu-item theme-menu-dropdown" });
		themeContainer.createSpan({ text: "Theme" });
		const themeDropdown = themeContainer.createEl("select");

		// Populate theme options
		const updateThemeDropdown = () => {
			themeDropdown.empty();
			const noneOption = themeDropdown.createEl("option", { value: "", text: "None" });
			const themes = this.themeService.getAllThemes();
			const sortedThemes = themes.sort((a, b) => a.name.localeCompare(b.name));
			sortedThemes.forEach(theme => {
				themeDropdown.createEl("option", {
					value: theme.id,
					text: theme.name
				});
			});
			themeDropdown.value = this.settings.activeThemeId || "";
		};
		updateThemeDropdown();

		themeDropdown.addEventListener("change", async () => {
			await this.setActiveTheme(themeDropdown.value || null);
		});

		// Toggle menu visibility on click
		icon.addEventListener("click", (e) => {
			e.stopPropagation();
			const isVisible = menu.style.display !== "none";
			menu.style.display = isVisible ? "none" : "block";
			if (!isVisible) {
				// Refresh theme dropdown when opening menu
				updateThemeDropdown();
			}
		});

		// Prevent menu from closing when clicking inside it
		menu.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		// Close menu when clicking outside
		document.addEventListener("click", () => {
			menu.style.display = "none";
		});
	}

	/**
	 * Register keyboard commands for window features (desktop only)
	 */
	registerWindowCommands() {
		// Toggle always on top
		this.addCommand({
			id: "toggle-always-on-top",
			name: "Toggle always on top",
			callback: async () => {
				this.settings.windowSettings.alwaysOnTop = !this.settings.windowSettings.alwaysOnTop;
				this.windowService.setAlwaysOnTop(this.settings.windowSettings.alwaysOnTop);
				await this.saveSettings();
			},
		});

		// Increase opacity
		this.addCommand({
			id: "increase-opacity",
			name: "Increase window opacity",
			callback: async () => {
				const newOpacity = this.windowService.increaseOpacity(
					this.settings.windowSettings.opacity
				);
				this.settings.windowSettings.opacity = newOpacity;
				await this.saveSettings();
			},
		});

		// Decrease opacity
		this.addCommand({
			id: "decrease-opacity",
			name: "Decrease window opacity",
			callback: async () => {
				const newOpacity = this.windowService.decreaseOpacity(
					this.settings.windowSettings.opacity
				);
				this.settings.windowSettings.opacity = newOpacity;
				await this.saveSettings();
			},
		});
	}
}
