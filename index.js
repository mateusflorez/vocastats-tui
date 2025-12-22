#!/usr/bin/env node

import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
import { exec } from "child_process";
import { platform } from "os";
import { exibirHeader, criarSpinner, criarTabelaMusicas, COLORS } from "./src/ui.js";
import {
  getTopRated,
  getSongsByArtist,
  getSongsByTag,
  searchSongs,
  searchArtists,
  getRandomSongs,
  extractPvUrl,
  formatArtists,
  VOCALOIDS,
  GENRES
} from "./src/api.js";
import { searchOnSpotify, isSpotifyInstalled } from "./src/spotify.js";

/**
 * Abre URL no navegador padrao do sistema
 */
function openUrl(url) {
  const plat = platform();
  let command;

  if (plat === "darwin") {
    command = `open "${url}"`;
  } else if (plat === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(chalk.red(`  Erro ao abrir URL: ${error.message}`));
    }
  });
}

const MENU_PRINCIPAL = [
  {
    name: chalk.hex(COLORS.primary)("  Top da semana"),
    value: "top-semana",
    description: "Musicas mais populares dos ultimos 7 dias",
  },
  {
    name: chalk.hex(COLORS.secondary)("  Por Vocaloid"),
    value: "por-vocaloid",
    description: "Filtrar por Hatsune Miku, Kagamine Rin, etc.",
  },
  {
    name: chalk.hex("#88D498")("  Por Genero"),
    value: "por-genero",
    description: "Filtrar por Rock, Pop, EDM, etc.",
  },
  {
    name: chalk.hex(COLORS.accent)("  Buscar musica"),
    value: "buscar-musica",
    description: "Pesquisar por nome da musica",
  },
  {
    name: chalk.hex("#9B59B6")("  Buscar produtor"),
    value: "buscar-produtor",
    description: "Pesquisar por nome do produtor",
  },
  {
    name: chalk.hex("#F39C12")("  Modo Descoberta"),
    value: "descoberta",
    description: "Musicas aleatorias bem avaliadas",
  },
  {
    name: chalk.red("  Sair"),
    value: "sair",
    description: "Encerra o programa",
  },
];

function formatarMusica(song) {
  const vocaloids = song.artists
    ?.filter((a) => a.categories?.includes("Vocalist"))
    .map((a) => a.artist?.name || a.name)
    .slice(0, 2)
    .join(", ") || "Vocaloid";

  return {
    titulo: song.name || song.defaultName,
    produtor: formatArtists(song),
    vocaloid: vocaloids,
    rating: song.ratingScore || 0,
    url: extractPvUrl(song),
    _song: song, // Referencia ao objeto original
  };
}

/**
 * Menu para selecionar e abrir link de uma musica
 */
async function menuAbrirLink(musicas) {
  const spotifyInstalado = isSpotifyInstalled();
  const spotifyLabel = spotifyInstalado
    ? "  Buscar no Spotify (app)"
    : "  Buscar no Spotify (web)";

  const opcoes = [
    {
      name: chalk.hex("#1DB954")(spotifyLabel),
      value: { tipo: "spotify" },
      description: spotifyInstalado ? "Abre direto no app" : "Abre no navegador",
    },
  ];

  musicas.forEach((m, i) => {
    opcoes.push({
      name: chalk.hex(COLORS.primary)(`  ${i + 1}. ${m.titulo}`),
      value: { tipo: "musica", musica: m },
      description: m.produtor,
    });
  });

  opcoes.push({
    name: chalk.gray("  Voltar"),
    value: null,
  });

  const escolha = await select({
    message: chalk.hex(COLORS.accent)("Abrir no navegador:"),
    choices: opcoes,
  });

  if (!escolha) return;

  if (escolha.tipo === "spotify") {
    const opcoesMusica = musicas.map((m, i) => ({
      name: chalk.hex("#1DB954")(`  ${i + 1}. ${m.titulo}`),
      value: m,
      description: m.produtor,
    }));

    opcoesMusica.push({
      name: chalk.gray("  Cancelar"),
      value: null,
    });

    const musicaSelecionada = await select({
      message: chalk.hex("#1DB954")("Qual musica buscar no Spotify?"),
      choices: opcoesMusica,
    });

    if (musicaSelecionada) {
      const query = `${musicaSelecionada.titulo} ${musicaSelecionada.produtor}`;
      const result = searchOnSpotify(query);
      if (result.type === "app") {
        console.log(chalk.hex("#1DB954")(`\n  Abrindo no Spotify...\n`));
      } else {
        console.log(chalk.hex("#1DB954")(`\n  Abrindo no navegador...\n`));
      }
    }
  } else if (escolha.tipo === "musica") {
    const musica = escolha.musica;
    if (musica.url) {
      console.log(chalk.hex(COLORS.primary)(`\n  Abrindo ${musica.url}...\n`));
      openUrl(musica.url);
    } else {
      console.log(chalk.yellow("\n  Esta musica nao tem link disponivel.\n"));
    }
  }
}

async function exibirTopSemana() {
  const spinner = criarSpinner("Buscando top da semana...");
  spinner.start();

  try {
    const songs = await getTopRated({ hours: 168, limit: 20 });
    spinner.stop();

    const musicas = songs.map(formatarMusica);

    console.log(chalk.hex(COLORS.primary)(`\n  Top ${musicas.length} da semana:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function menuPorVocaloid() {
  const opcoes = Object.entries(VOCALOIDS).map(([nome, id]) => ({
    name: chalk.hex(COLORS.primary)(`  ${nome}`),
    value: id,
    description: `Ver musicas de ${nome}`,
  }));

  opcoes.push({
    name: chalk.gray("  Voltar"),
    value: null,
  });

  const vocaloidId = await select({
    message: chalk.hex(COLORS.primary)("Selecione o Vocaloid:"),
    choices: opcoes,
  });

  if (!vocaloidId) return;

  const spinner = criarSpinner("Buscando musicas...");
  spinner.start();

  try {
    const data = await getSongsByArtist(vocaloidId, { limit: 20 });
    spinner.stop();

    const musicas = data.items.map(formatarMusica);

    console.log(chalk.hex(COLORS.primary)(`\n  Encontradas ${musicas.length} musicas:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function menuPorGenero() {
  const opcoes = Object.entries(GENRES).map(([nome, id]) => ({
    name: chalk.hex("#88D498")(`  ${nome}`),
    value: id,
    description: `Ver musicas de ${nome}`,
  }));

  opcoes.push({
    name: chalk.gray("  Voltar"),
    value: null,
  });

  const generoId = await select({
    message: chalk.hex("#88D498")("Selecione o Genero:"),
    choices: opcoes,
  });

  if (!generoId) return;

  const spinner = criarSpinner("Buscando musicas...");
  spinner.start();

  try {
    const data = await getSongsByTag(generoId, { limit: 20 });
    spinner.stop();

    const musicas = data.items.map(formatarMusica);

    console.log(chalk.hex("#88D498")(`\n  Encontradas ${musicas.length} musicas:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function buscarMusica() {
  const termo = await input({
    message: chalk.hex(COLORS.accent)("Nome da musica:"),
    validate: (value) => value.length >= 2 || "Digite pelo menos 2 caracteres",
  });

  const spinner = criarSpinner(`Buscando "${termo}"...`);
  spinner.start();

  try {
    const data = await searchSongs(termo, { limit: 20 });
    spinner.stop();

    if (data.items.length === 0) {
      console.log(chalk.yellow(`\n  Nenhuma musica encontrada para "${termo}"\n`));
      return;
    }

    const musicas = data.items.map(formatarMusica);

    console.log(chalk.hex(COLORS.accent)(`\n  Encontradas ${musicas.length} musicas:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function buscarProdutor() {
  const termo = await input({
    message: chalk.hex("#9B59B6")("Nome do produtor:"),
    validate: (value) => value.length >= 2 || "Digite pelo menos 2 caracteres",
  });

  const spinner = criarSpinner(`Buscando produtor "${termo}"...`);
  spinner.start();

  try {
    const artistData = await searchArtists(termo, { limit: 10 });
    spinner.stop();

    if (artistData.items.length === 0) {
      console.log(chalk.yellow(`\n  Nenhum produtor encontrado para "${termo}"\n`));
      return;
    }

    const opcoes = artistData.items.map((artist) => ({
      name: chalk.hex("#9B59B6")(`  ${artist.name}`),
      value: artist.id,
      description: artist.additionalNames || "",
    }));

    opcoes.push({
      name: chalk.gray("  Voltar"),
      value: null,
    });

    const produtorId = await select({
      message: chalk.hex("#9B59B6")("Selecione o produtor:"),
      choices: opcoes,
    });

    if (!produtorId) return;

    const spinner2 = criarSpinner("Buscando musicas do produtor...");
    spinner2.start();

    const data = await getSongsByArtist(produtorId, { limit: 20 });
    spinner2.stop();

    const musicas = data.items.map(formatarMusica);

    console.log(chalk.hex("#9B59B6")(`\n  Encontradas ${musicas.length} musicas:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function modoDescoberta() {
  const spinner = criarSpinner("Descobrindo musicas aleatorias...");
  spinner.start();

  try {
    const data = await getRandomSongs({ limit: 50, display: 10 });
    spinner.stop();

    const vocaloidName = Object.entries(VOCALOIDS).find(
      ([, id]) => id === data.vocaloidId
    )?.[0] || "Vocaloid";

    const musicas = data.items.map(formatarMusica);

    console.log(chalk.hex("#F39C12")(`\n  Descobertas de ${vocaloidName}:\n`));
    const tabela = criarTabelaMusicas(musicas);
    console.log(tabela.toString());

    await menuAbrirLink(musicas);

  } catch (error) {
    spinner.fail(chalk.red("Erro ao buscar dados"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

function pausar() {
  return new Promise((resolve) => {
    console.log(chalk.gray("\n  Pressione qualquer tecla para continuar..."));
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    });
  });
}

async function main() {
  let rodando = true;

  while (rodando) {
    exibirHeader();

    try {
      const opcao = await select({
        message: chalk.white("O que deseja ver?"),
        choices: MENU_PRINCIPAL,
      });

      switch (opcao) {
        case "sair":
          console.log(chalk.hex(COLORS.primary)("\n  Miku says bye bye~\n"));
          rodando = false;
          break;

        case "top-semana":
          await exibirTopSemana();
          await pausar();
          break;

        case "por-vocaloid":
          await menuPorVocaloid();
          await pausar();
          break;

        case "por-genero":
          await menuPorGenero();
          await pausar();
          break;

        case "buscar-musica":
          await buscarMusica();
          await pausar();
          break;

        case "buscar-produtor":
          await buscarProdutor();
          await pausar();
          break;

        case "descoberta":
          await modoDescoberta();
          await pausar();
          break;
      }
    } catch (error) {
      if (error.name === "ExitPromptError") {
        console.log(chalk.hex(COLORS.primary)("\n  Bye bye~\n"));
        rodando = false;
      } else {
        console.log(chalk.red(`\n  Erro: ${error.message}\n`));
        await pausar();
      }
    }
  }

  process.exit(0);
}

main().catch(console.error);
