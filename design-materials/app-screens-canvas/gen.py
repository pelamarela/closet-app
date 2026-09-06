#!/usr/bin/env python3
# Generates static .dc.html artboards for the Closet app screens canvas.
import os

OUT = os.path.dirname(os.path.abspath(__file__))

T = {
    'paper': '#F7F6F5', 'white': '#FFFFFF', 'ink': '#000000',
    'peach': '#F2E1D0', 'peachSoft': '#FAF2EA', 'peachDeep': '#E9CBB0',
    'rose': '#DFAFA1', 'roseSoft': '#ECCFC4', 'roseDeep': '#C98E7C',
    'cocoa': '#6F4E37', 'cocoaSoft': '#8A6B54', 'cocoaDeep': '#543A29',
    'line': '#E6E3E0', 'g700': '#2B2B29', 'g500': '#5A5854', 'g400': '#8A8884', 'g200': '#D9D6D2',
}
fD = "'Syne', system-ui, sans-serif"
fS = "'Poppins', system-ui, sans-serif"
fM = "'Space Mono', ui-monospace, monospace"

ICONS = {
    'home': 'M4 11l8-6.5L20 11M6.5 9.4V19h11V9.4',
    'hanger': 'M12 7.5a2 2 0 1 1 2-2M12 7.5v2M3.5 17.5 12 11.5l8.5 6M4 17.5h16',
    'bulb': 'M9 18h6M10 21h4M8 13a4.6 4.6 0 1 1 8 0c-.7 1.1-1 1.9-1 3H9c0-1.1-.3-1.9-1-3Z',
    'user': 'M12 11.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM5.5 20a6.5 6.5 0 0 1 13 0',
    'plus': 'M12 5.5v13M5.5 12h13',
    'check': 'M5 12.5l4.5 4.5L19 6.5',
    'back': 'M15 5.5 8.5 12 15 18.5',
    'next': 'M9 5.5 15.5 12 9 18.5',
    'close': 'M6 6l12 12M18 6 6 18',
    'spark': 'M12 3.5l1.7 5.3 5.3 1.7-5.3 1.7L12 17.5l-1.7-5.3L5 10.5l5.3-1.7zM18.5 16.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z',
    'cal': 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 3.5v4M15.5 3.5v4',
    'sun': 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
    'box': 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M10 13h4',
    'archive': 'M4 5.5h16v3.5H4zM5.5 9v10h13V9M9.5 13.2h5',
    'pen': 'M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5zM15.5 6.5 18.5 9.5',
    'cam': 'M4 8.5h3l1.5-2h7L17 8.5h3v11H4zM12 17a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z',
    'chart': 'M5 19V11M12 19V5M19 19v-6M3.5 19h17',
    'repeat': 'M5 9.5V8a2.5 2.5 0 0 1 2.5-2.5h9M19 14.5V16a2.5 2.5 0 0 1-2.5 2.5h-9M16 2.5 19 5.5 16 8.5M8 15.5 5 18.5 8 21.5',
    'bookmark': 'M6.5 4.5h11v15l-5.5-3.8-5.5 3.8z',
    'trash': 'M5 7.5h14M9.5 7.5V5.3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5M7 7.5 7.8 19a1.4 1.4 0 0 0 1.4 1.3h5.6A1.4 1.4 0 0 0 16.2 19l.8-11.5M10.2 11v6M13.8 11v6',
    'bag': 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
}

def img(src, w=None, h=None, extra=''):
    wa = f'width:{w}px;' if w else ''
    ha = f'height:{h}px;' if h else ''
    return f'<img src="{src}" alt="" style="{wa}{ha}object-fit:contain;display:block;{extra}">'

def icon(name, s=22, w=1.6, c='currentColor', extra=''):
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" style="{extra}">'
            f'<path d="{ICONS[name]}"/></svg>')

PH_TONES = {
    'peach': ('#F5E7DA', '#EAD8C4'), 'rose': ('#E7C6BA', '#DAB0A1'),
    'cocoa': ('#7C5B44', '#61452F'), 'ink': ('#2C2925', '#1A1815'),
    'sand': ('#EDEAE5', '#DFDAD3'), 'paper': ('#F4F2EF', '#E8E4DE'),
}
def ph(tone='sand', extra_style='', label=None):
    a, b = PH_TONES[tone]
    dark = tone in ('cocoa', 'ink')
    lbl = ''
    if label:
        col = 'rgba(255,255,255,.82)' if dark else 'rgba(0,0,0,.5)'
        lbl = f'<div style="position:absolute;left:8px;bottom:7px;font-family:{fM};font-size:9px;letter-spacing:.02em;color:{col}">{label}</div>'
    return (f'<div style="position:relative;width:100%;height:100%;overflow:hidden;'
            f'background-image:repeating-linear-gradient(122deg,{a} 0 18px,{b} 18px 36px);{extra_style}">{lbl}</div>')

def disp(text, s=28, w=600, c=None, extra=''):
    c = c or T['ink']
    head = s >= 24
    font = fD if head else fS
    lh = '1.12' if head else '1.32'
    ls = '-.015em' if head else '-.005em'
    fw = w if head else min(w, 500)
    return f'<div style="font-family:{font};font-size:{s}px;font-weight:{fw};line-height:{lh};letter-spacing:{ls};color:{c};{extra}">{text}</div>'

def body(text, s=14, c=None, extra=''):
    c = c or T['g500']
    return f'<div style="font-family:{fS};font-size:{s}px;line-height:1.6;color:{c};{extra}">{text}</div>'

def mono(text, s=11, c=None, extra=''):
    c = c or T['g400']
    return f'<span style="font-family:{fM};font-size:{s}px;color:{c};letter-spacing:.01em;{extra}">{text}</span>'

BTN_KIND = {
    'primary': (T['ink'], '#fff', 'none'),
    'peach': (T['peach'], T['ink'], 'none'),
    'quiet': ('transparent', T['ink'], f"1px solid {T['g200']}"),
    'white': (T['white'], T['ink'], 'none'),
}
def btn(text, kind='primary', icon_name=None, full=True, extra_style='', flex=None):
    bg, fg, border = BTN_KIND[kind]
    w = 'width:100%;' if full else ''
    fl = f'flex:{flex};' if flex else ''
    ic = icon(icon_name, 19, 1.9, fg) if icon_name else ''
    return (f'<button style="height:52px;padding:0 22px;border-radius:2px;cursor:pointer;{w}{fl}'
            f'font-family:{fS};font-size:14.5px;font-weight:400;display:inline-flex;align-items:center;'
            f'justify-content:center;gap:8px;background:{bg};color:{fg};border:{border};{extra_style}">'
            f'{ic}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{text}</span></button>')

def pill(text, on=False, tone='ink', size='md', count=None, full=False):
    h = {'sm': 34, 'md': 40, 'lg': 46}[size]
    fs = 12.5 if size == 'sm' else 14
    pad = 13 if size == 'sm' else 17
    bg = (T['peach'] if tone == 'peach' else T['ink']) if on else 'transparent'
    fg = (T['ink'] if tone == 'peach' else '#fff') if on else T['g700']
    border = 'none' if on else f"1px solid {T['g200']}"
    w = 'width:100%;justify-content:center;' if full else 'width:auto;flex-shrink:0;'
    cnt = f'<span style="font-family:{fM};font-size:11px;opacity:.55;margin-left:6px">{count}</span>' if count is not None else ''
    return (f'<button style="height:{h}px;{w}display:inline-flex;align-items:center;padding:0 {pad}px;'
            f'border-radius:2px;background:{bg};color:{fg};border:{border};font-family:{fS};font-size:{fs}px;'
            f'font-weight:400;white-space:nowrap">{text}{cnt}</button>')

def card(inner, fill=None, pad=16, shadow=True, extra=''):
    fill = fill or T['white']
    sh = '0 2px 10px rgba(0,0,0,.045)' if shadow else 'none'
    return f'<div style="background:{fill};padding:{pad}px;box-shadow:{sh};{extra}">{inner}</div>'

def item_tile(tone='sand', worn=None, sel=False, extra=''):
    ring = f"0 0 0 2.5px {T['ink']}" if sel else f"inset 0 0 0 1px {T['line']}"
    badge = ''
    if worn is not None:
        badge = (f'<div style="position:absolute;right:6px;bottom:6px;height:20px;padding:0 7px;border-radius:2px;'
                  f'background:rgba(247,246,245,.92);display:flex;align-items:center;font-family:{fM};font-size:10px;font-weight:700">{worn}&times;</div>')
    check = ''
    if sel:
        check = f'<div style="position:absolute;top:6px;right:6px;width:22px;height:22px;background:{T["ink"]};color:#fff;display:flex;align-items:center;justify-content:center">{icon("check",13,2.6,"#fff")}</div>'
    return (f'<div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;box-shadow:{ring};{extra}">'
            f'{ph(tone)}{badge}{check}</div>')

def collage(tones, extra_style=''):
    n = len(tones)
    cols = 2 if n <= 4 else 3
    cells = ''.join(f'<div style="position:relative">{ph(t)}</div>' for t in tones)
    return (f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:1px;width:100%;height:100%;'
            f'background:{T["line"]};{extra_style}">{cells}</div>')

def dots_row(active, tone=None, n=5):
    tone = tone or T['cocoa']
    cells = []
    for i in range(n):
        bg = tone if i < active else T['g200']
        cells.append(f'<div style="width:7px;height:7px;border-radius:2px;background:{bg}"></div>')
    return f'<div style="display:flex;gap:4px">{"".join(cells)}</div>'

def grid3(cells_html):
    return f'<div style="display:grid;grid-template-columns:repeat(3,1fr)">{cells_html}</div>'

def secH(title, right=None):
    r = f'<button style="background:none;border:none;padding:0;cursor:pointer;font-family:{fS};font-size:13px;color:{T["cocoa"]};display:flex;align-items:center;gap:3px">{right}{icon("next",14,2,T["cocoa"])}</button>' if right else ''
    return (f'<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px">'
            f'<div style="font-family:{fS};font-size:14.5px;font-weight:500;color:{T["ink"]}">{title}</div>{r}</div>')

# ── App shell ────────────────────────────────────────────────────────────
FRAME_W = 390
FRAME_H = 844

TABS = [
    ('home', 'Today'), ('hanger', 'Closet'), None, ('bulb', 'Ideas'), ('user', 'Me'),
]

def shell(title_label, content_html, active='home', bg=None):
    bg = bg or T['paper']
    header = (
        f'<div style="height:58px;border-bottom:1px solid {T["line"]};display:flex;align-items:center;'
        f'justify-content:space-between;padding:0 22px;flex-shrink:0;background:{T["paper"]}">'
        f'<div style="display:flex;align-items:center;gap:8px">'
        f'{img("logo.png", 24, 24, "flex-shrink:0")}'
        f'<span style="font-family:{fS};font-size:14px;font-weight:600;letter-spacing:-.01em;color:{T["ink"]}">closet</span></div>'
        f'<div style="width:36px;height:36px;border-radius:2px;background:{T["peach"]};display:flex;align-items:center;'
        f'justify-content:center;font-family:{fS};font-size:15px;font-weight:600;color:{T["ink"]}">S</div></div>'
    )
    tabs_html = ''
    for t in TABS:
        if t is None:
            tabs_html += (
                f'<div style="width:78px;display:flex;justify-content:center">'
                f'<div style="width:56px;height:56px;border-radius:2px;background:{T["ink"]};color:#fff;'
                f'display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:-30px;'
                f'box-shadow:0 8px 20px rgba(0,0,0,.22)">{icon("cal",22,1.9,"#fff")}'
                f'<div style="font-family:{fS};font-size:8.5px;font-weight:500;letter-spacing:.06em;'
                f'text-transform:uppercase;margin-top:-1px">log</div></div></div>'
            )
            continue
        name, label = t
        on = name == active
        color = T['ink'] if on else T['g400']
        w = 1.9 if on else 1.5
        fw = 500 if on else 400
        tabs_html += (
            f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;color:{color}">'
            f'{icon(name, 23, w, color)}<div style="font-family:{fS};font-size:10.5px;font-weight:{fw}">{label}</div></div>'
        )
    tabbar = (
        f'<div style="height:76px;background:rgba(247,246,245,.94);border-top:1px solid {T["line"]};'
        f'display:flex;align-items:center;flex-shrink:0">{tabs_html}</div>'
    )
    # Height is content-driven, not clamped to a device frame — this is a
    # static mockup for review, not a scrollable viewport, so the whole page
    # should render in full rather than clipping at a phone's screen height.
    return (
        f'<div style="width:{FRAME_W}px;background:{bg};display:flex;flex-direction:column;'
        f'font-family:{fS};position:relative">'
        f'{header}<div>{content_html}</div>{tabbar}</div>'
    )

SIDENAV_W = 236
CONTENT_MAX_W = 1320
DESKTOP_W = 1440

SIDENAV_ITEMS = [
    ('home', 'Today'), ('hanger', 'Closet'), ('bulb', 'Ideas'), ('user', 'Me'),
    ('chart', 'Statistics'), ('bag', 'Shop'),
]

def sidenav_html(active='home'):
    nav_rows = ''
    for name, label in SIDENAV_ITEMS:
        on = name == active
        bg = T['peach'] if on else 'transparent'
        color = T['ink'] if on else T['g500']
        fw = 600 if on else 400
        w = 1.9 if on else 1.5
        nav_rows += (
            f'<div style="height:46px;border-radius:2px;padding:0 14px;display:flex;align-items:center;gap:11px;'
            f'background:{bg};font-family:{fS};font-size:14.5px;font-weight:{fw};color:{color}">'
            f'{icon(name, 21, w, color)}{label}</div>'
        )
    # No fixed height — a flex row's default align-items:stretch already makes
    # this match whichever of the two columns (this or main) is naturally taller.
    return (
        f'<div style="width:{SIDENAV_W}px;flex-shrink:0;border-right:1px solid {T["line"]};background:{T["paper"]};'
        f'padding:30px 18px;display:flex;flex-direction:column;gap:6px;box-sizing:border-box">'
        f'<div style="display:flex;align-items:center;gap:9px;padding:0 12px 26px">'
        f'{img("logo.png", 26, 26)}<span style="font-family:{fS};font-size:15px;font-weight:600;color:{T["ink"]}">closet</span></div>'
        f'<div style="padding:0 0 18px">{btn("Log an outfit", "primary", "cal")}</div>'
        f'{nav_rows}'
        f'<div style="flex:1"></div>'
        f'<div style="display:flex;align-items:center;gap:11px;padding:0 12px">'
        f'<div style="width:34px;height:34px;border-radius:2px;background:{T["peach"]};display:flex;align-items:center;'
        f'justify-content:center;font-family:{fS};font-size:14px;font-weight:600;color:{T["ink"]};flex-shrink:0">S</div>'
        f'<div style="font-family:{fS};font-size:13.5px;font-weight:500;color:{T["ink"]}">spelaa.newsletter</div></div></div>'
    )

def desktop_shell(content_html, active='home', h=None, main_bg_css=None):
    # `h` is accepted for call-site compatibility but no longer used to clamp
    # anything — height is content-driven (see shell() above for why), and the
    # flex row's default align-items:stretch keeps the sidenav matching whatever
    # height the main column naturally ends up at.
    main_bg_css = main_bg_css if main_bg_css is not None else f'background:{T["paper"]};'
    main = (
        f'<div style="flex:1;min-width:0;padding:30px 44px 40px;box-sizing:border-box;{main_bg_css}">'
        f'<div style="max-width:{CONTENT_MAX_W}px;margin:0 auto">{content_html}</div></div>'
    )
    return (
        f'<div style="width:{DESKTOP_W}px;background:{T["paper"]};display:flex;'
        f'font-family:{fS};position:relative">{sidenav_html(active)}{main}</div>'
    )

def split(left_html, right_html, left_w=None, right_w=None, gap=44):
    lw = f'width:{left_w}px;flex-shrink:0;' if left_w else 'flex:1;min-width:0;'
    rw = f'width:{right_w}px;flex-shrink:0;' if right_w else 'flex:1;min-width:0;'
    return (f'<div style="display:flex;gap:{gap}px;align-items:flex-start">'
            f'<div style="{lw}">{left_html}</div><div style="{rw}">{right_html}</div></div>')

def v4bar(title=None, back=False, right=''):
    left = f'{icon("back",20,1.7,T["ink"])}<span style="font-family:{fS};font-size:14px;font-weight:500;color:{T["ink"]}">{title or ""}</span>' if back else f'<span style="font-family:{fS};font-size:14px;font-weight:500">{title or ""}</span>'
    return (f'<div style="height:44px;padding:0 22px;display:flex;align-items:center;justify-content:space-between;'
            f'position:sticky;top:0;background:{T["paper"]};z-index:5">'
            f'<div style="display:flex;align-items:center;gap:6px">{left}</div>'
            f'<div style="display:flex;align-items:center;gap:16px">{right}</div></div>')

def page_wrap(*blocks):
    return ''.join(blocks)

def frame(name, artboard_html):
    return (
        '<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n'
        '<script src="./support.js"></script>\n</head>\n<body>\n<x-dc>\n<helmet>\n<style>\n'
        "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Poppins:ital,wght@0,400;0,500;0,600;1,400&family=Space+Mono&display=swap');\n"
        '* { box-sizing: border-box; }\nbody { margin: 0; background: #EDEBE8; }\n'
        'button { font: inherit; }\na { color: ' + T['cocoa'] + '; } a:hover { color: ' + T['cocoaDeep'] + '; }\n'
        '</style>\n</helmet>\n' + artboard_html + '\n</x-dc>\n</body>\n</html>\n'
    )

def write(name, html):
    path = os.path.join(OUT, f'{name}.dc.html')
    with open(path, 'w') as f:
        f.write(frame(name, html))
    print('wrote', name)

print("helpers loaded")
