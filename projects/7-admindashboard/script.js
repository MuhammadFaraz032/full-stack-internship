/* =============================================
   NOVA SAAS DASHBOARD — SCRIPT
   ============================================= */

// ── DOM REFS ──────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const collapseBtn   = document.getElementById('collapseBtn');
const mainWrapper   = document.getElementById('mainWrapper');
const themeToggle   = document.getElementById('themeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const pageTitle     = document.getElementById('pageTitle');
const navItems      = document.querySelectorAll('.nav-item');
const html          = document.documentElement;

// ── THEME (apply before paint to avoid flash) ─
const savedTheme = localStorage.getItem('nova-theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// ── SIDEBAR COLLAPSE (desktop) ────────────────
let isCollapsed = false;

collapseBtn.addEventListener('click', () => {
  isCollapsed = !isCollapsed;
  sidebar.classList.toggle('collapsed', isCollapsed);
  mainWrapper.classList.toggle('sidebar-collapsed', isCollapsed);
});

// ── MOBILE SIDEBAR ────────────────────────────
mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.add('mobile-open');
  mobileOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
});

function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  mobileOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

mobileOverlay.addEventListener('click', closeMobileSidebar);

// ── CHART COLOR HELPER ────────────────────────
function getChartColors() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  return {
    grid:    isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    label:   isDark ? '#8890A8' : '#6B7280',
    tooltip: isDark ? '#1A1D27' : '#ffffff',
    fg:      isDark ? '#F1F2F6' : '#111827',
    border:  isDark ? '#2D3148' : '#E5E7F0',
  };
}

// ── CHART REGISTRY ────────────────────────────
const charts = {};

function updateAllChartColors() {
  const c = getChartColors();
  Object.values(charts).forEach(ch => {
    if (!ch) return;
    ch.options.scales.x.grid.color   = c.grid;
    ch.options.scales.x.ticks.color  = c.label;
    ch.options.scales.y.grid.color   = c.grid;
    ch.options.scales.y.ticks.color  = c.label;
    if (ch.options.scales.y1) ch.options.scales.y1.ticks.color = c.label;
    ch.options.plugins.tooltip.backgroundColor = c.tooltip;
    ch.options.plugins.tooltip.titleColor      = c.fg;
    ch.options.plugins.tooltip.bodyColor       = c.label;
    ch.options.plugins.tooltip.borderColor     = c.border;
    ch.update();
  });
}

// ── THEME TOGGLE ──────────────────────────────
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('nova-theme', theme);
  updateAllChartColors();
}

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

themeToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); themeToggle.click(); }
});

// ── PAGE NAVIGATION ───────────────────────────
const pages = {
  dashboard: document.getElementById('pageDashboard'),
  analytics: document.getElementById('pageAnalytics'),
  users:     document.getElementById('pageUsers'),
  revenue:   document.getElementById('pageRevenue'),
  settings:  document.getElementById('pageSettings'),
};

const pageTitles = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  users:     'Users',
  revenue:   'Revenue',
  settings:  'Settings',
};

const chartBuilt = { analytics: false, users: false, revenue: false };

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;

    // Active nav state
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Show/hide pages
    Object.values(pages).forEach(p => p.classList.add('hidden'));
    if (pages[page]) pages[page].classList.remove('hidden');

    // Update header
    pageTitle.textContent = pageTitles[page] || 'Dashboard';

    // Build charts lazily on first visit
    if (page === 'analytics' && !chartBuilt.analytics) {
      buildFunnelChart();
      buildRetentionChart();
      chartBuilt.analytics = true;
    }
    if (page === 'users' && !chartBuilt.users) {
      buildSignupsChart();
      chartBuilt.users = true;
    }
    if (page === 'revenue' && !chartBuilt.revenue) {
      buildRevenueChart();
      chartBuilt.revenue = true;
    }

    if (window.innerWidth <= 768) closeMobileSidebar();
  });
});

// ── DASHBOARD: GROWTH CHART ───────────────────
function buildGrowthChart() {
  const c = getChartColors();
  charts.growth = new Chart(
    document.getElementById('growthChart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'MRR ($)',
            data: [52400, 58900, 63200, 70100, 77400, 84230],
            yAxisID: 'y',
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2.5,
            pointRadius: 4, pointHoverRadius: 6,
            pointBackgroundColor: '#6366F1',
            pointBorderColor: '#fff', pointBorderWidth: 2,
            tension: 0.4, fill: true,
          },
          {
            label: 'Active Users',
            data: [2340, 2680, 2910, 3180, 3520, 3847],
            yAxisID: 'y1',
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139,92,246,0.06)',
            borderWidth: 2.5,
            pointRadius: 4, pointHoverRadius: 6,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#fff', pointBorderWidth: 2,
            tension: 0.4, fill: false,
            borderDash: [5, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltip, titleColor: c.fg, bodyColor: c.label,
            borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8,
            callbacks: {
              label: (ctx) => ctx.datasetIndex === 0
                ? ` MRR: $${ctx.parsed.y.toLocaleString()}`
                : ` Users: ${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'Inter', size: 12 } }, border: { display: false } },
          y: {
            position: 'left',
            grid: { color: c.grid },
            ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) },
            border: { display: false },
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 }, callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v },
            border: { display: false },
          },
        },
      },
    }
  );
}

// ── ANALYTICS: FUNNEL CHART ───────────────────
function buildFunnelChart() {
  const c = getChartColors();
  charts.funnel = new Chart(
    document.getElementById('funnelChart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['Visitors', 'Sign-ups', 'Trial Start', 'Paid Convert'],
        datasets: [
          { label: 'This month', data: [12400, 3820, 2290, 1560], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false },
          { label: 'Last month', data: [10900, 3410, 2050, 1340], backgroundColor: 'rgba(139,92,246,0.35)', borderRadius: 6, borderSkipped: false },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: c.tooltip, titleColor: c.fg, bodyColor: c.label, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
        },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'Inter', size: 12 } }, border: { display: false } },
          y: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 }, callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v }, border: { display: false } },
        },
      },
    }
  );
}

// ── ANALYTICS: RETENTION CHART ────────────────
function buildRetentionChart() {
  const c = getChartColors();
  charts.retention = new Chart(
    document.getElementById('retentionChart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 6', 'Week 8'],
        datasets: [{
          label: 'Retention %',
          data: [100, 86, 79, 74, 68, 62],
          borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2.5, pointRadius: 5,
          pointBackgroundColor: '#6366F1', pointBorderColor: '#fff', pointBorderWidth: 2,
          tension: 0.3, fill: true,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltip, titleColor: c.fg, bodyColor: c.label,
            borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8,
            callbacks: { label: ctx => ` Retained: ${ctx.parsed.y}%` },
          },
        },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'Inter', size: 12 } }, border: { display: false } },
          y: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 }, callback: v => v + '%' }, border: { display: false }, min: 50, max: 100 },
        },
      },
    }
  );
}

// ── USERS: SIGNUPS CHART ──────────────────────
function buildSignupsChart() {
  const c = getChartColors();
  charts.signups = new Chart(
    document.getElementById('signupsChart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'New Users',
          data: [198, 241, 287, 302, 318, 342],
          backgroundColor: 'rgba(99,102,241,0.8)',
          borderRadius: 6, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: c.tooltip, titleColor: c.fg, bodyColor: c.label, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
        },
        scales: {
          x: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'Inter', size: 12 } }, border: { display: false } },
          y: { grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 } }, border: { display: false } },
        },
      },
    }
  );
}

// ── REVENUE: STACKED BAR CHART ────────────────
function buildRevenueChart() {
  const c = getChartColors();
  charts.revenue = new Chart(
    document.getElementById('revenueChart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          { label: 'New MRR',       data: [8200, 9400, 10100, 11300, 12600, 13800], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false, stack: 'stack' },
          { label: 'Expansion MRR', data: [4100, 5200, 6000, 7100, 8200, 9140],    backgroundColor: 'rgba(139,92,246,0.7)',  borderRadius: 6, borderSkipped: false, stack: 'stack' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltip, titleColor: c.fg, bodyColor: c.label,
            borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}` },
          },
        },
        scales: {
          x: { stacked: true, grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'Inter', size: 12 } }, border: { display: false } },
          y: { stacked: true, grid: { color: c.grid }, ticks: { color: c.label, font: { family: 'JetBrains Mono', size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, border: { display: false } },
        },
      },
    }
  );
}

// ── SETTINGS TOGGLES ─────────────────────────
document.querySelectorAll('.pill-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => toggle.classList.toggle('active'));
});

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildGrowthChart();
});