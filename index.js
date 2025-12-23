#!/usr/bin/env node

import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
import { exec } from "child_process";
import { platform } from "os";
import { parseArgs } from "util";
import { exibirHeader, criarSpinner, criarTabelaMusicas, COLORS, themeManager, navigation } from "./src/ui.js";

// Processa argumentos da CLI
const { values: cliArgs } = parseArgs({
  options: {
    theme: { type: "string", short: "t" },
    help: { type: "boolean", short: "h" },
    "list-themes": { type: "boolean" },
  },
  strict: false,
});

// Mostra ajuda
if (cliArgs.help) {
  console.log(`
  ${chalk.hex("#39C5BB")("VocaStats")} - Real-time Vocaloid rankings

  ${chalk.bold("Usage:")}
    vocastats [options]

  ${chalk.bold("Options:")}
    -t, --theme <name>   Set color theme (miku, rin, luka, kaito, meiko, gumi, teto, dark, cyberpunk, monochrome)
    --list-themes        List available themes
    -h, --help           Show this help message

  ${chalk.bold("Examples:")}
    vocastats --theme=cyberpunk
    vocastats -t rin
`);
  process.exit(0);
}

// Lista temas disponiveis
if (cliArgs["list-themes"]) {
  console.log(`\n  ${chalk.bold("Available themes:")}\n`);
  themeManager.listThemes().forEach(t => {
    const marker = t.isCurrent ? chalk.green(" (current)") : "";
    console.log(`    ${chalk.hex("#39C5BB")(t.key.padEnd(12))} ${t.description}${marker}`);
  });
  console.log();
  process.exit(0);
}

// Aplica tema da CLI se especificado
if (cliArgs.theme) {
  if (!themeManager.setTheme(cliArgs.theme)) {
    console.error(chalk.red(`  Unknown theme: ${cliArgs.theme}`));
    console.log(chalk.gray("  Use --list-themes to see available themes\n"));
    process.exit(1);
  }
}
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
 * Opens URL in the system's default browser
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
      console.log(chalk.red(`  Error opening URL: ${error.message}`));
    }
  });
}

const MAIN_MENU = [
  {
    name: chalk.hex(COLORS.primary)("  Top of the week"),
    value: "top-week",
    description: "Most popular songs from the last 7 days",
  },
  {
    name: chalk.hex(COLORS.secondary)("  By Vocaloid"),
    value: "by-vocaloid",
    description: "Filter by Hatsune Miku, Kagamine Rin, etc.",
  },
  {
    name: chalk.hex("#88D498")("  By Genre"),
    value: "by-genre",
    description: "Filter by Rock, Pop, EDM, etc.",
  },
  {
    name: chalk.hex(COLORS.accent)("  Search song"),
    value: "search-song",
    description: "Search by song name",
  },
  {
    name: chalk.hex("#9B59B6")("  Search producer"),
    value: "search-producer",
    description: "Search by producer name",
  },
  {
    name: chalk.hex("#F39C12")("  Discovery Mode"),
    value: "discovery",
    description: "Random highly-rated songs",
  },
  {
    name: chalk.hex("#9B9B9B")("  Settings"),
    value: "settings",
    description: "Change theme and preferences",
  },
  {
    name: chalk.red("  Exit"),
    value: "exit",
    description: "Close the program",
  },
];

function formatSong(song) {
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
    _song: song,
  };
}

/**
 * Exibe lista de musicas com suporte a paginacao
 * @param {Function} fetchFn - Funcao que busca dados da API
 * @param {Object} fetchOptions - Opcoes para a funcao de busca
 * @param {string} title - Titulo da secao
 * @param {string} color - Cor hex para o titulo
 */
async function showSongsWithPagination(fetchFn, fetchOptions, title, color) {
  const spinner = criarSpinner("Fetching songs...");
  spinner.start();

  try {
    let data = await fetchFn(fetchOptions);
    spinner.stop();

    if (data.items.length === 0) {
      console.log(chalk.yellow(`\n  No songs found.\n`));
      return;
    }

    let allSongs = data.items.map(formatSong);
    let currentStart = fetchOptions.start || 0;
    const limit = fetchOptions.limit || 20;

    let nav = "previous-menu";
    while (nav === "previous-menu") {
      exibirHeader();
      console.log(chalk.hex(color)(`  ${title} (${allSongs.length}/${data.totalCount}):\n`));
      const table = criarTabelaMusicas(allSongs);
      console.log(table.toString());

      nav = await openLinkMenuWithPagination(allSongs, data.hasMore, async () => {
        const loadMoreSpinner = criarSpinner("Loading more...");
        loadMoreSpinner.start();

        currentStart += limit;
        const moreData = await fetchFn({ ...fetchOptions, start: currentStart });
        loadMoreSpinner.stop();

        // Adiciona novas musicas a lista
        const newSongs = moreData.items.map(formatSong);
        allSongs = [...allSongs, ...newSongs];
        data = {
          ...moreData,
          items: [...data.items, ...moreData.items],
        };

        return moreData.hasMore;
      });
    }
  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

/**
 * Post-action menu: choose where to navigate after opening a link
 * @returns {'previous-menu' | 'home'}
 */
async function postActionMenu() {
  const choice = await select({
    message: chalk.gray("What would you like to do?"),
    choices: [
      {
        name: chalk.hex(COLORS.secondary)("  Back to previous menu"),
        value: "previous-menu",
        description: "Continue browsing the list",
      },
      {
        name: chalk.hex(COLORS.primary)("  Back to home"),
        value: "home",
        description: "Main menu",
      },
    ],
  });
  return choice;
}

/**
 * Menu to select and open a song link (with pagination support)
 * @param {Array} songs - Lista de musicas formatadas
 * @param {boolean} hasMore - Se ha mais resultados para carregar
 * @param {Function} loadMoreFn - Funcao para carregar mais resultados
 * @returns {'previous-menu' | 'home' | null} - navigation action
 */
async function openLinkMenuWithPagination(songs, hasMore, loadMoreFn) {
  const spotifyInstalled = isSpotifyInstalled();
  const spotifyLabel = spotifyInstalled
    ? "  Search on Spotify (app)"
    : "  Search on Spotify (web)";

  const options = [];

  // Opcao de carregar mais (se houver)
  if (hasMore) {
    options.push({
      name: chalk.hex(COLORS.primary)("  Load more..."),
      value: { type: "load-more" },
      description: "Fetch more results",
    });
  }

  options.push({
    name: chalk.hex("#1DB954")(spotifyLabel),
    value: { type: "spotify" },
    description: spotifyInstalled ? "Opens directly in app" : "Opens in browser",
  });

  songs.forEach((s, i) => {
    options.push({
      name: chalk.hex(COLORS.accent)(`  ${i + 1}. ${s.titulo}`),
      value: { type: "song", song: s },
      description: s.produtor,
    });
  });

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  const choice = await select({
    message: chalk.hex(COLORS.accent)("Select an option:"),
    choices: options,
    pageSize: 15,
  });

  if (!choice) return null;

  // Load more
  if (choice.type === "load-more") {
    const stillHasMore = await loadMoreFn();
    // Retorna previous-menu para re-renderizar a lista com os novos itens
    return "previous-menu";
  }

  let openedLink = false;

  if (choice.type === "spotify") {
    const songOptions = songs.map((s, i) => ({
      name: chalk.hex("#1DB954")(`  ${i + 1}. ${s.titulo}`),
      value: s,
      description: s.produtor,
    }));

    songOptions.push({
      name: chalk.gray("  Cancel"),
      value: null,
    });

    const selectedSong = await select({
      message: chalk.hex("#1DB954")("Which song to search on Spotify?"),
      choices: songOptions,
      pageSize: 15,
    });

    if (selectedSong) {
      const query = `${selectedSong.titulo} ${selectedSong.produtor}`;
      const result = searchOnSpotify(query);
      if (result.type === "app") {
        console.log(chalk.hex("#1DB954")(`\n  Opening in Spotify...\n`));
      } else {
        console.log(chalk.hex("#1DB954")(`\n  Opening in browser...\n`));
      }
      openedLink = true;
    }
  } else if (choice.type === "song") {
    const song = choice.song;
    if (song.url) {
      console.log(chalk.hex(COLORS.primary)(`\n  Opening ${song.url}...\n`));
      openUrl(song.url);
      openedLink = true;
    } else {
      console.log(chalk.yellow("\n  This song has no available link.\n"));
    }
  }

  if (openedLink) {
    return await postActionMenu();
  }

  return null;
}

/**
 * Menu to select and open a song link
 * @returns {'previous-menu' | 'home' | null} - navigation action
 */
async function openLinkMenu(songs) {
  const spotifyInstalled = isSpotifyInstalled();
  const spotifyLabel = spotifyInstalled
    ? "  Search on Spotify (app)"
    : "  Search on Spotify (web)";

  const options = [
    {
      name: chalk.hex("#1DB954")(spotifyLabel),
      value: { type: "spotify" },
      description: spotifyInstalled ? "Opens directly in app" : "Opens in browser",
    },
  ];

  songs.forEach((s, i) => {
    options.push({
      name: chalk.hex(COLORS.primary)(`  ${i + 1}. ${s.titulo}`),
      value: { type: "song", song: s },
      description: s.produtor,
    });
  });

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  const choice = await select({
    message: chalk.hex(COLORS.accent)("Open in browser:"),
    choices: options,
  });

  if (!choice) return null;

  let openedLink = false;

  if (choice.type === "spotify") {
    const songOptions = songs.map((s, i) => ({
      name: chalk.hex("#1DB954")(`  ${i + 1}. ${s.titulo}`),
      value: s,
      description: s.produtor,
    }));

    songOptions.push({
      name: chalk.gray("  Cancel"),
      value: null,
    });

    const selectedSong = await select({
      message: chalk.hex("#1DB954")("Which song to search on Spotify?"),
      choices: songOptions,
    });

    if (selectedSong) {
      const query = `${selectedSong.titulo} ${selectedSong.produtor}`;
      const result = searchOnSpotify(query);
      if (result.type === "app") {
        console.log(chalk.hex("#1DB954")(`\n  Opening in Spotify...\n`));
      } else {
        console.log(chalk.hex("#1DB954")(`\n  Opening in browser...\n`));
      }
      openedLink = true;
    }
  } else if (choice.type === "song") {
    const song = choice.song;
    if (song.url) {
      console.log(chalk.hex(COLORS.primary)(`\n  Opening ${song.url}...\n`));
      openUrl(song.url);
      openedLink = true;
    } else {
      console.log(chalk.yellow("\n  This song has no available link.\n"));
    }
  }

  if (openedLink) {
    return await postActionMenu();
  }

  return null;
}

async function showTopWeek() {
  navigation.push("Top of the Week");
  await showSongsWithPagination(
    getTopRated,
    { hours: 168, limit: 20 },
    "Top of the week",
    COLORS.primary
  );
  navigation.pop();
}

async function menuByVocaloid() {
  navigation.push("By Vocaloid");

  const options = Object.entries(VOCALOIDS).map(([name, id]) => ({
    name: chalk.hex(COLORS.primary)(`  ${name}`),
    value: { id, name },
    description: `View songs by ${name}`,
  }));

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  exibirHeader();
  const vocaloid = await select({
    message: chalk.hex(COLORS.primary)("Select Vocaloid:"),
    choices: options,
  });

  if (!vocaloid) {
    navigation.pop();
    return;
  }

  navigation.push(vocaloid.name);
  await showSongsWithPagination(
    (opts) => getSongsByArtist(vocaloid.id, opts),
    { limit: 20 },
    `Songs by ${vocaloid.name}`,
    COLORS.secondary
  );
  navigation.pop();
  navigation.pop();
}

async function menuByGenre() {
  navigation.push("By Genre");

  const options = Object.entries(GENRES).map(([name, id]) => ({
    name: chalk.hex("#88D498")(`  ${name}`),
    value: { id, name },
    description: `View ${name} songs`,
  }));

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  exibirHeader();
  const genre = await select({
    message: chalk.hex("#88D498")("Select Genre:"),
    choices: options,
  });

  if (!genre) {
    navigation.pop();
    return;
  }

  navigation.push(genre.name);
  await showSongsWithPagination(
    (opts) => getSongsByTag(genre.id, opts),
    { limit: 20 },
    `${genre.name} songs`,
    "#88D498"
  );
  navigation.pop();
  navigation.pop();
}

async function searchSongMenu() {
  navigation.push("Search Song");
  exibirHeader();

  const term = await input({
    message: chalk.hex(COLORS.accent)("Song name:"),
    validate: (value) => value.length >= 2 || "Enter at least 2 characters",
  });

  navigation.push(`"${term}"`);
  await showSongsWithPagination(
    (opts) => searchSongs(term, opts),
    { limit: 20 },
    `Results for "${term}"`,
    COLORS.accent
  );
  navigation.pop();
  navigation.pop();
}

async function searchProducerMenu() {
  navigation.push("Search Producer");
  exibirHeader();

  const term = await input({
    message: chalk.hex("#9B59B6")("Producer name:"),
    validate: (value) => value.length >= 2 || "Enter at least 2 characters",
  });

  const spinner = criarSpinner(`Searching producer "${term}"...`);
  spinner.start();

  try {
    const artistData = await searchArtists(term, { limit: 10 });
    spinner.stop();

    if (artistData.items.length === 0) {
      console.log(chalk.yellow(`\n  No producer found for "${term}"\n`));
      navigation.pop();
      return;
    }

    navigation.push(`"${term}"`);

    const options = artistData.items.map((artist) => ({
      name: chalk.hex("#9B59B6")(`  ${artist.name}`),
      value: { id: artist.id, name: artist.name },
      description: artist.additionalNames || "",
    }));

    options.push({
      name: chalk.gray("  Back"),
      value: null,
    });

    exibirHeader();
    const producer = await select({
      message: chalk.hex("#9B59B6")("Select producer:"),
      choices: options,
    });

    if (!producer) {
      navigation.pop();
      navigation.pop();
      return;
    }

    navigation.push(producer.name);
    await showSongsWithPagination(
      (opts) => getSongsByArtist(producer.id, opts),
      { limit: 20 },
      `Songs by ${producer.name}`,
      "#9B59B6"
    );
    navigation.pop();
    navigation.pop();
    navigation.pop();

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
    navigation.pop();
  }
}

async function discoveryMode() {
  navigation.push("Discovery Mode");

  const spinner = criarSpinner("Discovering random songs...");
  spinner.start();

  try {
    const data = await getRandomSongs({ limit: 50, display: 10 });
    spinner.stop();

    const vocaloidName = Object.entries(VOCALOIDS).find(
      ([, id]) => id === data.vocaloidId
    )?.[0] || "Vocaloid";

    navigation.push(vocaloidName);

    const formattedSongs = data.items.map(formatSong);

    let nav = "previous-menu";
    while (nav === "previous-menu") {
      exibirHeader();
      console.log(chalk.hex("#F39C12")(`  Discoveries from ${vocaloidName}:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      nav = await openLinkMenu(formattedSongs);
    }

    navigation.pop();
    navigation.pop();

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
    navigation.pop();
  }
}

/**
 * Menu de configuracoes
 */
async function showSettings() {
  navigation.push("Settings");

  const choices = [
    {
      name: chalk.hex(COLORS.primary)("  Change theme"),
      value: "theme",
      description: "Customize the color scheme",
    },
    {
      name: chalk.gray("  Back"),
      value: null,
    },
  ];

  exibirHeader();
  const action = await select({
    message: chalk.hex("#9B9B9B")("Settings:"),
    choices,
  });

  if (action === "theme") {
    await changeTheme();
  }

  navigation.pop();
}

/**
 * Menu para trocar o tema
 */
async function changeTheme() {
  navigation.push("Change Theme");

  const themeList = themeManager.listThemes();

  const choices = themeList.map(t => ({
    name: t.isCurrent
      ? chalk.hex(COLORS.primary)(`  ${t.name} ✓`)
      : chalk.white(`  ${t.name}`),
    value: t.key,
    description: t.description,
  }));

  choices.push({
    name: chalk.gray("  Cancel"),
    value: null,
  });

  exibirHeader();
  const selected = await select({
    message: chalk.hex(COLORS.primary)("Select theme:"),
    choices,
  });

  if (selected) {
    themeManager.setTheme(selected);
    exibirHeader();
    console.log(chalk.hex(COLORS.primary)(`\n  Theme changed to ${selected}!\n`));

    // Pequena pausa para o usuario ver a mudanca
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  navigation.pop();
}

async function main() {
  let running = true;

  while (running) {
    // Limpa navegacao e inicia em Home
    navigation.clear();
    navigation.push("Home");

    exibirHeader(false); // Nao mostra breadcrumbs na Home

    try {
      const option = await select({
        message: chalk.white("What would you like to see?"),
        choices: MAIN_MENU,
      });

      switch (option) {
        case "exit":
          console.log(chalk.hex(COLORS.primary)("\n  Miku says bye bye~\n"));
          running = false;
          break;

        case "top-week":
          await showTopWeek();
          break;

        case "by-vocaloid":
          await menuByVocaloid();
          break;

        case "by-genre":
          await menuByGenre();
          break;

        case "search-song":
          await searchSongMenu();
          break;

        case "search-producer":
          await searchProducerMenu();
          break;

        case "discovery":
          await discoveryMode();
          break;

        case "settings":
          await showSettings();
          break;
      }
    } catch (error) {
      if (error.name === "ExitPromptError") {
        console.log(chalk.hex(COLORS.primary)("\n  Bye bye~\n"));
        running = false;
      } else {
        console.log(chalk.red(`\n  Error: ${error.message}\n`));
      }
    }
  }

  process.exit(0);
}

main().catch(console.error);
