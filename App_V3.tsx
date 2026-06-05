import { useState, useEffect, useRef, useMemo } from "react";

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
const MICRONS = ["220µ","160µ","90µ","45µ","25µ","FS"];
const STRAINS_DEFAULT = ["London","Miami","Blueberry","Gelato","OG Kush","Wedding Cake","Runtz","Zkittlez","Purple Punch"];

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
};

const STRAIN_COLORS = ["#D85B28","#D4A843","#4CAF50","#2C7BB5","#8E44AD","#E91E8C","#1ABC9C","#E67E22","#3498DB"];

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body,#root{background:#08080E;color:#E8E8F8;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:#08080E;}
::-webkit-scrollbar-thumb{background:#1A1A35;border-radius:2px;}
input,select,textarea{background:#0D0D1A;border:1px solid #1A1A35;color:#E8E8F8;font-family:'DM Sans',sans-serif;font-size:15px;border-radius:8px;padding:10px 14px;width:100%;outline:none;-webkit-appearance:none;appearance:none;transition:border-color 0.2s;}
input:focus,select:focus,textarea:focus{border-color:#D85B28;}
select option{background:#0D0D1A;}
button{cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;border:none;outline:none;}
@keyframes aura{0%,100%{box-shadow:0 0 20px #FFD700,0 0 40px #FFD70044;}50%{box-shadow:0 0 40px #FFD700,0 0 80px #FFD70088;}}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes scanLine{0%{top:0%;}100%{top:100%;}}
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

const Card = ({ children, style={}, glow }) => (
  <div style={{
    background:T.card, border:`1px solid ${glow ? T.orange+"66" : T.border}`,
    borderRadius:14, padding:16, marginBottom:12,
    animation: glow ? "aura 2s infinite" : "none",
    ...style,
  }}>{children}</div>
);

const Badge = ({ children, color=T.gold }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.05em", whiteSpace:"nowrap" }}>
    {children}
  </span>
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
  <div style={{ background:T.card, border:`1px solid ${color}22`, borderRadius:14, padding:"14px 16px", flex:1, position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:-20, right:-20, width:70, height:70, borderRadius:"50%", background:`radial-gradient(circle, ${color}18, transparent)` }} />
    {icon && <div style={{ fontSize:18, marginBottom:6 }}>{icon}</div>}
    <div style={{ fontSize:10, color:T.dim, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize:11, color:T.ink, marginTop:4 }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ icon, text }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
    <div style={{ width:3, height:18, background:T.orange, borderRadius:2 }} />
    <span style={{ fontSize:11, fontWeight:800, color:T.orange, letterSpacing:"0.12em", textTransform:"uppercase" }}>{icon} {text}</span>
  </div>
);

const Loader = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:200 }}>
    <div style={{ color:T.orange, fontSize:32, animation:"pulse 1s infinite" }}>⚡</div>
  </div>
);

// ─── BIG TOUCH BUTTONS ────────────────────────────────────────────────────────
const TouchStepper = ({ label, value, onChange, min=0, max=99, step=1, unit="" }) => (
  <div style={{ marginBottom:14 }}>
    <Lbl>{label}</Lbl>
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(1))))} style={{
        width:52, height:52, borderRadius:12, background:T.bg3, border:`1px solid ${T.border}`,
        color:T.white, fontSize:24, fontWeight:700,
      }}>−</button>
      <div style={{ flex:1, textAlign:"center", fontSize:28, fontWeight:800, color:T.orange, fontFamily:"DM Mono" }}>
        {value}{unit}
      </div>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(1))))} style={{
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

// ─── TIMER ────────────────────────────────────────────────────────────────────
const WashTimer = () => {
  const [duree, setDuree] = useState(15);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  const start = () => { setRemaining(duree * 60); setRunning(true); setDone(false); };
  const stop  = () => { setRunning(false); clearInterval(intervalRef.current); };

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining(r => r - 1), 1000);
    } else if (running && remaining === 0) {
      setRunning(false); setDone(true);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0,300,600].forEach(delay => {
          setTimeout(() => {
            const o = ctx.createOscillator(); const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = 880; g.gain.value = 0.3;
            o.start(); o.stop(ctx.currentTime + 0.4);
          }, delay);
        });
      } catch(e) {}
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  const mins = remaining !== null ? Math.floor(remaining / 60) : duree;
  const secs = remaining !== null ? remaining % 60 : 0;
  const pct  = remaining !== null ? (remaining / (duree * 60)) * 100 : 100;

  return (
    <div style={{ background: done ? "#1A0800" : T.bg3, border:`2px solid ${done ? T.orange : T.border}`, borderRadius:16, padding:20, marginBottom:16 }}>
      <SectionTitle icon="⏱" text="CHRONO WASH" />
      {!running && remaining === null && (
        <BigSelect label="Durée" value={`${duree}`} onChange={v=>setDuree(parseInt(v))} options={DUREES_MIN.map(String)} />
      )}
      <div style={{ textAlign:"center", margin:"16px 0" }}>
        <div style={{ fontSize:64, fontWeight:800, color: done ? T.orange : T.white, fontFamily:"DM Mono", lineHeight:1 }}>
          {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
        </div>
        {done && <div style={{ color:T.orange, fontWeight:800, fontSize:18, marginTop:8 }}>⚡ WASH TERMINÉ</div>}
        {remaining !== null && !done && (
          <div style={{ marginTop:12, height:6, background:T.border, borderRadius:3 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${T.orange}, ${T.gold})`, borderRadius:3, transition:"width 1s linear" }} />
          </div>
        )}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {!running && !done && <Btn onClick={start} color={T.green}>▶ Démarrer</Btn>}
        {running && <BtnOutline onClick={stop} color={T.danger}>⏹ Arrêter</BtnOutline>}
        {(done || remaining !== null) && <BtnOutline onClick={() => { setRemaining(null); setDone(false); }} color={T.dim}>↺ Reset</BtnOutline>}
      </div>
    </div>
  );
};

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", icon:"⛩", label:"Dashboard" },
  { id:"session",   icon:"🏮", label:"Session" },
  { id:"historique",icon:"📜", label:"Historique" },
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
  }}>
    {NAV.map(item => (
      <button key={item.id} onClick={() => onNav(item.id)} style={{
        background:"none", border:"none", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        padding:"4px 12px", opacity: active === item.id ? 1 : 0.4, transition:"all 0.2s",
      }}>
        <span style={{ fontSize: active === item.id ? 22 : 18 }}>{item.icon}</span>
        <span style={{ fontSize:9, color: active === item.id ? T.gold : T.dim, fontWeight: active === item.id ? 700 : 400, letterSpacing:0.5, textTransform:"uppercase" }}>{item.label}</span>
        {active === item.id && <div style={{ width:20, height:2, background:T.orange, borderRadius:1, boxShadow:`0 0 6px ${T.orange}` }} />}
      </button>
    ))}
  </nav>
);

// ─── HEADER ───────────────────────────────────────────────────────────────────
const AppHeader = ({ sessionStart }) => {
  const [alert, setAlert] = useState(false);
  useEffect(() => {
    if (!sessionStart) return;
    const t = setInterval(() => {
      const elapsed = (Date.now() - sessionStart) / 3600000;
      setAlert(elapsed >= 3);
    }, 30000);
    return () => clearInterval(t);
  }, [sessionStart]);

  return (
    <div style={{
      background: alert ? "#1A0000" : `linear-gradient(180deg, ${T.bg2}, transparent)`,
      padding:"12px 20px 10px", display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:50, backdropFilter:"blur(10px)",
      borderBottom:`1px solid ${alert ? T.danger+"44" : T.border}`,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>🏮</span>
        <div>
          <span style={{ fontSize:15, fontWeight:800, color:T.white, letterSpacing:-0.3 }}>SENZU</span>
          <span style={{ fontSize:15, fontWeight:300, color:T.orange, letterSpacing:3, marginLeft:5 }}>ASIA</span>
        </div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:9, color:T.dim }}>{new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}</div>
        {alert
          ? <div style={{ fontSize:9, color:T.danger, fontWeight:700 }}>⚠ DÉGRADATION TERPÉNIQUE</div>
          : <div style={{ fontSize:9, color:T.green }}>● Connecté</div>}
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

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [washes,   setWashes]   = useState([]);
  const [pesees,   setPesees]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      sbFetch("sessions?select=*&order=date.desc"),
      sbFetch("washes?select=*"),
      sbFetch("pesees?select=*"),
    ]).then(([s,w,p]) => {
      setSessions(s||[]); setWashes(w||[]); setPesees(p||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const totalBio = sessions.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);
  const contam   = washes.filter(w=>w.contaminants).length;

  const rendByStrain = useMemo(() => {
    const map = {};
    pesees.forEach(p => {
      const sess = sessions.find(s=>s.id===p.session_id);
      if (!sess) return;
      const n = sess.strain||"?";
      if (!map[n]) map[n] = { poids:0, bio:0 };
      map[n].poids += parseFloat(p.poids_sec_g)||0;
      map[n].bio   += parseFloat(sess.biomasse_kg)||0;
    });
    return Object.entries(map).map(([nom,v])=>({ nom, rend: v.bio>0?((v.poids/(v.bio*1000))*100).toFixed(1):"—" }));
  },[pesees,sessions]);

  const byMonth = useMemo(() => {
    const m={};
    washes.forEach(w=>{ if(!w.created_at)return; const k=w.created_at.slice(0,7); m[k]=(m[k]||0)+1; });
    return Object.keys(m).sort().slice(-6).map(k=>({k,v:m[k]}));
  },[washes]);

  const strainDist = useMemo(()=>{
    const m={};
    sessions.forEach(s=>{ if(s.strain) m[s.strain]=(m[s.strain]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[sessions]);

  if (loading) return <Loader />;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <KPI label="Sessions" value={sessions.length} icon="⛩" />
        <KPI label="Washes"   value={washes.length}   icon="💧" color={T.gold} />
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <KPI label="Biomasse"     value={`${totalBio.toFixed(0)}kg`} icon="🌿" color={T.green} />
        <KPI label="Contaminants" value={contam} icon="⚠" color={contam>0?T.danger:T.green} />
      </div>

      {rendByStrain.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <SectionTitle icon="🃏" text="CARTES STRAINS" />
          <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8 }}>
            {rendByStrain.map((s,i)=>(
              <div key={s.nom} style={{
                background:`linear-gradient(135deg, ${T.bg3}, ${STRAIN_COLORS[i%STRAIN_COLORS.length]}22)`,
                border:`1px solid ${STRAIN_COLORS[i%STRAIN_COLORS.length]}44`,
                borderRadius:16, padding:"14px 16px", minWidth:140, flexShrink:0,
              }}>
                <div style={{ fontSize:10, color:T.dim, marginBottom:4 }}>STRAIN</div>
                <div style={{ fontSize:16, fontWeight:800, color:T.white, marginBottom:8 }}>{s.nom}</div>
                <div style={{ fontSize:10, color:T.dim }}>RENDEMENT</div>
                <div style={{ fontSize:24, fontWeight:800, color:STRAIN_COLORS[i%STRAIN_COLORS.length] }}>{s.rend}%</div>
                <div style={{ marginTop:6, fontSize:10, color:T.gold }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {byMonth.length > 0 && (
        <Card style={{ marginBottom:16 }}>
          <SectionTitle icon="📊" text="WASHES PAR MOIS" />
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80, marginTop:8 }}>
            {byMonth.map(({k,v})=>{
              const max=Math.max(...byMonth.map(x=>x.v));
              const h=(v/max)*70;
              return (
                <div key={k} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                  <div style={{ fontSize:10, color:T.orange, fontWeight:700 }}>{v}</div>
                  <div style={{ width:"100%", height:h, background:`linear-gradient(180deg, ${T.orange}, ${T.orangeGlow}44)`, borderRadius:"4px 4px 0 0" }} />
                  <div style={{ fontSize:9, color:T.dim }}>{k.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {strainDist.length > 0 && (
        <Card>
          <SectionTitle icon="🧬" text="RÉPARTITION STRAINS" />
          {strainDist.map(([nom,count],i)=>{
            const pct=Math.round((count/sessions.length)*100);
            return (
              <div key={nom} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13 }}>{nom}</span>
                  <span style={{ fontSize:13, color:STRAIN_COLORS[i%STRAIN_COLORS.length], fontWeight:700 }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:T.border, borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:STRAIN_COLORS[i%STRAIN_COLORS.length], borderRadius:3 }} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

// ─── SESSION ──────────────────────────────────────────────────────────────────
const emptyWash = (n) => ({ numero:n, micron:"", glace_kg:0, vitesse:"", duree_min:15, temp_finale:"", couleur_160:"", couleur_90:"", couleur_45:"", texture:"", contaminants:false, potentiel_wash_plus:false, notes:"" });
const emptySession = () => ({ machine:"", strain:"", biomasse_kg:8, type_biomasse:"Fresh Frozen", nb_sacs:16, heure_debut:"", heure_fin:"", notes:"", washes:Array.from({length:10},(_,i)=>emptyWash(i+1)) });
const LS_KEY = "senzu_draft_v3";

const Session = ({ strains }) => {
  const [sess, setSess] = useState(()=>{ try { const d=localStorage.getItem(LS_KEY); return d?JSON.parse(d):emptySession(); } catch { return emptySession(); } });
  const [activeWash, setActiveWash] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [showCloture, setShowCloture] = useState(false);
  const [pesees, setPesees] = useState({ "90µ":0, "45µ":0, "25µ":0 });

  useEffect(()=>{ try { localStorage.setItem(LS_KEY, JSON.stringify(sess)); } catch {} },[sess]);

  const setF = (k,v) => setSess(s=>({...s,[k]:v}));
  const setW = (i,k,v) => setSess(s=>{ const w=[...s.washes]; w[i]={...w[i],[k]:v}; return {...s,washes:w}; });

  const handleSave = async () => {
    if (!sess.machine||!sess.strain) { alert("Machine et strain requis."); return; }
    setSaving(true);
    try {
      const [row] = await sbFetch("sessions",{
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
      const validW = sess.washes.filter(w=>w.micron);
      if (validW.length>0) {
        await sbFetch("washes",{
          method:"POST", prefer:"return=minimal",
          body:JSON.stringify(validW.map(w=>({
            session_id:row.id, numero:w.numero, micron:w.micron,
            glace_kg:w.glace_kg||null, vitesse:w.vitesse||null,
            duree_min:w.duree_min||null, temp_finale:parseFloat(w.temp_finale)||null,
            couleur_160:w.couleur_160||null, couleur_90:w.couleur_90||null,
            couleur_45:w.couleur_45||null, texture:w.texture||null,
            contaminants:w.contaminants, notes:w.notes||null,
          }))),
        });
      }
      setSavedId(row.id);
      setShowCloture(true);
    } catch(e) { alert("Erreur: "+e.message); }
    finally { setSaving(false); }
  };

  const handleCloture = async () => {
    if (!savedId) return;
    setSaving(true);
    try {
      const rows = Object.entries(pesees).filter(([,v])=>parseFloat(v)>0).map(([micron,poids_sec_g])=>({ session_id:savedId, micron, poids_sec_g:parseFloat(poids_sec_g) }));
      if (rows.length>0) await sbFetch("pesees",{method:"POST",prefer:"return=minimal",body:JSON.stringify(rows)});
      await sbFetch(`sessions?id=eq.${savedId}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify({statut:"cloture"})});
      localStorage.removeItem(LS_KEY);
      setSess(emptySession()); setShowCloture(false); setSavedId(null);
      alert("✅ Session clôturée !");
    } catch(e) { alert("Erreur: "+e.message); }
    finally { setSaving(false); }
  };

  const totalPesee = Object.values(pesees).reduce((a,v)=>a+(parseFloat(v)||0),0);
  const rendement  = sess.biomasse_kg>0 ? ((totalPesee/(parseFloat(sess.biomasse_kg)*1000))*100).toFixed(2) : null;
  const isRecord   = rendement && parseFloat(rendement) > 15;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      {showCloture ? (
        <Card glow style={{ marginBottom:16 }}>
          <SectionTitle icon="⏳" text="CHAMBRE DE L'ESPRIT ET DU TEMPS" />
          <div style={{ textAlign:"center", padding:"10px 0 16px" }}>
            <Badge color={T.gold}>EN SÉCHAGE — FREEZE DRYER</Badge>
          </div>
          <SectionTitle icon="⚖" text="PESÉES FINALES" />
          {["90µ","45µ","25µ"].map(m=>(
            <TouchStepper key={m} label={`Poids sec ${m} (g)`} value={parseFloat(pesees[m])||0} onChange={v=>setPesees(p=>({...p,[m]:v}))} step={0.1} max={9999} unit="g" />
          ))}
          {rendement && (
            <div style={{
              textAlign:"center", padding:16, marginBottom:16,
              background: isRecord ? T.aura+"22" : T.bg3,
              border:`2px solid ${isRecord ? T.aura : T.border}`,
              borderRadius:12, animation: isRecord ? "aura 1.5s infinite" : "none",
            }}>
              <div style={{ fontSize:11, color:T.dim, marginBottom:4 }}>RENDEMENT SCOUTER</div>
              <div style={{ fontSize:52, fontWeight:800, color: isRecord ? T.aura : T.orange, fontFamily:"DM Mono" }}>{rendement}%</div>
              {isRecord && <div style={{ fontSize:18, fontWeight:800, color:T.aura, marginTop:8 }}>🔥 IT'S OVER 9000! 🔥</div>}
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <BtnOutline color={T.dim} onClick={()=>setShowCloture(false)}>← Retour</BtnOutline>
            <Btn onClick={handleCloture} disabled={saving} color={T.green}>{saving?"Clôture...":"🏆 Clôturer"}</Btn>
          </div>
        </Card>
      ) : (
        <>
          <WashTimer />
          <Card style={{ marginBottom:14 }}>
            <SectionTitle icon="⚙" text="INFOS SESSION" />
            <BigSelect label="Machine" value={sess.machine} onChange={v=>setF("machine",v)} options={MACHINES} />
            <Field label="Strain">
              <select value={sess.strain} onChange={e=>setF("strain",e.target.value)}>
                <option value="">Sélectionner...</option>
                {(strains.length?strains:STRAINS_DEFAULT).map(s=><option key={s.nom||s}>{s.nom||s}</option>)}
              </select>
            </Field>
            <TouchStepper label="Biomasse (kg)" value={parseFloat(sess.biomasse_kg)||0} onChange={v=>setF("biomasse_kg",v)} step={0.5} max={50} unit=" kg" />
            <TouchStepper label="Nombre de sacs" value={parseInt(sess.nb_sacs)||0} onChange={v=>setF("nb_sacs",v)} max={30} />
            <BigSelect label="Type biomasse" value={sess.type_biomasse} onChange={v=>setF("type_biomasse",v)} options={["Fresh Frozen","Dry","Live"]} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Field label="Début"><input type="time" value={sess.heure_debut} onChange={e=>setF("heure_debut",e.target.value)} /></Field>
              <Field label="Fin"><input type="time" value={sess.heure_fin} onChange={e=>setF("heure_fin",e.target.value)} /></Field>
            </div>
          </Card>

          <SectionTitle icon="💧" text="WASHES" />
          {sess.washes.map((w,i)=>(
            <WashCard key={i} wash={w} index={i} open={activeWash===i} onToggle={()=>setActiveWash(activeWash===i?null:i)} onChange={(k,v)=>setW(i,k,v)} />
          ))}

          <div style={{ marginTop:20, display:"flex", gap:10 }}>
            <BtnOutline color={T.danger} onClick={()=>{ setSess(emptySession()); localStorage.removeItem(LS_KEY); }}>↺ Reset</BtnOutline>
            <Btn onClick={handleSave} disabled={saving}>{saving?"Sauvegarde...":"🏮 Clôturer & Sécher"}</Btn>
          </div>
        </>
      )}
    </div>
  );
};

const WashCard = ({ wash, index, open, onToggle, onChange }) => {
  const hasData = wash.micron||wash.couleur_45;
  return (
    <div style={{ marginBottom:8 }}>
      <button onClick={onToggle} style={{
        width:"100%", background:open?T.bg3:T.card,
        border:`1px solid ${hasData?T.orange+"66":T.border}`,
        borderRadius:open?"12px 12px 0 0":12,
        padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", color:T.white,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"DM Mono", fontWeight:800, color:hasData?T.orange:T.dim }}>W{wash.numero}</span>
          {wash.micron   && <Badge>{wash.micron}</Badge>}
          {wash.couleur_45 && <Badge color={T.dim}>{wash.couleur_45}</Badge>}
          {wash.contaminants && <Badge color={T.danger}>⚠</Badge>}
          {wash.potentiel_wash_plus && <Badge color={T.green}>+</Badge>}
        </div>
        <span style={{ color:T.dim }}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{ background:T.bg3, border:`1px solid ${T.orange+"44"}`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:16 }}>
          <BigSelect label="Micron"    value={wash.micron}   onChange={v=>onChange("micron",v)}   options={MICRONS} />
          <TouchStepper label="Glace (kg)" value={wash.glace_kg||0} onChange={v=>onChange("glace_kg",v)} step={0.5} max={20} unit=" kg" />
          <BigSelect label="Vitesse"   value={wash.vitesse}  onChange={v=>onChange("vitesse",v)}  options={VITESSES} />
          <BigSelect label="Durée (min)" value={String(wash.duree_min)} onChange={v=>onChange("duree_min",parseInt(v))} options={DUREES_MIN.map(String)} />
          <BigSelect label="Couleur 90µ"  value={wash.couleur_90}  onChange={v=>onChange("couleur_90",v)}  options={COULEURS} />
          <BigSelect label="Couleur 45µ"  value={wash.couleur_45}  onChange={v=>onChange("couleur_45",v)}  options={COULEURS} />
          <BigSelect label="Texture"   value={wash.texture}  onChange={v=>onChange("texture",v)}  options={TEXTURES} />
          <Field label="Temp. finale (°C)">
            <input type="number" value={wash.temp_finale} onChange={e=>onChange("temp_finale",e.target.value)} placeholder="ex: 2" />
          </Field>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={()=>onChange("contaminants",!wash.contaminants)} style={{
                width:28, height:28, borderRadius:8, border:`2px solid ${wash.contaminants?T.danger:T.border}`,
                background:wash.contaminants?T.danger+"33":"transparent", flexShrink:0,
              }}>{wash.contaminants&&<span style={{ color:T.danger }}>✓</span>}</button>
              <span style={{ fontSize:14, color:wash.contaminants?T.danger:T.dim }}>Contaminants</span>
            </div>
            <button onClick={()=>onChange("potentiel_wash_plus",!wash.potentiel_wash_plus)} style={{
              padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700,
              background:wash.potentiel_wash_plus?T.green+"33":T.bg,
              border:`1.5px solid ${wash.potentiel_wash_plus?T.green:T.border}`,
              color:wash.potentiel_wash_plus?T.green:T.dim,
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

// ─── HISTORIQUE ───────────────────────────────────────────────────────────────
const Historique = () => {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("");
  const [open,     setOpen]     = useState(null);
  const [washMap,  setWashMap]  = useState({});
  const [peseeMap, setPeseeMap] = useState({});

  useEffect(()=>{
    sbFetch("sessions?select=*&order=date.desc,created_at.desc").then(d=>setSessions(d||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const toggle = async (id) => {
    if (open===id) { setOpen(null); return; }
    setOpen(id);
    if (!washMap[id]) {
      const [w,p] = await Promise.all([
        sbFetch(`washes?session_id=eq.${id}&order=numero.asc`),
        sbFetch(`pesees?session_id=eq.${id}`),
      ]);
      setWashMap(m=>({...m,[id]:w||[]}));
      setPeseeMap(m=>({...m,[id]:p||[]}));
    }
  };

  const filtered = filter ? sessions.filter(s=>s.machine===filter) : sessions;
  const sColor = { wash_en_cours:T.orange, sechage:T.gold, cloture:T.green };
  const sLabel = { wash_en_cours:"🏮 En cours", sechage:"⏳ Séchage", cloture:"✅ Clôturé" };

  if (loading) return <Loader />;

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <div style={{ marginBottom:14 }}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">Toutes les machines</option>
          {MACHINES.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>
      {filtered.length===0 && <div style={{ textAlign:"center", color:T.dim, padding:40 }}>Aucune session</div>}
      {filtered.map(s=>{
        const sc = sColor[s.statut]||T.dim;
        return (
          <div key={s.id} style={{ marginBottom:10 }}>
            <button onClick={()=>toggle(s.id)} style={{
              width:"100%", background:open===s.id?T.bg3:T.card,
              border:`1px solid ${T.border}`, borderRadius:open===s.id?"12px 12px 0 0":12,
              padding:"14px 16px", textAlign:"left", color:T.white,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:16 }}>{s.strain||"—"}</div>
                  <div style={{ fontSize:12, color:T.dim, marginTop:2 }}>{s.date} · {s.machine}</div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <Badge color={sc}>{sLabel[s.statut]||s.statut}</Badge>
                  <span style={{ color:T.dim }}>{open===s.id?"▲":"▼"}</span>
                </div>
              </div>
            </button>
            {open===s.id && (
              <div style={{ background:T.bg3, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 0 12px 12px", padding:16 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                  {[["Biomasse",s.biomasse_kg?`${s.biomasse_kg}kg`:"—"],["Sacs",s.nb_sacs||"—"],["Type",s.type_biomasse||"—"]].map(([l,v])=>(
                    <div key={l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:9, color:T.dim, marginBottom:2 }}>{l}</div>
                      <div style={{ fontWeight:700, color:T.orange, fontSize:14 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {washMap[s.id]?.map(w=>(
                  <div key={w.id} style={{ background:T.bg, borderRadius:8, padding:"10px 12px", marginBottom:6, border:`1px solid ${T.border}` }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontFamily:"DM Mono", fontWeight:800, color:T.orange, fontSize:13 }}>W{w.numero}</span>
                      {w.micron    && <Badge>{w.micron}</Badge>}
                      {w.couleur_45 && <Badge color={T.dim}>{w.couleur_45}</Badge>}
                      {w.texture   && <Badge color={T.ink}>{w.texture}</Badge>}
                      {w.contaminants && <Badge color={T.danger}>⚠</Badge>}
                    </div>
                    {w.notes && <div style={{ fontSize:12, color:T.dim, marginTop:6 }}>{w.notes}</div>}
                  </div>
                ))}
                {peseeMap[s.id]?.length>0 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:10, color:T.gold, fontWeight:700, marginBottom:8 }}>⚖ PESÉES</div>
                    {peseeMap[s.id].map(p=>(
                      <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
                        <span style={{ color:T.dim, fontSize:13 }}>{p.micron}</span>
                        <span style={{ color:T.gold, fontWeight:700 }}>{p.poids_sec_g}g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
      if (f.micron) q+=`&micron=eq.${encodeURIComponent(f.micron)}`;
      if (f.wash)   q+=`&numero=eq.${f.wash}`;
      let data = await sbFetch(q+"&order=created_at.desc");
      if (f.strain&&data) data=data.filter(w=>w.sessions?.strain===f.strain);
      setResults(data||[]);
    } catch(e){ setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <Card style={{ marginBottom:16 }}>
        <SectionTitle icon="🔍" text="FILTRES" />
        <Field label="Strain">
          <select value={f.strain} onChange={e=>setF(x=>({...x,strain:e.target.value}))}>
            <option value="">Toutes</option>
            {(strains.length?strains:STRAINS_DEFAULT).map(s=><option key={s.nom||s}>{s.nom||s}</option>)}
          </select>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="N° Wash">
            <select value={f.wash} onChange={e=>setF(x=>({...x,wash:e.target.value}))}>
              <option value="">Tous</option>
              {Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>W{i+1}</option>)}
            </select>
          </Field>
          <Field label="Micron">
            <select value={f.micron} onChange={e=>setF(x=>({...x,micron:e.target.value}))}>
              <option value="">Tous</option>
              {MICRONS.map(m=><option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Btn onClick={search} disabled={loading}>{loading?"Recherche...":"⚡ Rechercher"}</Btn>
      </Card>
      {searched && <div style={{ fontSize:12, color:T.dim, marginBottom:10 }}>{results.length} résultat{results.length!==1?"s":""}</div>}
      {results.map(w=>(
        <div key={w.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <span style={{ fontWeight:800 }}>{w.sessions?.strain||"—"}</span>
              <span style={{ color:T.dim, fontSize:12, marginLeft:8 }}>{w.sessions?.date}</span>
            </div>
            <Badge color={T.dim}>{w.sessions?.machine}</Badge>
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
    setResult(null);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true); setResult(null); setScanPct(0);
    const iv = setInterval(()=>setScanPct(p=>{ if(p>=99){clearInterval(iv);return 99;} return p+2; }), 60);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:400,
          messages:[{ role:"user", content:[
            { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:image } },
            { type:"text", text:`Analyse ce plateau de hash ice water. Strain:${strain||"?"} Micron:${micron||"?"} Wash:W${washNum||"?"}.
Réponds UNIQUEMENT en JSON:
{"couleur":"<Blanc|Gris clair|Beige|Marron clair|Marron vert|Marron foncé|Vert foncé|Dégeulasse>","texture":"<Lisse|Légèrement granuleux|Melt>","remplissage":"<0-100>%","contaminants":<true|false>,"observations":"<1 phrase>"}` }
          ]}],
        }),
      });
      clearInterval(iv); setScanPct(100);
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("")||"";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e) {
      clearInterval(iv); setScanPct(100);
      setResult({ error:"Analyse échouée: "+e.message });
    }
    setAnalyzing(false);
  };

  const saveResult = async () => {
    if (!result||result.error) return;
    setSaving(true);
    try {
      await sbFetch("washes",{
        method:"POST", prefer:"return=minimal",
        body:JSON.stringify({
          micron:micron||null, numero:parseInt(washNum)||null,
          couleur_45:result.couleur, texture:result.texture,
          contaminants:result.contaminants,
          notes:`[Photo IA] ${result.observations||""} Remplissage:${result.remplissage||"?"}`,
        }),
      });
      setSaved(true);
    } catch(e){ alert("Erreur: "+e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding:"0 16px", paddingBottom:100, animation:"fadeIn 0.3s" }}>
      <Card style={{ marginBottom:14 }}>
        <SectionTitle icon="🔬" text="SCOUTER VISION" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Field label="Strain">
            <select value={strain} onChange={e=>setStrain(e.target.value)}>
              <option value="">—</option>
              {(strains.length?strains:STRAINS_DEFAULT).map(s=><option key={s.nom||s}>{s.nom||s}</option>)}
            </select>
          </Field>
          <Field label="Micron">
            <select value={micron} onChange={e=>setMicron(e.target.value)}>
              <option value="">—</option>
              {MICRONS.map(m=><option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <Field label="N° Wash">
          <select value={washNum} onChange={e=>setWashNum(e.target.value)}>
            <option value="">—</option>
            {Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>W{i+1}</option>)}
          </select>
        </Field>
      </Card>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display:"none" }} />

      {!preview ? (
        <Btn onClick={()=>fileRef.current.click()}>📷 Prendre une photo</Btn>
      ) : (
        <>
          <div style={{ position:"relative", marginBottom:12 }}>
            <img src={preview} alt="plateau" style={{ width:"100%", borderRadius:12, maxHeight:260, objectFit:"cover" }} />
            {analyzing && (
              <div style={{ position:"absolute", inset:0, borderRadius:12, background:"#00000099", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:13, color:T.orange, fontWeight:800, letterSpacing:2 }}>SCOUTER EN COURS...</div>
                <div style={{ width:"60%", height:8, background:T.border, borderRadius:4 }}>
                  <div style={{ height:"100%", width:`${scanPct}%`, background:`linear-gradient(90deg,${T.orange},${T.gold})`, borderRadius:4, transition:"width 0.1s" }} />
                </div>
                <div style={{ fontFamily:"DM Mono", fontSize:20, color:T.gold }}>{scanPct}%</div>
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <BtnOutline color={T.dim} onClick={()=>{ setPreview(null); setImage(null); setResult(null); }}>Changer</BtnOutline>
            <Btn onClick={analyze} disabled={analyzing}>{analyzing?"Analyse...":"⚡ Analyser"}</Btn>
          </div>
        </>
      )}

      {result && !result.error && (
        <Card style={{ border:`1px solid ${T.gold}44` }}>
          <SectionTitle icon="✅" text="RÉSULTAT SCOUTER" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[["Couleur",result.couleur,T.orange],["Texture",result.texture,T.gold],["Remplissage",result.remplissage,T.green],["Contaminants",result.contaminants?"⚠ Oui":"✓ Non",result.contaminants?T.danger:T.green]].map(([l,v,c])=>(
              <div key={l} style={{ background:T.bg3, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:9, color:T.dim, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
          {result.observations && <div style={{ fontSize:13, color:T.dim, fontStyle:"italic", marginBottom:12 }}>{result.observations}</div>}
          {saved
            ? <div style={{ textAlign:"center", color:T.green, fontWeight:700 }}>✓ Sauvegardé</div>
            : <Btn onClick={saveResult} disabled={saving} color={T.green}>{saving?"Sauvegarde...":"💾 Sauvegarder"}</Btn>}
        </Card>
      )}
      {result?.error && (
        <div style={{ background:T.danger+"22", border:`1px solid ${T.danger}`, borderRadius:10, padding:14, color:T.danger, marginTop:14 }}>{result.error}</div>
      )}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [strains, setStrains] = useState([]);

  useEffect(()=>{
    sbFetch("strains?select=*&order=nom.asc").then(d=>setStrains(d||[])).catch(()=>{});
  },[]);

  const titles = {
    dashboard: ["Dashboard","Vue d'ensemble en temps réel"],
    session:   ["Session","Saisie & Wash"],
    historique:["Historique","Toutes les sessions"],
    recherche: ["Recherche","Filtres croisés"],
    photo:     ["Photo IA","Scouter Vision"],
  };
  const [title, sub] = titles[screen]||["",""];

  const screens = {
    dashboard: <Dashboard />,
    session:   <Session strains={strains} />,
    historique:<Historique />,
    recherche: <Recherche strains={strains} />,
    photo:     <PhotoIA strains={strains} />,
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth:768, margin:"0 auto", minHeight:"100vh" }}>
        <AppHeader />
        <ScreenHeader title={title} sub={sub} />
        <div style={{ paddingBottom:80 }}>{screens[screen]}</div>
        <NavBar active={screen} onNav={setScreen} />
      </div>
    </>
  );
}
