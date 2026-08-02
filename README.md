# Love.css 🌹

Recreación web del efecto "rosa que florece al tocar un botón", inspirado en
el video de referencia. Hecho solo con HTML + CSS + JS (sin librerías
externas ni conexión a internet).

## Cómo ejecutarlo en localhost

No necesitas instalar nada. Solo hace falta servir la carpeta con cualquier
servidor estático (abrir `index.html` con doble clic también funciona en la
mayoría de navegadores, pero se recomienda un servidor local para evitar
restricciones del navegador con módulos/recursos).

**Opción 1 — Python (ya viene instalado en Mac/Linux):**
```bash
cd love-css
python3 -m http.server 8080
```
Luego abre: http://localhost:8080

**Opción 2 — Node (si tienes `npx` instalado):**
```bash
cd love-css
npx serve .
```

**Opción 3 — Extensión "Live Server" de VS Code:**
Clic derecho sobre `index.html` → "Open with Live Server".

## Estructura del proyecto

```
love-css/
├── index.html          # Estructura de las 2 pantallas (tarjeta + florecimiento)
├── style.css            # Estilos, variables de color/tiempo, animaciones CSS
├── script.js             # Lógica: genera la rosa en SVG y controla la secuencia
├── assets/
│   ├── icons/
│   │   └── favicon.svg   # Icono de pestaña del navegador
│   └── fonts/            # (vacío) — aquí puedes añadir tus propias fuentes .woff2
└── README.md
```

## Cómo personalizar

Casi todo lo editable vive en dos sitios:

### 1. Textos, usuario de Instagram y tiempos → `script.js`

Al principio del archivo hay un objeto `CONFIG`:

```js
const CONFIG = {
  brandName: "Love",
  brandSuffix: ".css",
  subtitle: "Ready to bloom?",
  buttonText: "Tap to bloom",
  finalMessage: "I coded this for you",

  instagramUser: "tu_usuario",
  instagramUrl: "https://instagram.com/tu_usuario",

  petalRings: [ ... ],   // cuántos pétalos, tamaño y radio por anillo

  timing: {
    stemGrow: 1300,        // ms que tarda en crecer el tallo
    leafDelay: 500,
    bloomStartDelay: 1100, // cuándo empieza a abrirse el primer pétalo
    petalStagger: 90,      // separación entre pétalos al abrirse
    finalTextDelay: 900,
    igDelay: 700,
  },

  particles: {
    countDuringBloom: 22,
    spawnIntervalMs: 220,
    minDuration: 4200,
    maxDuration: 7500,
  },
};
```

Cambia esos valores y recarga la página — no hace falta tocar el resto del
código.

### 2. Colores, tipografías y glow → `style.css`

Al principio del archivo, dentro de `:root`:

```css
:root {
  --bg-color: #060305;
  --glow-red: #ff2d4d;
  --accent: #ff2d4d;
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: -apple-system, "Segoe UI", sans-serif;
  --glow-size: min(140vw, 900px);
  ...
}
```

### 3. Forma de la rosa

`petalRings` en `CONFIG` controla cuántos anillos de pétalos tiene la flor,
cuántos pétalos por anillo, su tamaño y separación angular. Añadir un anillo
extra (por ejemplo, uno muy exterior con pétalos grandes) hace la rosa más
"llena".

## Notas técnicas

- La rosa se dibuja 100% en SVG generado dinámicamente por JS (tallo con
  `stroke-dashoffset` para el efecto de "crecer", pétalos como paths con
  gradientes radiales).
- Las partículas flotantes son simples `<div>` con `border-radius` y una
  animación `@keyframes floatUp`.
- Todo es responsive: pensado primero para pantallas verticales (móvil) y se
  adapta automáticamente en pantallas anchas (`@media (min-width: 700px)`).
- Se respeta `prefers-reduced-motion` por accesibilidad.
- Sin dependencias externas: funciona completamente offline.
