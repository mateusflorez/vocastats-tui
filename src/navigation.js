/**
 * Sistema de navegacao com historico
 * Permite voltar para telas anteriores e mostra breadcrumbs
 */

/**
 * Representa uma tela no historico de navegacao
 */
class Screen {
  constructor(label, handler = null, params = {}) {
    this.label = label;
    this.handler = handler;
    this.params = params;
  }
}

/**
 * Stack de navegacao para controle de historico
 */
class NavigationStack {
  constructor() {
    this.stack = [];
    this.current = null;
  }

  /**
   * Adiciona uma nova tela ao historico
   */
  push(label, handler = null, params = {}) {
    if (this.current) {
      this.stack.push(this.current);
    }
    this.current = new Screen(label, handler, params);
    return this;
  }

  /**
   * Remove a tela atual e retorna a anterior
   */
  pop() {
    if (this.stack.length === 0) {
      return null;
    }
    this.current = this.stack.pop();
    return this.current;
  }

  /**
   * Volta para a tela anterior e executa seu handler
   */
  async back() {
    const previous = this.pop();
    if (previous && previous.handler) {
      await previous.handler(previous.params);
    }
    return previous;
  }

  /**
   * Verifica se pode voltar
   */
  canGoBack() {
    return this.stack.length > 0;
  }

  /**
   * Retorna a profundidade atual da navegacao
   */
  depth() {
    return this.stack.length + (this.current ? 1 : 0);
  }

  /**
   * Retorna o array de breadcrumbs (labels)
   */
  getBreadcrumbs() {
    const crumbs = this.stack.map(s => s.label);
    if (this.current) {
      crumbs.push(this.current.label);
    }
    return crumbs;
  }

  /**
   * Retorna breadcrumbs formatado como string
   */
  getBreadcrumbsString(separator = " > ") {
    return this.getBreadcrumbs().join(separator);
  }

  /**
   * Limpa todo o historico
   */
  clear() {
    this.stack = [];
    this.current = null;
  }

  /**
   * Volta para o inicio (Home)
   */
  goHome() {
    this.stack = [];
    if (this.current) {
      this.current = new Screen("Home");
    }
  }

  /**
   * Retorna o label da tela atual
   */
  getCurrentLabel() {
    return this.current?.label || "Home";
  }
}

// Instancia singleton
export const navigation = new NavigationStack();

/**
 * Helper para criar tela
 */
export function screen(label, handler, params = {}) {
  return { label, handler, params };
}

export { NavigationStack, Screen };
