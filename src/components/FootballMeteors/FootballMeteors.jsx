import { useRef, useEffect, useCallback } from 'react';

/**
 * FootballMeteors — canvas component that renders soccer balls
 * flying across the screen like comets / shooting stars.
 * Each ball leaves a glowing trail and rotates while moving.
 */

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

const BALL_EMOJI = '⚽';

class MeteorBall {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(initial = false) {
    const { width, height } = this.canvas;
    // Start from random edges — mostly top & right for a "falling star" feel
    const side = Math.random();
    if (side < 0.5) {
      // From top
      this.x = randomRange(0, width);
      this.y = randomRange(-80, -20);
    } else if (side < 0.8) {
      // From right
      this.x = width + randomRange(20, 80);
      this.y = randomRange(0, height * 0.5);
    } else {
      // From left (rarer)
      this.x = randomRange(-80, -20);
      this.y = randomRange(0, height * 0.3);
    }

    this.size = randomRange(14, 26);
    const speed = randomRange(2.5, 6);
    const angle = randomRange(Math.PI * 0.15, Math.PI * 0.4); // roughly diagonal downward
    this.vx = Math.cos(angle) * speed * (side >= 0.8 ? 1 : (Math.random() < 0.5 ? -1 : 1));
    // always move downward
    this.vy = Math.sin(angle) * speed;
    if (this.vy < 0) this.vy = -this.vy;

    this.rotation = 0;
    this.rotationSpeed = randomRange(-0.12, 0.12);
    this.alpha = initial ? randomRange(0.4, 0.9) : 0;
    this.fadeIn = !initial;
    this.trail = [];
    this.maxTrail = Math.floor(randomRange(12, 25));
    // Trail color
    this.trailHue = Math.random() < 0.5 ? 45 : 200; // gold or blue accent
  }

  update() {
    // Fade in
    if (this.fadeIn && this.alpha < 0.9) {
      this.alpha += 0.02;
      if (this.alpha >= 0.9) this.fadeIn = false;
    }

    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    // Offscreen check
    const { width, height } = this.canvas;
    if (this.x < -120 || this.x > width + 120 || this.y > height + 120) {
      this.reset();
    }
  }

  draw(ctx) {
    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const progress = i / this.trail.length;
      const trailAlpha = progress * 0.35 * t.alpha;
      const radius = this.size * 0.35 * progress;

      ctx.save();
      ctx.globalAlpha = trailAlpha;
      ctx.beginPath();
      ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.trailHue}, 80%, 65%, 1)`;
      ctx.fill();
      ctx.restore();
    }

    // Draw glow
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
    const glow = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 1.2
    );
    glow.addColorStop(0, `hsla(${this.trailHue}, 90%, 70%, 0.6)`);
    glow.addColorStop(1, `hsla(${this.trailHue}, 90%, 70%, 0)`);
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.restore();

    // Draw the soccer ball emoji
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = `${this.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(BALL_EMOJI, 0, 0);
    ctx.restore();
  }
}

export default function FootballMeteors({
  count = 8,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const ballsRef = useRef([]);
  const animRef = useRef();

  const animate = useCallback((ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ballsRef.current.forEach((ball) => {
      ball.update();
      ball.draw(ctx);
    });

    animRef.current = requestAnimationFrame(() => animate(ctx, canvas));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create initial balls staggered across the screen
    ballsRef.current = [];
    for (let i = 0; i < count; i++) {
      ballsRef.current.push(new MeteorBall(canvas));
    }

    animate(ctx, canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [animate, count]);

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
        zIndex: 1,
        ...style,
      }}
    />
  );
}
