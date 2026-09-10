const products = {
  8: [
    { name: "Jamun Shot", note: "Deep, juicy and unapologetically purple.", image: "sipzy-jamun-shot-8pct-275ml.webp" },
    { name: "Mango Mood", note: "Tropical sunshine with a party pulse.", image: "sipzy-mango-mood-8pct-275ml.webp" },
    { name: "Watermelon Wave", note: "Fresh, bright and built for long nights.", image: "sipzy-watermelon-wave-8pct-275ml.webp" },
    { name: "Orange Voltage", note: "Citrus energy with a lively snap.", image: "sipzy-orange-voltage-8pct-275ml.webp" },
    { name: "Cranberry Affair", note: "Tart, bold and a little dramatic.", image: "sipzy-cranberry-affair-8pct-275ml.webp" },
    { name: "Mojito Drift", note: "Mint-lime cool with an easy finish.", image: "sipzy-mojito-drift-8pct-275ml.webp" },
    { name: "Lemonade Twist", note: "Zesty, crisp and instantly refreshing.", image: "sipzy-lemonade-twist-8pct-275ml.webp" }
  ],
  16: [
    { name: "Jamun Cask", note: "A deeper jamun pour with vintage character.", image: "sipzy-jamun-cask-16pct-330ml.webp" },
    { name: "Mango Mirage", note: "Rich tropical warmth, turned all the way up.", image: "sipzy-mango-mirage-16pct-330ml.webp" },
    { name: "Orange Oak", note: "Bright citrus dressed in a bolder mood.", image: "sipzy-orange-oak-16pct-330ml.webp" },
    { name: "Cranberry Cellar", note: "Dark berry depth with a refined edge.", image: "sipzy-cranberry-cellar-16pct-330ml.webp" },
    { name: "Mojito Heritage", note: "Cool mint and lime in a fuller expression.", image: "sipzy-mojito-heritage-16pct-330ml.webp" }
  ]
};

const hero = document.querySelector(".hero-scroll");
const sticky = document.querySelector(".hero-sticky");
const spacer = document.querySelector("[data-scrub-spacer]");
const firstCover = document.querySelector(".section-cover");
const video = document.querySelector("[data-scroll-video]");
const mobileQuery = window.matchMedia("(max-width: 640px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const progressBar = document.querySelector("[data-progress]");
const stages = [...document.querySelectorAll("[data-stage]")];
const header = document.querySelector("[data-header]");
const videoSources = {
  mobile: "assets/video/sipzy-scroll-hero-mobile.mp4",
  desktop: "assets/video/sipzy-scroll-hero-web.mp4"
};

let duration = 12;
let targetTime = 0;
let activeStage = 0;
let ticking = false;
let seeking = false;
let seekStarted = 0;

function activeSource() {
  return mobileQuery.matches ? videoSources.mobile : videoSources.desktop;
}

function applyVideoSource() {
  const next = new URL(activeSource(), window.location.href).href;
  if (video.currentSrc === next || video.src === next) return;
  if (!video.currentSrc && !video.src) return;
  video.src = next;
  video.load();
}

function syncDuration() {
  if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
}

function paintHeroFrame() {
  syncDuration();
  video.pause();
  seeking = false;
  if (video.readyState >= 2) video.currentTime = targetTime;
}

video.addEventListener("loadedmetadata", paintHeroFrame);
video.addEventListener("loadeddata", paintHeroFrame);
video.addEventListener("canplay", paintHeroFrame);

video.addEventListener("seeked", () => {
  seeking = false;
});

function scrubDistance() {
  return Math.max(1, sticky.offsetHeight + spacer.offsetHeight - window.innerHeight);
}

function heroProgress() {
  return Math.min(1, Math.max(0, (window.scrollY - hero.offsetTop) / scrubDistance()));
}

function stageFromProgress(progress) {
  if (progress < 0.24) return 0;
  if (progress < 0.5) return 1;
  if (progress < 0.76) return 2;
  return 3;
}

function updatePageState() {
  syncDuration();
  const progress = heroProgress();
  targetTime = progress * duration;
  progressBar.style.transform = `scaleX(${progress})`;

  const nextStage = stageFromProgress(progress);
  if (nextStage !== activeStage) {
    stages[activeStage]?.classList.remove("is-active");
    stages[nextStage]?.classList.add("is-active");
    activeStage = nextStage;
  }

  header.classList.toggle(
    "is-scrolled",
    window.scrollY > hero.offsetTop + sticky.offsetHeight + spacer.offsetHeight - window.innerHeight * 0.6
  );

  const coverTop = firstCover.getBoundingClientRect().top;
  const stickyBottom = sticky.getBoundingClientRect().bottom;
  hero.classList.toggle(
    "is-covered",
    !reduceMotion.matches && coverTop < window.innerHeight * 0.98 && stickyBottom > 0
  );
  ticking = false;
}

function bufferedEnd() {
  if (!video.buffered.length) return 0;
  return video.buffered.end(video.buffered.length - 1);
}

function scrubVideo() {
  if (seeking && performance.now() - seekStarted > 90) seeking = false;
  if (video.readyState >= 2 && !seeking) {
    const maxTime = Math.min(targetTime, Math.max(0, bufferedEnd() - 0.04));
    const delta = maxTime - video.currentTime;
    if (Math.abs(delta) > 0.02) {
      seeking = true;
      seekStarted = performance.now();
      video.currentTime = Math.abs(delta) > 0.08 ? maxTime : video.currentTime + delta * 0.5;
    }
  }
  requestAnimationFrame(scrubVideo);
}

function onBreakpointChange() {
  applyVideoSource();
  updatePageState();
}

mobileQuery.addEventListener("change", onBreakpointChange);

window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updatePageState);
  }
}, { passive: true });
window.addEventListener("resize", () => {
  applyVideoSource();
  updatePageState();
});

const unlockVideo = () => {
  video.play().then(() => video.pause()).catch(() => {});
};
window.addEventListener("pointerdown", unlockVideo, { once: true, passive: true });
window.addEventListener("touchstart", unlockVideo, { once: true, passive: true });

applyVideoSource();
updatePageState();
scrubVideo();

const rail = document.querySelector("[data-product-rail]");
const rangeSection = document.querySelector(".range-section");
const rangeIntro = document.querySelector("[data-range-intro]");
const rangeCount = document.querySelector("[data-range-count]");
const rangeButtons = [...document.querySelectorAll("[data-range]")];

function prefersReducedMotion() {
  return reduceMotion.matches;
}

const productCardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-in");
      productCardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8%" });

function observeProductCards() {
  rail.querySelectorAll(".product-card").forEach((card, index) => {
    card.style.setProperty("--delay", `${index * 70}ms`);
    if (prefersReducedMotion()) {
      card.classList.add("is-in");
      return;
    }
    productCardObserver.observe(card);
  });
}

function paintProducts(range) {
  rail.querySelectorAll(".product-card").forEach(card => productCardObserver.unobserve(card));
  const size = range === "8" ? "275 ml" : "330 ml";
  rail.innerHTML = products[range].map((product, index) => `
    <article class="product-card" data-index="${String(index + 1).padStart(2, "0")}">
      <img src="assets/products-webp/${range}/${product.image}" alt="Sipzy ${product.name} ${range}% bottle" loading="lazy">
      <div class="product-card-content">
        <small>${range}% ABV · ${size}</small>
        <h3>${product.name}</h3>
        <p>${product.note}</p>
      </div>
    </article>
  `).join("");

  const isBold = range === "16";
  rangeSection.classList.toggle("is-bold", isBold);
  rangeIntro.textContent = isBold
    ? "Five deeper expressions in the taller 330 ml bottle—made for after-dark energy."
    : "Seven bright flavours in the compact 275 ml bottle—made for the easy drift.";
  rangeCount.textContent = isBold ? "01—05" : "01—07";
  rail.scrollTo({ left: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function renderProducts(range, { swap = false } = {}) {
  const reveal = () => {
    requestAnimationFrame(() => observeProductCards());
  };

  if (!swap || prefersReducedMotion() || !rail.innerHTML.trim()) {
    paintProducts(range);
    reveal();
    return;
  }

  let swapped = false;
  const finish = (event) => {
    if (event && event.target !== rail) return;
    if (swapped) return;
    swapped = true;
    rail.removeEventListener("transitionend", finish);
    paintProducts(range);
    requestAnimationFrame(() => {
      rail.classList.remove("is-swapping");
      observeProductCards();
    });
  };

  rail.classList.add("is-swapping");
  rail.addEventListener("transitionend", finish);
  window.setTimeout(() => finish(), 320);
}

rangeButtons.forEach(button => {
  button.addEventListener("click", () => {
    rangeButtons.forEach(item => item.classList.toggle("is-active", item === button));
    renderProducts(button.dataset.range, { swap: true });
  });
});

renderProducts("16");

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: "0px 0px -5%" });

document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

const duo = document.querySelector("[data-duo]");
if (duo) {
  const duoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, { threshold: 0.18 });
  duoObserver.observe(duo);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/* —— Find your Sipzy: flavour gravity field —— */
(() => {
  const section = document.querySelector("[data-find-sipzy]");
  if (!section) return;

  const flavours = [
    {
      id: "cranberry",
      name: "Cranberry Affair",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#ff404c",
      fruit: "assets/fruits/cranberry.png",
      bottle: "assets/bottles/01-cranberry-affair-8pct-275ml.png",
      wordmark: "Cranberry",
      angle: -90
    },
    {
      id: "jamun",
      name: "Jamun Shot",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#7f31f3",
      fruit: "assets/fruits/Group 2.png",
      bottle: "assets/bottles/02-jamun-shot-8pct-275ml.png",
      wordmark: "Jamun",
      angle: -38
    },
    {
      id: "mango",
      name: "Mango Mood",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#ff7a18",
      fruit: "assets/fruits/mango.png",
      bottle: "assets/bottles/03-mango-mood-8pct-275ml.png",
      wordmark: "Mango",
      angle: 14
    },
    {
      id: "orange",
      name: "Orange Voltage",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#ff9a2e",
      fruit: "assets/fruits/orange.png",
      bottle: "assets/bottles/04-orange-voltage-8pct-275ml.png",
      wordmark: "Orange",
      angle: 66
    },
    {
      id: "mojito",
      name: "Mojito Drift",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#b7ed37",
      fruit: "assets/fruits/mojito drift.png",
      bottle: "assets/bottles/05-mojito-drift-8pct-275ml.png",
      wordmark: "Mojito",
      angle: 118
    },
    {
      id: "lemonade",
      name: "Lemonade Twist",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#f6d94d",
      fruit: "assets/fruits/lemonade twist.png",
      bottle: "assets/bottles/06-lemonade-twist-8pct-275ml.png",
      wordmark: "Lemonade",
      angle: 170
    },
    {
      id: "watermelon",
      name: "Watermelon Wave",
      abv: "8% ABV",
      size: "275 ML",
      meta: "8% ABV · 275 ML",
      accent: "#ff3e8b",
      fruit: "assets/fruits/watermelon.png",
      bottle: "assets/bottles/07-watermelon-wave-8pct-275ml.png",
      wordmark: "Watermelon",
      angle: 222
    }
  ];

  const field = section.querySelector("[data-find-field]");
  const fruitsRoot = section.querySelector("[data-find-fruits]");
  const bottleEl = section.querySelector("[data-find-bottle]");
  const bottleImg = section.querySelector("[data-find-bottle-img]");
  const ripple = section.querySelector("[data-find-ripple]");
  const hoverLabel = section.querySelector("[data-find-hover-label]");
  const hoverName = section.querySelector("[data-find-hover-name]");
  const hoverMeta = section.querySelector("[data-find-hover-meta]");
  const detail = section.querySelector("[data-find-detail]");
  const detailName = section.querySelector("[data-find-detail-name]");
  const detailAbv = section.querySelector("[data-find-detail-abv]");
  const detailSize = section.querySelector("[data-find-detail-size]");
  const stage = section.querySelector("[data-find-stage]");
  const nav = section.querySelector("[data-find-nav]");
  const prevBtn = section.querySelector("[data-find-prev]");
  const nextBtn = section.querySelector("[data-find-next]");
  const fallback = section.querySelector("[data-find-fallback]");

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const narrowQuery = window.matchMedia("(max-width: 900px)");

  let nodes = [];
  let selectedId = null;
  let hoveredId = null;
  let inView = false;
  let rafId = 0;
  let transitioning = false;
  let collisionUntil = 0;
  let pointer = { x: 0, y: 0, active: false };
  let center = { x: 0, y: 0 };
  let radius = 180;
  let touchStartX = 0;
  let preloaded = new Set();

  function isReduced() {
    return reduceMotion.matches;
  }

  function isMobileLike() {
    return narrowQuery.matches || !finePointer.matches;
  }

  function flavourById(id) {
    return flavours.find(item => item.id === id);
  }

  function flavourIndex(id) {
    return flavours.findIndex(item => item.id === id);
  }

  function preloadBottle(src) {
    if (!src || preloaded.has(src)) return;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    preloaded.add(src);
  }

  let selectedFruit = { x: -132, y: 42, scale: 1.08 };

  function measure() {
    const rect = field.getBoundingClientRect();
    center = { x: rect.width / 2, y: rect.height / 2 };
    const fruitHalf = (nodes[0]?.el.offsetWidth || 96) / 2;
    const labelPad = 28;
    const inset = fruitHalf + labelPad;
    radius = Math.max(72, Math.min(rect.width, rect.height) / 2 - inset);
    field.style.setProperty("--orbit", `${radius * 2}px`);
    selectedFruit = isMobileLike()
      ? { x: -Math.min(108, rect.width * 0.28), y: 36, scale: 1.08 }
      : { x: -132, y: 42, scale: 1.08 };
  }

  function buildFruits() {
    nodes = flavours.map((flavour, index) => {
      const el = fruitsRoot.querySelector(`[data-flavour="${flavour.id}"]`);
      const phase = index * 0.87;
      return {
        flavour,
        el,
        homeAngle: (flavour.angle * Math.PI) / 180,
        phase,
        floatAmp: 8 + (index % 3) * 3,
        rotAmp: 4 + (index % 4),
        scaleBase: 1,
        depth: 0.9,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        blur: 0,
        opacity: 1,
        gx: 0,
        gy: 0
      };
    }).filter(node => node.el);
  }

  function setHoverLabel(flavour, visible) {
    if (!flavour || isMobileLike()) {
      hoverLabel.classList.remove("is-visible");
      hoverLabel.setAttribute("aria-hidden", "true");
      return;
    }
    if (visible) {
      hoverName.textContent = flavour.name.toUpperCase();
      hoverMeta.textContent = flavour.meta;
      hoverLabel.classList.add("is-visible");
      hoverLabel.setAttribute("aria-hidden", "false");
    } else {
      hoverLabel.classList.remove("is-visible");
      hoverLabel.setAttribute("aria-hidden", "true");
    }
  }

  function showDetail(flavour) {
    detailName.textContent = flavour.name.toUpperCase();
    detailAbv.textContent = flavour.abv;
    detailSize.textContent = flavour.size;
    detail.classList.remove("is-visible");
    // Retrigger text reveal
    void detail.offsetWidth;
    detail.classList.add("is-visible");
  }

  function hideDetail() {
    detail.classList.remove("is-visible");
  }

  function setControls() {
    nav.hidden = !selectedId;
  }

  function applyNodeTransform(node) {
    const { el, x, y, scale, rotate, blur, opacity } = node;
    el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) rotate(${rotate}deg)`;
    el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
    el.style.opacity = String(opacity);
  }

  function homePosition(node, t) {
    const floatX = Math.sin(t * 0.55 + node.phase) * node.floatAmp;
    const floatY = Math.cos(t * 0.42 + node.phase * 1.3) * (node.floatAmp * 0.85);
    const angle = node.homeAngle + Math.sin(t * 0.18 + node.phase) * 0.08;
    const r = radius * (0.98 + Math.sin(t * 0.25 + node.phase) * 0.025);
    return {
      x: Math.cos(angle) * r + floatX,
      y: Math.sin(angle) * r + floatY,
      rotate: Math.sin(t * 0.35 + node.phase) * node.rotAmp,
      scale: node.scaleBase
    };
  }

  function updateIdlePhysics(now) {
    const t = now / 1000;
    const px = pointer.x - center.x;
    const py = pointer.y - center.y;
    const useGravity = pointer.active && !isMobileLike() && !selectedId;
    const damp = 0.14;

    nodes.forEach(node => {
      if (selectedId && node.flavour.id === selectedId) return;

      const home = homePosition(node, t);
      const isHovered = hoveredId && !selectedId && node.flavour.id === hoveredId;
      let targetX = home.x;
      let targetY = home.y;
      let targetScale = home.scale;
      let targetRotate = home.rotate;
      let targetBlur = 0;
      let targetOpacity = 1;

      if (useGravity && !isHovered) {
        const dx = px - home.x;
        const dy = py - home.y;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, 1 - dist / (radius * 1.85));
        const pull = influence * influence * 22;
        const near = dist < 70 ? -0.28 : 1;
        node.gx += (dx / dist) * pull * near * 0.07;
        node.gy += (dy / dist) * pull * near * 0.07;
        node.gx *= 0.88;
        node.gy *= 0.88;
        targetX += node.gx;
        targetY += node.gy;
        targetScale += influence * 0.05;
      } else {
        node.gx *= 0.82;
        node.gy *= 0.82;
        if (!isHovered) {
          targetX += node.gx;
          targetY += node.gy;
        }
      }

      if (hoveredId && !selectedId) {
        if (isHovered) {
          targetX = home.x * 0.9;
          targetY = home.y * 0.9;
          targetScale = 1.12;
          targetBlur = 0;
          targetOpacity = 1;
          targetRotate *= 0.45;
          node.el.classList.add("is-hovered");
          node.el.classList.remove("is-dimmed");
        } else {
          targetX *= 1.08;
          targetY *= 1.08;
          targetScale *= 0.92;
          targetBlur = 0.8;
          targetOpacity = 0.55;
          node.el.classList.add("is-dimmed");
          node.el.classList.remove("is-hovered");
        }
      } else {
        node.el.classList.remove("is-hovered", "is-dimmed");
      }

      if (selectedId && node.flavour.id !== selectedId) {
        targetX *= 1.12;
        targetY *= 1.12;
        targetScale *= 0.62;
        targetBlur = 3.5;
        targetOpacity = 0.14;
        node.el.classList.add("is-pushed");
      } else if (!selectedId) {
        node.el.classList.remove("is-pushed");
      }

      node.x += (targetX - node.x) * damp;
      node.y += (targetY - node.y) * damp;
      node.scale += (targetScale - node.scale) * damp;
      node.rotate += (targetRotate - node.rotate) * damp;
      node.blur += (targetBlur - node.blur) * damp;
      node.opacity += (targetOpacity - node.opacity) * damp;
      applyNodeTransform(node);
    });
  }

  function placeSelectedFruit(node, t, now) {
    if (now < collisionUntil) {
      const progress = Math.min(1, Math.max(0, 1 - (collisionUntil - now) / 520));
      const ease = 1 - Math.pow(1 - progress, 3);
      node.x += (0 - node.x) * (0.16 + ease * 0.2);
      node.y += (0 - node.y) * (0.16 + ease * 0.2);
      node.scale = 1.18 + Math.sin(ease * Math.PI) * 0.22;
      node.rotate += (0 - node.rotate) * 0.15;
      node.blur = 0;
      node.opacity = 1;
      applyNodeTransform(node);
      return;
    }
    const targetX = selectedFruit.x + Math.sin(t * 0.5) * 3;
    const targetY = selectedFruit.y + Math.cos(t * 0.4) * 4;
    node.x += (targetX - node.x) * 0.12;
    node.y += (targetY - node.y) * 0.12;
    node.scale += (selectedFruit.scale - node.scale) * 0.12;
    node.rotate = Math.sin(t * 0.3) * 3;
    node.blur = 0;
    node.opacity = 1;
    applyNodeTransform(node);
  }

  function tick(now) {
    if (!inView || isReduced()) {
      rafId = 0;
      return;
    }
    updateIdlePhysics(now);
    if (selectedId) {
      const active = nodes.find(n => n.flavour.id === selectedId);
      if (active) placeSelectedFruit(active, now / 1000, now);
    }
    rafId = requestAnimationFrame(tick);
  }

  function ensureLoop() {
    if (!rafId && inView && !isReduced()) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function snapStaticLayout() {
    nodes.forEach(node => {
      const home = homePosition(node, 0);
      if (selectedId === node.flavour.id) {
        node.x = selectedFruit.x;
        node.y = selectedFruit.y;
        node.scale = selectedFruit.scale;
        node.rotate = 0;
        node.opacity = 1;
        node.blur = 0;
      } else if (selectedId) {
        node.x = home.x * 1.12;
        node.y = home.y * 1.12;
        node.scale = home.scale * 0.62;
        node.opacity = 0.14;
        node.blur = 3.5;
      } else {
        node.x = home.x;
        node.y = home.y;
        node.scale = home.scale;
        node.rotate = 0;
        node.opacity = 1;
        node.blur = 0;
      }
      applyNodeTransform(node);
    });
  }

  function burstRipple(accent) {
    ripple.classList.remove("is-burst");
    ripple.style.borderColor = accent;
    void ripple.offsetWidth;
    ripple.classList.add("is-burst");
  }

  function selectFlavour(id, { fromSwap = false } = {}) {
    const flavour = flavourById(id);
    if (!flavour || transitioning) return;
    if (selectedId === id && !fromSwap) return;

    transitioning = true;
    hoveredId = null;
    setHoverLabel(null, false);
    field.classList.add("is-selected");
    requestAnimationFrame(() => measure());

    const previousId = selectedId;
    const activeNode = nodes.find(n => n.flavour.id === id);
    preloadBottle(flavour.bottle);

    if (previousId && previousId !== id) {
      bottleEl.classList.add("is-exiting");
      bottleEl.classList.remove("is-visible");
    }

    nodes.forEach(node => {
      node.el.classList.toggle("is-active", node.flavour.id === id);
      node.el.setAttribute("aria-pressed", node.flavour.id === id ? "true" : "false");
    });

    const runEnter = () => {
      selectedId = id;
      setControls();
      burstRipple(flavour.accent);
      collisionUntil = performance.now() + 520;

      if (activeNode && !isReduced()) {
        activeNode.scale = 1.38;
        applyNodeTransform(activeNode);
      }

      bottleImg.src = flavour.bottle;
      bottleImg.alt = `Sipzy ${flavour.name} ${flavour.abv} bottle`;
      bottleEl.setAttribute("aria-hidden", "false");
      bottleEl.classList.remove("is-exiting");

      requestAnimationFrame(() => {
        bottleEl.classList.add("is-visible");
        showDetail(flavour);
        if (isReduced()) snapStaticLayout();
        window.setTimeout(() => {
          transitioning = false;
        }, fromSwap ? 420 : 700);
      });
    };

    if (previousId && previousId !== id && !isReduced()) {
      window.setTimeout(runEnter, 180);
    } else {
      runEnter();
    }

    ensureLoop();
  }

  function resetField() {
    if (transitioning && selectedId) return;
    selectedId = null;
    hoveredId = null;
    transitioning = false;
    field.classList.remove("is-selected");
    requestAnimationFrame(() => measure());
    bottleEl.classList.remove("is-visible", "is-exiting");
    bottleEl.setAttribute("aria-hidden", "true");
    hideDetail();
    setHoverLabel(null, false);
    setControls();
    nodes.forEach(node => {
      node.el.classList.remove("is-active", "is-hovered", "is-dimmed", "is-pushed");
      node.el.setAttribute("aria-pressed", "false");
    });
    if (isReduced()) snapStaticLayout();
    ensureLoop();
  }

  function stepFlavour(delta) {
    if (!selectedId) return;
    const index = flavourIndex(selectedId);
    const next = flavours[(index + delta + flavours.length) % flavours.length];
    selectFlavour(next.id, { fromSwap: true });
  }

  function onPointerMove(event) {
    if (isMobileLike() || isReduced()) return;
    const rect = field.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }

  function onPointerLeave() {
    pointer.active = false;
    if (!selectedId) {
      hoveredId = null;
      setHoverLabel(null, false);
    }
  }

  function bindFruitEvents() {
    nodes.forEach(node => {
      node.el.addEventListener("pointerenter", () => {
        if (isMobileLike() || selectedId || isReduced()) return;
        hoveredId = node.flavour.id;
        setHoverLabel(node.flavour, true);
        preloadBottle(node.flavour.bottle);
      });
      node.el.addEventListener("pointerleave", () => {
        if (hoveredId === node.flavour.id) {
          hoveredId = null;
          setHoverLabel(null, false);
        }
      });
      node.el.addEventListener("click", event => {
        event.stopPropagation();
        selectFlavour(node.flavour.id);
      });
      node.el.addEventListener("focus", () => {
        if (selectedId || isReduced()) return;
        hoveredId = node.flavour.id;
        setHoverLabel(node.flavour, true);
      });
      node.el.addEventListener("blur", () => {
        if (hoveredId === node.flavour.id && !selectedId) {
          hoveredId = null;
          setHoverLabel(null, false);
        }
      });
    });
  }

  function setupFallback() {
    fallback.querySelectorAll("[data-fallback-flavour]").forEach(button => {
      button.addEventListener("click", () => {
        const flavour = flavourById(button.dataset.fallbackFlavour);
        if (!flavour) return;
        // Surface selection in a readable way for reduced motion
        fallback.querySelectorAll("button").forEach(btn => {
          btn.classList.toggle("is-active", btn === button);
        });
        // Temporarily show detail above fallback by cloning content into a live region
        let panel = section.querySelector("[data-find-reduced-panel]");
        if (!panel) {
          panel = document.createElement("div");
          panel.className = "find-reduced-panel";
          panel.dataset.findReducedPanel = "";
          panel.innerHTML = `
            <img alt="">
            <div>
              <p data-reduced-name></p>
              <p data-reduced-meta></p>
            </div>
          `;
          fallback.before(panel);
        }
        const img = panel.querySelector("img");
        img.src = flavour.bottle;
        img.alt = `Sipzy ${flavour.name} bottle`;
        panel.querySelector("[data-reduced-name]").textContent = flavour.name.toUpperCase();
        panel.querySelector("[data-reduced-meta]").textContent = `${flavour.abv} · ${flavour.size}`;
      });
    });
  }

  function applyReducedMode() {
    const reduced = isReduced();
    section.classList.toggle("is-reduced", reduced);
    fallback.hidden = !reduced;
    fallback.setAttribute("aria-hidden", reduced ? "false" : "true");
    if (reduced) {
      stopLoop();
      resetField();
    } else {
      measure();
      snapStaticLayout();
      ensureLoop();
    }
    setControls();
  }

  // Swipe between flavours on touch when selected
  field.addEventListener("touchstart", event => {
    if (!selectedId || event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  field.addEventListener("touchend", event => {
    if (!selectedId || !touchStartX) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    touchStartX = 0;
    if (Math.abs(dx) < 48) return;
    stepFlavour(dx < 0 ? 1 : -1);
  }, { passive: true });

  field.addEventListener("pointermove", onPointerMove);
  field.addEventListener("pointerleave", onPointerLeave);
  prevBtn.addEventListener("click", event => {
    event.stopPropagation();
    stepFlavour(-1);
  });
  nextBtn.addEventListener("click", event => {
    event.stopPropagation();
    stepFlavour(1);
  });
  stage.addEventListener("click", event => {
    if (!selectedId || transitioning) return;
    if (event.target.closest(".find-fruit, [data-find-prev], [data-find-next]")) return;
    resetField();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !selectedId) return;
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable]")) return;
    resetField();
  });

  const viewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      inView = entry.isIntersecting;
      if (inView) {
        measure();
        ensureLoop();
      } else {
        stopLoop();
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  window.addEventListener("resize", () => {
    measure();
    setControls();
    if (isReduced()) snapStaticLayout();
  });

  reduceMotion.addEventListener("change", applyReducedMode);
  finePointer.addEventListener("change", () => {
    setControls();
    if (!finePointer.matches) setHoverLabel(null, false);
  });
  narrowQuery.addEventListener("change", () => {
    measure();
    setControls();
  });

  buildFruits();
  bindFruitEvents();
  setupFallback();
  measure();
  snapStaticLayout();
  applyReducedMode();
  viewObserver.observe(section);
  setControls();
  requestAnimationFrame(() => {
    const bounds = section.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 80) {
      inView = true;
      measure();
      ensureLoop();
    }
  });

  // Warm the first few bottles after idle
  window.setTimeout(() => {
    flavours.slice(0, 3).forEach(item => preloadBottle(item.bottle));
  }, 1200);
})();

/* —— From fruit to Sipzy: scroll-scrub storytelling —— */
(() => {
  const section = document.querySelector("[data-fruit-to-sipzy]");
  if (!section) return;

  const sticky = section.querySelector(".fts-sticky");
  const spacer = section.querySelector("[data-fts-spacer]");
  const fruitEl = section.querySelector("[data-fts-fruit]");
  const fruitImg = section.querySelector("[data-fts-fruit-img]");
  const nextEl = section.querySelector("[data-fts-next]");
  const nextImg = section.querySelector("[data-fts-next-img]");
  const bottleEl = section.querySelector("[data-fts-bottle]");
  const bottleImg = section.querySelector("[data-fts-bottle-img]");
  const fragEls = [...section.querySelectorAll("[data-fts-frag]")];
  const openerEl = section.querySelector("[data-fts-opener]");
  const phaseEl = section.querySelector("[data-fts-phase]");
  const vortexEl = section.querySelector("[data-fts-vortex-name]");
  const revealEl = section.querySelector("[data-fts-reveal]");
  const nameEl = section.querySelector("[data-fts-name]");
  const metaEl = section.querySelector("[data-fts-meta]");
  const lineEl = section.querySelector("[data-fts-line]");
  const blurbEl = section.querySelector("[data-fts-blurb]");
  const liveEl = section.querySelector("[data-fts-live]");

  const compactQuery = window.matchMedia("(max-width: 768px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const flavours = [
    {
      id: "watermelon",
      name: "Watermelon Wave",
      meta: "8% ABV · 275 ML",
      line: "Bright flavour. Easy drift.",
      description: "Inspired by carefree summer afternoons and juicy watermelon slices. Light, playful, and refreshing—made for moments that feel effortlessly fun.",
      accent: "#ff3e8b",
      fruit: "assets/fruits/watermelon.png",
      bottle: "assets/bottles/07-watermelon-wave-8pct-275ml.png",
      motion: { orbit: 0.7, burst: 0.86, jitter: 0.16, driftX: 0, driftY: 1, spiral: 0.05, exit: -1 }
    },
    {
      id: "mango",
      name: "Mango Mood",
      meta: "8% ABV · 275 ML",
      line: "Rich. Tropical. Full swing.",
      description: "Made from the flavour of India's most loved fruit. Rich, tropical, and irresistibly smooth—every sip tastes like summer in full swing.",
      accent: "#ff7a18",
      fruit: "assets/fruits/mango.png",
      bottle: "assets/bottles/03-mango-mood-8pct-275ml.png",
      motion: { orbit: 1.08, burst: 1.02, jitter: 0.22, driftX: 1.15, driftY: 0.7, spiral: 0.08, exit: 1 }
    },
    {
      id: "orange",
      name: "Orange Voltage",
      meta: "8% ABV · 275 ML",
      line: "Bright citrus. Good vibes.",
      description: "Born under golden summer skies, bursting with bright citrus energy. A refreshing sip that brings sunshine, laughter, and good vibes to every gathering.",
      accent: "#ff9a2e",
      fruit: "assets/fruits/orange.png",
      bottle: "assets/bottles/04-orange-voltage-8pct-275ml.png",
      motion: { orbit: 0.95, burst: 1.34, jitter: 0.1, driftX: 0, driftY: 0, spiral: 0, exit: -1 }
    },
    {
      id: "cranberry",
      name: "Cranberry Affair",
      meta: "8% ABV · 275 ML",
      line: "Sweet. Tart. Unforgettable.",
      description: "A bold blend of sweet and tart, made for those who stand out. Vibrant, refreshing, and full of character—just like the nights you'll remember.",
      accent: "#ff404c",
      fruit: "assets/fruits/cranberry.png",
      bottle: "assets/bottles/01-cranberry-affair-8pct-275ml.png",
      motion: { orbit: 1.38, burst: 0.72, jitter: 1.15, driftX: 0.35, driftY: 0.3, spiral: 0.12, exit: 1 }
    },
    {
      id: "jamun",
      name: "Jamun Shot",
      meta: "8% ABV · 275 ML",
      line: "Monsoon fruit. Good mood.",
      description: "Born from India’s beloved monsoon fruit, crafted for every good mood. Pour, sip, and let the rich jamun flavour turn ordinary moments into unforgettable stories.",
      accent: "#7f31f3",
      fruit: "assets/fruits/Group 2.png",
      bottle: "assets/bottles/02-jamun-shot-8pct-275ml.png",
      motion: { orbit: 0.52, burst: 0.62, jitter: 0.08, driftX: 0, driftY: 0.15, spiral: 0.22, exit: -1 }
    },
    {
      id: "mojito",
      name: "Mojito Drift",
      meta: "8% ABV · 275 ML",
      line: "Fresh. Lively. Easy drift.",
      description: "Inspired by cool mint breezes and carefree evenings. Fresh, lively, and effortlessly smooth—your perfect companion for every celebration.",
      accent: "#b7ed37",
      fruit: "assets/fruits/mojito drift.png",
      bottle: "assets/bottles/05-mojito-drift-8pct-275ml.png",
      motion: { orbit: 0.88, burst: 0.78, jitter: 0.2, driftX: 1.4, driftY: 0.12, spiral: 0.06, exit: 1 }
    },
    {
      id: "lemonade",
      name: "Lemonade Twist",
      meta: "8% ABV · 275 ML",
      line: "Crisp. Zesty. Spontaneous.",
      description: "Where classic lemonade meets a spirited twist. Crisp, zesty, and smooth—crafted for sunset conversations and spontaneous adventures.",
      accent: "#f6d94d",
      fruit: "assets/fruits/lemonade twist.png",
      bottle: "assets/bottles/06-lemonade-twist-8pct-275ml.png",
      motion: { orbit: 1.18, burst: 0.9, jitter: 0.14, driftX: 0.2, driftY: 0.2, spiral: 1.12, exit: -1 }
    }
  ];

  const COUNT = flavours.length;
  const ROT_DIR = [1, -1, 1, -1, 1, -1];
  const preloaded = new Set();
  let activeIndex = -1;
  let ticking = false;
  let inView = false;

  function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  function remap(t, a, b) {
    if (b === a) return t >= b ? 1 : 0;
    return clamp01((t - a) / (b - a));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function preload(src) {
    if (!src || preloaded.has(src)) return;
    preloaded.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  function setSrc(img, src) {
    if (img && src && img.getAttribute("src") !== src) img.src = src;
  }

  function sectionProgress() {
    const total = sticky.offsetHeight + spacer.offsetHeight - window.innerHeight;
    const scrolled = -section.getBoundingClientRect().top;
    return clamp01(scrolled / Math.max(1, total));
  }

  function splitProgress(progress) {
    const scaled = progress * COUNT;
    const index = Math.min(COUNT - 1, Math.floor(scaled));
    return { index, t: clamp01(scaled - index) };
  }

  function applyTransform(el, x, y, scale, rot, opacity) {
    el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) rotate(${rot}deg) scale(${scale})`;
    el.style.opacity = String(opacity);
  }

  function pulseReveal(el, amount, shift = true) {
    if (!el) return;
    const p = clamp01(amount);
    el.style.opacity = p <= 0.01 ? "0" : "1";
    el.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
    if (shift) el.style.transform = `translateY(${(1 - p) * 16}px)`;
  }

  function vortexPose(i, p, motion, compact) {
    const dist = compact ? 0.5 : 1;
    const base = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const burst = (108 + (i % 3) * 26) * motion.burst * dist;
    const spin = base + p * Math.PI * 2 * motion.orbit + i * 0.22 * motion.spiral * p * Math.PI * 2;
    const radius = burst * (1.04 + 0.36 * Math.sin(p * Math.PI));
    const extra = Math.max(0, motion.burst - 1) * 56 * p * dist;
    const jx = Math.sin(p * 17 + i * 2.1) * motion.jitter * 12 * dist;
    const jy = Math.cos(p * 15 + i * 2.6) * motion.jitter * 12 * dist;
    return {
      x: Math.cos(spin) * (radius + extra) + jx + motion.driftX * 46 * Math.sin(p * Math.PI) * dist,
      y: Math.sin(spin) * (radius + extra) + jy + motion.driftY * 22 * Math.cos(p * Math.PI) * dist,
      rot: ROT_DIR[i] * (18 + p * 36),
      scale: 0.9 + 0.12 * Math.sin(p * Math.PI)
    };
  }

  function fragPose(i, t, motion, compact) {
    const start = vortexPose(i, 0, motion, compact);
    const swirl = vortexPose(i, 1, motion, compact);
    let x = 0;
    let y = 0;
    let rot = 0;
    let scale = 1;
    let opacity = 0;

    if (t < 0.1) {
      opacity = 0;
    } else if (t < 0.28) {
      const appear = remap(t, 0.1, 0.14);
      const p = easeOutCubic(remap(t, 0.12, 0.28));
      x = start.x * p;
      y = start.y * p;
      rot = start.rot * p;
      scale = lerp(1.08, start.scale, p);
      opacity = appear;
    } else if (t < 0.48) {
      const p = remap(t, 0.28, 0.48);
      const pose = vortexPose(i, p, motion, compact);
      x = pose.x;
      y = pose.y;
      rot = pose.rot;
      scale = pose.scale;
      opacity = 1;
    } else if (t < 0.68) {
      const p = easeInOutCubic(remap(t, 0.48, 0.68));
      x = lerp(swirl.x, 0, p);
      y = lerp(swirl.y, 0, p);
      rot = lerp(swirl.rot, 0, p);
      scale = lerp(swirl.scale, 0.42, p);
      opacity = lerp(1, i % 2 === 0 ? 0.08 : 0.28, p);
    } else if (t < 0.82) {
      const p = remap(t, 0.68, 0.82);
      opacity = lerp(i % 2 === 0 ? 0.08 : 0.28, 0, p);
      scale = lerp(0.42, 0.28, p);
    } else {
      opacity = 0;
      scale = 0.28;
    }

    return { x, y, rot, scale, opacity };
  }

  function bottlePose(t, motion, compact, last) {
    const dist = compact ? 0.55 : 1;
    if (t < 0.48) {
      return { x: 0, y: 32 * dist, rot: -7, scale: 0.75, opacity: 0, blur: compact ? 0 : 10 };
    }
    if (t < 0.68) {
      const p = easeOutCubic(remap(t, 0.48, 0.68));
      return {
        x: 0,
        y: lerp(32 * dist, 0, p),
        rot: lerp(-7, 0, p),
        scale: lerp(0.75, 1, p),
        opacity: p,
        blur: compact ? 0 : lerp(10, 0, p)
      };
    }
    if (t < 0.82 || last) {
      return { x: 0, y: 0, rot: 0, scale: 1, opacity: 1, blur: 0 };
    }
    const p = easeInCubic(remap(t, 0.82, 1));
    return {
      x: motion.exit * 170 * dist * p,
      y: lerp(0, 28 * dist, p),
      rot: motion.exit * 10 * p,
      scale: lerp(1, 0.56, p),
      opacity: 1 - p,
      blur: 0
    };
  }

  function nextFruitPose(t, motion, compact, hasNext) {
    if (!hasNext || t < 0.82) {
      return { x: -motion.exit * 140, y: 24, scale: 0.72, opacity: 0 };
    }
    const p = easeOutCubic(remap(t, 0.82, 1));
    const dist = compact ? 0.55 : 1;
    return {
      x: lerp(-motion.exit * 160 * dist, 0, p),
      y: lerp(28 * dist, 0, p),
      scale: lerp(0.72, 1, p),
      opacity: p
    };
  }

  function fruitPose(t, compact) {
    const peak = compact ? 1.04 : 1.06;
    const end = compact ? 1.08 : 1.12;
    if (t < 0.12) {
      return { scale: lerp(1, peak, remap(t, 0, 0.12)), opacity: 1 };
    }
    const p = remap(t, 0.12, 0.22);
    return { scale: lerp(peak, end, p), opacity: 1 - easeInCubic(p) };
  }

  function copyPulses(index, t) {
    const first = index === 0;
    const last = index === COUNT - 1;
    const compact = compactQuery.matches;
    const opener = first ? 1 - remap(t, 0.07, 0.14) : 0;
    const phase = compact ? 0 : remap(t, 0.08, 0.13) * (1 - remap(t, 0.2, 0.27));
    const vortex = remap(t, 0.3, 0.36) * (1 - remap(t, 0.46, 0.54));
    const reveal = remap(t, 0.66, 0.74) * (last ? 1 : 1 - remap(t, 0.86, 0.96));
    const blurb = remap(t, 0.7, 0.78) * (last ? 1 : 1 - remap(t, 0.86, 0.96));
    return { opener, phase, vortex, reveal, blurb };
  }

  function reducedPulses(index, t) {
    const first = index === 0;
    return {
      opener: first ? 1 - remap(t, 0.12, 0.28) : 0,
      phase: 0,
      vortex: 0,
      reveal: remap(t, 0.42, 0.58),
      blurb: remap(t, 0.46, 0.62)
    };
  }

  function applyFlavour(index) {
    const flavour = flavours[index];
    const next = flavours[index + 1];
    setSrc(fruitImg, flavour.fruit);
    setSrc(bottleImg, flavour.bottle);
    fragEls.forEach(frag => {
      const img = frag.querySelector("img");
      setSrc(img, flavour.fruit);
    });
    if (next) {
      setSrc(nextImg, next.fruit);
      preload(next.bottle);
    }
    vortexEl.textContent = flavour.name;
    nameEl.textContent = flavour.name;
    metaEl.textContent = flavour.meta;
    lineEl.textContent = flavour.line;
    if (blurbEl) blurbEl.textContent = flavour.description;
    liveEl.textContent = `${flavour.name}. ${flavour.meta}. ${flavour.description}`;
    preload(flavour.fruit);
    preload(flavour.bottle);
  }

  function tint(index, t) {
    const current = hexToRgb(flavours[index].accent);
    const following = flavours[index + 1] ? hexToRgb(flavours[index + 1].accent) : current;
    const mix = remap(t, 0.78, 1);
    const r = Math.round(lerp(current.r, following.r, mix));
    const g = Math.round(lerp(current.g, following.g, mix));
    const b = Math.round(lerp(current.b, following.b, mix));
    section.style.setProperty("--fts-accent", `${r}, ${g}, ${b}`);
  }

  function paint() {
    ticking = false;
    const progress = sectionProgress();
    const { index, t } = splitProgress(progress);
    const compact = compactQuery.matches;
    const flavour = flavours[index];
    const last = index === COUNT - 1;

    if (index !== activeIndex) {
      applyFlavour(index);
      activeIndex = index;
    }

    if (t > 0.55 && flavours[index + 1]) {
      preload(flavours[index + 1].fruit);
      preload(flavours[index + 1].bottle);
    }

    tint(index, t);
    bottleEl.classList.toggle("is-settled", t >= 0.68 && (t < 0.82 || last));

    if (reduced.matches) {
      const fruitOpacity = 1 - remap(t, 0.28, 0.58);
      const bottleOpacity = remap(t, 0.32, 0.62) * (last ? 1 : 1 - remap(t, 0.82, 1));
      const nextOpacity = last ? 0 : remap(t, 0.82, 1);
      applyTransform(fruitEl, 0, 0, lerp(1, 0.92, remap(t, 0.28, 0.62)), 0, fruitOpacity);
      applyTransform(bottleEl, 0, lerp(18, 0, remap(t, 0.32, 0.66)), lerp(0.86, 1, remap(t, 0.32, 0.66)), 0, bottleOpacity);
      bottleEl.style.filter = "none";
      applyTransform(nextEl, 0, 0, lerp(0.86, 1, nextOpacity), 0, nextOpacity);
      fragEls.forEach(frag => {
        frag.style.opacity = "0";
      });
      const pulses = reducedPulses(index, t);
      pulseReveal(openerEl, pulses.opener);
      pulseReveal(phaseEl, pulses.phase);
      pulseReveal(vortexEl, pulses.vortex, false);
      pulseReveal(revealEl, pulses.reveal);
      pulseReveal(blurbEl, pulses.blurb, false);
      return;
    }

    const fruit = fruitPose(t, compact);
    const bottle = bottlePose(t, flavour.motion, compact, last);
    const incoming = nextFruitPose(t, flavour.motion, compact, Boolean(flavours[index + 1]));
    const fragCount = compact ? 3 : 6;
    const pulses = copyPulses(index, t);

    applyTransform(fruitEl, 0, 0, fruit.scale, 0, fruit.opacity);
    applyTransform(bottleEl, bottle.x, bottle.y, bottle.scale, bottle.rot, bottle.opacity);
    bottleEl.style.filter = bottle.blur > 0.35 ? `blur(${bottle.blur}px)` : "none";
    bottleEl.style.zIndex = t >= 0.52 ? "4" : "2";
    applyTransform(nextEl, incoming.x, incoming.y, incoming.scale, 0, incoming.opacity);

    fragEls.forEach((frag, i) => {
      if (i >= fragCount) {
        frag.style.opacity = "0";
        return;
      }
      const pose = fragPose(i, t, flavour.motion, compact);
      applyTransform(frag, pose.x, pose.y, pose.scale, pose.rot, pose.opacity);
      frag.style.zIndex = t >= 0.52 ? "1" : "3";
    });

    pulseReveal(openerEl, pulses.opener);
    pulseReveal(phaseEl, pulses.phase);
    pulseReveal(vortexEl, pulses.vortex, false);
    pulseReveal(revealEl, pulses.reveal);
    pulseReveal(blurbEl, pulses.blurb, false);
  }

  function requestPaint() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }

  function applyReducedClass() {
    section.classList.toggle("is-reduced", reduced.matches);
    requestPaint();
  }

  const viewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      inView = entry.isIntersecting;
      section.classList.toggle("is-hot", inView && !reduced.matches);
      if (inView) requestPaint();
    });
  }, { rootMargin: "20% 0px" });

  viewObserver.observe(section);
  window.addEventListener("scroll", () => {
    if (inView || Math.abs(section.getBoundingClientRect().top) < window.innerHeight * 1.2) {
      requestPaint();
    }
  }, { passive: true });
  window.addEventListener("resize", requestPaint);
  compactQuery.addEventListener("change", requestPaint);
  reduced.addEventListener("change", applyReducedClass);

  applyFlavour(0);
  applyReducedClass();
  requestPaint();
})();
