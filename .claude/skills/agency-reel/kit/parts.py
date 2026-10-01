import os
INK, CREAM, YEL, TEAL, RED, GRN = '#1B1C31', '#FFFBF4', '#FED024', '#14B8A6', '#E5484D', '#18A957'
# ---------------------------------------------------------------- Rex: the same jointed rig as Kate, his head
def rex(P, left, top, h, z=5, face_dx=14):
    s = 'stroke="#1B1C31" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"'
    w = round(h * 300 / 600)
    return f'''<svg id="{P}-rex" viewBox="0 0 300 600" style="position:absolute;left:{left}px;top:{top}px;height:{h}px;width:{w}px;overflow:visible;z-index:{z}">
 <g id="{P}-k-hop"><g id="{P}-k-root">
 <g {s}>
  <g id="{P}-k-legL"><line x1="150" y1="362" x2="150" y2="450"/><g id="{P}-k-shinL"><line x1="150" y1="450" x2="150" y2="535"/><line x1="150" y1="537" x2="126" y2="537"/></g></g>
  <g id="{P}-k-legR"><line x1="150" y1="362" x2="150" y2="450"/><g id="{P}-k-shinR"><line x1="150" y1="450" x2="150" y2="535"/><line x1="150" y1="537" x2="174" y2="537"/></g></g>
 </g>
 <g id="{P}-k-upper">
 <g {s}>
  <line x1="150" y1="157" x2="150" y2="362"/>
  <g id="{P}-k-armL"><line x1="150" y1="195" x2="150" y2="268"/><g id="{P}-k-foreL"><line x1="150" y1="268" x2="150" y2="336"/></g></g>
  <g id="{P}-k-armR"><line x1="150" y1="195" x2="150" y2="268"/><g id="{P}-k-foreR"><line x1="150" y1="268" x2="150" y2="336"/><g id="{P}-phone" opacity="0"><rect x="128" y="318" width="44" height="76" rx="9" fill="#2B2D42" stroke="#1B1C31" stroke-width="6"/><rect x="135" y="326" width="30" height="56" rx="4" fill="#9CC2F5" stroke="none"/></g></g></g>
 </g>
 <path d="M118 168 Q150 226 182 168" stroke="{YEL}" stroke-width="8" fill="none" stroke-linecap="round"/>
 <circle cx="150" cy="206" r="12" fill="{YEL}" stroke="#B8920A" stroke-width="3"/>
 <g id="{P}-k-head">
  <circle cx="150" cy="95" r="62" fill="{CREAM}" stroke="{INK}" stroke-width="10"/>
  <path d="M84 90 Q96 20 166 26 Q226 34 216 82 Q196 50 152 54 Q108 58 84 90 Z" fill="{INK}"/>
  <g transform="translate({face_dx} 0)">
   <g id="{P}-k-brows"><path d="M110 70 L142 72 M158 72 L190 70" stroke="{INK}" stroke-width="7" stroke-linecap="round"/></g>
   <g id="{P}-k-eyesU"><circle cx="126" cy="88" r="7.5" fill="{INK}"/><circle cx="174" cy="88" r="7.5" fill="{INK}"/></g>
   <g id="{P}-k-shades"><rect x="106" y="80" width="40" height="28" rx="9" fill="{INK}"/><rect x="154" y="80" width="40" height="28" rx="9" fill="{INK}"/>
   <line x1="146" y1="88" x2="154" y2="88" stroke="{INK}" stroke-width="5"/>
   <g id="{P}-k-glint"><line x1="114" y1="88" x2="126" y2="84" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/><line x1="162" y1="88" x2="174" y2="84" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/></g></g>
   <path id="{P}-k-mSmile" d="M124 124 Q154 144 178 120" stroke="{INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path id="{P}-k-mOpen" d="M126 120 Q152 158 176 120 Z" fill="{INK}" stroke="{INK}" stroke-width="4" stroke-linejoin="round" opacity="0"/>
   <ellipse id="{P}-k-mFlat" cx="152" cy="130" rx="15" ry="3" fill="{INK}" opacity="0"/>
   <circle id="{P}-k-mO" cx="152" cy="130" r="7" fill="none" stroke="{INK}" stroke-width="5" opacity="0"/>
  </g>
  <path id="{P}-k-sweat" d="M92 64 Q82 82 92 88 Q102 82 92 64 Z" fill="#8FD0F5" stroke="{INK}" stroke-width="3" opacity="0"/>
 </g>
 </g></g></g>
</svg>'''

def thumb_svg(extra=''):
    # cartoon thumbs up, viewBox 0 0 100 100: cuff on the left, fist, thumb straight up
    return f'''<svg viewBox="0 0 100 100" {extra} style="display:block;width:100%;height:100%;overflow:visible">
 <rect x="8" y="48" width="24" height="44" rx="5" fill="#3B7BD9" stroke="{INK}" stroke-width="5"/>
 <path d="M32 50 L44 46 L50 20 Q52 8 61 10 Q70 13 67 26 L64 44 L82 44 Q92 45 91 55 Q90 60 86 62 Q92 66 88 72 Q86 76 82 77 Q87 81 83 86 Q80 90 74 90 L32 90 Z" fill="#FFC83D" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>
 <path d="M64 62 L86 62 M64 76 L82 76" stroke="{INK}" stroke-width="4" stroke-linecap="round"/>
 <path d="M54 22 Q56 16 60 16" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>
</svg>'''

# ---------------------------------------------------------------- the office (world = canvas, 1080x1920)
SCR = dict(x=150, y=380, w=760, h=450)
KATE = dict(left=640, top=872, h=640)       # head centre ~ (800, 973), feet ~ 1448
REX = dict(left=110, top=906, h=640)        # seated: legs out, feet ~ 1443
def room(screen_html):
    beam = f'<svg class="abs" style="left:0;top:0;z-index:1" width="1080" height="1920"><polygon id="beam" points="-60,0 300,0 900,1420 360,1420" fill="{YEL}" opacity=".12"/></svg>'
    motes = ''.join(f'<div class="abs mote" style="left:{120 + (i*67) % 700}px;top:{240 + (i*113) % 1000}px;width:{5 + i % 3}px;height:{5 + i % 3}px;border-radius:50%;background:#FFE58A;opacity:.75;z-index:2"></div>' for i in range(16))
    frame = lambda x, y, w, h, inner: f'<div class="bl" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:2"><svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{inner}</svg></div>'
    return f'''
 <div class="abs" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,#EFE7D8 0%,#F4EDE0 60%,#EDE3D1 100%);z-index:0"></div>
 <div class="abs" style="left:0;top:1330px;width:1080px;height:590px;background:linear-gradient(180deg,#E3CFAE,#D6BE97);z-index:0"></div>
 <div class="abs" style="left:0;top:1318px;width:1080px;height:16px;background:#C9B08A;border-top:4px solid rgba(27,28,49,.25);z-index:0"></div>
 {''.join(f'<div class="abs" data-layout-allow-overflow style="left:{x}px;top:1334px;width:4px;height:586px;background:rgba(120,90,50,.12);transform:skewX({(x-540)/14:.1f}deg);transform-origin:50% 0;z-index:0"></div>' for x in range(-60, 1200, 150))}
 {beam}{motes}
 {frame(-30, 420, 150, 190, f'<rect x="10" y="10" width="130" height="170" rx="6" fill="#FFF8EA" stroke="{INK}" stroke-width="6"/><circle cx="75" cy="80" r="30" fill="{TEAL}" opacity=".7"/><path d="M20 170 L60 120 L90 150 L110 130 L140 170 Z" fill="#E9C46A"/>')}
 {frame(960, 380, 150, 150, f'<circle cx="75" cy="75" r="62" fill="#FFFBF4" stroke="{INK}" stroke-width="7"/><line x1="75" y1="75" x2="75" y2="36" stroke="{INK}" stroke-width="7" stroke-linecap="round"/><line x1="75" y1="75" x2="104" y2="75" stroke="{INK}" stroke-width="7" stroke-linecap="round"/><circle cx="75" cy="75" r="7" fill="{YEL}" stroke="{INK}" stroke-width="3"/>')}
 <div class="abs" id="screen" style="left:{SCR['x']}px;top:{SCR['y']}px;width:{SCR['w']}px;height:{SCR['h']}px;z-index:3">
  <div class="bezel">{screen_html}</div>
  <div class="glare" id="glare" data-layout-allow-overflow><div id="glareb"></div></div>
 </div>
 <div class="abs" style="left:500px;top:{SCR['y'] + SCR['h']}px;width:60px;height:26px;background:#3A3B52;z-index:2"></div>
 <div class="bl" style="left:945px;top:1080px;width:160px;height:380px;z-index:4"><svg width="160" height="380" viewBox="0 0 160 380" style="overflow:visible">
  <g id="plant"><path d="M80 300 Q20 220 36 140 M80 300 Q92 180 80 90 M80 300 Q140 220 136 150 M80 300 Q44 250 4 236 M80 300 Q120 250 158 232" stroke="#3E8E5A" stroke-width="13" fill="none" stroke-linecap="round"/></g>
  <rect x="34" y="286" width="92" height="86" rx="10" fill="#E07A5F" stroke="{INK}" stroke-width="6"/></svg></div>'''

def chair():   # behind Rex; seat at his hip line
    return f'''<div class="bl" style="left:90px;top:1060px;width:290px;height:400px;z-index:4"><svg width="290" height="400" viewBox="0 0 290 400" style="overflow:visible">
 <rect x="18" y="0" width="34" height="330" rx="14" fill="#5B6270" stroke="{INK}" stroke-width="6"/>
 <rect x="22" y="252" width="250" height="34" rx="12" fill="#6B7383" stroke="{INK}" stroke-width="6"/>
 <rect x="50" y="286" width="22" height="104" fill="#5B6270" stroke="{INK}" stroke-width="5"/><rect x="222" y="286" width="22" height="104" fill="#5B6270" stroke="{INK}" stroke-width="5"/></svg></div>'''

def side_table():
    return f'''<div class="bl" style="left:430px;top:1170px;width:220px;height:290px;z-index:7"><svg width="220" height="290" viewBox="0 0 220 290" style="overflow:visible">
 <rect x="0" y="80" width="220" height="30" rx="8" fill="#D9A96A" stroke="{INK}" stroke-width="6"/>
 <rect x="24" y="108" width="20" height="170" fill="#B5854D" stroke="{INK}" stroke-width="5"/><rect x="176" y="108" width="20" height="170" fill="#B5854D" stroke="{INK}" stroke-width="5"/>
 <g transform="translate(26 20)"><rect x="0" y="0" width="54" height="62" rx="9" fill="#fff" stroke="{INK}" stroke-width="5"/><path d="M54 14 Q78 16 76 32 Q74 48 54 46" stroke="{INK}" stroke-width="5" fill="none"/><rect x="3" y="18" width="48" height="12" fill="{YEL}"/></g>
 <g id="steam" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".35"><path d="M42 12 Q34 -2 44 -14"/><path d="M62 12 Q54 -2 64 -14"/></g>
 <g transform="translate(110 22)"><polygon points="0,58 18,0 98,0 84,58" fill="#9AA0AE" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="52" cy="28" r="7" fill="{YEL}"/><rect x="-8" y="54" width="106" height="10" rx="4" fill="#C9CCD6" stroke="{INK}" stroke-width="4"/></g>
</svg></div>'''

def tag(id_, text, side, px, cls):
    return f'<div class="tagp {cls}" id="{id_}" style="{side}:{px}px">{text}</div>'

