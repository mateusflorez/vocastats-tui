/**
 * Sistema de temas customizaveis
 * Cada tema define uma paleta de cores para a interface
 */

import chalk from "chalk";
import { getConfigValue, setConfig } from "./config.js";

/**
 * Temas predefinidos inspirados em Vocaloids
 */
export const themes = {
  miku: {
    name: "Miku",
    description: "Classic teal Hatsune Miku theme",
    primary: "#39C5BB",
    secondary: "#E12885",
    accent: "#FFE495",
    text: "#FFFFFF",
    muted: "#666666",
    success: "#00FF00",
    error: "#FF6B6B",
    warning: "#FFAA00",
  },

  rin: {
    name: "Rin/Len",
    description: "Warm yellow Kagamine theme",
    primary: "#FFCC00",
    secondary: "#FF6600",
    accent: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#888888",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FF6600",
  },

  luka: {
    name: "Luka",
    description: "Soft pink Megurine Luka theme",
    primary: "#FFB7C5",
    secondary: "#FF69B4",
    accent: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#AA8899",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FFAA00",
  },

  kaito: {
    name: "KAITO",
    description: "Cool blue KAITO theme",
    primary: "#0066CC",
    secondary: "#003399",
    accent: "#FFCC00",
    text: "#FFFFFF",
    muted: "#6699CC",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FFAA00",
  },

  meiko: {
    name: "MEIKO",
    description: "Bold red MEIKO theme",
    primary: "#CC0000",
    secondary: "#990000",
    accent: "#FFCC00",
    text: "#FFFFFF",
    muted: "#996666",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FFAA00",
  },

  gumi: {
    name: "GUMI",
    description: "Fresh green GUMI theme",
    primary: "#88D498",
    secondary: "#FF6600",
    accent: "#FFCC00",
    text: "#FFFFFF",
    muted: "#669966",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FF6600",
  },

  teto: {
    name: "Kasane Teto",
    description: "Red twin-drill Kasane Teto theme",
    primary: "#DC143C",
    secondary: "#FF6B81",
    accent: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#996666",
    success: "#88FF88",
    error: "#FF6B6B",
    warning: "#FFAA00",
  },

  dark: {
    name: "Dark",
    description: "Minimal dark terminal theme",
    primary: "#00FF00",
    secondary: "#00CC00",
    accent: "#FFFFFF",
    text: "#CCCCCC",
    muted: "#555555",
    success: "#00FF00",
    error: "#FF0000",
    warning: "#FFAA00",
  },

  cyberpunk: {
    name: "Cyberpunk",
    description: "Neon cyberpunk aesthetic",
    primary: "#FF00FF",
    secondary: "#00FFFF",
    accent: "#FFFF00",
    text: "#FFFFFF",
    muted: "#888888",
    success: "#00FF00",
    error: "#FF0000",
    warning: "#FF6600",
  },

  monochrome: {
    name: "Monochrome",
    description: "Clean black and white theme",
    primary: "#FFFFFF",
    secondary: "#CCCCCC",
    accent: "#AAAAAA",
    text: "#FFFFFF",
    muted: "#666666",
    success: "#FFFFFF",
    error: "#FFFFFF",
    warning: "#FFFFFF",
  },
};

/**
 * Gerenciador de temas
 */
class ThemeManager {
  constructor() {
    this._current = null;
  }

  /**
   * Obtem o nome do tema atual (lazy load do config)
   */
  get currentName() {
    if (!this._current) {
      this._current = getConfigValue("theme") || "miku";
    }
    return this._current;
  }

  /**
   * Define o tema atual
   */
  setTheme(themeName) {
    if (!themes[themeName]) {
      return false;
    }
    this._current = themeName;
    setConfig("theme", themeName);
    return true;
  }

  /**
   * Obtem o tema atual completo
   */
  getTheme() {
    return themes[this.currentName] || themes.miku;
  }

  /**
   * Obtem uma cor especifica do tema atual
   */
  getColor(colorName) {
    const theme = this.getTheme();
    return theme[colorName] || "#FFFFFF";
  }

  /**
   * Lista todos os temas disponiveis
   */
  listThemes() {
    return Object.entries(themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      description: theme.description,
      isCurrent: key === this.currentName,
    }));
  }

  /**
   * Cria um objeto COLORS compativel com o formato antigo
   */
  getColors() {
    const theme = this.getTheme();
    return {
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      text: theme.text,
      muted: theme.muted,
      success: theme.success,
      error: theme.error,
      warning: theme.warning,
    };
  }
}

// Instancia singleton
export const themeManager = new ThemeManager();

/**
 * Helper para criar texto colorido com cor do tema
 * @param {string} colorName - Nome da cor (primary, secondary, etc)
 * @returns {Function} Funcao chalk configurada
 */
export function themed(colorName) {
  return chalk.hex(themeManager.getColor(colorName));
}

/**
 * Obtem COLORS do tema atual (compatibilidade)
 */
export function getThemedColors() {
  return themeManager.getColors();
}
