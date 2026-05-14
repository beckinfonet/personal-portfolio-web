// Standalone Terminal Portfolio — final polished version
// Direction A: developer-coded vibe with file tree, command palette, monospace everything.

const { useState, useEffect, useRef } = React;

const ACCENT_OPTIONS = {
  matrix:  { name: 'matrix',  hue: 145, label: 'green' },
  amber:   { name: 'amber',   hue: 75,  label: 'amber' },
  cyan:    { name: 'cyan',    hue: 200, label: 'cyan' },
  magenta: { name: 'magenta', hue: 340, label: 'magenta' },
};

const FONT_OPTIONS = {
  jetbrains: { name: 'JetBrains Mono', stack: '"JetBrains Mono", ui-monospace, monospace' },
  geist:     { name: 'Geist Mono',     stack: '"Geist Mono", ui-monospace, monospace' },
  ibm:       { name: 'IBM Plex Mono',  stack: '"IBM Plex Mono", ui-monospace, monospace' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "matrix",
  "font": "jetbrains",
  "scanlines": false
}/*EDITMODE-END*/;

const buildPalette = (isDark, accentHue) => isDark ? {
  bg: '#0a0c0b',
  bgRaised: '#101312',
  panel: '#0d100f',
  panelHi: '#151918',
  border: '#1c2120',
  borderHi: '#2a302e',
  text: '#d8d6cf',
  textHi: '#ebe9e2',
  muted: '#6a7370',
  mutedHi: '#8a938f',
  accent: `oklch(0.78 0.18 ${accentHue})`,
  accentDim: `oklch(0.45 0.12 ${accentHue})`,
  accentBg: `oklch(0.78 0.18 ${accentHue} / 0.08)`,
  warn: 'oklch(0.78 0.16 75)',
  red: 'oklch(0.7 0.18 25)',
  blue: 'oklch(0.72 0.14 230)',
} : {
  bg: '#f4f2ea',
  bgRaised: '#fbf9f1',
  panel: '#ffffff',
  panelHi: '#f4f2ea',
  border: '#d8d4c4',
  borderHi: '#bdb8a5',
  text: '#1a1f1d',
  textHi: '#0a0c0b',
  muted: '#6a7370',
  mutedHi: '#3a4340',
  accent: `oklch(0.42 0.16 ${accentHue})`,
  accentDim: `oklch(0.55 0.13 ${accentHue})`,
  accentBg: `oklch(0.42 0.16 ${accentHue} / 0.08)`,
  warn: 'oklch(0.5 0.16 60)',
  red: 'oklch(0.5 0.18 25)',
  blue: 'oklch(0.5 0.16 230)',
};

const TerminalApp = () => {
  const data = window.PORTFOLIO_DATA;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeFile, setActiveFile] = useState('about.md');
  const [bootDone, setBootDone] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [time, setTime] = useState(() => new Date());

  const isDark = tweaks.theme === 'dark';
  const accentHue = ACCENT_OPTIONS[tweaks.accent || 'matrix'].hue;
  const fontStack = FONT_OPTIONS[tweaks.font || 'jetbrains'].stack;
  const c = buildPalette(isDark, accentHue);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 350);
    const tick = setInterval(() => setTime(new Date()), 30000);
    return () => { clearTimeout(t); clearInterval(tick); };
  }, []);

  // Cmd/Ctrl-K command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(p => !p);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const files = [
    { id: 'about.md',       icon: '◆', label: 'about.md',       group: 'root' },
    { id: 'projects/',      icon: '▸', label: 'projects/',      group: 'root', isDir: true },
    { id: 'stack.json',     icon: '{}', label: 'stack.json',    group: 'root' },
    { id: 'experience.log', icon: '≡', label: 'experience.log', group: 'root' },
    { id: 'writing/',       icon: '▸', label: 'writing/',       group: 'root', isDir: true },
    { id: 'contact.sh',     icon: '$', label: 'contact.sh',     group: 'root' },
    { id: 'resume.pdf',     icon: '↓', label: 'resume.pdf',     group: 'download' },
  ];

  const handleFileClick = (f) => {
    if (f.id === 'resume.pdf') {
      const a = document.createElement('a');
      a.href = data.resumeUrl;
      a.download = 'Bakytbek_Tatibekov_Resume.pdf';
      a.click();
      return;
    }
    setActiveFile(f.id);
  };

  // Styles
  const S = {
    page: {
      background: c.bg,
      color: c.text,
      minHeight: '100vh',
      fontFamily: fontStack,
      fontSize: 14,
      lineHeight: 1.6,
      position: 'relative',
    },
    scanlines: tweaks.scanlines ? {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
      background: `repeating-linear-gradient(0deg, transparent 0, transparent 2px, ${isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'} 3px)`,
    } : { display: 'none' },
    topbar: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px',
      borderBottom: `1px solid ${c.border}`,
      background: c.panelHi,
      fontSize: 12, color: c.muted,
      position: 'sticky', top: 0, zIndex: 20,
    },
    dot: (col) => ({ width: 11, height: 11, borderRadius: 99, background: col }),
    topbarPath: { marginLeft: 8, color: c.muted },
    topbarSpacer: { flex: 1 },
    topbarBtn: {
      background: 'transparent', color: c.muted,
      border: `1px solid ${c.border}`,
      padding: '4px 10px', borderRadius: 4,
      fontFamily: 'inherit', fontSize: 11,
      cursor: 'pointer',
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      minHeight: 'calc(100vh - 38px)',
    },
    sidebar: {
      borderRight: `1px solid ${c.border}`,
      background: c.panel,
      padding: '20px 0',
      fontSize: 13,
    },
    sbHeader: {
      padding: '0 16px 8px',
      fontSize: 11, color: c.muted,
      letterSpacing: '0.1em', textTransform: 'uppercase',
    },
    sbItem: (active) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 16px',
      cursor: 'pointer',
      color: active ? c.accent : c.text,
      background: active ? c.accentBg : 'transparent',
      borderLeft: `2px solid ${active ? c.accent : 'transparent'}`,
      transition: 'background 0.1s',
      userSelect: 'none',
    }),
    sbIcon: { width: 16, color: c.muted, fontSize: 11, textAlign: 'center', flex: '0 0 auto' },
    sbDownload: {
      margin: '20px 16px 0', padding: '12px',
      border: `1px dashed ${c.border}`, borderRadius: 4,
      fontSize: 11, color: c.muted,
    },
    main: {
      padding: '32px 40px 80px',
      maxWidth: 920,
    },
    breadcrumb: {
      display: 'flex', alignItems: 'baseline', gap: 8,
      fontSize: 12, color: c.muted,
      marginBottom: 24,
    },
    promptLine: { display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 },
    user: { color: c.accent, fontWeight: 600 },
    cmdText: { color: c.text },
    blink: {
      display: 'inline-block', width: 7, height: 14,
      background: c.accent, verticalAlign: 'text-bottom',
      marginLeft: 2,
      animation: 'blink 1s steps(2) infinite',
    },
    contentBlock: {
      marginTop: 18, paddingLeft: 0,
      animation: 'slideIn 0.25s ease',
    },
    h1: {
      fontSize: 26, fontWeight: 700,
      margin: '0 0 4px',
      color: c.textHi,
      letterSpacing: '-0.01em',
    },
    role: { color: c.accent, fontSize: 14, marginBottom: 4 },
    metaRow: { color: c.muted, fontSize: 12, marginBottom: 18 },
    para: { margin: '12px 0', color: c.text, maxWidth: '68ch' },
    btn: {
      background: c.accent, color: isDark ? c.bg : c.bg,
      border: 'none',
      padding: '10px 16px',
      fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
      borderRadius: 4, cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    },
    btnGhost: {
      background: 'transparent', color: c.text,
      border: `1px solid ${c.border}`,
      padding: '10px 16px',
      fontFamily: 'inherit', fontSize: 13,
      borderRadius: 4, cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    },
    chip: {
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px',
      border: `1px solid ${c.border}`,
      borderRadius: 3,
      fontSize: 11, color: c.mutedHi,
      marginRight: 4, marginTop: 4,
      background: c.bgRaised,
    },
    palette: {
      position: 'fixed', inset: 0, zIndex: 100,
      display: paletteOpen ? 'flex' : 'none',
      alignItems: 'flex-start', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      paddingTop: '15vh',
    },
    paletteBox: {
      width: 'min(520px, 90vw)',
      background: c.panel,
      border: `1px solid ${c.borderHi}`,
      borderRadius: 8,
      boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      fontFamily: fontStack,
    },
    paletteInput: {
      width: '100%', padding: '14px 18px',
      background: 'transparent', color: c.text,
      border: 'none', borderBottom: `1px solid ${c.border}`,
      fontFamily: 'inherit', fontSize: 14,
      outline: 'none', boxSizing: 'border-box',
    },
    paletteRow: (hover) => ({
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', fontSize: 13,
      background: hover ? c.accentBg : 'transparent',
      color: hover ? c.accent : c.text,
    }),
  };

  // Command palette items
  const paletteItems = [
    ...files.filter(f => f.id !== 'resume.pdf' && !f.isDir).map(f => ({
      label: `Open ${f.label}`, icon: f.icon, action: () => { setActiveFile(f.id); setPaletteOpen(false); },
    })),
    { label: 'Download résumé', icon: '↓', action: () => { handleFileClick({ id: 'resume.pdf' }); setPaletteOpen(false); } },
    { label: `Toggle theme (${isDark ? 'light' : 'dark'})`, icon: isDark ? '☼' : '☾', action: () => { setTweak('theme', isDark ? 'light' : 'dark'); setPaletteOpen(false); } },
    ...data.socials.map(s => ({
      label: `Open ${s.label}`, icon: '↗', action: () => { window.open(s.url, '_blank'); setPaletteOpen(false); },
    })),
  ];
  const filtered = paletteQuery
    ? paletteItems.filter(i => i.label.toLowerCase().includes(paletteQuery.toLowerCase()))
    : paletteItems;

  // Render content based on active file
  const renderContent = () => {
    if (activeFile === 'about.md') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>cat about.md</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <h1 style={S.h1}>{data.name}</h1>
          <div style={S.role}>// {data.role}</div>
          <div style={S.metaRow}>{data.location}</div>
          {data.bio.long.map((p, i) => <p key={i} style={S.para}>{p}</p>)}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '24px 0', maxWidth: 480 }}>
            {data.highlights.map((h, i) => (
              <div key={i} style={{ padding: 14, border: `1px solid ${c.border}`, borderRadius: 4, background: c.panel }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.accent }}>{h.value}</div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{h.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            <a href={data.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf" style={S.btn}>↓ resume.pdf</a>
            {data.socials.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" style={S.btnGhost}>{s.label.toLowerCase()}/</a>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeFile === 'projects/') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>ls -la projects/</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <div style={{ color: c.muted, fontSize: 12, marginBottom: 14 }}>total {data.projects.length} · sorted by year desc</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.projects.map((p, i) => (
              <a key={i} href={p.link} style={{
                textDecoration: 'none', color: 'inherit',
                display: 'grid', gridTemplateColumns: '32px 1fr 110px',
                gap: 16, padding: '16px 0',
                borderBottom: `1px solid ${c.border}`,
                alignItems: 'baseline',
              }}>
                <div style={{ color: c.muted, fontSize: 12 }}>{String(i+1).padStart(2,'0')}.</div>
                <div>
                  <div style={{ color: c.accent, fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                  <div style={{ color: c.text, marginTop: 4, fontSize: 13, lineHeight: 1.5 }}>{p.summary}</div>
                  <div style={{ marginTop: 8 }}>
                    {p.tech.map(t => <span key={t} style={S.chip}>{t}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11 }}>
                  <div style={{ color: c.mutedHi }}>{p.year}</div>
                  <div style={{ color: c.warn, marginTop: 2 }}>{p.status}</div>
                  <div style={{ color: c.muted, marginTop: 2 }}>{p.role}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeFile === 'stack.json') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>cat stack.json | jq</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <pre style={{
            background: c.panel, border: `1px solid ${c.border}`,
            borderRadius: 4, padding: '20px 24px',
            fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7,
            color: c.text, overflow: 'auto', margin: 0,
          }}>
            <span style={{ color: c.muted }}>{'{'}</span>{'\n'}
            {Object.entries(data.stack).map(([cat, items], idx, arr) => (
              <React.Fragment key={cat}>
                <span style={{ color: c.muted }}>  </span>
                <span style={{ color: c.warn }}>"{cat}"</span>
                <span style={{ color: c.muted }}>: [</span>{'\n'}
                {items.map((item, i) => (
                  <React.Fragment key={item}>
                    <span>    </span>
                    <span style={{ color: c.accent }}>"{item}"</span>
                    {i < items.length - 1 && <span style={{ color: c.muted }}>,</span>}
                    {'\n'}
                  </React.Fragment>
                ))}
                <span style={{ color: c.muted }}>  ]{idx < arr.length - 1 ? ',' : ''}</span>{'\n'}
              </React.Fragment>
            ))}
            <span style={{ color: c.muted }}>{'}'}</span>
          </pre>
        </div>
      </div>
    );

    if (activeFile === 'experience.log') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>git log --oneline --decorate experience.log</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            {data.experience.map((e, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ color: c.warn, fontFamily: 'inherit' }}>{(i + 1).toString(16).padStart(7, '0')}</span>
                  <span style={{ color: c.accent, fontWeight: 600 }}>{e.role}</span>
                  <span style={{ color: c.muted }}>@ {e.company}</span>
                  <span style={{ marginLeft: 'auto', color: c.muted, fontSize: 12 }}>({e.period})</span>
                </div>
                <div style={{ color: c.text, marginTop: 6, paddingLeft: 0, maxWidth: '64ch' }}>{e.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeFile === 'writing/') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>ls writing/ && cat *.md</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {data.writing.map((w, i) => (
              <a key={i} href="#" style={{
                textDecoration: 'none', color: 'inherit',
                display: 'block', padding: '18px 0',
                borderBottom: `1px dashed ${c.border}`,
              }}>
                <div style={{ color: c.muted, fontSize: 11, letterSpacing: '0.05em' }}>
                  {w.date.toUpperCase()} · {w.readTime}
                </div>
                <div style={{ color: c.accent, fontWeight: 600, fontSize: 16, marginTop: 6 }}>› {w.title}</div>
                <div style={{ color: c.text, marginTop: 8, maxWidth: '64ch', fontSize: 13, lineHeight: 1.55 }}>{w.excerpt}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );

    if (activeFile === 'contact.sh') return (
      <div>
        <div style={S.promptLine}>
          <span style={{ color: c.muted }}>$</span>
          <span style={S.cmdText}>./contact.sh --whoami</span>
        </div>
        <div style={S.contentBlock} key={activeFile}>
          <p style={S.para}>Open to senior + staff full-stack and AI engineering roles. Remote-first, occasional travel ok.</p>
          <div style={{ background: c.panel, border: `1px solid ${c.border}`, borderRadius: 4, padding: 20, margin: '20px 0', maxWidth: 480 }}>
            {data.socials.map((s, i) => (
              <div key={s.label} style={{
                display: 'grid', gridTemplateColumns: '90px 1fr',
                gap: 12, padding: '8px 0',
                borderBottom: i < data.socials.length - 1 ? `1px solid ${c.border}` : 'none',
                alignItems: 'baseline',
              }}>
                <span style={{ color: c.muted, fontSize: 12 }}>{s.label.toUpperCase()}</span>
                <a href={s.url} target="_blank" rel="noreferrer" style={{ color: c.accent, textDecoration: 'none' }}>{s.handle}</a>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={data.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf" style={S.btn}>↓ download resume.pdf</a>
            <a href={data.socials[0].url} target="_blank" rel="noreferrer" style={S.btnGhost}>github ↗</a>
          </div>
        </div>
      </div>
    );

    return null;
  };

  const timeStr = time.toTimeString().slice(0, 5);

  return (
    <div style={S.page}>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
        a:hover { opacity: 0.85; }
        .sb-item:hover { background: ${c.panelHi} !important; }
      `}</style>
      <div style={S.scanlines}></div>

      {/* Top bar */}
      <div style={S.topbar}>
        <div style={S.dot('#ff5f57')}></div>
        <div style={S.dot('#febc2e')}></div>
        <div style={S.dot('#28c840')}></div>
        <div style={S.topbarPath}>~/portfolio — bakytbek@dev — zsh</div>
        <div style={S.topbarSpacer}></div>
        <button onClick={() => setPaletteOpen(true)} style={S.topbarBtn}>
          <span style={{ color: c.muted }}>⌘</span>K
        </button>
        <button onClick={() => setTweak('theme', isDark ? 'light' : 'dark')} style={S.topbarBtn}>
          {isDark ? '☼ light' : '☾ dark'}
        </button>
        <span style={{ marginLeft: 4, fontFamily: fontStack, fontSize: 11 }}>{timeStr}</span>
      </div>

      {/* Layout */}
      <div style={S.layout}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.sbHeader}>EXPLORER</div>
          <div style={{ padding: '0 16px 8px', color: c.mutedHi, fontSize: 12 }}>
            <span style={{ color: c.warn }}>▾</span> portfolio/
          </div>
          {files.filter(f => f.group === 'root').map(f => (
            <div key={f.id} className="sb-item"
              style={S.sbItem(activeFile === f.id)}
              onClick={() => handleFileClick(f)}>
              <span style={S.sbIcon}>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}

          <div style={S.sbDownload}>
            <div style={{ color: c.mutedHi, marginBottom: 6, fontSize: 12 }}>For recruiters</div>
            <a href={data.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf"
              style={{ ...S.btn, padding: '8px 12px', fontSize: 12, width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>
              ↓ resume.pdf
            </a>
          </div>

          <div style={{ ...S.sbHeader, marginTop: 24 }}>STATUS</div>
          <div style={{ padding: '0 16px', fontSize: 11, color: c.muted, lineHeight: 1.8 }}>
            <div><span style={{ color: c.accent }}>●</span> Available for hire</div>
            <div>uptime: 7y 184d</div>
            <div>tz: GMT+5 (flex)</div>
          </div>
        </aside>

        {/* Main */}
        <main style={S.main}>
          <div style={S.breadcrumb}>
            <span>~/portfolio</span>
            <span>/</span>
            <span style={{ color: c.text }}>{activeFile}</span>
            <span style={{ marginLeft: 'auto', color: c.muted, opacity: bootDone ? 1 : 0, transition: 'opacity 0.5s' }}>
              press <kbd style={{ background: c.panel, border: `1px solid ${c.border}`, padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>⌘K</kbd> for commands
            </span>
          </div>
          {renderContent()}
          <div style={{ marginTop: 64, paddingTop: 20, borderTop: `1px solid ${c.border}`, color: c.muted, fontSize: 11, display: 'flex', gap: 16 }}>
            <span>© {time.getFullYear()} {data.name}</span>
            <span>·</span>
            <span>compiled with care · rendered with intent · handcrafted in terminal mode</span>
            <span style={{ marginLeft: 'auto' }}>v1.0.0</span>
          </div>
        </main>
      </div>

      {/* Command palette */}
      <div style={S.palette} onClick={() => setPaletteOpen(false)}>
        <div style={S.paletteBox} onClick={e => e.stopPropagation()}>
          <input
            autoFocus={paletteOpen}
            placeholder="Type a command or file..."
            value={paletteQuery}
            onChange={e => setPaletteQuery(e.target.value)}
            style={S.paletteInput}
          />
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            {filtered.map((item, i) => (
              <div key={i} style={S.paletteRow(false)}
                onMouseEnter={e => Object.assign(e.currentTarget.style, S.paletteRow(true))}
                onMouseLeave={e => Object.assign(e.currentTarget.style, S.paletteRow(false))}
                onClick={item.action}>
                <span style={{ width: 18, color: c.muted, fontSize: 12 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '20px', color: c.muted, fontSize: 13, textAlign: 'center' }}>No matches.</div>
            )}
          </div>
          <div style={{ padding: '8px 18px', borderTop: `1px solid ${c.border}`, fontSize: 11, color: c.muted, display: 'flex', gap: 16 }}>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Theme">
          <TweakRadio label="Mode" value={tweaks.theme} onChange={v => setTweak('theme', v)}
            options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
          <TweakSelect label="Accent" value={tweaks.accent} onChange={v => setTweak('accent', v)}
            options={Object.entries(ACCENT_OPTIONS).map(([k, v]) => ({ value: k, label: v.label }))} />
        </TweakSection>
        <TweakSection title="Type">
          <TweakSelect label="Mono font" value={tweaks.font} onChange={v => setTweak('font', v)}
            options={Object.entries(FONT_OPTIONS).map(([k, v]) => ({ value: k, label: v.name }))} />
        </TweakSection>
        <TweakSection title="Effects">
          <TweakToggle label="CRT scanlines" value={tweaks.scanlines} onChange={v => setTweak('scanlines', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

window.TerminalApp = TerminalApp;
