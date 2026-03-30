const STAR_COLORS = ['#F5D000', '#77CFF9', '#B6D07D', '#D199BB'] as const;
const STAR_COUNT = 22;
const STAR_MIN_SIZE = 28;
const STAR_MAX_SIZE = 60;
const STAR_OPACITY = 0.3;

const SVG_NS = 'http://www.w3.org/2000/svg';

function starPath(r: number): string {
  const inner = r * 0.4;
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : inner;
    points.push(`${radius * Math.cos(angle)},${radius * Math.sin(angle)}`);
  }
  return `M ${points.join(' L ')} Z`;
}

function buildStarSvg(size: number, color: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', `-${size / 2} -${size / 2} ${size} ${size}`);

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', starPath(size / 2));
  path.setAttribute('fill', color);
  svg.appendChild(path);

  return svg;
}

/** Clears and repopulates the provided container with randomly placed stars. */
export function renderStarField(container: HTMLElement): void {
  container.querySelectorAll('.id-star').forEach((el) => el.remove());

  const { offsetWidth: containerWidth, offsetHeight: containerHeight } = container;
  if (containerWidth === 0 || containerHeight === 0) return;

  for (let i = 0; i < STAR_COUNT; i++) {
    const size = STAR_MIN_SIZE + Math.random() * (STAR_MAX_SIZE - STAR_MIN_SIZE);
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const svg = buildStarSvg(size, color);

    const left = Math.random() * Math.max(0, containerWidth - size);
    const top = Math.random() * Math.max(0, containerHeight - size);

    svg.classList.add('id-star');
    svg.style.cssText = `
      position: absolute;
      left: ${left}px;
      top: ${top}px;
      opacity: ${STAR_OPACITY};
      pointer-events: none;
      z-index: 0;
    `;

    const rotate = Math.random() * 360;
    svg.style.transform = `rotate(${rotate}deg)`;

    container.appendChild(svg);
  }
}
