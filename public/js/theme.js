/**
 * CENTRAL EVENT 2027 — THEME & AUDIO MODULE
 * Manages Dark/Light mode toggle, Web Audio API sound synthesizer, and UI Toasts.
 */

const ThemeManager = {
  theme: localStorage.getItem('ce_theme') || 'dark',
  audioEnabled: localStorage.getItem('ce_audio') !== 'false',

  init() {
    this.applyTheme(this.theme);
    this.updateAudioButton();
    this.startLiveClock();
  },

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('ce_theme', theme);

    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light', 'light-theme');
      document.body?.classList.remove('dark');
      document.body?.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light', 'light-theme');
      document.documentElement.classList.add('dark');
      document.body?.classList.remove('light-theme');
      document.body?.classList.add('dark');
    }

    const themeBtnIcon = document.getElementById('themeToggleIcon');
    const themeBtnLabel = document.getElementById('themeToggleLabel');
    if (themeBtnIcon) themeBtnIcon.innerText = theme === 'light' ? '☀️' : '🌙';
    if (themeBtnLabel) themeBtnLabel.innerText = theme === 'light' ? 'LIGHT' : 'DARK';
  },

  toggleTheme() {
    const nextTheme = this.theme === 'light' ? 'dark' : 'light';
    document.body?.classList.add('theme-transitioning');
    this.applyTheme(nextTheme);
    this.playAudio('chime');
    this.showToast(`Mode tema diubah ke: ${nextTheme.toUpperCase()}`, 'info');
    setTimeout(() => {
      document.body?.classList.remove('theme-transitioning');
    }, 300);
  },

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    localStorage.setItem('ce_audio', String(this.audioEnabled));
    this.updateAudioButton();
    if (this.audioEnabled) this.playAudio('chime');
    this.showToast(this.audioEnabled ? '🔊 Audio Notifikasi: AKTIF' : '🔇 Audio Notifikasi: SENYAP', 'info');
  },

  updateAudioButton() {
    const audioIcon = document.getElementById('audioToggleIcon');
    if (audioIcon) {
      audioIcon.innerText = this.audioEnabled ? '🔊' : '🔇';
    }
  },

  playAudio(type = 'chime') {
    if (!this.audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'alert') {
        // High alert ping (E5 -> A5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'success') {
        // Harmonic major chord (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.35);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
        });
      } else if (type === 'delete') {
        // Descending warning tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        // Default crisp chime (C5 -> G5)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Audio synthesis unavailable:', e);
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  },

  startLiveClock() {
    function tick() {
      const el = document.getElementById('liveClock');
      if (!el) return;
      const now = new Date();
      const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now);
      el.innerText = `${timeStr} WIB`;
    }
    setInterval(tick, 1000);
    tick();
  }
};

// Global shorthand
function toggleTheme() { ThemeManager.toggleTheme(); }
function toggleAudioAlarm() { ThemeManager.toggleAudio(); }
function playChimeSound(type) { ThemeManager.playAudio(type); }
function showToast(msg, type) { ThemeManager.showToast(msg, type); }

// Auto init on load
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
