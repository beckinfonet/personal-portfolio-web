// NO "use client" — this is an RSC inline script emitter

const ACCENT_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var raw = localStorage.getItem('portfolio-accent');
    var hue = (raw && /^\\d{1,3}$/.test(raw) && +raw >= 0 && +raw < 360) ? raw : '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) {
    /* localStorage unavailable — CSS default --accent-hue: 145 applies */
  }
})();`;

export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
