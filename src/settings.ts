import { App, PluginSettingTab, Setting, Notice, Platform } from "obsidian";
import ThemeSwitcherPlugin from "../main";
import { Theme, SEMANTIC_VARIABLES, ColorAssignments } from "./models/Theme";
import { VIBRANCY_OPTIONS } from "./services/WindowService";

export class ThemeSwitcherSettingTab extends PluginSettingTab {
	plugin: ThemeSwitcherPlugin;
	private currentEditingTheme: Theme | null = null;
	private originalThemeSnapshot: Theme | null = null;
	private editingContainer: HTMLElement | null = null;

	constructor(app: App, plugin: ThemeSwitcherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h1", { text: "Theme Switcher Settings" });

		// Add spacing after plugin name
		containerEl.createDiv({ cls: "setting-section-spacer" }).style.cssText = "margin-bottom: 2rem;";

		// Window Settings Section (desktop only)
		if (Platform.isDesktop) {
			this.displayWindowSettingsSection(containerEl);

			// Add spacing after Window Settings
			containerEl.createDiv({ cls: "setting-section-spacer" }).style.cssText = "margin-bottom: 2rem;";
		}

		// Active Theme Section
		this.displayActiveThemeSection(containerEl);

		// Add spacing after Active Theme
		containerEl.createDiv({ cls: "setting-section-spacer" }).style.cssText = "margin-bottom: 2rem;";

		// Theme List Section
		this.displayThemeListSection(containerEl);

		// Theme Editor Section
		if (this.currentEditingTheme) {
			this.displayThemeEditorSection(containerEl);
		}
	}

	/**
	 * Display active theme selection
	 */
	private displayActiveThemeSection(containerEl: HTMLElement): void {
		containerEl.createEl("h2", { text: "Active Theme" });

		const themes = this.plugin.themeService.getAllThemes();
		// Sort themes alphabetically by name
		const sortedThemes = themes.sort((a, b) => a.name.localeCompare(b.name));

		const themeOptions: Record<string, string> = { "": "None" };

		sortedThemes.forEach(theme => {
			themeOptions[theme.id] = theme.name;
		});

		new Setting(containerEl)
			.setName("Current theme")
			.setDesc("Select the theme to apply")
			.addDropdown(dropdown =>
				dropdown
					.addOptions(themeOptions)
					.setValue(this.plugin.settings.activeThemeId || "")
					.onChange(async value => {
						await this.plugin.setActiveTheme(value || null);
						new Notice(`Theme changed to: ${value ? themeOptions[value] : "None"}`);
					})
			);
	}

	/**
	 * Display window settings (desktop only)
	 */
	private displayWindowSettingsSection(containerEl: HTMLElement): void {
		containerEl.createEl("h2", { text: "Window Settings" });

		// Always on top toggle
		new Setting(containerEl)
			.setName("Always on top")
			.setDesc("Keep Obsidian window above other applications")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.windowSettings.alwaysOnTop)
					.onChange(async value => {
						this.plugin.settings.windowSettings.alwaysOnTop = value;
						this.plugin.windowService.setAlwaysOnTop(value);
						await this.plugin.saveSettings();
					})
			);

		// Opacity slider
		new Setting(containerEl)
			.setName("Window opacity")
			.setDesc("Adjust window transparency (50-100%)")
			.addSlider(slider =>
				slider
					.setLimits(50, 100, 1)
					.setValue(this.plugin.settings.windowSettings.opacity * 100)
					.setDynamicTooltip()
					.onChange(async value => {
						const opacity = value / 100;
						this.plugin.settings.windowSettings.opacity = opacity;
						this.plugin.windowService.setOpacity(opacity);
						await this.plugin.saveSettings();
					})
			);

		// Vibrancy dropdown (macOS only)
		if (Platform.isMacOS) {
			const vibrancyOptions: Record<string, string> = {};
			VIBRANCY_OPTIONS.forEach(option => {
				vibrancyOptions[option] = option;
			});

			new Setting(containerEl)
				.setName("Window vibrancy")
				.setDesc("Apply macOS blur effect (may cause lag on some systems)")
				.addDropdown(dropdown =>
					dropdown
						.addOptions(vibrancyOptions)
						.setValue(this.plugin.settings.windowSettings.vibrancy)
						.onChange(async value => {
							this.plugin.settings.windowSettings.vibrancy = value as any;
							this.plugin.windowService.setVibrancy(value as any);
							await this.plugin.saveSettings();
						})
				);
		}
	}

	/**
	 * Display list of themes with actions
	 */
	private displayThemeListSection(containerEl: HTMLElement): void {
		containerEl.createEl("h2", { text: "Manage Themes" });

		// New Theme Button
		new Setting(containerEl)
			.setName("Create new theme")
			.setDesc("Create a new custom theme")
			.addButton(button =>
				button
					.setButtonText("New Theme")
					.setCta()
					.onClick(() => {
						const theme = this.plugin.themeService.createTheme("New Theme");
						this.currentEditingTheme = theme;
						this.plugin.saveSettings();
						this.display();
						new Notice("New theme created");
					})
			);

		// Import/Export Buttons
		new Setting(containerEl)
			.setName("Import/Export")
			.setDesc("Import or export themes as JSON files")
			.addButton(button =>
				button
					.setButtonText("Import")
					.onClick(() => this.importTheme())
			)
			.addButton(button =>
				button
					.setButtonText("Export All")
					.onClick(() => this.exportAllThemes())
			);

		// Theme List
		const themes = this.plugin.themeService.getAllThemes();

		if (themes.length === 0) {
			containerEl.createEl("p", { text: "No themes available. Create a new theme to get started!" });
			return;
		}

		// Sort themes alphabetically by name
		const sortedThemes = themes.sort((a, b) => a.name.localeCompare(b.name));

		sortedThemes.forEach(theme => {
			const setting = new Setting(containerEl)
				.setName(theme.name)
				.setDesc(theme.description || "");

			// Edit button
			setting.addButton(button =>
				button
					.setButtonText("Edit")
					.onClick(() => {
						// Save a snapshot for cancel functionality
						this.originalThemeSnapshot = JSON.parse(JSON.stringify(theme));
						this.currentEditingTheme = theme;
						this.display();
					})
			);

			// Duplicate button
			setting.addButton(button =>
				button
					.setButtonText("Duplicate")
					.onClick(() => {
						const duplicated = this.plugin.themeService.duplicateTheme(theme.id);
						if (duplicated) {
							this.plugin.saveSettings();
							this.display();
							new Notice(`Duplicated: ${theme.name}`);
						}
					})
			);

			// Export button
			setting.addButton(button =>
				button
					.setButtonText("Export")
					.onClick(() => this.exportTheme(theme.id))
			);

			// Delete button
			setting.addButton(button =>
				button
					.setButtonText("Delete")
					.setWarning()
					.onClick(async () => {
						if (confirm(`Are you sure you want to delete "${theme.name}"?`)) {
							this.plugin.themeService.deleteTheme(theme.id);

							// If this was the active theme, clear it
							if (this.plugin.settings.activeThemeId === theme.id) {
								await this.plugin.setActiveTheme(null);
							}

							await this.plugin.saveSettings();
							this.display();
							new Notice(`Deleted: ${theme.name}`);
						}
					})
			);
		});
	}

	/**
	 * Display theme editor
	 */
	private displayThemeEditorSection(containerEl: HTMLElement): void {
		if (!this.currentEditingTheme) return;

		const theme = this.currentEditingTheme;

		// Add spacing between theme list and editor
		containerEl.createEl("div", { cls: "theme-editor-spacer" }).style.cssText = "margin-top: 3rem;";

		containerEl.createEl("h2", { text: `Editing: ${theme.name}` });

		// Save and Cancel buttons
		new Setting(containerEl)
			.addButton(button =>
				button
					.setButtonText("Save Theme")
					.setCta()
					.onClick(async () => {
						// Sort color palette alphabetically before saving
						const sortedColors: Record<string, string> = {};
						Object.keys(theme.colors)
							.sort((a, b) => a.localeCompare(b))
							.forEach(key => {
								sortedColors[key] = theme.colors[key];
							});
						theme.colors = sortedColors;

						await this.plugin.saveSettings();
						this.originalThemeSnapshot = null;
						this.currentEditingTheme = null;
						this.display();
						new Notice(`Saved: ${theme.name}`);
					})
			)
			.addButton(button =>
				button
					.setButtonText("Cancel")
					.onClick(() => {
						// Restore original theme from snapshot
						if (this.originalThemeSnapshot && this.currentEditingTheme) {
							Object.assign(this.currentEditingTheme, this.originalThemeSnapshot);
						}
						this.originalThemeSnapshot = null;
						this.currentEditingTheme = null;
						this.display();
						new Notice("Changes discarded");
					})
			);

		// Theme name
		new Setting(containerEl)
			.setName("Theme name")
			.addText(text =>
				text
					.setValue(theme.name)
					.onChange(value => {
						theme.name = value;
						// Don't save here - only save when "Save Theme" button is clicked
					})
			);

		// Theme description
		new Setting(containerEl)
			.setName("Theme description")
			.addText(text =>
				text
					.setValue(theme.description || "")
					.setPlaceholder("Optional description")
					.onChange(value => {
						theme.description = value.trim() || undefined;
						// Don't save here - only save when "Save Theme" button is clicked
					})
			);

		// Add spacing before Color Palette Section
		containerEl.createDiv({ cls: "palette-section-spacer" }).style.cssText = "margin-top: 2rem;";

		// Color Palette Section
		this.displayColorPaletteEditor(containerEl, theme);

		// Color Assignments Section
		this.displayColorAssignmentsEditor(containerEl, theme);
	}

	/**
	 * Display color palette editor
	 */
	private displayColorPaletteEditor(containerEl: HTMLElement, theme: Theme): void {
		containerEl.createEl("h3", { text: "Color Palette" });
		containerEl.createEl("p", {
			text: "Define the color variables available for this theme"
		});

		const paletteContainer = containerEl.createDiv({ cls: "theme-color-palette" });

		// Display existing colors
		Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
			const setting = new Setting(paletteContainer);

			// Clear the default name element and rebuild layout
			setting.nameEl.empty();

			// Color name input (left-aligned)
			const nameInput = setting.nameEl.createEl("input", {
				type: "text",
				value: colorName,
				placeholder: "color-name"
			});
			nameInput.style.cssText = "width: 200px; text-align: left;";
			nameInput.addEventListener("change", async (e) => {
				const newName = (e.target as HTMLInputElement).value.trim();
				if (newName && newName !== colorName && !theme.colors[newName]) {
					// Rename the color
					theme.colors[newName] = theme.colors[colorName];
					delete theme.colors[colorName];

					// Update assignments that reference this color
					const oldRef = `var(--${colorName})`;
					const newRef = `var(--${newName})`;
					Object.keys(theme.assignments).forEach(key => {
						if (theme.assignments[key as keyof ColorAssignments] === oldRef) {
							theme.assignments[key as keyof ColorAssignments] = newRef;
						}
					});

					await this.plugin.saveSettings();
					this.display();
				}
			});

			// Container for color picker and swatch
			const colorContainer = setting.controlEl.createDiv();
			colorContainer.style.cssText = `
				display: inline-block;
				position: relative;
				margin-right: 8px;
				vertical-align: middle;
			`;

			// Color picker input (positioned over swatch)
			const colorPickerEl = colorContainer.createEl("input", {
				type: "color",
				value: colorValue
			});
			colorPickerEl.style.cssText = `
				position: absolute;
				top: 0;
				left: 0;
				width: 20px;
				height: 20px;
				border: none;
				padding: 0;
				margin-top: 10px;
				cursor: pointer;
				opacity: 0;
			`;

			// Color preview swatch (visible behind picker)
			const swatchEl = colorContainer.createDiv({ cls: "color-swatch" });
			swatchEl.style.cssText = `
				display: block;
				width: 20px;
				height: 20px;
				border-radius: 4px;
				background-color: ${colorValue};
				border: 1px solid var(--background-modifier-border);
				cursor: pointer;
			`;

			// Click swatch to open color picker
			swatchEl.addEventListener("click", () => {
				colorPickerEl.click();
			});

			// Color value input (hex) with live preview
			let hexInputEl: HTMLInputElement | null = null;
			setting.addText(text => {
				text
					.setValue(colorValue)
					.setPlaceholder("#000000");

				// Capture the input element
				hexInputEl = text.inputEl;

				// Add input event listener for real-time preview (as user types in hex field)
				hexInputEl.addEventListener("input", (e: Event) => {
					const value = (e.target as HTMLInputElement).value;
					// Update swatch and color picker preview immediately as user types
					if (this.isValidColor(value)) {
						swatchEl.style.backgroundColor = value;
						colorPickerEl.value = value;
					}
				});

				// Save on blur/change
				hexInputEl.addEventListener("change", async (e: Event) => {
					const value = (e.target as HTMLInputElement).value;
					if (this.isValidColor(value)) {
						theme.colors[colorName] = value;
						await this.plugin.saveSettings();

						// Re-apply theme if it's active
						if (this.plugin.settings.activeThemeId === theme.id) {
							this.plugin.styleService.applyTheme(theme);
						}
					}
				});
			});

			// Update hex input and theme when color picker changes
			colorPickerEl.addEventListener("input", (e: Event) => {
				const value = (e.target as HTMLInputElement).value;
				if (hexInputEl) {
					hexInputEl.value = value;
				}
				swatchEl.style.backgroundColor = value;
				theme.colors[colorName] = value;
			});

			// Save when color picker closes
			colorPickerEl.addEventListener("change", async (e: Event) => {
				const value = (e.target as HTMLInputElement).value;
				theme.colors[colorName] = value;
				await this.plugin.saveSettings();

				// Re-apply theme if it's active
				if (this.plugin.settings.activeThemeId === theme.id) {
					this.plugin.styleService.applyTheme(theme);
				}
			});

			// Delete button (right-aligned)
			setting.addButton(button =>
				button
					.setButtonText("Delete")
					.setWarning()
					.onClick(async () => {
						delete theme.colors[colorName];

						// Remove any assignments using this color
						const varRef = `var(--${colorName})`;
						Object.keys(theme.assignments).forEach(key => {
							if (theme.assignments[key as keyof ColorAssignments] === varRef) {
								delete theme.assignments[key as keyof ColorAssignments];
							}
						});

						await this.plugin.saveSettings();
						this.display();
					})
			);
		});

		// Add new color (matching layout with existing colors)
		const addColorSetting = new Setting(paletteContainer);
		addColorSetting.nameEl.empty();

		// Color name input (left-aligned, matching existing colors)
		const addNameInput = addColorSetting.nameEl.createEl("input", {
			type: "text",
			placeholder: "color-name"
		});
		addNameInput.style.cssText = "width: 200px; text-align: left;";

		// Container for color picker and swatch
		const addColorContainer = addColorSetting.controlEl.createDiv();
		addColorContainer.style.cssText = `
			display: inline-block;
			position: relative;
			margin-right: 8px;
			vertical-align: middle;
		`;

		// Color picker input (positioned over swatch)
		const addColorPickerEl = addColorContainer.createEl("input", {
			type: "color",
			value: "#000000"
		});
		addColorPickerEl.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 20px;
			height: 20px;
			border: none;
			padding: 0;
			margin-top: 10px;
			cursor: pointer;
			opacity: 0;
		`;

		// Color preview swatch (visible behind picker)
		const addSwatchEl = addColorContainer.createDiv({ cls: "color-swatch" });
		addSwatchEl.style.cssText = `
			display: block;
			width: 20px;
			height: 20px;
			border-radius: 4px;
			background-color: #000000;
			border: 1px solid var(--background-modifier-border);
			cursor: pointer;
		`;

		// Click swatch to open color picker
		addSwatchEl.addEventListener("click", () => {
			addColorPickerEl.click();
		});

		// Color value input with live preview
		let addHexInputEl: HTMLInputElement | null = null;
		addColorSetting.addText(text => {
			text.setPlaceholder("#000000");

			// Capture the input element
			addHexInputEl = text.inputEl;

			// Add input event listener for real-time preview (as user types in hex field)
			addHexInputEl.addEventListener("input", (e: Event) => {
				const value = (e.target as HTMLInputElement).value;
				// Update swatch and color picker preview immediately as user types
				if (this.isValidColor(value)) {
					addSwatchEl.style.backgroundColor = value;
					addColorPickerEl.value = value;
				}
			});
		});

		// Update hex input when color picker changes
		addColorPickerEl.addEventListener("input", (e: Event) => {
			const value = (e.target as HTMLInputElement).value;
			if (addHexInputEl) {
				addHexInputEl.value = value;
			}
			addSwatchEl.style.backgroundColor = value;
		});

		// Add button
		addColorSetting.addButton(button =>
			button
				.setButtonText("Add")
				.setCta()
				.onClick(async () => {
					const name = addNameInput.value.trim();
					const color = addHexInputEl?.value.trim() || '';

					if (name && color && this.isValidColor(color)) {
						theme.colors[name] = color;
						await this.plugin.saveSettings();
						this.display();
						new Notice(`Added color: ${name}`);
					} else {
						new Notice("Invalid color name or value");
					}
				})
		);
	}

	/**
	 * Display color assignments editor
	 */
	private displayColorAssignmentsEditor(containerEl: HTMLElement, theme: Theme): void {
		containerEl.createEl("h3", { text: "Color Assignments" });
		containerEl.createEl("p", {
			text: "Assign color palette variables to semantic UI elements"
		});

		const assignmentsContainer = containerEl.createDiv({ cls: "theme-color-assignments" });

		// Create dropdown options from color palette, sorted alphabetically
		const colorOptions: Record<string, string> = { "": "None" };
		const sortedColorNames = Object.keys(theme.colors).sort((a, b) => a.localeCompare(b));
		sortedColorNames.forEach(colorName => {
			colorOptions[`var(--${colorName})`] = colorName;
		});

		// Group semantic variables by category
		const categories = {
			"Background": ["BACKGROUND-DARK", "BACKGROUND-PRIMARY", "BACKGROUND-LIGHT", "BACKGROUND-HIGHTLIGHT", "BACKGROUND-CURRENT-LINE"],
			"UI Elements": ["TITLE", "ACCENT", "ACTION", "LIST", "HEADER", "CARET", "LINK"],
			"Text Formatting": ["BOLD", "ITALICS", "HIGHLIGHT", "STRIKETHROUGH", "ITEMS", "LINE_BREAK", "TAGS"],
			"Headers": ["HEADER-1", "HEADER-2", "HEADER-3", "HEADER-4", "HEADER-5", "HEADER-6"],
		};

		Object.entries(categories).forEach(([categoryName, variables]) => {
			assignmentsContainer.createEl("h4", { text: categoryName });

			variables.forEach(varName => {
				const currentValue = theme.assignments[varName as keyof ColorAssignments] || "";

				new Setting(assignmentsContainer)
					.setName(varName)
					.addDropdown(dropdown =>
						dropdown
							.addOptions(colorOptions)
							.setValue(currentValue)
							.onChange(async value => {
								if (value) {
									theme.assignments[varName as keyof ColorAssignments] = value;
								} else {
									delete theme.assignments[varName as keyof ColorAssignments];
								}

								await this.plugin.saveSettings();

								// Re-apply theme if it's active
								if (this.plugin.settings.activeThemeId === theme.id) {
									this.plugin.styleService.applyTheme(theme);
								}
							})
					);
			});
		});
	}

	/**
	 * Import theme from JSON file
	 */
	private importTheme(): void {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const themeData = JSON.parse(text);
				const theme = this.plugin.themeService.importTheme(themeData);

				if (theme) {
					await this.plugin.saveSettings();
					this.display();
					new Notice(`Imported: ${theme.name}`);
				}
			} catch (error) {
				new Notice("Failed to import theme: " + error.message);
			}
		};
		input.click();
	}

	/**
	 * Export a single theme
	 */
	private exportTheme(themeId: string): void {
		const json = this.plugin.themeService.exportTheme(themeId);
		if (!json) {
			new Notice("Theme not found");
			return;
		}

		const theme = this.plugin.themeService.getTheme(themeId);
		if (!theme) return;

		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${theme.id}.json`;
		a.click();
		URL.revokeObjectURL(url);

		new Notice(`Exported: ${theme.name}`);
	}

	/**
	 * Export all user themes
	 */
	private exportAllThemes(): void {
		const themes = this.plugin.themeService.getUserThemes();
		if (themes.length === 0) {
			new Notice("No user themes to export");
			return;
		}

		const json = JSON.stringify(themes, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "themes.json";
		a.click();
		URL.revokeObjectURL(url);

		new Notice(`Exported ${themes.length} theme(s)`);
	}

	/**
	 * Validate color format
	 */
	private isValidColor(color: string): boolean {
		// Basic validation for hex colors and rgba
		return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color) ||
			/^rgba?\([\d\s,%.]+\)$/.test(color);
	}
}
