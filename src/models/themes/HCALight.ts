import { Theme } from "../Theme";

/**
 * HCA Light theme - based on hca-light.css
 */
export const HCA_LIGHT_THEME: Theme = {
	id: "hca-light",
	name: "HCA Light",
	isBuiltin: false,
	colors: {
        "hca-blue": "#03173E",
        "hca-orange": "#E05929",
        "hca-white": "#FFFFFF",
        "hca-denim": "#00558C",
        "hca-cerulean": "#0085CA",
        "hca-tangerine": "#ED8B00",
        "hca-goldenrod": "#FFC845",
        "hca-chrome-ultralight": "#D9D9D6",
        "hca-chrome-light": "#BBBCBC",
        "hca-chrome-dark": "#898B8E",
        "hca-chrome-slate": "#58595B",
        "faded-yellow": "rgb(245,249,182)",
        "hca-blue-faded": "rgba(3,26,62,0.5)",
        "hca-orange-faded": "rgba(224,89,41,0.5)",
        "white-color": "#FFFFFF",
        "light-gray": "rgb(240,240,240)",
        "very-light-gray": "#FAFAFA",
        "system-gray-5": "rgb(216,216,220)",
        "system-gray-6": "rgb(28,28,30)",
        "dark-gray": "rgb(40,40,40)",
	},
	assignments: {
		"BACKGROUND-PRIMARY": "var(--white-color)",
        "BACKGROUND-SECONDARY": "var(--very-light-gray)",
		"BACKGROUND-HIGHTLIGHT": "var(--hca-blue-faded)",
		"BACKGROUND-CURRENT-LINE": "var(--light-gray)",

        "TEXT": "var(--dark-gray)",
		"TITLE": "var(--hca-blue)",
		"ACCENT": "var(--hca-blue)",
		"ACTION": "var(--hca-orange)",
		"LIST": "var(--hca-blue)",
		"HEADER": "var(--hca-orange)",
		"CARET": "var(--hca-blue)",
		"LINK": "var(--hca-denim)",

		"BOLD": "var(--hca-blue)",
		"ITALICS": "var(--hca-orange)",
		"HIGHLIGHT": "var(--hca-goldenrod)",
		"STRIKETHROUGH": "var(--hca-denim)",
		"LINE_BREAK": "var(--hca-chrome-slate)",
		"TAGS": "var(--hca-denim)",

		"HEADER-1": "var(--hca-orange)",
		"HEADER-2": "var(--hca-blue)",
		"HEADER-3": "var(--hca-denim)",
		"HEADER-4": "var(--hca-tangerine)",
		"HEADER-5": "var(--hca-cerulean)",
		"HEADER-6": "var(--hca-goldenrod)",
	},
};
