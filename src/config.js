/**
 * Sistema de configuracao persistente
 * Armazena preferencias do usuario em ~/.vocastats/
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".vocastats");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG = {
  theme: "miku",
  pageSize: 20,
  cacheMinutes: 5,
};

/**
 * Garante que o diretorio de configuracao existe
 */
export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Le um arquivo JSON com fallback para valor padrao
 */
export function readJsonFile(filepath, defaultValue = {}) {
  ensureConfigDir();
  try {
    if (existsSync(filepath)) {
      return JSON.parse(readFileSync(filepath, "utf-8"));
    }
  } catch (e) {
    // Arquivo corrompido, retorna default
  }
  return defaultValue;
}

/**
 * Escreve dados em um arquivo JSON
 */
export function writeJsonFile(filepath, data) {
  ensureConfigDir();
  writeFileSync(filepath, JSON.stringify(data, null, 2));
}

/**
 * Obtem configuracao completa
 */
export function getConfig() {
  return { ...DEFAULT_CONFIG, ...readJsonFile(CONFIG_FILE, {}) };
}

/**
 * Define um valor de configuracao
 */
export function setConfig(key, value) {
  const config = getConfig();
  config[key] = value;
  writeJsonFile(CONFIG_FILE, config);
}

/**
 * Obtem um valor especifico da configuracao
 */
export function getConfigValue(key) {
  return getConfig()[key];
}

export { CONFIG_DIR, CONFIG_FILE };
