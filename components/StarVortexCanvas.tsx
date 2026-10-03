'use client';

import React, { useEffect, useRef } from 'react';

interface StarTrail {
  radius: number;
  angle: number;
  speed: number;
  length: number;
  width: number;
  alpha: number;
  color: string;
}

export default function StarVortexCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initTrails();
    };

    window.addEventListener('resize', handleResize);

    // Trails configuration
    const numTrails = 320;
    let trails: StarTrail[] = [];

    const colors = [
      '#ffffff', // Brilliant pure white
      '#ffffff', // Extra pure white
      '#f1f5f9', // Crisp silver
      '#a5f3fc', // Electric cyan
      '#bae6fd', // Icy sky blue
      '#38bdf8', // Vibrant blue
    ];

    const initTrails = () => {
      trails = [];
      const maxRadius = Math.sqrt(width * width + height * height) * 0.85;
      
      for (let i = 0; i < numTrails; i++) {
        const radius = Math.pow(Math.random(), 0.75) * maxRadius + 20;
        trails.push({
          radius,
          angle: Math.random() * Math.PI * 2,
          speed: (0.0018 + (1 / Math.sqrt(radius)) * 0.045) * (0.8 + Math.random() * 0.5),
          length: 0.12 + Math.random() * 0.28, // longer arc length
          width: 1.2 + Math.random() * 2.2, // bolder trails
          alpha: 0.45 + Math.random() * 0.55,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initTrails();

    // Render loop
    const render = () => {
      // Clear with dark blue-black background
      ctx.fillStyle = 'rgba(5, 9, 24, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Center of cosmic vortex
      const centerX = width * 0.5;
      const centerY = height * 0.42;

      // Draw all orbiting star trails
      trails.forEach((trail) => {
        trail.angle += trail.speed;
        if (trail.angle > Math.PI * 2) {
          trail.angle -= Math.PI * 2;
        }

        const startAngle = trail.angle;
        const endAngle = trail.angle + trail.length;

        ctx.beginPath();
        ctx.arc(centerX, centerY, trail.radius, startAngle, endAngle, false);
        ctx.strokeStyle = trail.color;
        ctx.lineWidth = trail.width;
        ctx.globalAlpha = trail.alpha;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = trail.color;
        ctx.stroke();

        // Glowing star head at front
        const headX = centerX + Math.cos(endAngle) * trail.radius;
        const headY = centerY + Math.sin(endAngle) * trail.radius;

        ctx.beginPath();
        ctx.arc(headX, headY, trail.width * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.fill();
      });

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // Smooth vignette
      const grad = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, width * 0.9);
      grad.addColorStop(0, 'rgba(5, 9, 24, 0.0)');
      grad.addColorStop(0.75, 'rgba(5, 9, 24, 0.35)');
      grad.addColorStop(1, 'rgba(3, 6, 16, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    // First clear solid
    ctx.fillStyle = '#050918';
    ctx.fillRect(0, 0, width, height);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
