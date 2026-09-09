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
  video.src = next;
  video.load();
}

function syncDuration() {
  if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
}

video.addEventListener("loadedmetadata", () => {
  syncDuration();
  video.pause();
  seeking = false;
  if (video.readyState >= 2) video.currentTime = targetTime;
});

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

renderProducts("8");

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
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        duoObserver.unobserve(entry.target);
      }
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
