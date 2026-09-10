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

let pageScrollY = window.scrollY;
let scrollingDown = true;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (Math.abs(y - pageScrollY) < 1) return;
  scrollingDown = y > pageScrollY;
  pageScrollY = y;
}, { passive: true });

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

(() => {
  const title = document.querySelector(".ritual-title");
  if (!title) return;

  function armDrop() {
    title.classList.toggle("is-droppable", !prefersReducedMotion());
  }

  function playFall() {
    const fromY = -Math.max(0, Math.round(title.getBoundingClientRect().top));
    title.style.setProperty("--ritual-fall", `${fromY}px`);
    title.classList.remove("is-falling", "is-settled");
    void title.offsetWidth;
    title.classList.add("is-falling");
  }

  title.addEventListener("animationend", event => {
    if (event.animationName !== "ritual-title-fall") return;
    title.classList.add("is-settled");
    title.classList.remove("is-falling");
  });

  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        title.classList.remove("is-falling", "is-settled");
        return;
      }
      if (prefersReducedMotion()) {
        title.classList.remove("is-falling", "is-droppable");
        title.classList.add("is-settled");
        return;
      }
      const enteringFromBelow = entry.boundingClientRect.top > window.innerHeight * 0.12;
      if (scrollingDown && enteringFromBelow) playFall();
      else title.classList.add("is-settled");
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8%" });

  armDrop();
  reduceMotion.addEventListener("change", armDrop);
  titleObserver.observe(title);
})();

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
    const href = link.getAttribute("href");
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (href === "#contact" && window.scrollToContactCover?.(prefersReducedMotion() ? "auto" : "smooth")) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/* —— Find your Sipzy: flavour gravity field —— */
(() => {
  const section = document.querySelector("[data-find-sipzy]");
  if (!section) return;

  const bottles = [
    {
      id: "jamun",
      name: "Jamun Cask",
      abv: "16% ABV",
      size: "330 ML",
      accent: "#6B2D8B",
      src: "assets/bottles/11-jamun-cask-16pct-330ml.png",
      angle: -90,
      line: "Born from India’s beloved monsoon fruit, crafted for every good mood. Pour, sip, and let the rich jamun flavour turn ordinary moments into unforgettable stories."
    },
    {
      id: "mango",
      name: "Mango Mirage",
      abv: "16% ABV",
      size: "330 ML",
      accent: "#E08A2E",
      src: "assets/bottles/12-mango-mirage-16pct-330ml.png",
      angle: -18,
      line: "Made from the flavour of India's most loved fruit. Rich, tropical, and irresistibly smooth—every sip tastes like summer in full swing."
    },
    {
      id: "orange",
      name: "Orange Oak",
      abv: "16% ABV",
      size: "330 ML",
      accent: "#F07828",
      src: "assets/bottles/10-orange-oak-16pct-330ml.png",
      angle: 54,
      line: "Born under golden summer skies, bursting with bright citrus energy. A refreshing sip that brings sunshine, laughter, and good vibes to every gathering."
    },
    {
      id: "cranberry",
      name: "Cranberry Cellar",
      abv: "16% ABV",
      size: "330 ML",
      accent: "#9B1C3A",
      src: "assets/bottles/09-cranberry-cellar-16pct-330ml.png",
      angle: 126,
      line: "A bold blend of sweet and tart, made for those who stand out. Vibrant, refreshing, and full of character—just like the nights you'll remember."
    },
    {
      id: "mojito",
      name: "Mojito Heritage",
      abv: "16% ABV",
      size: "330 ML",
      accent: "#A8C93A",
      src: "assets/bottles/08-mojito-heritage-16pct-330ml.png",
      angle: 198,
      line: "Inspired by cool mint breezes and carefree evenings. Fresh, lively, and effortlessly smooth — your perfect companion for every celebration."
    }
  ];

  const field = section.querySelector("[data-find-field]");
  const orbitRoot = section.querySelector("[data-find-orbit]");
  const play = section.querySelector("[data-find-play]");
  const ripple = section.querySelector("[data-find-ripple]");
  const story = section.querySelector("[data-find-story]");
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
  const narrowQuery = window.matchMedia("(max-width: 747px)");

  let nodes = [];
  let selectedId = null;
  let openedAt = 0;
  let inView = false;
  let rafId = 0;
  let transitioning = false;
  let enterTimer = 0;
  let collisionUntil = 0;
  let pointer = { x: 0, y: 0, active: false };
  let center = { x: 0, y: 0 };
  let radius = 180;
  let touchStartX = 0;
  let selectedSpot = { x: 0, y: -8, scale: 1.95 };

  function isReduced() {
    return reduceMotion.matches;
  }

  function isMobileLike() {
    return narrowQuery.matches || !finePointer.matches;
  }

  function bottleById(id) {
    return bottles.find(item => item.id === id);
  }

  function bottleIndex(id) {
    return bottles.findIndex(item => item.id === id);
  }

  function measure() {
    const rect = field.getBoundingClientRect();
    center = { x: rect.width / 2, y: rect.height / 2 };
    const item = nodes[0]?.el;
    const maxSide = Math.max(item?.offsetWidth || 96, item?.offsetHeight || 120);
    const visualHalf = maxSide * 0.22;
    const inset = visualHalf + 20;
    radius = Math.max(96, Math.min(rect.width, rect.height) / 2 - inset);
    field.style.setProperty("--orbit", `${radius * 2}px`);
    selectedSpot = isMobileLike()
      ? { x: 0, y: -20, scale: 1.72 }
      : { x: 0, y: -10, scale: 1.95 };
  }

  function buildOrbit() {
    nodes = bottles.map((bottle, index) => {
      const el = orbitRoot.querySelector(`[data-bottle="${bottle.id}"]`);
      return {
        bottle,
        el,
        homeAngle: (bottle.angle * Math.PI) / 180,
        phase: index * 0.87,
        floatAmp: 8 + (index % 3) * 3,
        rotAmp: 4 + (index % 4),
        scaleBase: 1,
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

  function showDetail(bottle) {
    detailName.textContent = bottle.name.toUpperCase();
    detailAbv.textContent = bottle.abv;
    detailSize.textContent = bottle.size;
    detail.classList.remove("is-visible");
    void detail.offsetWidth;
    detail.classList.add("is-visible");
  }

  function hideDetail() {
    detail.classList.remove("is-visible");
  }

  function showStory(bottle) {
    story.textContent = bottle.line;
    story.hidden = false;
    story.setAttribute("aria-hidden", "false");
  }

  function hideStory() {
    story.textContent = "";
    story.hidden = true;
    story.setAttribute("aria-hidden", "true");
  }

  function setControls() {
    const open = Boolean(selectedId);
    nav.hidden = !open;
    play.classList.toggle("is-open", open);
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
      if (selectedId && node.bottle.id === selectedId) return;

      const home = homePosition(node, t);
      let targetX = home.x;
      let targetY = home.y;
      let targetScale = home.scale;
      let targetRotate = home.rotate;
      let targetBlur = 0;
      let targetOpacity = 1;

      if (useGravity) {
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
        targetX += node.gx;
        targetY += node.gy;
      }

      if (selectedId && node.bottle.id !== selectedId) {
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

  function placeSelectedBottle(node, t, now) {
    if (now < collisionUntil) {
      const progress = Math.min(1, Math.max(0, 1 - (collisionUntil - now) / 520));
      const ease = 1 - Math.pow(1 - progress, 3);
      node.x += (0 - node.x) * (0.16 + ease * 0.2);
      node.y += (0 - node.y) * (0.16 + ease * 0.2);
      node.scale = selectedSpot.scale * 0.86 + Math.sin(ease * Math.PI) * 0.18;
      node.rotate += (0 - node.rotate) * 0.15;
      node.blur = 0;
      node.opacity = 1;
      applyNodeTransform(node);
      return;
    }
    const targetX = selectedSpot.x + Math.sin(t * 0.5) * 3;
    const targetY = selectedSpot.y + Math.cos(t * 0.4) * 4;
    node.x += (targetX - node.x) * 0.12;
    node.y += (targetY - node.y) * 0.12;
    node.scale += (selectedSpot.scale - node.scale) * 0.12;
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
      const active = nodes.find(n => n.bottle.id === selectedId);
      if (active) placeSelectedBottle(active, now / 1000, now);
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
      if (selectedId === node.bottle.id) {
        node.x = selectedSpot.x;
        node.y = selectedSpot.y;
        node.scale = selectedSpot.scale;
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

  function selectBottle(id, { fromSwap = false } = {}) {
    const bottle = bottleById(id);
    if (!bottle) return;
    if (transitioning && !fromSwap) return;
    if (selectedId === id && !fromSwap) return;

    if (enterTimer) {
      window.clearTimeout(enterTimer);
      enterTimer = 0;
    }

    transitioning = true;
    field.classList.add("is-selected");
    requestAnimationFrame(() => measure());

    const previousId = selectedId;
    const activeNode = nodes.find(n => n.bottle.id === id);

    nodes.forEach(node => {
      node.el.classList.toggle("is-active", node.bottle.id === id);
      node.el.setAttribute("aria-pressed", node.bottle.id === id ? "true" : "false");
    });

    const runEnter = () => {
      selectedId = id;
      openedAt = performance.now();
      showDetail(bottle);
      showStory(bottle);
      setControls();
      burstRipple(bottle.accent);
      collisionUntil = performance.now() + 520;

      if (activeNode && !isReduced()) {
        activeNode.scale = selectedSpot.scale * 0.82;
        applyNodeTransform(activeNode);
      }

      requestAnimationFrame(() => {
        if (isReduced()) snapStaticLayout();
        enterTimer = window.setTimeout(() => {
          transitioning = false;
          enterTimer = 0;
        }, fromSwap ? 420 : 700);
      });
    };

    if (previousId && previousId !== id && !isReduced()) {
      enterTimer = window.setTimeout(runEnter, 180);
    } else {
      runEnter();
    }

    ensureLoop();
  }

  function resetField() {
    if (enterTimer) {
      window.clearTimeout(enterTimer);
      enterTimer = 0;
    }
    selectedId = null;
    openedAt = 0;
    transitioning = false;
    field.classList.remove("is-selected");
    requestAnimationFrame(() => measure());
    hideDetail();
    hideStory();
    setControls();
    nodes.forEach(node => {
      node.el.classList.remove("is-active", "is-pushed");
      node.el.setAttribute("aria-pressed", "false");
    });
    if (isReduced()) snapStaticLayout();
    ensureLoop();
  }

  function stepBottle(delta) {
    if (!selectedId) return;
    const index = bottleIndex(selectedId);
    const next = bottles[(index + delta + bottles.length) % bottles.length];
    selectBottle(next.id, { fromSwap: true });
  }

  function onPointerMove(event) {
    if (isMobileLike() || isReduced()) return;
    const rect = field.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }

  function onFieldPointerLeave() {
    pointer.active = false;
  }

  function bindOrbitEvents() {
    nodes.forEach(node => {
      node.el.addEventListener("pointerenter", () => {
        if (isMobileLike() || selectedId || isReduced()) return;
        selectBottle(node.bottle.id);
      });
      node.el.addEventListener("click", event => {
        event.stopPropagation();
        if (selectedId === node.bottle.id) {
          if (performance.now() - openedAt < 400) return;
          resetField();
          return;
        }
        if (selectedId) return;
        selectBottle(node.bottle.id);
      });
    });
  }

  function setupFallback() {
    fallback.querySelectorAll("[data-fallback-bottle]").forEach(button => {
      button.addEventListener("click", () => {
        const bottle = bottleById(button.dataset.fallbackBottle);
        if (!bottle) return;
        fallback.querySelectorAll("button").forEach(btn => {
          btn.classList.toggle("is-active", btn === button);
        });
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
              <p data-reduced-line></p>
            </div>
          `;
          fallback.before(panel);
        }
        const img = panel.querySelector("img");
        img.src = bottle.src;
        img.alt = `Sipzy ${bottle.name} ${bottle.abv} bottle`;
        panel.querySelector("[data-reduced-name]").textContent = bottle.name.toUpperCase();
        panel.querySelector("[data-reduced-meta]").textContent = `${bottle.abv} · ${bottle.size}`;
        panel.querySelector("[data-reduced-line]").textContent = bottle.line;
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

  field.addEventListener("touchstart", event => {
    if (!selectedId || event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  field.addEventListener("touchend", event => {
    if (!selectedId || !touchStartX) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    touchStartX = 0;
    if (Math.abs(dx) < 48) return;
    stepBottle(dx < 0 ? 1 : -1);
  }, { passive: true });

  field.addEventListener("pointermove", onPointerMove);
  field.addEventListener("pointerleave", onFieldPointerLeave);
  prevBtn.addEventListener("click", event => {
    event.stopPropagation();
    stepBottle(-1);
  });
  nextBtn.addEventListener("click", event => {
    event.stopPropagation();
    stepBottle(1);
  });
  stage.addEventListener("click", event => {
    if (!selectedId) return;
    if (event.target.closest(".find-orbit-item, [data-find-prev], [data-find-next]")) return;
    resetField();
  });
  stage.addEventListener("pointerleave", () => {
    if (isMobileLike() || isReduced() || !selectedId) return;
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
  });
  narrowQuery.addEventListener("change", () => {
    measure();
    setControls();
  });

  buildOrbit();
  bindOrbitEvents();
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
    const reveal = remap(t, 0.66, 0.74) * (last ? 1 : 1 - remap(t, 0.86, 0.96));
    const blurb = remap(t, 0.7, 0.78) * (last ? 1 : 1 - remap(t, 0.86, 0.96));
    return { opener, phase, reveal, blurb };
  }

  function reducedPulses(index, t) {
    const first = index === 0;
    return {
      opener: first ? 1 - remap(t, 0.12, 0.28) : 0,
      phase: 0,
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

/* —— Manifesto → contact: horizontal push cover —— */
(() => {
  const section = document.querySelector("[data-mc-push]");
  if (!section) return;

  const sticky = section.querySelector(".mc-sticky");
  const spacer = section.querySelector("[data-mc-spacer]");
  const from = section.querySelector("[data-mc-from]");
  const to = section.querySelector("[data-mc-to]");
  const pourFill = to?.querySelector(".pour-fill");
  if (!sticky || !spacer || !from || !to) return;

  let ticking = false;
  let inView = false;

  function clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }

  function scrubDistance() {
    return Math.max(1, sticky.offsetHeight + spacer.offsetHeight - window.innerHeight);
  }

  function progress() {
    return clamp01(-section.getBoundingClientRect().top / scrubDistance());
  }

  function contactScrollY() {
    return section.offsetTop + scrubDistance();
  }

  function syncPourFill(p) {
    if (!pourFill) return;
    if (reduceMotion.matches) {
      pourFill.classList.add("is-filled");
      return;
    }
    if (p >= 0.86 && scrollingDown) {
      if (!pourFill.classList.contains("is-filled")) {
        pourFill.classList.add("is-filled");
      }
      return;
    }
    if (p < 0.2) {
      pourFill.classList.remove("is-filled");
    }
  }

  function paint() {
    ticking = false;
    if (reduceMotion.matches) {
      from.style.transform = "";
      to.style.transform = "";
      syncPourFill(1);
      return;
    }
    const p = progress();
    from.style.transform = `translate3d(${p * 100}%, 0, 0)`;
    to.style.transform = `translate3d(${(p - 1) * 100}%, 0, 0)`;
    syncPourFill(p);
  }

  function requestPaint() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }

  window.scrollToContactCover = (behavior = "smooth") => {
    if (reduceMotion.matches) {
      to.scrollIntoView({ behavior });
      return true;
    }
    window.scrollTo({ top: contactScrollY(), behavior });
    requestPaint();
    return true;
  };

  function settleContactHash() {
    if (location.hash !== "#contact") return;
    window.scrollToContactCover("auto");
  }

  const viewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      inView = entry.isIntersecting;
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
  reduceMotion.addEventListener("change", requestPaint);
  window.addEventListener("hashchange", settleContactHash);
  window.addEventListener("load", settleContactHash);

  requestPaint();
  settleContactHash();
})();
