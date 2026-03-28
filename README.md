# 🖥️ Portfolio — Tristan Reig

Portfolio personnel développé avec **Astro**, **React** et **Three.js**, déployé sur GitHub Pages. Design inspiré des interfaces terminal avec une esthétique cyberpunk/hacker.

---

## ✨ Fonctionnalités

- **Hero animé** — terminal interactif avec effet de frappe, fond de particules 3D (Three.js / React Three Fiber) et animation glitch CSS
- **Galerie de projets** — filtrage par catégorie, modales détaillées avec démo intégrée
- **Démos interactives** :
  - 🖥️ Terminal live (minishell via WebSocket)
  - 🧩 Démos de conteneurs C++ avec rendu ligne par ligne animé
  - 🎮 Visionneuses WebAssembly (scop, ft_vox)
  - 🖼️ Galerie de screenshots avec navigation
  - 📄 Explorateur de code source (syntax highlighting via API GitHub)
- **Formulaire de contact** — envoi d'e-mails via EmailJS
- **Scanlines & ambient glow** — effets visuels CSS pour l'atmosphère

---

## 🛠️ Stack technique

| Catégorie     | Technologie                                      |
|---------------|--------------------------------------------------|
| Framework     | [Astro](https://astro.build)                     |
| UI            | React 18 + TypeScript                            |
| Styles        | Tailwind CSS v4                                  |
| 3D            | Three.js + React Three Fiber                     |
| Terminal      | xterm.js                                         |
| Highlighting  | react-syntax-highlighter (vscDarkPlus)           |
| E-mails       | EmailJS                                          |
| Fonts         | Syne (display) + JetBrains Mono                  |

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── Hero.tsx               # Section d'accueil avec terminal animé
│   ├── HeroBackground.tsx     # Fond de particules Three.js
│   ├── ProjectGallery.tsx     # Grille + modale de projets
│   ├── ProjectCodeViewer.tsx  # Explorateur de code via API
│   ├── ScreenshotGallery.tsx  # Carrousel de screenshots
│   ├── WasmDemo.tsx           # Lecteur de démos WebAssembly
│   ├── FtContainersDemo.tsx   # Démo animée ft_containers
│   ├── MinishellDemo.tsx      # Terminal live (xterm.js + WebSocket)
│   └── ContactForm.tsx        # Formulaire EmailJS
├── layouts/
│   └── BaseLayout.astro       # Layout global (meta, fonts, scripts)
├── pages/
│   └── index.astro            # Page principale
├── data/
│   └── projects.json          # Données des projets
└── styles/
    └── global.css             # Thème Tailwind v4, animations, variables CSS
```

---

## 🚀 Lancer le projet en local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

> **Note :** La démo minishell nécessite un serveur WebSocket séparé (`PUBLIC_MINISHELL_WS_URL`).  
> Les démos WebAssembly (scop, ft_vox) nécessitent les fichiers `.wasm` / `.js` compilés dans `public/`.

---

## ⚙️ Variables d'environnement

| Variable                    | Description                              |
|-----------------------------|------------------------------------------|
| `PUBLIC_MINISHELL_WS_URL`   | URL du serveur WebSocket pour minishell  |

---

## 📦 Projets présentés

| Projet          | Catégorie  | Technos principales             |
|-----------------|------------|---------------------------------|
| Singlefind      | Web        | Python, Flask, SQL, Bootstrap   |
| Weathercast     | Logiciel   | Electron, JavaScript            |
| Score-Tracker   | Web        | React, Express, APIs REST       |
| minishell       | Système    | C, UNIX, Signaux                |
| ft_containers   | Logiciel   | C++, STL réimplémentée          |
| scop            | Graphisme  | C, OpenGL, GLSL                 |
| ft_vox          | Graphisme  | C++, OpenGL, Perlin Noise       |
| ft_minecraft    | Graphisme  | Java, OpenGL, GLSL (WIP)        |
