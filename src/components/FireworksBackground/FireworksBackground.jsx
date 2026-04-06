import { useRef, useEffect, useCallback } from 'react';

// Fireworks canvas component inspired by animate-ui/backgrounds/fireworks
// Pure canvas implementation — no external dependencies needed

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class Particle {
  constructor(x, y, color, speed, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = speed;
    this.size = size;
    this.angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(this.angle) * this.speed,
      y: Math.sin(this.angle) * this.speed,
    };
    this.alpha = 1;
    this.decay = randomRange(0.012, 0.03);
    this.gravity = 0.04;
  }
  update() {
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class Firework {
  constructor(canvas, colors) {
    this.canvas = canvas;
    this.colors = colors;
    // Explode immediately at a random position across the screen
    this.x = randomRange(canvas.width * 0.1, canvas.width * 0.9);
    this.y = randomRange(canvas.height * 0.1, canvas.height * 0.7);
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.particles = [];
    this.explode();
  }
  update() {
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.alpha > 0);
  }
  explode() {
    const count = Math.floor(randomRange(40, 65));
    for (let i = 0; i < count; i++) {
      this.particles.push(
        new Particle(
          this.x, this.y, this.color,
          randomRange(1.5, 6),
          randomRange(1.2, 3.5)
        )
      );
    }
  }
  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
  get isDone() {
    return this.particles.length === 0;
  }
}

export default function FireworksBackground({
  colors = ['#ffd700', '#ffaa00', '#00e676', '#00b0ff', '#d500f9', '#ff6b35'],
  population = 1,
  duration = 3000,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const fireworksRef = useRef([]);
  const animFrameRef = useRef();
  const timerRef = useRef();
  const activeRef = useRef(true);

  const animate = useCallback((ctx, canvas) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworksRef.current.forEach(fw => {
      fw.update();
      fw.draw(ctx);
    });
    fireworksRef.current = fireworksRef.current.filter(fw => !fw.isDone);

    // Continuous spawning while active — higher rate for more spectacle
    if (activeRef.current && Math.random() < 0.08 * population) {
      fireworksRef.current.push(new Firework(canvas, colors));
    }

    animFrameRef.current = requestAnimationFrame(() => animate(ctx, canvas));
  }, [colors, population]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    activeRef.current = true;

    // Immediate burst — several fireworks at once so user sees explosions right away
    for (let i = 0; i < population + 3; i++) {
      setTimeout(() => {
        fireworksRef.current.push(new Firework(canvas, colors));
      }, i * 150);
    }

    animate(ctx, canvas);

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        activeRef.current = false;
      }, duration);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(timerRef.current);
    };
  }, [animate, colors, population, duration]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
