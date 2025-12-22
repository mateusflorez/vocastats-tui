/**
 * Integração com Spotify
 * Detecta se o app está instalado e abre busca nele, senão usa o navegador
 */

import { exec, execSync } from "child_process";
import { platform } from "os";
import { existsSync } from "fs";

const SPOTIFY_SEARCH_URL = "https://open.spotify.com/search";

/**
 * Verifica se o Spotify está instalado
 */
export function isSpotifyInstalled() {
  const plat = platform();

  try {
    if (plat === "linux") {
      // Verifica snap, flatpak ou pacote nativo
      try {
        execSync("which spotify", { stdio: "ignore" });
        return true;
      } catch {
        // Verifica snap
        if (existsSync("/snap/bin/spotify")) return true;
        // Verifica flatpak
        try {
          execSync("flatpak list | grep -i spotify", { stdio: "ignore" });
          return true;
        } catch {
          return false;
        }
      }
    } else if (plat === "darwin") {
      return existsSync("/Applications/Spotify.app");
    } else if (plat === "win32") {
      // Verifica pasta padrão do Spotify no Windows
      const appData = process.env.APPDATA || "";
      return existsSync(`${appData}\\Spotify\\Spotify.exe`);
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Abre URL ou URI no sistema
 */
function openSystem(target) {
  const plat = platform();
  let command;

  if (plat === "darwin") {
    command = `open "${target}"`;
  } else if (plat === "win32") {
    command = `start "" "${target}"`;
  } else {
    command = `xdg-open "${target}"`;
  }

  exec(command);
}

/**
 * Abre busca no Spotify (app se instalado, senão navegador)
 * Retorna objeto com info sobre onde abriu
 */
export function searchOnSpotify(query) {
  const encoded = encodeURIComponent(query);
  const installed = isSpotifyInstalled();

  if (installed) {
    // URI scheme do Spotify - abre direto no app
    const uri = `spotify:search:${encoded}`;
    openSystem(uri);
    return { type: "app", query };
  } else {
    // Fallback para navegador
    const url = `${SPOTIFY_SEARCH_URL}/${encoded}`;
    openSystem(url);
    return { type: "web", query, url };
  }
}

/**
 * Força abrir no navegador (útil se o app não responder)
 */
export function searchOnSpotifyWeb(query) {
  const encoded = encodeURIComponent(query);
  const url = `${SPOTIFY_SEARCH_URL}/${encoded}`;
  openSystem(url);
  return { type: "web", query, url };
}
