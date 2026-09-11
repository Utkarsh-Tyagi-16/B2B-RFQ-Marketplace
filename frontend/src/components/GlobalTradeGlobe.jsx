import { useEffect, useRef } from 'react';

/**
 * GlobalTradeGlobe.jsx
 * High-performance 3D canvas rendering an interactive aerospace & global trade globe:
 * - Dotted matrix planetary surface with 3D polar rotation
 * - Solar corona rim glow (amber/orange top flare + electric blue atmospheric limb)
 * - Major international trade hubs with pulsing radar rings & HUD tags
 * - Parabolic bezier trade arcs with traveling quotation/tender energy pulses
 * - Interactive cursor parallax
 */
export default function GlobalTradeGlobe({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;

    // Mouse tracking for subtle interactive rotation
    let targetRotY = 0;
    let targetRotX = 0.22; // subtle axial tilt
    let currentRotY = 0;
    let currentRotX = 0.22;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.4;
      targetRotX = 0.22 + y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle high DPI resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Global Hubs (lat in rad, lon in rad, name, code)
    const hubs = [
      { name: 'FRANKFURT', code: 'FRA-EU', lat: 0.87, lon: 0.15, primary: true },
      { name: 'LONDON', code: 'LON-UK', lat: 0.90, lon: -0.01 },
      { name: 'DUBAI', code: 'DXB-ME', lat: 0.44, lon: 0.96, primary: true },
      { name: 'MUMBAI', code: 'BOM-IN', lat: 0.33, lon: 1.27, primary: true },
      { name: 'SINGAPORE', code: 'SIN-SEA', lat: 0.02, lon: 1.81 },
      { name: 'TOKYO', code: 'HND-JP', lat: 0.62, lon: 2.44, primary: true },
      { name: 'NEW YORK', code: 'JFK-US', lat: 0.71, lon: -1.29, primary: true },
      { name: 'CAIRO', code: 'CAI-AF', lat: 0.52, lon: 0.54 },
      { name: 'SYDNEY', code: 'SYD-AU', lat: -0.59, lon: 2.64 },
    ];

    // Trade routes connecting hubs (sourceIdx, targetIdx, speed, progress)
    const routes = [
      { from: 0, to: 2, progress: 0.15, speed: 0.005 }, // Frankfurt -> Dubai
      { from: 2, to: 3, progress: 0.45, speed: 0.006 }, // Dubai -> Mumbai
      { from: 3, to: 4, progress: 0.70, speed: 0.005 }, // Mumbai -> Singapore
      { from: 4, to: 5, progress: 0.20, speed: 0.006 }, // Singapore -> Tokyo
      { from: 1, to: 6, progress: 0.85, speed: 0.004 }, // London -> New York
      { from: 6, to: 0, progress: 0.35, speed: 0.005 }, // New York -> Frankfurt
      { from: 3, to: 0, progress: 0.60, speed: 0.004 }, // Mumbai -> Frankfurt
      { from: 2, to: 7, progress: 0.10, speed: 0.007 }, // Dubai -> Cairo
    ];

    // Pre-generate static globe points (dotted latitude/longitude grid)
    const globePoints = [];
    const latSteps = 24;
    const lonSteps = 48;

    for (let i = 0; i <= latSteps; i++) {
      const lat = (i / latSteps - 0.5) * Math.PI; // -PI/2 to PI/2
      const radiusAtLat = Math.cos(lat);
      const y = Math.sin(lat);

      // Vary point density by latitude
      const steps = Math.max(8, Math.floor(lonSteps * radiusAtLat));
      for (let j = 0; j < steps; j++) {
        const lon = (j / steps) * Math.PI * 2;
        const x = radiusAtLat * Math.cos(lon);
        const z = radiusAtLat * Math.sin(lon);

        // Simple density filtering to simulate land clusters
        const noise = Math.sin(lat * 3 + lon * 2) * Math.cos(lon * 4 - lat);
        globePoints.push({ x, y, z, lat, lon, density: noise });
      }
    }

    // Static background stars
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    let baseRotation = 0;

    // Projection math
    function project3D(x, y, z, cx, cy, R, rotX, rotY) {
      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate around X (axial tilt)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      return {
        px: cx + x1 * R,
        py: cy - y2 * R, // invert Y for canvas
        depth: z2,
        visible: z2 > -0.05,
      };
    }

    // Animation Loop
    const render = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      currentRotY += (targetRotY - currentRotY) * 0.04;
      currentRotX += (targetRotX - currentRotX) * 0.04;

      // Slow continuous orbital rotation
      baseRotation += 0.0018;
      const totalRotY = baseRotation + currentRotY;
      const totalRotX = currentRotX;

      // Dynamic Globe positioning (center-right bias for desktop hero split)
      const isMobile = width < 768;
      const cx = isMobile ? width * 0.5 : width * 0.72;
      const cy = isMobile ? height * 0.58 : height * 0.50;
      const R = isMobile ? Math.min(width, height) * 0.46 : Math.min(width, height) * 0.54;

      // ─── 1. Background Stars & Nebula Glow ────────────────────────────────
      stars.forEach((star) => {
        const pulse = 0.5 + 0.5 * Math.sin(time * star.pulseSpeed);
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * pulse})`;
        ctx.fill();
      });

      // ─── 2. Planetary Atmospheric Halos ──────────────────────────────────
      // Top-Right Solar Corona Glow (warm fiery amber/orange sunrise)
      const coronaGrad = ctx.createRadialGradient(
        cx + R * 0.45,
        cy - R * 0.45,
        R * 0.3,
        cx + R * 0.35,
        cy - R * 0.35,
        R * 1.55
      );
      coronaGrad.addColorStop(0, 'rgba(249, 115, 22, 0.42)');
      coronaGrad.addColorStop(0.35, 'rgba(234, 88, 12, 0.20)');
      coronaGrad.addColorStop(0.7, 'rgba(180, 83, 9, 0.08)');
      coronaGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // Lower-Left Electric Azure Atmospheric Limb Glow
      const azureGrad = ctx.createRadialGradient(
        cx - R * 0.5,
        cy + R * 0.3,
        R * 0.2,
        cx - R * 0.4,
        cy + R * 0.2,
        R * 1.35
      );
      azureGrad.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
      azureGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.16)');
      azureGrad.addColorStop(0.8, 'rgba(30, 58, 138, 0.05)');
      azureGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = azureGrad;
      ctx.fill();

      // Dark planetary sphere shadow body
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(2, 5, 12, 0.88)';
      ctx.fill();

      // Internal subtle rim illumination
      const innerRim = ctx.createRadialGradient(
        cx + R * 0.3,
        cy - R * 0.3,
        R * 0.5,
        cx,
        cy,
        R
      );
      innerRim.addColorStop(0, 'transparent');
      innerRim.addColorStop(0.85, 'rgba(249, 115, 22, 0.05)');
      innerRim.addColorStop(0.98, 'rgba(56, 189, 248, 0.22)');
      innerRim.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
      ctx.fillStyle = innerRim;
      ctx.fill();

      // ─── 3. Dotted Matrix Planetary Surface ─────────────────────────────
      globePoints.forEach((pt) => {
        const proj = project3D(pt.x, pt.y, pt.z, cx, cy, R, totalRotX, totalRotY);
        if (!proj.visible) return;

        // Front-facing depth scaling
        const depthFactor = (proj.depth + 0.1) / 1.1; // 0 to 1
        if (depthFactor <= 0) return;

        // Color blending: warm amber on top, azure on bottom, crisp white at limb
        const isUpper = pt.y > 0.05;
        const color = isUpper
          ? `rgba(251, 146, 60, ${depthFactor * 0.75})`
          : `rgba(147, 197, 253, ${depthFactor * 0.65})`;

        const dotRadius = 0.7 + depthFactor * 1.0;

        ctx.beginPath();
        ctx.arc(proj.px, proj.py, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // ─── 4. Curved Parabolic Trade Arcs (Tenders & Quotes) ──────────────
      routes.forEach((route) => {
        const fromHub = hubs[route.from];
        const toHub = hubs[route.to];

        const x1 = Math.cos(fromHub.lat) * Math.cos(fromHub.lon);
        const y1 = Math.sin(fromHub.lat);
        const z1 = Math.cos(fromHub.lat) * Math.sin(fromHub.lon);

        const x2 = Math.cos(toHub.lat) * Math.cos(toHub.lon);
        const y2 = Math.sin(toHub.lat);
        const z2 = Math.cos(toHub.lat) * Math.sin(toHub.lon);

        const p1 = project3D(x1, y1, z1, cx, cy, R, totalRotX, totalRotY);
        const p2 = project3D(x2, y2, z2, cx, cy, R, totalRotX, totalRotY);

        if (!p1.visible && !p2.visible) return;

        // Midpoint elevated in 3D for spherical arc curve
        const midX = (x1 + x2) * 0.5 * 1.35;
        const midY = (y1 + y2) * 0.5 * 1.35;
        const midZ = (z1 + z2) * 0.5 * 1.35;
        const pMid = project3D(midX, midY, midZ, cx, cy, R, totalRotX, totalRotY);

        // Draw bezier arc trajectory
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.quadraticCurveTo(pMid.px, pMid.py, p2.px, p2.py);

        const avgDepth = (p1.depth + p2.depth + pMid.depth) / 3;
        const arcAlpha = Math.max(0.1, Math.min(0.65, (avgDepth + 0.3) * 0.7));

        ctx.strokeStyle = `rgba(249, 115, 22, ${arcAlpha})`;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated quotation pulse beacon traveling along the arc
        route.progress = (route.progress + route.speed) % 1;
        const t = route.progress;
        // Quadratic bezier formula: B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
        const pulseX = (1 - t) * (1 - t) * p1.px + 2 * (1 - t) * t * pMid.px + t * t * p2.px;
        const pulseY = (1 - t) * (1 - t) * p1.py + 2 * (1 - t) * t * pMid.py + t * t * p2.py;

        // Pulse glow
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // ─── 5. Global Hub Nodes & HUD Labels ───────────────────────────────
      hubs.forEach((hub) => {
        const x = Math.cos(hub.lat) * Math.cos(hub.lon);
        const y = Math.sin(hub.lat);
        const z = Math.cos(hub.lat) * Math.sin(hub.lon);

        const proj = project3D(x, y, z, cx, cy, R, totalRotX, totalRotY);
        if (!proj.visible || proj.depth < 0.05) return;

        const pulse = (Math.sin(time * 0.004 + hub.lon * 2) + 1) * 0.5;

        // Outer radar pulse ring
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 4 + pulse * 7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.8 - pulse * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner glowing pin
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Futuristic HUD Label Tag
        if (proj.depth > 0.35 || hub.primary) {
          ctx.font = '600 10px "Space Grotesk", sans-serif';
          const text = hub.name;
          const textWidth = ctx.measureText(text).width;
          const tagX = proj.px + 10;
          const tagY = proj.py - 12;

          // HUD Leader Line
          ctx.beginPath();
          ctx.moveTo(proj.px, proj.py);
          ctx.lineTo(tagX, tagY + 6);
          ctx.lineTo(tagX + textWidth + 8, tagY + 6);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text HUD background badge
          ctx.fillStyle = 'rgba(4, 8, 18, 0.85)';
          ctx.fillRect(tagX - 2, tagY - 6, textWidth + 10, 14);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(tagX - 2, tagY - 6, textWidth + 10, 14);

          // Text label
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, tagX + 3, tagY + 5);
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`global-trade-globe-container ${className}`}>
      <canvas ref={canvasRef} className="global-trade-globe-canvas" />
    </div>
  );
}
