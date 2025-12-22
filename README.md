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

## Instalacao

### Via npm (recomendado)

```bash
npm install -g vocastats-tui
```

### Via npx (sem instalacao)

```bash
npx vocastats-tui
```

### Atualizacao

```bash
npm update -g vocastats-tui
```

### Desenvolvimento

```bash
git clone https://github.com/mateusflorez/vocastats-tui.git
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

## Desinstalacao

```bash
npm uninstall -g vocastats-tui
```

## Dados

Os dados são obtidos da API pública do [VocaDB](https://vocadb.net).

## Licença

MIT
