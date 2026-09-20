type Point = { x: number; y: number };
type MeshNode = Point & { vx: number; vy: number };
type Anchor = Point & { node: number; contour: Point[]; terminal: Point };
type LetterSurface = {
  element: HTMLElement; mask: HTMLCanvasElement; layer: HTMLCanvasElement;
  anchors: Anchor[]; interior: Point[]; width: number; height: number;
  text: string; font: string; baseline: number; scaleX: number;
};

/** Samples the loaded display font, including counters, to connect to real glyph edges. */
export function createTitleNetwork(root: HTMLElement, overlay: HTMLCanvasElement) {
  const context = overlay.getContext('2d');
  const titles = [...root.querySelectorAll<HTMLElement>('[data-mesh-title]')];
  const dot = root.querySelector<HTMLElement>('[data-mesh-dot]');
  let surfaces: LetterSurface[] = [];
  let disposed = false;
  let reveal = 0;
  let focus = { x: -1000, y: -1000 };
  let time = 0;
  let pulse = -1;
  let pulseSpeed = 7;
  let dotInside = false;
  let origin = { x: 0, y: 0 };
  let needsMeasure = true;
  const observer = new ResizeObserver(() => { needsMeasure = true; });
  const refreshFontGeometry = () => { needsMeasure = true; };
  titles.forEach(title => observer.observe(title));
  void document.fonts.ready.then(() => { if (!disposed) needsMeasure = true; });
  document.fonts.addEventListener('loadingdone', refreshFontGeometry);

  function measure() {
    surfaces = titles.map(element => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      const width = Math.ceil(box.width);
      const height = Math.ceil(box.height);
      const mask = document.createElement('canvas');
      mask.width = Math.max(1, width); mask.height = Math.max(1, height);
      const ctx = mask.getContext('2d', { willReadFrequently: true })!;
      const text = element.textContent || '';
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.font = font;
      ctx.fillStyle = '#fff';
      const metrics = ctx.measureText(text);
      // Inline boxes use the font's ascent/descent, so their top locates the baseline.
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      const baseline = (height - ascent - descent) / 2 + ascent;
      // Canvas text does not consistently honor CSS letter-spacing. Fit the raw
      // glyph run to the live span's measured width, so the mesh frame follows
      // the actual wordmark after font and size changes.
      const rawWidth = Math.max(1, metrics.width);
      const scaleX = width / rawWidth;
      ctx.save();
      ctx.scale(scaleX, 1);
      ctx.fillText(text, 0, baseline);
      ctx.restore();
      const pixels = ctx.getImageData(0, 0, mask.width, mask.height).data;
      const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && pixels[(y * mask.width + x) * 4 + 3] > 128;
      const anchors: Anchor[] = [];
      const interior: Point[] = [];
      const separation = width < 300 ? 19 : 32;
      for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
          if (!inside(x, y)) continue;
          if ((!inside(x - 2, y) || !inside(x + 2, y) || !inside(x, y - 2) || !inside(x, y + 2)) &&
            anchors.every(a => Math.hypot(a.x - x, a.y - y) > separation)) {
            const contour: Point[] = [];
            for (let cy = y - 8; cy <= y + 8; cy++) {
              for (let cx = x - 8; cx <= x + 8; cx++) {
                if (inside(cx, cy) && (!inside(cx - 1, cy) || !inside(cx + 1, cy) || !inside(cx, cy - 1) || !inside(cx, cy + 1))) contour.push({ x: cx, y: cy });
              }
            }
            anchors.push({ x, y, node: -1, contour, terminal: { x, y } });
          }
        }
      }
      const spacing = width < 300 ? 12 : 21;
      for (let y = 3; y < height; y += spacing) {
        for (let x = 3; x < width; x += spacing) {
          if (inside(x, y)) interior.push({ x, y });
        }
      }
      const layer = document.createElement('canvas');
      layer.width = mask.width; layer.height = mask.height;
      return { element, mask, layer, width, height, anchors, interior, text, font, baseline, scaleX };
    });
    needsMeasure = false;
  }

  function reset() {
    reveal = 0;
    pulse = -1;
    dotInside = false;
    titles.forEach(title => title.style.removeProperty('mask-image'));
    context?.clearRect(0, 0, overlay.width, overlay.height);
  }

  function draw(
    background: CanvasRenderingContext2D, nodes: MeshNode[], step: number,
    pointer: Point & { active: boolean }, scrollEnergy: number, mobile: boolean, enabled: boolean,
  ) {
    if (!context || !titles.length) return;
    if (needsMeasure) measure();
    if (!enabled) { reset(); return; }
    time += step / 60;
    context.clearRect(0, 0, overlay.width, overlay.height);
    const boxes = surfaces.map(s => s.element.getBoundingClientRect());
    if (boxes.every(b => b.bottom < 0 || b.top > innerHeight)) { reset(); return; }
    const proximity = boxes.some(b => pointer.x > b.left - 80 && pointer.x < b.right + 80 && pointer.y > b.top - 60 && pointer.y < b.bottom + 60);
    const desktopHover = pointer.active && proximity;
    const active = mobile ? Math.min(1, Math.abs(scrollEnergy) / 3) : Number(desktopHover);
    reveal += (active - reveal) * (1 - Math.exp(-step * 0.18));
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    const target = mobile ? {
      x: first.left + first.width * (0.2 + Math.min(1, window.scrollY / 300) * 0.65),
      y: first.top + (last.bottom - first.top) * Math.min(0.9, 0.2 + window.scrollY / 350),
    } : pointer;
    if (focus.x === -1000) focus = { x: target.x, y: target.y };
    if (mobile) {
      const follow = 1 - Math.exp(-step * 0.22);
      focus.x += (target.x - focus.x) * follow;
      focus.y += (target.y - focus.y) * follow;
    } else if (desktopHover) {
      // Desktop takes over instantly: the active lens stays exactly under the cursor.
      focus.x = target.x;
      focus.y = target.y;
    }
    if (dot) {
      const box = dot.getBoundingClientRect();
      origin = { x: box.left + box.width / 2, y: box.bottom - box.height * 0.2 };
      const over = mobile ? active > 0.5 : pointer.active && Math.hypot(pointer.x - origin.x, pointer.y - origin.y) < Math.max(30, box.width);
      if (over && !dotInside && pulse < 0) pulse = 0;
      dotInside = over;
    }
    if (pulse >= 0) {
      pulse += step * pulseSpeed;
      if (pulse > Math.hypot(innerWidth, innerHeight) + 120) pulse = -1;
    }

    surfaces.forEach((surface, index) => {
      const box = boxes[index];
      if (box.bottom < 0 || box.top > innerHeight) { surface.element.style.removeProperty('mask-image'); return; }
      // Each line keeps a small, staggered idle window. Scroll on touch and the
      // cursor on desktop take over the same lens without changing its geometry.
      const phase = time * 0.65 + index * 2.4;
      const idleStrength = 0.12 + 0.78 * ((Math.sin(phase) + 1) / 2);
      const idleX = surface.width * (0.5 + Math.sin(time * 0.19 + index * 2.1) * 0.42);
      const idleY = surface.height * (0.5 + Math.cos(time * 0.27 + index) * 0.28);
      const strength = idleStrength * (1 - reveal) + reveal;
      const idleRadius = Math.min(58, Math.max(42, surface.width * 0.23));
      const radius = mobile
        ? idleRadius + (85 - idleRadius) * reveal
        : idleRadius + (130 - idleRadius) * reveal;
      const x = mobile
        ? idleX * (1 - reveal) + (focus.x - box.left) * reveal
        : desktopHover ? focus.x - box.left : idleX;
      const y = mobile
        ? idleY * (1 - reveal) + (focus.y - box.top) * reveal
        : desktopHover ? focus.y - box.top : idleY;
      const tensionStrength = mobile ? strength * (0.3 + reveal * 0.7) : strength;
      if (strength > 0.01) {
        surface.element.style.maskImage = `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(0,0,0,${1 - strength}) 0%, rgba(0,0,0,${1 - strength * 0.96}) 40%, #000 100%)`;
      } else surface.element.style.removeProperty('mask-image');

      for (let i = 0; i < surface.anchors.length; i++) {
        const a = surface.anchors[i];
        const dx = x - a.x;
        const dy = y - a.y;
        const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 200) * tensionStrength;
        const length = Math.max(1, Math.hypot(dx, dy));
        const targetX = a.x + dx / length * pull * 7;
        const targetY = a.y + dy / length * pull * 7;
        a.terminal = a.contour.reduce<Point>((best, p) => Math.hypot(p.x - targetX, p.y - targetY) < Math.hypot(best.x - targetX, best.y - targetY) ? p : best, { x: a.x, y: a.y });
        const ax = box.left + a.terminal.x;
        const ay = box.top + a.terminal.y;
        if (a.node < 0 || !nodes[a.node]) {
          let nearest = Infinity;
          nodes.forEach((node, n) => {
            const distance = Math.hypot(node.x - ax, node.y - ay);
            if (distance < nearest) { nearest = distance; a.node = n; }
          });
        }
        const node = nodes[a.node];
        if (!node) continue;
        const distance = Math.hypot(node.x - ax, node.y - ay);
        const local = Math.max(0, 1 - Math.hypot(box.left + x - ax, box.top + y - ay) / (mobile ? radius * 2 : 200)) * tensionStrength;
        const wave = pulse >= 0 ? Math.max(0, 1 - Math.abs(Math.hypot(ax - origin.x, ay - origin.y) - pulse) / 85) : 0;
        // Sparse permanent tethers; the rest emerge only within the interaction.
        if (i % 3 !== 0 && local < 0.05 && wave < 0.05) continue;
        const opacity = Math.max(0, 1 - distance / 340) * (0.17 + local * 0.6 + wave * 0.65);
        if (opacity < 0.01) continue;
        if (step && distance > 75) {
          const tension = Math.min(0.012, (distance - 75) * 0.00008) * step;
          node.vx += (ax - node.x) / distance * tension;
          node.vy += (ay - node.y) / distance * tension;
        }
        background.strokeStyle = `rgba(82,224,166,${opacity})`;
        background.lineWidth = 0.8 + wave * 0.5;
        background.beginPath(); background.moveTo(ax, ay); background.lineTo(node.x, node.y); background.stroke();
        context.fillStyle = `rgba(121,255,192,${Math.min(1, opacity * 1.8)})`;
        context.beginPath(); context.arc(ax, ay, 1.4 + wave * 1.5, 0, Math.PI * 2); context.fill();
      }
      if (strength < 0.01 || x < -radius || x > surface.width + radius || y < -radius || y > surface.height + radius) return;
      const ctx = surface.layer.getContext('2d')!;
      ctx.clearRect(0, 0, surface.width, surface.height);
      ctx.fillStyle = '#101814'; ctx.fillRect(0, 0, surface.width, surface.height);
      const points = surface.interior.map((p, i) => ({
        x: p.x + Math.sin(time * 0.8 + i * 1.7) * 3,
        y: p.y + Math.cos(time * 0.65 + i * 2.3) * 3,
      }));
      ctx.lineWidth = 0.8;
      points.forEach((a, i) => {
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > (mobile ? 29 : 46)) continue;
          ctx.strokeStyle = `rgba(82,224,166,${0.65 * (1 - distance / 65)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        ctx.fillStyle = '#91f9c4'; ctx.beginPath(); ctx.arc(a.x, a.y, 1.2, 0, Math.PI * 2); ctx.fill();
      });
      // Bridge internal geometry to precisely the same contour terminals as the background.
      ctx.strokeStyle = 'rgba(82,224,166,0.6)';
      surface.anchors.forEach(a => {
        const nearest = points.reduce<Point | null>((best, p) => !best || Math.hypot(p.x - a.x, p.y - a.y) < Math.hypot(best.x - a.x, best.y - a.y) ? p : best, null);
        if (!nearest) return;
        ctx.beginPath(); ctx.moveTo(a.terminal.x, a.terminal.y); ctx.lineTo(nearest.x, nearest.y); ctx.stroke();
      });
      // Reuse the exact glyph geometry from the sampling mask so the revealed
      // network traces every letter edge as well as its interior connections.
      ctx.save();
      ctx.font = surface.font;
      ctx.scale(surface.scaleX, 1);
      ctx.strokeStyle = `rgba(143,249,196,${0.72 + strength * 0.2})`;
      ctx.lineWidth = 1.35;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(surface.text, 0, surface.baseline);
      ctx.restore();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(surface.mask, 0, 0);
      const lens = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      lens.addColorStop(0, `rgba(0,0,0,${strength})`); lens.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lens; ctx.fillRect(0, 0, surface.width, surface.height);
      ctx.globalCompositeOperation = 'source-over';
      context.drawImage(surface.layer, box.left, box.top);
    });
    if (pulse >= 0) {
      // Excitation travels out through existing nodes rather than adding a decorative ring.
      for (const node of nodes) {
        const wave = Math.max(0, 1 - Math.abs(Math.hypot(node.x - origin.x, node.y - origin.y) - pulse) / 65);
        if (!wave) continue;
        background.fillStyle = `rgba(156,255,203,${wave * 0.85})`;
        background.beginPath(); background.arc(node.x, node.y, 2 + wave * 2, 0, Math.PI * 2); background.fill();
      }
    }
  }
  return {
    draw,
    reset,
    resize: () => { needsMeasure = true; },
    triggerPulse: (speed = 7) => {
      if (dot) {
        const box = dot.getBoundingClientRect();
        origin = { x: box.left + box.width / 2, y: box.bottom - box.height * 0.2 };
      } else {
        origin = { x: innerWidth / 2, y: innerHeight / 2 };
      }
      pulseSpeed = speed;
      pulse = 0;
    },
    dispose: () => {
      disposed = true;
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', refreshFontGeometry);
      reset();
    }
  };
}
