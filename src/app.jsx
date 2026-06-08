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
const CURES = ["FreezeDryer"];
const TYPES_BIOMASSE = ["WPFF","Live Rosin"];
const DMINS = Array.from({length:60},(_,i)=>i+1);
const TINIT = { duree:15, remaining:null, running:false, done:false, startedAt:null };
const SC = ["#C0392B","#E67E22","#27AE60","#2471A3","#7D3C98","#E91E8C","#1ABC9C","#D4A843","#E74C3C","#16A085"];

const T = { bg:"#06060F",bg2:"#0A0A18",bg3:"#0E0E22",card:"#0B0B1A",border:"#1C1C3A",orange:"#C0392B",gold:"#D4A843",green:"#27AE60",white:"#EAE8F0",dim:"#4A4A7A",ink:"#8080B0",danger:"#E74C3C",aura:"#FFD700",purple:"#7D3C98" };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&family=DM+Mono:wght@400;500;700&family=Bebas+Neue&display=swap');
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
.wft{position:absolute;top:0;left:0;right:0;height:55px;background:linear-gradient(180deg,#0B0B1A,transparent);pointer-events:none;z-index:3;}
.wfb{position:absolute;bottom:0;left:0;right:0;height:55px;background:linear-gradient(0deg,#0B0B1A,transparent);pointer-events:none;z-index:3;}
.wsel{position:absolute;top:50%;left:8px;right:8px;height:44px;transform:translateY(-50%);border-top:1px solid #C0392B66;border-bottom:1px solid #C0392B66;pointer-events:none;z-index:2;border-radius:8px;background:#C0392B08;}
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
  const H=44,V=2,sY=useRef(0),sI=useRef(0);
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
          {DMINS.map((v,i)=>{const d=Math.abs(i-idx);return<div key={v} className="witem" onClick={()=>ap(i)} style={{height:H,color:d===0?color:T.dim,fontSize:d===0?28:d===1?18:14,opacity:d===0?1:d===1?0.4:0.15,fontWeight:d===0?800:400}}>{String(v).padStart(2,"0")} min</div>;})}
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
const NAV=[{id:"dashboard",icon:"⛩️",label:"Dashboard"},{id:"session",icon:"🏮",label:"Session"},{id:"calendar",icon:"🪷",label:"Calendrier"},{id:"utilisateurs",icon:"👥",label:"Utilisateurs"}];
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
// ── DAILY CODE ────────────────────────────────────────────────────────────────
const getDailyCode = () => {
  const d = new Date();
  const seed = (d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate()) * 9301 + 49297;
  const rng = (seed % 233280) / 233280;
  return String(Math.floor(rng * 90000) + 10000);
};

const AppHeader=()=>{
  const[t,sT]=useState(new Date());
  const[showCode,setShowCode]=useState(false);
  const code=getDailyCode();
  useEffect(()=>{const i=setInterval(()=>sT(new Date()),60000);return()=>clearInterval(i);},[]);
  return(
    <>
      <div style={{background:`linear-gradient(180deg,${T.bg2},${T.bg2}CC)`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`}}>
        <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:24}}>🫛</div>
        <div style={{textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6,justifyContent:"center"}}>
            <span className="nt" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,fontWeight:400,color:T.white,letterSpacing:3,textShadow:`0 0 16px ${T.orange}88,0 0 4px ${T.orange}`}}>SENZU</span>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,fontWeight:400,color:T.orange,letterSpacing:8}}>ASIA</span>
          </div>
          <div style={{fontSize:7,color:T.dim,letterSpacing:"0.35em",textTransform:"uppercase",marginTop:-3}}>Ice Water Hash Lab</div>
        </div>
        <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
          <div style={{fontSize:9,color:T.dim,fontFamily:"DM Mono"}}>{t.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}</div>
          <button onClick={()=>setShowCode(x=>!x)} style={{background:"transparent",border:"none",fontSize:14,opacity:0.4,lineHeight:1,padding:0,color:T.gold}}>🔑</button>
        </div>
      </div>

      {/* Code du jour modal */}
      {showCode&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"#000000CC"}} onClick={()=>setShowCode(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:70,right:12,width:220,background:T.bg2,border:`1px solid ${T.gold}44`,borderRadius:16,padding:20,boxShadow:`0 8px 40px #000000CC, 0 0 20px ${T.gold}22`,animation:"min 0.2s ease"}}>
            <div style={{fontSize:9,color:T.dim,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Code Senzu. du jour</div>
            <div style={{fontSize:38,fontWeight:800,fontFamily:"DM Mono",color:T.gold,letterSpacing:6,textAlign:"center",textShadow:`0 0 20px ${T.gold}66`}}>{code}</div>
            <div style={{fontSize:8,color:T.dim,textAlign:"center",marginTop:8}}>Valable jusqu'à minuit</div>
            <div style={{width:"100%",height:1,background:T.border,margin:"12px 0"}}/>
            <div style={{fontSize:8,color:T.dim,textAlign:"center",letterSpacing:"0.1em"}}>🔒 Réservé aux membres Senzu Asia</div>
          </div>
        </div>
      )}
    </>
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

const KPI=({label,value,col=T.orange,detail,framed})=>{
  const[open,sO]=useState(false);
  return(
    <div onClick={()=>detail&&sO(x=>!x)} style={{background:framed?T.card:"transparent",border:framed?`2px solid ${open?col:col+"66"}`:"none",borderRadius:14,padding:framed?"18px 20px":"10px 4px",flex:1,cursor:detail?"pointer":"default",position:"relative",overflow:"hidden"}}>
      {framed&&<div style={{position:"absolute",top:-16,right:-16,width:64,height:64,borderRadius:"50%",background:`radial-gradient(circle,${col}22,transparent)`}}/>}
      <div style={{fontSize:9,color:T.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:framed?38:32,fontWeight:800,color:col,fontFamily:"DM Mono",lineHeight:1}}>{value??'—'}</div>
      {detail&&<div style={{fontSize:9,color:T.dim,marginTop:4}}>{open?"▲ Fermer":"▼ Détails"}</div>}
      {open&&detail&&<div style={{marginTop:12,borderTop:`1px solid ${T.border}`,paddingTop:12}}>{detail}</div>}
    </div>
  );
};

const TYPES_PRODUIT=["WPFF","Live Rosin"];

const StrainTypeField=({strainNom,color})=>{
  const[type,setType]=useState(null);
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}&select=type_produit`)
      .then(d=>{if(d?.[0]) setType(d[0].type_produit||null);}).catch(()=>{});
  },[strainNom]);
  const save=async(v)=>{
    setType(v);setSaving(true);
    try{
      const ex=await sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}&select=id`);
      if(ex?.length>0) await sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify({type_produit:v})});
      else await sbFetch("strains",{method:"POST",prefer:"return=minimal",body:JSON.stringify({nom:strainNom,type_produit:v})});
    }catch(e){}finally{setSaving(false);}
  };
  return(
    <div style={{flex:1,background:T.bg3,borderRadius:12,padding:"12px 14px",border:`1px solid ${color}44`}}>
      <div style={{fontSize:9,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Type</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {TYPES_PRODUIT.map(t=>(
          <button key={t} onClick={()=>save(t)} style={{padding:"8px 10px",borderRadius:8,fontSize:12,fontWeight:700,background:type===t?color+"44":T.bg,border:`2px solid ${type===t?color:T.border}`,color:type===t?T.white:T.dim,textAlign:"left",boxShadow:type===t?`0 0 8px ${color}44`:"none"}}>{t}</button>
        ))}
      </div>
    </div>
  );
};

const StrainEditFields=({strainNom,color,onClose})=>{
  const[data,setData]=useState({odeur:"",gout:"",mode_cure:"",notes:"",genetique:""});
  const[loaded,setLoaded]=useState(false);
  const[saving,setSaving]=useState(false);
  useEffect(()=>{
    sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}&select=*`)
      .then(d=>{if(d?.[0])setData({odeur:d[0].odeur||"",gout:d[0].gout||"",mode_cure:d[0].mode_cure||"",notes:d[0].notes||"",genetique:d[0].genetique||""});setLoaded(true);})
      .catch(()=>setLoaded(true));
  },[strainNom]);
  const save=async()=>{
    setSaving(true);
    try{
      const ex=await sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}&select=id`);
      if(ex?.length>0) await sbFetch(`strains?nom=eq.${encodeURIComponent(strainNom)}`,{method:"PATCH",prefer:"return=minimal",body:JSON.stringify(data)});
      else await sbFetch("strains",{method:"POST",prefer:"return=minimal",body:JSON.stringify({nom:strainNom,...data})});
    }catch(e){alert("Erreur: "+e.message);}finally{setSaving(false);}
  };
  if(!loaded)return<div style={{color:T.dim,textAlign:"center",padding:12}}>...</div>;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[["Odeur","odeur","Ex: Terreuse..."],["Goût","gout","Ex: Diesel..."],["Génétique","genetique","Ex: GMO x TK"]].map(([l,k,ph])=>(
          <div key={k} style={{background:T.bg3,borderRadius:10,padding:"10px 12px",borderLeft:`2px solid ${color}44`}}>
            <div style={{fontSize:9,color:T.dim,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>{l}</div>
            <input value={data[k]} onChange={e=>setData(x=>({...x,[k]:e.target.value}))} placeholder={ph} style={{fontSize:13,padding:"4px 0",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,borderRadius:0,color:T.white,width:"100%"}}/>
          </div>
        ))}
        <div style={{background:T.bg3,borderRadius:10,padding:"10px 12px",borderLeft:`2px solid ${color}44`}}>
          <div style={{fontSize:9,color:T.dim,marginBottom:6,letterSpacing:"0.1em",textTransform:"uppercase"}}>Cure</div>
          <button onClick={()=>setData(x=>({...x,mode_cure:"FreezeDryer"}))} style={{padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,background:data.mode_cure==="FreezeDryer"?color+"44":T.bg,border:`2px solid ${data.mode_cure==="FreezeDryer"?color:T.border}`,color:data.mode_cure==="FreezeDryer"?T.white:T.dim,width:"100%",textAlign:"left"}}>FreezeDryer</button>
        </div>
      </div>
      <div style={{background:T.bg3,borderRadius:10,padding:"10px 12px",marginBottom:14,borderLeft:`2px solid ${color}44`}}>
        <div style={{fontSize:9,color:T.dim,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>Notes</div>
        <textarea value={data.notes} onChange={e=>setData(x=>({...x,notes:e.target.value}))} rows={2} style={{resize:"none",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,borderRadius:0,color:T.white,width:"100%",fontSize:13}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,background:"transparent",border:`1.5px solid ${T.border}`,color:T.dim,fontWeight:700,fontSize:14}}>✕ Fermer</button>
        <button onClick={save} disabled={saving} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${color},${color}AA)`,color:"#fff",fontWeight:800,fontSize:14,boxShadow:`0 4px 14px ${color}44`}}>{saving?"...":"💾 Sauvegarder"}</button>
      </div>
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
  const[period,setPeriod]=useState("wash");
  const[statsOpen,setStatsOpen]=useState(false);

  useEffect(()=>{
    Promise.all([sbFetch("sessions?select=*&order=date.desc"),sbFetch("washes?select=*"),sbFetch("pesees?select=*"),sbFetch("strains?select=*&order=nom.asc")])
      .then(([a,b,c,d])=>{ss(a||[]);sw(b||[]);sp(c||[]);sst(d||[]);}).catch(()=>{}).finally(()=>sl(false));
  },[]);

  const totBio=sessions.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);

  const rendBS=useMemo(()=>{
    const strainNames=[...new Set(sessions.map(s=>s.strain).filter(Boolean))];
    return strainNames.map(nom=>{
      const se=sessions.filter(s=>s.strain===nom);
      const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));
      const bio=se.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);
      const poids=pe.reduce((a,p)=>a+(parseFloat(p.poids_sec_g)||0),0);
      const rend=bio>0?((poids/(bio*1000))*100).toFixed(2):"—";
      return{nom,rend};
    }).filter(r=>r.rend!=="—").sort((a,b)=>parseFloat(b.rend)-parseFloat(a.rend));
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

  // ── Unified chart data by period ──
  const weekOf=(d)=>{const dt=new Date(d+"T12:00:00");const oj=new Date(dt.getFullYear(),0,1);const days=Math.floor((dt-oj)/86400000);return `S${Math.ceil((days+oj.getDay()+1)/7)}`;};
  const monthLbl=(d)=>new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{month:"short"});
  const quarterOf=(d)=>{const dt=new Date(d+"T12:00:00");return `T${Math.floor(dt.getMonth()/3)+1} ${String(dt.getFullYear()).slice(2)}`;};
  const yearOf=(d)=>d.slice(0,4);

  const chart=useMemo(()=>{
    // For "wash": x = wash number (W1..Wn) across all sessions, count per strain
    const strainNames=[...new Set(sessions.map(s=>s.strain).filter(Boolean))].slice(0,6);
    const data={}; strainNames.forEach(s=>data[s]={});
    let labels=[];
    if(period==="wash"){
      const maxNum=Math.max(1,...washes.map(w=>w.numero||0));
      labels=Array.from({length:maxNum},(_,i)=>`W${i+1}`);
      washes.forEach(w=>{const se=sessions.find(s=>s.id===w.session_id);if(!se?.strain)return;const k=`W${w.numero}`;if(!data[se.strain])data[se.strain]={};data[se.strain][k]=(data[se.strain][k]||0)+1;});
    }else{
      const fn = period==="semaine"?weekOf : period==="mois"?monthLbl : period==="3mois"?quarterOf : yearOf;
      const set=new Set();
      washes.forEach(w=>{const se=sessions.find(s=>s.id===w.session_id);if(!se?.date||!se?.strain)return;const k=fn(se.date);set.add(k);if(!data[se.strain])data[se.strain]={};data[se.strain][k]=(data[se.strain][k]||0)+1;});
      labels=[...set];
    }
    return {strainNames,data,labels};
  },[washes,sessions,period]);

  const getR=(nom)=>{const se=sessions.filter(s=>s.strain===nom);const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));const b=se.reduce((a,s)=>a+(parseFloat(s.biomasse_kg)||0),0);const po=pe.reduce((a,p)=>a+(parseFloat(p.poids_sec_g)||0),0);return b>0?((po/(b*1000))*100).toFixed(2):null;};

  const selSt=sel?uStr.find(s=>(s.nom||s)===sel):null;
  const selC=selSt?SC[uStr.indexOf(selSt)%SC.length]:T.orange;

  if(loading)return<Load/>;
  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      {/* Top bar: ☰ stats menu + Rendement */}
      <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"stretch"}}>
        <button onClick={()=>setStatsOpen(true)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"0 18px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,minWidth:64}}>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {[0,1,2].map(i=><div key={i} style={{width:18,height:2,background:T.ink,borderRadius:1}}/>)}
          </div>
          <span style={{fontSize:8,color:T.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>Stats</span>
        </button>
        <KPI label="Rendement moy." value={rendM?`${rendM}%`:"—"} col={T.purple} framed
          detail={<div>{rendBS.filter(r=>r.rend!=="—").map(r=><div key={r.nom} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.ink}}>{r.nom}</span><span style={{fontSize:12,fontWeight:700,color:T.gold,fontFamily:"DM Mono"}}>{r.rend}%</span></div>)}<div style={{fontSize:9,color:T.dim,marginTop:6}}>Basé sur {rendBS.filter(r=>r.rend!=="—").length} strain(s)</div></div>}
        />
      </div>

      {/* Stats slide-in menu */}
      {statsOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:450,background:"#000000AA"}} onClick={()=>setStatsOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:0,left:0,bottom:0,width:"75%",maxWidth:300,background:T.bg2,borderRight:`1px solid ${T.border}`,padding:20,paddingTop:"max(20px,env(safe-area-inset-top))",animation:"min 0.25s ease",boxShadow:"4px 0 30px #00000099"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:14,fontWeight:800,color:T.white}}>📊 Statistiques</span>
              <button onClick={()=>setStatsOpen(false)} style={{background:"transparent",color:T.dim,fontSize:20}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["Sessions",sessions.length,T.orange],["Washes",washes.length,T.gold],["Biomasse",`${totBio.toFixed(1)}kg`,T.green]].map(([l,v,c])=>(
                <div key={l} style={{background:T.card,border:`1px solid ${c}33`,borderRadius:14,padding:"16px 18px"}}>
                  <div style={{fontSize:9,color:T.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>{l}</div>
                  <div style={{fontSize:34,fontWeight:800,color:c,fontFamily:"DM Mono",lineHeight:1}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Crd>
        <STL icon="📊" text="ANALYSE WASHES"/>
        {/* Period selector */}
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["wash","Wash"],["semaine","Semaine"],["mois","Mois"],["3mois","3 Mois"],["an","An"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setPeriod(id)} style={{flexShrink:0,padding:"7px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:period===id?T.orange+"22":T.bg3,color:period===id?T.orange:T.dim,border:`1px solid ${period===id?T.orange+"66":T.border}`}}>{lbl}</button>
          ))}
        </div>
        {(()=>{
          const {strainNames,data,labels}=chart;
          const W=320,H=140,PAD=26;
          const maxV=Math.max(1,...strainNames.flatMap(st=>labels.map(l=>data[st]?.[l]||0)));
          const xStep=labels.length>1?(W-PAD*2)/(labels.length-1):0;
          const xy=(vi,val)=>[PAD+vi*xStep, H-PAD-((val/maxV)*(H-PAD*2))];
          const smooth=(pts)=>{
            if(pts.length<2)return "";
            let d=`M ${pts[0][0]},${pts[0][1]}`;
            for(let i=0;i<pts.length-1;i++){const[x0,y0]=pts[i],[x1,y1]=pts[i+1];const cx=(x0+x1)/2;d+=` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;}
            return d;
          };
          if(labels.length===0)return<div style={{textAlign:"center",color:T.dim,padding:30,fontSize:13}}>Aucune donnée pour cette période</div>;
          return(
            <div style={{width:"100%",overflowX:"auto"}}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",minWidth:300,height:160}}>
                <defs>
                  {strainNames.map((st,i)=>{const c=SC[i%SC.length];return(
                    <linearGradient key={st} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity="0.35"/>
                      <stop offset="100%" stopColor={c} stopOpacity="0"/>
                    </linearGradient>
                  );})}
                </defs>
                {[0,0.5,1].map(g=>(<line key={g} x1={PAD} y1={H-PAD-g*(H-PAD*2)} x2={W-PAD} y2={H-PAD-g*(H-PAD*2)} stroke={T.border} strokeWidth="0.5"/>))}
                {strainNames.map((st,i)=>{
                  const c=SC[i%SC.length];
                  const pts=labels.map((l,vi)=>xy(vi,data[st]?.[l]||0));
                  if(pts.length<2)return <circle key={st} cx={pts[0]?.[0]} cy={pts[0]?.[1]} r="4" fill={c}/>;
                  const area=`${smooth(pts)} L ${pts[pts.length-1][0]},${H-PAD} L ${pts[0][0]},${H-PAD} Z`;
                  return(<g key={st}>
                    <path d={area} fill={`url(#grad${i})`}/>
                    <path d={smooth(pts)} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${c}88)`}}/>
                  </g>);
                })}
                {labels.map((l,vi)=>(labels.length<=14||vi%2===0)&&(<text key={l} x={PAD+vi*xStep} y={H-8} fill={T.dim} fontSize="7" textAnchor="middle" fontFamily="DM Mono">{l}</text>))}
              </svg>
              <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:6}}>
                {strainNames.map((st,i)=>(
                  <div key={st} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:14,height:3,borderRadius:2,background:SC[i%SC.length],boxShadow:`0 0 6px ${SC[i%SC.length]}`}}/>
                    <span style={{fontSize:12,color:T.ink,fontWeight:600}}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        <div style={{borderTop:`1px solid ${T.border}`,marginTop:14,paddingTop:14}}>
          <div style={{fontSize:9,color:T.dim,marginBottom:8,letterSpacing:"0.1em",textTransform:"uppercase"}}>Classement total</div>
          {wBS.map(([nom,cnt],i)=>(
            <div key={nom} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:T.white}}>{nom}</span>
                <span style={{fontSize:12,color:SC[i%SC.length],fontWeight:700,fontFamily:"DM Mono"}}>{cnt}W</span>
              </div>
              <div style={{height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${(cnt/maxW)*100}%`,background:SC[i%SC.length],borderRadius:2,transition:"width 0.5s"}}/></div>
            </div>
          ))}
          {/* Rendement banner integrated */}
          <div style={{borderTop:`1px solid ${T.border}`,marginTop:10,paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase"}}>Rendement par strain</span>
          </div>
          {rendBS.filter(r=>r.rend!=="—").map((r,i)=>(
            <div key={r.nom} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
              <span style={{fontSize:12,color:T.white}}>{r.nom}</span>
              <span style={{fontSize:14,fontWeight:800,color:T.gold,fontFamily:"DM Mono"}}>{r.rend}%</span>
            </div>
          ))}
        </div>
      </Crd>

      {uStr.length>0&&(
        <div style={{marginBottom:22,marginTop:16}}>
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

      {sel&&selSt&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"#000000AA",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>ssel(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,background:`linear-gradient(160deg,${T.bg2},${selC}22)`,border:`2px solid ${selC}88`,borderRadius:24,overflow:"hidden",animation:"min 0.3s ease",boxShadow:`0 20px 60px #000000CC,0 0 40px ${selC}33`}}>
            <div style={{height:160,background:selSt.photo_url?`url(${selSt.photo_url}) center/cover`:`linear-gradient(135deg,${selC}44,${T.bg3})`,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:16,position:"relative"}}>
              {!selSt.photo_url&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,opacity:0.15}}>🌿</div>}
              <div style={{fontSize:30,fontWeight:900,fontStyle:"italic",color:T.white,textShadow:`2px 2px 0 ${selC}`,textAlign:"center"}}>{sel}</div>
            </div>
            <div style={{padding:18}}>
              {(()=>{const r=getR(sel);const rec=r&&parseFloat(r)>4;return r&&(
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <div style={{flex:1,background:T.bg3,borderRadius:12,padding:"12px 14px",textAlign:"center",border:`1px solid ${selC}44`}}>
                    <div style={{fontSize:9,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Rendement</div>
                    <div style={{fontSize:28,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:selC,animation:rec?"rglow 2s infinite":"none"}}>{r}%</div>
                  </div>
                  <StrainTypeField strainNom={sel} color={selC}/>
                </div>
              );})()}
              <StrainEditFields strainNom={sel} color={selC} onClose={()=>ssel(null)}/>
            </div>
          </div>
        </div>
      )}

      {/* ── CATALOGUE SECTION ── */}
      <CatalogueSection/>
    </div>
  );
};

// ── SESSION ───────────────────────────────────────────────────────────────────
const eW=(n)=>({numero:n,micron:"",glace:"—",vitesse:"",duree_min:15,couleur_160:"",couleur_90:"",couleur_45:"",texture:"",contaminants:false,potentiel_wash_plus:false,notes:""});
const eMach=(machine)=>({machine,strain:"",biomasse_kg:8,type_biomasse:"Fresh Frozen",nb_sacs:16,heure_debut:"",heure_fin:"",notes:"",washes:Array.from({length:10},(_,i)=>eW(i+1)),currentWash:1});
const LSK_M=(m)=>`sz_m_${m.replace(/\s/g,"_")}`;

const StrainSelector=({value,onChange,strainNames,onDelete})=>{
  const[showNew,setShowNew]=useState(false);
  const[newName,setNewName]=useState("");
  const[saving,setSaving]=useState(false);
  const[pressTimer,setPressTimer]=useState(null);
  const saveNew=async()=>{
    if(!newName.trim())return;
    setSaving(true);
    try{
      const ex=await sbFetch(`strains?nom=eq.${encodeURIComponent(newName.trim())}&select=id`);
      if(!ex?.length) await sbFetch("strains",{method:"POST",prefer:"return=minimal",body:JSON.stringify({nom:newName.trim()})});
      onChange(newName.trim());setShowNew(false);setNewName("");
    }catch(e){alert("Erreur: "+e.message);}
    finally{setSaving(false);}
  };
  if(showNew)return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nom de la strain..." autoFocus style={{fontSize:14,padding:"8px 12px"}}/>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setShowNew(false)} style={{flex:1,padding:"8px",borderRadius:8,background:"transparent",border:`1px solid ${T.border}`,color:T.dim,fontSize:12}}>Annuler</button>
        <button onClick={saveNew} disabled={saving} style={{flex:1,padding:"8px",borderRadius:8,background:T.orange,color:"#fff",fontSize:12,fontWeight:700}}>{saving?"...":"✓ Créer"}</button>
      </div>
    </div>
  );

  // Custom dropdown with long-press delete
  const[open,setOpen]=useState(false);
  return(
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(x=>!x)} style={{width:"100%",background:T.bg3,border:`1px solid ${value?T.orange+"44":T.border}`,borderRadius:10,padding:"12px 16px",color:value?T.white:T.dim,fontSize:14,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{value||"Sélectionner..."}</span>
        <span style={{color:T.dim,fontSize:10}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,zIndex:200,overflow:"hidden",boxShadow:"0 8px 30px #00000099"}}>
          {strainNames.map(s=>{
            let timer=null;
            return(
              <div key={s} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:value===s?T.orange+"22":"transparent"}}
                onTouchStart={()=>{timer=setTimeout(async()=>{
                  if(confirm(`Supprimer "${s}" de la liste ?`)){
                    try{
                      await sbFetch(`strains?nom=eq.${encodeURIComponent(s)}`,{method:"DELETE",prefer:"return=minimal"});
                      if(onDelete)onDelete(s);
                      if(value===s)onChange("");
                      setOpen(false);
                    }catch(e){alert("Erreur: "+e.message);}
                  }
                },700);setPressTimer(timer);}}
                onTouchEnd={()=>{clearTimeout(timer);}}>
                <button onClick={()=>{onChange(s);setOpen(false);}} style={{background:"none",color:value===s?T.orange:T.white,fontSize:14,fontWeight:value===s?700:400,flex:1,textAlign:"left"}}>
                  {value===s&&"✓ "}{s}
                </button>
                <span style={{fontSize:9,color:T.dim}}>Appui long pour supprimer</span>
              </div>
            );
          })}
          <div onClick={()=>{setOpen(false);setShowNew(true);}} style={{padding:"12px 16px",color:T.orange,fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Nouvelle strain</div>
        </div>
      )}
    </div>
  );
};

const MultiMicron=({value,onChange})=>{
  const selected=value?value.split("-").map(x=>x.trim()).filter(Boolean):[];
  const toggle=(m)=>{
    const clean=m.replace("µ","");
    const cur=selected.map(x=>x.replace("µ",""));
    const next=cur.includes(clean)?cur.filter(x=>x!==clean):[...cur,clean];
    // Sort by size order
    const order=["220","160","90","45","25","FS"];
    const sorted=order.filter(x=>next.includes(x));
    onChange(sorted.length>0?sorted.join("-"):"");
  };
  return(
    <div>
      <Lbl c="Sacs du wash"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
        {MICRONS.map(m=>{
          const clean=m.replace("µ","");
          const on=selected.map(x=>x.replace("µ","")).includes(clean);
          return<button key={m} onClick={()=>toggle(m)} style={{padding:"8px 14px",borderRadius:9,fontSize:13,fontWeight:700,background:on?T.orange:T.bg3,color:on?"#fff":T.ink,border:`1px solid ${on?T.orange:T.border}`,boxShadow:on?`0 2px 8px ${T.orange}44`:"none"}}>{m}</button>;
        })}
      </div>
      {selected.length>0&&<div style={{fontSize:11,color:T.orange,fontFamily:"DM Mono",fontWeight:700}}>→ {selected.join("-")}</div>}
    </div>
  );
};

const MachineCard=({machine,strains})=>{
  const lsk=LSK_M(machine);
  const color=MC[machine]||T.orange;
  const short=MS[machine];
  const[data,setData]=useState(()=>{try{const d=localStorage.getItem(lsk);return d?JSON.parse(d):eMach(machine);}catch{return eMach(machine);}});
  const[locked,setLocked]=useState(true);
  const[face,setFace]=useState(null); // null=closed, "wash", "data"
  const[saving,setSaving]=useState(false);
  const timer=useTimer(machine);

  useEffect(()=>{try{localStorage.setItem(lsk,JSON.stringify(data));}catch{}},[data]);
  const sF=(k,v)=>setData(d=>({...d,[k]:v}));
  const sW=(i,k,v)=>setData(d=>{const w=[...d.washes];w[i]={...w[i],[k]:v};return{...d,washes:w};});
  const curW=data.currentWash||1;
  const curWData=data.washes[curW-1]||eW(curW);
  const prevWData=curW>1?data.washes[curW-2]:null;
  const strainNames=strains.length>0?[...new Set(strains.map(s=>s.nom||s))]:[];

  const saveSession=async()=>{
    if(!data.strain){alert("Strain requis.");return;}
    setSaving(true);
    try{
      const[row]=await sbFetch("sessions",{method:"POST",body:JSON.stringify({machine,strain:data.strain,biomasse_kg:parseFloat(data.biomasse_kg)||null,type_biomasse:data.type_biomasse,nb_sacs:parseInt(data.nb_sacs)||null,heure_debut:data.heure_debut||null,heure_fin:data.heure_fin||null,statut:"cloture",date:new Date().toISOString().slice(0,10),notes:data.notes||null})});
      const validW=data.washes.filter(w=>w.micron);
      if(validW.length>0)await sbFetch("washes",{method:"POST",prefer:"return=minimal",body:JSON.stringify(validW.map(w=>({session_id:row.id,numero:w.numero,micron:w.micron,glace:w.glace||null,vitesse:w.vitesse||null,duree_min:w.duree_min||null,couleur_160:w.couleur_160||null,couleur_90:w.couleur_90||null,couleur_45:w.couleur_45||null,texture:w.texture||null,contaminants:w.contaminants,notes:w.notes||null})))});
      localStorage.removeItem(lsk);setData(eMach(machine));setFace(null);
      alert(`✅ Session ${short} sauvegardée !`);
    }catch(e){alert("Erreur: "+e.message);}
    finally{setSaving(false);}
  };

  const timerMins=timer.remaining!=null?Math.floor(timer.remaining/60):timer.duree;
  const timerSecs=timer.remaining!=null?timer.remaining%60:0;
  const timerOn=timer.running;

  return(
    <>
      {/* ── FACE 1 : Machine card ── */}
      <div style={{background:`linear-gradient(135deg,${T.card},${color}12)`,border:`2px solid ${color}44`,borderRadius:20,padding:18,marginBottom:14,position:"relative"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:timerOn?T.green:T.danger,boxShadow:`0 0 8px ${timerOn?T.green:T.danger}`,animation:timerOn?"tpulse 1s infinite":"none"}}/>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:color,letterSpacing:2}}>{short}</span>
            {/* LED toggle */}
            <div style={{display:"flex",background:T.bg3,borderRadius:20,border:`1px solid ${T.border}`,overflow:"hidden"}}>
              {!timerOn&&<div style={{padding:"4px 10px",fontSize:10,fontWeight:800,color:T.danger,background:T.danger+"22"}}>OFF</div>}
              {timerOn
                ? <div style={{padding:"4px 12px",fontSize:11,fontWeight:800,fontFamily:"DM Mono",color:T.green,background:T.green+"22",animation:"tpulse 1s infinite"}}>{String(timerMins).padStart(2,"0")}:{String(timerSecs).padStart(2,"0")}</div>
                : <div style={{padding:"4px 10px",fontSize:10,fontWeight:800,color:T.dim}}>ON</div>
              }
            </div>
          </div>
          <button onClick={()=>setLocked(x=>!x)} style={{background:"transparent",border:"none",fontSize:20,opacity:locked?1:0.5}}>
            {locked?"🔒":"🔓"}
          </button>
        </div>

        {/* Infos */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            ["Strain", locked
              ? <div style={{fontSize:16,fontWeight:800,color:T.white}}>{data.strain||"—"}</div>
              : <StrainSelector value={data.strain} onChange={v=>sF("strain",v)} strainNames={strainNames} onDelete={()=>sF("strain","")}/>
            ],
            ["Biomasse", locked
              ? <div style={{fontSize:16,fontWeight:800,color:color}}>{data.biomasse_kg} kg</div>
              : <Step label="" value={parseFloat(data.biomasse_kg)||0} onChange={v=>sF("biomasse_kg",v)} step={0.5} max={50} unit=" kg"/>
            ],
            ["Wash en cours", locked
              ? <div style={{fontSize:16,fontWeight:800,color:color}}>W{curW}</div>
              : <Step label="" value={curW} onChange={v=>sF("currentWash",v)} min={1} max={10}/>
            ],
            ["Sacs", locked
              ? <div style={{fontSize:16,fontWeight:800,color:T.white}}>{data.nb_sacs}</div>
              : <Step label="" value={parseInt(data.nb_sacs)||0} onChange={v=>sF("nb_sacs",v)} max={30}/>
            ],
          ].map(([l,v])=>(
            <div key={l} style={{background:T.bg3,borderRadius:12,padding:"10px 12px",borderTop:`2px solid ${color}44`}}>
              <div style={{fontSize:8,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
              {v}
            </div>
          ))}
        </div>

        {!locked&&(
          <div style={{marginBottom:12}}>
            <BgSel label="Type produit" value={data.type_biomasse} onChange={v=>sF("type_biomasse",v)} options={TYPES_BIOMASSE}/>
          </div>
        )}

        {/* Footer */}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          {!locked&&<button onClick={()=>{setData(eMach(machine));localStorage.removeItem(lsk);}} style={{padding:"8px 16px",borderRadius:10,background:"transparent",border:`1px solid ${T.danger}`,color:T.danger,fontSize:12,fontWeight:700}}>↺ Reset</button>}
          <button onClick={()=>setFace("wash")} style={{padding:"10px 22px",borderRadius:12,background:`linear-gradient(135deg,${color},${color}AA)`,color:"#fff",fontWeight:800,fontSize:14,boxShadow:`0 4px 14px ${color}44`}}>
            WASH →
          </button>
        </div>
      </div>

      {/* ── MODAL FACES 2 & 3 ── */}
      {face&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"#000000BB"}} onClick={()=>setFace(null)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:0,left:0,right:0,background:T.bg2,borderRadius:"20px 20px 0 0",border:`2px solid ${color}66`,maxHeight:"88vh",overflowY:"auto",animation:"dup 0.3s ease",paddingBottom:"max(20px,env(safe-area-inset-bottom))"}}>
            {/* Modal header */}
            <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.bg2,zIndex:10}}>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setFace("wash")} style={{padding:"8px 18px",borderRadius:10,fontWeight:800,fontSize:13,background:face==="wash"?color+"22":T.bg3,color:face==="wash"?color:T.dim,border:`1px solid ${face==="wash"?color+"66":T.border}`}}>💧 Wash</button>
                <button onClick={()=>setFace("data")} style={{padding:"8px 18px",borderRadius:10,fontWeight:800,fontSize:13,background:face==="data"?color+"22":T.bg3,color:face==="data"?color:T.dim,border:`1px solid ${face==="data"?color+"66":T.border}`}}>📈 Data</button>
              </div>
              {/* Chrono indicator */}
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {timerOn
                  ? <div style={{fontFamily:"DM Mono",fontSize:14,fontWeight:800,color:T.green,animation:"tpulse 1s infinite"}}>{String(timerMins).padStart(2,"0")}:{String(timerSecs).padStart(2,"0")}</div>
                  : <div style={{display:"flex",background:T.bg3,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                      <div style={{padding:"4px 10px",fontSize:10,fontWeight:800,color:T.danger,background:T.danger+"22"}}>OFF</div>
                      <button onClick={()=>timer.start()} style={{padding:"4px 10px",fontSize:10,fontWeight:800,color:T.dim,background:"transparent"}}>ON</button>
                    </div>
                }
                {timerOn&&<button onClick={()=>timer.stop()} style={{padding:"4px 10px",borderRadius:8,background:T.danger+"22",border:`1px solid ${T.danger}`,color:T.danger,fontSize:10,fontWeight:800}}>⏹</button>}
              </div>
            </div>

            {/* Face 2 — Wash */}
            {face==="wash"&&(
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:color,letterSpacing:2}}>WASH EN COURS</span>
                  <div style={{background:color+"22",border:`1px solid ${color}66`,borderRadius:10,padding:"6px 16px",fontFamily:"DM Mono",fontSize:20,fontWeight:800,color:color}}>W{curW}</div>
                </div>
                {prevWData?.micron&&(
                  <div style={{background:T.bg3,borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:T.dim}}>Wash précédent</span>
                    <div style={{display:"flex",gap:6}}>
                      <Bdg col={T.dim}>W{curW-1}</Bdg>
                      {prevWData.micron&&<Bdg col={T.dim}>{prevWData.micron}</Bdg>}
                      {prevWData.couleur_45&&<Bdg col={T.dim}>{prevWData.couleur_45}</Bdg>}
                    </div>
                  </div>
                )}
                <div style={{background:T.bg3,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
                  <MultiMicron value={curWData.micron} onChange={v=>sW(curW-1,"micron",v)}/>
                  <Fld label="Glace"><BgSel label="" value={curWData.glace||"—"} onChange={v=>sW(curW-1,"glace",v)} options={GLACE}/></Fld>
                  <Fld label="Vitesse"><BgSel label="" value={curWData.vitesse} onChange={v=>sW(curW-1,"vitesse",v)} options={VITESSES}/></Fld>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{if(curW>1)sF("currentWash",curW-1);}} style={{flex:1,padding:"12px",borderRadius:12,background:T.bg3,border:`1px solid ${T.border}`,color:T.dim,fontWeight:700,fontSize:14}}>← W{curW-1}</button>
                  <button onClick={()=>{if(curW<10)sF("currentWash",curW+1);}} style={{flex:1,padding:"12px",borderRadius:12,background:color+"22",border:`1px solid ${color}66`,color,fontWeight:700,fontSize:14}}>W{curW+1} →</button>
                </div>
              </div>
            )}

            {/* Face 3 — Data */}
            {face==="data"&&(
              <div style={{padding:"16px 18px"}}>
                <div style={{marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:color,letterSpacing:2}}>DATA W{curW}</span>
                  <div style={{display:"flex",gap:6}}>
                    {data.washes.filter(w=>w.micron).map(w=>(
                      <button key={w.numero} onClick={()=>sF("currentWash",w.numero)} style={{padding:"4px 10px",borderRadius:8,background:curW===w.numero?color+"33":T.bg3,border:`1px solid ${curW===w.numero?color:T.border}`,color:curW===w.numero?color:T.dim,fontSize:11,fontWeight:700}}>W{w.numero}</button>
                    ))}
                  </div>
                </div>
                <BgSel label="Couleur 160µ" value={curWData.couleur_160} onChange={v=>sW(curW-1,"couleur_160",v)} options={COULEURS}/>
                <BgSel label="Couleur 90µ"  value={curWData.couleur_90}  onChange={v=>sW(curW-1,"couleur_90",v)}  options={COULEURS}/>
                <BgSel label="Couleur 45µ"  value={curWData.couleur_45}  onChange={v=>sW(curW-1,"couleur_45",v)}  options={COULEURS}/>
                <BgSel label="Texture" value={curWData.texture} onChange={v=>sW(curW-1,"texture",v)} options={TEXTURES}/>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <button onClick={()=>sW(curW-1,"contaminants",!curWData.contaminants)} style={{width:28,height:28,borderRadius:8,border:`2px solid ${curWData.contaminants?T.danger:T.border}`,background:curWData.contaminants?T.danger+"33":"transparent"}}>{curWData.contaminants&&<span style={{color:T.danger}}>✓</span>}</button>
                  <span style={{fontSize:14,color:curWData.contaminants?T.danger:T.dim}}>Contaminants</span>
                </div>
                <Fld label="Notes"><textarea value={curWData.notes||""} onChange={e=>sW(curW-1,"notes",e.target.value)} rows={2} style={{resize:"none"}}/></Fld>
                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginTop:6}}>
                  <Btn c={saving?"Sauvegarde...":"💾 Fin de session — Sauvegarder"} onClick={saveSession} disabled={saving} col={T.green}/>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const Session=({strains})=>(
  <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
    <STL icon="🏮" text="SESSIONS EN COURS"/>
    {MACHINES.map(m=><MachineCard key={m} machine={m} strains={strains}/>)}
  </div>
);



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
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{textAlign:"right"}}><Bdg col={mC2}>{MS[se.machine]||se.machine}</Bdg>{r&&<div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"DM Mono",marginTop:4}}>{r}%</div>}</div>
                      <button onClick={async()=>{
                        if(!confirm("Supprimer cette session ?"))return;
                        try{
                          await sbFetch(`washes?session_id=eq.${se.id}`,{method:"DELETE",prefer:"return=minimal"});
                          await sbFetch(`pesees?session_id=eq.${se.id}`,{method:"DELETE",prefer:"return=minimal"});
                          await sbFetch(`sessions?id=eq.${se.id}`,{method:"DELETE",prefer:"return=minimal"});
                          const[newS,newW]=await Promise.all([sbFetch("sessions?select=*&order=date.asc"),sbFetch("washes?select=*")]);
                          ss(newS||[]);sw(newW||[]);sDrw(null);
                        }catch(e){alert("Erreur: "+e.message);}
                      }} style={{width:32,height:32,borderRadius:8,background:T.danger+"22",border:`1px solid ${T.danger}44`,color:T.danger,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                    </div>
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
const CatalogueModal=({sel,selSt,selC,sessions,pesees,getR,fRef,upload,editing,sEd,ed,sED,saving,saveEdit,sSel,TYPES_PRODUIT})=>{
  const[prodTab,setProdTab]=useState("wpff");
  const r=getR(sel);
  const rec=r&&parseFloat(r)>4;
  const seSel=sessions.filter(s=>s.strain===sel);
  const peSel=pesees.filter(p=>seSel.find(s=>s.id===p.session_id));
  const byMicron={};peSel.forEach(p=>{if(!byMicron[p.micron])byMicron[p.micron]=0;byMicron[p.micron]+=parseFloat(p.poids_sec_g)||0;});
  return(
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
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["wpff","🧊 WPFF"],["rosin","🔥 Live Rosin"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setProdTab(id)} style={{flex:1,padding:"10px",borderRadius:12,fontWeight:800,fontSize:13,background:prodTab===id?selC+"33":T.bg3,color:prodTab===id?selC:T.dim,border:`2px solid ${prodTab===id?selC:T.border}`}}>{lbl}</button>
            ))}
          </div>
          {prodTab==="wpff"&&(
            <div style={{marginBottom:16}}>
              <div style={{textAlign:"center",marginBottom:14,background:T.bg3,borderRadius:14,padding:"14px",border:`1px solid ${selC}44`}}>
                <div style={{fontSize:9,color:T.dim,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:6}}>Rendement WPFF</div>
                <div style={{fontSize:48,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:selC,animation:rec?"rglow 2s infinite":"none"}}>{r?`${r}%`:"—"}</div>
                <div style={{fontSize:10,color:T.dim,marginTop:4}}>Ice Water Hash · FreezeDryer</div>
              </div>
              {Object.keys(byMicron).length>0&&(
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {Object.entries(byMicron).filter(([m])=>m!=="160µ").map(([mic,po])=>(
                    <div key={mic} style={{flex:1,background:T.bg3,borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${selC}22`}}>
                      <div style={{fontSize:9,color:T.dim,marginBottom:3}}>{mic}</div>
                      <div style={{fontSize:16,fontWeight:800,color:T.gold,fontFamily:"DM Mono"}}>{po.toFixed(1)}g</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {prodTab==="rosin"&&(
            <div style={{marginBottom:16}}>
              <div style={{textAlign:"center",marginBottom:14,background:T.bg3,borderRadius:14,padding:"24px",border:`1px solid ${T.gold}33`}}>
                <div style={{fontSize:9,color:T.dim,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>Rendement Live Rosin</div>
                <div style={{fontSize:22,fontWeight:700,color:T.gold,marginBottom:6}}>À venir</div>
                <div style={{fontSize:11,color:T.dim}}>Fabriqué à partir du WPFF (90µ / 45µ)</div>
                <div style={{fontSize:11,color:T.dim,marginTop:4}}>ou du 160µ blend multi-strains</div>
              </div>
              <div style={{background:T.bg3,borderRadius:12,padding:"14px",border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.dim,marginBottom:6}}>160µ WPFF disponible</div>
                {byMicron["160µ"]
                  ?<div style={{fontSize:22,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}}>{byMicron["160µ"].toFixed(1)}g</div>
                  :<div style={{fontSize:13,color:T.dim,fontStyle:"italic"}}>Aucune pesée 160µ enregistrée</div>
                }
              </div>
            </div>
          )}
          {editing===sel?(
            <Crd s={{border:`1px solid ${selC}44`}}>
              <STL icon="✏" text="MODIFIER" col={selC}/>
              <Fld label="Génétique"><input value={ed.genetique||""} onChange={e=>sED(x=>({...x,genetique:e.target.value}))} placeholder="Ex: GMO x Triangle Kush"/></Fld>
              <Fld label="Odeur"><input value={ed.odeur||""} onChange={e=>sED(x=>({...x,odeur:e.target.value}))} placeholder="Ex: Terreuse, fruitée..."/></Fld>
              <Fld label="Goût"><input value={ed.gout||""} onChange={e=>sED(x=>({...x,gout:e.target.value}))} placeholder="Ex: Diesel, floral..."/></Fld>
              <div style={{marginBottom:14}}>
                <Lbl c="Mode de cure"/>
                <button onClick={()=>sED(x=>({...x,mode_cure:"FreezeDryer"}))} style={{padding:"10px 18px",borderRadius:10,fontWeight:700,fontSize:13,background:ed.mode_cure==="FreezeDryer"?selC+"44":T.bg3,color:ed.mode_cure==="FreezeDryer"?T.white:T.dim,border:`2px solid ${ed.mode_cure==="FreezeDryer"?selC:T.border}`}}>FreezeDryer</button>
              </div>
              <div style={{marginBottom:14}}>
                <Lbl c="Type produit"/>
                <div style={{display:"flex",gap:8}}>
                  {TYPES_PRODUIT.map(t=><button key={t} onClick={()=>sED(x=>({...x,type_produit:t}))} style={{flex:1,padding:"10px",borderRadius:10,fontWeight:700,fontSize:13,background:ed.type_produit===t?selC+"44":T.bg3,color:ed.type_produit===t?T.white:T.dim,border:`2px solid ${ed.type_produit===t?selC:T.border}`}}>{t}</button>)}
                </div>
              </div>
              <Fld label="Notes"><textarea value={ed.notes||""} onChange={e=>sED(x=>({...x,notes:e.target.value}))} rows={3} style={{resize:"none"}}/></Fld>
              <div style={{display:"flex",gap:10}}>
                <BOL c="Annuler" onClick={()=>sEd(null)} col={T.dim}/>
                <Btn c={saving?"Sauvegarde...":"💾 Sauvegarder"} onClick={saveEdit} disabled={saving} col={selC}/>
              </div>
            </Crd>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {[["Odeur",selSt.odeur||"—"],["Goût",selSt.gout||"—"],["Cure",selSt.mode_cure||"FreezeDryer"],["Sessions",seSel.length]].map(([l,v])=>(
                  <div key={l} style={{background:T.bg3,borderRadius:12,padding:"12px 14px",borderLeft:`2px solid ${selC}66`}}>
                    <div style={{fontSize:9,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:15,fontWeight:700,color:T.white}}>{v}</div>
                  </div>
                ))}
              </div>
              {selSt.notes&&<div style={{background:T.bg3,borderRadius:12,padding:14,marginBottom:14}}><div style={{fontSize:9,color:T.dim,marginBottom:4}}>NOTES</div><div style={{fontSize:13,color:T.ink,fontStyle:"italic"}}>{selSt.notes}</div></div>}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{sEd(sel);sED({odeur:selSt.odeur||"",gout:selSt.gout||"",mode_cure:selSt.mode_cure||"",notes:selSt.notes||"",genetique:selSt.genetique||"",type_produit:selSt.type_produit||""});}} style={{flex:1,padding:"13px",borderRadius:12,background:selC+"22",border:`1.5px solid ${selC}`,color:selC,fontWeight:700,fontSize:14}}>✏ Modifier</button>
                <button onClick={()=>sSel(null)} style={{flex:1,padding:"13px",borderRadius:12,background:"transparent",border:`1.5px solid ${T.border}`,color:T.dim,fontWeight:700,fontSize:14}}>✕ Fermer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── CATALOGUE SECTION (intégrée dans Dashboard) ───────────────────────────────
const CatalogueSection=()=>{
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

  if(loading)return null;
  const selSt=sel?allSt.find(s=>(s.nom||s)===sel):null;
  const selC=selSt?SC[allSt.indexOf(selSt)%SC.length]:T.orange;

  return(
    <div style={{marginTop:24}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <STL icon="🏺" text="CATALOGUE" col={T.gold}/>
        <button onClick={()=>sShP(x=>!x)} style={{background:T.gold+"22",border:`1px solid ${T.gold}44`,borderRadius:10,padding:"6px 14px",color:T.gold,fontWeight:700,fontSize:11}}>⚖ Pesées</button>
      </div>
      {showP&&(
        <Crd s={{marginBottom:16,border:`1px solid ${T.gold}44`}}>
          <STL icon="⚖" text="PESÉES FREEZE DRYER" col={T.gold}/>
          <Fld label="Strain"><select value={nP.strain} onChange={e=>sNP(x=>({...x,strain:e.target.value}))}><option value="">Sélectionner...</option>{allSt.map(s=><option key={s.nom||s}>{s.nom||s}</option>)}</select></Fld>
          <Fld label="90µ — Poids (g)">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>sNP(x=>({...x,m90:Math.max(0,parseFloat(x.m90||0)-0.1).toFixed(1)}))} style={{width:44,height:44,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700,flexShrink:0}}>−</button>
              <input type="number" value={nP.m90} onChange={e=>sNP(x=>({...x,m90:e.target.value}))} style={{textAlign:"center",fontSize:22,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}} min="0" step="0.1"/>
              <button onClick={()=>sNP(x=>({...x,m90:parseFloat((parseFloat(x.m90||0)+0.1).toFixed(1))}))} style={{width:44,height:44,borderRadius:10,background:T.orange,color:"#fff",fontSize:20,fontWeight:700,flexShrink:0}}>+</button>
            </div>
          </Fld>
          <Fld label="45µ / FS — Poids (g)">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>sNP(x=>({...x,m45:Math.max(0,parseFloat(x.m45||0)-0.1).toFixed(1)}))} style={{width:44,height:44,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700,flexShrink:0}}>−</button>
              <input type="number" value={nP.m45} onChange={e=>sNP(x=>({...x,m45:e.target.value}))} style={{textAlign:"center",fontSize:22,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}} min="0" step="0.1"/>
              <button onClick={()=>sNP(x=>({...x,m45:parseFloat((parseFloat(x.m45||0)+0.1).toFixed(1))}))} style={{width:44,height:44,borderRadius:10,background:T.orange,color:"#fff",fontSize:20,fontWeight:700,flexShrink:0}}>+</button>
            </div>
          </Fld>
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
      {sel&&selSt&&<CatalogueModal sel={sel} selSt={selSt} selC={selC} sessions={sessions} pesees={pesees} getR={getR} fRef={fRef} upload={upload} editing={editing} sEd={sEd} ed={ed} sED={sED} saving={saving} saveEdit={saveEdit} sSel={sSel} TYPES_PRODUIT={TYPES_PRODUIT}/>}
    </div>
  );
};

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

  const edit=(st)=>{sEd(st.nom||st);sED({odeur:st.odeur||"",gout:st.gout||"",mode_cure:st.mode_cure||"",notes:st.notes||"",genetique:st.genetique||"",type_produit:st.type_produit||""});};

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
          <Fld label="90µ — Poids (g)">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>sNP(x=>({...x,m90:Math.max(0,parseFloat(x.m90||0)-0.1).toFixed(1)}))} style={{width:44,height:44,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700,flexShrink:0}}>−</button>
              <input type="number" value={nP.m90} onChange={e=>sNP(x=>({...x,m90:e.target.value}))} style={{textAlign:"center",fontSize:22,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}} min="0" step="0.1"/>
              <button onClick={()=>sNP(x=>({...x,m90:parseFloat((parseFloat(x.m90||0)+0.1).toFixed(1))}))} style={{width:44,height:44,borderRadius:10,background:T.orange,color:"#fff",fontSize:20,fontWeight:700,flexShrink:0}}>+</button>
            </div>
          </Fld>
          <Fld label="45µ / FS — Poids (g)">
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>sNP(x=>({...x,m45:Math.max(0,parseFloat(x.m45||0)-0.1).toFixed(1)}))} style={{width:44,height:44,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700,flexShrink:0}}>−</button>
              <input type="number" value={nP.m45} onChange={e=>sNP(x=>({...x,m45:e.target.value}))} style={{textAlign:"center",fontSize:22,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}} min="0" step="0.1"/>
              <button onClick={()=>sNP(x=>({...x,m45:parseFloat((parseFloat(x.m45||0)+0.1).toFixed(1))}))} style={{width:44,height:44,borderRadius:10,background:T.orange,color:"#fff",fontSize:20,fontWeight:700,flexShrink:0}}>+</button>
            </div>
          </Fld>
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

      {sel&&selSt&&<CatalogueModal sel={sel} selSt={selSt} selC={selC} sessions={sessions} pesees={pesees} getR={getR} fRef={fRef} upload={upload} editing={editing} sEd={sEd} ed={ed} sED={sED} saving={saving} saveEdit={saveEdit} sSel={sSel} TYPES_PRODUIT={TYPES_PRODUIT}/>}
    </div>
  );
};

// ── UTILISATEURS ─────────────────────────────────────────────────────────────
const Utilisateurs=()=>{
  const[events,setEvents]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    sbFetch("analytics_events?select=*&order=created_at.desc&limit=500")
      .then(d=>setEvents(d||[])).catch(()=>setEvents([])).finally(()=>setLoading(false));
  },[]);

  const totalEvents=events.length;
  const uniqueUsers=new Set(events.map(e=>e.user_id).filter(Boolean)).size;
  const byType=events.reduce((acc,e)=>{acc[e.event_type]=(acc[e.event_type]||0)+1;return acc;},{});
  const byProdType=events.filter(e=>e.product_type).reduce((acc,e)=>{acc[e.product_type]=(acc[e.product_type]||0)+1;return acc;},{});
  const totalProd=Object.values(byProdType).reduce((a,b)=>a+b,0)||1;

  const funnelSteps=[
    {key:"view_product",label:"Vue produit",icon:"👁"},
    {key:"click_wpff",label:"Click WPFF",icon:"🌿"},
    {key:"click_rosin",label:"Click Rosin",icon:"🔥"},
    {key:"start_payment",label:"Paiement initié",icon:"💳"},
    {key:"complete_payment",label:"Paiement complété",icon:"✅"},
  ];
  const maxFunnel=Math.max(1,...funnelSteps.map(s=>byType[s.key]||0));

  if(loading)return<Load/>;

  return(
    <div style={{padding:"0 14px",paddingBottom:100,animation:"fadeIn 0.3s"}}>
      <STL icon="👥" text="ANALYTICS SENZUONEBOT"/>
      {totalEvents===0?(
        <Crd>
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:40,marginBottom:16}}>📡</div>
            <div style={{fontSize:16,fontWeight:800,color:T.white,marginBottom:8}}>En attente de données</div>
            <div style={{fontSize:12,color:T.dim,lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>
              Les analytics apparaîtront ici dès que le dev de SenzuOneBot enverra des events vers la table <span style={{color:T.gold,fontFamily:"DM Mono",fontSize:11}}>analytics_events</span>.
            </div>
            <div style={{marginTop:20,background:T.bg3,borderRadius:12,padding:14,textAlign:"left",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Table SQL requise</div>
              <div style={{fontFamily:"DM Mono",fontSize:10,color:T.gold,lineHeight:1.8}}>
                analytics_events<br/>
                ├ user_id · event_type<br/>
                ├ product_nom · product_type<br/>
                └ session_id · metadata
              </div>
            </div>
          </div>
        </Crd>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[[uniqueUsers,"Utilisateurs uniques",T.purple],[totalEvents,"Events totaux",T.orange]].map(([v,l,c])=>(
              <Crd key={l} s={{textAlign:"center"}}>
                <div style={{fontSize:9,color:T.dim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{l}</div>
                <div style={{fontSize:36,fontWeight:800,fontFamily:"DM Mono",color:c,lineHeight:1}}>{v}</div>
              </Crd>
            ))}
          </div>
          {totalProd>1&&(
            <Crd s={{marginBottom:12}}>
              <STL icon="📊" text="INTÉRÊT PRODUIT" col={T.gold}/>
              {Object.entries(byProdType).sort((a,b)=>b[1]-a[1]).map(([type,cnt],i)=>(
                <div key={type} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:13,color:T.white,fontWeight:700}}>{type}</span>
                    <span style={{fontSize:13,color:SC[i%SC.length],fontWeight:800,fontFamily:"DM Mono"}}>{((cnt/totalProd)*100).toFixed(0)}% · {cnt}</span>
                  </div>
                  <div style={{height:6,background:T.border,borderRadius:3}}><div style={{height:"100%",width:`${(cnt/totalProd)*100}%`,background:SC[i%SC.length],borderRadius:3,transition:"width 0.5s",boxShadow:`0 0 8px ${SC[i%SC.length]}66`}}/></div>
                </div>
              ))}
            </Crd>
          )}
          <Crd>
            <STL icon="🔽" text="FUNNEL DE CONVERSION" col={T.green}/>
            {funnelSteps.map((step,i)=>{
              const cnt=byType[step.key]||0;
              const pct=maxFunnel>0?((cnt/maxFunnel)*100):0;
              return(
                <div key={step.key} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:T.ink}}>{step.icon} {step.label}</span>
                    <span style={{fontSize:12,color:cnt>0?T.green:T.dim,fontWeight:700,fontFamily:"DM Mono"}}>{cnt}</span>
                  </div>
                  <div style={{height:5,background:T.border,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.green},${T.green}88)`,borderRadius:3,transition:"width 0.5s"}}/></div>
                </div>
              );
            })}
          </Crd>
        </>
      )}
    </div>
  );
};

// ── PIN SCREEN ────────────────────────────────────────────────────────────────
const PIN_CODE = "73698";
const PIN_LS   = "sz_auth";

const PinScreen = ({onUnlock}) => {
  const[input,setInput]=useState("");
  const[shake,setShake]=useState(false);
  const[unlocking,setUnlocking]=useState(false);

  const press=(d)=>{
    if(input.length>=5) return;
    const next=input+d;
    setInput(next);
    if(next.length===5){
      if(next===PIN_CODE){
        setUnlocking(true);
        setTimeout(()=>{ try{localStorage.setItem(PIN_LS,"1");}catch{} onUnlock(); },600);
      } else {
        setShake(true);
        setTimeout(()=>{ setInput(""); setShake(false); },700);
      }
    }
  };
  const del=()=>setInput(x=>x.slice(0,-1));

  return(
    <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 50% 0%,#1a050522,transparent 60%),#06060F`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:999,padding:24}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:48,marginBottom:12}}>🫛</div>
        <div style={{display:"flex",alignItems:"baseline",gap:4,justifyContent:"center",marginBottom:4}}>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#EAE8F0",letterSpacing:3,textShadow:`0 0 20px ${T.orange}66,2px 2px 0 ${T.orange}`}}>SENZU</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:T.orange,letterSpacing:8}}>ASIA</span>
        </div>
        <div style={{fontSize:10,color:T.dim,letterSpacing:"0.3em",textTransform:"uppercase"}}>Ice Water Hash Lab</div>
      </div>

      {/* Dots */}
      <div style={{display:"flex",gap:16,marginBottom:40,animation:shake?"shake 0.5s ease":"none"}}>
        {Array.from({length:5}).map((_,i)=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<input.length?(unlocking?T.green:T.orange):T.bg3,border:`2px solid ${i<input.length?(unlocking?T.green:T.orange):T.border}`,boxShadow:i<input.length?`0 0 12px ${unlocking?T.green:T.orange}`:"none",transition:"all 0.15s"}}/>
        ))}
      </div>

      {/* Keypad */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:"100%",maxWidth:280}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
          <button key={i} onClick={()=>{ if(k==="⌫")del(); else if(k!=="")press(String(k)); }}
            style={{height:72,borderRadius:16,fontSize:k==="⌫"?22:24,fontWeight:700,fontFamily:"DM Mono",
              background:k===""?"transparent":T.bg3,
              color:k==="⌫"?T.dim:T.white,
              border:`1px solid ${k===""?"transparent":T.border}`,
              boxShadow:k!==""&&k!==""?"0 2px 10px #00000066":"none",
              opacity:k===""?0:1,
            }}>
            {k}
          </button>
        ))}
      </div>

      <div style={{marginTop:32,fontSize:11,color:T.dim,textAlign:"center"}}>Accès réservé aux membres</div>

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-6px);}80%{transform:translateX(6px);}}
      `}</style>
    </div>
  );
};

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const[screen,sScr]=useState("dashboard");
  const[strains,sSt]=useState([]);
  const[auth,setAuth]=useState(()=>{ try{return localStorage.getItem(PIN_LS)==="1";}catch{return false;} });

  useEffect(()=>{ if(auth) sbFetch("strains?select=*&order=nom.asc").then(d=>sSt(d||[])).catch(()=>{}); },[auth]);

  const screens={dashboard:<Dashboard/>,session:<Session strains={strains}/>,calendar:<Calendrier/>,utilisateurs:<Utilisateurs/>};

  if(!auth) return(
    <>
      <style>{CSS}</style>
      <PinScreen onUnlock={()=>setAuth(true)}/>
    </>
  );

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
