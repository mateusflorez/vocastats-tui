/**
 * Cliente para a API do VocaDB
 * Documentacao: https://vocadb.net/swagger/ui/index
 */

import * as cache from "./cache.js";

const BASE_URL = "https://vocadb.net/api";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * IDs dos Vocaloids mais populares no VocaDB
 */
export const VOCALOIDS = {
  "Hatsune Miku": 1,
  "Kagamine Rin": 2,
  "Kagamine Len": 3,
  "Megurine Luka": 4,
  "KAITO": 5,
  "MEIKO": 6,
  "GUMI": 3,
  "IA": 127,
  "Kasane Teto": 17,
  "Kaai Yuki": 191,
};

/**
 * Gêneros musicais mais populares no VocaDB
 */
export const GENRES = {
  "Rock": 481,
  "Pop": 341,
  "Ballad": 29,
  "EDM": 1552,
  "Technopop": 1698,
  "Metal": 262,
  "Electronica": 1580,
  "Electropop": 124,
  "J-Pop": 1654,
  "J-Rock": 4933,
  "Jazz": 467,
  "Folk": 159,
  "Classical": 2794,
  "Chiptune": 62,
  "Trance": 435,
};

/**
 * Busca musicas mais bem avaliadas (com cache)
 */
export async function getTopRated(options = {}) {
  const cacheKey = `top-rated:${options.hours || 168}:${options.limit || 25}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    durationHours: options.hours || 168, // 7 dias
    filterBy: "PublishDate",
    languagePreference: "Romaji",
    fields: "Artists,ThumbUrl,PVs",
    maxResults: options.limit || 25,
  });

  const response = await fetch(`${BASE_URL}/songs/top-rated?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, data, CACHE_TTL);
  return data;
}

/**
 * Busca musicas por artista/vocaloid (com cache)
 */
export async function getSongsByArtist(artistId, options = {}) {
  const cacheKey = `artist:${artistId}:${options.sort || "RatingScore"}:${options.limit || 25}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    artistId: artistId.toString(),
    sort: options.sort || "RatingScore",
    languagePreference: "Romaji",
    fields: "Artists,ThumbUrl,PVs",
    maxResults: options.limit || 25,
    onlyWithPvs: "true",
  });

  const response = await fetch(`${BASE_URL}/songs?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, data, CACHE_TTL);
  return data;
}

/**
 * Busca musicas por texto (nome da musica)
 */
export async function searchSongs(query, options = {}) {
  const params = new URLSearchParams({
    query,
    sort: options.sort || "RatingScore",
    languagePreference: "Romaji",
    fields: "Artists,ThumbUrl,PVs",
    maxResults: options.limit || 25,
    onlyWithPvs: "true",
  });

  const response = await fetch(`${BASE_URL}/songs?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Busca produtores por nome
 */
export async function searchArtists(query, options = {}) {
  const params = new URLSearchParams({
    query,
    artistTypes: "Producer",
    sort: "FollowerCount",
    languagePreference: "Romaji",
    maxResults: options.limit || 10,
  });

  const response = await fetch(`${BASE_URL}/artists?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Busca musicas por tag/genero (com cache)
 */
export async function getSongsByTag(tagId, options = {}) {
  const cacheKey = `tag:${tagId}:${options.sort || "RatingScore"}:${options.limit || 25}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    tagId: tagId.toString(),
    sort: options.sort || "RatingScore",
    languagePreference: "Romaji",
    fields: "Artists,ThumbUrl,PVs",
    maxResults: options.limit || 25,
    onlyWithPvs: "true",
  });

  const response = await fetch(`${BASE_URL}/songs?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, data, CACHE_TTL);
  return data;
}

/**
 * Modo descoberta - busca musicas aleatorias bem avaliadas
 */
export async function getRandomSongs(options = {}) {
  const vocaloidIds = Object.values(VOCALOIDS);
  const randomVocaloid = vocaloidIds[Math.floor(Math.random() * vocaloidIds.length)];

  const params = new URLSearchParams({
    artistId: randomVocaloid.toString(),
    sort: "RatingScore",
    languagePreference: "Romaji",
    fields: "Artists,ThumbUrl,PVs",
    maxResults: options.limit || 50,
    onlyWithPvs: "true",
    minScore: options.minScore || 3,
  });

  const response = await fetch(`${BASE_URL}/songs?${params}`);

  if (!response.ok) {
    throw new Error(`VocaDB API error: ${response.status}`);
  }

  const data = await response.json();

  // Embaralha e retorna quantidade solicitada
  const shuffled = data.items
    .sort(() => Math.random() - 0.5)
    .slice(0, options.display || 10);

  return { items: shuffled, vocaloidId: randomVocaloid };
}

/**
 * Extrai URL do PV (YouTube/Niconico) de uma musica
 */
export function extractPvUrl(song) {
  if (!song.pvs || song.pvs.length === 0) return null;

  // Prioriza YouTube, depois Niconico
  const youtube = song.pvs.find((pv) => pv.service === "Youtube");
  if (youtube) return youtube.url;

  const niconico = song.pvs.find((pv) => pv.service === "NicoNicoDouga");
  if (niconico) return niconico.url;

  return song.pvs[0]?.url || null;
}

/**
 * Formata artistas de uma musica
 */
export function formatArtists(song) {
  if (!song.artists || song.artists.length === 0) return "Desconhecido";

  const producers = song.artists
    .filter((a) => a.categories?.includes("Producer"))
    .map((a) => a.artist?.name || a.name)
    .slice(0, 2);

  return producers.length > 0 ? producers.join(", ") : "Vários";
}
