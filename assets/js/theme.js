/* ==========================================================================
   Dr. Azzeddine Reghais - Academic Portfolio
   Theme Control (Dark / Light Mode) - Phase 3
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('portfolio-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('portfolio-theme', 'light');
  }

  // Update icons and visual states of all toggles
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const sunIcon = btn.querySelector('.fa-sun');
    const moonIcon = btn.querySelector('.fa-moon');

    if (theme === 'dark') {
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    } else {
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    }
  });

  const event = new CustomEvent('themeChanged', { detail: { theme } });
  document.dispatchEvent(event);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
}

// Global hooks
window.initTheme = initTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
