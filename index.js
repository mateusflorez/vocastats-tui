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
  const spinner = criarSpinner("Fetching top of the week...");
  spinner.start();

  try {
    const songs = await getTopRated({ hours: 168, limit: 20 });
    spinner.stop();

    const formattedSongs = songs.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex(COLORS.primary)(`\n  Top ${formattedSongs.length} of the week:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function menuByVocaloid() {
  const options = Object.entries(VOCALOIDS).map(([name, id]) => ({
    name: chalk.hex(COLORS.primary)(`  ${name}`),
    value: id,
    description: `View songs by ${name}`,
  }));

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  const vocaloidId = await select({
    message: chalk.hex(COLORS.primary)("Select Vocaloid:"),
    choices: options,
  });

  if (!vocaloidId) return;

  const spinner = criarSpinner("Fetching songs...");
  spinner.start();

  try {
    const data = await getSongsByArtist(vocaloidId, { limit: 20 });
    spinner.stop();

    const formattedSongs = data.items.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex(COLORS.primary)(`\n  Found ${formattedSongs.length} songs:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function menuByGenre() {
  const options = Object.entries(GENRES).map(([name, id]) => ({
    name: chalk.hex("#88D498")(`  ${name}`),
    value: id,
    description: `View ${name} songs`,
  }));

  options.push({
    name: chalk.gray("  Back"),
    value: null,
  });

  const genreId = await select({
    message: chalk.hex("#88D498")("Select Genre:"),
    choices: options,
  });

  if (!genreId) return;

  const spinner = criarSpinner("Fetching songs...");
  spinner.start();

  try {
    const data = await getSongsByTag(genreId, { limit: 20 });
    spinner.stop();

    const formattedSongs = data.items.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex("#88D498")(`\n  Found ${formattedSongs.length} songs:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function searchSongMenu() {
  const term = await input({
    message: chalk.hex(COLORS.accent)("Song name:"),
    validate: (value) => value.length >= 2 || "Enter at least 2 characters",
  });

  const spinner = criarSpinner(`Searching "${term}"...`);
  spinner.start();

  try {
    const data = await searchSongs(term, { limit: 20 });
    spinner.stop();

    if (data.items.length === 0) {
      console.log(chalk.yellow(`\n  No songs found for "${term}"\n`));
      return;
    }

    const formattedSongs = data.items.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex(COLORS.accent)(`\n  Found ${formattedSongs.length} songs:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function searchProducerMenu() {
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
      return;
    }

    const options = artistData.items.map((artist) => ({
      name: chalk.hex("#9B59B6")(`  ${artist.name}`),
      value: artist.id,
      description: artist.additionalNames || "",
    }));

    options.push({
      name: chalk.gray("  Back"),
      value: null,
    });

    const producerId = await select({
      message: chalk.hex("#9B59B6")("Select producer:"),
      choices: options,
    });

    if (!producerId) return;

    const spinner2 = criarSpinner("Fetching producer's songs...");
    spinner2.start();

    const data = await getSongsByArtist(producerId, { limit: 20 });
    spinner2.stop();

    const formattedSongs = data.items.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex("#9B59B6")(`\n  Found ${formattedSongs.length} songs:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function discoveryMode() {
  const spinner = criarSpinner("Discovering random songs...");
  spinner.start();

  try {
    const data = await getRandomSongs({ limit: 50, display: 10 });
    spinner.stop();

    const vocaloidName = Object.entries(VOCALOIDS).find(
      ([, id]) => id === data.vocaloidId
    )?.[0] || "Vocaloid";

    const formattedSongs = data.items.map(formatSong);

    let navigation = "previous-menu";
    while (navigation === "previous-menu") {
      console.log(chalk.hex("#F39C12")(`\n  Discoveries from ${vocaloidName}:\n`));
      const table = criarTabelaMusicas(formattedSongs);
      console.log(table.toString());

      navigation = await openLinkMenu(formattedSongs);
    }

  } catch (error) {
    spinner.fail(chalk.red("Error fetching data"));
    console.log(chalk.red(`  ${error.message}`));
  }
}

async function main() {
  let running = true;

  while (running) {
    exibirHeader();

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
