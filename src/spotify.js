/**
 * Integração simples com Spotify
 * Abre busca diretamente no navegador - sem necessidade de API/OAuth
 */

import { exec } from "child_process";
import { platform } from "os";

const SPOTIFY_SEARCH_URL = "https://open.spotify.com/search";

/**
 * Abre URL no navegador
 */
function openBrowser(url) {
  const plat = platform();
  let command;

  if (plat === "darwin") {
    command = `open "${url}"`;
  } else if (plat === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command);
}

/**
 * Abre busca no Spotify Web/App
 */
export function searchOnSpotify(query) {
  const encoded = encodeURIComponent(query);
  const url = `${SPOTIFY_SEARCH_URL}/${encoded}`;
  openBrowser(url);
  return url;
}

/**
 * Sempre disponível (não precisa de auth)
 */
export function isAuthenticated() {
  return true;
}
