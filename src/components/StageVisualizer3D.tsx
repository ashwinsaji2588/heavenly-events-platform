'use client';

import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Sparkles, Layers, Maximize2, Compass } from 'lucide-react';

export default function StageVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightingMode, setLightingMode] = useState<'daylight' | 'evening'>('evening');
  const [activeTheme, setActiveTheme] = useState<'mandap' | 'reception' | 'minimal'>('mandap');
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      // Dimensions
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Background Ambiance
      if (lightingMode === 'evening') {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.2);
        bgGrad.addColorStop(0, '#1c1f1a');
        bgGrad.addColorStop(1, '#0e110d');
        ctx.fillStyle = bgGrad;
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#2d332c');
        bgGrad.addColorStop(1, '#1b201a');
        ctx.fillStyle = bgGrad;
      }
      ctx.fillRect(0, 0, width, height);

      // 3D Isometric Projection Center
      const centerX = width / 2;
      const centerY = height * 0.62;
      const scale = width / 800;

      // Rotate angle if active
      if (isRotating) {
        angle += 0.005;
      }

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Helper function to project 3D point (X, Y, Z) to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y axis
        const rx = x * cosA - z * sinA;
        const rz = x * sinA + z * cosA;
        // Isometric perspective projection
        const px = centerX + rx * 1.1 * scale;
        const py = centerY - y * scale + rz * 0.5 * scale;
        return { x: px, y: py };
      };

      // 1. Draw Stage Platform (36ft x 20ft x 3ft)
      const stageW = 240;
      const stageD = 140;
      const stageH = 22;

      // Stage base vertices
      const p1 = project(-stageW, 0, -stageD);
      const p2 = project(stageW, 0, -stageD);
      const p3 = project(stageW, 0, stageD);
      const p4 = project(-stageW, 0, stageD);

      const t1 = project(-stageW, stageH, -stageD);
      const t2 = project(stageW, stageH, -stageD);
      const t3 = project(stageW, stageH, stageD);
      const t4 = project(-stageW, stageH, stageD);

      // Stage Front Face
      ctx.fillStyle = lightingMode === 'evening' ? '#242a22' : '#3c443b';
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(t3.x, t3.y);
      ctx.lineTo(t4.x, t4.y);
      ctx.closePath();
      ctx.fill();

      // Stage Top Surface (Carpet / Runway)
      const topGrad = ctx.createLinearGradient(t1.x, t1.y, t3.x, t3.y);
      if (lightingMode === 'evening') {
        topGrad.addColorStop(0, '#c5a880');
        topGrad.addColorStop(1, '#8f7351');
      } else {
        topGrad.addColorStop(0, '#e5d9c5');
        topGrad.addColorStop(1, '#c5b69c');
      }
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.lineTo(t3.x, t3.y);
      ctx.lineTo(t4.x, t4.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c5a880';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Draw Theme Décor Architecture
      if (activeTheme === 'mandap') {
        // Four Golden Mandap Pillars & Floral Canopy
        const pillarPositions = [
          [-140, -60],
          [140, -60],
          [-120, 60],
          [120, 60],
        ];

        pillarPositions.forEach(([px, pz]) => {
          const b = project(px, stageH, pz);
          const t = project(px, stageH + 110, pz);

          // Pillar Shadow
          ctx.beginPath();
          ctx.strokeStyle = lightingMode === 'evening' ? '#d4af37' : '#947a28';
          ctx.lineWidth = 6 * scale;
          ctx.lineCap = 'round';
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();

          // Pillar Floral Capital
          ctx.fillStyle = '#ffdfa0';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 6 * scale, 0, Math.PI * 2);
          ctx.fill();
        });

        // Floral Canopy Arch
        const topL = project(-140, stageH + 110, -60);
        const topR = project(140, stageH + 110, -60);
        const topFL = project(-120, stageH + 110, 60);
        const topFR = project(120, stageH + 110, 60);

        ctx.strokeStyle = '#e6c875';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(topL.x, topL.y);
        ctx.lineTo(topR.x, topR.y);
        ctx.lineTo(topFR.x, topFR.y);
        ctx.lineTo(topFL.x, topFL.y);
        ctx.closePath();
        ctx.stroke();

        // Central Floral Dome
        const domeApex = project(0, stageH + 145, 0);
        ctx.fillStyle = lightingMode === 'evening' ? 'rgba(230, 200, 117, 0.4)' : 'rgba(230, 200, 117, 0.7)';
        ctx.beginPath();
        ctx.moveTo(topL.x, topL.y);
        ctx.quadraticCurveTo(domeApex.x, domeApex.y - 15, topR.x, topR.y);
        ctx.lineTo(topFR.x, topFR.y);
        ctx.quadraticCurveTo(domeApex.x, domeApex.y - 10, topFL.x, topFL.y);
        ctx.closePath();
        ctx.fill();

        // Ceremonial Brass Oil Lamps (Nilavilakku) on Stage
        [-60, 60].forEach((lampX) => {
          const lp = project(lampX, stageH, 70);
          ctx.fillStyle = '#ffbe3b';
          ctx.beginPath();
          ctx.arc(lp.x, lp.y - 12, 4 * scale, 0, Math.PI * 2);
          ctx.fill();

          if (lightingMode === 'evening') {
            // Flame Glow
            const flameGlow = ctx.createRadialGradient(lp.x, lp.y - 12, 1, lp.x, lp.y - 12, 14);
            flameGlow.addColorStop(0, 'rgba(255, 190, 59, 0.8)');
            flameGlow.addColorStop(1, 'rgba(255, 190, 59, 0)');
            ctx.fillStyle = flameGlow;
            ctx.beginPath();
            ctx.arc(lp.x, lp.y - 12, 14, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      } else if (activeTheme === 'reception') {
        // Modern Geometric Truss & Illuminated Backdrop
        const trussL = project(-180, stageH, -80);
        const trussTL = project(-180, stageH + 130, -80);
        const trussTR = project(180, stageH + 130, -80);
        const trussR = project(180, stageH, -80);

        ctx.strokeStyle = '#7c8d9c';
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        ctx.moveTo(trussL.x, trussL.y);
        ctx.lineTo(trussTL.x, trussTL.y);
        ctx.lineTo(trussTR.x, trussTR.y);
        ctx.lineTo(trussR.x, trussR.y);
        ctx.stroke();

        // Multi-tier backdrop panels
        [-100, -35, 35, 100].forEach((px) => {
          const bp = project(px, stageH, -70);
          const tp = project(px, stageH + 105, -70);
          ctx.strokeStyle = lightingMode === 'evening' ? '#d4af37' : '#9c8446';
          ctx.lineWidth = 14 * scale;
          ctx.beginPath();
          ctx.moveTo(bp.x, bp.y);
          ctx.lineTo(tp.x, tp.y);
          ctx.stroke();
        });
      }

      // 3. Ambient Lighting & Spotlights
      if (lightingMode === 'evening') {
        // Warm theatrical spotlight cones
        [-120, 120].forEach((spotX) => {
          const lightSource = project(spotX * 1.5, stageH + 200, 120);
          const target = project(spotX * 0.4, stageH, 0);

          const cone = ctx.createRadialGradient(target.x, target.y, 10, target.x, target.y, 120 * scale);
          cone.addColorStop(0, 'rgba(255, 220, 150, 0.22)');
          cone.addColorStop(1, 'rgba(255, 220, 150, 0)');

          ctx.fillStyle = cone;
          ctx.beginPath();
          ctx.moveTo(lightSource.x, lightSource.y);
          ctx.lineTo(target.x - 70 * scale, target.y);
          ctx.lineTo(target.x + 70 * scale, target.y);
          ctx.closePath();
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [lightingMode, activeTheme, isRotating]);

  return (
    <div className="bg-brand-charcoal/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-brand-gold text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            3D Stage & Spatial Visualizer
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-brand-cream mt-0.5">
            Interactive Setup Architecture
          </h3>
          <p className="text-xs text-brand-muted">
            36ft Stage Width · 20ft Depth · Rigging Clearance 14ft
          </p>
        </div>

        {/* Lighting & Rotation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLightingMode(lightingMode === 'evening' ? 'daylight' : 'evening')}
            className={`py-2 px-3.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              lightingMode === 'evening'
                ? 'bg-brand-surface border-brand-gold text-brand-gold shadow-md'
                : 'bg-brand-surface/40 border-white/10 text-brand-muted hover:text-brand-cream'
            }`}
          >
            {lightingMode === 'evening' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" /> Evening Lights (Active)
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Daylight Mode
              </>
            )}
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isRotating ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-white/10 text-brand-muted'
            }`}
            title="Toggle Orbit Rotation"
          >
            <Compass className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-brand-dark shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
        />

        {/* HUD Dimension Indicators */}
        <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10 text-[11px] text-brand-muted space-y-0.5">
          <div><span className="text-brand-cream font-medium">Stage Span:</span> 36 ft</div>
          <div><span className="text-brand-cream font-medium">Aisle Clearance:</span> 8 ft</div>
          <div><span className="text-brand-cream font-medium">Fascia:</span> Gold Brass Border</div>
        </div>

        <div className="absolute bottom-4 right-4 text-[10px] text-brand-muted bg-brand-dark/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
          Real-time WebGL Engine · On-demand composite
        </div>
      </div>

      {/* Theme Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-brand-muted">Select Decor Preset:</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTheme('mandap')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTheme === 'mandap'
                ? 'bg-brand-gold text-brand-dark font-semibold'
                : 'bg-brand-surface text-brand-muted hover:text-brand-cream'
            }`}
          >
            Pastel Floral Mandap
          </button>
          <button
            onClick={() => setActiveTheme('reception')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTheme === 'reception'
                ? 'bg-brand-gold text-brand-dark font-semibold'
                : 'bg-brand-surface text-brand-muted hover:text-brand-cream'
            }`}
          >
            Architectural Truss & Panels
          </button>
        </div>
      </div>
    </div>
  );
}
