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
const SC = ["#FF1744","#FFB300","#00E676","#00E5FF","#D500F9","#FF6D00","#00BCD4","#FFD600","#F50057","#69F0AE"];

const T = { bg:"#090A0F",bg2:"#0D0E17",bg3:"#1A1A24",card:"rgba(20,20,30,0.65)",border:"rgba(255,255,255,0.07)",orange:"#FF1744",gold:"#FFB300",green:"#00E676",white:"#F8F9FA",dim:"rgba(248,249,250,0.35)",ink:"rgba(248,249,250,0.55)",danger:"#FF1744",aura:"#FFD700",purple:"#D500F9",cyan:"#00E5FF" };

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{background:#090A0F;color:#F8F9FA;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);}
input,select,textarea{background:#1A1A24;border:1px solid rgba(255,255,255,0.08);color:#F8F9FA;font-family:'Inter',sans-serif;font-size:15px;border-radius:10px;padding:12px 16px;width:100%;outline:none;-webkit-appearance:none;appearance:none;}
input:focus,select:focus,textarea:focus{border-color:#00E5FF;box-shadow:0 0 0 2px rgba(0,229,255,0.1);}
select option{background:#0D0E17;}
button{cursor:pointer;font-family:'Inter',sans-serif;border:none;outline:none;transition:all 0.2s cubic-bezier(0.25,0.8,0.25,1);}
.ww{overflow:hidden;position:relative;cursor:grab;user-select:none;}
.wi{display:flex;flex-direction:column;}
.witem{display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:700;flex-shrink:0;}
.wft{position:absolute;top:0;left:0;right:0;height:55px;background:linear-gradient(180deg,#1A1A24,transparent);pointer-events:none;z-index:3;}
.wfb{position:absolute;bottom:0;left:0;right:0;height:55px;background:linear-gradient(0deg,#1A1A24,transparent);pointer-events:none;z-index:3;}
.wsel{position:absolute;top:50%;left:8px;right:8px;height:44px;transform:translateY(-50%);border-top:1px solid rgba(0,229,255,0.3);border-bottom:1px solid rgba(0,229,255,0.3);pointer-events:none;z-index:2;border-radius:8px;background:rgba(0,229,255,0.04);}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes tpulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
@keyframes aura{0%,100%{box-shadow:0 0 20px #FFD70055,0 0 40px #FFD70022;}50%{box-shadow:0 0 40px #FFD700AA,0 0 80px #FFD70044;}}
@keyframes rglow{0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #FFD700;}50%{text-shadow:0 0 50px #FFD700,0 0 100px #FFD700;}}
@keyframes cglow{0%,100%{text-shadow:0 0 12px rgba(0,229,255,0.6);}50%{text-shadow:0 0 24px rgba(0,229,255,0.9),0 0 48px rgba(0,229,255,0.4);}}
@keyframes neon{0%,100%{opacity:1;}93%{opacity:0.8;}96%{opacity:0.9;}}
@keyframes pin{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes dup{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes min{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
.nt{animation:neon 4s infinite;text-shadow:0 0 12px currentColor,0 0 24px currentColor,0 0 48px currentColor;}
`;

// ── TIMER ──────────────────────────────────────────────────────────────────────
const LTK = (m) => `sz_t_${m.replace(/\s/g,"_")}`;
const TINIT = { duree:15, remaining:null, running:false, done:false, startedAt:null };
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
    const onVis=()=>{
      if(document.visibilityState==="visible"){
        const s=load();
        if(s.running&&s.startedAt&&s.remaining!=null){
          const e=Math.floor((Date.now()-s.startedAt)/1000);
          const nr=Math.max(0,s.remaining-e);
          setSt(x=>({...x,remaining:nr,done:nr===0,running:nr>0,startedAt:Date.now()}));
        }
      }
    };
    document.addEventListener("visibilitychange",onVis);
    window.addEventListener("focus",onVis);
    return()=>{document.removeEventListener("visibilitychange",onVis);window.removeEventListener("focus",onVis);};
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
  const start=(d)=>{
    setSt(s=>{
      const finalDuree=d!=null?d:s.duree;
      return{...s,duree:finalDuree,remaining:finalDuree*60,running:true,done:false,startedAt:Date.now()};
    });
  };
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
          <div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`}}/>
          <span style={{fontSize:11,fontWeight:700,color:c,letterSpacing:"0.1em",fontFamily:"'Oswald',sans-serif"}}>CHRONO {MS[machine]}</span>
        </div>
        <button onClick={onClose} style={{background:"transparent",color:T.dim,fontSize:18,border:"none"}}>✕</button>
      </div>

      {/* Sélecteur durée — uniquement si pas encore démarré */}
      {!running&&remaining===null&&!done&&(
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:T.dim,textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Durée</div>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
            <button onClick={()=>setD(Math.max(1,duree-1))} style={{width:40,height:40,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700}}>−</button>
            <div style={{fontSize:36,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:c,minWidth:80,textAlign:"center"}}>{String(duree).padStart(2,"0")} min</div>
            <button onClick={()=>setD(Math.min(60,duree+1))} style={{width:40,height:40,borderRadius:10,background:c,color:"#fff",fontSize:20,fontWeight:700}}>+</button>
          </div>
        </div>
      )}

      {/* Affichage timer en cours */}
      {(running||remaining!=null||done)&&(
        <div style={{textAlign:"center",margin:"10px 0 14px"}}>
          <div style={{fontSize:52,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:done?c:running?T.white:T.dim,animation:done?"tpulse 0.8s infinite":"none",textShadow:running?`0 0 20px ${c}44`:"none"}}>
            {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
          </div>
          {done&&<div style={{color:c,fontWeight:700,fontSize:13,marginTop:6}}>⚡ WASH TERMINÉ</div>}
          {running&&!done&&<div style={{marginTop:10,height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${c},${c}88)`,borderRadius:2,transition:"width 1s linear"}}/></div>}
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        {!running&&!done&&<button onClick={()=>start()} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:700,fontSize:13,background:`linear-gradient(135deg,${c}33,${c}11)`,border:`1px solid ${c}66`,color:c}}>▶ Démarrer</button>}
        {running&&<button onClick={stop} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:700,fontSize:13,background:"transparent",color:T.danger,border:`1px solid ${T.danger}44`}}>⏹ Stop</button>}
        {(done||remaining!=null)&&<button onClick={reset} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:600,fontSize:13,background:"transparent",color:T.dim,border:`1px solid ${T.border}`}}>↺ Reset</button>}
      </div>
    </div>
  );
};

// ── TIMER CONTEXT GLOBAL ──────────────────────────────────────────────────────
const TimerContext = React.createContext({});

const TimerProvider=({children})=>{
  const t1=useTimer("Machine 1");
  const t2=useTimer("Machine 2");
  const t3=useTimer("Machine 3");
  const timers={"Machine 1":t1,"Machine 2":t2,"Machine 3":t3};
  return <TimerContext.Provider value={timers}>{children}</TimerContext.Provider>;
};

const FloatingTimers=()=>{
  const timers=React.useContext(TimerContext);
  const[exp,setExp]=useState(null);
  const[,tick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>tick(x=>x+1),1000);return()=>clearInterval(t);},[]);
  const active=MACHINES.filter(m=>{const t=timers[m];return t&&(t.running||t.done||t.remaining!=null);});
  if(active.length===0&&!exp)return null;
  return(
    <>
      <div style={{position:"fixed",top:60,right:8,zIndex:300,display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end",pointerEvents:"none"}}>
        {active.map(machine=>{
          const t=timers[machine];
          const c=MC[machine]||T.orange;
          const m=t.remaining!=null?Math.floor(t.remaining/60):t.duree||0;
          const s=t.remaining!=null?t.remaining%60:0;
          const p=t.remaining!=null&&t.duree?(t.remaining/(t.duree*60))*100:100;
          return(
            <button key={machine} onClick={()=>setExp(exp===machine?null:machine)} style={{pointerEvents:"all",background:`${T.bg2}F2`,border:`2px solid ${t.done?c:t.running?c:c+"55"}`,borderRadius:12,padding:"5px 10px 5px 8px",display:"flex",alignItems:"center",gap:7,backdropFilter:"blur(20px)",boxShadow:t.running?`0 0 16px ${c}44,0 2px 14px #00000099`:"0 2px 10px #00000088"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 6px ${c}`,animation:t.running?"tpulse 1s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:700,color:c,letterSpacing:"0.06em",fontFamily:"'Oswald',sans-serif"}}>{MS[machine]}</span>
              <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:15,fontWeight:700,color:t.done?c:t.running?T.white:T.dim,animation:t.done?"tpulse 0.8s infinite":"none"}}>
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
            <TimerPanelCtx machine={exp} onClose={()=>setExp(null)}/>
          </div>
        </div>
      )}
    </>
  );
};

const TimerPanelCtx=({machine,onClose})=>{
  const timers=React.useContext(TimerContext);
  const t=timers[machine];
  if(!t)return null;
  const c=MC[machine]||T.orange;
  const m=t.remaining!=null?Math.floor(t.remaining/60):t.duree;
  const s=t.remaining!=null?t.remaining%60:0;
  const p=t.remaining!=null?(t.remaining/(t.duree*60))*100:100;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`}}/>
          <span style={{fontSize:11,fontWeight:700,color:c,letterSpacing:"0.1em",fontFamily:"'Oswald',sans-serif"}}>CHRONO {MS[machine]}</span>
        </div>
        <button onClick={onClose} style={{background:"transparent",color:T.dim,fontSize:18,border:"none"}}>✕</button>
      </div>
      {!t.running&&t.remaining===null&&!t.done&&(
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:T.dim,textAlign:"center",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Durée</div>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
            <button onClick={()=>t.setD(Math.max(1,t.duree-1))} style={{width:40,height:40,borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:20,fontWeight:700}}>−</button>
            <div style={{fontSize:36,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:c,minWidth:80,textAlign:"center"}}>{String(t.duree).padStart(2,"0")} min</div>
            <button onClick={()=>t.setD(Math.min(60,t.duree+1))} style={{width:40,height:40,borderRadius:10,background:c,color:"#fff",fontSize:20,fontWeight:700}}>+</button>
          </div>
        </div>
      )}
      {(t.running||t.remaining!=null||t.done)&&(
        <div style={{textAlign:"center",margin:"10px 0 14px"}}>
          <div style={{fontSize:52,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:t.done?c:t.running?T.white:T.dim,animation:t.done?"tpulse 0.8s infinite":"none"}}>
            {String(m).padStart(2,"0")}:{String(s).padStart(2,"0")}
          </div>
          {t.done&&<div style={{color:c,fontWeight:700,fontSize:13,marginTop:6}}>⚡ WASH TERMINÉ</div>}
          {t.running&&!t.done&&<div style={{marginTop:10,height:4,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${c},${c}88)`,borderRadius:2,transition:"width 1s linear"}}/></div>}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        {!t.running&&!t.done&&<button onClick={()=>t.start()} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:700,fontSize:13,background:`linear-gradient(135deg,${c}33,${c}11)`,border:`1px solid ${c}66`,color:c}}>▶ Démarrer</button>}
        {t.running&&<button onClick={t.stop} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:700,fontSize:13,background:"transparent",color:T.danger,border:`1px solid ${T.danger}44`}}>⏹ Stop</button>}
        {(t.done||t.remaining!=null)&&<button onClick={t.reset} style={{flex:1,padding:"11px",borderRadius:10,fontWeight:600,fontSize:13,background:"transparent",color:T.dim,border:`1px solid ${T.border}`}}>↺ Reset</button>}
      </div>
    </div>
  );
};

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
const NAV=[{id:"dashboard",icon:"⛩️",label:"Dashboard"},{id:"session",icon:"🏮",label:"Session"},{id:"calendar",icon:"🪷",label:"Calendrier"},{id:"utilisateurs",icon:"👥",label:"Utilisateurs"}];
const NavBar=({active,onNav})=>(
  <nav style={{position:"fixed",bottom:0,zIndex:100,background:"rgba(9,10,15,0.88)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-around",padding:"10px 0 max(18px,env(safe-area-inset-bottom))",left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:768}}>
    {NAV.map(n=>(
      <button key={n.id} onClick={()=>onNav(n.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 14px",opacity:active===n.id?1:0.4,transition:"all 0.2s"}}>
        <span style={{fontSize:active===n.id?22:18,transition:"font-size 0.2s"}}>{n.icon}</span>
        <span style={{fontSize:9,color:active===n.id?T.cyan:T.dim,fontWeight:active===n.id?700:400,letterSpacing:0.6,textTransform:"uppercase",fontFamily:"'Inter',sans-serif",textShadow:active===n.id?`0 0 8px ${T.cyan}88`:"none"}}>{n.label}</span>
        {active===n.id&&<div style={{width:20,height:2,background:T.cyan,borderRadius:1,boxShadow:`0 0 8px ${T.cyan}`}}/>}
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
      <div style={{background:"rgba(9,10,15,0.85)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"center",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:24}}>🫛</div>
        <div style={{textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"baseline",gap:6,justifyContent:"center"}}>
            <span className="nt" style={{fontFamily:"'Oswald',sans-serif",fontSize:28,fontWeight:700,color:T.white,letterSpacing:4}}> SENZU</span>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:28,fontWeight:700,color:T.cyan,letterSpacing:8,textShadow:`0 0 12px ${T.cyan}66`}}>ASIA</span>
          </div>
          <div style={{fontSize:7,color:T.dim,letterSpacing:"0.35em",textTransform:"uppercase",marginTop:-2}}>Ice Water Hash Lab</div>
        </div>
        <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
          <div style={{fontSize:9,color:T.dim,fontFamily:"'Rajdhani',sans-serif"}}>{t.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}</div>
          <button onClick={()=>setShowCode(x=>!x)} style={{background:"transparent",border:"none",fontSize:14,opacity:0.4,lineHeight:1,padding:0,color:T.gold}}>🔑</button>
        </div>
      </div>
      {showCode&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:"#000000CC"}} onClick={()=>setShowCode(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:70,right:12,width:220,background:"rgba(20,20,30,0.95)",border:`1px solid ${T.gold}44`,borderRadius:16,padding:20,boxShadow:`0 8px 40px #000000CC, 0 0 20px ${T.gold}22`,animation:"min 0.2s ease",backdropFilter:"blur(20px)"}}>
            <div style={{fontSize:9,color:T.dim,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>Code Senzu. du jour</div>
            <div style={{fontSize:38,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:T.gold,letterSpacing:6,textAlign:"center",textShadow:`0 0 20px ${T.gold}66`}}>{code}</div>
            <div style={{fontSize:8,color:T.dim,textAlign:"center",marginTop:8}}>Valable jusqu'à minuit</div>
            <div style={{width:"100%",height:1,background:"rgba(255,255,255,0.06)",margin:"12px 0"}}/>
            <div style={{fontSize:8,color:T.dim,textAlign:"center",letterSpacing:"0.1em"}}>🔒 Réservé aux membres Senzu Asia</div>
          </div>
        </div>
      )}
    </>
  );
};
const Lbl=({c})=><div style={{fontSize:9,fontWeight:600,color:T.dim,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Inter',sans-serif"}}>{c}</div>;
const Fld=({label,children})=><div style={{marginBottom:14}}><Lbl c={label}/>{children}</div>;
const Btn=({c:children,onClick,col=T.cyan,disabled,s={}})=><button onClick={onClick} disabled={disabled} style={{background:disabled?"rgba(255,255,255,0.05)":`linear-gradient(135deg,${col}22,${col}11)`,color:disabled?T.dim:col,fontWeight:700,fontSize:14,padding:"13px 24px",borderRadius:10,width:"100%",border:`1px solid ${disabled?"rgba(255,255,255,0.05)":col+"66"}`,boxShadow:disabled?"none":`0 0 12px ${col}22`,opacity:disabled?0.5:1,letterSpacing:"0.05em",...s}}>{children}</button>;
const BOL=({c:children,onClick,col=T.dim,s={}})=><button onClick={onClick} style={{background:"transparent",color:col,border:`1px solid ${col}44`,fontWeight:600,fontSize:13,padding:"12px 20px",borderRadius:10,width:"100%",...s}}>{children}</button>;
const Bdg=({c:children,col=T.gold})=><span style={{background:col+"18",color:col,border:`1px solid ${col}33`,borderRadius:5,padding:"2px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
const Crd=({children,s={},glow,col})=><div style={{background:"rgba(20,20,30,0.65)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:glow?`1px solid ${(col||T.cyan)+"44"}`:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",borderTop:glow?`1px solid ${(col||T.cyan)+"66"}`:"1px solid rgba(255,255,255,0.09)",...s}}>{children}</div>;
const STL=({icon,text,col=T.cyan})=>(
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
    <div style={{width:3,height:18,background:col,borderRadius:2,boxShadow:`0 0 8px ${col}88`}}/>
    <span style={{fontSize:11,fontWeight:700,color:col,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Oswald',sans-serif"}}>{icon} {text}</span>
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

      {/* ── SESSIONS EN COURS (Freeze Dryer) ── */}
      {(()=>{
        const strainNames=[...new Set(sessions.map(s=>s.strain).filter(Boolean))];
        const inProgress=strainNames.filter(nom=>{
          const se=sessions.filter(s=>s.strain===nom);
          const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));
          return pe.length===0;
        });
        if(inProgress.length===0)return null;
        return(
          <Crd s={{marginBottom:16,border:`1px solid ${T.gold}33`}}>
            <STL icon="⏳" text="EN COURS — FREEZE DRYER" col={T.gold}/>
            {inProgress.map(nom=>(
              <div key={nom} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:13,color:T.white,fontWeight:600}}>{nom}</span>
                <span style={{fontSize:10,color:T.gold,fontWeight:700,background:"#2a1f0a",border:`1px solid ${T.gold}44`,borderRadius:5,padding:"2px 8px"}}>⏳ En cours</span>
              </div>
            ))}
          </Crd>
        );
      })()}

      {/* ── CATALOGUE SECTION ── */}
      <CatalogueSection/>
    </div>
  );
};

// ── SESSION ───────────────────────────────────────────────────────────────────
const eW=(n)=>({numero:n,micron:"",glace:"—",vitesse:"",duree_min:15,couleur_wash:"",texture:"",contaminants:false,notes:""});
const eMach=(machine)=>({machine,strain:"",biomasse_kg:8,type_biomasse:"Fresh Frozen",nb_sacs:16,heure_debut:"",heure_fin:"",notes:"",washes:Array.from({length:20},(_,i)=>eW(i+1)),currentWash:1});
const LSK_M=(m)=>`sz_m_${m.replace(/\s/g,"_")}`;

const StrainSelector=({value,onChange,strainNames,onDelete})=>{
  const[showNew,setShowNew]=useState(false);
  const[newName,setNewName]=useState("");
  const[saving,setSaving]=useState(false);
  const[open,setOpen]=useState(false);

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
      <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nom de la strain..." style={{fontSize:14,padding:"8px 12px"}}/>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>{setShowNew(false);setNewName("");}} style={{flex:1,padding:"8px",borderRadius:8,background:"transparent",border:`1px solid ${T.border}`,color:T.dim,fontSize:12}}>Annuler</button>
        <button onClick={saveNew} disabled={saving||!newName.trim()} style={{flex:1,padding:"8px",borderRadius:8,background:T.cyan,color:"#000",fontSize:12,fontWeight:700,opacity:saving||!newName.trim()?0.5:1}}>{saving?"...":"✓ Créer"}</button>
      </div>
    </div>
  );

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
                },700);}}
                onTouchEnd={()=>{clearTimeout(timer);}}>
                <button onClick={()=>{onChange(s);setOpen(false);}} style={{background:"none",color:value===s?T.orange:T.white,fontSize:14,fontWeight:value===s?700:400,flex:1,textAlign:"left"}}>
                  {value===s&&"✓ "}{s}
                </button>
                <span style={{fontSize:9,color:T.dim}}>Appui long pour supprimer</span>
              </div>
            );
          })}
          <div onClick={()=>{setOpen(false);setShowNew(true);}} style={{padding:"12px 16px",color:T.cyan,fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Nouvelle strain</div>
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
  const[open,setOpen]=useState(false);
  const[saving,setSaving]=useState(false);
  const timers=React.useContext(TimerContext);
  const timer=timers[machine]||{duree:15,remaining:null,running:false,done:false,start:()=>{},stop:()=>{},reset:()=>{},setD:()=>{}};

  useEffect(()=>{try{localStorage.setItem(lsk,JSON.stringify(data));}catch{}},[data]);
  const sF=(k,v)=>setData(d=>({...d,[k]:v}));
  const sW=(i,k,v)=>setData(d=>{const w=[...d.washes];w[i]={...w[i],[k]:v};return{...d,washes:w};});
  const curW=data.currentWash||1;
  const curWData=data.washes[curW-1]||eW(curW);
  const strainNames=strains.length>0?[...new Set(strains.map(s=>s.nom||s))]:[];
  const timerMins=timer&&timer.remaining!=null?Math.floor(timer.remaining/60):timer?.duree||15;
  const timerSecs=timer&&timer.remaining!=null?timer.remaining%60:0;
  const timerOn=timer?.running||false;

  const saveSession=async()=>{
    if(!data.strain){alert("Strain requis.");return;}
    setSaving(true);
    try{
      const[row]=await sbFetch("sessions",{method:"POST",body:JSON.stringify({machine,strain:data.strain,biomasse_kg:parseFloat(data.biomasse_kg)||null,type_biomasse:data.type_biomasse,nb_sacs:parseInt(data.nb_sacs)||null,heure_debut:data.heure_debut||null,heure_fin:data.heure_fin||null,statut:"cloture",date:new Date().toISOString().slice(0,10),notes:data.notes||null})});
      const validW=data.washes.filter(w=>w.micron);
      if(validW.length>0)await sbFetch("washes",{method:"POST",prefer:"return=minimal",body:JSON.stringify(validW.map(w=>({session_id:row.id,numero:w.numero,micron:w.micron,glace:w.glace||null,vitesse:w.vitesse||null,duree_min:w.duree_min||null,couleur_wash:w.couleur_wash||null,texture:w.texture||null,contaminants:w.contaminants,notes:w.notes||null})))});
      localStorage.removeItem(lsk);setData(eMach(machine));setOpen(false);
      alert(`✅ Session ${short} sauvegardée !`);
    }catch(e){alert("Erreur: "+e.message);}
    finally{setSaving(false);}
  };

  return(
    <>
      {/* ── CARD PRINCIPALE — 2 colonnes ── */}
      <div style={{background:`rgba(20,20,30,0.7)`,backdropFilter:"blur(12px)",border:`1px solid ${color}33`,borderTop:`1px solid ${color}66`,borderRadius:16,marginBottom:12,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
        {/* Header machine */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:timerOn?T.green:T.danger,boxShadow:`0 0 8px ${timerOn?T.green:T.danger}`,animation:timerOn?"tpulse 1s infinite":"none"}}/>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:color,letterSpacing:2}}>{short}</span>
          <div style={{display:"flex",background:T.bg3,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden",marginLeft:4}}>
            <div style={{padding:"3px 8px",fontSize:9,fontWeight:700,color:timerOn?T.dim:T.danger,background:timerOn?"transparent":T.danger+"22"}}>OFF</div>
            <div style={{padding:"3px 8px",fontSize:9,fontWeight:700,color:timerOn?T.green:T.dim,background:timerOn?T.green+"22":"transparent"}}>{timerOn?`${String(timerMins).padStart(2,"0")}:${String(timerSecs).padStart(2,"0")}`:"ON"}</div>
          </div>
          <div style={{marginLeft:"auto"}}>
            <button onClick={()=>setLocked(x=>!x)} style={{background:"transparent",border:"none",fontSize:18,opacity:locked?1:0.5}}>{locked?"🔒":"🔓"}</button>
          </div>
        </div>

        {/* Corps — 2 colonnes */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
          {/* Colonne gauche — données */}
          <div style={{padding:"12px 14px",borderRight:`1px solid rgba(255,255,255,0.06)`}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:8,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Strain</div>
              {locked
                ? <div style={{fontSize:15,fontWeight:700,color:T.white}}>{data.strain||"—"}</div>
                : <StrainSelector value={data.strain} onChange={v=>sF("strain",v)} strainNames={strainNames} onDelete={()=>sF("strain","")}/>
              }
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <div style={{fontSize:8,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Biomasse</div>
                {locked
                  ? <div style={{fontSize:15,fontWeight:700,color:color}}>{data.biomasse_kg} kg</div>
                  : <Step label="" value={parseFloat(data.biomasse_kg)||0} onChange={v=>sF("biomasse_kg",v)} step={0.5} max={50} unit=" kg"/>
                }
              </div>
              <div>
                <div style={{fontSize:8,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Wash</div>
                {locked
                  ? <div style={{fontSize:15,fontWeight:700,color:color}}>W{curW}</div>
                  : <Step label="" value={curW} onChange={v=>sF("currentWash",v)} min={1} max={20}/>
                }
              </div>
            </div>
            {!locked&&(
              <div style={{marginTop:8}}>
                <BgSel label="Type produit" value={data.type_biomasse} onChange={v=>sF("type_biomasse",v)} options={TYPES_BIOMASSE}/>
              </div>
            )}
          </div>

          {/* Colonne droite — chrono */}
          <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{fontSize:8,color:T.dim,letterSpacing:"0.15em",textTransform:"uppercase"}}>Chrono</div>
            <div style={{fontSize:40,fontWeight:700,fontFamily:"'Rajdhani',sans-serif",color:timerOn?T.green:T.dim,animation:timerOn?"tpulse 1s infinite":"none",textShadow:timerOn?`0 0 16px ${T.green}66`:"none",lineHeight:1}}>
              {String(timerMins).padStart(2,"0")}:{String(timerSecs).padStart(2,"0")}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {!timerOn&&<button onClick={()=>timer.start()} style={{padding:"6px 14px",borderRadius:8,background:T.green+"22",border:`1px solid ${T.green}44`,color:T.green,fontWeight:700,fontSize:12}}>▶ Start</button>}
              {timerOn&&<button onClick={()=>timer.stop()} style={{padding:"6px 14px",borderRadius:8,background:T.danger+"22",border:`1px solid ${T.danger}44`,color:T.danger,fontWeight:700,fontSize:12}}>⏹ Stop</button>}
              {(timer.remaining!=null||timer.done)&&<button onClick={()=>timer.reset()} style={{padding:"6px 10px",borderRadius:8,background:T.bg3,border:`1px solid ${T.border}`,color:T.dim,fontSize:12}}>↺</button>}
            </div>
            {timer.done&&<div style={{fontSize:11,color:T.green,fontWeight:700,animation:"tpulse 0.8s infinite"}}>⚡ TERMINÉ</div>}
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"10px 14px",borderTop:`1px solid rgba(255,255,255,0.06)`,display:"flex",gap:8,justifyContent:"flex-end"}}>
          {!locked&&<button onClick={()=>{setData(eMach(machine));localStorage.removeItem(lsk);}} style={{padding:"7px 14px",borderRadius:8,background:"transparent",border:`1px solid ${T.danger}44`,color:T.danger,fontSize:12,fontWeight:600}}>↺ Reset</button>}
          <button onClick={()=>setOpen(true)} style={{padding:"8px 20px",borderRadius:10,background:`linear-gradient(135deg,${color}33,${color}11)`,border:`1px solid ${color}66`,color,fontWeight:700,fontSize:13,letterSpacing:"0.05em"}}>WASH →</button>
        </div>
      </div>

      {/* ── MODAL — page unique scrollable ── */}
      {open&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"#000000BB"}} onClick={()=>setOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:0,left:0,right:0,background:T.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${color}44`,borderTop:`1px solid ${color}88`,maxHeight:"90vh",overflowY:"auto",animation:"dup 0.3s ease",paddingBottom:"max(24px,env(safe-area-inset-bottom))"}}>

            {/* Header sticky */}
            <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid rgba(255,255,255,0.06)`,position:"sticky",top:0,background:T.bg2,zIndex:10,backdropFilter:"blur(12px)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:color,letterSpacing:2}}>{short} — W{curW}</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {/* Nav washes */}
                <div style={{display:"flex",gap:3,flexWrap:"wrap",maxWidth:220}}>
                  {Array.from({length:Math.min(data.currentWash+1,20)},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>sF("currentWash",n)} style={{width:26,height:26,borderRadius:6,background:curW===n?color+"33":T.bg3,border:`1px solid ${curW===n?color:T.border}`,color:curW===n?color:T.dim,fontSize:10,fontWeight:700}}>W{n}</button>
                  ))}
                  {data.currentWash<20&&<button onClick={()=>sF("currentWash",data.currentWash+1)} style={{width:26,height:26,borderRadius:6,background:T.bg3,border:`1px solid ${T.cyan}44`,color:T.cyan,fontSize:14,fontWeight:700}}>+</button>}
                </div>
                <button onClick={()=>setOpen(false)} style={{width:30,height:30,borderRadius:8,background:T.bg3,border:`1px solid ${T.border}`,color:T.dim,fontSize:14,flexShrink:0}}>✕</button>
              </div>
            </div>

            <div style={{padding:"16px 16px"}}>
              {/* ── SECTION WASH ── */}
              <div style={{marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                  <div style={{width:3,height:16,background:color,borderRadius:2,boxShadow:`0 0 6px ${color}`}}/>
                  <span style={{fontSize:10,fontWeight:700,color:color,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Oswald',sans-serif"}}>💧 WASH {curW}</span>
                </div>
                <MultiMicron value={curWData.micron} onChange={v=>sW(curW-1,"micron",v)}/>
                <Fld label="Glace"><BgSel label="" value={curWData.glace||"—"} onChange={v=>sW(curW-1,"glace",v)} options={GLACE}/></Fld>
                <Fld label="Vitesse"><BgSel label="" value={curWData.vitesse} onChange={v=>sW(curW-1,"vitesse",v)} options={VITESSES}/></Fld>
              </div>

              {/* Séparateur */}
              <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"16px 0"}}/>

              {/* ── SECTION DATA ── */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                  <div style={{width:3,height:16,background:T.gold,borderRadius:2,boxShadow:`0 0 6px ${T.gold}`}}/>
                  <span style={{fontSize:10,fontWeight:700,color:T.gold,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Oswald',sans-serif"}}>📊 DATA WASH {curW}</span>
                </div>
                <BgSel label="Couleur du wash" value={curWData.couleur_wash} onChange={v=>sW(curW-1,"couleur_wash",v)} options={COULEURS}/>
                <BgSel label="Texture" value={curWData.texture} onChange={v=>sW(curW-1,"texture",v)} options={TEXTURES}/>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <button onClick={()=>sW(curW-1,"contaminants",!curWData.contaminants)} style={{width:26,height:26,borderRadius:7,border:`2px solid ${curWData.contaminants?T.danger:T.border}`,background:curWData.contaminants?T.danger+"33":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{curWData.contaminants&&<span style={{color:T.danger,fontSize:12}}>✓</span>}</button>
                  <span style={{fontSize:13,color:curWData.contaminants?T.danger:T.dim}}>Contaminants détectés</span>
                </div>
                <Fld label="Notes"><textarea value={curWData.notes||""} onChange={e=>sW(curW-1,"notes",e.target.value)} rows={2} style={{resize:"none"}}/></Fld>
              </div>

              {/* ── NAVIGATION + SAVE ── */}
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <button onClick={()=>{if(curW>1)sF("currentWash",curW-1);}} disabled={curW<=1} style={{flex:1,padding:"11px",borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`,color:curW>1?T.white:T.dim,fontWeight:600,fontSize:13,opacity:curW<=1?0.4:1}}>← W{curW-1}</button>
                <button onClick={()=>{if(curW<10)sF("currentWash",curW+1);}} style={{flex:1,padding:"11px",borderRadius:10,background:color+"22",border:`1px solid ${color}44`,color,fontWeight:600,fontSize:13}}>W{curW+1} →</button>
              </div>
              <div style={{borderTop:`1px solid rgba(255,255,255,0.06)`,paddingTop:12}}>
                <Btn c={saving?"Sauvegarde...":"💾 Fin de session — Sauvegarder"} onClick={saveSession} disabled={saving} col={T.green}/>
              </div>
            </div>
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
  const[hView,sHV]=useState("strain");
  const[hOpen,sHOpen]=useState(null);

  useEffect(()=>{
    Promise.all([sbFetch("sessions?select=*&order=date.asc"),sbFetch("washes?select=*,sessions(date,machine,strain,biomasse_kg)&order=created_at.desc")])
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

  // ── HISTORIQUE — groupements ──
  const histByStrain=useMemo(()=>{
    const m={};
    washes.forEach(w=>{
      const strain=w.sessions?.strain;
      if(!strain)return;
      if(!m[strain])m[strain]={count:0,washes:[]};
      m[strain].count++;m[strain].washes.push(w);
    });
    return m;
  },[washes]);

  const histByDate=useMemo(()=>{
    const m={};
    washes.forEach(w=>{
      const date=w.sessions?.date;
      if(!date)return;
      if(!m[date])m[date]={count:0,washes:[]};
      m[date].count++;m[date].washes.push(w);
    });
    return m;
  },[washes]);

  const histByMachine=useMemo(()=>{
    const m={};
    washes.forEach(w=>{
      const machine=w.sessions?.machine;
      if(!machine)return;
      if(!m[machine])m[machine]={count:0,washes:[]};
      m[machine].count++;m[machine].washes.push(w);
    });
    return m;
  },[washes]);

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
        <STL icon="📜" text="HISTORIQUE" col={T.cyan}/>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["strain","🌿 Strain"],["date","📅 Date"],["machine","⚙ Machine"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>sHV(id)} style={{flex:1,padding:"9px 4px",borderRadius:9,fontSize:12,fontWeight:700,background:hView===id?T.cyan+"22":T.bg3,color:hView===id?T.cyan:T.dim,border:`1px solid ${hView===id?T.cyan+"66":T.border}`}}>{lbl}</button>
          ))}
        </div>

        {hView==="strain"&&(
          <div>
            {Object.entries(histByStrain).sort((a,b)=>b[1].count-a[1].count).map(([strain,g])=>(
              <div key={strain} style={{marginBottom:10}}>
                <button onClick={()=>sHOpen(x=>x===strain?null:strain)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.white}}>{strain}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Bdg col={T.cyan}>{g.count}W</Bdg>
                    <span style={{color:T.dim,fontSize:11}}>{hOpen===strain?"▲":"▼"}</span>
                  </div>
                </button>
                {hOpen===strain&&(
                  <div style={{padding:"8px 4px"}}>
                    {g.washes.map(w=>(
                      <div key={w.id} style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",padding:"6px 8px",borderBottom:`1px solid ${T.border}`}}>
                        <Bdg col={T.orange}>W{w.numero}</Bdg>
                        <span style={{fontSize:10,color:T.dim}}>{w.sessions?.date}</span>
                        <Bdg col={MC[w.sessions?.machine]||T.dim}>{MS[w.sessions?.machine]}</Bdg>
                        {w.micron&&<Bdg>{w.micron}</Bdg>}
                        {w.couleur_wash&&<Bdg col={T.dim}>{w.couleur_wash}</Bdg>}
                        {w.contaminants&&<Bdg col={T.danger}>⚠</Bdg>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {Object.keys(histByStrain).length===0&&<div style={{textAlign:"center",color:T.dim,padding:20,fontSize:13}}>Aucune donnée</div>}
          </div>
        )}

        {hView==="date"&&(
          <div>
            {Object.entries(histByDate).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,g])=>(
              <div key={date} style={{marginBottom:10}}>
                <button onClick={()=>sHOpen(x=>x===date?null:date)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,background:T.bg3,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.white}}>{new Date(date+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Bdg col={T.cyan}>{g.count}W</Bdg>
                    <span style={{color:T.dim,fontSize:11}}>{hOpen===date?"▲":"▼"}</span>
                  </div>
                </button>
                {hOpen===date&&(
                  <div style={{padding:"8px 4px"}}>
                    {g.washes.map(w=>(
                      <div key={w.id} style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",padding:"6px 8px",borderBottom:`1px solid ${T.border}`}}>
                        <Bdg col={T.orange}>W{w.numero}</Bdg>
                        <span style={{fontSize:11,fontWeight:700,color:T.white}}>{w.sessions?.strain}</span>
                        <Bdg col={MC[w.sessions?.machine]||T.dim}>{MS[w.sessions?.machine]}</Bdg>
                        {w.micron&&<Bdg>{w.micron}</Bdg>}
                        {w.couleur_wash&&<Bdg col={T.dim}>{w.couleur_wash}</Bdg>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {Object.keys(histByDate).length===0&&<div style={{textAlign:"center",color:T.dim,padding:20,fontSize:13}}>Aucune donnée</div>}
          </div>
        )}

        {hView==="machine"&&(
          <div>
            {MACHINES.map(m=>{
              const g=histByMachine[m]||{count:0,washes:[]};
              const c=MC[m];
              return(
                <div key={m} style={{marginBottom:10}}>
                  <button onClick={()=>sHOpen(x=>x===m?null:m)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,background:T.bg3,border:`1px solid ${c}44`}}>
                    <span style={{fontSize:13,fontWeight:700,color:c}}>{MS[m]}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Bdg col={c}>{g.count}W</Bdg>
                      <span style={{color:T.dim,fontSize:11}}>{hOpen===m?"▲":"▼"}</span>
                    </div>
                  </button>
                  {hOpen===m&&(
                    <div style={{padding:"8px 4px"}}>
                      {g.washes.map(w=>(
                        <div key={w.id} style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",padding:"6px 8px",borderBottom:`1px solid ${T.border}`}}>
                          <Bdg col={T.orange}>W{w.numero}</Bdg>
                          <span style={{fontSize:11,fontWeight:700,color:T.white}}>{w.sessions?.strain}</span>
                          <span style={{fontSize:10,color:T.dim}}>{w.sessions?.date}</span>
                          {w.micron&&<Bdg>{w.micron}</Bdg>}
                          {w.couleur_wash&&<Bdg col={T.dim}>{w.couleur_wash}</Bdg>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Crd>
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
  const inputId=`photo-upload-${sel}`;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,background:"#000000BB",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>{sSel(null);sEd(null);}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:768,background:T.bg2,border:`1px solid ${selC}55`,borderRadius:"20px 20px 0 0",maxHeight:"92vh",overflowY:"auto",animation:"dup 0.3s ease",paddingBottom:"max(24px,env(safe-area-inset-bottom))"}}>

        {/* ── Zone photo header ── */}
        <div style={{height:320,background:selSt.photo_url?`url(${selSt.photo_url}) center/cover`:`linear-gradient(160deg,${selC}33,${T.bg3})`,position:"relative",borderRadius:"20px 20px 0 0",overflow:"hidden"}}>          {!selSt.photo_url&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,opacity:0.08}}>🌿</div>}
          {/* Gradient bas */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:100,background:"linear-gradient(0deg,#0A0A18,transparent)"}}/>
          {/* ✕ Fermer haut gauche */}
          <button onClick={()=>{sSel(null);sEd(null);}} style={{position:"absolute",top:14,left:14,width:34,height:34,borderRadius:10,background:"#00000066",backdropFilter:"blur(8px)",border:`1px solid ${T.border}`,color:T.white,fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          {/* 📷 Photo haut droite — label pour fix iPad */}
          <label htmlFor={inputId} style={{position:"absolute",top:14,right:14,background:"#00000066",backdropFilter:"blur(8px)",border:`1px solid ${selC}`,borderRadius:10,padding:"7px 14px",color:selC,fontWeight:700,fontSize:12,cursor:"pointer"}}>📷 Photo</label>
          <input id={inputId} type="file" accept="image/*" onChange={e=>upload(e,sel)} style={{display:"none"}}/>
          {/* Nom + génétique en bas */}
          <div style={{position:"absolute",bottom:14,left:16,right:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{fontSize:28,fontWeight:900,fontStyle:"italic",color:T.white,textShadow:`1px 1px 0 ${selC}`}}>{sel}</div>
              {r&&<div style={{background:"#00000077",backdropFilter:"blur(6px)",borderRadius:8,padding:"4px 12px",border:`1px solid ${selC}44`}}>
                <span style={{fontSize:22,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:selC,animation:rec?"rglow 2s infinite":"none"}}>{r}%</span>
              </div>}
            </div>
            {selSt.genetique&&<div style={{fontSize:12,color:T.ink,marginTop:2}}>{selSt.genetique}</div>}
          </div>
        </div>

        {/* ── Contenu ── */}
        <div style={{padding:"16px 18px"}}>
          {/* Tabs WPFF / Rosin */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[["wpff","🧊 WPFF"],["rosin","🔥 Live Rosin"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setProdTab(id)} style={{flex:1,padding:"9px",borderRadius:10,fontWeight:700,fontSize:13,background:prodTab===id?selC+"22":T.bg3,color:prodTab===id?selC:T.dim,border:`1.5px solid ${prodTab===id?selC:T.border}`}}>{lbl}</button>
            ))}
          </div>

          {prodTab==="wpff"&&(
            <div style={{marginBottom:14}}>
              {/* Pesées micron en ligne */}
              {Object.keys(byMicron).length>0&&(
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  {Object.entries(byMicron).map(([mic,po])=>(
                    <div key={mic} style={{flex:1,background:T.bg3,borderRadius:10,padding:"10px 8px",textAlign:"center",border:`1px solid ${T.border}`}}>
                      <div style={{fontSize:9,color:T.dim,marginBottom:3,letterSpacing:"0.08em"}}>{mic}</div>
                      <div style={{fontSize:18,fontWeight:800,color:T.gold,fontFamily:"DM Mono"}}>{po.toFixed(1)}g</div>
                    </div>
                  ))}
                </div>
              )}
              {/* Infos 2x2 compactes */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[["👃 Odeur",selSt.odeur||"—"],["👅 Goût",selSt.gout||"—"],["🔬 Cure",selSt.mode_cure||"FreezeDryer"],["📋 Sessions",seSel.length]].map(([l,v])=>(
                  <div key={l} style={{background:T.bg3,borderRadius:10,padding:"10px 12px",borderLeft:`2px solid ${selC}44`}}>
                    <div style={{fontSize:9,color:T.dim,marginBottom:3}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:T.white}}>{v}</div>
                  </div>
                ))}
              </div>
              {selSt.notes&&<div style={{background:T.bg3,borderRadius:10,padding:"10px 12px",marginBottom:12,borderLeft:`2px solid ${T.border}`}}><div style={{fontSize:9,color:T.dim,marginBottom:3}}>📝 Notes</div><div style={{fontSize:12,color:T.ink,fontStyle:"italic"}}>{selSt.notes}</div></div>}
            </div>
          )}

          {prodTab==="rosin"&&(
            <div style={{marginBottom:14}}>
              <div style={{background:T.bg3,borderRadius:12,padding:16,marginBottom:10,border:`1px solid ${T.gold}22`,textAlign:"center"}}>
                <div style={{fontSize:9,color:T.dim,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>Rendement Live Rosin</div>
                <div style={{fontSize:20,fontWeight:700,color:T.gold}}>À venir</div>
                <div style={{fontSize:11,color:T.dim,marginTop:6}}>Fabriqué à partir du WPFF 90µ / 45µ</div>
              </div>
              <div style={{background:T.bg3,borderRadius:10,padding:"12px 14px",border:`1px solid ${T.border}`}}>
                <div style={{fontSize:9,color:T.dim,marginBottom:4}}>160µ disponible</div>
                {byMicron["160µ"]
                  ?<div style={{fontSize:20,fontWeight:800,color:T.orange,fontFamily:"DM Mono"}}>{byMicron["160µ"].toFixed(1)}g</div>
                  :<div style={{fontSize:12,color:T.dim,fontStyle:"italic"}}>Aucune pesée 160µ</div>}
              </div>
            </div>
          )}

          {/* Form modifier */}
          {editing===sel?(
            <div style={{background:T.bg3,borderRadius:14,padding:14,border:`1px solid ${selC}33`}}>
              <div style={{fontSize:10,color:selC,fontWeight:800,letterSpacing:"0.1em",marginBottom:12}}>✏ MODIFIER</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                {[["Génétique","genetique","GMO x TK"],["Odeur","odeur","Candy..."],["Goût","gout","Diesel..."]].map(([l,k,ph])=>(
                  <div key={k} style={{background:T.bg,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:T.dim,marginBottom:4}}>{l}</div>
                    <input value={ed[k]||""} onChange={e=>sED(x=>({...x,[k]:e.target.value}))} placeholder={ph} style={{fontSize:13,padding:"2px 0",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,borderRadius:0,color:T.white,width:"100%"}}/>
                  </div>
                ))}
                <div style={{background:T.bg,borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:T.dim,marginBottom:6}}>Cure</div>
                  <button onClick={()=>sED(x=>({...x,mode_cure:"FreezeDryer"}))} style={{padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:700,background:ed.mode_cure==="FreezeDryer"?selC+"44":T.bg3,color:ed.mode_cure==="FreezeDryer"?T.white:T.dim,border:`1.5px solid ${ed.mode_cure==="FreezeDryer"?selC:T.border}`}}>FreezeDryer</button>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:T.dim,marginBottom:6}}>Type produit</div>
                <div style={{display:"flex",gap:8}}>
                  {TYPES_PRODUIT.map(t=><button key={t} onClick={()=>sED(x=>({...x,type_produit:t}))} style={{flex:1,padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,background:ed.type_produit===t?selC+"44":T.bg3,color:ed.type_produit===t?T.white:T.dim,border:`1.5px solid ${ed.type_produit===t?selC:T.border}`}}>{t}</button>)}
                </div>
              </div>
              <textarea value={ed.notes||""} onChange={e=>sED(x=>({...x,notes:e.target.value}))} placeholder="Notes..." rows={2} style={{resize:"none",marginBottom:10,fontSize:12}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>sEd(null)} style={{flex:1,padding:"10px",borderRadius:10,background:"transparent",border:`1px solid ${T.border}`,color:T.dim,fontWeight:600,fontSize:13}}>Annuler</button>
                <button onClick={saveEdit} disabled={saving} style={{flex:1,padding:"10px",borderRadius:10,background:selC,color:"#fff",fontWeight:800,fontSize:13,opacity:saving?0.5:1}}>{saving?"...":"💾"}</button>
              </div>
            </div>
          ):(
            <button onClick={()=>{sEd(sel);sED({odeur:selSt.odeur||"",gout:selSt.gout||"",mode_cure:selSt.mode_cure||"",notes:selSt.notes||"",genetique:selSt.genetique||"",type_produit:selSt.type_produit||""});}} style={{width:"100%",padding:"12px",borderRadius:12,background:selC+"18",border:`1px solid ${selC}44`,color:selC,fontWeight:700,fontSize:14}}>✏ Modifier cette strain</button>
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

  const getStatus=(nom)=>{
    const se=sessions.filter(s=>s.strain===nom);
    if(se.length===0)return null;
    const pe=pesees.filter(p=>se.find(s=>s.id===p.session_id));
    return pe.length>0?"done":"progress";
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
    <div style={{marginTop:20}}>
      {/* Header Catalogue */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <STL icon="🏺" text="CATALOGUE" col={T.gold}/>
        <button onClick={()=>sShP(x=>!x)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 12px",color:T.dim,fontWeight:600,fontSize:11,display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:13}}>⚖</span> Pesées
        </button>
      </div>

      {/* Formulaire pesées */}
      {showP&&(
        <div style={{background:T.bg2,border:`1px solid ${T.gold}33`,borderRadius:14,padding:14,marginBottom:14}}>
          {/* Layout horizontal : formulaire gauche + camembert droite */}
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"start"}}>
            {/* Formulaire gauche */}
            <div>
              <div style={{fontSize:10,color:T.gold,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,textAlign:"center"}}>⚖ Pesées Freeze Dryer</div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:9,color:T.dim,textAlign:"center",marginBottom:4,letterSpacing:"0.08em",textTransform:"uppercase"}}>Strain</div>
                <select value={nP.strain} onChange={e=>sNP(x=>({...x,strain:e.target.value}))} style={{fontSize:12,padding:"8px 10px"}}>
                  <option value="">Sélectionner...</option>
                  {allSt.map(s=><option key={s.nom||s}>{s.nom||s}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["90µ (g)","m90"],["45µ / FS (g)","m45"]].map(([lbl,key])=>(
                  <div key={key}>
                    <div style={{fontSize:9,color:T.dim,textAlign:"center",marginBottom:4,letterSpacing:"0.08em",textTransform:"uppercase"}}>{lbl}</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <button onClick={()=>sNP(x=>({...x,[key]:Math.max(0,parseFloat(x[key]||0)-0.1).toFixed(1)}))} style={{width:30,height:30,borderRadius:7,background:T.bg3,border:`1px solid ${T.border}`,color:T.white,fontSize:16,fontWeight:700,flexShrink:0}}>−</button>
                      <input type="number" value={nP[key]} onChange={e=>sNP(x=>({...x,[key]:e.target.value}))} style={{textAlign:"center",fontSize:15,fontWeight:800,color:T.orange,fontFamily:"DM Mono",padding:"6px 2px"}} min="0" step="0.1"/>
                      <button onClick={()=>sNP(x=>({...x,[key]:parseFloat((parseFloat(x[key]||0)+0.1).toFixed(1))}))} style={{width:30,height:30,borderRadius:7,background:T.orange,color:"#fff",fontSize:16,fontWeight:700,flexShrink:0}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:6,marginTop:10}}>
                <button onClick={()=>sShP(false)} style={{flex:1,padding:"8px",borderRadius:8,background:"transparent",border:`1px solid ${T.border}`,color:T.dim,fontWeight:600,fontSize:12}}>Annuler</button>
                <button onClick={addPesee} disabled={saving} style={{padding:"8px 16px",borderRadius:8,background:T.gold,color:"#000",fontWeight:800,fontSize:18,opacity:saving?0.5:1}}>💾</button>
              </div>
            </div>
            {/* Camembert droite — rendements 90µ vs 45µ */}
            {(()=>{
              const total=allSt.reduce((acc,s)=>{
                const se=sessions.filter(x=>x.strain===(s.nom||s));
                const pe=pesees.filter(p=>se.find(x=>x.id===p.session_id));
                pe.forEach(p=>{acc[p.micron]=(acc[p.micron]||0)+(parseFloat(p.poids_sec_g)||0);});
                return acc;
              },{});
              const v90=total["90µ"]||0,v45=total["45µ"]||0,tot=(v90+v45)||1;
              const pct90=v90/tot,pct45=v45/tot;
              const a90=pct90*2*Math.PI,a45=pct45*2*Math.PI;
              const R=42,cx=50,cy=50;
              const x1=cx+R*Math.sin(0),y1=cy-R*Math.cos(0);
              const x2=cx+R*Math.sin(a90),y2=cy-R*Math.cos(a90);
              const lg=a90>Math.PI?1:0;
              return(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingTop:22}}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    {v90>0&&v45>0?(
                      <>
                        <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${lg} 1 ${x2} ${y2} Z`} fill={T.orange} opacity="0.9"/>
                        <path d={`M ${cx} ${cy} L ${x2} ${y2} A ${R} ${R} 0 ${1-lg} 1 ${x1} ${y1} Z`} fill={T.gold} opacity="0.9"/>
                      </>
                    ):(
                      <circle cx={cx} cy={cy} r={R} fill={v90>0?T.orange:T.gold} opacity="0.9"/>
                    )}
                    <circle cx={cx} cy={cy} r={22} fill={T.bg2}/>
                    <text x={cx} y={cy+5} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="DM Mono" fill={T.white}>{tot.toFixed(0)}g</text>
                  </svg>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.orange}}/><span style={{fontSize:9,color:T.dim}}>90µ {v90>0?v90.toFixed(0)+"g":"—"}</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:T.gold}}/><span style={{fontSize:9,color:T.dim}}>45µ {v45>0?v45.toFixed(0)+"g":"—"}</span></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Grid cards — style sobre pleine largeur */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {allSt.map((s,i)=>{
          const nom=s.nom||s,r=getR(nom),c=SC[i%SC.length],rec=r&&parseFloat(r)>4;
          const typeProd=s.type_produit;
          const status=getStatus(nom);
          return(
            <div key={nom} onClick={()=>sSel(nom)} style={{borderRadius:14,overflow:"hidden",cursor:"pointer",background:T.card,border:`1px solid ${rec?T.aura+"66":T.border}`,boxShadow:rec?`0 0 20px ${T.aura}22`:"none",transition:"all 0.2s"}}>
              {/* Zone photo */}
              <div style={{height:200,position:"relative",background:s.photo_url?`url(${s.photo_url}) center/cover`:`linear-gradient(160deg,${c}22,${T.bg3})`}}>
                {!s.photo_url&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,opacity:0.12}}>🌿</div>}
                {/* Badges overlay */}
                <div style={{position:"absolute",top:8,left:8,display:"flex",gap:4,flexWrap:"wrap"}}>
                  {typeProd&&<span style={{background:typeProd==="WPFF"?"#1a3a2a":"#2a1a0a",color:typeProd==="WPFF"?"#4ade80":T.gold,border:`1px solid ${typeProd==="WPFF"?"#4ade8044":T.gold+"44"}`,borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:800,letterSpacing:"0.05em"}}>{typeProd==="WPFF"?"🧊 WPFF":"🔥 ROSIN"}</span>}
                  {rec&&<span style={{background:T.aura,color:"#000",borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:800}}>★ REC</span>}
                </div>
                {/* Badge statut top droite */}
                {status&&<div style={{position:"absolute",top:8,right:8}}>
                  <span style={{background:status==="done"?"#0a2e1a":"#2a1f0a",color:status==="done"?T.green:T.gold,border:`1px solid ${status==="done"?T.green+"55":T.gold+"55"}`,borderRadius:5,padding:"2px 8px",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",gap:3}}>
                    {status==="done"?"✓ Terminé":"⏳ En cours"}
                  </span>
                </div>}
                {/* Gradient bas */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:50,background:"linear-gradient(0deg,#0B0B1AEE,transparent)"}}/>
              </div>
              {/* Info compacte */}
              <div style={{padding:"10px 12px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:15,fontWeight:800,color:T.white,letterSpacing:"0.01em"}}>{nom}</div>
                  {r&&<div style={{fontSize:16,fontWeight:800,fontFamily:"DM Mono",color:rec?T.aura:c,animation:rec?"rglow 2s infinite":"none"}}>{r}%</div>}
                </div>
                {s.genetique&&<div style={{fontSize:10,color:T.dim,marginBottom:4}}>{s.genetique}</div>}
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
                  {s.odeur&&<span style={{fontSize:10,color:T.ink,background:T.bg3,borderRadius:4,padding:"2px 6px"}}>👃 {s.odeur}</span>}
                  {s.gout&&<span style={{fontSize:10,color:T.ink,background:T.bg3,borderRadius:4,padding:"2px 6px"}}>👅 {s.gout}</span>}
                </div>
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

  const screens=useMemo(()=>({dashboard:<Dashboard/>,session:<Session strains={strains}/>,calendar:<Calendrier/>,utilisateurs:<Utilisateurs/>}),[strains]);

  if(!auth) return(
    <TimerProvider>
      <style>{CSS}</style>
      <PinScreen onUnlock={()=>setAuth(true)}/>
    </TimerProvider>
  );

  return(
    <>
      <style>{CSS}</style>
      <TimerProvider>
        <div style={{maxWidth:768,margin:"0 auto",minHeight:"100vh"}}>
          <AppHeader/>
          <div style={{paddingBottom:80}}>{screens[screen]}</div>
          <NavBar active={screen} onNav={sScr}/>
        </div>
        <FloatingTimers/>
      </TimerProvider>
    </>
  );
}
