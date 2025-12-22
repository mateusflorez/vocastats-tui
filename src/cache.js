/**
 * Sistema de cache em memória com TTL
 */

const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém valor do cache
 */
export function get(key) {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

/**
 * Armazena valor no cache
 */
export function set(key, value, ttl = DEFAULT_TTL) {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl,
  });
}

/**
 * Wrapper para funções async com cache
 */
export function withCache(fn, keyGenerator, ttl = DEFAULT_TTL) {
  return async (...args) => {
    const key = keyGenerator(...args);
    const cached = get(key);

    if (cached) {
      return cached;
    }

    const result = await fn(...args);
    set(key, result, ttl);
    return result;
  };
}

/**
 * Limpa todo o cache
 */
export function clear() {
  cache.clear();
}

/**
 * Retorna estatísticas do cache
 */
export function stats() {
  let valid = 0;
  let expired = 0;
  const now = Date.now();

  for (const [, item] of cache) {
    if (now > item.expiry) {
      expired++;
    } else {
      valid++;
    }
  }

  return { valid, expired, total: cache.size };
}
