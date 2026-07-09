/* ============ STARK//PROTOCOL — app.js ============
   Mission data · phases · roadmap · subjects · weekly targets
   · revision log · mock tracker · charts · storage
==================================================== */
(function () {
  'use strict';

  /* ================= CONSTANTS ================= */
  const LS_KEY = 'stark_upsc_v1';
  const PHASE1_START = new Date('2026-07-10T00:00:00');
  const ANTHRO_START = new Date('2026-07-20T00:00:00');
  const PIVOT_DATE   = new Date('2027-01-15T00:00:00');
  const DEFAULT_EXAM = '2027-05-23';

  const SUBJECTS = [
    { id: 'gs1', code: 'GS-I', name: 'History · Geography · Society', topics: [
      'Ancient & Medieval India', 'Modern India & Freedom Struggle', 'Post-Independence India',
      'World History', 'Indian Society & Diversity', 'Role of Women & Social Issues',
      'Physical Geography', 'Indian & World Geography', 'Urbanization & Globalization'
    ]},
    { id: 'gs2', code: 'GS-II', name: 'Polity · Governance · IR', topics: [
      'Constitution & Basic Structure', 'Parliament & State Legislatures', 'Executive & Judiciary',
      'Federalism & Local Governance', 'Governance & Transparency', 'Welfare Schemes & Vulnerable Sections',
      'Health, Education & HRD', 'International Relations', 'Global Groupings & Institutions'
    ]},
    { id: 'gs3', code: 'GS-III', name: 'Economy · Environment · S&T · Security', topics: [
      'Indian Economy & Planning', 'Budgeting & Fiscal Policy', 'Agriculture & Food Security',
      'Industry & Infrastructure', 'Science & Technology', 'Environment & Biodiversity',
      'Disaster Management', 'Internal Security', 'Cybersecurity & Border Management'
    ]},
    { id: 'gs4', code: 'GS-IV', name: 'Ethics, Integrity & Aptitude', topics: [
      'Ethics & Human Interface', 'Attitude & Aptitude', 'Emotional Intelligence',
      'Moral Thinkers & Philosophers', 'Public Service Values', 'Probity in Governance',
      'Case Study Practice'
    ]},
    { id: 'anth1', code: 'ANTH-I', name: 'Anthropology Paper I', anthro: true, topics: [
      'Meaning & Scope of Anthropology', 'Human Evolution & Primates', 'Archaeological Anthropology',
      'Family, Marriage & Kinship', 'Economic & Political Organization', 'Religion in Anthropology',
      'Anthropological Theories', 'Culture, Language & Communication', 'Research Methods',
      'Human Genetics & Variation'
    ]},
    { id: 'anth2', code: 'ANTH-II', name: 'Anthropology Paper II (Indian)', anthro: true, topics: [
      'Evolution of Indian Culture', 'Demographic Profile of India', 'Indian Village & Social System',
      'Caste System & Dynamics', 'Tribal Situation in India', 'Tribal Problems & Development',
      'SC/ST/OBC & Constitutional Safeguards', 'Anthropology in Nation Building'
    ]},
    { id: 'essay', code: 'ESSAY', name: 'Essay & Answer Writing', topics: [
      'Philosophical Essay Practice', 'Current Affairs Essays', 'Intro–Body–Conclusion Structuring',
      'Daily Answer Writing Habit', 'Previous Year Essays'
    ]}
  ];

  /* ================= STATE ================= */
  let db = load();
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return Object.assign(
          { checks: {}, weekly: {}, revisions: [], mocks: [], examDate: DEFAULT_EXAM, qualified: false },
          d
        );
      }
    } catch (e) { /* corrupted → fresh */ }
    return { checks: {}, weekly: {}, revisions: [], mocks: [], examDate: DEFAULT_EXAM, qualified: false };
  }
  function save() { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

  /* ================= HELPERS ================= */
  const $ = id => document.getElementById(id);
  const fmtShort = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const dayDiff = (a, b) => Math.ceil((b - a) / 86400000);
  const todayMid = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const esc = s => String(s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= PHASE + HUD ================= */
  function currentPhase() {
    const now = todayMid();
    const exam = new Date(db.examDate + 'T00:00:00');
    if (now < PIVOT_DATE) return { key: 'm1', name: 'MARK I — MAINS FOUNDATION' };
    if (now <= exam)      return { key: 'm2', name: 'MARK II — PRELIMS PROTOCOL' };
    if (db.qualified)     return { key: 'm3', name: 'MARK III — MAINS ENDGAME' };
    return { key: 'post', name: 'STANDBY — AWAITING RESULT' };
  }

  let heroAnimated = false;
  function renderHUD(animate) {
    const now = todayMid();
    const exam = new Date(db.examDate + 'T00:00:00');
    const phase = currentPhase();

    $('phaseName').textContent = phase.name;

    const vals = {
      daysElapsed: Math.max(0, dayDiff(PHASE1_START, now)),
      daysToPivot: Math.max(0, dayDiff(now, PIVOT_DATE)),
      daysToExam:  Math.max(0, dayDiff(now, exam))
    };
    Object.keys(vals).forEach(id => {
      const el = $(id);
      if (animate && !heroAnimated && window.FX) window.FX.countUp(el, vals[id], 1400);
      else el.textContent = vals[id];
    });

    const pct = overallPct();
    const pctEl = $('corePct');
    if (animate && !heroAnimated && window.FX) window.FX.countUp(pctEl, pct, 1400);
    else pctEl.textContent = pct;
    if (animate) heroAnimated = true;

    const C = 829.4;
    $('ringProg').style.strokeDashoffset = C - (C * pct / 100);

    const lines = {
      m1: 'Mains foundation phase active. Core output at <b>' + pct + '%</b>. ' +
          (now < ANTHRO_START ? 'Anthropology module comes online <b>Jul 20</b>.' : 'All modules online, sir.'),
      m2: 'Prelims protocol engaged. <b>' + Math.max(0, dayDiff(now, exam)) +
          ' days</b> to contact. Recommend maximum simulation frequency.',
      m3: 'Prelims cleared. Endgame protocol running. Whatever it takes.',
      post: 'Simulation complete. Awaiting result telemetry. Flip the qualification switch when cleared.'
    };
    $('jarvisLine').innerHTML = 'J.A.R.V.I.S. — ' + lines[phase.key];
  }

  /* ================= ROADMAP ================= */
  function renderRoadmap() {
    const exam = new Date(db.examDate + 'T00:00:00');
    const now = todayMid();
    const nodes = [
      { nm: 'Launch',        dt: PHASE1_START, desc: 'Mains prep begins — GS I–IV daily blocks' },
      { nm: 'Anthro Online', dt: ANTHRO_START, desc: 'Optional subject joins the rotation' },
      { nm: 'Prelims Pivot', dt: PIVOT_DATE,   desc: 'Full switch: PYQs, CSAT, test series' },
      { nm: 'Prelims Exam',  dt: exam,         desc: 'Combat day. Suit up.' },
      { nm: 'Mains Endgame', dt: new Date(exam.getTime() + 86400000), desc: 'If qualified — answer writing at full thrust' }
    ];
    const track = $('track');
    track.querySelectorAll('.node').forEach(n => n.remove());

    const t0 = nodes[0].dt.getTime(), t1 = nodes[nodes.length - 1].dt.getTime();
    let fillPct = ((now.getTime() - t0) / (t1 - t0)) * 100;
    fillPct = Math.max(0, Math.min(100, fillPct));

    let activeSet = false;
    nodes.forEach((n, i) => {
      const el = document.createElement('div');
      el.className = 'node';
      if (now >= n.dt) el.classList.add('done');
      const nextDt = nodes[i + 1] ? nodes[i + 1].dt : new Date(8640000000000000);
      if (!activeSet && now >= n.dt && now < nextDt) {
        el.classList.add('active'); el.classList.remove('done'); activeSet = true;
      }
      if (i === nodes.length - 1 && db.qualified && now > exam) el.classList.add('active');
      el.innerHTML =
        '<div class="pip"></div>' +
        '<div class="nm">' + n.nm + '</div>' +
        '<div class="dt">' + fmtShort(n.dt) + ' ' + n.dt.getFullYear() + '</div>' +
        '<div class="desc">' + n.desc + '</div>';
      track.appendChild(el);
    });

    // animate fill after layout
    requestAnimationFrame(() => { $('trackFill').style.width = fillPct + '%'; });
  }

  /* ================= SUBJECTS ================= */
  function subjPct(s) {
    const c = db.checks[s.id] || [];
    const done = s.topics.filter((_, i) => c.includes(i)).length;
    return Math.round(done / s.topics.length * 100);
  }
  function overallPct() {
    let done = 0, total = 0;
    SUBJECTS.forEach(s => {
      const c = db.checks[s.id] || [];
      done += s.topics.filter((_, i) => c.includes(i)).length;
      total += s.topics.length;
    });
    return total ? Math.round(done / total * 100) : 0;
  }

  function renderSubjects() {
    const now = todayMid();
    const list = $('subjList');
    list.innerHTML = '';
    SUBJECTS.forEach(s => {
      const pct = subjPct(s);
      const wrap = document.createElement('div');
      wrap.className = 'subj';
      const anthroTag = (s.anthro && now < ANTHRO_START)
        ? '<span class="tag">Jul 20</span>' : '';
      wrap.innerHTML =
        '<div class="subj-head" role="button" tabindex="0" aria-expanded="false">' +
          '<span class="chev">▸</span>' +
          '<span class="code">' + s.code + '</span>' +
          '<span class="nm">' + s.name + '</span>' + anthroTag +
          '<span class="bar"><i></i></span>' +
          '<span class="pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="subj-body"><div></div></div>';

      const body = wrap.querySelector('.subj-body > div');
      s.topics.forEach((t, i) => {
        const row = document.createElement('label');
        row.className = 'topic';
        const checked = (db.checks[s.id] || []).includes(i);
        row.innerHTML = '<input type="checkbox"' + (checked ? ' checked' : '') +
          '><span>' + esc(t) + '</span>';
        row.querySelector('input').addEventListener('change', e => {
          db.checks[s.id] = db.checks[s.id] || [];
          if (e.target.checked) db.checks[s.id].push(i);
          else db.checks[s.id] = db.checks[s.id].filter(x => x !== i);
          save(); refreshProgressUI();
        });
        body.appendChild(row);
      });

      const head = wrap.querySelector('.subj-head');
      const toggle = () => {
        wrap.classList.toggle('open');
        head.setAttribute('aria-expanded', wrap.classList.contains('open'));
      };
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      list.appendChild(wrap);
    });
    // bars animate in after paint
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#subjList .subj').forEach((el, idx) => {
        el.querySelector('.bar i').style.width = subjPct(SUBJECTS[idx]) + '%';
      });
    }));
  }

  function refreshProgressUI() {
    document.querySelectorAll('#subjList .subj').forEach((el, idx) => {
      const pct = subjPct(SUBJECTS[idx]);
      el.querySelector('.bar i').style.width = pct + '%';
      el.querySelector('.pct').textContent = pct + '%';
    });
    renderHUD(false);
    updateSubjChart();
  }

  /* ================= WEEKLY TARGETS ================= */
  let weekOffset = 0;
  function weekStart(offset) {
    const now = todayMid();
    const base = now < PHASE1_START ? new Date(PHASE1_START) : now;
    const daysSince = Math.floor((base - PHASE1_START) / 86400000);
    const curWeek = Math.floor(daysSince / 7);
    const ws = new Date(PHASE1_START.getTime() + (curWeek + offset) * 7 * 86400000);
    return { ws: ws, weekNum: curWeek + offset + 1 };
  }
  const weekKey = ws => ws.toISOString().slice(0, 10);

  function renderWeek() {
    const wk = weekStart(weekOffset);
    const we = new Date(wk.ws.getTime() + 6 * 86400000);
    $('wkLabel').textContent = 'WEEK ' + String(Math.max(1, wk.weekNum)).padStart(2, '0');
    $('wkRange').textContent = fmtShort(wk.ws) + ' — ' + fmtShort(we);
    const key = weekKey(wk.ws);
    const items = db.weekly[key] || [];
    const list = $('targetList');
    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<div class="empty">No sortie orders this week. Set your targets.</div>';
    }
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'target' + (it.done ? ' done' : '');
      row.innerHTML =
        '<input type="checkbox"' + (it.done ? ' checked' : '') + ' aria-label="Mark done">' +
        '<span>' + esc(it.text) + '</span>' +
        '<button class="mini danger" aria-label="Delete target">✕</button>';
      row.querySelector('input').addEventListener('change', e => {
        it.done = e.target.checked; save(); renderWeek();
      });
      row.querySelector('button').addEventListener('click', () => {
        items.splice(i, 1); save(); renderWeek();
      });
      list.appendChild(row);
    });
  }

  /* ================= REVISION LOG ================= */
  function renderRevisions() {
    const body = $('revBody');
    body.innerHTML = '';
    const items = db.revisions.slice().sort((a, b) => b.date.localeCompare(a.date));
    $('revEmpty').style.display = items.length ? 'none' : 'block';
    items.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + fmtShort(new Date(r.date + 'T00:00:00')) + '</td>' +
        '<td style="color:var(--gold)">' + esc(r.subject) + '</td>' +
        '<td>' + esc(r.topic) +
          (r.notes ? '<div style="font-size:13px;color:var(--muted)">' + esc(r.notes) + '</div>' : '') +
        '</td>' +
        '<td style="text-align:right"><button class="mini danger" aria-label="Delete entry">✕</button></td>';
      tr.querySelector('button').addEventListener('click', () => {
        db.revisions = db.revisions.filter(x => x !== r);
        save(); renderRevisions();
      });
      body.appendChild(tr);
    });
  }

  /* ================= MOCK TESTS ================= */
  const scoreClass = p => p >= 60 ? 'score-good' : p >= 45 ? 'score-mid' : 'score-low';
  function renderMocks() {
    const body = $('mockBody');
    body.innerHTML = '';
    const items = db.mocks.slice().sort((a, b) => a.date.localeCompare(b.date));
    $('mockEmpty').style.display = items.length ? 'none' : 'block';
    items.forEach(m => {
      const p = Math.round(m.score / m.max * 1000) / 10;
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + fmtShort(new Date(m.date + 'T00:00:00')) + '</td>' +
        '<td>' + esc(m.name) + '</td>' +
        '<td><span class="type-pill ' + m.type + '">' + m.type + '</span></td>' +
        '<td>' + m.score + ' / ' + m.max + '</td>' +
        '<td class="' + scoreClass(p) + '">' + p + '%</td>' +
        '<td style="text-align:right"><button class="mini danger" aria-label="Delete test">✕</button></td>';
      tr.querySelector('button').addEventListener('click', () => {
        db.mocks = db.mocks.filter(x => x !== m);
        save(); renderMocks(); updateMockChart();
      });
      body.appendChild(tr);
    });
  }

  /* ================= CHARTS ================= */
  let subjChart = null, mockChart = null;

  function initChartDefaults() {
    Chart.defaults.font.family = "'Rajdhani',sans-serif";
    Chart.defaults.font.size = 13;
    Chart.defaults.color = '#65727f';
  }

  function updateSubjChart() {
    const labels = SUBJECTS.map(s => s.code);
    const data = SUBJECTS.map(s => subjPct(s));
    if (subjChart) { subjChart.data.datasets[0].data = data; subjChart.update(); return; }
    subjChart = new Chart($('subjChart'), {
      type: 'bar',
      data: { labels: labels, datasets: [{
        data: data,
        backgroundColor: 'rgba(208,37,52,.72)',
        borderColor: '#e6a23c',
        borderWidth: 1.5,
        hoverBackgroundColor: 'rgba(230,162,60,.85)'
      }]},
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ' ' + c.parsed.y + '% complete' } }
        },
        scales: {
          y: { min: 0, max: 100, grid: { color: '#111823' }, ticks: { callback: v => v + '%' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function updateMockChart() {
    const items = db.mocks.slice().sort((a, b) => a.date.localeCompare(b.date));
    const labels = items.map(m => fmtShort(new Date(m.date + 'T00:00:00')));
    const pre = items.map(m => m.type === 'prelims' ? Math.round(m.score / m.max * 1000) / 10 : null);
    const mai = items.map(m => m.type === 'mains'   ? Math.round(m.score / m.max * 1000) / 10 : null);
    if (mockChart) {
      mockChart.data.labels = labels;
      mockChart.data.datasets[0].data = pre;
      mockChart.data.datasets[1].data = mai;
      mockChart.update(); return;
    }
    mockChart = new Chart($('mockChart'), {
      type: 'line',
      data: { labels: labels, datasets: [
        { label: 'Prelims', data: pre, borderColor: '#5fe0ff',
          backgroundColor: 'rgba(95,224,255,.12)', spanGaps: true, tension: .35,
          pointRadius: 5, pointBackgroundColor: '#5fe0ff', fill: true },
        { label: 'Mains', data: mai, borderColor: '#e6a23c',
          backgroundColor: 'rgba(230,162,60,.12)', spanGaps: true, tension: .35,
          pointRadius: 5, pointBackgroundColor: '#e6a23c', fill: true }
      ]},
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { labels: { boxWidth: 12 } },
          tooltip: { callbacks: { label: c => ' ' + c.dataset.label + ': ' + c.parsed.y + '%' } }
        },
        scales: {
          y: { min: 0, max: 100, grid: { color: '#111823' }, ticks: { callback: v => v + '%' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  /* ================= WIRING ================= */
  function wire() {
    $('examDate').value = db.examDate || DEFAULT_EXAM;
    $('examDate').addEventListener('change', e => {
      if (e.target.value) {
        db.examDate = e.target.value; save();
        renderHUD(false); renderRoadmap();
      }
    });

    $('qualToggle').checked = !!db.qualified;
    $('qualToggle').addEventListener('change', e => {
      db.qualified = e.target.checked; save();
      renderHUD(false); renderRoadmap();
    });

    // weekly
    $('targetAdd').addEventListener('click', () => {
      const v = $('targetInput').value.trim();
      if (!v) return;
      const key = weekKey(weekStart(weekOffset).ws);
      db.weekly[key] = db.weekly[key] || [];
      db.weekly[key].push({ text: v, done: false });
      $('targetInput').value = '';
      save(); renderWeek();
    });
    $('targetInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') $('targetAdd').click();
    });
    $('wkPrev').addEventListener('click', () => { weekOffset--; renderWeek(); });
    $('wkNext').addEventListener('click', () => { weekOffset++; renderWeek(); });

    // revision
    const sel = $('revSubject');
    SUBJECTS.forEach(s => {
      const o = document.createElement('option');
      o.value = s.code; o.textContent = s.code;
      sel.appendChild(o);
    });
    $('revDate').value = new Date().toISOString().slice(0, 10);
    $('revAdd').addEventListener('click', () => {
      const date = $('revDate').value, topic = $('revTopic').value.trim();
      if (!date || !topic) return;
      db.revisions.push({
        date: date, subject: $('revSubject').value,
        topic: topic, notes: $('revNotes').value.trim()
      });
      $('revTopic').value = ''; $('revNotes').value = '';
      save(); renderRevisions();
    });

    // mocks
    $('mockDate').value = new Date().toISOString().slice(0, 10);
    $('mockAdd').addEventListener('click', () => {
      const date = $('mockDate').value,
            name = $('mockName').value.trim(),
            score = parseFloat($('mockScore').value),
            max = parseFloat($('mockMax').value);
      if (!date || !name || isNaN(score) || isNaN(max) || max <= 0 || score < 0) return;
      db.mocks.push({ date: date, name: name, type: $('mockType').value, score: score, max: max });
      $('mockName').value = ''; $('mockScore').value = ''; $('mockMax').value = '';
      save(); renderMocks(); updateMockChart();
    });

    // export / import / reset
    $('btnExport').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'stark-upsc-backup.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('btnImport').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try { db = JSON.parse(r.result); save(); location.reload(); }
        catch (err) { alert('Import failed — file is not a valid backup.'); }
      };
      r.readAsText(f);
    });
    $('btnReset').addEventListener('click', () => {
      if (confirm('Wipe all mission data? This cannot be undone.')) {
        localStorage.removeItem(LS_KEY);
        location.reload();
      }
    });
  }

  /* ================= INIT ================= */
  document.addEventListener('DOMContentLoaded', () => {
    initChartDefaults();
    wire();
    renderHUD(false);
    renderRoadmap();
    renderSubjects();
    renderWeek();
    renderRevisions();
    renderMocks();
    updateSubjChart();
    updateMockChart();
  });

  // re-run hero count-ups once boot finishes for the cinematic effect
  document.addEventListener('stark:booted', () => renderHUD(true));
})();
