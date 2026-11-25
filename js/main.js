/* ================================================================
   main.js  |  Navigation · Typewriter · Canvas · Scroll Reveal
   ================================================================ */
'use strict';

/* ---------------------------------------------------------------
   1. NAV — hamburger, active link, scroll shadow
--------------------------------------------------------------- */
(function initNav() {
  const hamburger = document.getElementById('hamburger');
  const panel     = document.getElementById('nav-panel');
  const overlay   = document.getElementById('nav-overlay');
  const navbar    = document.getElementById('navbar');
  const panelLinks = panel ? Array.from(panel.querySelectorAll('.panel-link')) : [];
  const navLinks   = Array.from(document.querySelectorAll('.nav-links a'));

  function openPanel() {
    hamburger.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (panelLinks[0]) panelLinks[0].focus();
  }

  function closePanel() {
    hamburger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if (hamburger && panel) {
    hamburger.addEventListener('click', () => {
      hamburger.getAttribute('aria-expanded') === 'true' ? closePanel() : openPanel();
    });
    overlay.addEventListener('click', closePanel);
    panelLinks.forEach(l => l.addEventListener('click', closePanel));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });

    // Focus trap inside panel
    panel.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = Array.from(
        panel.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.disabled);
      if (!focusable.length) return;
      const [first, last] = [focusable[0], focusable[focusable.length - 1]];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // Navbar scroll shadow
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Active link on scroll
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function updateActiveLink() {
    const scrollY = window.scrollY + 80;
    let current = '';
    sections.forEach(sec => { if (sec.offsetTop <= scrollY) current = sec.id; });

    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ---------------------------------------------------------------
   2. TYPEWRITER — cycling through phrases
--------------------------------------------------------------- */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const phrases = [
    'Python Programmer',
    'Data Science Enthusiast',
    'Problem Solver',
    'C Developer',
    'Database Explorer',
    'Lifelong Learner',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;
  const PAUSE_FULL = 1800, PAUSE_EMPTY = 500;
  const TYPE_SPEED = 75, DELETE_SPEED = 38;

  function tick() {
    const current = phrases[phraseIdx];
    el.textContent = deleting ? current.slice(0, charIdx - 1) : current.slice(0, charIdx + 1);

    if (deleting) {
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    } else {
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    }
  }

  setTimeout(tick, 600);
})();


/* ---------------------------------------------------------------
   3. HERO CANVAS — floating particle network
--------------------------------------------------------------- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['rgba(192,21,43,', 'rgba(212,160,23,', 'rgba(224,106,24,'];
  const N = 55; // particle count
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = 1.5 + Math.random() * 2;
      this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.a  = .3 + Math.random() * .5;
    };
    this.reset();
  }

  function initParticles() {
    particles = Array.from({ length: N }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212,160,23,${(1 - dist / 120) * .08})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }

    // Draw & move particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.a + ')';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -5 || p.x > W + 5 || p.y < -5 || p.y > H + 5) p.reset();
    });

    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();
  window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });
})();


/* ---------------------------------------------------------------
   4. ARC REACTOR DOTS — position dots around ring
--------------------------------------------------------------- */
(function initRingDots() {
  const wrap = document.querySelector('.ring-dots');
  if (!wrap) return;
  const count = 6;
  const radius = 50; // percent offset from centre
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.classList.add('ring-dot');
    const angle = (i / count) * 2 * Math.PI;
    // position relative to the parent 100% circle
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    dot.style.cssText = `top:${y}%; left:${x}%; width:${i % 2 === 0 ? 6 : 4}px; height:${i % 2 === 0 ? 6 : 4}px; transform: translate(-50%,-50%); transform-origin: unset;`;
    wrap.appendChild(dot);
  }
})();


/* ---------------------------------------------------------------
   5. SCROLL REVEAL
--------------------------------------------------------------- */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));
})();


/* ---------------------------------------------------------------
   6. SKILL RINGS — animated SVG progress rings
--------------------------------------------------------------- */
(function initSkillRings() {
  /*
   * Edit the `level` (0–100) for each skill below.
   * The label shows inside the ring (suggest a word, not a number).
   */
  const SKILLS = [
    { id: 'python', emoji: '🐍', name: 'Python',       sub: 'Primary Language',   level: 72, label: 'Strong',  color: '#e8193a', pills: ['NumPy','Pandas','Basics'] },
    { id: 'c',      emoji: '⚙️', name: 'C',            sub: 'Systems Programming', level: 65, label: 'Good',    color: '#e06a18', pills: ['Pointers','DSA','Algorithms'] },
    { id: 'mysql',  emoji: '🗄️', name: 'MySQL / DBMS', sub: 'Database Systems',    level: 68, label: 'Solid',   color: '#d4a017', pills: ['Queries','Joins','Schema'] },
  ];

  const container = document.getElementById('skills-cards');
  if (!container) return;

  const CIRC = 2 * Math.PI * 35; // circumference for r=35

  container.innerHTML = SKILLS.map(s => `
    <div class="skill-card glass reveal" tabindex="0" aria-label="${s.name} skill card">
      <div class="skill-card-inner">
        <div class="skill-emoji" aria-hidden="true">${s.emoji}</div>

        <div class="progress-ring-wrap" role="progressbar"
             aria-valuenow="${s.level}" aria-valuemin="0" aria-valuemax="100"
             aria-label="${s.name} proficiency">
          <svg width="90" height="90" viewBox="0 0 80 80" aria-hidden="true">
            <circle class="ring-bg"   cx="40" cy="40" r="35"/>
            <circle class="ring-fill" cx="40" cy="40" r="35"
              stroke="${s.color}"
              style="stroke-dasharray:${CIRC.toFixed(1)}; stroke-dashoffset:${CIRC.toFixed(1)};"
              data-target="${((1 - s.level/100)*CIRC).toFixed(1)}"/>
          </svg>
          <div class="ring-label">${s.label}</div>
        </div>

        <h3>${s.name}</h3>
        <p class="skill-sub">${s.sub}</p>
        <div class="skill-pills">
          ${s.pills.map(p => `<span class="skill-pill">${p}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  // Animate rings on scroll-into-view
  const rings = container.querySelectorAll('.ring-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        rings.forEach(r => { r.style.strokeDashoffset = r.dataset.target; });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(container);
})();
