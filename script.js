const panels = [...document.querySelectorAll('.panel')];
const carousel = document.querySelector('.panels');
const indicatorButtons = [...document.querySelectorAll('.panel-indicator button')];
const heroMark = document.querySelector('.hero-mark');
const markZones = document.querySelectorAll('.topbar, .footer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex = 0;
let scrollFrame = 0;

function setActive(index) {
  activeIndex = Math.max(0, Math.min(index, panels.length - 1));
  panels.forEach((panel, panelIndex) => {
    panel.classList.toggle('is-active', panelIndex === activeIndex);
  });
  indicatorButtons.forEach((button, buttonIndex) => {
    button.setAttribute('aria-current', String(buttonIndex === activeIndex));
  });
}

function goToPanel(index) {
  const panel = panels[index];
  if (!panel) return;
  setActive(index);
  panel.scrollIntoView({
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'center',
  });
}

panels.forEach((panel, index) => {
  panel.addEventListener('mouseenter', () => setActive(index));
  panel.addEventListener('focus', () => setActive(index));
});

indicatorButtons.forEach((button) => {
  button.addEventListener('click', () => goToPanel(Number(button.dataset.panel)));
});

carousel?.addEventListener('scroll', () => {
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => {
    const center = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    panels.forEach((panel, index) => {
      const bounds = panel.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActive(nearestIndex);
  });
}, { passive: true });

document.querySelector('.ecosystem')?.addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = (activeIndex + direction + panels.length) % panels.length;
  goToPanel(nextIndex);
  panels[nextIndex].focus({ preventScroll: true });
});

const ecosystem = document.querySelector('.ecosystem');
const mobileViewport = window.matchMedia('(max-width: 700px)');
const hideHeroMark = () => heroMark?.classList.add('is-hidden');
const showHeroMark = () => heroMark?.classList.remove('is-hidden');
let heroMarkTimer;

function showHeroMarkTemporarily() {
  showHeroMark();
  if (!mobileViewport.matches) return;
  window.clearTimeout(heroMarkTimer);
  heroMarkTimer = window.setTimeout(hideHeroMark, 3500);
}

if (mobileViewport.matches) {
  heroMarkTimer = window.setTimeout(hideHeroMark, 3500);
}

ecosystem?.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'mouse' && !mobileViewport.matches) hideHeroMark();
}, { passive: true });

ecosystem?.addEventListener('pointerdown', (event) => {
  if (!mobileViewport.matches && event.pointerType !== 'touch') hideHeroMark();
}, { passive: true });

markZones.forEach((zone) => {
  zone.addEventListener('pointerenter', () => {
    if (!mobileViewport.matches) showHeroMark();
  });
  zone.addEventListener('click', showHeroMarkTemporarily);
});
