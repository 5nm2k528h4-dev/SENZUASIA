import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SB_URL = "https://kbhfwixwtlptyaavvhit.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiaGZ3aXh3dGxwdHlhYXZ2aGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjY0MjQsImV4cCI6MjA5NjIwMjQyNH0.o2r2bDEVhQwqfkKVg5Jeml--XobIpWp74gjYeaso0dU";

const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || "return=representation",
    },
    ...opts,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COULEURS = ["Blanc","Gris clair","Beige","Marron clair","Marron vert","Marron foncé","Vert foncé","Dégeulasse"];
const TEXTURES = ["Lisse","Légèrement granuleux","Melt"];
const VITESSES = ["Variateur 17","Variateur 18","Variateur 19","Variateur 20","Gentle","Normal"];
const DUREES_MIN = [5,15,20,24,25,30];
const MACHINES = ["Machine 1","Machine 2","Machine 3"];
const MACHINE_SHORT = { "Machine 1":"M1","Machine 2":"M2","Machine 3":"M3" };
const MACHINE_COLORS = { "Machine 1":"#D85B28","Machine 2":"#2C7BB5","Machine 3":"#8E44AD" };
const MICRONS = ["220µ","160µ","90µ","45µ","25µ","FS"];
const GLACE_OPTIONS = ["—","1/4 cruche","1/2 cruche","1 cruche","1/3 sac","1/2 sac","1 sac"];
const STRAINS_DEFAULT = ["London","Miami","Blueberry","Gelato","OG Kush","Wedding Cake","Runtz","Zkittlez","Purple Punch"];
const MICRON_SETS = ["220-160-90-45","220-160-90-45-25","220-160-45"];

// ─── THEME DBZ ────────────────────────────────────────────────────────────────
const T = {
  bg:       "#08080E",
  bg2:      "#0D0D1A",
  bg3:      "#12122A",
  card:     "#0F0F1F",
  border:   "#1A1A35",
  orange:   "#D85B28",
  orangeGlow:"#FF7043",
  gold:     "#D4A843",
  goldDim:  "#8B6914",
  green:    "#4CAF50",
  greenDim: "#2D7A3A",
  red:      "#C0392B",
  white:    "#E8E8F8",
  dim:      "#5A5A8A",
  ink:      "#9090C0",
  danger:   "#E74C3C",
  aura:     "#FFD700",
  purple:   "#8E44AD",
  blue:     "#2C7BB5",
};

const STRAIN_COLORS = ["#D85B28","#D4A843","#4CAF50","#2C7BB5","#8E44AD","#E91E8C","#1ABC9C","#E67E22","#3498DB","#F39C12"];

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body,#root{background:#08080E;color:#E8E8F8;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:#08080E;}
::-webkit-scrollbar-thumb{background:#1A1A35;border-radius:2px;}
input,select,textarea{background:#0D0D1A;border:1px solid #1A1A35;color:#E8E8F8;font-family:'DM Sans',sans-serif;font-size:15px;border-radius:8px;padding:10px 14px;width:100%;outline:none;-webkit-appearance:none;appearance:none;transition:border-color 0.2s;}
input:focus,select:focus,textarea:focus{border-color:#D85B28;}
select option{background:#0D0D1A;}
button{cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;border:none;outline:none;}

/* Flip card */
.flip-container{perspective:900px;}
.flip-inner{position:relative;width:100%;height:100%;transition:transform 0.55s cubic-bezier(.4,2,.6,1);transform-style:preserve-3d;}
.flip-container.flipped .flip-inner{transform:rotateY(180deg);}
.flip-face{position:absolute;top:0;left:0;width:100%;height:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:18px;overflow:hidden;}
.flip-back{transform:rotateY(180deg);}

@keyframes aura{0%,100%{box-shadow:0 0 20px #FFD700,0 0 40px #FFD70044;}50%{box-shadow:0 0 40px #FFD700,0 0 80px #FFD70088;}}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
@keyframes scanLine{0%{top:-4px;}100%{top:calc(100% + 4px);}}
@keyframes timerPulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
@keyframes recordGlow{0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #FFD700;}50%{text-shadow:0 0 40px #FFD700,0 0 80px #FFD700,0 0 120px #FFD700;}}
@keyframes drawerUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes calDot{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
`;

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <div style={{ fontSize:10, fontWeight:700, color:T.dim, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:5 }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:14 }}><Lbl>{label}</Lbl>{children}</div>
);

const Card = ({ children, style={}, glow, color }) => (
  <div style={{
    background:T.card,
    border:`1px solid ${glow ? (color||T.orange)+"66" : T.border}`,
    borderRadius:14, padding:16, marginBottom:12,
    animation: glow ? "aura 2s infinite" : "none",
    ...style,
  }}>{children}</div>
);

const Badge = ({ children, color=T.gold }) => (
  <span style={{
    background:color+"22", color, border:`1px solid ${color}44`,
    borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700,
    letterSpacing:"0.05em", whiteSpace:"nowrap",
  }}>{children}</span>
);

const Btn = ({ children, onClick, color=T.orange, disabled, style={} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? T.border : `linear-gradient(135deg, ${color}, ${color}BB)`,
    color: disabled ? T.dim : "#08080E",
    fontWeight:800, fontSize:15,
    padding:"14px 24px",
    borderRadius:10, width:"100%",
    boxShadow: disabled ? "none" : `0 4px 18px ${color}44`,
    opacity: disabled ? 0.6 : 1,
    ...style,
  }}>{children}</button>
);

const BtnOutline = ({ children, onClick, color=T.orange, style={} }) => (
  <button onClick={onClick} style={{
    background:"transparent", color, border:`1.5px solid ${color}`,
    fontWeight:700, fontSize:14, padding:"13px 20px", borderRadius:10, width:"100%", ...style,
  }}>{children}</button>
);

const KPI = ({ label, value, sub, color=T.orange, icon }) => (
  <div style={{
    background:T.card, border:`1px solid ${color}22`,
    borderRadius:14, padding:"14px 16px", flex:1,
    position:"relative", overflow:"hidden",
  }}>
    <div style={{ position:"absolute", top:-20, right:-20, width:70, height:70, borderRadius:"50%", background:`radial-gradient(circle, ${color}18, transparent)` }} />
    {icon && <div style={{ fontSize:18, marginBottom:6 }}>{icon}</div>}
    <div style={{ fontSize:10, color:T.dim, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1, fontFamily:"DM Mono" }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize:11, color:T.ink, marginTop:4 }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ icon, text, color=T.orange }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
    <div style={{ width:3, height:18, background:color, borderRadius:2 }} />
    <span style={{ fontSize:11, fontWeight:800, color, letterSpacing:"0.12em", textTransform:"uppercase" }}>{icon} {text}</span>
  </div>
);

const Loader = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:200 }}>
    <div style={{ color:T.orange, fontSize:32, animation:"pulse 1s infinite" }}>⚡</div>
  </div>
);

// ─── TOUCH STEPPER ────────────────────────────────────────────────────────────
const TouchStepper = ({ label, value, onChange, min=0, max=99, step=1, unit="" }) => (
  <div style={{ marginBottom:14 }}>
    <Lbl>{label}</Lbl>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))} style={{
        width:52, height:52, borderRadius:12, background:T.bg3, border:`1px solid ${T.border}`,
        color:T.white, fontSize:24, fontWeight:700,
      }}>−</button>
      <div style={{ flex:1, textAlign:"center", fontSize:28, fontWeight:800, color:T.orange, fontFamily:"DM Mono" }}>
        {value}{unit}
      </div>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))} style={{
        width:52, height:52, borderRadius:12, background:T.orange, border:"none",
        color:"#08080E", fontSize:24, fontWeight:700,
        boxShadow:`0 4px 14px ${T.orange}44`,
      }}>+</button>
    </div>
  </div>
);

const BigSelect = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:600,
          background: value === o ? T.orange : T.bg3,
          color: value === o ? "#08080E" : T.ink,
          border:`1px solid ${value === o ? T.orange : T.border}`,
          boxShadow: value === o ? `0 2px 10px ${T.orange}44` : "none",
        }}>{o}</button>
      ))}
    </div>
  </Field>
);

// ─── MULTI-MACHINE TIMER ───────────────────────────────────────────────────────
const LS_TIMER_KEY = (m) => `senzu_timer_${m.replace(/\s/g,"_")}`;

const useTimer = (machine) => {
  const lsKey = LS_TIMER_KEY(machine);

  const loadState = () => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { duree:15, remaining:null, running:false, done:false, startedAt:null };
  };

  const [state, setState] = useState(loadState);
  const intervalRef = useRef(null);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(lsKey, JSON.stringify(state)); } catch {}
  }, [state, lsKey]);

  // Recover elapsed time if was running when app closed
  useEffect(() => {
    const saved = loadState();
    if (saved.running && saved.startedAt && saved.remaining != null) {
      const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
      const newRemaining = Math.max(0, saved.remaining - elapsed);
      setState(s => ({ ...s, remaining: newRemaining, done: newRemaining === 0, running: newRemaining > 0, startedAt: Date.now() }));
    }
  }, []);

  useEffect(() => {
    if (state.running && state.remaining > 0) {
      intervalRef.current = setInterval(() => {
        setState(s => {
          const nr = s.remaining - 1;
          if (nr <= 0) {
            clearInterval(intervalRef.current);
            // Sound alert
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              [0, 300, 600, 900].forEach(delay => {
                setTimeout(() => {
                  const o = ctx.createOscillator();
                  const g = ctx.createGain();
                  o.connect(g); g.connect(ctx.destination);
                  o.frequency.value = delay === 0 ? 660 : delay === 300 ? 880 : delay === 600 ? 1100 : 880;
                  g.gain.value = 0.25;
                  o.start(); o.stop(ctx.currentTime + 0.35);
                }, delay);
              });
            } catch(e) {}
            return { ...s, remaining:0, running:false, done:true };
          }
          return { ...s, remaining:nr };
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.running]);

  const start = (dur) => setState(s => ({ ...s, duree:dur||s.duree, remaining:(dur||s.duree)*60, running:true, done:false, startedAt:Date.now() }));
  const stop  = () => setState(s => ({ ...s, running:false }));
  const reset = () => { localStorage.removeItem(lsKey); setState({ duree:15, remaining:null, running:false, done:false, startedAt:null }); };
  const setDuree = (d) => setState(s => ({ ...s, duree:d }));

  return { ...state, start, stop, reset, setDuree };
};

const MachineTimer = ({ machine, compact=false }) => {
  const color = MACHINE_COLORS[machine] || T.orange;
  const short = MACHINE_SHORT[machine] || machine;
  const { duree, remaining, running, done, start, stop, reset, setDuree } = useTimer(machine);

  const mins = remaining != null ? Math.floor(remaining / 60) : duree;
  const secs = remaining != null ? remaining % 60 : 0;
  const pct  = remaining != null ? (remaining / (duree * 60)) * 100 : 100;

  if (compact) {
    // Compact view for when multiple timers are running
    return (
      <div style={{
        background: done ? "#1A0800" : T.bg3,
        border: `2px solid ${done ? color : running ? color+"88" : T.border}`,
        borderRadius: 12, padding:"10px 14px",
        flex:1, minWidth:100,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:10, fontWeight:800, color, letterSpacing:"0.1em" }}>{short}</span>
          {done && <span style={{ fontSize:10, color, fontWeight:800 }}>✓ FIN</span>}
          {running && <span style={{ fontSize:10, color:T.green, animation:"timerPulse 1s infinite" }}>● RUN</span>}
        </div>
        <div style={{ fontFamily:"DM Mono", fontSize:26, fontWeight:800, color: done ? color : running ? T.white : T.dim, textAlign:"center" }}>
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </div>
        {remaining != null && !done && (
          <div style={{ marginTop:6, height:4, background:T.border, borderRadius:2 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 1s linear" }} />
          </div>
        )}
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {!running && !done && <button onClick={() => start()} style={{ flex:1, padding:"6px", borderRadius:8, background:color, border:"none", color:"#08080E", fontWeight:700, fontSize:11 }}>▶</button>}
          {running && <button onClick={stop} style={{ flex:1, padding:"6px", borderRadius:8, background:"transparent", border:`1px solid ${T.danger}`, color:T.danger, fontWeight:700, fontSize:11 }}>⏹</button>}
          {(done || remaining != null) && <button onClick={reset} style={{ flex:1, padding:"6px", borderRadius:8, background:"transparent", border:`1px solid ${T.dim}`, color:T.dim, fontWeight:700, fontSize:11 }}>↺</button>}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: done ? "#1A0800" : T.bg3,
      border:`2px solid ${done ? color : running ? color+"88" : T.border}`,
      borderRadius:16, padding:20, marginBottom:16,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:color, boxShadow:`0 0 8px ${color}` }} />
          <span style={{ fontSize:11, fontWeight:800, color, letterSpacing:"0.12em", textTransform:"uppercase" }}>⏱ CHRONO — {machine}</span>
        </div>
        {running && <span style={{ fontSize:10, color:T.green, fontWeight:700, animation:"timerPulse 1s infinite" }}>● EN COURS</span>}
        {done && <span style={{ fontSize:10, color, fontWeight:700 }}>⚡ TERMINÉ</span>}
      </div>
      {!running && remaining === null && (
        <BigSelect label="Durée" value={`${duree}`} onChange={v=>setDuree(parseInt(v))} options={DUREES_MIN.map(String)} />
      )}
      <div style={{ textAlign:"center", margin:"16px 0" }}>
        <div style={{
          fontSize:72, fontWeight:800, fontFamily:"DM Mono", lineHeight:1,
          color: done ? color : running ? T.white : T.dim,
          animation: done ? "timerPulse 0.8s infinite" : "none",
          textShadow: running ? `0 0 30px ${color}44` : "none",
        }}>
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </div>
        {done && <div style={{ color, fontWeight:800, fontSize:20, marginTop:8 }}>⚡ WASH TERMINÉ — {machine.toUpperCase()}</div>}
        {remaining != null && !done && (
          <div style={{ marginTop:14, height:8, background:T.border, borderRadius:4 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${color}, ${color}88)`, borderRadius:4, transition:"width 1s linear" }} />
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {!running && !done && <Btn onClick={() => start()} color={color}>▶ Démarrer</Btn>}
        {running && <BtnOutline onClick={stop} color={T.danger}>⏹ Arrêter</BtnOutline>}
        {(done || remaining != null) && <BtnOutline onClick={reset} color={T.dim}>↺ Reset</BtnOutline>}
      </div>
    </div>
  );
};

// Bloc global montrant tous les timers actifs + sélection machine
const MultiMachineTimers = ({ activeMachine }) => {
  const [selected, setSelected] = useState(activeMachine || "Machine 1");
  const [showAll, setShowAll] = useState(false);

  // Check which timers are running
  const runningMachines = MACHINES.filter(m => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_TIMER_KEY(m)) || "{}");
      return s.running || s.done;
    } catch { return false; }
  });

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:3, height:18, background:T.orange, borderRadius:2 }} />
          <span style={{ fontSize:11, fontWeight:800, color:T.orange, letterSpacing:"0.12em", textTransform:"uppercase" }}>⏱ CHRONOS PARALLÈLES</span>
        </div>
        {runningMachines.length > 1 && (
          <button onClick={() => setShowAll(x => !x)} style={{
            background:"transparent", border:`1px solid ${T.border}`, borderRadius:8,
            padding:"4px 10px", fontSize:11, color:T.ink, fontWeight:700,
          }}>{showAll ? "Plein écran" : "Compact"}</button>
        )}
      </div>

      {/* Machine selector tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:12 }}>
        {MACHINES.map(m => {
          const color = MACHINE_COLORS[m];
          const short = MACHINE_SHORT[m];
          let isRunning = false, isDone = false;
          try {
            const s = JSON.parse(localStorage.getItem(LS_TIMER_KEY(m)) || "{}");
            isRunning = s.running; isDone = s.done;
          } catch {}
          return (
            <button key={m} onClick={() => setSelected(m)} style={{
              flex:1, padding:"10px 6px", borderRadius:10,
              background: selected === m ? color+"22" : T.bg3,
              border:`2px solid ${selected === m ? color : isRunning ? color+"66" : T.border}`,
              color: selected === m ? color : T.dim, fontWeight:800, fontSize:13,
              position:"relative",
            }}>
              {short}
              {(isRunning || isDone) && (
                <span style={{
                  position:"absolute", top:-4, right:-4,
                  width:10, height:10, borderRadius:"50%",
                  background: isDone ? T.orange : T.green,
                  boxShadow:`0 0 6px ${isDone ? T.orange : T.green}`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Full-size timer for selected machine */}
      <MachineTimer machine={selected} compact={false} />

      {/* Compact view of other active timers */}
      {runningMachines.filter(m => m !== selected).length > 0 && (
        <div>
          <div style={{ fontSize:10, color:T.dim, marginBottom:6, letterSpacing:"0.1em", textTransform:"uppercase" }}>Autres timers actifs</div>
          <div style={{ display:"flex", gap:8 }}>
            {runningMachines.filter(m => m !== selected).map(m => (
              <MachineTimer key={m} machine={m} compact={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", icon:"⛩", label:"Dashboard" },
  { id:"session",   icon:"🏮", label:"Session" },
  { id:"calendar",  icon:"📅", label:"Lab Cal" },
  { id:"recherche", icon:"🔍", label:"Recherche" },
  { id:"photo",     icon:"📷", label:"Photo IA" },
];

const NavBar = ({ active, onNav }) => (
  <nav style={{
    position:"fixed", bottom:0, left:0, right:0, zIndex:100,
    background:`linear-gradient(180deg, transparent, #0D0D1AEE)`,
    backdropFilter:"blur(20px)", borderTop:`1px solid #1A1A35`,
    display:"flex", justifyContent:"space-around",
    padding:"10px 0 max(16px, env(safe-area-inset-bottom))",
    maxWidth:768, margin:"0 auto", left:"50%", transform:"translateX(-50%)", width:"100%",
  }}>
    {NAV.map(item => (
      <button key={item.id} onClick={() => onNav(item.id)} style={{
        background:"none", border:"none", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        padding:"4px 10px", opacity: active === item.id ? 1 : 0.4, transition:"all 0.2s",
      }}>
        <span style={{ fontSize: active === item.id ? 22 : 18 }}>{item.icon}</span>
        <span style={{ fontSize:9, color: active === item.id ? T.gold : T.dim, fontWeight: active === item.id ? 700 : 400, letterSpacing:0.5, textTransform:"uppercase" }}>{item.label}</span>
        {active === item.id && <div style={{ width:20, height:2, background:T.orange, borderRadius:1, boxShadow:`0 0 6px ${T.orange}` }} />}
      </button>
    ))}
  </nav>
);

// ─── HEADER ───────────────────────────────────────────────────────────────────
const AppHeader = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t); }, []);

  // Check any timer alert
  const hasAlert = MACHINES.some(m => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_TIMER_KEY(m)) || "{}");
      if (!s.running || !s.startedAt) return false;
      return (Date.now() - s.startedAt) > 3 * 3600 * 1000;
    } catch { return false; }
  });

  return (
    <div style={{
      background: hasAlert ? "#1A0000" : `linear-gradient(180deg, ${T.bg2} 0%, ${T.bg2}CC 100%)`,
      padding:"12px 20px 10px", display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:50, backdropFilter:"blur(16px)",
      borderBottom:`1px solid ${hasAlert ? T.danger+"44" : T.border}`,
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ fontSize:22, lineHeight:1 }}>🫛</div>
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:0 }}>
            <span style={{
              fontSize:18, fontWeight:900, color:T.white,
              letterSpacing:-1, fontStyle:"italic",
              textShadow:`2px 2px 0 ${T.orange}`,
            }}>SENZU</span>
            <span style={{
              fontSize:18, fontWeight:300, color:T.orange,
              letterSpacing:4, marginLeft:6,
            }}>ASIA</span>
          </div>
          <div style={{ fontSize:8, color:T.dim, letterSpacing:"0.15em", textTransform:"uppercase" }}>Ice Water Hash Lab</div>
        </div>
      </div>
      {/* Right side */}
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:9, color:T.dim, fontFamily:"DM Mono" }}>
          {time.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}
        </div>
        {hasAlert
          ? <div style={{ fontSize:9, color:T.danger, fontWeight:700, animation:"timerPulse 1s infinite" }}>⚠ DÉGRADATION TERPÉNIQUE</div>
          : <div style={{ fontSize:9, color:T.green }}>● Lab actif</div>
        }
      </div>
    </div>
  );
};

const ScreenHeader = ({ title, sub }) => (
  <div style={{ padding:"16px 16px 0", marginBottom:16 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
      <div style={{ width:3, height:20, background:T.orange, borderRadius:2 }} />
      <h2 style={{ fontSize:20, fontWeight:800, color:T.white }}>{title}</h2>
    </div>
    {sub && <p style={{ margin:"0 0 0 11px", fontSize:10, color:T.dim, letterSpacing:0.8, textTransform:"uppercase" }}>{sub}</p>}
  </div>
);

// ─── FLIP STRAIN CARD ─────────────────────────────────────────────────────────
const StrainFlipCard = ({ strain, sessions, pesees, color, index }) => {
  const [flipped, setFlipped] = useState(false);

  // Calculate yield
  const strainSessions = sessions.filter(s => s.strain === strain.nom);
  const totalBio = strainSessions.reduce((a,s) => a + (parseFloat(s.biomasse_kg)||0), 0);
  const strainPesees = pesees.filter(p => {
    const sess = sessions.find(s => s.id === p.session_id);
    return sess && sess.strain === strain.nom;
  });
  const totalPoids = strainPesees.reduce((a,p) => a + (parseFloat(p.poids_sec_g)||0), 0);
  const rend = totalBio > 0 ? ((totalPoids / (totalBio * 1000)) * 100).toFixed(2) : null;
  const isRecord = rend && parseFloat(rend) > 4;

  const totalWashes = strainSessions.reduce((a,s) => a + (s.washes_count || 0), 0);

  return (
    <div
      className={`flip-container${flipped ? " flipped" : ""}`}
      onClick={() => setFlipped(f => !f)}
      style={{ width:160, height:220, flexShrink:0, cursor:"pointer" }}
    >
      <div className="flip-inner" style={{ height:220 }}>
        {/* RECTO */}
        <div className="flip-face" style={{
          background:`linear-gradient(160deg, ${T.bg3} 0%, ${color}22 100%)`,
          border:`2px solid ${color}44`,
          display:"flex", flexDirection:"column",
          animation: isRecord ? "aura 2.5s infinite" : "none",
        }}>
          {/* Photo / placeholder */}
          <div style={{
            flex:1,
            background: strain.photo_url
              ? `url(${strain.photo_url}) center/cover`
              : `linear-gradient(135deg, ${color}33, ${T.bg3})`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {!strain.photo_url && (
              <div style={{ fontSize:36, opacity:0.4 }}>🌿</div>
            )}
            {isRecord && (
              <div style={{
                position:"absolute", top:8, right:8,
                background:T.aura, borderRadius:6, padding:"2px 6px",
                fontSize:9, fontWeight:800, color:"#000",
              }}>★ RECORD</div>
            )}
          </div>
          {/* Info */}
          <div style={{ padding:"10px 12px", background:`${T.bg}CC` }}>
            <div style={{
              fontSize:15, fontWeight:900, color:T.white,
              fontStyle:"italic", marginBottom:4, letterSpacing:-0.5,
              textShadow:`1px 1px 0 ${color}`,
            }}>{strain.nom}</div>
            <div style={{
              fontSize:24, fontWeight:800, color: isRecord ? T.aura : color,
              fontFamily:"DM Mono", lineHeight:1,
              animation: isRecord ? "recordGlow 2s infinite" : "none",
            }}>{rend ? `${rend}%` : "—"}</div>
            <div style={{ fontSize:9, color:T.dim, marginTop:2 }}>Tap pour détails</div>
          </div>
        </div>

        {/* VERSO */}
        <div className="flip-face flip-back" style={{
          background:`linear-gradient(160deg, ${color}22 0%, ${T.bg3} 100%)`,
          border:`2px solid ${color}66`,
          padding:14, display:"flex", flexDirection:"column", gap:8,
        }}>
          <div style={{ fontSize:13, fontWeight:900, color, fontStyle:"italic", borderBottom:`1px solid ${color}33`, paddingBottom:8 }}>
            {strain.nom}
          </div>
          {strain.genetique && (
            <div>
              <div style={{ fontSize:9, color:T.dim }}>GÉNÉTIQUE</div>
              <div style={{ fontSize:12, color:T.ink }}>{strain.genetique}</div>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {[
              ["Sessions", strainSessions.length],
              ["Bio totale", totalBio > 0 ? `${totalBio.toFixed(1)}kg` : "—"],
              ["Rendement", rend ? `${rend}%` : "—"],
              ["Grade", strain.grade || "—"],
            ].map(([l,v]) => (
              <div key={l} style={{ background:T.bg+"99", borderRadius:8, padding:"6px 8px" }}>
                <div style={{ fontSize:8, color:T.dim }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:700, color }}>{v}</div>
              </div>
            ))}
          </div>
          {strain.rendement_record && (
            <div style={{ textAlign:"center", marginTop:"auto" }}>
              <div style={{ fontSize:9, color:T.dim }}>RECORD</div>
              <div style={{ fontSize:18, fontWeight:800, color:T.aura, fontFamily:"DM Mono" }}>{strain.rendement_record}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [washes,   setWashes]   = useState([]);
  const [pesees,   setPesees]   = useState([]);
  const [strains,  setStrains]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [chartTab, setChartTab] = useState("timeline");

  useEffect(() => {
    Promise.all([
      sbFetch("sessions?select=*&order=date.desc"),
      sbFetch("washes?select=*"),
      sbFetch("pesees?select=*"),
      sbFetch("strains?select=*&order=nom.asc"),
    ]).then(([s,w,p,st]) => {
      setSessions(s||[]); setWashes(w||[]); setPesees(p||[]); setStrains(st||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const totalBio = sessions.reduce((a,s) => a+(parseFloat(s.biomasse_kg)||0), 0);

  // Correct yield calculation
  const rendByStrain = useMemo(() => {
    const map = {};
    pesees.forEach(p => {
      const sess = sessions.find(s => s.id === p.session_id);
      if (!sess) return;
      const n = sess.strain || "?";
      if (!map[n]) map[n] = { poids:0, bio:0 };
      map[n].poids += parseFloat(p.poids_sec_g) || 0;
      map[n].bio   += parseFloat(sess.biomasse_kg) || 0;
    });
    return Object.entries(map)
      .map(([nom,v]) => ({ nom, rend: v.bio > 0 ? ((v.poids / (v.bio * 1000)) * 100).toFixed(2) : "—" }))
      .sort((a,b) => parseFloat(b.rend||0) - parseFloat(a.rend||0));
  }, [pesees, sessions]);

  const rendMoyen = useMemo(() => {
    const valid = rendByStrain.filter(r => r.rend !== "—").map(r => parseFloat(r.rend));
    return valid.length > 0 ? (valid.reduce((a,v) => a+v, 0) / valid.length).toFixed(2) : null;
  }, [rendByStrain]);

  // Timeline data: washes per month per strain
  const timelineData = useMemo(() => {
    const months = {};
    washes.forEach(w => {
      const sess = sessions.find(s => s.id === w.session_id);
      if (!sess || !sess.date) return;
      const m = sess.date.slice(0,7);
      const strain = sess.strain || "?";
      if (!months[m]) months[m] = {};
      months[m][strain] = (months[m][strain] || 0) + 1;
    });
    return months;
  }, [washes, sessions]);

  const allMonths = Object.keys(timelineData).sort();
  const allStrainNames = [...new Set(sessions.map(s => s.strain).filter(Boolean))];

  // Strain distribution by biomass
  const strainDist = useMemo(() => {
    const m = {};
    sessions.forEach(s => {
      if (s.strain) m[s.strain] = (m[s.strain]||0) + (parseFloat(s.biomasse_kg)||0);
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  }, [sessions]);

  if (loading) return <Loader />;

  // Merge strains table with computed yields for flip cards
  const strainCards = strains.length > 0
    ? strains
    : allStrainNames.map(n => ({ nom:n }));

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      {/* KPIs */}
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <KPI label="Sessions" value={sessions.length} icon="⛩" color={T.orange} />
        <KPI label="Washes"   value={washes.length}   icon="💧" color={T.gold} />
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:22 }}>
        <KPI label="Biomasse" value={`${totalBio.toFixed(1)}kg`} icon="🌿" color={T.green} />
        <KPI label="Rendement moy." value={rendMoyen ? `${rendMoyen}%` : "—"} icon="📊" color={T.purple} />
      </div>

      {/* Strain flip cards */}
      {strainCards.length > 0 && (
        <div style={{ marginBottom:22 }}>
          <SectionTitle icon="🃏" text="CARTES STRAINS" />
          <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:10, scrollbarWidth:"none" }}>
            {strainCards.map((s,i) => (
              <StrainFlipCard
                key={s.nom||i}
                strain={s}
                sessions={sessions}
                pesees={pesees}
                color={STRAIN_COLORS[i % STRAIN_COLORS.length]}
                index={i}
              />
            ))}
          </div>
          <div style={{ fontSize:10, color:T.dim, textAlign:"center", marginTop:6 }}>← Swipe · Tap pour retourner →</div>
        </div>
      )}

      {/* Chart tabs */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[["timeline","📅 Timeline"],["repartition","🧬 Répartition"]].map(([id,lbl]) => (
            <button key={id} onClick={() => setChartTab(id)} style={{
              flex:1, padding:"10px", borderRadius:10, fontWeight:700, fontSize:12,
              background: chartTab===id ? T.orange+"22" : T.bg3,
              color: chartTab===id ? T.orange : T.dim,
              border:`1px solid ${chartTab===id ? T.orange+"66" : T.border}`,
            }}>{lbl}</button>
          ))}
        </div>

        {chartTab === "timeline" && (
          <div>
            <div style={{ fontSize:10, color:T.dim, marginBottom:10 }}>Washes par mois par strain</div>
            {allMonths.length === 0 && <div style={{ color:T.dim, textAlign:"center" }}>Aucune donnée</div>}
            {allStrainNames.map((strain,i) => {
              const color = STRAIN_COLORS[i % STRAIN_COLORS.length];
              const data = allMonths.map(m => timelineData[m]?.[strain] || 0);
              const max = Math.max(...data, 1);
              return (
                <div key={strain} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:11, color, fontWeight:700 }}>{strain}</span>
                    <span style={{ fontSize:11, color:T.dim }}>total: {data.reduce((a,v)=>a+v,0)}</span>
                  </div>
                  <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:40 }}>
                    {allMonths.map((m,mi) => (
                      <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <div style={{ width:"100%", height: data[mi]>0 ? `${Math.max(8,(data[mi]/max)*36)}px` : 4, background: data[mi]>0 ? color : T.border, borderRadius:"3px 3px 0 0", transition:"height 0.3s" }} />
                        <div style={{ fontSize:8, color:T.dim }}>{m.slice(5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {chartTab === "repartition" && (
          <div>
            <div style={{ fontSize:10, color:T.dim, marginBottom:10 }}>Biomasse totale par strain (kg)</div>
            {strainDist.map(([nom, bio], i) => {
              const pct = Math.round((bio / totalBio) * 100);
              const color = STRAIN_COLORS[i % STRAIN_COLORS.length];
              return (
                <div key={nom} style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:13, color:T.white }}>{nom}</span>
                    <span style={{ fontSize:13, color, fontWeight:700 }}>{bio.toFixed(1)}kg · {pct}%</span>
                  </div>
                  <div style={{ height:8, background:T.border, borderRadius:4 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:4, transition:"width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Rendement par strain */}
      {rendByStrain.length > 0 && (
        <Card>
          <SectionTitle icon="📈" text="RENDEMENTS" />
          {rendByStrain.map((r,i) => (
            <div key={r.nom} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:13, color:T.white }}>{r.nom}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:60, height:4, background:T.border, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${Math.min(100, parseFloat(r.rend||0)*10)}%`, background:STRAIN_COLORS[i%STRAIN_COLORS.length], borderRadius:2 }} />
                </div>
                <span style={{
                  fontSize:16, fontWeight:800, color:STRAIN_COLORS[i%STRAIN_COLORS.length],
                  fontFamily:"DM Mono", minWidth:54, textAlign:"right",
                  animation: parseFloat(r.rend||0) > 4 ? "recordGlow 2s infinite" : "none",
                }}>{r.rend !== "—" ? `${r.rend}%` : "—"}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ─── SESSION ──────────────────────────────────────────────────────────────────
const emptyWash = (n) => ({
  numero:n, micron:"", glace:"—", vitesse:"", duree_min:15,
  couleur_160:"", couleur_90:"", couleur_45:"", texture:"",
  contaminants:false, potentiel_wash_plus:false, notes:"",
});
const emptySession = () => ({
  machine:"", strain:"", biomasse_kg:8, type_biomasse:"Fresh Frozen",
  nb_sacs:16, heure_debut:"", heure_fin:"", notes:"",
  washes:Array.from({length:10},(_,i)=>emptyWash(i+1)),
});
const LS_KEY = "senzu_draft_v4";

const Session = ({ strains }) => {
  const [sess, setSess] = useState(() => {
    try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : emptySession(); }
    catch { return emptySession(); }
  });
  const [activeWash, setActiveWash] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [showCloture, setShowCloture] = useState(false);
  const [pesees, setPesees] = useState({ "90µ":0, "45µ":0, "25µ":0 });
  const [micronSet, setMicronSet] = useState("220-160-90-45");

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(sess)); } catch {} }, [sess]);

  const setF = (k,v) => setSess(s => ({...s,[k]:v}));
  const setW = (i,k,v) => setSess(s => { const w=[...s.washes]; w[i]={...w[i],[k]:v}; return {...s,washes:w}; });

  const handleSave = async () => {
    if (!sess.machine || !sess.strain) { alert("Machine et strain requis."); return; }
    setSaving(true);
    try {
      const [row] = await sbFetch("sessions", {
        method:"POST",
        body:JSON.stringify({
          machine:sess.machine, strain:sess.strain,
          biomasse_kg:parseFloat(sess.biomasse_kg)||null,
          type_biomasse:sess.type_biomasse,
          nb_sacs:parseInt(sess.nb_sacs)||null,
          heure_debut:sess.heure_debut||null, heure_fin:sess.heure_fin||null,
          statut:"sechage", date:new Date().toISOString().slice(0,10),
          notes:sess.notes||null,
        }),
      });
      const validW = sess.washes.filter(w => w.micron);
      if (validW.length > 0) {
        await sbFetch("washes", {
          method:"POST", prefer:"return=minimal",
          body:JSON.stringify(validW.map(w => ({
            session_id:row.id, numero:w.numero, micron:w.micron,
            glace:w.glace||null, vitesse:w.vitesse||null,
            duree_min:w.duree_min||null,
            couleur_160:w.couleur_160||null, couleur_90:w.couleur_90||null,
            couleur_45:w.couleur_45||null, texture:w.texture||null,
            contaminants:w.contaminants, notes:w.notes||null,
          }))),
        });
      }
      setSavedId(row.id);
      setShowCloture(true);
    } catch(e) { alert("Erreur: " + e.message); }
    finally { setSaving(false); }
  };

  const handleCloture = async () => {
    if (!savedId) return;
    setSaving(true);
    try {
      const rows = Object.entries(pesees)
        .filter(([,v]) => parseFloat(v) > 0)
        .map(([micron,poids_sec_g]) => ({ session_id:savedId, micron, poids_sec_g:parseFloat(poids_sec_g) }));
      if (rows.length > 0) await sbFetch("pesees", { method:"POST", prefer:"return=minimal", body:JSON.stringify(rows) });
      await sbFetch(`sessions?id=eq.${savedId}`, { method:"PATCH", prefer:"return=minimal", body:JSON.stringify({statut:"cloture"}) });
      localStorage.removeItem(LS_KEY);
      setSess(emptySession()); setShowCloture(false); setSavedId(null);
      alert("✅ Session clôturée !");
    } catch(e) { alert("Erreur: " + e.message); }
    finally { setSaving(false); }
  };

  const totalPesee = Object.values(pesees).reduce((a,v) => a+(parseFloat(v)||0), 0);
  const rendement  = sess.biomasse_kg > 0 ? ((totalPesee / (parseFloat(sess.biomasse_kg) * 1000)) * 100).toFixed(2) : null;
  const isRecord   = rendement && parseFloat(rendement) > 4;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      {showCloture ? (
        <Card glow style={{ marginBottom:16 }}>
          <SectionTitle icon="⏳" text="CHAMBRE DE L'ESPRIT ET DU TEMPS" color={T.gold} />
          <div style={{ textAlign:"center", padding:"10px 0 16px" }}>
            <Badge color={T.gold}>EN SÉCHAGE — FREEZE DRYER</Badge>
          </div>
          <SectionTitle icon="⚖" text="PESÉES FINALES" />
          {["90µ","45µ","25µ"].map(m => (
            <TouchStepper key={m} label={`Poids sec ${m} (g)`} value={parseFloat(pesees[m])||0} onChange={v=>setPesees(p=>({...p,[m]:v}))} step={0.1} max={9999} unit="g" />
          ))}
          {rendement && (
            <div style={{
              textAlign:"center", padding:16, marginBottom:16,
              background: isRecord ? T.aura+"22" : T.bg3,
              border:`2px solid ${isRecord ? T.aura : T.border}`,
              borderRadius:12, animation: isRecord ? "aura 1.5s infinite" : "none",
            }}>
              <div style={{ fontSize:11, color:T.dim, marginBottom:4 }}>RENDEMENT CALCULÉ</div>
              <div style={{
                fontSize:60, fontWeight:800, fontFamily:"DM Mono",
                color: isRecord ? T.aura : T.orange,
                animation: isRecord ? "recordGlow 2s infinite" : "none",
              }}>{rendement}%</div>
              {isRecord && <div style={{ fontSize:20, fontWeight:800, color:T.aura, marginTop:8 }}>🔥 IT'S OVER 9000! 🔥</div>}
              <div style={{ fontSize:11, color:T.dim, marginTop:4 }}>{totalPesee.toFixed(1)}g / {(parseFloat(sess.biomasse_kg)*1000).toFixed(0)}g biomasse</div>
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <BtnOutline color={T.dim} onClick={() => setShowCloture(false)}>← Retour</BtnOutline>
            <Btn onClick={handleCloture} disabled={saving} color={T.green}>{saving ? "Clôture..." : "🏆 Clôturer"}</Btn>
          </div>
        </Card>
      ) : (
        <>
          {/* Multi-machine timers */}
          <MultiMachineTimers activeMachine={sess.machine || "Machine 1"} />

          <Card style={{ marginBottom:14 }}>
            <SectionTitle icon="⚙" text="INFOS SESSION" />
            <BigSelect label="Machine" value={sess.machine} onChange={v=>setF("machine",v)} options={MACHINES} />
            <Field label="Strain">
              <select value={sess.strain} onChange={e=>setF("strain",e.target.value)}>
                <option value="">Sélectionner...</option>
                {(strains.length ? strains : STRAINS_DEFAULT).map(s => <option key={s.nom||s}>{s.nom||s}</option>)}
              </select>
            </Field>
            <TouchStepper label="Biomasse (kg)" value={parseFloat(sess.biomasse_kg)||0} onChange={v=>setF("biomasse_kg",v)} step={0.5} max={50} unit=" kg" />
            <TouchStepper label="Nombre de sacs" value={parseInt(sess.nb_sacs)||0} onChange={v=>setF("nb_sacs",v)} max={30} />
            <BigSelect label="Type biomasse" value={sess.type_biomasse} onChange={v=>setF("type_biomasse",v)} options={["Fresh Frozen","Dry","Live"]} />
            <BigSelect label="Set microns" value={micronSet} onChange={setMicronSet} options={MICRON_SETS} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Field label="Début"><input type="time" value={sess.heure_debut} onChange={e=>setF("heure_debut",e.target.value)} /></Field>
              <Field label="Fin"><input type="time" value={sess.heure_fin} onChange={e=>setF("heure_fin",e.target.value)} /></Field>
            </div>
            <Field label="Notes session">
              <textarea value={sess.notes} onChange={e=>setF("notes",e.target.value)} rows={2} placeholder="Observations..." style={{ resize:"none" }} />
            </Field>
          </Card>

          <SectionTitle icon="💧" text="WASHES" />
          {sess.washes.map((w,i) => (
            <WashCard key={i} wash={w} index={i} open={activeWash===i} onToggle={() => setActiveWash(activeWash===i?null:i)} onChange={(k,v) => setW(i,k,v)} />
          ))}

          <div style={{ marginTop:20, display:"flex", gap:10 }}>
            <BtnOutline color={T.danger} onClick={() => { setSess(emptySession()); localStorage.removeItem(LS_KEY); }}>↺ Reset</BtnOutline>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Sauvegarde..." : "🏮 Clôturer & Sécher"}</Btn>
          </div>
        </>
      )}
    </div>
  );
};

const WashCard = ({ wash, index, open, onToggle, onChange }) => {
  const hasData = wash.micron || wash.couleur_45;
  return (
    <div style={{ marginBottom:8 }}>
      <button onClick={onToggle} style={{
        width:"100%", background:open ? T.bg3 : T.card,
        border:`1px solid ${hasData ? T.orange+"66" : T.border}`,
        borderRadius:open ? "12px 12px 0 0" : 12,
        padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", color:T.white,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"DM Mono", fontWeight:800, color:hasData?T.orange:T.dim }}>W{wash.numero}</span>
          {wash.micron    && <Badge>{wash.micron}</Badge>}
          {wash.couleur_45 && <Badge color={T.dim}>{wash.couleur_45}</Badge>}
          {wash.contaminants && <Badge color={T.danger}>⚠ Contam</Badge>}
          {wash.potentiel_wash_plus && <Badge color={T.green}>+</Badge>}
        </div>
        <span style={{ color:T.dim }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ background:T.bg3, border:`1px solid ${T.orange+"44"}`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:16 }}>
          <BigSelect label="Micron"     value={wash.micron}   onChange={v=>onChange("micron",v)}   options={MICRONS} />
          <BigSelect label="Glace"      value={wash.glace||"—"} onChange={v=>onChange("glace",v)} options={GLACE_OPTIONS} />
          <BigSelect label="Vitesse"    value={wash.vitesse}  onChange={v=>onChange("vitesse",v)}  options={VITESSES} />
          <BigSelect label="Durée (min)" value={String(wash.duree_min)} onChange={v=>onChange("duree_min",parseInt(v))} options={DUREES_MIN.map(String)} />
          <BigSelect label="Couleur 160µ" value={wash.couleur_160} onChange={v=>onChange("couleur_160",v)} options={COULEURS} />
          <BigSelect label="Couleur 90µ"  value={wash.couleur_90}  onChange={v=>onChange("couleur_90",v)}  options={COULEURS} />
          <BigSelect label="Couleur 45µ"  value={wash.couleur_45}  onChange={v=>onChange("couleur_45",v)}  options={COULEURS} />
          <BigSelect label="Texture"    value={wash.texture}  onChange={v=>onChange("texture",v)}  options={TEXTURES} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={() => onChange("contaminants", !wash.contaminants)} style={{
                width:28, height:28, borderRadius:8,
                border:`2px solid ${wash.contaminants ? T.danger : T.border}`,
                background:wash.contaminants ? T.danger+"33" : "transparent", flexShrink:0,
              }}>{wash.contaminants && <span style={{ color:T.danger }}>✓</span>}</button>
              <span style={{ fontSize:14, color:wash.contaminants?T.danger:T.dim }}>Contaminants</span>
            </div>
            <button onClick={() => onChange("potentiel_wash_plus", !wash.potentiel_wash_plus)} style={{
              padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700,
              background:wash.potentiel_wash_plus ? T.green+"33" : T.bg,
              border:`1.5px solid ${wash.potentiel_wash_plus ? T.green : T.border}`,
              color:wash.potentiel_wash_plus ? T.green : T.dim,
            }}>+ Wash suivant ?</button>
          </div>
          <Field label="Notes">
            <textarea value={wash.notes} onChange={e=>onChange("notes",e.target.value)} rows={2} placeholder="Observations..." style={{ resize:"none" }} />
          </Field>
        </div>
      )}
    </div>
  );
};

// ─── LAB CALENDAR ─────────────────────────────────────────────────────────────
const LabCalendar = () => {
  const [sessions, setSessions] = useState([]);
  const [washes,   setWashes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [curDate,  setCurDate]  = useState(new Date());
  const [activeMs, setActiveMs] = useState(["Machine 1","Machine 2","Machine 3"]);
  const [drawer,   setDrawer]   = useState(null); // { date, sessions }
  const [drawerWashes, setDrawerWashes] = useState({});
  const [drawerPesees, setDrawerPesees] = useState({});
  const [fStrain,  setFStrain]  = useState("");
  const [fMicron,  setFMicron]  = useState("");
  const [fWash,    setFWash]    = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Promise.all([
      sbFetch("sessions?select=*&order=date.asc"),
      sbFetch("washes?select=*"),
    ]).then(([s,w]) => {
      setSessions(s||[]); setWashes(w||[]);
    }).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  const year  = curDate.getFullYear();
  const month = curDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date();

  // Build day → sessions map (filtered by active machines)
  const dayMap = useMemo(() => {
    const m = {};
    sessions
      .filter(s => !activeMs.length || activeMs.includes(s.machine))
      .forEach(s => {
        if (!s.date) return;
        if (!m[s.date]) m[s.date] = [];
        m[s.date].push(s);
      });
    return m;
  }, [sessions, activeMs]);

  // Count washes per day
  const dayWashCount = useMemo(() => {
    const m = {};
    sessions.filter(s => activeMs.includes(s.machine)).forEach(s => {
      if (!s.date) return;
      const cnt = washes.filter(w => w.session_id === s.id).length;
      m[s.date] = (m[s.date]||0) + cnt;
    });
    return m;
  }, [sessions, washes, activeMs]);

  const openDrawer = async (dateStr) => {
    const daySessions = dayMap[dateStr] || [];
    setDrawer({ date:dateStr, sessions:daySessions });
    // Load washes + pesees for these sessions
    const ids = daySessions.map(s => s.id);
    const newW = {}, newP = {};
    await Promise.all(ids.map(async id => {
      const [w,p] = await Promise.all([
        sbFetch(`washes?session_id=eq.${id}&order=numero.asc`),
        sbFetch(`pesees?session_id=eq.${id}`),
      ]);
      newW[id] = w||[];
      newP[id] = p||[];
    }));
    setDrawerWashes(newW);
    setDrawerPesees(newP);
  };

  const doSearch = async () => {
    setSearching(true);
    try {
      let q = "washes?select=*,sessions(date,machine,strain,biomasse_kg)";
      if (fMicron) q += `&micron=eq.${encodeURIComponent(fMicron)}`;
      if (fWash)   q += `&numero=eq.${fWash}`;
      let data = await sbFetch(q + "&order=created_at.desc&limit=50");
      if (fStrain && data) data = data.filter(w => w.sessions?.strain === fStrain);
      setSearchResults(data||[]);
    } catch(e) { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const monthLabel = curDate.toLocaleDateString("fr-FR", { month:"long", year:"numeric" });
  const prevMonth = () => setCurDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1));
  const nextMonth = () => setCurDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1));

  const allStrainNames = [...new Set(sessions.map(s => s.strain).filter(Boolean))];

  if (loading) return <Loader />;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>

      {/* Machine toggles */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {MACHINES.map(m => {
          const color = MACHINE_COLORS[m];
          const active = activeMs.includes(m);
          return (
            <button key={m} onClick={() => setActiveMs(prev => active ? prev.filter(x=>x!==m) : [...prev,m])} style={{
              flex:1, padding:"10px 0", borderRadius:10, fontWeight:800, fontSize:12,
              background: active ? color+"22" : T.bg3,
              border:`2px solid ${active ? color : T.border}`,
              color: active ? color : T.dim,
            }}>{MACHINE_SHORT[m]}</button>
          );
        })}
      </div>

      {/* Calendar */}
      <Card style={{ marginBottom:16 }}>
        {/* Month nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={prevMonth} style={{ width:36, height:36, borderRadius:10, background:T.bg3, border:`1px solid ${T.border}`, color:T.white, fontSize:16 }}>‹</button>
          <div style={{ fontSize:14, fontWeight:800, color:T.white, textTransform:"capitalize" }}>{monthLabel}</div>
          <button onClick={nextMonth} style={{ width:36, height:36, borderRadius:10, background:T.bg3, border:`1px solid ${T.border}`, color:T.white, fontSize:16 }}>›</button>
        </div>

        {/* Day labels */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
          {["D","L","M","M","J","V","S"].map((d,i) => (
            <div key={i} style={{ textAlign:"center", fontSize:9, color:T.dim, fontWeight:700, padding:"4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {/* Empty cells */}
          {Array.from({length:(firstDay+6)%7}).map((_,i) => <div key={`e${i}`} />)}
          {/* Day cells */}
          {Array.from({length:daysInMonth}).map((_,i) => {
            const day = i+1;
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const hasSessions = dayMap[dateStr]?.length > 0;
            const washCount = dayWashCount[dateStr] || 0;
            const isToday = today.getDate()===day && today.getMonth()===month && today.getFullYear()===year;
            const machines = dayMap[dateStr]?.map(s=>MACHINE_SHORT[s.machine]).filter(Boolean) || [];
            return (
              <button key={day} onClick={() => hasSessions && openDrawer(dateStr)} style={{
                aspectRatio:"1",
                borderRadius:10,
                border:`2px solid ${isToday ? T.gold : hasSessions ? T.orange+"66" : T.border}`,
                background: isToday ? T.gold+"22" : hasSessions ? T.orange+"11" : T.bg3,
                cursor: hasSessions ? "pointer" : "default",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:2, padding:2, position:"relative",
                boxShadow: hasSessions ? `0 0 10px ${T.orange}22` : "none",
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:13, fontWeight: isToday ? 800 : hasSessions ? 700 : 400, color: isToday ? T.gold : hasSessions ? T.white : T.dim }}>
                  {day}
                </span>
                {washCount > 0 && (
                  <span style={{ fontSize:9, color:T.orange, fontWeight:800, fontFamily:"DM Mono" }}>{washCount}W</span>
                )}
                {machines.length > 0 && (
                  <div style={{ display:"flex", gap:2 }}>
                    {[...new Set(machines)].slice(0,3).map(m => (
                      <div key={m} style={{ width:5, height:5, borderRadius:"50%", background:MACHINE_COLORS[Object.keys(MACHINE_SHORT).find(k=>MACHINE_SHORT[k]===m)] || T.orange }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {[["Jour wash",T.orange,"●"],["Aujourd'hui",T.gold,"●"],["Day off",T.border,"●"]].map(([lbl,c,ic]) => (
          <div key={lbl} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ color:c, fontSize:12 }}>{ic}</span>
            <span style={{ fontSize:11, color:T.dim }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Search section */}
      <Card style={{ marginBottom:16 }}>
        <SectionTitle icon="🔍" text="RECHERCHE WASHES" />
        <Field label="Strain">
          <select value={fStrain} onChange={e=>setFStrain(e.target.value)}>
            <option value="">Toutes</option>
            {allStrainNames.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="N° Wash">
            <select value={fWash} onChange={e=>setFWash(e.target.value)}>
              <option value="">Tous</option>
              {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>W{i+1}</option>)}
            </select>
          </Field>
          <Field label="Micron">
            <select value={fMicron} onChange={e=>setFMicron(e.target.value)}>
              <option value="">Tous</option>
              {MICRONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Btn onClick={doSearch} disabled={searching}>{searching ? "Recherche..." : "⚡ Rechercher"}</Btn>
      </Card>

      {searchResults !== null && (
        <div>
          <div style={{ fontSize:12, color:T.dim, marginBottom:10 }}>{searchResults.length} résultat{searchResults.length!==1?"s":""}</div>
          {searchResults.map(w => (
            <div key={w.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <div>
                  <span style={{ fontWeight:800 }}>{w.sessions?.strain||"—"}</span>
                  <span style={{ color:T.dim, fontSize:12, marginLeft:8 }}>{w.sessions?.date}</span>
                </div>
                <Badge color={MACHINE_COLORS[w.sessions?.machine]||T.dim}>{MACHINE_SHORT[w.sessions?.machine]||w.sessions?.machine}</Badge>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Badge color={T.orange}>W{w.numero}</Badge>
                {w.micron      && <Badge>{w.micron}</Badge>}
                {w.couleur_45  && <Badge color={T.dim}>{w.couleur_45}</Badge>}
                {w.texture     && <Badge color={T.ink}>{w.texture}</Badge>}
                {w.contaminants && <Badge color={T.danger}>⚠</Badge>}
              </div>
              {w.notes && <div style={{ fontSize:12, color:T.dim, marginTop:6 }}>{w.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawer && (
        <div style={{
          position:"fixed", inset:0, zIndex:200,
          background:"#00000099",
          display:"flex", flexDirection:"column", justifyContent:"flex-end",
        }} onClick={() => setDrawer(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:T.bg2, borderRadius:"20px 20px 0 0",
              border:`1px solid ${T.border}`, padding:20,
              maxHeight:"75vh", overflowY:"auto",
              animation:"drawerUp 0.3s cubic-bezier(.4,0,.2,1)",
              paddingBottom:"max(20px, env(safe-area-inset-bottom))",
            }}
          >
            <div style={{ width:40, height:4, background:T.border, borderRadius:2, margin:"0 auto 16px" }} />
            <div style={{ fontSize:16, fontWeight:800, color:T.white, marginBottom:4 }}>
              {new Date(drawer.date + "T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
            </div>
            <div style={{ fontSize:12, color:T.dim, marginBottom:16 }}>{drawer.sessions.length} session{drawer.sessions.length>1?"s":""}</div>

            {drawer.sessions.map(sess => {
              const sessWashes = drawerWashes[sess.id] || [];
              const sessPesees = drawerPesees[sess.id] || [];
              const totalPoids = sessPesees.reduce((a,p) => a+(parseFloat(p.poids_sec_g)||0), 0);
              const rend = sess.biomasse_kg && totalPoids > 0
                ? ((totalPoids/(parseFloat(sess.biomasse_kg)*1000))*100).toFixed(2)
                : null;
              const mColor = MACHINE_COLORS[sess.machine] || T.orange;
              return (
                <div key={sess.id} style={{ background:T.bg3, border:`1px solid ${mColor}44`, borderRadius:12, padding:14, marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:15, fontWeight:800, color:T.white }}>{sess.strain||"—"}</div>
                      <div style={{ fontSize:11, color:T.dim }}>{sess.biomasse_kg}kg · {sess.nb_sacs} sacs</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Badge color={mColor}>{MACHINE_SHORT[sess.machine]||sess.machine}</Badge>
                      {rend && <div style={{ fontSize:18, fontWeight:800, color:T.gold, fontFamily:"DM Mono", marginTop:4 }}>{rend}%</div>}
                    </div>
                  </div>
                  {sessWashes.length > 0 && (
                    <div>
                      <div style={{ fontSize:9, color:T.dim, marginBottom:6, letterSpacing:"0.1em" }}>WASHES ({sessWashes.length})</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {sessWashes.map(w => (
                          <div key={w.id} style={{ background:T.bg, borderRadius:8, padding:"5px 8px", border:`1px solid ${T.border}` }}>
                            <span style={{ fontFamily:"DM Mono", color:mColor, fontWeight:800, fontSize:11 }}>W{w.numero}</span>
                            {w.micron && <span style={{ fontSize:10, color:T.dim, marginLeft:4 }}>{w.micron}</span>}
                            {w.couleur_45 && <span style={{ fontSize:10, color:T.ink, marginLeft:4 }}>{w.couleur_45}</span>}
                            {w.contaminants && <span style={{ fontSize:10, color:T.danger, marginLeft:4 }}>⚠</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {sessPesees.length > 0 && (
                    <div style={{ marginTop:10, display:"flex", gap:8 }}>
                      {sessPesees.map(p => (
                        <div key={p.id} style={{ background:T.bg, borderRadius:8, padding:"5px 10px", flex:1, textAlign:"center" }}>
                          <div style={{ fontSize:9, color:T.dim }}>{p.micron}</div>
                          <div style={{ fontSize:14, fontWeight:800, color:T.gold, fontFamily:"DM Mono" }}>{p.poids_sec_g}g</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── RECHERCHE ────────────────────────────────────────────────────────────────
const Recherche = ({ strains }) => {
  const [f, setF] = useState({ strain:"", wash:"", micron:"" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true); setSearched(true);
    try {
      let q = "washes?select=*,sessions(date,machine,strain,biomasse_kg)";
      if (f.micron) q += `&micron=eq.${encodeURIComponent(f.micron)}`;
      if (f.wash)   q += `&numero=eq.${f.wash}`;
      let data = await sbFetch(q + "&order=created_at.desc");
      if (f.strain && data) data = data.filter(w => w.sessions?.strain === f.strain);
      setResults(data||[]);
    } catch(e) { setResults([]); }
    finally { setLoading(false); }
  };

  const strainNames = strains.length ? strains.map(s => s.nom||s) : STRAINS_DEFAULT;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <Card style={{ marginBottom:16 }}>
        <SectionTitle icon="🔍" text="FILTRES AVANCÉS" />
        <Field label="Strain">
          <select value={f.strain} onChange={e=>setF(x=>({...x,strain:e.target.value}))}>
            <option value="">Toutes</option>
            {strainNames.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="N° Wash">
            <select value={f.wash} onChange={e=>setF(x=>({...x,wash:e.target.value}))}>
              <option value="">Tous</option>
              {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>W{i+1}</option>)}
            </select>
          </Field>
          <Field label="Micron">
            <select value={f.micron} onChange={e=>setF(x=>({...x,micron:e.target.value}))}>
              <option value="">Tous</option>
              {MICRONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Btn onClick={search} disabled={loading}>{loading ? "Recherche..." : "⚡ Rechercher"}</Btn>
      </Card>
      {searched && (
        <div style={{ fontSize:12, color:T.dim, marginBottom:10 }}>
          {results.length} résultat{results.length!==1?"s":""}
        </div>
      )}
      {results.map(w => (
        <div key={w.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <span style={{ fontWeight:800 }}>{w.sessions?.strain||"—"}</span>
              <span style={{ color:T.dim, fontSize:12, marginLeft:8 }}>{w.sessions?.date}</span>
            </div>
            <Badge color={MACHINE_COLORS[w.sessions?.machine]||T.dim}>
              {MACHINE_SHORT[w.sessions?.machine]||w.sessions?.machine}
            </Badge>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Badge color={T.orange}>W{w.numero}</Badge>
            {w.micron     && <Badge>{w.micron}</Badge>}
            {w.couleur_45 && <Badge color={T.dim}>{w.couleur_45}</Badge>}
            {w.texture    && <Badge color={T.ink}>{w.texture}</Badge>}
            {w.contaminants && <Badge color={T.danger}>⚠</Badge>}
          </div>
          {w.notes && <div style={{ fontSize:12, color:T.dim, marginTop:6 }}>{w.notes}</div>}
        </div>
      ))}
    </div>
  );
};

// ─── PHOTO IA ─────────────────────────────────────────────────────────────────
const PhotoIA = ({ strains }) => {
  const [strain, setStrain] = useState("");
  const [micron, setMicron] = useState("");
  const [washNum, setWashNum] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setImage(ev.target.result.split(",")[1]); };
    reader.readAsDataURL(file);
    setResult(null); setSaved(false);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true); setResult(null); setScanPct(0);
    const iv = setInterval(() => setScanPct(p => { if(p>=99){clearInterval(iv);return 99;} return p+2; }), 60);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:400,
          messages:[{ role:"user", content:[
            { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:image } },
            { type:"text", text:`Analyse ce plateau de hash ice water. Strain:${strain||"?"} Micron:${micron||"?"} Wash:W${washNum||"?"}.
Réponds UNIQUEMENT en JSON valide:
{"couleur":"<Blanc|Gris clair|Beige|Marron clair|Marron vert|Marron foncé|Vert foncé|Dégeulasse>","texture":"<Lisse|Légèrement granuleux|Melt>","remplissage":"<0-100>%","contaminants":<true|false>,"observations":"<1 phrase max>"}` }
          ]}],
        }),
      });
      clearInterval(iv); setScanPct(100);
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) {
      clearInterval(iv); setScanPct(100);
      setResult({ error:"Analyse échouée: " + e.message });
    }
    setAnalyzing(false);
  };

  const saveResult = async () => {
    if (!result || result.error) return;
    setSaving(true);
    try {
      await sbFetch("washes", {
        method:"POST", prefer:"return=minimal",
        body:JSON.stringify({
          micron:micron||null, numero:parseInt(washNum)||null,
          couleur_45:result.couleur, texture:result.texture,
          contaminants:result.contaminants,
          notes:`[Photo IA] ${result.observations||""} Remplissage:${result.remplissage||"?"}`,
        }),
      });
      setSaved(true);
    } catch(e) { alert("Erreur: "+e.message); }
    finally { setSaving(false); }
  };

  const strainNames = strains.length ? strains.map(s=>s.nom||s) : STRAINS_DEFAULT;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <Card style={{ marginBottom:14 }}>
        <SectionTitle icon="🔬" text="SCOUTER VISION" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="Strain">
            <select value={strain} onChange={e=>setStrain(e.target.value)}>
              <option value="">—</option>
              {strainNames.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Micron">
            <select value={micron} onChange={e=>setMicron(e.target.value)}>
              <option value="">—</option>
              {MICRONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Field label="N° Wash">
          <select value={washNum} onChange={e=>setWashNum(e.target.value)}>
            <option value="">—</option>
            {Array.from({length:12},(_,i) => <option key={i+1} value={i+1}>W{i+1}</option>)}
          </select>
        </Field>
      </Card>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display:"none" }} />

      {!preview ? (
        <Btn onClick={() => fileRef.current.click()}>📷 Prendre une photo</Btn>
      ) : (
        <>
          <div style={{ position:"relative", marginBottom:12, borderRadius:12, overflow:"hidden" }}>
            <img src={preview} alt="plateau" style={{ width:"100%", maxHeight:260, objectFit:"cover", display:"block" }} />
            {analyzing && (
              <div style={{ position:"absolute", inset:0, background:"#00000099", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:14 }}>
                {/* Scan line */}
                <div style={{ position:"absolute", left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${T.orange}, transparent)`, animation:"scanLine 1.2s linear infinite" }} />
                <div style={{ fontSize:11, color:T.orange, fontWeight:800, letterSpacing:3 }}>SCOUTER EN COURS...</div>
                <div style={{ width:"65%", height:8, background:T.border, borderRadius:4 }}>
                  <div style={{ height:"100%", width:`${scanPct}%`, background:`linear-gradient(90deg,${T.orange},${T.gold})`, borderRadius:4, transition:"width 0.1s" }} />
                </div>
                <div style={{ fontFamily:"DM Mono", fontSize:24, color:T.gold, fontWeight:800 }}>{scanPct}%</div>
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <BtnOutline color={T.dim} onClick={() => { setPreview(null); setImage(null); setResult(null); setSaved(false); }}>Changer</BtnOutline>
            <Btn onClick={analyze} disabled={analyzing}>{analyzing ? "Analyse..." : "⚡ Analyser"}</Btn>
          </div>
        </>
      )}

      {result && !result.error && (
        <Card style={{ border:`1px solid ${T.gold}44` }}>
          <SectionTitle icon="✅" text="RÉSULTAT SCOUTER" color={T.gold} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[
              ["Couleur",result.couleur,T.orange],
              ["Texture",result.texture,T.gold],
              ["Remplissage",result.remplissage,T.green],
              ["Contaminants",result.contaminants?"⚠ Oui":"✓ Non",result.contaminants?T.danger:T.green],
            ].map(([l,v,c]) => (
              <div key={l} style={{ background:T.bg3, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:9, color:T.dim, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:15, fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
          {result.observations && (
            <div style={{ fontSize:13, color:T.dim, fontStyle:"italic", marginBottom:12 }}>{result.observations}</div>
          )}
          {saved
            ? <div style={{ textAlign:"center", color:T.green, fontWeight:700 }}>✓ Sauvegardé dans Supabase</div>
            : <Btn onClick={saveResult} disabled={saving} color={T.green}>{saving ? "Sauvegarde..." : "💾 Sauvegarder"}</Btn>
          }
        </Card>
      )}
      {result?.error && (
        <div style={{ background:T.danger+"22", border:`1px solid ${T.danger}`, borderRadius:10, padding:14, color:T.danger, marginTop:14 }}>
          {result.error}
        </div>
      )}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [strains, setStrains] = useState([]);

  useEffect(() => {
    sbFetch("strains?select=*&order=nom.asc").then(d => setStrains(d||[])).catch(()=>{});
  }, []);

  const titles = {
    dashboard: ["Dashboard",    "Vue d'ensemble en temps réel"],
    session:   ["Session",      "Saisie & Wash Lab"],
    calendar:  ["Lab Calendar", "Historique & Planification"],
    recherche: ["Recherche",    "Filtres croisés"],
    photo:     ["Photo IA",     "Scouter Vision"],
  };
  const [title, sub] = titles[screen] || ["",""];

  const screens = {
    dashboard: <Dashboard />,
    session:   <Session strains={strains} />,
    calendar:  <LabCalendar />,
    recherche: <Recherche strains={strains} />,
    photo:     <PhotoIA strains={strains} />,
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth:768, margin:"0 auto", minHeight:"100vh" }}>
        <AppHeader />
        <ScreenHeader title={title} sub={sub} />
        <div style={{ paddingBottom:80 }}>
          {screens[screen]}
        </div>
        <NavBar active={screen} onNav={setScreen} />
      </div>
    </>
  );
}
