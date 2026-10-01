"""Motion kit for the "living cartoon" style (approved by Dinesh 2026-09-24 on the RecurPost agency explainer v2).
Copy into a project's build.py (or `from motion_kit import *` after copying next to it). Source of truth / working example:
~/videos/recurpost-agency-hub-explainer/build.py (16:9). For 9:16 reels pass T.VW=1080, T.VH=1920 in each frame's T dict,
set data-width/height in wrap(), and re-lay the desk_set coordinates (they are 1920x1080 world px).

Contents: BASE_CSS (paper, grain, fibers, vignette, cam, particles, trail dots, product-layer window chrome),
LIB (JS: seeded hash, tick dispatcher, boil, cam/camSet/shake, burst, fly+trail, typeSeq, countUp, pop/rise/fade,
swoosh, clock hands, ripple, and the Kate rig: set/pose/rest/face/look/blink/breathe/hop/squash/walk/type),
kate() (jointed SVG, viewBox 300x600, feet at y=540), clock(), fb_screen(), rp_screen(), desk_set(), wrap(), and
the product-layer helpers (rp_window, brand, rail, cursor, side_kate).
Needs: icon(), logo(), NETC, CCOL, CLIENTS, NETS8, KATE_DESK, LAP, PILE, PILE_ICONS defined as in the reference build.py.
"""
import json
BASE_CSS = '''
@font-face{font-family:"Bricolage Grotesque";font-weight:400;src:url("assets/fonts/BricolageGrotesque-400.woff2") format("woff2")}
@font-face{font-family:"Bricolage Grotesque";font-weight:600;src:url("assets/fonts/BricolageGrotesque-600.woff2") format("woff2")}
@font-face{font-family:"Bricolage Grotesque";font-weight:700;src:url("assets/fonts/BricolageGrotesque-700.woff2") format("woff2")}
@font-face{font-family:"Bricolage Grotesque";font-weight:800;src:url("assets/fonts/BricolageGrotesque-800.woff2") format("woff2")}
#root{position:absolute;inset:0;overflow:hidden;background:#FFFBF4;color:#1B1C31;font-family:"Bricolage Grotesque",system-ui,sans-serif}
.paper{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#FFFDF8 0%,#FFF6E4 58%,#F1E6CF 100%)}
.grain{position:absolute;inset:0;opacity:.07;background-image:radial-gradient(#1B1C31 .6px,transparent .7px);background-size:6px 6px;pointer-events:none;z-index:89}
.fibers{position:absolute;inset:0;opacity:.35;pointer-events:none;background:
 radial-gradient(ellipse 380px 120px at 18% 22%,rgba(214,190,140,.18),transparent 70%),
 radial-gradient(ellipse 520px 160px at 78% 70%,rgba(214,190,140,.16),transparent 70%),
 radial-gradient(ellipse 300px 90px at 60% 12%,rgba(214,190,140,.12),transparent 70%)}
.vig{position:absolute;inset:0;pointer-events:none;z-index:90;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 55%,rgba(70,48,12,.16) 88%,rgba(50,32,8,.28) 100%)}
.cam{position:absolute;inset:0;transform-origin:50% 50%}
.layer{position:absolute;inset:0}
.abs{position:absolute}
.bl{position:absolute}
.night{position:absolute;inset:0;background:#1A2150;mix-blend-mode:multiply;opacity:0;pointer-events:none}
.clock{position:absolute;left:1580px;top:70px;width:220px;height:220px;z-index:30}
.tile{position:absolute;left:0;top:0;width:84px;height:84px;background:#fff;border:4px solid #1B1C31;border-radius:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 7px 0 rgba(27,28,49,.14)}
.say{position:absolute;font:800 76px/1.02 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.02em;color:#1B1C31;white-space:nowrap;z-index:40}
.say .sw{position:relative;display:inline-block}
.say svg.swoosh{position:absolute;left:-6px;bottom:-16px;width:calc(100% + 12px);height:30px;overflow:visible}
.chip{position:absolute;font:700 20px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;background:#FED024;color:#1B1C31;border:3px solid #1B1C31;padding:9px 14px;border-radius:10px;white-space:nowrap}
.brand{position:absolute;right:70px;top:48px;z-index:40}
.eyebrow{position:absolute;left:300px;top:66px;font:700 22px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#5A4700}
.eyebrow i{display:inline-block;width:12px;height:12px;border-radius:50%;background:#FED024;border:2px solid #1B1C31;margin-right:12px;vertical-align:middle}
.pt{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;z-index:80}
.pt.star{border-radius:0;clip-path:polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%)}
.pt.spark{border-radius:3px}
.tr{position:absolute;left:0;top:0;width:8px;height:8px;border-radius:50%;background:#1B1C31;opacity:0;z-index:70;pointer-events:none}
/* product layer */
.win{position:absolute;background:#F4F5F8;border:4px solid #1B1C31;border-radius:18px;overflow:hidden;box-shadow:0 14px 0 rgba(27,28,49,.10),0 30px 60px -30px rgba(27,28,49,.35)}
.win .bar{height:52px;background:#fff;border-bottom:2px solid #E3E0D6;display:flex;align-items:center;gap:9px;padding:0 18px;font:500 17px/1 ui-monospace,monospace;color:#4A5057}
.win .bar i{width:14px;height:14px;border-radius:50%;display:inline-block;border:2px solid #1B1C31}
.win .bar span{margin-left:14px;background:#F2F2F5;border-radius:8px;padding:8px 14px;flex:1}
.ui{font-family:system-ui,sans-serif;color:#212529}
.card{background:#fff;border:2px solid #DEE2E6;border-radius:14px}
.btn{display:inline-block;background:#0d6efd;color:#fff;font:600 19px/1 system-ui,sans-serif;padding:14px 20px;border-radius:10px}
.cursor{position:absolute;left:0;top:0;width:46px;height:46px;z-index:85}
.phone{position:absolute;background:#fff;border:5px solid #1B1C31;border-radius:46px;overflow:hidden;box-shadow:0 14px 0 rgba(27,28,49,.10)}
.av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font:700 15px/1 system-ui,sans-serif;color:#fff;width:32px;height:32px;border:2px solid #fff}
'''

# ------------------------------------------------------------------ JS library (shared, seek-safe)
LIB = r'''
const VW=(typeof T!=='undefined'&&T.VW)||1920, VH=(typeof T!=='undefined'&&T.VH)||1080; // pass T.VW=1080,T.VH=1920 for 9:16 reels
const q=(s)=>document.querySelector(s), qa=(s)=>Array.from(document.querySelectorAll(s));
const H=(n,s)=>{const x=Math.sin(n*127.1+(s||1)*311.7)*43758.5453;return (x-Math.floor(x))*2-1;};
const U=(n,s)=>(H(n,s)+1)/2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EZ=(n)=>gsap.parseEase(n);
// one onUpdate dispatcher per timeline; every per-frame render is a pure function of t
const TICKS=[]; tl.eventCallback('onUpdate',()=>{const t=tl.time(); for(const f of TICKS) f(t);});
const tick=(f)=>{TICKS.push(f);};
// hand-drawn boil: re-pose every 3 frames (seeded, seek-safe)
const boil=(sel,amp,rot,seed)=>{const els=qa(sel); tick((t)=>{const st=Math.floor(t*30/3); els.forEach((e,i)=>gsap.set(e,{x:H(st*3+i*97,seed)*amp,y:H(st*3+1+i*97,seed)*amp,rotation:H(st*3+2+i*97,seed)*rot}));});};
// camera: bring world point (px,py) to screen centre at scale s
const cam=(sel,s,px,py,at,d,e)=>tl.to(sel,{scale:s,x:-(px-VW/2)*s,y:-(py-VH/2)*s,duration:d,ease:e||'power2.inOut'},at);
const camSet=(sel,s,px,py)=>gsap.set(sel,{scale:s,x:-(px-VW/2)*s,y:-(py-VH/2)*s});
const shake=(sel,at,amp,n)=>{for(let i=0;i<n;i++) tl.to(sel,{x:'+='+((i%2?-2:2)*amp*(1-i/n)),duration:0.04,ease:'none'},at+i*0.04);};
// particles (seeded)
const burst=(layer,x,y,at,o)=>{o=o||{};const n=o.n||14,seed=o.seed||1,cols=o.cols||['#FED024','#1B1C31','#F2994A','#FFFFFF'],r=o.r||140,d=o.d||0.9,sz=o.sz||10,sh=o.sh||'dot',g=(o.g===undefined?70:o.g);
  const L=q(layer); for(let i=0;i<n;i++){const e=document.createElement('div');e.className='pt '+sh;const s=sz*(0.6+0.8*U(i+7,seed));const col=cols[i%cols.length];
   e.style.cssText='width:'+s+'px;height:'+(sh==='spark'?s*0.35:s)+'px;background:'+col+';'+(col==='#FFFFFF'?'box-shadow:0 0 0 2px #1B1C31;':'');L.appendChild(e);gsap.set(e,{opacity:0});
   const a=(i/n)*Math.PI*2+H(i,seed)*0.5, dd=r*(0.55+0.45*U(i+50,seed));
   tl.fromTo(e,{x:x-s/2,y:y-s/2,scale:0,opacity:1,rotation:0},{x:x-s/2+Math.cos(a)*dd,y:y-s/2+Math.sin(a)*dd,scale:1,rotation:(sh==='spark'?a*57.3:H(i+9,seed)*200),duration:d*0.55,ease:'power3.out',immediateRender:false},at);
   tl.to(e,{y:'+='+g,opacity:0,scale:0.2,duration:d*0.45,ease:'power1.in'},at+d*0.55);}};
// quadratic arc flight with a dotted trail (seek-safe via tick). o.vis=[t0,t1] drives opacity.
const bez=(a,c,b,u)=>({x:(1-u)*(1-u)*a.x+2*(1-u)*u*c.x+u*u*b.x,y:(1-u)*(1-u)*a.y+2*(1-u)*u*c.y+u*u*b.y});
const inv=(ez,u)=>{let lo=0,hi=1;for(let k=0;k<22;k++){const m=(lo+hi)/2;if(ez(m)<u)lo=m;else hi=m;}return (lo+hi)/2;};
const fly=(sel,a,c,b,at,d,o)=>{o=o||{};const el=q(sel),ez=EZ(o.ease||'power2.inOut'),w=o.w||0,h=o.h||0;
  tick((t)=>{const s=clamp((t-at)/d,0,1),u=ez(s),p=bez(a,c,b,u);const pr={x:p.x-w/2,y:p.y-h/2};
    if(o.rot){const p2=bez(a,c,b,Math.min(1,u+0.02)),p1=bez(a,c,b,Math.max(0,u-0.02));pr.rotation=Math.atan2(p2.y-p1.y,p2.x-p1.x)*57.3+(o.rotOff||0);}
    if(o.vis) pr.opacity=(t>=o.vis[0]&&t<o.vis[1])?1:0;
    if(t>=at-0.001||o.vis) gsap.set(el,pr);});
  if(o.trail){const L=q(o.layer);for(let k=1;k<o.trail;k++){const uk=k/o.trail,p=bez(a,c,b,uk),dt=at+d*inv(ez,uk);const e=document.createElement('div');e.className='tr';e.style.background=o.tc||'#1B1C31';L.appendChild(e);
    gsap.set(e,{x:p.x-4,y:p.y-4});tl.fromTo(e,{opacity:0,scale:0.4},{opacity:0.75,scale:1,duration:0.08},dt);tl.to(e,{opacity:0,scale:0.3,duration:0.5,ease:'power1.in'},dt+0.35);}}};
// typed text sequence / count-up (tick-driven)
const typeSeq=(sel,segs)=>{const el=q(sel);tick((t)=>{let txt='';for(const [text,at,cps] of segs){if(t>=at) txt=text.slice(0,clamp(Math.floor((t-at)*cps),0,text.length));}el.textContent=txt;});};
const countUp=(sel,from,to,at,d,fmt)=>{const el=q(sel),ez=EZ('power2.out');tick((t)=>{const s=clamp((t-at)/d,0,1);const v=from+(to-from)*ez(s);el.textContent=fmt?fmt(v):Math.round(v);});};
const pop=(sel,at,d,from)=>tl.fromTo(sel,{opacity:0,scale:from===undefined?0.4:from},{opacity:1,scale:1,duration:d||0.5,ease:'back.out(2.2)'},at);
const rise=(sel,at,d,y)=>tl.fromTo(sel,{opacity:0,y:y===undefined?40:y},{opacity:1,y:0,duration:d||0.55,ease:'back.out(1.6)'},at);
const fade=(sel,at,d,to)=>tl.to(sel,{opacity:to===undefined?1:to,duration:d||0.4},at);
const swoosh=(sel,at)=>{const p=q(sel);const L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});tl.to(p,{strokeDashoffset:0,duration:0.45,ease:'power2.out'},at);};
const clk=(P,m)=>{gsap.set('#'+P+'-mh',{rotation:m*6,svgOrigin:'100 100'});gsap.set('#'+P+'-hh',{rotation:m*0.5,svgOrigin:'100 100'});};
const clkTo=(P,m,at,d,e)=>{tl.to('#'+P+'-mh',{rotation:m*6,svgOrigin:'100 100',duration:d,ease:e||'power2.inOut'},at);tl.to('#'+P+'-hh',{rotation:m*0.5,svgOrigin:'100 100',duration:d,ease:e||'power2.inOut'},at);};
const ripple=(layer,x,y,at,col,n)=>{const L=q(layer);for(let i=0;i<(n||2);i++){const e=document.createElement('div');e.style.cssText='position:absolute;left:0;top:0;width:100px;height:100px;border-radius:50%;border:5px solid '+(col||'#FED024')+';pointer-events:none;z-index:79';L.appendChild(e);gsap.set(e,{opacity:0});
  tl.fromTo(e,{x:x-50,y:y-50,scale:0.3,opacity:0.9},{x:x-50,y:y-50,scale:3.2,opacity:0,duration:0.9,ease:'power2.out',immediateRender:false},at+i*0.18);}};
// ---- Kate rig -------------------------------------------------------------
const OR={armL:'150 195',armR:'150 195',foreL:'150 268',foreR:'150 268',legL:'150 362',legR:'150 362',shinL:'150 450',shinR:'150 450',head:'150 160',root:'150 540'};
const REST={armL:16,armR:-16,foreL:8,foreR:-8,legL:5,legR:-5,shinL:0,shinR:0,head:0};
const rig=(P)=>{const id=(k)=>'#'+P+'-k-'+k; const K={};
  K.set=(o)=>{for(const k in o) gsap.set(id(k),{rotation:o[k],svgOrigin:OR[k]});};
  K.pose=(o,at,d,e)=>{for(const k in o) tl.to(id(k),{rotation:o[k],svgOrigin:OR[k],duration:d||0.35,ease:e||'power2.inOut'},at);};
  K.rest=(at,d)=>K.pose(REST,at,d||0.35);
  const FACES={eyes:['eyesN','eyesH','eyesS','eyesW'],mouth:['mSmile','mOpen','mFlat','mO']};
  K.face=(o,at)=>{if(o.eyes) FACES.eyes.forEach(n=>tl.set(id(n),{opacity:n===o.eyes?1:0},at));
    if(o.mouth) FACES.mouth.forEach(n=>tl.set(id(n),{opacity:n===o.mouth?1:0},at));
    if(o.sweat!==undefined) tl.to(id('sweat'),{opacity:o.sweat?1:0,y:o.sweat?0:-10,duration:0.25},at);
    if(o.lid!==undefined) tl.set(id('lid'),{opacity:o.lid?1:0},at);
    if(o.brows!==undefined) tl.to(id('brows'),{opacity:o.brows?1:0,duration:0.2},at);};
  K.faceSet=(o)=>{if(o.eyes) FACES.eyes.forEach(n=>gsap.set(id(n),{opacity:n===o.eyes?1:0}));if(o.mouth) FACES.mouth.forEach(n=>gsap.set(id(n),{opacity:n===o.mouth?1:0}));if(o.lid!==undefined) gsap.set(id('lid'),{opacity:o.lid?1:0});if(o.sweat!==undefined) gsap.set(id('sweat'),{opacity:o.sweat?1:0});};
  K.look=(dx,dy,at,d)=>tl.to(id('pupils'),{x:dx,y:dy,duration:d||0.2,ease:'power2.out'},at);
  K.blink=(at)=>{tl.to(id('eyesN'),{scaleY:0.1,transformOrigin:'50% 50%',duration:0.06},at);tl.to(id('eyesN'),{scaleY:1,transformOrigin:'50% 50%',duration:0.08},at+0.08);};
  K.blinks=(list)=>list.forEach(K.blink);
  K.breathe=(from,to)=>{const cyc=1.6,n=Math.max(1,Math.floor((to-from)/cyc));tl.fromTo(id('upper'),{y:0},{y:-4,duration:cyc/2,ease:'sine.inOut',yoyo:true,repeat:n*2-1,immediateRender:false},from);};
  K.hop=(at,hgt)=>{hgt=hgt||60;tl.to(id('root'),{scaleY:0.86,scaleX:1.08,svgOrigin:OR.root,duration:0.12,ease:'power2.out'},at);
    tl.to(id('root'),{scaleY:1.08,scaleX:0.94,svgOrigin:OR.root,duration:0.14,ease:'power2.out'},at+0.12);
    tl.to(id('hop'),{y:-hgt,duration:0.26,ease:'power2.out'},at+0.14);tl.to(id('hop'),{y:0,duration:0.24,ease:'power2.in'},at+0.4);
    tl.to(id('root'),{scaleY:0.88,scaleX:1.07,svgOrigin:OR.root,duration:0.08},at+0.62);tl.to(id('root'),{scaleY:1,scaleX:1,svgOrigin:OR.root,duration:0.3,ease:'elastic.out(1,0.45)'},at+0.7);};
  K.squash=(at)=>{tl.to(id('root'),{scaleY:0.9,scaleX:1.05,svgOrigin:OR.root,duration:0.1},at);tl.to(id('root'),{scaleY:1,scaleX:1,svgOrigin:OR.root,duration:0.35,ease:'elastic.out(1,0.4)'},at+0.1);};
  // walk: wrapper x from x0 to x1 over [t0,t1]
  K.walk=(wrap,x0,x1,t0,t1,st)=>{st=st||0.42;tl.fromTo(wrap,{x:x0},{x:x1,duration:t1-t0,ease:'none'},t0);
    const n=Math.max(2,Math.round((t1-t0)/st)),sd=(t1-t0)/n,dir=(x1>=x0?1:-1);
    for(let i=0;i<n;i++){const t=t0+i*sd,f=(i%2===0);const sw=24*dir;
      K.pose({legL:f?-sw:sw,legR:f?sw:-sw,armL:REST.armL+(f?18:-18)*dir,armR:REST.armR+(f?18:-18)*dir},t,sd,'sine.inOut');
      tl.to(id(f?'shinR':'shinL'),{rotation:22*dir,svgOrigin:OR.shinL,duration:sd/2,ease:'sine.out'},t);
      tl.to(id(f?'shinR':'shinL'),{rotation:0,svgOrigin:OR.shinL,duration:sd/2,ease:'sine.in'},t+sd/2);
      tl.to(id('hop'),{y:-7,duration:sd/2,ease:'sine.out'},t);tl.to(id('hop'),{y:0,duration:sd/2,ease:'sine.in'},t+sd/2);}
    K.pose({legL:REST.legL,legR:REST.legR,armL:REST.armL,armR:REST.armR},t1,0.25);K.squash(t1);};
  K.type=(from,to)=>{const n=Math.floor((to-from)/0.14);for(let i=0;i<n;i++){tl.to(id(i%2?'foreL':'foreR'),{rotation:(i%2?1:-1)*(i%4<2?52:66),svgOrigin:OR.foreL,duration:0.07},from+i*0.14);}};
  return K;};
'''

def kate(P, left, top, h, z=5, legs=True, phone=False):
    """Jointed Kate: viewBox 0 0 300 600, feet at y=540. Groups rotate about joints (see OR in LIB)."""
    s = 'stroke="#1B1C31" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"'
    w = round(h * 300 / 600)
    legs_svg = f'''<g id="{P}-k-legL"><line x1="150" y1="362" x2="150" y2="450"/><g id="{P}-k-shinL"><line x1="150" y1="450" x2="150" y2="535"/><line x1="150" y1="537" x2="128" y2="537"/></g></g>
  <g id="{P}-k-legR"><line x1="150" y1="362" x2="150" y2="450"/><g id="{P}-k-shinR"><line x1="150" y1="450" x2="150" y2="535"/><line x1="150" y1="537" x2="172" y2="537"/></g></g>''' if legs else ''
    kphone = f'<g id="{P}-kphone" opacity="0"><rect x="128" y="318" width="44" height="76" rx="9" fill="#2B2D42" stroke="#1B1C31" stroke-width="6"/><rect x="135" y="326" width="30" height="56" rx="4" fill="#FED024" stroke="none"/></g>' if phone else ''
    star = lambda cx, cy: f'<polygon points="{cx},{cy-13} {cx+4},{cy-4} {cx+13},{cy-3} {cx+6},{cy+4} {cx+8},{cy+13} {cx},{cy+8} {cx-8},{cy+13} {cx-6},{cy+4} {cx-13},{cy-3} {cx-4},{cy-4}" fill="#FED024" stroke="#1B1C31" stroke-width="3" stroke-linejoin="round"/>'
    return f'''<svg id="{P}-kate" viewBox="0 0 300 600" style="position:absolute;left:{left}px;top:{top}px;height:{h}px;width:{w}px;overflow:visible;z-index:{z}">
 <ellipse cx="150" cy="545" rx="70" ry="10" fill="#1B1C31" opacity=".10"/>
 <g id="{P}-k-hop"><g id="{P}-k-root">
 <g {s}>{legs_svg}</g>
 <g id="{P}-k-upper">
 <g {s}>
  <line x1="150" y1="157" x2="150" y2="362"/>
  <g id="{P}-k-armL"><line x1="150" y1="195" x2="150" y2="268"/><g id="{P}-k-foreL"><line x1="150" y1="268" x2="150" y2="336"/>{kphone}</g></g>
  <g id="{P}-k-armR"><line x1="150" y1="195" x2="150" y2="268"/><g id="{P}-k-foreR"><line x1="150" y1="268" x2="150" y2="336"/></g></g>
 </g>
 <path d="M112 182 L150 214 L188 182" stroke="#FED024" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <g id="{P}-k-head">
  <circle cx="150" cy="95" r="62" fill="#FFFBF4" stroke="#1B1C31" stroke-width="10"/>
  <circle cx="112" cy="118" r="10" fill="#F4A6A0" opacity=".55"/><circle cx="188" cy="118" r="10" fill="#F4A6A0" opacity=".55"/>
  <path d="M84 150 Q76 24 150 26 Q224 24 216 150 Q206 150 204 104 Q186 60 150 58 Q112 60 96 104 Q94 150 84 150 Z" fill="#1B1C31"/>
  <g id="{P}-k-brows" opacity="0" stroke="#1B1C31" stroke-width="6" stroke-linecap="round"><line x1="116" y1="76" x2="138" y2="82"/><line x1="184" y1="76" x2="162" y2="82"/></g>
  <g id="{P}-k-eyesN"><g id="{P}-k-pupils"><circle cx="128" cy="98" r="8" fill="#1B1C31"/><circle cx="168" cy="98" r="8" fill="#1B1C31"/><circle cx="131" cy="95" r="2.4" fill="#fff"/><circle cx="171" cy="95" r="2.4" fill="#fff"/></g></g>
  <g id="{P}-k-eyesH" opacity="0" stroke="#1B1C31" stroke-width="6" fill="none" stroke-linecap="round"><path d="M117 102 Q128 88 139 102"/><path d="M157 102 Q168 88 179 102"/></g>
  <g id="{P}-k-eyesS" opacity="0">{star(128, 98)}{star(168, 98)}</g>
  <g id="{P}-k-eyesW" opacity="0"><circle cx="128" cy="98" r="11" fill="#fff" stroke="#1B1C31" stroke-width="4"/><circle cx="168" cy="98" r="11" fill="#fff" stroke="#1B1C31" stroke-width="4"/><circle cx="128" cy="99" r="4.5" fill="#1B1C31"/><circle cx="168" cy="99" r="4.5" fill="#1B1C31"/></g>
  <line id="{P}-k-lid" x1="116" y1="94" x2="182" y2="94" stroke="#1B1C31" stroke-width="7" stroke-linecap="round" opacity="0"/>
  <path id="{P}-k-mSmile" d="M128 122 Q148 142 168 122" stroke="#1B1C31" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path id="{P}-k-mOpen" d="M124 118 Q148 156 172 118 Z" fill="#1B1C31" stroke="#1B1C31" stroke-width="4" stroke-linejoin="round" opacity="0"/>
  <ellipse id="{P}-k-mFlat" cx="148" cy="130" rx="14" ry="3" fill="#1B1C31" opacity="0"/>
  <circle id="{P}-k-mO" cx="148" cy="130" r="7" fill="none" stroke="#1B1C31" stroke-width="5" opacity="0"/>
  <path id="{P}-k-sweat" d="M206 70 Q216 88 206 94 Q196 88 206 70 Z" fill="#8FD0F5" stroke="#1B1C31" stroke-width="3" opacity="0"/>
 </g>
 </g></g></g>
</svg>'''

def clock(P, style=''):
    ticks = ''.join(f'<line x1="100" y1="16" x2="100" y2="{30 if k % 3 == 0 else 24}" stroke="#1B1C31" stroke-width="{6 if k % 3 == 0 else 4}" stroke-linecap="round" transform="rotate({k*30} 100 100)"/>' for k in range(12))
    return f'''<div class="clock" id="{P}-clock" style="{style}"><div class="bl" style="left:0;top:0"><svg viewBox="0 0 200 200" width="220" height="220" style="overflow:visible;display:block">
 <circle cx="100" cy="100" r="92" fill="#FFFBF4" stroke="#1B1C31" stroke-width="9"/>{ticks}
 <line id="{P}-hh" x1="100" y1="100" x2="100" y2="56" stroke="#1B1C31" stroke-width="10" stroke-linecap="round"/>
 <line id="{P}-mh" x1="100" y1="100" x2="100" y2="30" stroke="#1B1C31" stroke-width="6" stroke-linecap="round"/>
 <circle id="{P}-hub" cx="100" cy="100" r="9" fill="#FED024" stroke="#1B1C31" stroke-width="4"/>
</svg></div></div>'''

def fb_screen(P):
    return f'''<div class="ui" style="position:absolute;inset:0;background:#F0F2F5">
  <div style="height:38px;background:#1877F2;display:flex;align-items:center;padding:0 12px"><span id="{P}-fbic" style="display:inline-block">{icon('facebook', '#fff', 22)}</span></div>
  <div id="{P}-fbpost" data-layout-allow-overlap style="margin:12px;background:#fff;border-radius:10px;padding:12px 14px;border:1px solid #DDD">
   <div style="display:flex;align-items:center;gap:10px"><span class="av" style="background:#E2B33C;width:34px;height:34px;color:#1B1C31">H</span><div><div style="font:700 16px/1.1 system-ui">Harbour Co.</div><div style="font:400 12px/1.3 system-ui;color:#4B4F56">Just now</div></div></div>
   <div style="font:400 14px/1.3 system-ui;margin:8px 0">Open all weekend. Come say hi!</div>
   <div style="height:96px;border-radius:8px;background:linear-gradient(135deg,#FFE7A3,#F7C948)"></div>
  </div></div>'''

def rp_screen(P):
    dots = ''.join(f'<div style="width:22px;height:22px;border-radius:6px;background:{c};margin:4px auto"></div>' for c in CCOL[:8])
    cols = ['#E2B33C', '', '#7AA6D9', '#8CC7A1', '', '#E59A8C', '#B7A3E0', '', '#F2C57C', '#E2B33C', '#9FC9D6', '', '#8CC7A1', '#7AA6D9', '', '#D9A7C7', '#E2B33C', '', '#F2C57C', '#E59A8C', '']
    cells = ''.join(f'<div style="background:#fff;border:1px solid #E6E6EE;border-radius:4px;height:38px;position:relative">{"<i style=position:absolute;left:3px;right:3px;top:4px;height:8px;border-radius:3px;background:" + c + "></i>" if c else ""}</div>' for c in cols)
    return f'''<div class="ui" style="position:absolute;inset:0;background:#F4F5F8;display:flex">
  <div style="width:44px;background:#fff;border-right:1px solid #E3E3EA;padding-top:6px">{dots}</div>
  <div style="flex:1;padding:8px 10px">
   <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="width:120px">{logo(P+'-mini', 120)}</div><div style="font:700 12px/1 system-ui;color:#0F5132;background:#D1E7DD;padding:4px 8px;border-radius:6px">26 scheduled</div></div>
   <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">{cells}</div>
  </div></div>'''

# desk world geometry (world px): Kate centre x 980, head (980,491), laptop screen html (498..882, 488..744)
KATE_DESK = dict(left=820, top=390, h=640)
LAP = dict(cx=690, cy=616)
PILE = [(1090, 686), (1180, 686), (1270, 686), (1360, 686), (1450, 686), (1135, 602), (1225, 602), (1315, 602), (1180, 518)]
PILE_ICONS = ['instagram', 'tiktok', 'linkedin', 'youtube', 'pinterest', 'threads', 'x', 'google', 'bluesky']

def desk_set(P, screen_html, sandwich=False, pile=False, orbit=''):
    beam = f'<svg class="abs" style="left:0;top:0;z-index:1" width="1920" height="1080"><polygon id="{P}-beam" points="170,120 520,120 1230,990 690,990" fill="#FED024" opacity=".13"/></svg>'
    motes = ''.join(f'<div class="abs mote" id="{P}-mote{i}" style="left:{360 + (i*53) % 560 + (i*7) % 90}px;top:{260 + (i*97) % 560}px;width:{5 + i % 3}px;height:{5 + i % 3}px;border-radius:50%;background:#FFE58A;opacity:.8;z-index:2"></div>' for i in range(16))
    pile_html = ''
    if pile:
        for i, (n, (x, y)) in enumerate(zip(PILE_ICONS, PILE)):
            pile_html += f'<div class="tile" style="transform:translate({x}px,{y}px) rotate({(-1)**i * (4 + i % 3 * 3)}deg);z-index:9">{icon(n, NETC[n], 46)}</div>'
    return f'''<div id="{P}-set" class="layer">
 {beam}{motes}
 <div class="bl" style="left:120px;top:100px;width:440px;height:400px;z-index:3"><svg width="440" height="400" viewBox="120 100 440 400" style="overflow:visible">
   <rect id="{P}-sky" x="140" y="110" width="380" height="360" rx="8" fill="#DDEBF5"/>
   <g id="{P}-sun"><circle cx="425" cy="205" r="44" fill="#FED024" stroke="#1B1C31" stroke-width="5"/>
    <g id="{P}-rays" stroke="#F2B705" stroke-width="6" stroke-linecap="round">{''.join(f'<line x1="425" y1="140" x2="425" y2="122" transform="rotate({a} 425 205)"/>' for a in range(0, 360, 45))}</g></g>
   <g id="{P}-moon" opacity="0"><circle cx="300" cy="200" r="38" fill="#F5F0D6" stroke="#1B1C31" stroke-width="5"/><circle cx="320" cy="188" r="32" fill="#2E3A6E"/></g>
   <rect x="140" y="110" width="380" height="360" rx="8" fill="none" stroke="#1B1C31" stroke-width="6"/>
   <line x1="330" y1="110" x2="330" y2="470" stroke="#1B1C31" stroke-width="6"/><line x1="140" y1="290" x2="520" y2="290" stroke="#1B1C31" stroke-width="6"/>
   <rect x="120" y="462" width="420" height="20" rx="6" fill="#E8C18C" stroke="#1B1C31" stroke-width="5"/></svg></div>
 <div class="bl" style="left:1590px;top:440px;width:200px;height:320px;z-index:3"><svg width="200" height="320" viewBox="1590 440 200 320" style="overflow:visible"><g transform="translate(1690 520)"><rect x="-44" y="120" width="88" height="96" rx="10" fill="#E07A5F" stroke="#1B1C31" stroke-width="6"/>
   <path d="M0 120 Q-66 40 -40 -30 M0 120 Q12 10 2 -60 M0 120 Q56 40 60 -20 M0 120 Q-34 70 -80 50 M0 120 Q44 80 90 64" stroke="#3E8E5A" stroke-width="13" fill="none" stroke-linecap="round"/></g></svg></div>
 <svg class="abs" style="left:0;top:980px;z-index:2" width="1920" height="10"><line x1="0" y1="5" x2="1920" y2="5" stroke="#1B1C31" stroke-width="4" opacity=".25"/></svg>
 <div id="{P}-kw" class="abs" style="left:0;top:0;width:0;height:0;z-index:5"><div class="bl" id="{P}-kb" style="left:0;top:0">{kate(P, KATE_DESK['left'], KATE_DESK['top'], KATE_DESK['h'])}</div></div>
 <div class="bl" style="left:300px;top:760px;width:1320px;height:330px;z-index:6"><svg width="1320" height="330" viewBox="300 760 1320 330" style="overflow:visible">
  <rect x="330" y="798" width="1260" height="300" fill="#E8C18C" stroke="#1B1C31" stroke-width="6"/>
  <line x1="960" y1="798" x2="960" y2="1080" stroke="#1B1C31" stroke-width="5"/><circle cx="930" cy="880" r="7" fill="#1B1C31"/><circle cx="990" cy="880" r="7" fill="#1B1C31"/>
  <rect x="300" y="770" width="1320" height="32" rx="6" fill="#D9A96A" stroke="#1B1C31" stroke-width="6"/></svg></div>
 <div class="bl" style="left:400px;top:460px;width:580px;height:330px;z-index:7"><svg width="580" height="330" viewBox="400 460 580 330" style="overflow:visible">
  <rect x="480" y="470" width="420" height="292" rx="16" fill="#2B2D42" stroke="#1B1C31" stroke-width="6"/>
  <polygon points="440,760 940,760 976,780 404,780" fill="#C9CCD6" stroke="#1B1C31" stroke-width="5" stroke-linejoin="round"/></svg>
  <div class="abs" id="{P}-screen" style="left:98px;top:28px;width:384px;height:256px;overflow:hidden;border-radius:6px">{screen_html}</div>
  <div class="abs" id="{P}-glare" style="left:98px;top:28px;width:384px;height:256px;border-radius:6px;overflow:hidden;opacity:0"><div id="{P}-glareb" style="position:absolute;top:0;bottom:0;left:-200px;width:180px;background:linear-gradient(115deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0))"></div></div></div>
 <div class="bl" style="left:1240px;top:600px;width:120px;height:180px;z-index:7"><svg width="120" height="180" viewBox="1240 600 120 180" style="overflow:visible"><g transform="translate(1250 690)"><rect x="0" y="0" width="70" height="84" rx="10" fill="#fff" stroke="#1B1C31" stroke-width="6"/><path d="M70 20 Q100 22 98 44 Q96 64 70 62" stroke="#1B1C31" stroke-width="6" fill="none"/><rect x="3" y="22" width="64" height="16" fill="#FED024"/></g>
  <g id="{P}-steam" stroke="#1B1C31" stroke-width="4" fill="none" stroke-linecap="round" opacity=".35"><path d="M1270 676 Q1262 660 1272 646 Q1282 632 1274 618"/><path d="M1296 676 Q1288 660 1298 646 Q1308 632 1300 618"/></g></svg></div>
 <div class="bl" style="left:1370px;top:700px;width:140px;height:80px;z-index:7"><svg id="{P}-sandwich" width="140" height="80" viewBox="1370 700 140 80" style="overflow:visible;opacity:{1 if sandwich else 0}"><polygon points="1380,770 1500,770 1440,716" fill="#F6D48B" stroke="#1B1C31" stroke-width="6" stroke-linejoin="round"/><path d="M1396 758 L1484 758" stroke="#7FB069" stroke-width="8" stroke-linecap="round"/></svg></div>
 {pile_html}{orbit}
</div>'''

def wrap(fid, P, css, body, js, T, dur, screen='', boilsel=None, under=''):
    bs = boilsel if boilsel is not None else f"#{P}-cam .bl, #{P}-clock .bl"
    boil_js = f"boil('{bs}',1.1,0.25,3);" if bs else ''
    return f'''<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{BASE_CSS}{css}</style>
      <div id="root" data-composition-id="{fid}" data-width="1920" data-height="1080" data-duration="{dur}">
        <div class="paper"></div><div class="fibers"></div>
{under}
        <div class="cam" id="{P}-cam">
{body}
          <div class="layer" id="{P}-fxw" style="z-index:60;pointer-events:none"></div>
        </div>
{screen}
        <div class="layer" id="{P}-fxs" style="z-index:88;pointer-events:none"></div>
        <div class="grain"></div><div class="vig"></div>
      </div>
      <script>
        (function(){{
          const tl = gsap.timeline({{ paused: true }});
          const T = {json.dumps(T)};
          const P = "{P}";
{LIB}
{js}
          {boil_js}
          tl.to({{}}, {{duration: T.end}}, 0);
          window.__timelines["{fid}"] = tl;
        }})();
      </script>
    </template>
  </body>
</html>'''

