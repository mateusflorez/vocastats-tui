import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";
import { createRequire } from "module";
import { themeManager, themed, getThemedColors } from "./themes.js";
import { navigation } from "./navigation.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

/**
 * Obtem COLORS do tema atual
 * Exportado para compatibilidade com codigo existente
 */
export function getCOLORS() {
  return getThemedColors();
}

// Alias para compatibilidade - sera atualizado dinamicamente
export const COLORS = new Proxy({}, {
  get(target, prop) {
    return getThemedColors()[prop];
  }
});

function criarLogo() {
  const colors = getThemedColors();
  const p = chalk.hex(colors.primary);
  const s = chalk.hex(colors.secondary);
  const a = chalk.hex(colors.accent);
  const m = chalk.hex(colors.muted);

  const linhas = [
    "  __     __              ____  _        _       ",
    "  \\ \\   / /__   ___ __ _/ ___|| |_ __ _| |_ ___ ",
    "   \\ \\ / / _ \\ / __/ _` \\___ \\| __/ _` | __/ __|",
    "    \\ V / (_) | (_| (_| |___) | || (_| | |_\\__ \\",
    "     \\_/ \\___/ \\___\\__,_|____/ \\__\\__,_|\\__|___/",
  ];

  const largura = 50;
  const borda = "═".repeat(largura);

  const theme = themeManager.getTheme();
  const themeName = theme.name;

  return `
  ${p("╔" + borda + "╗")}
  ${p("║")}${p(linhas[0].padEnd(largura))}${p("║")}
  ${p("║")}${p(linhas[1].padEnd(largura))}${p("║")}
  ${p("║")}${s(linhas[2].padEnd(largura))}${p("║")}
  ${p("║")}${s(linhas[3].padEnd(largura))}${p("║")}
  ${p("║")}${a(linhas[4].padEnd(largura))}${p("║")}
  ${p("╚" + borda + "╝")}

         ${p("♪")} ${m(themeName)} theme
`;
}

/**
 * Renderiza breadcrumbs de navegacao
 */
export function renderBreadcrumbs() {
  const colors = getThemedColors();
  const crumbs = navigation.getBreadcrumbs();

  if (crumbs.length <= 1) {
    return ""; // Nao mostra breadcrumbs na home
  }

  const separator = chalk.hex(colors.muted)(" > ");
  const formatted = crumbs.map((crumb, i) => {
    if (i === crumbs.length - 1) {
      // Ultimo item (atual) - destacado
      return chalk.hex(colors.primary)(crumb);
    }
    return chalk.hex(colors.muted)(crumb);
  }).join(separator);

  return `  ${formatted}\n`;
}

export function exibirHeader(showBreadcrumbs = true) {
  const colors = getThemedColors();
  console.clear();
  console.log(criarLogo());
  console.log(chalk.gray("─".repeat(55)));
  console.log(
    chalk.white.bold("  VocaStats ") +
    chalk.hex(colors.primary)(`v${version}`) +
    chalk.gray("  |  Real-time Vocaloid rankings")
  );
  console.log(chalk.gray("─".repeat(55)));

  if (showBreadcrumbs) {
    const breadcrumbs = renderBreadcrumbs();
    if (breadcrumbs) {
      console.log();
      console.log(breadcrumbs);
    } else {
      console.log();
    }
  } else {
    console.log();
  }
}

export function criarSpinner(texto) {
  const colors = getThemedColors();
  // Mapeia cor hex para nome de cor do ora
  const colorMap = {
    "#39C5BB": "cyan",
    "#FFCC00": "yellow",
    "#FFB7C5": "magenta",
    "#0066CC": "blue",
    "#CC0000": "red",
    "#88D498": "green",
    "#00FF00": "green",
    "#FF00FF": "magenta",
    "#FFFFFF": "white",
  };

  return ora({
    text: texto,
    color: colorMap[colors.primary] || "cyan",
    spinner: "dots",
  });
}

export function criarTabelaMusicas(musicas) {
  const colors = getThemedColors();

  const table = new Table({
    head: [
      chalk.hex(colors.accent).bold("#"),
      chalk.hex(colors.accent).bold("TITLE"),
      chalk.hex(colors.accent).bold("PRODUCER"),
      chalk.hex(colors.accent).bold("VOCALOID"),
      chalk.hex(colors.accent).bold("RATING"),
    ],
    style: {
      head: [],
      border: ["gray"],
    },
    colWidths: [4, 30, 20, 15, 8],
    wordWrap: true,
    chars: {
      "top": "─", "top-mid": "┬", "top-left": "┌", "top-right": "┐",
      "bottom": "─", "bottom-mid": "┴", "bottom-left": "└", "bottom-right": "┘",
      "left": "│", "left-mid": "├", "mid": "─", "mid-mid": "┼",
      "right": "│", "right-mid": "┤", "middle": "│",
    },
  });

  musicas.forEach((musica, index) => {
    table.push([
      chalk.hex(colors.muted)((index + 1).toString()),
      chalk.white(truncate(musica.titulo, 28)),
      chalk.hex(colors.secondary)(truncate(musica.produtor, 18)),
      chalk.hex(colors.primary)(truncate(musica.vocaloid, 13)),
      chalk.hex(colors.accent)(musica.rating.toString()),
    ]);
  });

  return table;
}

function truncate(str, len) {
  if (!str) return "-";
  return str.length > len ? str.substring(0, len - 1) + "…" : str;
}

// Re-exporta para uso externo
export { themeManager, themed, navigation };
