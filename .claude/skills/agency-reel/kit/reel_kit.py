"""Shared build kit for Client vs Agency reels (extracted from ~/videos/agency-reel-finance/build.py,
the approved "living cartoon" 9:16 reel that this kit was verified against — see build_kit.py there for
the reference usage and README.md in this directory for the full API).

A new reel's build.py should be ~100-150 lines: device/screen HTML, extra CSS, the choreography (k1/r1/...),
the end card content, and the SFX list. Everything else — the timing model, base CSS, caption choreography,
camera/rig/idle-life helpers, end-card chrome (slide-in, stamp, url, corner cards), and the main.html /
index.html / timing.json writers — lives here.

Usage sketch:
    from reel_kit import Reel, base_css, safe_html, CW, CH, INK, CREAM, YEL, TEAL, RED, GRN
    reel = Reel(ROOT, order=['k1','r1','k2','r2','k3','r3','r4'])
    reel.rig_setup()
    ... reel-specific choreography using reel.camto/.home/.shot_two/.pop_/.speak/.A ...
    reel.idle_life(blinks=[1.2, 3.3, 5.4])
    reel.name_tags(fade_at=reel.L['k2'] - 0.1)
    reel.caption_choreography()
    reel.title_chrome(out_at=reel.L['r1'] - 0.1)
    reel.hide_cam()
    ... end card ...
    reel.write_main(OUT, BODY, CSS)
    reel.write_index(ROOT, clips)
    reel.write_timing(ROOT, beats)
"""
import os, json
from motion_kit import LIB, kate  # noqa: F401 (kate re-exported for convenience)

CW, CH = 1080, 1920
INK, CREAM, YEL, TEAL, RED, GRN = '#1B1C31', '#FFFBF4', '#FED024', '#14B8A6', '#E5484D', '#18A957'
NOCAPS = os.environ.get('NOCAPS') == '1'
SAFE = os.environ.get('SAFE') == '1'

REST_STAND = "{armL:16,armR:-16,foreL:8,foreR:-8,legL:5,legR:-5,shinL:0,shinR:0,head:0}"
REST_SIT = "{armL:22,armR:-22,foreL:10,foreR:-10,legL:52,legR:-52,shinL:-52,shinR:52,head:0}"
K_FACE_DEFAULT = "{eyes:'eyesN',mouth:'mSmile',lid:0,sweat:0}"
R_FACE_DEFAULT = "{mouth:'mSmile',sweat:0}"


# ---------------------------------------------------------------- small loaders
def load_json(path, default=None):
    return json.load(open(path)) if os.path.exists(path) else ({} if default is None else default)


def load_voice(root):
    return json.load(open(os.path.join(root, 'assets/voice/voice.json')))


def load_timing_cfg(root):
    return load_json(os.path.join(root, 'timing_cfg.json'), {})


# ---------------------------------------------------------------- rig geometry helpers
def rig_scale(rig, base=600):
    """rig is a dict like parts.KATE / parts.REX (left, top, h). Returns the viewBox-px -> world-px factor."""
    return rig['h'] / base


def rig_point(rig, vx, vy, scale=None):
    """A world-space point offset (vx, vy) in the rig's 300x600 viewBox from its top-left."""
    s = scale if scale is not None else rig_scale(rig)
    return (rig['left'] + vx * s, rig['top'] + vy * s)


def inner_box(scr, bezel=14):
    """Top-left of a screen's content box (world px), given a room screen dict {x,y,w,h} and its bezel width."""
    return scr['x'] + bezel, scr['y'] + bezel


# ---------------------------------------------------------------- base CSS (shared chrome)
def base_css(cw=CW, ch=CH, ink=INK, cream=CREAM, yel=YEL, teal=TEAL, red=RED, grn=GRN, extra='', nocaps=None):
    """Root/camera/grain/vignette/particles, title pill+subtitle, bezel/glare, name tags, captions,
    end-card background, headline+swoosh, stamp, url, corner cards, and the safe overlay. `extra` is a
    reel's own CSS (device screens, call chips, end-card widgets, etc.), appended verbatim."""
    nocaps = NOCAPS if nocaps is None else nocaps
    return f'''
@font-face{{font-family:"Manrope";font-weight:200 800;font-display:block;src:url("assets/fonts/Manrope-latin.woff2") format("woff2")}}
@font-face{{font-family:"Brico";font-weight:800;font-display:block;src:url("assets/fonts/BricolageGrotesque-800.woff2") format("woff2")}}
#root{{position:absolute;inset:0;width:{cw}px;height:{ch}px;overflow:hidden;background:#EFE7D8;color:{ink};font-family:"Manrope",system-ui,sans-serif}}
.abs,.bl{{position:absolute}}
#cam{{position:absolute;left:0;top:0;width:{cw}px;height:{ch}px;transform-origin:0 0}}
.grain{{position:absolute;inset:0;opacity:.07;background-image:radial-gradient(#1B1C31 .6px,transparent .7px);background-size:6px 6px;pointer-events:none;z-index:95}}
.fibers{{position:absolute;inset:0;opacity:.4;pointer-events:none;z-index:94;background:radial-gradient(ellipse 380px 120px at 18% 22%,rgba(214,190,140,.2),transparent 70%),radial-gradient(ellipse 520px 160px at 78% 70%,rgba(214,190,140,.18),transparent 70%)}}
.vig{{position:absolute;inset:0;pointer-events:none;z-index:96;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 52%,rgba(70,48,12,.16) 86%,rgba(50,32,8,.3) 100%)}}
.pt{{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;z-index:80}}
.pt.star{{border-radius:0;clip-path:polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%)}}
.tr{{position:absolute;left:0;top:0;width:8px;height:8px;border-radius:50%;background:#1B1C31;opacity:0;z-index:70;pointer-events:none}}
.ttl{{position:absolute;left:50%;top:128px;transform:translateX(-50%);white-space:nowrap;background:#fff;border:5px solid {ink};border-radius:18px;padding:10px 26px 14px;font:800 62px/1 "Brico",sans-serif;letter-spacing:-.01em;box-shadow:6px 6px 0 rgba(27,28,49,.25);z-index:70}}
.sub{{position:absolute;left:50%;top:238px;transform:translateX(-50%);white-space:nowrap;background:{yel};border:4px solid {ink};border-radius:10px;padding:8px 16px;font:800 28px/1 "Manrope";letter-spacing:.14em;z-index:70}}
.bezel{{position:absolute;inset:0;background:{ink};border-radius:24px;padding:14px;box-shadow:0 16px 0 rgba(27,28,49,.12)}}
.glare{{position:absolute;left:14px;top:14px;right:14px;bottom:14px;border-radius:14px;overflow:hidden;pointer-events:none;opacity:0}}
#glareb{{position:absolute;top:0;bottom:0;left:-220px;width:180px;background:linear-gradient(115deg,rgba(255,255,255,0),rgba(255,255,255,.6),rgba(255,255,255,0))}}
.tagp{{position:absolute;top:846px;white-space:nowrap;background:#fff;border:5px solid {ink};border-radius:12px;padding:9px 14px;font:800 23px/1 "Manrope";letter-spacing:.08em;box-shadow:5px 5px 0 rgba(27,28,49,.25);z-index:30}}
.tagp.r{{background:{teal};color:{ink}}} .tagp.k{{background:{yel};color:{ink}}}
.caps{{position:absolute;left:0;right:0;top:1300px;height:0;z-index:75}}
.cap{{position:absolute;left:525px;top:0;transform:translateX(-50%);width:max-content;max-width:810px;text-align:center;font:800 50px/1.16 "Brico",sans-serif;color:{ink};background:#fff;border:4px solid {ink};border-radius:18px;padding:12px 24px 16px;box-shadow:6px 6px 0 rgba(27,28,49,.2)}}
.cap.r{{background:{ink};color:#fff}}
.cap.k{{background:{yel};color:{ink}}}
.cap .w{{display:inline-block;margin:0 .11em}}
.cwho{{display:inline-block;vertical-align:middle;margin-right:12px;font:800 20px/1 "Manrope";letter-spacing:.1em;padding:8px 11px;border-radius:8px;position:relative;top:-5px}}
.cap.r .cwho{{background:{teal};color:{ink}}}
.cap.k .cwho{{background:{ink};color:{yel}}}
.end{{position:absolute;inset:0;z-index:85;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#FFFDF8 0%,#FFF3DA 58%,#F1E3C4 100%)}}
.hl{{position:absolute;left:115px;width:820px;top:290px;font:800 86px/1.06 "Brico";letter-spacing:-.025em;color:{ink}}}
.hl .sw{{position:relative;display:inline-block;isolation:isolate}}
.hl svg.swoosh{{position:absolute;left:-8px;bottom:-4px;width:calc(100% + 16px);height:30px;overflow:visible;z-index:-1}}
.stamp{{position:absolute;left:540px;top:1200px;display:flex;align-items:center;gap:16px;background:#fff;border:9px solid {grn};border-radius:22px;padding:14px 24px;box-shadow:0 18px 40px -12px rgba(0,0,0,.45);z-index:8}}
.stamp img{{height:46px}} .stamp b{{font:800 52px/1 "Brico";color:#128A45}}
.end .url{{position:absolute;left:540px;top:1300px;transform:translateX(-50%);background:{ink};color:{yel};font:800 52px/1 "Brico";padding:16px 30px;border-radius:16px;white-space:nowrap}}
.ccard{{position:absolute;width:180px;height:180px;border:6px solid {ink};border-radius:28px;overflow:hidden;box-shadow:8px 8px 0 rgba(27,28,49,.2);z-index:8}}
.ccin{{position:absolute;left:0;top:0;width:168px;height:168px}}
.safe{{position:absolute;pointer-events:none;z-index:99;background:rgba(229,72,77,.35)}}
{'.caps{display:none !important}' if nocaps else ''}
{extra}
'''


def safe_html(cw=CW, ch=CH, left=110, right=140, top=230, bottom_from=1480, safe=None):
    """The IG safe box overlay (x 110..940, y 230..1480 at 1080x1920). Toggled by the SAFE=1 env flag."""
    safe = SAFE if safe is None else safe
    if not safe:
        return ''
    return f'''<div class="safe" style="left:0;top:0;width:{left}px;height:{ch}px"></div><div class="safe" style="right:0;top:0;width:{right}px;height:{ch}px"></div>
<div class="safe" style="left:{left}px;right:{right}px;top:0;height:{top}px"></div><div class="safe" style="left:{left}px;right:{right}px;top:{bottom_from}px;bottom:0"></div>'''


# ---------------------------------------------------------------- the Reel: timing + choreography + writers
class Reel:
    def __init__(self, root, order, end_card_order=('e1',), cw=CW, ch=CH):
        """root: project dir (has assets/voice/voice.json + timing_cfg.json).
        order: the ORDER list of dialogue-line ids (matches assets/voice/voice.json keys).
        end_card_order: one or more voiced end-card line ids, spoken back to back after END_CARD+E1_LEAD."""
        self.root = root
        self.order = list(order)
        self.end_card_order = tuple(end_card_order)
        self.cw, self.ch = cw, ch
        self.VO = load_voice(root)
        self.TIMING = load_timing_cfg(root)
        self._compute_timing()
        self.js = []
        self.A = self.js.append

    # ---- timing model -------------------------------------------------
    def _compute_timing(self):
        VO, order, TIMING = self.VO, self.order, self.TIMING
        GAP = TIMING.get('GAP', {})
        default_gap = TIMING.get('DEFAULT_GAP', 0.3)
        self.GAP = GAP
        self.LAUGH = TIMING.get('LAUGH', 1.1)
        self.E1_LEAD = TIMING.get('E1_LEAD', 1.0)
        self.HOLD = TIMING.get('HOLD', 1.3)
        L, t = {}, 0.0
        for n in order:
            t += GAP.get(n, default_gap)
            L[n] = round(t, 3)
            t += VO[n]['dur']
        self.L = L
        self.END_CARD = round(t + self.LAUGH, 2)
        EV, te = {}, self.END_CARD + self.E1_LEAD
        for i, n in enumerate(self.end_card_order):
            if i:
                te += GAP.get(n, default_gap)
            EV[n] = round(te, 3)
            te += VO[n]['dur']
        self.EV = EV
        last = self.end_card_order[-1]
        self.E1_SPEECH_END = round(EV[last] + VO[last].get('speech_end', VO[last]['dur']), 3)
        self.TOTAL = round(self.E1_SPEECH_END + self.HOLD, 2)

    def E(self, n):
        return round(self.L[n] + self.VO[n]['dur'], 3)

    def W(self, n, k):
        VO = self.VO
        if isinstance(k, str):
            k = next(i for i, w in enumerate(VO[n]['words']) if w[0].lower().strip('.,!?').startswith(k.lower()))
        return round(self.L[n] + VO[n]['words'][k][1], 3)

    def EW(self, k, i):
        return round(self.EV[k] + self.VO[k]['words'][i][1], 3)

    # ---- captions -------------------------------------------------------
    def chunks(self, n):
        out, cur = [], []
        for k, (w, _) in enumerate(self.VO[n]['words']):
            cur.append(k)
            if w[-1] in '.?!,' or len(cur) >= 5:
                out.append(cur); cur = []
        if cur:
            out.append(cur)
        return out

    def caps_html(self):
        VO, order = self.VO, self.order
        out = []
        for n in order:
            spk = VO[n]['spk']
            who = 'REX' if spk == 'R' else 'KATE'
            for c, ks in enumerate(self.chunks(n)):
                ws = ''.join(f'<span class="w" id="w-{n}-{k}">{VO[n]["words"][k][0]}</span>' for k in ks)
                out.append(f'<div class="cap {spk.lower()}" id="cap-{n}-{c}"><span class="cwho">{who}</span>{ws}</div>')
        return '<div class="caps">' + ''.join(out) + '</div>'

    def caption_choreography(self):
        order, VO, L = self.order, self.VO, self.L
        self.A("gsap.set('.cap',{opacity:0}); gsap.set('.cap .w',{opacity:0,display:'none'});")
        for i, n in enumerate(order):
            nxt = L[order[i + 1]] if i + 1 < len(order) else self.END_CARD
            line_end = min(self.E(n) + 0.5, nxt - 0.03)
            cs = self.chunks(n)
            for c, ks in enumerate(cs):
                t_on = L[n] + VO[n]['words'][ks[0]][1] - 0.02
                t_off = (L[n] + VO[n]['words'][cs[c + 1][0]][1] - 0.03) if c + 1 < len(cs) else line_end
                self.A(f"tl.set('#cap-{n}-{c}',{{opacity:1}},{t_on:.3f}); tl.set('#cap-{n}-{c}',{{opacity:0}},{t_off:.3f});")
                for k2 in ks:
                    at = L[n] + VO[n]['words'][k2][1]
                    self.A(f"tl.set('#w-{n}-{k2}',{{display:'inline-block'}},{at:.3f}); tl.fromTo('#w-{n}-{k2}',{{opacity:0,y:10}},{{opacity:1,y:0,duration:0.08,immediateRender:false}},{at:.3f});")

    # ---- camera / pop / speak -------------------------------------------
    def camto(self, s, px, py, sx, sy, at, d, ease='power2.inOut'):
        CW_, CH_ = self.cw, self.ch
        x = min(0, max(CW_ * (1 - s), sx - px * s))
        y = min(0, max(CH_ * (1 - s), sy - py * s))
        if d <= 0:
            self.A(f"tl.set('#cam',{{scale:{s},x:{x:.1f},y:{y:.1f}}},{at:.3f});")
        else:
            self.A(f"tl.to('#cam',{{scale:{s},x:{x:.1f},y:{y:.1f},duration:{d},ease:'{ease}'}},{at:.3f});")

    def home(self, at, d, ease='power2.inOut'):
        self.camto(1.0, 0, 0, 0, 0, at, d, ease)

    def shot_two(self, at, d=0.4, ease='power2.inOut', s=1.04, cx=525, cy=900):
        """The standard Kate/Rex two-shot for the shared office set (parts.py KATE/REX)."""
        self.camto(s, cx, cy, cx, cy, at, d, ease)

    def pop_(self, sel, at, d=0.3, s=0.6, origin='50% 50%'):
        self.A(f"tl.fromTo('{sel}',{{opacity:0,scale:{s},transformOrigin:'{origin}'}},{{opacity:1,scale:1,duration:{d},ease:'back.out(2)',immediateRender:false}},{at:.3f});")

    def speak(self, P, n, rest_mouth, rig_id=None):
        """P: the JS rig var name ('K' or 'R'). rig_id: element id prefix, default 'kt' for K / 'rx' for R."""
        rig_id = rig_id or ('kt' if P == 'K' else 'rx')
        VO = self.VO
        self.A(f"{P}.face({{mouth:'mOpen'}},{self.L[n]:.3f}); {P}.face({{mouth:'{rest_mouth}'}},{self.E(n) + 0.02:.3f});")
        ws = VO[n]['words']
        for i, (w, wt) in enumerate(ws):
            t0 = self.L[n] + wt
            d = min(0.12, (ws[i + 1][1] - wt - 0.01) if i + 1 < len(ws) else 0.12)
            self.A(f"tl.fromTo('#{rig_id}-k-mOpen',{{scaleY:1,transformOrigin:'50% 0%'}},{{scaleY:0.35,duration:{d:.3f},immediateRender:false}},{t0:.3f});")

    # ---- rig setup / idle life / name tags / title chrome ----------------
    def rig_setup(self, kate_id='kt', rex_id='rx', kate_rest=REST_STAND, rex_rest=REST_SIT,
                  kate_face=K_FACE_DEFAULT, rex_face=R_FACE_DEFAULT):
        """Kate standing + Rex seated rest poses, breathing idle to END_CARD, camera reset. Declares
        the JS globals K and R (rig('kt'), rig('rx')) for the rest of the choreography to use."""
        self.A(f"const K=rig('{kate_id}'), R=rig('{rex_id}');")
        self.A(f"K.set({kate_rest}); K.faceSet({kate_face}); gsap.set('#{kate_id}-k-brows',{{opacity:0}});")
        self.A(f"R.set({rex_rest}); R.faceSet({rex_face});")
        self.A(f"K.breathe(0,{self.END_CARD}); R.breathe(0.4,{self.END_CARD});")
        self.A("gsap.set('#cam',{scale:1,x:0,y:0});")

    def idle_life(self, blinks=None, rex_wrap='#rw', kate_wrap='#kw', cam_boil='#cam .bl',
                  cam_boil_amp=1.0, cam_boil_rot=0.25, cam_boil_seed=3,
                  rig_boil_amp=0.8, rig_boil_rot=0.12, rig_boil_seed=5):
        """Motes drifting, steam wisping, the plant swaying, and hand-drawn boil on the whole scene and
        on the two rigs. `blinks` is a list of times for K.blinks([...]); pass None to skip."""
        if blinks:
            self.A(f"K.blinks({blinks});")
        self.A("const MO=qa('.mote'); tick((t)=>{MO.forEach((e,i)=>gsap.set(e,{x:Math.sin(t*0.6+i)*14,y:-((t*12+i*40)%80)}));});")
        self.A("tick((t)=>{gsap.set('#steam',{y:-((t*14)%10),opacity:0.25+0.12*Math.sin(t*3)});});")
        self.A("tick((t)=>{gsap.set('#plant',{rotation:Math.sin(t*1.3)*1.6,svgOrigin:'80 300'});});")
        self.A(f"boil('{cam_boil}',{cam_boil_amp},{cam_boil_rot},{cam_boil_seed});")
        self.A(f"boil('{rex_wrap},{kate_wrap}',{rig_boil_amp},{rig_boil_rot},{rig_boil_seed});")

    def name_tags(self, fade_at, tag_r='#tag-r', tag_k='#tag-k', pop_r_at=0.3, pop_k_at=0.5):
        self.A(f"gsap.set(['{tag_r}','{tag_k}'],{{opacity:0}});")
        self.pop_(tag_r, pop_r_at)
        self.pop_(tag_k, pop_k_at)
        self.A(f"tl.to(['{tag_r}','{tag_k}'],{{opacity:0,duration:0.2}},{fade_at:.3f});")

    def title_chrome(self, out_at, ttl_sel='#ttl', sub_sel='#sub'):
        self.A(f"tl.fromTo('{ttl_sel}',{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.35,ease:'back.out(2)',immediateRender:false}},0.05);")
        self.A(f"tl.fromTo('{sub_sel}',{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.3,ease:'back.out(2)',immediateRender:false}},0.2);")
        self.A(f"tl.to(['{ttl_sel}','{sub_sel}'],{{opacity:0,duration:0.2}},{out_at:.3f});")

    def hide_cam(self, at=None):
        at = self.END_CARD + 0.32 if at is None else at
        self.A(f"tl.set('#cam',{{opacity:0}},{at:.3f});")

    # ---- end card chrome --------------------------------------------------
    def end_card_slide_in(self, at=None, end_sel='#end'):
        at = self.END_CARD if at is None else at
        self.A(f"tl.set('{end_sel}',{{opacity:1}},{at:.3f}); tl.fromTo('{end_sel}',{{yPercent:100}},{{yPercent:0,duration:0.32,ease:'power3.out',immediateRender:false}},{at:.3f});")

    def headline_in(self, at=None, sel='#hl', swoosh_sel=None, swoosh_at=None):
        at = self.END_CARD + 0.3 if at is None else at
        self.A(f"tl.fromTo('{sel}',{{opacity:0,y:40}},{{opacity:1,y:0,duration:0.4,ease:'back.out(1.6)',immediateRender:false}},{at:.3f});")
        if swoosh_sel:
            swoosh_at = self.END_CARD + 0.75 if swoosh_at is None else swoosh_at
            self.A(f"swoosh('{swoosh_sel}',{swoosh_at:.3f});")

    def stamp_slam(self, at, sel='#stamp', rotation=-6, shake_sel=None, shake_at=None, shake_amp=6, shake_n=6):
        self.A(f"gsap.set('{sel}',{{xPercent:-50,yPercent:-50,rotation:{rotation}}});")
        self.A(f"tl.fromTo('{sel}',{{opacity:0,scale:2.4}},{{opacity:1,scale:1,duration:0.28,ease:'back.out(2)',immediateRender:false}},{at:.3f});")
        if shake_sel:
            self.A(f"shake('{shake_sel}',{(shake_at if shake_at is not None else at + 0.26):.3f},{shake_amp},{shake_n});")

    def url_rise(self, at, sel='#url'):
        self.A(f"tl.fromTo('{sel}',{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.28,ease:'back.out(1.8)',immediateRender:false}},{at:.3f});")

    def corner_card_kate(self, hold_time, kc_id='kc', card_sel='#kcc', pose=None, face=None, extra_props=(), nod=True):
        """A small Kate rig popping into a bottom-corner card during the end-card hold. pose/face are raw
        JS object-literal strings (see REST_STAND/K_FACE_DEFAULT); extra_props are selectors set opacity:1
        right after the rig is created (e.g. a held prop like a phone)."""
        pose = pose or "{armL:100,armR:-16,foreL:104,foreR:-8,legL:5,legR:-5,shinL:0,shinR:0,head:0}"
        face = face or K_FACE_DEFAULT
        self.A(f"const KC=rig('{kc_id}'); KC.set({pose}); KC.faceSet({face}); gsap.set('#{kc_id}-k-brows',{{opacity:0}});")
        for sel in extra_props:
            self.A(f"gsap.set('{sel}',{{opacity:1}});")
        self.A(f"tl.set('{card_sel}',{{opacity:1}},{hold_time - 0.3:.3f}); tl.fromTo('{card_sel}',{{scale:0.2,rotation:-10}},{{scale:1,rotation:-3,duration:0.4,ease:'back.out(2)',transformOrigin:'0% 100%',immediateRender:false}},{hold_time - 0.3:.3f});")
        if nod:
            self.A(f"KC.face({{eyes:'eyesH'}},{hold_time + 0.05:.3f});")
            self.A(f"tl.to('#{kc_id}-k-head',{{y:7,duration:0.14}},{hold_time + 0.1:.3f}); tl.to('#{kc_id}-k-head',{{y:0,duration:0.17}},{hold_time + 0.25:.3f});")

    def corner_card_rex(self, hold_time, rp_id='rp', card_sel='#rpc', wrap_sel='#rpw', pose=None, face=None, extra_props=(), brow_raise=True):
        """A small Rex rig peeking into the opposite bottom-corner card during the end-card hold."""
        pose = pose or "{armL:22,armR:-100,foreL:10,foreR:-104,legL:5,legR:-5,shinL:0,shinR:0,head:-8}"
        face = face or R_FACE_DEFAULT
        self.A(f"const RP=rig('{rp_id}'); RP.set({pose}); RP.faceSet({face});")
        for sel in extra_props:
            self.A(f"gsap.set('{sel}',{{opacity:1}});")
        self.A(f"tl.set('{card_sel}',{{opacity:1}},{hold_time - 0.15:.3f}); tl.fromTo('{card_sel}',{{scale:0.2,rotation:10}},{{scale:1,rotation:3,duration:0.4,ease:'back.out(2)',transformOrigin:'100% 100%',immediateRender:false}},{hold_time - 0.15:.3f});")
        self.A(f"tl.fromTo('{wrap_sel}',{{x:130,rotation:12}},{{x:0,rotation:-4,duration:0.45,ease:'back.out(1.6)',immediateRender:false}},{hold_time:.3f});")
        if brow_raise:
            self.A(f"tl.to('#{rp_id}-k-brows',{{y:-7,duration:0.2}},{hold_time + 0.5:.3f});")

    # ---- writers -----------------------------------------------------------
    def write_main(self, out_dir, body_html, css, comp_id='scene'):
        main = f'''<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{css}</style>
      <div id="root" data-composition-id="{comp_id}" data-width="{self.cw}" data-height="{self.ch}">
{body_html}
      </div>
      <script>
        (function(){{
          window.__timelines = window.__timelines || {{}};
          const tl = gsap.timeline({{ paused: true }});
          const T = {{VW:{self.cw},VH:{self.ch},end:{self.TOTAL}}};
{LIB}
{chr(10).join(self.js)}
          tl.set({{}}, {{}}, {self.TOTAL});
          window.__timelines["{comp_id}"] = tl;
        }})();
      </script>
    </template>
  </body>
</html>'''
        os.makedirs(out_dir, exist_ok=True)
        open(os.path.join(out_dir, 'main.html'), 'w').write(main)
        return main

    def scene_clip(self, comp_id='scene', track_index=0):
        return f'      <div id="el-{comp_id}" data-composition-id="{comp_id}" data-composition-src="compositions/frames/main.html" data-start="0" data-duration="{self.TOTAL}" data-track-index="{track_index}" data-width="{self.cw}" data-height="{self.ch}"></div>'

    def vo_clips(self, track_index=10, end_card_track_start=11):
        """Per-line VO clips for `order`, then one clip per end-card line (consecutive track indices)."""
        VO = self.VO
        clips = []
        for n in self.order:
            clips.append(f'      <audio id="vo-{n}" src="assets/voice/{n}.wav" data-start="{self.L[n]}" data-duration="{VO[n]["dur"]}" data-track-index="{track_index}" data-volume="1"></audio>')
        for i, n in enumerate(self.end_card_order):
            clips.append(f'      <audio id="vo-{n}" src="assets/voice/{n}.wav" data-start="{self.EV[n]}" data-duration="{VO[n]["dur"]}" data-track-index="{end_card_track_start + i}" data-volume="1"></audio>')
        return clips

    def sfx_clips(self, sfx, sdur, start_track=20):
        """sfx: list of (name, at, volume). sdur: {name: duration}."""
        clips = []
        for j, (kk, at, vol) in enumerate(sfx):
            clips.append(f'      <audio id="sfx-{j:02d}" src="assets/sfx/{kk}.wav" data-start="{round(at, 3)}" data-duration="{sdur[kk]}" data-track-index="{start_track + j}" data-volume="{vol}"></audio>')
        return clips

    def music_clip(self, id_, src, start, dur, track_index, volume=1):
        """One extra music/tone clip (room tone, sting, hold music, ...)."""
        return f'      <audio id="{id_}" src="{src}" data-start="{start}" data-duration="{dur}" data-track-index="{track_index}" data-volume="{volume}"></audio>'

    def write_index(self, root, clips, comp_id='main'):
        index = f'''<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={self.cw}, height={self.ch}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      *{{margin:0;padding:0;box-sizing:border-box}}
      html,body{{width:{self.cw}px;height:{self.ch}px;overflow:hidden;background:#000}}
      #root{{position:relative;width:{self.cw}px;height:{self.ch}px;overflow:hidden}}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="{comp_id}" data-start="0" data-width="{self.cw}" data-height="{self.ch}" data-duration="{self.TOTAL}">
{chr(10).join(clips)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["{comp_id}"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
'''
        open(os.path.join(root, 'index.html'), 'w').write(index)
        return index

    def write_timing(self, root, beats):
        json.dump(dict(total=self.TOTAL, end_card=self.END_CARD, L=self.L, EV=self.EV, beats=beats),
                   open(os.path.join(root, 'timing.json'), 'w'), indent=1)
        print('TOTAL', self.TOTAL, 'end card', self.END_CARD, 'L', self.L, 'EV', self.EV)
        print('BEATS', ','.join(f'{v:.2f}' for v in beats.values()))
