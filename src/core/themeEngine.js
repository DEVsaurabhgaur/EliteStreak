// Theme palette configuration

// Theme palette configuration


// Theme transition smooth fade


// Dispatch custom event on theme change


// Theme Cyber Violet


// Theme Synthwave 84


// Theme Matrix Hack


// Theme Neon Sunset


// Theme Electric Ice


export function resetToDefaultTheme() { applyTheme('cyber-green'); }

export function getThemeNames() { return THEMES.map(t => t.name); }

export function isDarkTheme(themeId) { return true; }

export function exportThemeConfig(theme) { return JSON.stringify(theme); }
