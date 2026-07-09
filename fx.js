/* ============ STARK//PROTOCOL — fx.js ============
   Boot sequence · particle canvas · parallax · scroll reveals
   · panel tilt + cursor glow · nav behavior · count-up
=================================================== */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------------- BOOT SEQUENCE ---------------- */
  const bootLines = [
    { t: 'STARK INDUSTRIES // SECURE TERMINAL v9.2', ok: false },
    { t: 'AUTH HANDSHAKE .......................', ok: true },
    { t: 'OPERATOR: P.M.  CLEARANCE: LEVEL 10', ok: false },
    { t: 'LOADING MISSION: UPSC CSE 2027 .......', ok: true },
    { t: 'MODULES: GS-I  GS-II  GS-III  GS-IV ..', ok: true },
    { t: 'OPTIONAL: ANTHROPOLOGY [JUL 20] ......', ok: true },
    { t: 'TELEMETRY / LOCAL STORAGE ............', ok: true },
    { t: 'J.A.R.V.I.S. ONLINE. WELCOME BACK, SIR.', ok: false }
  ];

  function runBoot(done) {
    const boot = $('#boot');
    const term = $('.boot-term');
    if (!boot) { done(); return; }

    // play once per session; instant skip for reduced motion
    if (reduced || sessionStorage.getItem('stark_booted')) {
      boot.classList.add('off');
      setTimeout(done, 60);
      return;
    }

    let li = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    function nextLine() {
      if (li >= bootLines.length) {
        sessionStorage.setItem('stark_booted', '1');
        setTimeout(() => { boot.classList.add('off'); done(); }, 420);
        return;
      }
      const spec = bootLines[li++];
      const ln = document.createElement('div');
      ln.className = 'ln';
      term.insertBefore(ln, term.lastElementChild);
      ln.appendChild(cursor);
      let ci = 0;
      (function type() {
        if (ci < spec.t.length) {
          cursor.insertAdjacentText('beforebegin', spec.t[ci++]);
          setTimeout(type, 9 + Math.random() * 14);
        } else {
          if (spec.ok) ln.classList.add('ok');
          setTimeout(nextLine, 90);
        }
      })();
    }
    nextLine();

    $('.boot-skip').addEventListener('click', () => {
      sessionStorage.setItem('stark_booted', '1');
      boot.classList.add('off');
      done();
    }, { once: true });
  }

  /* ---------------- PARTICLE CANVAS ---------------- */
  function startParticles() {
    const cv = $('#fxCanvas');
    if (!cv || reduced) return;
    const ctx = cv.getContext('2d');
    let W, H, pts = [], px = 0, py = 0, scrollY = 0;

    function resize() {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
      const n = Math.min(110, Math.floor(W / 11));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random() * 0.7 + 0.3,           // depth → parallax factor
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        hue: Math.random() < 0.85 ? 'arc' : (Math.random() < 0.5 ? 'gold' : 'red')
      }));
    }
    resize();
    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    if (finePointer) {
      addEventListener('pointermove', e => {
        px = (e.clientX / W - 0.5);
        py = (e.clientY / H - 0.5);
      }, { passive: true });
    }

    const COLORS = {
      arc: 'rgba(95,224,255,',
      gold: 'rgba(230,162,60,',
      red: 'rgba(208,37,52,'
    };

    (function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        // depth parallax: scroll + pointer shift scaled by z
        const ox = px * 40 * p.z;
        const oy = py * 40 * p.z - (scrollY * 0.08 * p.z) % (H + 40);
        let yy = p.y + oy;
        yy = ((yy % (H + 40)) + H + 40) % (H + 40) - 20;
        ctx.beginPath();
        ctx.arc(p.x + ox, yy, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.hue] + (0.14 + p.z * 0.3) + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    })();
  }

  /* ---------------- PARALLAX ENGINE ----------------
     data-px  : vertical scroll factor  (e.g. -0.15 moves up slower)
     data-pmx : pointer factor (desktop only)                       */
  function startParallax() {
    if (reduced) return;
    const scrollEls = $$('[data-px]').map(el => ({ el, f: parseFloat(el.dataset.px) }));
    const mouseEls = finePointer
      ? $$('[data-pmx]').map(el => ({ el, f: parseFloat(el.dataset.pmx) }))
      : [];

    let sy = window.scrollY, mx = 0, my = 0, dirty = true;

    addEventListener('scroll', () => { sy = window.scrollY; dirty = true; }, { passive: true });
    if (mouseEls.length) {
      addEventListener('pointermove', e => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
        dirty = true;
      }, { passive: true });
    }

    (function loop() {
      if (dirty) {
        dirty = false;
        for (const o of scrollEls) {
          o.el.style.transform = 'translate3d(0,' + (sy * o.f).toFixed(1) + 'px,0)';
        }
        for (const o of mouseEls) {
          const base = o.el.dataset.px ? sy * parseFloat(o.el.dataset.px) : 0;
          o.el.style.transform =
            'translate3d(' + (mx * o.f).toFixed(1) + 'px,' +
            (base + my * o.f).toFixed(1) + 'px,0)';
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- SCROLL REVEALS ---------------- */
  function startReveals() {
    const els = $$('[data-reveal]');
    if (reduced) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const d = parseFloat(en.target.dataset.reveal) || 0;
          en.target.style.transitionDelay = d + 's';
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------------- PANEL TILT + GLOW ---------------- */
  function startTilt() {
    if (!finePointer || reduced) return;
    $$('.panel').forEach(p => {
      p.addEventListener('pointermove', e => {
        const r = p.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        p.style.setProperty('--mx', (x * 100) + '%');
        p.style.setProperty('--my', (y * 100) + '%');
        const rx = (0.5 - y) * 2.4;
        const ry = (x - 0.5) * 2.4;
        p.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      p.addEventListener('pointerleave', () => {
        p.style.transform = '';
      });
    });
  }

  /* ---------------- NAV: hide on scroll down, spy ---------------- */
  function startNav() {
    const nav = $('nav');
    const bar = $('#scrollBar');
    let last = 0;
    addEventListener('scroll', () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (nav) {
        if (y > last && y > 300) nav.classList.add('hide');
        else nav.classList.remove('hide');
      }
      last = y;
    }, { passive: true });

    // scrollspy
    const links = $$('.nav-links a');
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    if (secs.length) {
      const spy = new IntersectionObserver(es => {
        es.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(l => l.classList.toggle('on',
              l.getAttribute('href') === '#' + en.target.id));
          }
        });
      }, { rootMargin: '-35% 0px -55% 0px' });
      secs.forEach(s => spy.observe(s));
    }
  }

  /* ---------------- COUNT-UP (shared) ---------------- */
  function countUp(el, target, dur) {
    if (reduced) { el.textContent = target; return; }
    dur = dur || 1200;
    const start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * e);
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ---------------- CLOCK ---------------- */
  function startClock() {
    const el = $('#sysTime');
    if (!el) return;
    const tick = () => el.textContent =
      new Date().toLocaleTimeString('en-IN', { hour12: false });
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- PUBLIC ---------------- */
  window.FX = { countUp: countUp };

  document.addEventListener('DOMContentLoaded', () => {
    startClock();
    startParticles();
    startParallax();
    startNav();
    startTilt();
    runBoot(() => {
      document.body.classList.add('ready');   // triggers h1 line-slide
      startReveals();
      document.dispatchEvent(new CustomEvent('stark:booted'));
    });
  });
})();
