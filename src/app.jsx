import { useState, useEffect, useRef, useMemo } from "react";

const SB_URL = "https://kbhfwixwtlptyaavvhit.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiaGZ3aXh3dGxwdHlhYXZ2aGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjY0MjQsImV4cCI6MjA5NjIwMjQyNH0.o2r2bDEVhQwqfkKVg5Jeml--XobIpWp74gjYeaso0dU";

const sbFetch = async (path, opts = {}) => {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: opts.prefer || "return=representation" },
    ...opts,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
};

const COULEURS = ["Blanc","Gris clair","Beige","Marron clair","Marron vert","Marron foncé","Vert foncé","Dégeulasse"];
const TEXTURES = ["Lisse","Légèrement granuleux","Melt"];
const VITESSES = ["Variateur 17","Variateur 18","Variateur 19","Variateur 20","Gentle","Normal"];
const MACHINES = ["Machine 1","Machine 2","Machine 3"];
const MS = { "Machine 1":"M1","Machine 2":"M2","Machine 3":"M3" };
const MC = { "Machine 1":"#C0392B","Machine 2":"#2471A3","Machine 3":"#7D3C98" };
const MICRONS = ["220µ","160µ","90µ","45µ","25µ","FS"];
const GLACE = ["—","1/4 cruche","1/2 cruche","1 cruche","1/3 sac","1/2 sac","1 sac"];
const CURES = ["Freeze Dry","Air Dry","Fresh Press"];
const DMINS = Array.from({length:60},(_,i)=>i+1);
const TINIT = { duree:15, remaining:null, running:false, done:false, startedAt:null };
const SC = ["#C0392B","#E67E22","#27AE60","#2471A3","#7D3C98","#E91E8C","#1ABC9C","#D4A843","#E74C3C","#16A085"];

const T = { bg:"#06060F",bg2:"#0A0A18",bg3:"#0E0E22",card:"#0B0B1A",border:"#1C1C3A",orange:"#C0392B",gold:"#D4A843",green:"#27AE60",white:"#EAE8F0",dim:"#4A4A7A",ink:"#8080B0",danger:"#E74C3C",aura:"#FFD700",purple:"#7D3C98" };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&family=DM+Mono:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{background:#06060F;color:#EAE8F0;font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:#1C1C3A;}
input,select,textarea{background:#0E0E22;border:1px solid #1C1C3A;color:#EAE8F0;font-family:'DM Sans',sans-serif;font-size:15px;border-radius:10px;padding:12px 16px;width:100%;outline:none;-webkit-appearance:none;appearance:none;}
input:focus,select:focus,textarea:focus{border-color:#C0392B;}
select option{background:#0A0A18;}
button{cursor:pointer;font-family:'DM Sans',sans-serif;border:none;outline:none;transition:all 0.15s;}
.ww{overflow:hidden;position:relative;cursor:grab;user-select:none;}
.wi{display:flex;flex-direction:column;}
.witem{display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-weight:700;flex-shrink:0;}
.wft{position:absolute;top:0;left:0;right:0;height:55px;background:linear-gradient(180deg,#0B0B1A,transparent);pointer-events:none;z-index:2;}
.wfb{position:absolute;bottom:0;left:0;right:0;height:55px;background:linear-gradient(0deg,#0B0B1A,transparent);pointer-events:none;z-index:2;}
.wsel{position:absolute;top:50%;left:8px;right:8px;height:44px;transform:translateY(-50%);border-top:1px solid #C0392B44;border-bottom:1px solid #C0392B44;pointer-events:none;z-index:3;border-radius:8px;background:#C0392B08;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes tpulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
@keyframes aura{0%,100%{box-shadow:0 0 20px #FFD70055,0 0 40px #FFD70022;}50%{box-shadow:0 0 40px #FFD700AA,0 0 80px #FFD70044;}}
@keyframes rglow{0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #FFD700;}50%{text-shadow:0 0 50px #FFD700,0 0 100px #FFD700;}}
@keyframes neon{0%,100%{opacity:1;}93%{opacity:0.8;}96%{opacity:0.9;}}
@keyframes pin{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes dup{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes min{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
.nt{animation:neon 4s infinite;text-shadow:0 0 12px currentColor,0 0 24px currentColor,0 0 48px currentColor;}
`;

// ── TIMER ──────────────────────────────────────────────────────────────────────
const LTK = (m) => `sz_t_${m.replace(/\s/g,"_")}`;
const useTimer = (machine) => {
  const k = LTK(machine);
  const load = () => { try { const s=localStorage.getItem(k); if(s) return JSON.parse(s); } catch{} return {...TINIT}; };
  const [st, setSt] = useState(load);
  const iv = useRef(null);
  useEffect(()=>{ try{localStorage.setItem(k,JSON.stringify(st));}catch{} },[st]);
  useEffect(()=>{
    const s=load();
    if(s.running&&s.startedAt&&s.remaining!=null){
      const e=Math.floor((Date.now()-s.startedAt)/1000);
      const nr=Math.max(0,s.remaining-e);
      setSt(x=>({...x,remaining:nr,done:nr===0,running:nr>0,startedAt:Date.now()}));
    }
  },[]);
  useEffect(()=>{
    if(st.running&&st.remaining>0){
      iv.current=setInterval(()=>{
        setSt(s=>{
          const nr=s.remaining-1;
          if(nr<=0){
            clearInterval(iv.current);
            try{
              const ctx=new(window.AudioContext||window.webkitAudioContext)();
              [0,350,700,1050].forEach((d,i)=>setTimeout(()=>{
                const o=ctx.createOscillator(),g=ctx.createGain();
                o.connect(g);g.connect(ctx.destination);
                o.frequency.value=[660,880,1100,880][i];g.gain.value=0.3;
                o.start();o.stop(ctx.currentTime+0.4);
              },d));
            }catch(e){}
            return{...s,remaining:0,running:false,done:true};
          }
          return{...s,remaining:nr};
        });
      },1000);
    }else{clearInterval(iv.current);}
    return()=>clearInterval(iv.current);
  },[st.running]);
  const start=(d)=>setSt(s=>({...s,duree:d??s.duree,remaining:(d??s.duree)*60,running:true,done:false,startedAt:Date.now()}));
  const stop=()=>setSt(s=>({...s,running:false}));
  const reset=()=>{try{localStorage.removeItem(k);}catch{}setSt({...TINIT});};
  const setD=(d)=>setSt(s=>({...s,duree:d}));
  return{...st,start,stop,reset,setD};
};

const Wheel=({value,onChange,color})=>{
  const H=44,V=3,sY=useRef(0),sI=useRef(0);
  const[idx,setIdx]=useState(Math.max(0,DMINS.indexOf(value)));
  const cl=(v)=>Math.max(0,Math.min(DMINS.length-1,v));
  const ap=(i)=>{const c=cl(i);setIdx(c);onChange(DMINS[c]);};
  const off=-idx*H+V*H;
  return(
    <div style={{position:"relative",background:T.bg3,borderRadius:12,overflow:"hidden"}}>
      <div className="ww"
        onTouchStart={e=>{sY.current=e.touches[0].clientY;sI.current=idx;}}
        onTouchMove={e=>ap(sI.current+Math.round((sY.current-e.touches[0].clientY)/H))}
        style={{height:H*(V*2+1)}}>
        <div className="wi" style={{transform:`translateY(${off}px)`,transition:"transform 0.1s"}}>
          {Array.from({length:V}).map((_,i)=><div key={"t"+i} className="witem" style={{height:H,opacity:0}}>—</div>)}
          {DMINS.map((v,i)=>{const d=Math.abs(i-idx);return<div key={v} className="witem" onClick={()=>ap(i)} style={{height:H,color:d===0?color:T.dim,fontSize:d===0?26:d===1?18:14,opacity:d===0?1:d===1?0.5:0.15}}>{String(v).padStart(2,"0")} min</div>;})}
          {Array.from({length:V}).map((_,i)=><div key={"b"+i} className="witem" style={{height:H,opacity:0}}>—</div>)}
        </div>
        <div className="wft"/><div className="wfb"/><div className="wsel"/>
      </div>
    </div>
  );
};

const TimerPanel=({machine,onClose})=>{
  const c=MC[machine]||T.orange;
  const{duree,remaining,running,done,start,stop,reset,setD}=useTimer(machine);
  const m=remaining!=null?Math.floor(remaining/60):duree;
  const s=remaining!=null?remaining%60:0;
  const p=remaining!=null?(remaining/(duree*60))*100:100;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`}}/>
          <span style={{fontSize:12,fontWeight:800,color:c,letterSpacing:"0.1em"}}>CHRONO {MS[machine]}</span>
        </div>
        <button onClick={onClose} style={{background:"transparent",color:T.dim,fontSize:18}}>✕</button>
      </div>
      {!running&&remaining===null&&<Wheel value={duree} onChange={setD} color={c}/>}
      {(running||remaining!=null||done)&&(
        <div style={{textAlign:"center",margin:"10px 0 14px"}}>
          <div style={{fontSize:54,fontWeight:800,fontFamily:"DM Mono",color:done?c:running?T.white:T.dim,animation:done?"tpulse 0.8s infinite":"none",textShadow:running?`0 0 20px ${c}44`:"none"}}>
            {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
          </div>
          {done&&<div style={{color:c,fontWeight:800,fontSize:13,marginTop:6}}>⚡ WASH TERMINÉ</div>}
          {running&&!done&&<div style={{marginTop:10,height:5,background:T.border,borderRadius:3}}><div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${c},${c}88)`,borderRadius:3,transition:"width 1s linear"}}/></div>}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {!running&&!done&&<button onClick={()=>start()} style={{flex:1,padding:"12px",borderRadius:10,fontWeight:800,fontSize:14,background:`linear-gradient(135deg,${c},${c}AA)`,color:"#fff",boxShadow:`0 4px 14px ${c}44`}}>▶ Démarrer</button>}
        {running&&<button onClick={stop} style={{flex:1,padding:"12px",borderRadius:10,fontWeight:800,fontSize:14,background:"transparent",color:T.danger,border:`1.5px solid ${T.danger}`}}>⏹ Stop</button>}
        {(done||remaining!=null)&&<button onClick={reset} style={{flex:1,padding:"12px",borderRadius:10,fontWeight:700,fontSize:14,background:"transparent",color:T.dim,border:`1.5px solid ${T.border}`}}>↺ Reset</button>}
      </div>
    </div>
  );
};

const FloatingTimers=()=>{
  const[exp,setExp]=useState(null);
  const[,tick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>tick(x=>x+1),1000);return()=>clearInterval(t);},[]);
  const timers=MACHINES.map(m=>{try{return{machine:m,...JSON.parse(localStorage.getItem(LTK(m))||"{}")};}catch{return{machine:m,...TINIT};}});
  const active=timers.filter(t=>t.running||t.done||t.remaining!=null);
  if(active.length===0&&!exp)return null;
  return(
    <>
      <div style={{position:"fixed",top:60,right:8,zIndex:300,display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end",pointerEvents:"none"}}>
        {active.map(t=>{
          const c=MC[t.machine]||T.orange;
          const m=t.remaining!=null?Math.floor(t.remaining/60):t.duree||0;
          const s=t.remaining!=null?t.remaining%60:0;
          const p=t.remaining!=null&&t.duree?(t.remaining/(t.duree*60))*100:100;
          return(
            <button key={t.machine} onClick={()=>setExp(exp===t.machine?null:t.machine)} style={{pointerEvents:"all",background:`${T.bg2}F2`,border:`2px solid ${t.done?c:t.running?c:c+"55"}`,borderRadius:12,padding:"5px 10px 5px 8px",display:"flex",alignItems:"center",gap:7,backdropFilter:"blur(20px)",boxShadow:t.running?`0 0 16px ${c}44,0 2px 14px #00000099`:"0 2px 10px #00000088",animation:"pin 0.3s ease"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`,animation:t.running?"tpulse 1s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:800,color:c,letterSpacing:"0.06em"}}>{MS[t.machine]}</span>
              <span style={{fontFamily:"DM Mono",fontSize:15,fontWeight:800,color:t.done?c:t.running?T.white:T.dim,animation:t.done?"tpulse 0.8s infinite":"none"}}>
                {t.done?"FIN":`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
              </span>
              {t.running&&<div style={{width:24,height:3,background:T.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:c,borderRadius:2,transition:"width 1s linear"}}/></div>}
            </button>
          );
        })}
      </div>
      {exp&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"#00000088"}} onClick={()=>setExp(null)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:100,right:8,width:260,background:T.bg2,border:`2px solid ${MC[exp]||T.orange}`,borderRadius:18,padding:18,boxShadow:"0 8px 40px #00000099",animation:"min 0.25s ease"}}>
            <TimerPanel machine={exp} onClose={()=>setExp(null)}/>
          </div>
        </div>
      )}
    </>
  );
};

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
const NAV=[{id:"dashboard",icon:"⛩️",label:"Dashboard"},{id:"session",icon:"🏮",label:"Session"},{id:"calendar",icon:"🪷",label:"Calendrier"},{id:"catalogue",icon:"🏺",label:"Catalogue"}];
const NavBar=({active,onNav})=>(
  <nav style={{position:"fixed",bottom:0,zIndex:100,background:`linear-gradient(180deg,transparent,${T.bg2}F0)`,backdropFilter:"blur(24px)",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 max(18px,env(safe-area-inset-bottom))",left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:768}}>
    {NAV.map(n=>(
      <button key={n.id} onClick={()=>onNav(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 14px",opacity:active===n.id?1:0.35,transition:"all 0.2s"}}>
        <span style={{fontSize:active===n.id?24:19,transition:"font-size 0.2s"}}>{n.icon}</span>
        <span style={{fontSize:9,color:active===n.id?T.gold:T.dim,fontWeight:active===n.id?700:400,letterSpacing:0.6,textTransform:"uppercase"}}>{n.label}</span>
        {active===n.id&&<div style={{width:22,height:2,background:T.orange,borderRadius:1,boxShadow:`0 0 8px ${T.orange}`}}/>}
      </button>
    ))}
  </nav>
);
const AppHeader=()=>{
  const[t,sT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>sT(new Date()),60000);return()=>clearInterval(i);},[]);
  return(
    <div style={{background:`linear-gradient(180deg,${T.bg2},${T.bg2}CC)`,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>🫛</span>
        <div>
          <div style={{display:"flex",alignItems:"baseline",gap:2}}>
            <span className="nt" style={{fontSize:20,fontWeight:900,fontStyle:"italic",color:T.white,letterSpacing:-1,textShadow:`0 0 20px ${T.orange}66,2px 2px 0 ${T.orange}`}}>SENZU</span>
            <span style={{fontSize:20,fontWeight:300,color:T.orange,letterSpacing:5,marginLeft:4}}>ASIA</span>
          </div>
          <div style={{fontSize:7,color:T.dim,letterSpacing:"0.2em",textTransform:"uppercase"}}>Ice Water Hash Lab</div>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:9,color:T.dim,fontFamily:"DM Mono"}}>{t.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}</div>
        <div style={{fontSize:9,color:T.green}}>● Lab actif</div>
      </div>
    </div>
  );
};
const Lbl=({c})=><div style={{fontSize:9,fontWeight:700,color:T.dim,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:5}}>{c}</div>;
const Fld=({label,children})=><div style={{marginBottom:14}}><Lbl c={label}/>{children}</div>;
const Btn=({c:children,onClick,col=T.orange,disabled,s={}})=><button onClick={onClick} disabled={disabled} style={{background:disabled?T.border:`linear-gradient(135deg,${col},${col}BB)`,color:disabled?T.dim:"#fff",fontWeight:800,fontSize:15,padding:"14px 24px",borderRadius:12,width:"100%",boxShadow:disabled?"none":`0 4px 20px ${col}44`,opacity:disabled?0.5:1,...s}}>{children}</button>;
const BOL=({c:children,onClick,col=T.orange,s={}})=><button onClick={onClick} style={{background:"transparent",color:col,border:`1.5px solid ${col}`,fontWeight:700,fontSize:14,padding:"13px 20px",borderRadius:12,width:"100%",...s}}>{children}</button>;
const Bdg=({c:children,col=T.gold})=><span style={{background:col+"22",color:col,border:`1px solid ${col}44`,borderRadius:6,padding:"2px 10px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
const Crd=({children,s={},glow,col})=><div style={{background:T.card,border:`1px solid ${glow?(col||T.orange)+"66":T.border}`,borderRadius:16,padding:16,marginBottom:12,animation:glow?"aura 2s infinite":"none",...s}}>{children}</div>;
const STL=({icon,text,col=T.orange})=>(
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
    <div style={{width:3,height:18,background:col,borderRadius:2}}/>
    <span style={{fontSize:11,fontWeight:800,color:col,letterSpacing:"0.12em",textTransform:"uppercase"}}>{icon} {text}</span>
  </div>
);
const Step=({label,value,onChange,min=0,max=99,step=1,unit=""})=>(
  <div style={{marginBottom:14}}>
    <Lbl c={label}/>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <button onClick={()=>onChange(Math.max(min,parseFloat((value-step).toFixed(2))))} style={{width:52,height:52,borderRadius:12,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:24,fontWeight:700}}>−</button>
      <div style={{flex:1,textAlign:"center",fontSize:28,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}}>{value}{unit}</div>
      <button onClick={()=>onChange(Math.min(max,parseFloat((value+step).toFixed(2))))} style={{width:52,height:52,borderRadius:12,background:T.orange,color:"#fff",fontSize:24,fontWeight:700,boxShadow:`0 4px 14px ${T.orange}44`}}>+</button>
    </div>
  </div>
);
const BgSel=({label,value,onChange,options})=>(
  <Fld label={label}>
    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"10px 16px",borderRadius:10,fontSize:13,fontWeight:600,background:value===o?T.orange:T.bg3,color:value===o?"#fff":T.ink,border:`1px solid ${value===o?T.orange:T.border}`,boxShadow:value===o?`0 2px 10px ${T.orange}44`:"none"}}>{o}</button>)}
    </div>
  </Fld>
);
const Load=()=><div style={{display:"flex",justifyContent:"center",alignItems:"center",height:200}}><div style={{color:T.orange,fontSize:32,animation:"tpulse 1s infinite"}}>🏮</div></div>;

const KPI=({label,value,col=T.orange,detail})=>{
  const[open,sO]=useState(false);
  return(
    <div onClick={()=>detail&&sO(x=>!x)} style={{background:T.card,border:`1px solid ${open?col+"66":T.border}`,borderRadius:14,padding:"16px 18px",flex:1,cursor:detail?"pointer":"default",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-16,right:-16,width:64,height:64,borderRadius:"50%",background:`radial-gradient(circle,${col}18,transparent)`}}/>
      <div style={{fontSize:9,color:T.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:32,fontWeight:800,color:col,fontFamily:"DM Mono",lineHeight:1}}>{value??'—'}</div>
      {detail&&<div style={{fontSize:9,color:T.dim,marginTop:4}}>{open?"▲ Fermer":"▼ Détails"}</div>}
      {open&&detail&&<div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>{detail}</div>}
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const Dashboard=()=>{
  const[sessions,ss]=useState([]);
  const[washes,sw]=useState([]);
  const[pesees,sp]=useState([]);
  const[strains,sst]=useState([]);
  const[loading,sl]=useState(true);
  const[sel,ssel]=useState(null);

  useEffect(()=>{
    Promise.all([sbFetch("sessions?select=*&order=date.desc"),sbFetch("washes?select=*"),sbFetch("pesees?select=*"),sbFetch("strains?select=*&order=nom.asc")])
      .then(([a,b,c,d])=>{ss(a||[]);sw(b||[]);sp(c||[]);sst(d||[]);}).catch(()=>{}).finally(()=>sl(false));
  },[]);

  const totBio=sessions.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);

  const rendBS=useMemo(()=>{
    const m={};
    pesees.forEach(p=>{const se=sessions.find(s=>s.id===p.session_id);if(!se)return;const n=se.strain||"?";if(!m[n])m[n]={poids:0,bio:0};m[n].poids+=parseFloat(p.poids_sec_g)||0;m[n].bio+=parseFloat(se.biomasse_kg)||0;});
    return Object.entries(m).map(([nom,v])=>({nom,rend:v.bio>0?((v.poids/(v.bio*1000))*100).toFixed(2):"—"})).sort((a,b)=>parseFloat(b.rend||0)-parseFloat(a.rend||0));
  },[pesees,sessions]);

  const rendM=useMemo(()=>{
    const v=rendBS.filter(r=>r.rend!=="—").map(r=>parseFloat(r.rend));
    return v.length>0?(v.reduce((a,x)=>a+x,0)/v.length).toFixed(2):null;
  },[rendBS]);

  const uStr=useMemo(()=>{
    if(strains.length>0)return strains;
    const seen=new Set();
    return sessions.filter(s=>{if(s.strain&&!seen.has(s.strain)){seen.add(s.strain);return true;}return false;}).map(s=>({nom:s.strain}));
  },[strains,sessions]);

  const wBS=useMemo(()=>{
    const m={};
    washes.forEach(w=>{const s=sessions.find(x=>x.id===w.session_id);if(s?.strain)m[s.strain]=(m[s.strain]||0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  },[washes,sessions]);
  const maxW=wBS[0]?.[1]||1;

  const sWD=useMemo(()=>{
    const m={};
    washes.forEach(w=>{const se=sessions.find(s=>s.id===w.session_id);if(!se?.date)return;const st=se.strain||"?";const mo=se.date.slice(0,7);if(!m[st])m[st]={};m[st][mo]=(m[st][mo]||0)+1;});
    return m;
  },[washes,sessions]);
  const mos=[...new Set(washes.map(w=>{const s=sessions.find(x=>x.id===w.session_id);return s?.date?.slice(0,7);}).filter(Boolean))].sort();

  const getR=(nom)=>{const se=sessions.filter(s=>s.strain===nom);const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));const b=se.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);const po=pe.reduce((a,p)=>a+(parseFloat(p.poids_sec_g)||0),0);return b>0?((po/(b*1000))*100).toFixed(2):null;};

  const selSt=sel?uStr.find(s=>(s.nom||s)===sel):null;
  const selC=selSt?SC[uStr.indexOf(selSt)%SC.length]:T.orange;

  if(loading)return<Load/>;
  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <KPI label="Sessions" value={sessions.length} col={T.orange}/>
        <KPI label="Washes" value={washes.length} col={T.gold}/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:22}}>
        <KPI label="Biomasse" value={`${totBio.toFixed(1)}kg`} col={T.green}/>
        <KPI label="Rendement moy." value={rendM?`${rendM}%`:"—"} col={T.purple}
          detail={<div>{rendBS.filter(r=>r.rend!=="—").map(r=><div key={r.nom} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.ink}}>{r.nom}</span><span style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:"DM Mono"}}>{r.rend}%</span></div>)}<div style={{fontSize:9,color:T.dim,marginTop:6}}>Basé sur {rendBS.filter(r=>r.rend!=="—").length} strain(s)</div></div>}
        />
      </div>

      {uStr.length>0&&(
        <div style={{marginBottom:22}}>
          <STL icon="🃏" text="STRAINS"/>
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:10,scrollbarWidth:"none"}}>
            {uStr.map((s,i)=>{
              const nom=s.nom||s,r=getR(nom),c=SC[i%SC.length],rec=r&&parseFloat(r)>4;
              return(
                <div key={nom} onClick={()=>ssel(nom)} style={{width:155,flexShrink:0,cursor:"pointer",borderRadius:16,overflow:"hidden",background:`linear-gradient(160deg,${T.bg3},${c}18)`,border:`2px solid ${rec?T.aura:c+"44"}`,animation:rec?"aura 2.5s infinite":"none"}}>
                  <div style={{height:110,background:s.photo_url?`url(${s.photo_url}) center/cover`:`linear-gradient(135deg,${c}33,${T.bg})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {!s.photo_url&&<div style={{fontSize:30,opacity:0.3}}>🌿</div>}
                    {rec&&<div style={{position:"absolute",top:6,right:6,background:T.aura,borderRadius:5,padding:"1px 6px",fontSize:8,fontWeight:800,color:"#000"}}>★ REC</div>}
                  </div>
                  <div style={{padding:"10px 12px",background:`${T.bg}CC`}}>
                    <div style={{fontSize:14,fontWeight:900,fontStyle:"italic",color:T.white,marginBottom:3,textShadow:`1px 1px 0 ${c}`}}>{nom}</div>
                    <div style={{fontSize:22,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:c,animation:rec?"rglow 2s infinite":"none"}}>{r?`${r}%`:"—"}</div>
                    <div style={{fontSize:9,color:T.dim,marginTop:3}}>Tap pour détails</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:9,color:T.dim,textAlign:"center",marginTop:4}}>← Swipe · Tap pour détails →</div>
        </div>
      )}

      <Crd>
        <STL icon="📊" text="ANALYSE WASHES"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <div style={{fontSize:9,color:T.dim,marginBottom:8}}>Washes / mois</div>
            {Object.keys(sWD).slice(0,5).map((strain,i)=>{
              const c=SC[i%SC.length],data=mos.map(m=>sWD[strain]?.[m]||0),max=Math.max(...data,1);
              return(
                <div key={strain} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:10,color:c,fontWeight:700}}>{strain}</span>
                    <span style={{fontSize:10,color:T.dim}}>{data.reduce((a,v)=>a+v,0)}W</span>
                  </div>
                  <div style={{display:"flex",gap:2,alignItems:"flex-end",height:28}}>
                    {mos.map((m,mi)=>(
                      <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                        <div style={{width:"100%",height:data[mi]>0?`${Math.max(4,(data[mi]/max)*24)}px`:"3px",background:data[mi]>0?c:T.border+"44",borderRadius:"2px 2px 0 0"}}/>
                        <div style={{fontSize:7,color:T.dim}}>{m.slice(5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{fontSize:9,color:T.dim,marginBottom:8}}>Classement</div>
            {wBS.map(([nom,cnt],i)=>(
              <div key={nom} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:T.white}}>{nom}</span>
                  <span style={{fontSize:10,color:SC[i%SC.length],fontWeight:700,fontFamily:"DM Mono"}}>{cnt}</span>
                </div>
                <div style={{height:3,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${(cnt/maxW)*100}%`,background:SC[i%SC.length],borderRadius:2,transition:"width 0.5s"}}/></div>
              </div>
            ))}
          </div>
        </div>
      </Crd>

      {sel&&selSt&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>ssel(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,background:`linear-gradient(160deg,${T.bg2},${selC}22)`,border:`2px solid ${selC}88`,borderRadius:24,overflow:"hidden",animation:"min 0.3s ease",boxShadow:`0 20px 60px #000000CC,0 0 40px ${selC}33`}}>
            <div style={{height:180,background:selSt.photo_url?`url(${selSt.photo_url}) center/cover`:`linear-gradient(135deg,${selC}44,${T.bg3})`,display:"flex",alignItems:"flex-end",padding:16,position:"relative"}}>
              {!selSt.photo_url&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,opacity:0.15}}>🌿</div>}
              <div>
                <div style={{fontSize:26,fontWeight:900,fontStyle:"italic",color:T.white,textShadow:`2px 2px 0 ${selC}`}}>{sel}</div>
                {selSt.genetique&&<div style={{fontSize:12,color:T.ink}}>{selSt.genetique}</div>}
              </div>
            </div>
            <div style={{padding:18}}>
              {(()=>{const r=getR(sel);const rec=r&&parseFloat(r)>4;return r&&<div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:9,color:T.dim,letterSpacing:"0.15em",textTransform:"uppercase"}}>Rendement</div><div style={{fontSize:48,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:selC,animation:rec?"rglow 2s infinite":"none"}}>{r}%</div></div>;})()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {[["Odeur",selSt.odeur||"—"],["Goût",selSt.gout||"—"],["Cure",selSt.mode_cure||"—"],["Sessions",sessions.filter(s=>s.strain===sel).length]].map(([l,v])=>(
                  <div key={l} style={{background:T.bg3,borderRadius:10,padding:"10px 12px",borderLeft:`2px solid ${selC}66`}}>
                    <div style={{fontSize:9,color:T.dim,marginBottom:3}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:T.white}}>{v}</div>
                  </div>
                ))}
              </div>
              {selSt.notes&&<div style={{background:T.bg3,borderRadius:10,padding:12,marginBottom:14}}><div style={{fontSize:9,color:T.dim,marginBottom:4}}>NOTES</div><div style={{fontSize:13,color:T.ink,fontStyle:"italic"}}>{selSt.notes}</div></div>}
              <button onClick={()=>ssel(null)} style={{width:"100%",padding:"12px",borderRadius:12,background:"transparent",border:`1.5px solid ${T.border}`,color:T.dim,fontWeight:700,fontSize:14}}>✕ Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── SESSION ───────────────────────────────────────────────────────────────────
const eW=(n)=>({numero:n,micron:"",glace:"—",vitesse:"",duree_min:15,couleur_160:"",couleur_90:"",couleur_45:"",texture:"",contaminants:false,potentiel_wash_plus:false,notes:""});
const eSess=()=>({machine:"",strain:"",biomasse_kg:8,type_biomasse:"Fresh Frozen",nb_sacs:16,heure_debut:"",heure_fin:"",notes:"",washes:Array.from({length:10},(_,i)=>eW(i+1))});
const LSK="sz_draft_v5";

const Session=({strains})=>{
  const[sess,setSess]=useState(()=>{try{const d=localStorage.getItem(LSK);return d?JSON.parse(d):eSess();}catch{return eSess();}});
  const[aW,sAW]=useState(null);
  const[saving,sSav]=useState(false);
  const[sid,sSid]=useState(null);
  const[clo,sClo]=useState(false);
  const[pesees,sPes]=useState({"90µ":0,"45µ":0,"25µ":0});

  useEffect(()=>{try{localStorage.setItem(LSK,JSON.stringify(sess));}catch{}},[sess]);
  const sF=(k,v)=>setSess(s=>({...s,[k]:v}));
  const sW=(i,k,v)=>setSess(s=>{const w=[...s.washes];w[i]={...w[i],[k]:v};return{...s,washes:w};});

  const save=async()=>{
    if(!sess.machine||!sess.strain){alert("Machine et strain requis.");return;}
    sSav(true);
    try{
      const[row]=await sbFetch("sessions",{method:"POST",body:JSON.stringify({machine:sess.machine,strain:sess.strain,biomasse_kg:parseFloat(sess.biomasse_kg)||null,type_biomasse:sess.type_biomasse,nb_sacs:parseInt(sess.nb_sacs)||null,heure_debut:sess.heure_debut||null,heure_fin:sess.heure_fin||null,statut:"sechage",date:new Date().toISOString().slice(0,10),notes:sess.notes||null})});
      const vW=sess.washes.filter(w=>w.micron);
      if(vW.length>0)await sbFetch("washes",{method:"POST",prefer:"return=minimal",body:JSON.stringify(vW.map(w=>({session_id:row.id,numero:w.numero,micron:w.micron,glace:w.glace||null,vitesse:w.vitesse||null,duree_min:w.duree_min||null,couleur_160:w.couleur_160||null,couleur_90:w.couleur_90||null,couleur_45:w.couleur_45||null,texture:w.texture||null,contaminants:w.contaminants,notes:w.notes||null})))});
      sSid(row.id);sClo(true);
    }catch(e){alert("Erreur: "+e.message);}
    finally{sSav(false);}
  };

  const cloture=async()=>{
    if(!sid)return;sSav(true);
    try{
      const rows=Object.entries(pesees).filter(([,v])=>parseFloat(v)>0).map(([micron,g])=>({session_id:sid,micron,poids_sec_g:parseFloat(g)}));
      if(rows.length>0)await sbFetch("pesees",{method:"POST",prefer:"return=minimal",body:JSON.stringify(rows)});
      await sbFetch(`sessions?id=eq.${sid}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify({statut:"cloture"})});
      localStorage.removeItem(LSK);setSess(eSess());sClo(false);sSid(null);alert("✅ Session clôturée !");
    }catch(e){alert("Erreur: "+e.message);}
    finally{sSav(false);}
  };

  const tot=Object.values(pesees).reduce((a,v)=>a+(parseFloat(v)||0),0);
  const rend=sess.biomasse_kg>0?((tot/(parseFloat(sess.biomasse_kg)*1000))*100).toFixed(2):null;
  const rec=rend&&parseFloat(rend)>4;
  const sNames=strains.length>0?[...new Set(strains.map(s=>s.nom||s))]:[];
  const mC=sess.machine?MC[sess.machine]||T.orange:T.dim;

  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      {clo?(
        <Crd glow>
          <STL icon="⏳" text="CHAMBRE DE L'ESPRIT ET DU TEMPS" col={T.gold}/>
          <div style={{textAlign:"center",padding:"8px 0 14px"}}><Bdg col={T.gold}>EN SÉCHAGE — FREEZE DRYER</Bdg></div>
          <STL icon="⚖" text="PESÉES FINALES"/>
          {["90µ","45µ","25µ"].map(m=><Step key={m} label={`Poids sec ${m} (g)`} value={parseFloat(pesees[m])||0} onChange={v=>sPes(p=>({...p,[m]:v}))} step={0.1} max={9999} unit="g"/>)}
          {rend&&(
            <div style={{textAlign:"center",padding:16,marginBottom:16,background:rec?T.aura+"22":T.bg3,border:`2px solid ${rec?T.aura:T.border}`,borderRadius:12,animation:rec?"aura 1.5s infinite":"none"}}>
              <div style={{fontSize:9,color:T.dim,marginBottom:4}}>RENDEMENT CALCULÉ</div>
              <div style={{fontSize:60,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:T.orange,animation:rec?"rglow 2s infinite":"none"}}>{rend}%</div>
              {rec&&<div style={{fontSize:18,fontWeight:800,color:T.aura,marginTop:8}}>🔥 IT'S OVER 9000! 🔥</div>}
              <div style={{fontSize:11,color:T.dim,marginTop:4}}>{tot.toFixed(1)}g / {(parseFloat(sess.biomasse_kg)*1000).toFixed(0)}g</div>
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            <BOL c="← Retour" onClick={()=>sClo(false)} col={T.dim}/>
            <Btn c={saving?"Clôture...":"🏆 Clôturer"} onClick={cloture} disabled={saving} col={T.green}/>
          </div>
        </Crd>
      ):(
        <>
          {sess.machine&&(
            <div style={{background:T.bg3,border:`1px solid ${mC}44`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:mC}}/>
                <span style={{fontSize:12,color:mC,fontWeight:700}}>Chrono {MS[sess.machine]}</span>
              </div>
              <span style={{fontSize:10,color:T.dim}}>Tap pill ↗ pour ouvrir</span>
            </div>
          )}
          <Crd s={{marginBottom:14}}>
            <STL icon="⚙" text="INFOS SESSION"/>
            <BgSel label="Machine" value={sess.machine} onChange={v=>sF("machine",v)} options={MACHINES}/>
            <Fld label="Strain">
              <select value={sess.strain} onChange={e=>sF("strain",e.target.value)}>
                <option value="">Sélectionner...</option>
                {sNames.map(s=><option key={s}>{s}</option>)}
              </select>
            </Fld>
            <Step label="Biomasse (kg)" value={parseFloat(sess.biomasse_kg)||0} onChange={v=>sF("biomasse_kg",v)} step={0.5} max={50} unit=" kg"/>
            <Step label="Nombre de sacs" value={parseInt(sess.nb_sacs)||0} onChange={v=>sF("nb_sacs",v)} max={30}/>
            <BgSel label="Type biomasse" value={sess.type_biomasse} onChange={v=>sF("type_biomasse",v)} options={["Fresh Frozen","Dry","Live"]}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Fld label="Début"><input type="time" value={sess.heure_debut} onChange={e=>sF("heure_debut",e.target.value)}/></Fld>
              <Fld label="Fin"><input type="time" value={sess.heure_fin} onChange={e=>sF("heure_fin",e.target.value)}/></Fld>
            </div>
            <Fld label="Notes"><textarea value={sess.notes} onChange={e=>sF("notes",e.target.value)} rows={2} style={{resize:"none"}}/></Fld>
          </Crd>
          <STL icon="💧" text="WASHES"/>
          {sess.washes.map((w,i)=><WCard key={i} wash={w} open={aW===i} onToggle={()=>sAW(aW===i?null:i)} onChange={(k,v)=>sW(i,k,v)}/>)}
          <div style={{marginTop:20,display:"flex",gap:10}}>
            <BOL c="↺ Reset" onClick={()=>{setSess(eSess());localStorage.removeItem(LSK);}} col={T.danger}/>
            <Btn c={saving?"Sauvegarde...":"🏮 Clôturer & Sécher"} onClick={save} disabled={saving}/>
          </div>
        </>
      )}
    </div>
  );
};

const WCard=({wash,open,onToggle,onChange})=>{
  const has=wash.micron||wash.couleur_45;
  return(
    <div style={{marginBottom:8}}>
      <button onClick={onToggle} style={{width:"100%",background:open?T.bg3:T.card,border:`1px solid ${has?T.orange+"66":T.border}`,borderRadius:open?"12px 12px 0 0":12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",color:T.white}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"DM Mono",fontWeight:800,color:has?T.orange:T.dim}}>W{wash.numero}</span>
          {wash.micron&&<Bdg>{wash.micron}</Bdg>}
          {wash.couleur_45&&<Bdg col={T.dim}>{wash.couleur_45}</Bdg>}
          {wash.contaminants&&<Bdg col={T.danger}>⚠</Bdg>}
        </div>
        <span style={{color:T.dim}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{background:T.bg3,border:`1px solid ${T.orange+"44"}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:16}}>
          <BgSel label="Micron" value={wash.micron} onChange={v=>onChange("micron",v)} options={MICRONS}/>
          <BgSel label="Glace" value={wash.glace||"—"} onChange={v=>onChange("glace",v)} options={GLACE}/>
          <BgSel label="Vitesse" value={wash.vitesse} onChange={v=>onChange("vitesse",v)} options={VITESSES}/>
          <Fld label="Durée (min)"><select value={wash.duree_min} onChange={e=>onChange("duree_min",parseInt(e.target.value))}>{[5,10,15,20,24,25,30].map(d=><option key={d} value={d}>{d} min</option>)}</select></Fld>
          <BgSel label="Couleur 160µ" value={wash.couleur_160} onChange={v=>onChange("couleur_160",v)} options={COULEURS}/>
          <BgSel label="Couleur 90µ" value={wash.couleur_90} onChange={v=>onChange("couleur_90",v)} options={COULEURS}/>
          <BgSel label="Couleur 45µ" value={wash.couleur_45} onChange={v=>onChange("couleur_45",v)} options={COULEURS}/>
          <BgSel label="Texture" value={wash.texture} onChange={v=>onChange("texture",v)} options={TEXTURES}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>onChange("contaminants",!wash.contaminants)} style={{width:28,height:28,borderRadius:8,border:`2px solid ${wash.contaminants?T.danger:T.border}`,background:wash.contaminants?T.danger+"33":"transparent"}}>{wash.contaminants&&<span style={{color:T.danger}}>✓</span>}</button>
              <span style={{fontSize:14,color:wash.contaminants?T.danger:T.dim}}>Contaminants</span>
            </div>
            <button onClick={()=>onChange("potentiel_wash_plus",!wash.potentiel_wash_plus)} style={{padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,background:wash.potentiel_wash_plus?T.green+"33":T.bg,border:`1.5px solid ${wash.potentiel_wash_plus?T.green:T.border}`,color:wash.potentiel_wash_plus?T.green:T.dim}}>+ Wash suivant ?</button>
          </div>
          <Fld label="Notes"><textarea value={wash.notes} onChange={e=>onChange("notes",e.target.value)} rows={2} style={{resize:"none"}}/></Fld>
        </div>
      )}
    </div>
  );
};

// ── CALENDRIER ────────────────────────────────────────────────────────────────
const Calendrier=()=>{
  const[sessions,ss]=useState([]);
  const[washes,sw]=useState([]);
  const[loading,sl]=useState(true);
  const[cur,sc]=useState(new Date());
  const[aMs,sMs]=useState(["Machine 1","Machine 2","Machine 3"]);
  const[drw,sDrw]=useState(null);
  const[dW,sdW]=useState({});
  const[dP,sdP]=useState({});
  const[fSt,sFSt]=useState("");
  const[fW,sFW]=useState("");
  const[fM,sFM]=useState("");
  const[res,sRes]=useState(null);
  const[srch,sSrch]=useState(false);

  useEffect(()=>{
    Promise.all([sbFetch("sessions?select=*&order=date.asc"),sbFetch("washes?select=*")])
      .then(([a,b])=>{ss(a||[]);sw(b||[]);}).catch(()=>{}).finally(()=>sl(false));
  },[]);

  const yr=cur.getFullYear(),mo=cur.getMonth();
  const fd=(new Date(yr,mo,1).getDay()+6)%7;
  const dim=new Date(yr,mo+1,0).getDate();
  const tod=new Date();

  const dMap=useMemo(()=>{
    const m={};
    sessions.filter(s=>aMs.includes(s.machine)).forEach(s=>{if(!s.date)return;if(!m[s.date])m[s.date]=[];m[s.date].push(s);});
    return m;
  },[sessions,aMs]);

  const dWC=useMemo(()=>{
    const m={};
    sessions.filter(s=>aMs.includes(s.machine)).forEach(s=>{if(!s.date)return;const c=washes.filter(w=>w.session_id===s.id).length;m[s.date]=(m[s.date]||0)+c;});
    return m;
  },[sessions,washes,aMs]);

  const openD=async(ds)=>{
    const dS=dMap[ds]||[];
    sDrw({date:ds,sessions:dS});
    const nW={},nP={};
    await Promise.all(dS.map(async se=>{const[w,p]=await Promise.all([sbFetch(`washes?session_id=eq.${se.id}&order=numero.asc`),sbFetch(`pesees?session_id=eq.${se.id}`)]);nW[se.id]=w||[];nP[se.id]=p||[];}));
    sdW(nW);sdP(nP);
  };

  const search=async()=>{
    sSrch(true);
    try{
      let q="washes?select=*,sessions(date,machine,strain,biomasse_kg)";
      if(fM)q+=`&micron=eq.${encodeURIComponent(fM)}`;
      if(fW)q+=`&numero=eq.${fW}`;
      let data=await sbFetch(q+"&order=created_at.desc&limit=50");
      if(fSt&&data)data=data.filter(w=>w.sessions?.strain===fSt);
      sRes(data||[]);
    }catch(e){sRes([]);}
    finally{sSrch(false);}
  };

  const allSt=[...new Set(sessions.map(s=>s.strain).filter(Boolean))];
  const mLbl=cur.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});

  if(loading)return<Load/>;
  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {MACHINES.map(m=>{const c=MC[m],a=aMs.includes(m);return<button key={m} onClick={()=>sMs(p=>a?p.filter(x=>x!==m):[...p,m])} style={{flex:1,padding:"10px 0",borderRadius:10,fontWeight:800,fontSize:12,background:a?c+"22":T.bg3,border:`2px solid ${a?c:T.border}`,color:a?c:T.dim}}>{MS[m]}</button>;})}
      </div>
      <Crd s={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <button onClick={()=>sc(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{width:36,height:36,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:16}}>‹</button>
          <div style={{fontSize:14,fontWeight:800,color:T.white,textTransform:"capitalize"}}>{mLbl}</div>
          <button onClick={()=>sc(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{width:36,height:36,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:16}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
          {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:T.dim,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array.from({length:fd}).map((_,i)=><div key={"e"+i}/>)}
          {Array.from({length:dim}).map((_,i)=>{
            const d=i+1;
            const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const has=dMap[ds]?.length>0;
            const wc=dWC[ds]||0;
            const isT=tod.getDate()===d&&tod.getMonth()===mo&&tod.getFullYear()===yr;
            const macs=dMap[ds]?.map(s=>s.machine)||[];
            return(
              <button key={d} onClick={()=>has&&openD(ds)} style={{aspectRatio:"1",borderRadius:8,border:`1.5px solid ${isT?T.gold:has?T.orange+"66":T.border}`,background:isT?T.gold+"22":has?T.orange+"11":T.bg3,cursor:has?"pointer":"default",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,padding:2}}>
                <span style={{fontSize:12,fontWeight:isT?800:has?700:400,color:isT?T.gold:has?T.white:T.dim}}>{d}</span>
                {wc>0&&<span style={{fontSize:8,color:T.orange,fontWeight:800}}>{wc}W</span>}
                {macs.length>0&&<div style={{display:"flex",gap:1}}>{[...new Set(macs)].slice(0,3).map(m=><div key={m} style={{width:4,height:4,borderRadius:"50%",background:MC[m]||T.orange}}/>)}</div>}
              </button>
            );
          })}
        </div>
      </Crd>
      <Crd s={{marginBottom:16}}>
        <STL icon="🔍" text="RECHERCHE WASHES"/>
        <Fld label="Strain"><select value={fSt} onChange={e=>sFSt(e.target.value)}><option value="">Toutes</option>{allSt.map(s=><option key={s}>{s}</option>)}</select></Fld>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Fld label="N° Wash"><select value={fW} onChange={e=>sFW(e.target.value)}><option value="">Tous</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>W{i+1}</option>)}</select></Fld>
          <Fld label="Micron"><select value={fM} onChange={e=>sFM(e.target.value)}><option value="">Tous</option>{MICRONS.map(m=><option key={m}>{m}</option>)}</select></Fld>
        </div>
        <Btn c={srch?"Recherche...":"⚡ Rechercher"} onClick={search} disabled={srch}/>
      </Crd>
      {res!==null&&(
        <div>
          <div style={{fontSize:12,color:T.dim,marginBottom:10}}>{res.length} résultat{res.length!==1?"s":""}</div>
          {res.map(w=>(
            <div key={w.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><span style={{fontWeight:800}}>{w.sessions?.strain||"—"}</span><span style={{color:T.dim,fontSize:12,marginLeft:8}}>{w.sessions?.date}</span></div>
                <Bdg col={MC[w.sessions?.machine]||T.dim}>{MS[w.sessions?.machine]||"—"}</Bdg>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Bdg col={T.orange}>W{w.numero}</Bdg>
                {w.micron&&<Bdg>{w.micron}</Bdg>}
                {w.couleur_160&&<Bdg col={T.dim}>160: {w.couleur_160}</Bdg>}
                {w.couleur_90&&<Bdg col={T.dim}>90: {w.couleur_90}</Bdg>}
                {w.couleur_45&&<Bdg col={T.dim}>45: {w.couleur_45}</Bdg>}
                {w.texture&&<Bdg col={T.ink}>{w.texture}</Bdg>}
                {w.contaminants&&<Bdg col={T.danger}>⚠</Bdg>}
              </div>
            </div>
          ))}
        </div>
      )}
      {drw&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:"#00000099"}} onClick={()=>sDrw(null)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:0,left:0,right:0,background:T.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${T.border}`,padding:20,maxHeight:"75vh",overflowY:"auto",animation:"dup 0.3s ease",paddingBottom:"max(20px,env(safe-area-inset-bottom))"}}>
            <div style={{width:40,height:4,background:T.border,borderRadius:2,margin:"0 auto 16px"}}/>
            <div style={{fontSize:16,fontWeight:800,color:T.white,marginBottom:12}}>{new Date(drw.date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
            {drw.sessions.map(se=>{
              const sW=dW[se.id]||[],sP=dP[se.id]||[];
              const tp=sP.reduce((a,p)=>a+(parseFloat(p.poids_sec_g)||0),0);
              const r=se.biomasse_kg&&tp>0?((tp/(parseFloat(se.biomasse_kg)*1000))*100).toFixed(2):null;
              const mC2=MC[se.machine]||T.orange;
              return(
                <div key={se.id} style={{background:T.bg3,border:`1px solid ${mC2}44`,borderRadius:12,padding:14,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div><div style={{fontSize:15,fontWeight:800}}>{se.strain||"—"}</div><div style={{fontSize:11,color:T.dim}}>{se.biomasse_kg}kg · {se.nb_sacs} sacs</div></div>
                    <div style={{textAlign:"right"}}><Bdg col={mC2}>{MS[se.machine]||se.machine}</Bdg>{r&&<div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"DM Mono",marginTop:4}}>{r}%</div>}</div>
                  </div>
                  {sW.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{sW.map(w=><div key={w.id} style={{background:T.bg,borderRadius:7,padding:"4px 8px",border:`1px solid ${T.border}`}}><span style={{fontFamily:"DM Mono",color:mC2,fontWeight:800,fontSize:11}}>W{w.numero}</span>{w.micron&&<span style={{fontSize:10,color:T.dim,marginLeft:4}}>{w.micron}</span>}{w.couleur_45&&<span style={{fontSize:10,color:T.ink,marginLeft:4}}>{w.couleur_45}</span>}</div>)}</div>}
                  {sP.length>0&&<div style={{marginTop:10,display:"flex",gap:8}}>{sP.map(p=><div key={p.id} style={{background:T.bg,borderRadius:8,padding:"5px 10px",flex:1,textAlign:"center"}}><div style={{fontSize:9,color:T.dim}}>{p.micron}</div><div style={{fontSize:14,fontWeight:800,color:T.gold,fontFamily:"DM Mono"}}>{p.poids_sec_g}g</div></div>)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CATALOGUE ─────────────────────────────────────────────────────────────────
const Catalogue=()=>{
  const[strains,sSt]=useState([]);
  const[sessions,sSe]=useState([]);
  const[pesees,sPe]=useState([]);
  const[loading,sl]=useState(true);
  const[sel,sSel]=useState(null);
  const[editing,sEd]=useState(null);
  const[ed,sED]=useState({});
  const[saving,sSav]=useState(false);
  const[showP,sShP]=useState(false);
  const[nP,sNP]=useState({strain:"",m90:0,m45:0});
  const fRef=useRef();

  useEffect(()=>{
    Promise.all([sbFetch("strains?select=*&order=nom.asc"),sbFetch("sessions?select=*"),sbFetch("pesees?select=*")])
      .then(([a,b,c])=>{sSt(a||[]);sSe(b||[]);sPe(c||[]);}).catch(()=>{}).finally(()=>sl(false));
  },[]);

  const allSt=useMemo(()=>{
    if(strains.length>0)return strains;
    const seen=new Set();
    return sessions.filter(s=>{if(s.strain&&!seen.has(s.strain)){seen.add(s.strain);return true;}return false;}).map(s=>({nom:s.strain}));
  },[strains,sessions]);

  const getR=(nom)=>{
    const se=sessions.filter(s=>s.strain===nom);
    const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));
    const b=se.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);
    const po=pe.reduce((a,p)=>a+(parseFloat(p.poids_sec_g)||0),0);
    return b>0?((po/(b*1000))*100).toFixed(2):null;
  };

  const edit=(st)=>{sEd(st.nom||st);sED({odeur:st.odeur||"",gout:st.gout||"",mode_cure:st.mode_cure||"",notes:st.notes||"",genetique:st.genetique||""});};

  const saveEdit=async()=>{
    if(!editing)return;sSav(true);
    try{
      const ex=strains.find(s=>s.nom===editing);
      if(ex)await sbFetch(`strains?nom=eq.${encodeURIComponent(editing)}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify(ed)});
      else await sbFetch("strains",{method:"POST",prefer:"return=minimal",body:JSON.stringify({nom:editing,...ed})});
      const st=await sbFetch("strains?select=*&order=nom.asc");sSt(st||[]);sEd(null);
    }catch(e){alert("Erreur: "+e.message);}
    finally{sSav(false);}
  };

  const upload=async(e,nom)=>{
    const f=e.target.files[0];if(!f)return;
    const ext=f.name.split(".").pop();
    const path=`strains/${nom.replace(/\s/g,"_")}_${Date.now()}.${ext}`;
    try{
      const r=await fetch(`${SB_URL}/storage/v1/object/strain-photos/${path}`,{method:"POST",headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":f.type},body:f});
      if(!r.ok)throw new Error(await r.text());
      const url=`${SB_URL}/storage/v1/object/public/strain-photos/${path}`;
      await sbFetch(`strains?nom=eq.${encodeURIComponent(nom)}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify({photo_url:url})});
      const st=await sbFetch("strains?select=*&order=nom.asc");sSt(st||[]);
    }catch(e){alert("Upload: "+e.message);}
  };

  const addPesee=async()=>{
    if(!nP.strain)return;sSav(true);
    try{
      const se=sessions.filter(s=>s.strain===nP.strain);
      const last=se[se.length-1];
      if(!last){alert("Aucune session pour cette strain.");return;}
      const rows=[];
      if(parseFloat(nP.m90)>0)rows.push({session_id:last.id,micron:"90µ",poids_sec_g:parseFloat(nP.m90)});
      if(parseFloat(nP.m45)>0)rows.push({session_id:last.id,micron:"45µ",poids_sec_g:parseFloat(nP.m45)});
      if(rows.length>0)await sbFetch("pesees",{method:"POST",prefer:"return=minimal",body:JSON.stringify(rows)});
      const p=await sbFetch("pesees?select=*");sPe(p||[]);sShP(false);sNP({strain:"",m90:0,m45:0});
    }catch(e){alert("Erreur: "+e.message);}
    finally{sSav(false);}
  };

  if(loading)return<Load/>;
  const selSt=sel?allSt.find(s=>(s.nom||s)===sel):null;
  const selC=selSt?SC[allSt.indexOf(selSt)%SC.length]:T.orange;

  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <button onClick={()=>sShP(x=>!x)} style={{background:T.gold+"22",border:`1px solid ${T.gold}44`,borderRadius:10,padding:"8px 16px",color:T.gold,fontWeight:700,fontSize:12}}>⚖ Pesées freeze dryer</button>
      </div>
      {showP&&(
        <Crd s={{marginBottom:16,border:`1px solid ${T.gold}44`}}>
          <STL icon="⚖" text="PESÉES FREEZE DRYER" col={T.gold}/>
          <Fld label="Strain"><select value={nP.strain} onChange={e=>sNP(x=>({...x,strain:e.target.value}))}><option value="">Sélectionner...</option>{allSt.map(s=><option key={s.nom||s}>{s.nom||s}</option>)}</select></Fld>
          <Step label="90µ — Poids (g)" value={parseFloat(nP.m90)||0} onChange={v=>sNP(x=>({...x,m90:v}))} step={0.1} max={9999} unit="g"/>
          <Step label="45µ / FS — Poids (g)" value={parseFloat(nP.m45)||0} onChange={v=>sNP(x=>({...x,m45:v}))} step={0.1} max={9999} unit="g"/>
          <div style={{display:"flex",gap:10}}>
            <BOL c="Annuler" onClick={()=>sShP(false)} col={T.dim}/>
            <Btn c={saving?"Sauvegarde...":"💾 Sauvegarder"} onClick={addPesee} disabled={saving} col={T.gold}/>
          </div>
        </Crd>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {allSt.map((s,i)=>{
          const nom=s.nom||s,r=getR(nom),c=SC[i%SC.length],rec=r&&parseFloat(r)>4;
          return(
            <div key={nom} onClick={()=>sSel(nom)} style={{background:`linear-gradient(160deg,${T.card},${c}18)`,border:`2px solid ${rec?T.aura:c+"44"}`,borderRadius:16,overflow:"hidden",cursor:"pointer",animation:rec?"aura 2.5s infinite":"none"}}>
              <div style={{height:140,background:s.photo_url?`url(${s.photo_url}) center/cover`:`linear-gradient(135deg,${c}33,${T.bg3})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                {!s.photo_url&&<div style={{fontSize:40,opacity:0.2}}>🌿</div>}
                {rec&&<div style={{position:"absolute",top:8,right:8,background:T.aura,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:800,color:"#000"}}>★ RECORD</div>}
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{fontSize:17,fontWeight:900,fontStyle:"italic",color:T.white,textShadow:`1px 1px 0 ${c}`,marginBottom:4}}>{nom}</div>
                <div style={{fontSize:28,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:c,lineHeight:1,animation:rec?"rglow 2s infinite":"none"}}>{r?`${r}%`:"—"}</div>
                {s.odeur&&<div style={{fontSize:11,color:T.dim,marginTop:4}}>👃 {s.odeur}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {sel&&selSt&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"#000000AA",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{sSel(null);sEd(null);}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:768,background:`linear-gradient(160deg,${T.bg2},${selC}18)`,border:`2px solid ${selC}88`,borderRadius:"24px 24px 0 0",maxHeight:"90vh",overflowY:"auto",animation:"dup 0.3s ease",paddingBottom:"max(24px,env(safe-area-inset-bottom))"}}>
            <div style={{height:200,background:selSt.photo_url?`url(${selSt.photo_url}) center/cover`:`linear-gradient(135deg,${selC}44,${T.bg3})`,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:20,position:"relative"}}>
              <div style={{width:40,height:4,background:T.white+"44",borderRadius:2,position:"absolute",top:12,left:"50%",transform:"translateX(-50%)"}}/>
              {!selSt.photo_url&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:70,opacity:0.15}}>🌿</div>}
              <div>
                <div style={{fontSize:30,fontWeight:900,fontStyle:"italic",color:T.white,textShadow:`2px 2px 0 ${selC},0 0 20px ${selC}88`}}>{sel}</div>
                {selSt.genetique&&<div style={{fontSize:13,color:T.ink}}>{selSt.genetique}</div>}
              </div>
              <input ref={fRef} type="file" accept="image/*" onChange={e=>upload(e,sel)} style={{display:"none"}}/>
              <button onClick={()=>fRef.current.click()} style={{background:`${T.bg2}CC`,border:`1px solid ${selC}`,borderRadius:10,padding:"8px 14px",color:selC,fontWeight:700,fontSize:12}}>📷 Photo</button>
            </div>
            <div style={{padding:20}}>
              {(()=>{const r=getR(sel);const rec=r&&parseFloat(r)>4;return r&&<div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:9,color:T.dim,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Rendement</div><div style={{fontSize:52,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:selC,animation:rec?"rglow 2s infinite":"none"}}>{r}%</div></div>;})()}
              {editing===sel?(
                <Crd s={{border:`1px solid ${selC}44`}}>
                  <STL icon="✏" text="MODIFIER" col={selC}/>
                  <Fld label="Génétique"><input value={ed.genetique||""} onChange={e=>sED(x=>({...x,genetique:e.target.value}))} placeholder="Ex: GMO x Triangle Kush"/></Fld>
                  <Fld label="Odeur"><input value={ed.odeur||""} onChange={e=>sED(x=>({...x,odeur:e.target.value}))} placeholder="Ex: Terreuse, fruitée..."/></Fld>
                  <Fld label="Goût"><input value={ed.gout||""} onChange={e=>sED(x=>({...x,gout:e.target.value}))} placeholder="Ex: Diesel, floral..."/></Fld>
                  <BgSel label="Mode de cure" value={ed.mode_cure||""} onChange={v=>sED(x=>({...x,mode_cure:v}))} options={CURES}/>
                  <Fld label="Notes"><textarea value={ed.notes||""} onChange={e=>sED(x=>({...x,notes:e.target.value}))} rows={3} style={{resize:"none"}}/></Fld>
                  <div style={{display:"flex",gap:10}}>
                    <BOL c="Annuler" onClick={()=>sEd(null)} col={T.dim}/>
                    <Btn c={saving?"Sauvegarde...":"💾 Sauvegarder"} onClick={saveEdit} disabled={saving} col={selC}/>
                  </div>
                </Crd>
              ):(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    {[["Odeur",selSt.odeur||"—"],["Goût",selSt.gout||"—"],["Cure",selSt.mode_cure||"—"],["Sessions",sessions.filter(s=>s.strain===sel).length]].map(([l,v])=>(
                      <div key={l} style={{background:T.bg3,borderRadius:12,padding:"12px 14px",borderLeft:`2px solid ${selC}66`}}>
                        <div style={{fontSize:9,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                        <div style={{fontSize:15,fontWeight:700,color:T.white}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {(()=>{
                    const se=sessions.filter(s=>s.strain===sel);
                    const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));
                    const bM={};pe.forEach(p=>{if(!bM[p.micron])bM[p.micron]=0;bM[p.micron]+=parseFloat(p.poids_sec_g)||0;});
                    return Object.keys(bM).length>0&&(
                      <div style={{marginBottom:16}}>
                        <div style={{fontSize:10,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Pesées totales</div>
                        <div style={{display:"flex",gap:8}}>{Object.entries(bM).map(([mic,po])=><div key={mic} style={{flex:1,background:T.bg3,borderRadius:10,padding:"10px",textAlign:"center"}}><div style={{fontSize:9,color:T.dim}}>{mic}</div><div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"DM Mono"}}>{po.toFixed(1)}g</div></div>)}</div>
                      </div>
                    );
                  })()}
                  {selSt.notes&&<div style={{background:T.bg3,borderRadius:12,padding:14,marginBottom:14}}><div style={{fontSize:9,color:T.dim,marginBottom:4}}>NOTES</div><div style={{fontSize:13,color:T.ink,fontStyle:"italic"}}>{selSt.notes}</div></div>}
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>edit(selSt)} style={{flex:1,padding:"13px",borderRadius:12,background:selC+"22",border:`1.5px solid ${selC}`,color:selC,fontWeight:700,fontSize:14}}>✏ Modifier</button>
                    <button onClick={()=>sSel(null)} style={{flex:1,padding:"13px",borderRadius:12,background:"transparent",border:`1.5px solid ${T.border}`,color:T.dim,fontWeight:700,fontSize:14}}>✕ Fermer</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const[screen,sScr]=useState("dashboard");
  const[strains,sSt]=useState([]);
  useEffect(()=>{sbFetch("strains?select=*&order=nom.asc").then(d=>sSt(d||[])).catch(()=>{});},[]);
  const screens={dashboard:<Dashboard/>,session:<Session strains={strains}/>,calendar:<Calendrier/>,catalogue:<Catalogue/>};
  return(
    <>
      <style>{CSS}</style>
      <div style={{maxWidth:768,margin:"0 auto",minHeight:"100vh"}}>
        <AppHeader/>
        <div style={{paddingBottom:80}}>{screens[screen]}</div>
        <NavBar active={screen} onNav={sScr}/>
      </div>
      <FloatingTimers/>
    </>
  );
}
