# VocaStats TUI - Proposta

## Visao Geral

TUI (Terminal User Interface) para acompanhar rankings e estatisticas de musicas Vocaloid em tempo real, com foco em Hatsune Miku e outros personagens populares.

## Problema

Acompanhar o que esta em alta no mundo Vocaloid requer navegar em multiplos sites (VocaDB, Niconico, YouTube). Uma ferramenta CLI centraliza essas informacoes para quem vive no terminal.

## Solucao

Uma TUI leve que consome a API publica do VocaDB e apresenta rankings de forma visual e interativa.

---

## Funcionalidades

### MVP (v1.0)

- [x] Top musicas da semana (ultimos 7 dias)
- [x] Filtro por Vocaloid (Miku, Rin, Len, Luka, GUMI, Kaai Yuki, etc.)
- [x] Busca por nome de musica
- [x] Busca por produtor
- [x] Filtro por genero musical (Rock, Pop, EDM, etc.)
- [x] Abrir link do YouTube/Niconico no navegador
- [x] Cache local para requests frequentes (TTL 5min)
- [x] Modo "descoberta" - musicas aleatorias bem avaliadas
- [x] Buscar musica no Spotify (abre open.spotify.com/search)

### Futuro (v2.0)

- [ ] Historico de rankings (comparar semanas)
- [ ] Notificacoes de novas musicas de produtores favoritos
- [ ] Adicionar musicas a playlist do Spotify
- [ ] Export para markdown/JSON

---

## Stack Tecnica

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Runtime | Node.js 18+ | fetch nativo, ESM |
| UI | chalk, cli-table3 | Consistencia com PortWatcher |
| Interacao | @inquirer/prompts | Menus e inputs |
| Spinners | ora | Feedback visual |
| API | VocaDB REST | Publica, sem auth |

## API - VocaDB

Base URL: `https://vocadb.net/api`

### Endpoints Utilizados

```
GET /songs/top-rated
  ?durationHours=168        # Ultimos 7 dias
  &filterBy=PublishDate
  &fields=Artists,ThumbUrl,PVs
  &maxResults=25

GET /songs
  ?artistId={id}            # Filtro por Vocaloid/Produtor
  &sort=RatingScore
  &onlyWithPvs=true
  &maxResults=25

GET /songs
  ?query={termo}            # Busca por nome de musica
  &sort=RatingScore
  &maxResults=25

GET /songs
  ?tagId={id}               # Filtro por genero
  &sort=RatingScore
  &maxResults=25

GET /artists
  ?query={termo}            # Busca por produtor
  &artistTypes=Producer
  &sort=FollowerCount
  &maxResults=10
```

### IDs dos Vocaloids

| Nome | ID |
|------|-----|
| Hatsune Miku | 1 |
| Kagamine Rin | 2 |
| Kagamine Len | 3 |
| Megurine Luka | 4 |
| KAITO | 5 |
| MEIKO | 6 |
| GUMI | 3 |
| IA | 127 |
| Kasane Teto | 17 |
| Kaai Yuki | 191 |

### IDs dos Generos

| Nome | ID |
|------|-----|
| Rock | 481 |
| Pop | 341 |
| Ballad | 29 |
| EDM | 1552 |
| Technopop | 1698 |
| Metal | 262 |
| Electronica | 1580 |
| Electropop | 124 |
| J-Pop | 1654 |
| J-Rock | 4933 |
| Jazz | 467 |
| Folk | 159 |
| Classical | 2794 |
| Chiptune | 62 |
| Trance | 435 |

---

## Estrutura do Projeto

```
vocastats-tui/
├── index.js          # Entry point, menu principal
├── package.json
├── .gitignore
├── proposal.md       # Este arquivo
└── src/
    ├── api.js        # Cliente VocaDB (com cache)
    ├── cache.js      # Sistema de cache em memoria (TTL)
    ├── spotify.js    # Integracao Spotify (OAuth PKCE)
    └── ui.js         # Componentes visuais (header, tabelas)
```

---

## UI/UX

### Paleta de Cores

- **Primary**: `#39C5BB` (Miku teal)
- **Secondary**: `#E12885` (Magenta)
- **Accent**: `#FFE495` (Amarelo)
- **Muted**: `#666666`

### Layout da Tabela

```
┌────┬──────────────────────────────┬────────────────────┬───────────────┬────────┐
│ #  │ TITULO                       │ PRODUTOR           │ VOCALOID      │ RATING │
├────┼──────────────────────────────┼────────────────────┼───────────────┼────────┤
│ 1  │ Hibana                       │ DECO*27            │ Hatsune Miku  │ 1234   │
│ 2  │ Charles                      │ Balloon            │ v flower      │ 1100   │
│ 3  │ Ghost Rule                   │ DECO*27            │ Hatsune Miku  │ 1050   │
└────┴──────────────────────────────┴────────────────────┴───────────────┴────────┘
```

---

## Proximos Passos

1. **Testes** - Adicionar testes basicos para o cliente API
2. **README** - Documentacao completa para usuarios
3. **Historico** - Implementar comparacao de rankings entre semanas
4. **Notificacoes** - Sistema de alertas para novos lancamentos

---

## Referencias

- [VocaDB API Docs](https://vocadb.net/swagger/ui/index)
- [VocaDB](https://vocadb.net)
- [Vocaloid Wiki](https://vocaloid.fandom.com)
