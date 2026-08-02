/* ==========================================================================
   Love.css — script.js
   --------------------------------------------------------------------------
   Toda la personalización de contenido / textos / usuario de Instagram /
   cantidad de pétalos y partículas vive en el objeto CONFIG de aquí abajo.
   No deberías necesitar tocar nada más para adaptar el proyecto.
   ========================================================================== */

const CONFIG = {
  // --- Textos ---
  brandName: "Love",
  brandSuffix: ".css",
  subtitle: "Ready to bloom?",
  buttonText: "Tap to bloom",
  finalMessage: "I coded this for you",

  // --- Instagram ---
  instagramUser: "tu_usuario",          // sin la @, solo el handle
  instagramUrl: "https://instagram.com/tu_usuario",

  // --- Rosa ---
  petalRings: [
    // Cada anillo: número de pétalos, radio (desde el centro), tamaño del pétalo, ángulo inicial
    { count: 3, radius: 8,  petalLength: 46, petalWidth: 30, angleOffset: 0,  gradient: "petalGradientInner" },
    { count: 5, radius: 14, petalLength: 62, petalWidth: 42, angleOffset: 36, gradient: "petalGradientInner" },
    { count: 8, radius: 20, petalLength: 82, petalWidth: 56, angleOffset: 18, gradient: "petalGradientOuter" },
  ],

  // --- Tiempos (ms). Cambia estos para acelerar/ralentizar el show. ---
  timing: {
    stemGrow: 1300,          // duración del crecimiento del tallo
    leafDelay: 500,          // cuándo aparecen las hojas tras iniciar el tallo
    bloomStartDelay: 1100,   // cuándo empieza a abrirse el primer pétalo
    petalStagger: 90,        // separación entre la aparición de cada pétalo
    finalTextDelay: 900,     // espera tras terminar el bloom antes del texto final
    igDelay: 700,            // espera entre el texto final y el bloque de Instagram
  },

  // --- Partículas ---
  particles: {
    countDuringBloom: 22,
    spawnIntervalMs: 220,
    minDuration: 4200,
    maxDuration: 7500,
  },
};

/* ==========================================================================
   Utilidades
   ========================================================================== */

const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ==========================================================================
   Aplicar textos de CONFIG al DOM
   ========================================================================== */

function applyConfigTexts() {
  document.querySelector(".brand-title").innerHTML =
    `${CONFIG.brandName}<span class="brand-dot">${CONFIG.brandSuffix}</span>`;
  document.querySelector(".brand-subtitle").textContent = CONFIG.subtitle;
  document.querySelector("#bloom-btn span").textContent = CONFIG.buttonText;
  document.querySelector(".final-line").textContent = CONFIG.finalMessage;

  const igLink = document.getElementById("ig-link");
  const igUsername = document.getElementById("ig-username");
  igLink.href = CONFIG.instagramUrl;
  igUsername.textContent = `@${CONFIG.instagramUser}`;
}

/* ==========================================================================
   Construcción del tallo + hojas
   ========================================================================== */

let stemPathEl = null;

function buildStem() {
  const stemGroup = document.getElementById("stem-group");
  stemGroup.innerHTML = "";

  // Tallo curvo desde la base (abajo) hasta la base de la flor
  const d = "M 200 600 C 195 480, 210 380, 200 260 C 195 230, 200 210, 200 190";
  const path = svgEl("path", {
    d,
    class: "stem-path",
  });
  stemGroup.appendChild(path);
  stemPathEl = path;

  // Hojas a lo largo del tallo
  const leafLeft = svgEl("path", {
    d: "M198 430 C 160 420, 130 445, 118 480 C 155 485, 190 470, 198 430 Z",
    class: "leaf-shape",
  });
  const leafRight = svgEl("path", {
    d: "M204 350 C 245 338, 278 358, 292 392 C 252 400, 214 388, 204 350 Z",
    class: "leaf-shape",
  });
  stemGroup.appendChild(leafLeft);
  stemGroup.appendChild(leafRight);

  return { leafLeft, leafRight };
}

function growStem() {
  if (!stemPathEl) return;
  const length = stemPathEl.getTotalLength();
  stemPathEl.style.strokeDasharray = `${length}`;
  stemPathEl.style.strokeDashoffset = `${length}`;
  // Forzar reflow antes de animar
  stemPathEl.getBoundingClientRect();
  stemPathEl.style.transition = `stroke-dashoffset ${CONFIG.timing.stemGrow}ms ease-out`;
  requestAnimationFrame(() => {
    stemPathEl.style.strokeDashoffset = "0";
  });
}

/* ==========================================================================
   Construcción de la flor (pétalos por anillos)
   ========================================================================== */

function petalPathD(radius, length, width) {
  // Pétalo tipo "gota" que nace en (0, -radius) [su punto de anclaje al centro
  // de la flor] y se extiende hacia afuera hasta (0, -radius - length).
  // Mantener el radio horneado en las coordenadas (en vez de usar un
  // transform="translate(...)" aparte) es necesario porque la animación CSS
  // de scale/rotate reemplaza por completo cualquier atributo transform SVG
  // del elemento — si el offset viviera ahí, se perdería al animar.
  const halfW = width / 2;
  const yBase = -radius;
  const yTip = -(radius + length);
  const yc1 = -(radius + length * 0.25);
  const yc2 = -(radius + length * 0.75);
  return `M 0 ${yBase}
          C ${halfW} ${yc1}, ${halfW * 0.9} ${yc2}, 0 ${yTip}
          C ${-halfW * 0.9} ${yc2}, ${-halfW} ${yc1}, 0 ${yBase} Z`;
}

function buildFlower() {
  const flowerGroup = document.getElementById("flower-group");
  flowerGroup.innerHTML = "";

  const allPetals = [];

  CONFIG.petalRings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (360 / ring.count) * i + ring.angleOffset;
      const g = svgEl("g", {
        transform: `rotate(${angle})`,
      });

      const petal = svgEl("path", {
        d: petalPathD(ring.radius, ring.petalLength, ring.petalWidth),
        fill: `url(#${ring.gradient})`,
        class: "petal",
      });

      // El origen de la animación (scale/rotate) debe quedar fijo en el punto
      // de anclaje del pétalo (su base, cerca del centro de la flor), no en
      // el centro de su propia caja — así "nace" desde el centro al abrirse.
      petal.style.transformOrigin = `0px ${-ring.radius}px`;

      // Ligera variación de rotación para que no se vea perfectamente simétrico
      const rotStart = -rand(4, 10) * (i % 2 === 0 ? 1 : -1);
      petal.style.setProperty("--rot-start", `${rotStart}deg`);
      petal.style.setProperty("--rot-end", "0deg");

      g.appendChild(petal);
      flowerGroup.appendChild(g);

      allPetals.push({ el: petal, ring: ringIndex });
    }
  });

  return allPetals;
}

/* ==========================================================================
   Partículas flotantes (pétalos pequeños)
   ========================================================================== */

let particleIntervalId = null;

function spawnParticle() {
  const layer = document.getElementById("particles-layer");
  const p = document.createElement("div");
  p.className = "petal-particle";

  const left = rand(10, 90);
  const size = rand(6, 13);
  const duration = rand(CONFIG.particles.minDuration, CONFIG.particles.maxDuration);
  const drift = rand(-80, 80);
  const rotate = rand(0, 360);

  p.style.left = `${left}%`;
  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.setProperty("--drift", `${drift}px`);
  p.style.animationDuration = `${duration}ms`;
  p.style.transform = `rotate(${rotate}deg)`;

  layer.appendChild(p);

  setTimeout(() => p.remove(), duration + 200);
}

function startParticles() {
  let spawned = 0;
  particleIntervalId = setInterval(() => {
    spawnParticle();
    spawned++;
    if (spawned >= CONFIG.particles.countDuringBloom) {
      clearInterval(particleIntervalId);
    }
  }, CONFIG.particles.spawnIntervalMs);
}

/* ==========================================================================
   Secuencia principal de florecimiento
   ========================================================================== */

function runBloomSequence() {
  document.body.classList.add("is-blooming");

  const { leafLeft, leafRight } = buildStem();
  const petals = buildFlower();

  // 1. Crecer el tallo
  growStem();

  // 2. Hojas
  setTimeout(() => leafLeft.classList.add("is-visible"), CONFIG.timing.leafDelay);
  setTimeout(() => leafRight.classList.add("is-visible"), CONFIG.timing.leafDelay + 200);

  // 3. Partículas empiezan a flotar
  setTimeout(startParticles, CONFIG.timing.leafDelay);

  // 4. Pétalos abriéndose, anillo interior primero
  const sorted = [...petals].sort((a, b) => a.ring - b.ring);
  sorted.forEach((p, i) => {
    const delay = CONFIG.timing.bloomStartDelay + i * CONFIG.timing.petalStagger;
    setTimeout(() => p.el.classList.add("is-visible"), delay);
  });

  const lastPetalDelay =
    CONFIG.timing.bloomStartDelay + sorted.length * CONFIG.timing.petalStagger;

  // 5. Compactar la rosa y mostrar el mensaje final
  setTimeout(() => {
    document.getElementById("rose-wrapper").classList.add("is-compact");
    document.body.classList.remove("is-blooming");
  }, lastPetalDelay + CONFIG.timing.finalTextDelay);

  setTimeout(() => {
    document.getElementById("final-text").classList.add("is-visible");
  }, lastPetalDelay + CONFIG.timing.finalTextDelay + 300);

  // 6. Bloque de Instagram
  setTimeout(() => {
    document.getElementById("ig-link").classList.add("is-visible");
  }, lastPetalDelay + CONFIG.timing.finalTextDelay + 300 + CONFIG.timing.igDelay);
}

/* ==========================================================================
   Inicio
   ========================================================================== */

function init() {
  applyConfigTexts();

  const startScreen = document.getElementById("screen-start");
  const bloomScreen = document.getElementById("screen-bloom");
  const btn = document.getElementById("bloom-btn");

  btn.addEventListener("click", () => {
    btn.disabled = true;
    startScreen.classList.add("is-leaving");

    setTimeout(() => {
      startScreen.hidden = true;
      bloomScreen.hidden = false;
      runBloomSequence();
    }, 480);
  });
}

document.addEventListener("DOMContentLoaded", init);
