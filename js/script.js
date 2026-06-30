/* ---------- PARTICLES ---------- */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let   W, H, particles;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function createParticles(n = 55) {
  particles = Array.from({ length: n }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    r:  Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    a:  Math.random() * 0.6 + 0.2,
  }));
}
createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59,130,246,${p.a})`;
    ctx.fill();
  });
  // draw connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist/140)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
  if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
}
drawParticles();

/* ---------- INTERSECTION OBSERVER (generic reveal) ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll && e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .project-card, .timeline-item').forEach(el => {
  revealObs.observe(el);
});

/* ---------- SKILL BARS ---------- */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('#habilidades').forEach(el => skillObs.observe(el));

/* ---------- STAGGERED PROJECT CARDS ---------- */
const projectObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const cards = e.target.querySelectorAll('.project-card');
      cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), i * 120);
      });
      projectObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.projects-grid').forEach(el => projectObs.observe(el));

/* ---------- STAGGERED TIMELINE ---------- */
const timelineObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const items = e.target.querySelectorAll('.timeline-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 150);
      });
      timelineObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline').forEach(el => timelineObs.observe(el));

/* ---------- NAV ACTIVE STATE ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + e.target.id
          ? 'var(--accent-light)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => navObs.observe(s));

/* ---------- STAT COUNT-UP ---------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  if (Number.isNaN(target)) return; // e.g. the infinity stat, left as-is
  const suffix = el.dataset.suffix || '';
  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  if (prefersReducedMotion) {
    el.textContent = target + suffix;
  } else {
    requestAnimationFrame(tick);
  }
}

const statObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-number[data-count]').forEach(animateCount);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.about-stats').forEach(el => statObs.observe(el));

/* ---------- SCROLL TO TOP ---------- */
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
  });
}
