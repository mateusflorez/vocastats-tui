import chalk from "chalk";
import Table from "cli-table3";
import ora from "ora";

// Paleta de cores Miku
const COLORS = {
  primary: "#39C5BB",    // Miku teal
  secondary: "#E12885",  // Magenta accent
  accent: "#FFE495",     // Amarelo
  text: "#FFFFFF",
  muted: "#666666",
};

function criarLogo() {
  const p = chalk.hex(COLORS.primary);
  const s = chalk.hex(COLORS.secondary);
  const a = chalk.hex(COLORS.accent);
  const g = chalk.hex("#88D498");

  const linhas = [
    "  __     __              ____  _        _       ",
    "  \\ \\   / /__   ___ __ _/ ___|| |_ __ _| |_ ___ ",
    "   \\ \\ / / _ \\ / __/ _` \\___ \\| __/ _` | __/ __|",
    "    \\ V / (_) | (_| (_| |___) | || (_| | |_\\__ \\",
    "     \\_/ \\___/ \\___\\__,_|____/ \\__\\__,_|\\__|___/",
  ];

  const largura = 50;
  const borda = "═".repeat(largura);

  return `
  ${p("╔" + borda + "╗")}
  ${p("║")}${p(linhas[0].padEnd(largura))}${p("║")}
  ${p("║")}${p(linhas[1].padEnd(largura))}${p("║")}
  ${p("║")}${s(linhas[2].padEnd(largura))}${p("║")}
  ${p("║")}${s(linhas[3].padEnd(largura))}${p("║")}
  ${p("║")}${a(linhas[4].padEnd(largura))}${p("║")}
  ${p("╚" + borda + "╝")}

         ${p("♪")} ${chalk.gray("Miku")}    ${s("♪")} ${chalk.gray("Rin/Len")}    ${a("♪")} ${chalk.gray("Luka")}    ${g("♪")} ${chalk.gray("GUMI")}
`;
}

export function exibirHeader() {
  console.clear();
  console.log(criarLogo());
  console.log(chalk.gray("─".repeat(55)));
  console.log(
    chalk.white.bold("  VocaStats ") +
    chalk.hex(COLORS.primary)("v1.0.0") +
    chalk.gray("  |  Rankings de Vocaloid em tempo real")
  );
  console.log(chalk.gray("─".repeat(55)));
  console.log();
}

export function criarSpinner(texto) {
  return ora({
    text: texto,
    color: "cyan",
    spinner: "dots",
  });
}

export function criarTabelaMusicas(musicas) {
  const table = new Table({
    head: [
      chalk.hex(COLORS.accent).bold("#"),
      chalk.hex(COLORS.accent).bold("TITULO"),
      chalk.hex(COLORS.accent).bold("PRODUTOR"),
      chalk.hex(COLORS.accent).bold("VOCALOID"),
      chalk.hex(COLORS.accent).bold("RATING"),
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
      chalk.hex(COLORS.muted)((index + 1).toString()),
      chalk.white(truncate(musica.titulo, 28)),
      chalk.hex(COLORS.secondary)(truncate(musica.produtor, 18)),
      chalk.hex(COLORS.primary)(truncate(musica.vocaloid, 13)),
      chalk.hex(COLORS.accent)(musica.rating.toString()),
    ]);
  });

  return table;
}

function truncate(str, len) {
  if (!str) return "-";
  return str.length > len ? str.substring(0, len - 1) + "…" : str;
}

export { COLORS };
