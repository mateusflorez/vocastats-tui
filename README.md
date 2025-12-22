# VocaStats

TUI para acompanhar rankings e estatísticas de músicas Vocaloid em tempo real.

```
  ╔══════════════════════════════════════════════════╗
  ║  __     __              ____  _        _         ║
  ║  \ \   / /__   ___ __ _/ ___|| |_ __ _| |_ ___   ║
  ║   \ \ / / _ \ / __/ _` \___ \| __/ _` | __/ __|  ║
  ║    \ V / (_) | (_| (_| |___) | || (_| | |_\__ \  ║
  ║     \_/ \___/ \___\__,_|____/ \__\__,_|\__|___/  ║
  ╚══════════════════════════════════════════════════╝
```

## Funcionalidades

- Top músicas da semana
- Filtro por Vocaloid (Miku, Rin, Len, Luka, GUMI, etc.)
- Filtro por gênero (Rock, Pop, EDM, Metal, etc.)
- Busca por nome de música
- Busca por produtor
- Modo descoberta (músicas aleatórias bem avaliadas)
- Abrir links no YouTube/Niconico
- Buscar no Spotify (detecta se o app está instalado)

## Requisitos

- Node.js 18+
- npm

## Instalação

### Opção 1: npm link (desenvolvimento)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vocastats-tui.git
cd vocastats-tui

# Instale as dependências
npm install

# Crie o comando global
npm link
```

### Opção 2: Instalação manual

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/vocastats-tui.git
cd vocastats-tui

# Instale as dependências
npm install

# Crie link simbólico manualmente
sudo ln -s $(pwd)/index.js /usr/local/bin/vocastats
```

### Opção 3: Sem sudo (instalação local)

Se preferir não usar sudo, configure o npm para instalar globais no seu home:

```bash
# Configure o prefixo do npm
npm config set prefix ~/.local

# Adicione ao PATH (coloque no seu .bashrc ou .zshrc)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Clone e instale
git clone https://github.com/seu-usuario/vocastats-tui.git
cd vocastats-tui
npm install
npm link
```

## Uso

Após a instalação, execute de qualquer lugar:

```bash
vocastats
```

## Navegação

- Use as setas ↑↓ para navegar nos menus
- Enter para selecionar
- Ctrl+C para sair a qualquer momento

## Screenshots

```
┌────┬──────────────────────────────┬────────────────────┬───────────────┬────────┐
│ #  │ TITULO                       │ PRODUTOR           │ VOCALOID      │ RATING │
├────┼──────────────────────────────┼────────────────────┼───────────────┼────────┤
│ 1  │ Hibana                       │ DECO*27            │ Hatsune Miku  │ 1234   │
│ 2  │ Charles                      │ Balloon            │ v flower      │ 1100   │
│ 3  │ Ghost Rule                   │ DECO*27            │ Hatsune Miku  │ 1050   │
└────┴──────────────────────────────┴────────────────────┴───────────────┴────────┘
```

## Desinstalação

```bash
# Se instalou com npm link
sudo npm unlink -g vocastats-tui

# Se instalou manualmente
sudo rm /usr/local/bin/vocastats
```

## Dados

Os dados são obtidos da API pública do [VocaDB](https://vocadb.net).

## Licença

MIT
