# Proposal: Publicação do VocaStats no npm

## Objetivo

Publicar o `vocastats-tui` no npm para permitir instalação e atualização global simples:

```bash
# Instalação
npm install -g vocastats-tui

# Uso
vocastats

# Atualização
npm update -g vocastats-tui
```

---

## Checklist de Preparação

### 1. Ajustes no `package.json`

```json
{
  "name": "vocastats-tui",
  "version": "1.0.0",
  "description": "TUI para acompanhar músicas populares de Vocaloid/Hatsune Miku",
  "main": "index.js",
  "type": "module",
  "bin": {
    "vocastats": "./index.js"
  },
  "files": [
    "index.js",
    "src/**/*"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/SEU_USUARIO/vocastats-tui.git"
  },
  "homepage": "https://github.com/SEU_USUARIO/vocastats-tui#readme",
  "bugs": {
    "url": "https://github.com/SEU_USUARIO/vocastats-tui/issues"
  },
  "author": "Mateus <seu@email.com>",
  "license": "MIT",
  "keywords": [
    "vocaloid",
    "hatsune-miku",
    "tui",
    "cli",
    "vocadb",
    "miku",
    "vocaloid-stats",
    "music"
  ],
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@inquirer/prompts": "^7.2.1",
    "chalk": "^5.3.0",
    "cli-table3": "^0.6.5",
    "ora": "^8.1.0"
  }
}
```

**Campos adicionados:**
- `files` - Define quais arquivos vão no pacote (evita enviar `node_modules`, etc.)
- `engines` - Versão mínima do Node.js
- `repository`, `homepage`, `bugs` - Links do projeto
- `author` - Seu nome/email
- `license` - Licença do projeto

---

### 2. Criar arquivo `LICENSE`

Adicionar arquivo MIT License na raiz do projeto.

---

### 3. Criar `README.md`

```markdown
# VocaStats TUI

> CLI interativa para explorar músicas de Vocaloid via VocaDB

## Instalação

```bash
npm install -g vocastats-tui
```

## Uso

```bash
vocastats
```

## Features

- Top músicas da semana
- Filtro por Vocaloid (Miku, Rin, Luka, etc.)
- Filtro por gênero musical
- Busca por música ou produtor
- Modo descoberta (músicas aleatórias)
- Integração com Spotify

## Screenshots

[Adicionar screenshots aqui]

## License

MIT
```

---

### 4. Criar `.npmignore`

```
node_modules/
.git/
.gitignore
proposal.md
*.log
.DS_Store
```

---

## Passos para Publicação

### Primeira vez (criar conta npm)

```bash
# 1. Criar conta no npmjs.com (se não tiver)
npm adduser

# 2. Verificar login
npm whoami
```

### Publicar

```bash
# 1. Verificar se nome está disponível
npm view vocastats-tui

# 2. Dry run (simula publicação)
npm publish --dry-run

# 3. Publicar
npm publish
```

---

## Fluxo de Atualização

Para lançar novas versões:

```bash
# Patch (1.0.0 -> 1.0.1) - bug fixes
npm version patch

# Minor (1.0.0 -> 1.1.0) - novas features
npm version minor

# Major (1.0.0 -> 2.0.0) - breaking changes
npm version major

# Publicar nova versão
npm publish
```

---

## Verificação de Nome

O nome `vocastats-tui` precisa estar disponível no npm.

**Alternativas caso esteja ocupado:**
- `vocastats`
- `vocadb-tui`
- `vocaloid-stats`
- `miku-stats`

---

## Opcional: npx sem instalação

Usuários poderão executar sem instalar:

```bash
npx vocastats-tui
```

Isso sempre baixa a versão mais recente.

---

## Estimativa de Arquivos no Pacote

| Arquivo | Incluído |
|---------|----------|
| `index.js` | Sim |
| `src/**/*` | Sim |
| `package.json` | Sim (automático) |
| `README.md` | Sim (automático) |
| `LICENSE` | Sim (automático) |
| `node_modules/` | Não |
| `.git/` | Não |
| `proposal.md` | Não |

---

## Próximos Passos

1. [ ] Atualizar `package.json` com campos faltantes
2. [ ] Criar `LICENSE` (MIT)
3. [ ] Criar `README.md` com instruções
4. [ ] Criar `.npmignore`
5. [ ] Testar localmente: `npm link` e executar `vocastats`
6. [ ] Verificar disponibilidade do nome
7. [ ] Publicar: `npm publish`
8. [ ] Testar instalação: `npm install -g vocastats-tui`
