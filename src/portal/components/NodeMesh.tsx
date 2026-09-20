import { useEffect, useRef } from 'react';
import { createTitleNetwork } from './title-network';

/** A viewport-sized network: no React renders in the animation loop. */
export default function NodeMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;
    document.documentElement.classList.add('has-node-mesh');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const titleCanvas = titleCanvasRef.current!;
    const findSurface = () => document.querySelector<HTMLElement>('.recreation-page, .showcase-page, main') ?? document.body;
    let surface = findSurface();
    let titleNetwork = createTitleNetwork(surface, titleCanvas);
    type Node = { x: number; y: number; vx: number; vy: number; phase: number; depth: number; spawn: number };
    type Point = { x: number; y: number };
    type FrameAssignment = { node: number; target: number };
    type TargetGroup = { start: number; count: number; closed: boolean };
    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let inView = true;
    let scrollY = window.scrollY;
    let scrollEnergy = 0;
    let frameElement: HTMLElement | null = null;
    let frameMode = '';
    let frameTargets: Point[] = [];
    let frameAssignments: FrameAssignment[] = [];
    let frameGroups: TargetGroup[] = [];
    let frameReveal = 0;
    let founderTheme = 0;
    let founderThemeGoal = 0;
    let founderBurst = 0;
    let founderCenter: Point = { x: 0, y: 0 };
    let founderWasActive = false;
    let redistribution = 0;
    let fieldHomes: Point[] = [];
    const outlineCanvas = document.createElement('canvas');
    const outlineCtx = outlineCanvas.getContext('2d', { willReadFrequently: true });
    let outlineCache = { key: '', points: [] as Point[] };
    let navOpen = document.documentElement.classList.contains('mobile-nav-open');
    let navReveal = navOpen ? 1 : 0;
    const loaderStartedAt = performance.now();
    const loaderDuration = 900;
    const previousOverflow = document.body.style.overflow;
    let loaderComplete = false;
    let readyTimer = 0;
    const pointer = { x: -1000, y: -1000, active: false };
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    function releaseFounderNodes() {
      // Give each existing particle a separate destination across the viewport.
      // Animate the release before restoring connections; never reseed the canvas.
      redistribution = 1;
      nodes.forEach(node => { node.vx *= 0.12; node.vy *= 0.12; node.spawn = 1; });
      frameAssignments = [];
      frameTargets = [];
      frameGroups = [];
      frameReveal = 0;
      frameElement = null;
      frameMode = '';
    }

    function pointsAround(element: HTMLElement, pad = 14) {
      const rect = element.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, width) - Math.max(rect.left, 0);
      const visibleHeight = Math.min(rect.bottom, height) - Math.max(rect.top, 0);
      if (visibleWidth < 24 || visibleHeight < 24) return [];
      const left = clamp(rect.left - pad, 8, width - 8);
      const right = clamp(rect.right + pad, 8, width - 8);
      const top = clamp(rect.top - pad, 8, height - 8);
      const bottom = clamp(rect.bottom + pad, 8, height - 8);
      const horizontal = Math.max(2, Math.ceil((right - left) / 54));
      const vertical = Math.max(2, Math.ceil((bottom - top) / 46));
      const points: Point[] = [];
      for (let i = 0; i <= horizontal; i++) points.push({ x: left + (right - left) * i / horizontal, y: top });
      for (let i = 1; i <= vertical; i++) points.push({ x: right, y: top + (bottom - top) * i / vertical });
      for (let i = 1; i <= horizontal; i++) points.push({ x: right - (right - left) * i / horizontal, y: bottom });
      for (let i = 1; i < vertical; i++) points.push({ x: left, y: bottom - (bottom - top) * i / vertical });
      return points;
    }

    function pointsOnEllipse(element: HTMLElement, count = 30, pad = 18) {
      const rect = element.getBoundingClientRect();
      const centerX = clamp(rect.left + rect.width / 2, 8, width - 8);
      const centerY = clamp(rect.top + rect.height / 2, 8, height - 8);
      const radiusX = Math.min(width * 0.44, Math.max(70, rect.width / 2 + pad));
      const radiusY = Math.min(height * 0.43, Math.max(70, rect.height / 2 + pad));
      return Array.from({ length: count }, (_, index) => {
        const angle = -Math.PI / 2 + index / count * Math.PI * 2;
        return {
          x: clamp(centerX + Math.cos(angle) * radiusX, 8, width - 8),
          y: clamp(centerY + Math.sin(angle) * radiusY, 8, height - 8),
        };
      });
    }

    function pointsOnTextOutline(element: HTMLElement, count = 78) {
      const rect = element.getBoundingClientRect();
      if (!outlineCtx || rect.width < 8 || rect.height < 8) return [];
      const styles = getComputedStyle(element);
      const text = element.textContent?.trim() || '2024';
      // Rasterize in local CSS coordinates once, then map normalized samples through
      // the live DOM bounds. Scrolling and growing text never require another scan.
      const localWidth = element.offsetWidth;
      const localHeight = element.offsetHeight;
      const scale = Math.min(0.5, 650 / localWidth);
      const key = [text, localWidth, localHeight, styles.font, styles.letterSpacing, document.fonts.status, count].join(':');
      if (outlineCache.key !== key) {
        outlineCanvas.width = Math.ceil(localWidth * scale);
        outlineCanvas.height = Math.ceil(localHeight * scale);
        outlineCtx.font = `${styles.fontWeight} ${parseFloat(styles.fontSize) * scale}px ${styles.fontFamily}`;
        outlineCtx.letterSpacing = `${(parseFloat(styles.letterSpacing) || 0) * scale}px`;
        const metrics = outlineCtx.measureText(text);
        const ascent = metrics.fontBoundingBoxAscent;
        const descent = metrics.fontBoundingBoxDescent;
        const baseline = (localHeight * scale - ascent - descent) / 2 + ascent;
        outlineCtx.lineWidth = 1.3;
        outlineCtx.strokeStyle = '#fff';
        outlineCtx.strokeText(text, 0, baseline);
        const w = outlineCanvas.width;
        const h = outlineCanvas.height;
        const pixels = outlineCtx.getImageData(0, 0, w, h).data;
        const candidates: Point[] = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            if (pixels[(y * w + x) * 4 + 3] > 90) candidates.push({ x: x / w, y: y / h });
          }
        }
        const points = Array.from({ length: Math.min(count, candidates.length) }, (_, i) =>
          candidates[Math.floor(i / count * candidates.length)]);
        outlineCache = { key, points };
      }
      return outlineCache.points.map(point => ({
        x: rect.left + point.x * rect.width,
        y: rect.top + point.y * rect.height,
      })).filter(point => point.x > 6 && point.x < width - 6 && point.y > 6 && point.y < height - 6);
    }

    function pointsBetween(from: HTMLElement, to: HTMLElement, count = 12) {
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const start = {
        x: clamp(a.left + a.width / 2, 8, width - 8),
        y: clamp(a.top + a.height / 2, 8, height - 8),
      };
      const end = {
        x: clamp(b.left + b.width / 2, 8, width - 8),
        y: clamp(b.top + b.height / 2, 8, height - 8),
      };
      return Array.from({ length: count }, (_, index) => {
        const progress = index / Math.max(1, count - 1);
        const bow = Math.sin(progress * Math.PI) * Math.min(70, Math.abs(end.x - start.x) * 0.12);
        return {
          x: start.x + (end.x - start.x) * progress,
          y: start.y + (end.y - start.y) * progress - bow,
        };
      });
    }

    function assignTargets(targets: Point[], groups: TargetGroup[]) {
      frameTargets = targets;
      frameGroups = groups;
      const available = new Set(nodes.map((_, index) => index));
      frameAssignments = frameTargets.map((target, targetIndex) => {
        let nearest = -1;
        let nearestDistance = Infinity;
        available.forEach(nodeIndex => {
          const node = nodes[nodeIndex];
          const distance = Math.hypot(node.x - target.x, node.y - target.y);
          if (distance < nearestDistance) { nearest = nodeIndex; nearestDistance = distance; }
        });
        if (nearest >= 0) available.delete(nearest);
        return { node: nearest, target: targetIndex };
      }).filter(assignment => assignment.node >= 0);
    }

    function activeMember(root: HTMLElement) {
      return root.querySelector<HTMLElement>('[data-mesh-member][data-member-active="true"]');
    }

    function targetsForMembers(root: HTMLElement, member: HTMLElement | null, mode: string) {
      const groups: TargetGroup[] = [];
      const targets: Point[] = [];
      const addGroup = (points: Point[], closed: boolean) => {
        groups.push({ start: targets.length, count: points.length, closed });
        targets.push(...points);
      };

      if (mode === 'founders' && member) {
        if (member.matches('[data-founder-year-outline]')) {
          targets.push(...pointsOnTextOutline(member, width < 700 ? 24 : 54));
        }
      } else if (mode === 'intro' && member) {
        targets.push(...pointsOnTextOutline(member, width < 700 ? 28 : 68));
      } else if (mode === 'index' && member) {
        const anchor = root.querySelector<HTMLElement>('[data-mesh-anchor]');
        if (anchor) {
          addGroup(pointsBetween(member, anchor), false);
          addGroup(pointsAround(anchor, 10), true);
        } else {
          addGroup(pointsAround(member, 10), true);
        }
      } else if (mode === 'orbit') {
        const stage = root.querySelector<HTMLElement>('[data-mesh-orbit]');
        if (stage) addGroup(pointsOnEllipse(stage, width < 700 ? 20 : 34, width < 700 ? 5 : 22), true);
        if (member && member !== stage) addGroup(pointsAround(member, 9), true);
      } else if (member) {
        addGroup(pointsAround(member, 10), true);
      }

      return { targets, groups };
    }

    function meshInteraction(step: number) {
      const conceptRoot = surface.matches('[data-members-concept]')
        ? surface
        : surface.querySelector<HTMLElement>('[data-members-concept]');
      let active: HTMLElement | null = null;
      let target: HTMLElement | null = null;
      let mode = 'achievement';
      let interactionMode = mode;
      let targetReveal = 0;
      let nextTargets: Point[] = [];
      let nextGroups: TargetGroup[] = [];
      founderThemeGoal = 0;

      if (conceptRoot) {
        mode = conceptRoot.dataset.membersConcept || 'constellation';
        active = activeMember(conceptRoot);
        const activeFrame = active?.querySelector<HTMLElement>('[data-mesh-frame]') ?? active;
        const orbit = mode === 'orbit' ? conceptRoot.querySelector<HTMLElement>('[data-mesh-orbit]') : null;
        const orbitRect = orbit?.getBoundingClientRect();
        const orbitVisible = Boolean(orbitRect && orbitRect.bottom > 0 && orbitRect.top < height);
        const founder = mode === 'constellation' ? conceptRoot.querySelector<HTMLElement>('[data-alumni-mesh-target]') : null;
        const founderStage = founder?.closest('[data-alumni-era]')?.getBoundingClientRect();
        const centerRect = conceptRoot.querySelector('[data-founder-collapse-center]')?.getBoundingClientRect();
        const founderReveal = Number(founder?.dataset.meshReveal ?? 0);
        const intro = mode === 'constellation' ? conceptRoot.querySelector<HTMLElement>('[data-intro-mesh-target]') : null;
        const introRect = intro?.getBoundingClientRect();
        const introReveal = Number(intro?.dataset.meshReveal ?? 0);
        const introVisible = Boolean(introRect && introRect.bottom > 0 && introRect.top < height && introReveal > 0.01);
        const founderVisible = Boolean(founderStage && founderStage.top < height * 0.45 && founderStage.bottom > height * 0.3 && founderReveal > 0.01);
        if (centerRect) {
          founderCenter = {
            x: centerRect.left + centerRect.width / 2,
            y: clamp(centerRect.top + centerRect.height / 2, height * 0.15, height * 0.85),
          };
        }
        founderThemeGoal = founderVisible && !motion.matches ? founderReveal : 0;
        if (founderWasActive && !founderVisible) releaseFounderNodes();
        founderWasActive = founderVisible;
        if (founderVisible) redistribution = 0;
        target = founderVisible ? founder : introVisible ? intro : activeFrame ?? (orbitVisible ? orbit : null);
        interactionMode = target === founder ? 'founders' : target === intro ? 'intro' : mode;
        targetReveal = founderVisible ? founderReveal : introVisible ? introReveal : activeFrame ? 1 : orbitVisible ? 0.72 : 0;
        if (target) ({ targets: nextTargets, groups: nextGroups } = targetsForMembers(conceptRoot, target, interactionMode));
        if (target === activeFrame && active?.dataset.memberKey) {
          if (canvas) canvas.dataset.meshMemberKey = active.dataset.memberKey;
        } else if (canvas) {
          delete canvas.dataset.meshMemberKey;
        }
      } else {
        if (founderWasActive) releaseFounderNodes();
        founderWasActive = false;
        active = surface.querySelector<HTMLElement>('[data-achievement-card].is-scroll-hover [data-mesh-frame]');
        if (!active && width >= 1440 && finePointer.matches) {
          active = surface.querySelector<HTMLElement>('[data-achievement-card]:hover [data-mesh-frame], [data-achievement-card]:focus-visible [data-mesh-frame]');
        }
        target = active;
        if (canvas) delete canvas.dataset.meshMemberKey;
        targetReveal = active ? 1 : 0;
        if (active) {
          nextTargets = pointsAround(active);
          nextGroups = [{ start: 0, count: nextTargets.length, closed: true }];
        }
      }

      if (target && (target !== frameElement || interactionMode !== frameMode || nextTargets.length !== frameTargets.length)) {
        frameElement = target;
        frameMode = interactionMode;
        assignTargets(nextTargets, nextGroups);
        if (canvas) canvas.dataset.meshResponse = interactionMode;
      } else if (target) {
        frameTargets = nextTargets;
        frameGroups = nextGroups;
      } else {
        frameElement = null;
        frameMode = '';
        if (canvas) delete canvas.dataset.meshResponse;
      }

      const rate = targetReveal ? 0.12 : 0.2;
      frameReveal += (targetReveal - frameReveal) * (1 - Math.exp(-step * rate));
      const previousFounderTheme = founderTheme;
      founderTheme += (founderThemeGoal - founderTheme) * (step ? 1 - Math.exp(-step * 0.085) : 0);
      const themeVelocity = Math.max(0, founderTheme - previousFounderTheme);
      founderBurst = Math.max(founderBurst * Math.pow(0.94, step), Math.min(1, themeVelocity * 38));
      if (canvas) {
        if (founderTheme > 0.01) canvas.dataset.meshTheme = 'origin';
        else delete canvas.dataset.meshTheme;
      }
      if (!target && frameReveal < 0.005) {
        frameReveal = 0;
        frameTargets = [];
        frameAssignments = [];
        frameGroups = [];
      }
      return new Map(frameAssignments.map(assignment => [assignment.node, frameTargets[assignment.target]]));
    }

    function resize() {
      frameElement = null;
      frameMode = '';
      frameTargets = [];
      frameAssignments = [];
      frameGroups = [];
      frameReveal = 0;
      founderTheme = 0;
      founderThemeGoal = 0;
      founderBurst = 0;
      outlineCache = { key: '', points: [] };
      const oldWidth = width;
      const oldHeight = height;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      titleCanvas.width = Math.round(width * dpr);
      titleCanvas.height = Math.round(height * dpr);
      titleCanvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      titleNetwork.resize();
      // Evenly seeded, jittered cells keep the network connected without dense clumps.
      const spacing = width < 700 ? 100 : 125;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const count = Math.min(150, cols * rows);
      const homeCols = Math.ceil(Math.sqrt(count * width / height));
      const homeRows = Math.ceil(count / homeCols);
      fieldHomes = Array.from({ length: count }, (_, i) => ({
        x: ((i % homeCols) + 0.25 + Math.random() * 0.5) / homeCols * width,
        y: (Math.floor(i / homeCols) + 0.25 + Math.random() * 0.5) / homeRows * height,
      }));
      if (nodes.length !== count) {
        nodes = Array.from({ length: count }, (_, i) => ({
          x: ((i % cols) + (Math.random() - 0.5) * 0.85) * width / (cols - 1),
          y: (Math.floor(i / cols) + (Math.random() - 0.5) * 0.85) * height / (rows - 1),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
          depth: 0.35 + Math.random() * 0.65,
          spawn: 1,
        }));
      } else if (oldWidth && oldHeight) {
        nodes.forEach(node => { node.x *= width / oldWidth; node.y *= height / oldHeight; });
      }
      draw(0);
    }

    function draw(step: number) {
      ctx!.clearRect(0, 0, width, height);
      const loaderProgress = loaderComplete
        ? 1
        : clamp((performance.now() - loaderStartedAt) / loaderDuration, 0, 1);
      const navGoal = navOpen ? 1 : 0;
      navReveal += (navGoal - navReveal) * (step ? 1 - Math.exp(-step * 0.14) : 1);
      const frameTargetByNode = meshInteraction(step);
      const originMix = founderTheme * founderTheme * (3 - 2 * founderTheme);
      const mixChannel = (from: number, to: number) => Math.round(from + (to - from) * originMix);
      const lineColor = [mixChannel(68, 255), mixChannel(185, 184), mixChannel(132, 92)];
      const nodeColor = [mixChannel(105, 255), mixChannel(220, 218), mixChannel(168, 153)];
      const signalColor = [mixChannel(125, 255), mixChannel(234, 240), mixChannel(187, 202)];
      const frameColor = [mixChannel(82, 255), mixChannel(224, 196), mixChannel(166, 116)];
      const frameNodeColor = [mixChannel(145, 255), mixChannel(249, 236), mixChannel(196, 193)];
      const connectionVisibility = (1 - clamp(founderTheme * 4, 0, 1)) * (1 - redistribution);
      const reach = (width < 700 ? 155 : 190) + navReveal * 34 + originMix * 52;
      const radius = width < 700 ? 160 : 240;
      elapsed += step * 0.008;
      scrollEnergy *= Math.pow(0.92, step);

      for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        const node = nodes[nodeIndex];
        if (step) {
          // Correlated random acceleration gives Brownian drift without frame-to-frame jitter.
          node.vx += ((Math.random() - 0.5) * 0.035 + Math.sin(elapsed + node.phase) * 0.006) * step;
          node.vy += ((Math.random() - 0.5) * 0.035 + Math.cos(elapsed * 0.7 + node.phase) * 0.006) * step;
          // Faint pull toward an evenly-spread home row stops sustained scroll drag from
          // leaving the field lopsided (all nodes drained toward one edge) after a long scroll.
          const homeRow = fieldHomes[nodeIndex];
          if (homeRow) node.vy += (homeRow.y - node.y) * 0.0025 * step;
          if (pointer.active) {
            const dx = node.x - pointer.x;
            const dy = node.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < radius && distance > 1) {
              const force = (1 - distance / radius) ** 2 * 0.22;
              node.vx += dx / distance * force * step;
              node.vy += dy / distance * force * step;
            }
          }
          const fixedToFounder = frameTargetByNode.has(nodeIndex);
          if (founderWasActive && founderTheme > 0.015 && !fixedToFounder) {
            let dx = founderCenter.x - node.x;
            let dy = founderCenter.y - node.y;
            let distance = Math.max(1, Math.hypot(dx, dy));
            const collapseRadius = width < 700 ? 18 : 26;
            if (distance < collapseRadius) {
              const angle = Math.random() * Math.PI * 2;
              node.x = width / 2 + Math.cos(angle) * width * 0.7;
              node.y = height / 2 + Math.sin(angle) * height * 0.7;
              const ingressAngle = Math.atan2(founderCenter.y - node.y, founderCenter.x - node.x);
              const ingress = 2.2 + Math.random() * 2.8;
              node.vx = Math.cos(ingressAngle) * ingress;
              node.vy = Math.sin(ingressAngle) * ingress;
              node.spawn = 0;
              node.phase = Math.random() * Math.PI * 2;
              dx = founderCenter.x - node.x;
              dy = founderCenter.y - node.y;
              distance = Math.max(1, Math.hypot(dx, dy));
            }
            node.spawn = Math.min(1, node.spawn + step * 0.055);
            const pull = founderTheme * (0.15 + founderBurst * 0.2) * (0.62 + node.depth * 0.5);
            const turbulence = Math.sin(elapsed * 15 + node.phase * 3.1) * founderTheme * 0.052;
            node.vx += (dx / distance * pull - dy / distance * turbulence) * step;
            node.vy += (dy / distance * pull + dx / distance * turbulence) * step;
          } else if (founderTheme < 0.015) {
            node.spawn = 1;
          }
          node.vx *= Math.pow(0.985, step);
          node.vy *= Math.pow(0.985, step);
          const maxVelocity = 1.5 + founderTheme * 6;
          node.x += clamp(node.vx, -maxVelocity, maxVelocity) * step;
          node.y += (clamp(node.vy, -maxVelocity, maxVelocity) - scrollEnergy * node.depth * 0.13) * step;
          const frameTarget = frameTargetByNode.get(nodeIndex);
          if (frameTarget) {
            const settleRate = frameMode === 'founders' ? 0.34 : frameMode === 'intro' ? 0.24 : 0.14;
            const settle = (1 - Math.exp(-step * settleRate)) * frameReveal;
            node.x += (frameTarget.x - node.x) * settle;
            node.y += (frameTarget.y - node.y) * settle;
            node.vx *= 1 - settle * 0.72;
            node.vy *= 1 - settle * 0.72;
          }
          if (redistribution > 0.002 && !frameTarget) {
            const home = fieldHomes[nodeIndex];
            const spread = (1 - Math.exp(-step * 0.075)) * Math.min(1, redistribution * 4);
            node.x += (home.x - node.x) * spread;
            node.y += (home.y - node.y) * spread;
            node.vx *= 1 - spread;
            node.vy *= 1 - spread;
          }
          // Soft boundary forces preserve continuity; no teleporting edge connections.
          if (node.x < 0) node.vx += 0.025 * step;
          if (node.x > width) node.vx -= 0.025 * step;
          node.x = clamp(node.x, -30, width + 30);
          // Vertical wrap-around: nodes drifting off the top re-enter from the bottom (and vice versa)
          // instead of bunching up against the edge under sustained scroll drag.
          if (node.y < -30) node.y += height + 60;
          else if (node.y > height + 30) node.y -= height + 60;
        }
      }

      redistribution *= Math.exp(-step * 0.035);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const nodeReveal = clamp(loaderProgress * 1.55 - (i / Math.max(1, nodes.length - 1)) * 0.55, 0, 1);
        const activity = pointer.active ? Math.max(0, 1 - Math.hypot(a.x - pointer.x, a.y - pointer.y) / radius) : 0;
        const aCollapsing = founderWasActive && founderTheme > 0.015 && !frameTargetByNode.has(i);
        const aOriginDistance = Math.hypot(a.x - founderCenter.x, a.y - founderCenter.y);
        const aCollapseAlpha = aCollapsing ? a.spawn * clamp(aOriginDistance / (width < 700 ? 62 : 88), 0, 1) : 1;
        // Keep the center calm while giving the margins a more visible web.
        const edge = 0.5 + Math.abs(a.x / width - 0.5);
        for (let j = i + 1; j < nodes.length; j++) {
          if (connectionVisibility < 0.005) break;
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > reach) continue;
          const strength = 1 - distance / reach;
          const edgeOrder = ((i * 17 + j * 13) % Math.max(1, nodes.length)) / Math.max(1, nodes.length);
          const connectionReveal = clamp((loaderProgress - 0.2 - edgeOrder * 0.28) / 0.48, 0, 1);
          if (connectionReveal <= 0) continue;
          const easedConnection = 1 - Math.pow(1 - connectionReveal, 3);
          const bCollapsing = founderWasActive && founderTheme > 0.015 && !frameTargetByNode.has(j);
          const bCollapseAlpha = bCollapsing
            ? b.spawn * clamp(Math.hypot(b.x - founderCenter.x, b.y - founderCenter.y) / (width < 700 ? 62 : 88), 0, 1)
            : 1;
          const collapseAlpha = Math.min(aCollapseAlpha, bCollapseAlpha);
          ctx!.strokeStyle = `rgba(${Math.min(255, lineColor[0] + navReveal * 18)}, ${Math.min(255, lineColor[1] + navReveal * 35)}, ${Math.min(255, lineColor[2] + navReveal * 25)}, ${strength * (0.32 * edge + activity * 0.36 + navReveal * 0.42 + originMix * 0.22) * easedConnection * collapseAlpha * connectionVisibility})`;
          ctx!.lineWidth = 0.7 + navReveal * 0.24 + originMix * 0.18;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(a.x + (b.x - a.x) * easedConnection, a.y + (b.y - a.y) * easedConnection);
          ctx!.stroke();
          // A few travelling signals reveal the graph's connectivity.
          if (loaderProgress >= 1 && i % 11 === 0 && j % 3 === 0 && distance > 55) {
            const progress = (elapsed * 0.15 + a.phase / (Math.PI * 2)) % 1;
            ctx!.fillStyle = `rgba(${signalColor[0]}, ${signalColor[1]}, ${signalColor[2]}, ${strength * (0.65 + navReveal * 0.3 + originMix * 0.2) * collapseAlpha * connectionVisibility})`;
            ctx!.beginPath();
            ctx!.arc(a.x + (b.x - a.x) * progress, a.y + (b.y - a.y) * progress, 1.25 + navReveal * 0.65, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
        if (aCollapsing && aCollapseAlpha > 0.02) {
          ctx!.strokeStyle = `rgba(${signalColor[0]}, ${signalColor[1]}, ${signalColor[2]}, ${founderTheme * aCollapseAlpha * 0.2})`;
          ctx!.lineWidth = 0.45 + a.depth * 0.3;
          ctx!.lineCap = 'round';
          ctx!.beginPath();
          ctx!.moveTo(a.x - a.vx * 5.5, a.y - a.vy * 5.5);
          ctx!.lineTo(a.x, a.y);
          ctx!.stroke();
        }
        ctx!.fillStyle = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${(0.28 + a.depth * 0.34 + activity * 0.35 + navReveal * 0.45 + originMix * 0.2) * edge * nodeReveal * aCollapseAlpha})`;
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, 0.8 + a.depth * 1.25 + activity + navReveal * 0.55, 0, Math.PI * 2);
        ctx!.fill();
        if (i % 9 === 0 && nodeReveal > 0) {
          ctx!.strokeStyle = `rgba(${frameColor[0]}, ${frameColor[1]}, ${frameColor[2]}, ${(0.15 * edge + activity * 0.25 + navReveal * 0.2 + originMix * 0.18) * nodeReveal * aCollapseAlpha * connectionVisibility})`;
          ctx!.beginPath();
          ctx!.arc(a.x, a.y, 5 + a.depth * 2, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }
      if (frameReveal > 0.01 && frameAssignments.length > 2) {
        ctx!.strokeStyle = `rgba(${frameColor[0]}, ${frameColor[1]}, ${frameColor[2]}, ${frameReveal * (0.82 + originMix * 0.14)})`;
        ctx!.lineWidth = 0.9 + originMix * 0.25;
        const nodeByTarget = new Map(frameAssignments.map(assignment => [assignment.target, assignment.node]));
        frameGroups.forEach(group => {
          ctx!.beginPath();
          let started = false;
          for (let targetIndex = group.start; targetIndex < group.start + group.count; targetIndex++) {
            const nodeIndex = nodeByTarget.get(targetIndex);
            if (nodeIndex === undefined) continue;
            const node = nodes[nodeIndex];
            if (!started) {
              ctx!.moveTo(node.x, node.y);
              started = true;
            } else {
              ctx!.lineTo(node.x, node.y);
            }
          }
          if (group.closed && started) ctx!.closePath();
          if (started) ctx!.stroke();
        });
        frameAssignments.forEach(assignment => {
          const node = nodes[assignment.node];
          ctx!.fillStyle = `rgba(${frameNodeColor[0]}, ${frameNodeColor[1]}, ${frameNodeColor[2]}, ${0.38 + frameReveal * 0.62})`;
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, 1.3 + frameReveal * 0.8, 0, Math.PI * 2);
          ctx!.fill();
        });
      }
      if (loaderProgress >= 1) {
        if (!loaderComplete) {
          loaderComplete = true;
          titleNetwork.triggerPulse(26);
          readyTimer = window.setTimeout(() => {
            document.documentElement.classList.add('byte-page-ready');
            window.dispatchEvent(new CustomEvent('byte:page-ready'));
            document.body.style.overflow = previousOverflow;
          }, 180);
        }
        titleNetwork.draw(ctx!, nodes, step, pointer, scrollEnergy, !finePointer.matches, !motion.matches);
      }
    }

    function tick(time: number) {
      const step = previous ? Math.min((time - previous) / 16.667, 2) : 1;
      previous = time;
      draw(step);
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!motion.matches && !document.hidden && inView) {
        frame = requestAnimationFrame(tick);
      }
    }
    function preference() {
      if (motion.matches) {
        titleNetwork.reset();
        loaderComplete = true;
        document.documentElement.classList.add('byte-page-ready');
        window.dispatchEvent(new CustomEvent('byte:page-ready'));
        document.body.style.overflow = previousOverflow;
      }
      sync();
    }
    function move(event: PointerEvent) {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }
    function leave() { pointer.active = false; }
    function scroll() {
      if (!motion.matches && inView) {
        scrollEnergy = clamp(scrollEnergy + (window.scrollY - scrollY) * 0.18, -20, 20);
      }
      scrollY = window.scrollY;
    }
    function navState(event: Event) {
      navOpen = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
      if (motion.matches) draw(0);
    }
    function memberStateChange() {
      frameElement = null;
      frameMode = '';
      draw(0);
    }
    function refreshRouteSurface() {
      // Astro replaces the route content while preserving this canvas. Rebind
      // the title/achievement integrations to the newly swapped page DOM.
      document.documentElement.classList.add('has-node-mesh');
      if (loaderComplete) document.documentElement.classList.add('byte-page-ready');
      titleNetwork.dispose();
      surface = findSurface();
      titleNetwork = createTitleNetwork(surface, titleCanvas);
      frameElement = null;
      frameMode = '';
      frameTargets = [];
      frameAssignments = [];
      frameGroups = [];
      frameReveal = 0;
      outlineCache = { key: '', points: [] };
      if (canvas) delete canvas.dataset.meshResponse;
      titleNetwork.resize();
      if (motion.matches) draw(0);
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    document.documentElement.classList.add('byte-page-ready');
    resize();
    preference();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('byte:nav-state', navState);
    window.addEventListener('byte:member-active', memberStateChange);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('astro:after-swap', refreshRouteSurface);
    motion.addEventListener('change', preference);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(readyTimer);
      document.body.style.overflow = previousOverflow;
      observer.disconnect();
      titleNetwork.dispose();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('byte:nav-state', navState);
      window.removeEventListener('byte:member-active', memberStateChange);
      document.removeEventListener('visibilitychange', sync);
      document.removeEventListener('astro:after-swap', refreshRouteSurface);
      motion.removeEventListener('change', preference);
      document.documentElement.classList.remove('has-node-mesh');
    };
  }, []);

  return <>
    <canvas ref={canvasRef} className="node-mesh" aria-hidden="true" />
    <canvas ref={titleCanvasRef} className="title-network" aria-hidden="true" />
  </>;
}
