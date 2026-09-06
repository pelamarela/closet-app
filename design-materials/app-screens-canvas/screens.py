#!/usr/bin/env python3
from gen import *

# ── 1. Main = Today (logged) ─────────────────────────────────────────────
def screen_today():
    hero = (
        f'<div style="padding:20px 22px 0">'
        f'<div style="position:relative;width:100%;aspect-ratio:4/3">{collage(["cocoa","rose","sand","peach"])}'
        f'<div style="position:absolute;top:14px;left:14px;height:30px;display:inline-flex;align-items:center;'
        f'padding:0 13px;background:rgba(247,246,245,.94);font-family:{fS};font-size:12.5px;font-weight:600">Work</div></div>'
        f'<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-top:16px">'
        f'<div>{disp("Zara Black + 3 more.", 21)}{body("4 pieces &middot; logged at 8:12 AM", 13, None, "margin-top:5px")}</div>'
        f'<div style="width:52px;height:52px;border-radius:2px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center;flex-shrink:0">{icon("next",21,1.7,T["ink"])}</div>'
        f'</div></div>'
    )
    week_days = ['M','T','W','T','F','S','S']
    strip_cells = ''
    for i, d in enumerate(week_days):
        is_today = i == 0
        tone = ['cocoa','rose','peach',None,None,None,None][i]
        inner = ph(tone) if tone else f'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:{T["g200"]}">{icon("plus",15,1.8,T["g200"])}</div>'
        ring = f'inset 0 0 0 2px {T["ink"]}' if is_today else f'inset 0 0 0 1px {T["line"]}'
        strip_cells += (
            f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">'
            f'{mono(d, 10.5, T["ink"] if is_today else T["g400"], "font-weight:" + ("700" if is_today else "400") + ";text-transform:uppercase")}'
            f'<div style="width:100%;aspect-ratio:3/4;overflow:hidden;box-shadow:{ring}">{inner}</div>'
            f'{mono(f"{i+1:02d}", 10, T["ink"] if is_today else T["g400"])}</div>'
        )
    week = (
        f'<div style="padding:22px 22px 0">{secH("This week", "Month")}'
        f'<div style="display:flex;gap:7px">{strip_cells}</div></div>'
    )
    trend = (
        f'<div style="padding:18px 22px 0">'
        f'{card(body("9 outfits logged in aug", 13.5, T["cocoa"]) + disp("Busier than usual.", 17, 400, None, "margin-top:4px"), T["peachSoft"], 16, False)}'
        f'</div>'
    )
    past = (
        f'<div style="padding:20px 22px 0">{secH("Past outfits", "Calendar")}'
        + ''.join(
            f'<div style="display:flex;align-items:center;gap:13px;padding:10px 0;border-bottom:{"1px solid " + T["line"] if i < 2 else "none"}">'
            f'<div style="width:38px;height:47px;flex-shrink:0">{ph(tone)}</div>'
            f'<div style="flex:1;min-width:0">{body(name, 13.5, T["ink"], "font-weight:500;font-family:" + fS)}{mono(day, 10.5, None, "margin-top:2px")}</div>'
            f'{icon("next",16,1.7,T["g400"])}</div>'
            for tone, name, day in [('rose', 'Topshop Paradiso + 3 more', 'fri 28 &middot; casual'), ('peach', 'Cos Denim + 5 more', 'thu 27 &middot; work'), ('sand', '4505 Leggings + 2 more', 'wed 26 &middot; tennis')]
        ) + '</div>'
    )
    content = hero + week + trend + past
    return shell('Today', content, 'home')

# ── 1b. Today — nothing logged yet ────────────────────────────────────────
def screen_today_empty():
    dotted_bg = (f'background-color:{T["paper"]};background-image:radial-gradient(circle,rgba(0,0,0,.13) 1px,transparent 1.4px);'
                 f'background-size:22px 22px;')
    empty_card = (
        f'<div style="padding:30px 24px 26px;border:1px solid {T["line"]};{dotted_bg}">'
        f'{img("wave.png", 92, None, "margin-bottom:18px;opacity:.95")}'
        f'{disp("Nothing on today yet.", 22)}'
        f'{body("You can log it yourself or I can pull something together from your closet.", 14, None, "margin-top:8px;max-width:280px")}'
        f'<div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">'
        f'{btn("Log what I&#39;m wearing", "primary", "cal")}{btn("Suggest three looks", "peach", "spark")}</div></div>'
    )
    content = f'<div style="padding:20px 22px 0">{empty_card}</div>'
    return shell('Today (empty)', content, 'home')

# ── 2. Login ─────────────────────────────────────────────────────────────
def screen_login():
    field = lambda label, val: (
        f'<div style="padding:12px 0;border-bottom:1px solid {T["line"]}">'
        f'{body(label, 12.5, T["g500"], "margin-bottom:4px")}'
        f'<div style="font-family:{fS};font-size:15px;color:{T["g400"]}">{val}</div></div>'
    )
    content = (
        f'<div style="padding:36px 22px 0;display:flex;justify-content:center">{img("logo.png", 108, 108)}</div>'
        f'<div style="padding:22px 22px 0;text-align:center">{disp("Your closet,<br/>on every device.", 34, 600, None, "line-height:1.1")}</div>'
        f'<div style="padding:28px 22px 0"><div style="height:80px;border:1px solid {T["line"]};display:flex;align-items:center;padding:0 18px;'
        f'background-color:{T["paper"]};background-image:radial-gradient(circle,rgba(0,0,0,.13) 1px,transparent 1.4px);background-size:22px 22px">'
        f'{img("wave.png", 46, None, "opacity:.95")}</div></div>'
        f'<div style="padding:22px 22px 0;display:flex;gap:8px"><div style="flex:1">{pill("Sign in", True, "ink", "lg", None, True)}</div>'
        f'<div style="flex:1">{pill("Create account", False, "ink", "lg", None, True)}</div></div>'
        f'<div style="padding:22px 22px 28px">{field("Email", "")}{field("Password", "")}'
        f'<div style="margin-top:22px">{btn("Sign in")}</div></div>'
        f'<div style="padding:18px 0;text-align:center">{mono("pelamarela closet app v3.0", 10.5)}</div>'
    )
    return shell('Sign in', content, None)

# ── 3. Month / Calendar ───────────────────────────────────────────────────
def screen_month():
    dow = ['m','t','w','t','f','s','s']
    days_row = ''.join(f'<div style="text-align:center">{mono(d, 10, None, "text-transform:uppercase")}</div>' for d in dow)
    import random
    random.seed(4)
    cells = ''
    for d in range(1, 32):
        has = random.random() > 0.35
        tone = random.choice(['cocoa','rose','peach','sand']) if has else None
        sel = d == 28
        bg = ph(tone) if tone else ''
        border = f'inset 0 0 0 2px {T["ink"]}' if sel else (f'inset 0 0 0 1px {T["line"]}' if not tone else 'none')
        cells += (f'<div style="position:relative;aspect-ratio:3/4;overflow:hidden;box-shadow:{border}">{bg}'
                  f'<div style="position:absolute;top:3px;left:4px;font-family:{fM};font-size:9.5px;color:{"rgba(0,0,0,.7)" if tone else T["g400"]}">{d}</div></div>')
    content = (
        f'<div style="padding:16px 22px 0;display:flex;align-items:flex-end;justify-content:space-between">'
        f'<div>{mono("2026", 11.5, T["cocoa"])}{disp("August", 30, 600, None, "margin-top:4px")}</div>'
        f'<div style="display:flex;gap:6px">'
        f'<div style="width:44px;height:44px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">{icon("back",18,1.7)}</div>'
        f'<div style="width:44px;height:44px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">{icon("next",18,1.7)}</div></div></div>'
        f'<div style="padding:18px 22px 0"><div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:8px">{days_row}</div>'
        f'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">{cells}</div></div>'
        f'<div style="padding:26px 22px 0">{secH("28 Aug", "Clear")}'
        f'<div style="display:flex;align-items:center;gap:13px;padding:9px 0">'
        f'<div style="width:38px;height:48px;flex-shrink:0">{ph("rose")}</div>'
        f'<div style="flex:1;min-width:0">{body("Topshop Paradiso + 3 more", 14, T["ink"], "font-weight:500")}{mono("fri &middot; casual &middot; 4 pieces", 11, None, "margin-top:2px")}</div>'
        f'{icon("next",16,1.7,T["g400"])}</div>'
        f'<div style="margin-top:20px">{btn("Log outfit", "primary", "cal")}</div></div>'
    )
    return shell('Month', content, 'home')

# ── 4. Outfit Detail ───────────────────────────────────────────────────────
def screen_outfit_detail():
    pieces = [('rose','Ti Sento Round Ring','accessory','1&times;'), ('sand','Zara Black Balloon Pants','bottom','4&times;'),
              ('cocoa','Byredo Pulp','fragrance','12&times;'), ('peach','Bottega Veneta Andiamo','accessory','2&times;'),
              ('sand','Topshop Ecru Tshirt','top','7&times;'), ('rose','Gucci Princetown Loafer','shoes','8&times;')]
    rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:9px 0;border-bottom:{"1px solid " + T["line"] if i < len(pieces)-1 else "none"}">'
        f'<div style="width:36px;height:45px;flex-shrink:0">{ph(tone)}</div>'
        f'<div style="flex:1;min-width:0">{body(name, 14, T["ink"], "font-weight:500")}{mono(cat, 10.5, None, "margin-top:2px")}</div>'
        f'{mono(n, 11, T["cocoa"], "font-weight:700")}</div>'
        for i, (tone, name, cat, n) in enumerate(pieces)
    )
    content = (
        v4bar('Month', True, icon('pen',20,1.6) + icon('trash',19,1.6,T['g400'])) +
        f'<div style="padding:8px 22px 0"><div style="width:100%;aspect-ratio:4/3">{collage(["cocoa","rose","sand","peach","cocoa","sand"])}</div></div>'
        f'<div style="padding:18px 22px 0">'
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">{mono("WORK", 11, T["cocoa"], "text-transform:uppercase")}{mono("01 sep &middot; tue", 11)}</div>'
        f'{disp("Zara Black + 8 more.", 25)}{body("9 pieces", 13, None, "margin-top:5px")}'
        f'<div style="margin-top:22px">{btn("Wear again", "primary", "repeat")}</div>'
        f'<div style="margin-top:26px">{secH("In this look", "9 pieces")}{rows}</div></div>'
    )
    return shell('Outfit', content, 'home')

# ── 5. Closet / Wardrobe ──────────────────────────────────────────────────
def screen_closet():
    filters = ['all','top','btm','1pc','otw','shoe','acc']
    pills = ''.join(pill(f, i == 0, 'ink', 'sm', 24 if i == 0 else None) for i, f in enumerate(filters))
    tones = ['sand','cocoa','rose','peach','sand','cocoa','rose','peach','sand','cocoa','rose','peach']
    tiles = ''.join(item_tile(t, worn=(i % 5) + 1) for i, t in enumerate(tones))
    content = (
        f'<div style="padding:4px 22px 0;display:flex;align-items:center;justify-content:space-between">'
        f'{disp("Closet", 30)}'
        f'<div style="display:flex;align-items:center;gap:10px">'
        f'<div style="display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;background:{T["g200"]}55">{icon("plus",15,1.9)}<span style="font-family:{fS};font-size:12.5px;font-weight:600">Add</span></div>'
        f'<div style="display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;background:{T["peachSoft"]};color:{T["cocoa"]}">{icon("bag",15,1.8,T["cocoa"])}<span style="font-family:{fS};font-size:12.5px;font-weight:600">Shop</span></div></div></div>'
        f'<div style="padding:4px 22px 0;display:flex;justify-content:flex-end">{mono("24 items &middot; select", 13, T["g500"], "font-family:" + fS)}</div>'
        f'<div style="display:flex;gap:8px;padding:14px 22px 0;overflow-x:auto">{pills}</div>'
        f'<div style="padding:16px 22px 0;font-family:{fS};font-size:13px;font-weight:500">Recently added</div>'
        f'<div style="padding:10px 22px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">{tiles}</div>'
        f'<div style="padding:20px 22px 0"><div style="display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid {T["line"]};border-bottom:1px solid {T["line"]}">'
        f'{icon("archive",20,1.6,T["cocoa"])}<div style="flex:1">{body("3 pieces haven&#39;t left the closet in a year.", 13)}</div>{pill("Review", False, "ink", "sm")}</div></div>'
    )
    return shell('Closet', content, 'hanger')

# ── 6. Item Detail ─────────────────────────────────────────────────────────
def screen_item_detail():
    stats = [('Worn', '8&times;'), ('Last', '2026-08-21'), ('Average', '2.1 / mo')]
    stat_cells = ''.join(
        f'<div style="padding:15px 14px;border-left:{"1px solid rgba(0,0,0,.07)" if i else "none"}">'
        f'<div style="font-family:{fS};font-size:11.5px;color:{T["cocoa"]};font-weight:500">{k}</div>'
        f'<div style="font-family:{fS};font-size:17px;font-weight:600;margin-top:3px">{v}</div></div>'
        for i, (k, v) in enumerate(stats)
    )
    attrs = [('Colour','Brown'), ('Material','Wool'), ('Brand','COS')]
    attr_rows = ''.join(
        f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}">'
        f'<span style="font-family:{fS};font-size:15px">{k}</span>{mono(v, 12.5)}</div>' for k, v in attrs
    )
    worn_with = ''.join(f'<div style="flex:1;min-width:0"><div style="width:100%;aspect-ratio:3/4">{ph(t)}</div>{mono(d, 10, None, "margin-top:5px")}</div>'
                         for t, d in [('cocoa','21 08'), ('rose','15 08'), ('sand','02 08'), ('peach','28 07')])
    warmth_row = (f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}">'
                  f'<span style="font-family:{fS};font-size:15px">Warmth</span>{dots_row(4, T["cocoa"])}</div>')
    formality_row = (f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px">'
                      f'<span style="font-family:{fS};font-size:15px">Formality</span>{dots_row(2, T["roseDeep"])}</div>')
    stat_grid = grid3(stat_cells)
    content = (
        v4bar('Closet', True, icon('pen',20,1.6) + icon('archive',19,1.6,T['g400'])) +
        f'<div style="padding:8px 22px 0"><div style="width:100%;aspect-ratio:1/1">{ph("cocoa")}</div></div>'
        f'<div style="padding:18px 22px 0">{mono("COS &middot; top", 11.5, T["cocoa"])}{disp("Wool Blend Jumper", 27, 600, None, "margin-top:5px")}'
        f'<div style="margin-top:18px">{card(stat_grid, T["peach"], 0, False)}</div>'
        f'<div style="margin-top:18px">{btn("Wear it today", "primary", "check")}</div>'
        f'<div style="margin-top:26px">{secH("Details")}{attr_rows}{warmth_row}{formality_row}</div>'
        f'</div>'
        f'<div style="padding:0 22px 0"><div style="margin-top:14px">{secH("Worn with", "All 8")}<div style="display:flex;gap:9px">{worn_with}</div></div></div>'
    )
    return shell('Item', content, 'hanger')

# ── 7. Add Item ────────────────────────────────────────────────────────────
def screen_add_item():
    dot = lambda active, tone: f'<div style="flex:1;height:36px;background:{tone if active else "transparent"};box-shadow:inset 0 0 0 1px {tone if active else T["g200"]};display:flex;align-items:center;justify-content:center;font-family:{fM};font-size:11px;font-weight:700;color:{"#fff" if active else T["g400"]}">&nbsp;</div>'
    warmth_dots = ''.join(dot(i < 2, T['cocoa']) for i in range(5))
    formality_dots = ''.join(dot(i < 1, T['roseDeep']) for i in range(5))
    cats = ['top','btm','1pc','otw','shoe','acc','frag']
    cat_pills = ''.join(pill(c, i == 0, 'ink', 'sm') for i, c in enumerate(cats))
    field = lambda label, val, ph_text=None: (
        f'<div style="margin-bottom:18px">{body(label, 12.5, T["g500"], "margin-bottom:6px")}'
        f'<div style="font-family:{fS};font-size:15px;color:{T["ink"] if val else T["g400"]};border-bottom:1px solid {T["line"]};padding-bottom:8px">{val or ph_text}</div></div>'
    )
    content = (
        v4bar('Closet', True, icon('archive',19,1.6,T['g400'])) +
        f'<div style="padding:4px 22px 0">{disp("Add an item", 24)}</div>'
        f'<div style="padding:18px 22px 0"><div style="width:100%;aspect-ratio:4/3;border:1.5px dashed {T["g200"]};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">'
        f'{icon("cam",26,1.4,T["g400"])}{body("Tap to add a photo", 13.5, T["ink"])}{mono("max 1200px &middot; ~300 KB &middot; JPEG", 10)}</div></div>'
        f'<div style="padding:26px 22px 0">'
        f'<div style="margin-bottom:20px">{body("Category", 12.5, T["g500"], "margin-bottom:8px")}<div style="display:flex;flex-wrap:wrap;gap:6px">{cat_pills}</div></div>'
        f'<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;margin-bottom:8px">{body("Warmth", 12.5, T["g500"])}{mono("1 = light &middot; 5 = heavy", 11)}</div><div style="display:flex;gap:6px">{warmth_dots}</div></div>'
        f'<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;margin-bottom:8px">{body("Formality", 12.5, T["g500"])}{mono("1 = casual &middot; 5 = formal", 11)}</div><div style="display:flex;gap:6px">{formality_dots}</div></div>'
        f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-top:20px;margin-bottom:20px">'
        f'<div>{body("Sport / gym only", 12.5, T["g500"])}{body("Excluded from everyday outfit suggestions", 11, T["g400"], "margin-top:3px")}</div>'
        f'<div style="width:40px;height:24px;border-radius:12px;padding:2px;background:{T["g200"]};display:flex;justify-content:flex-start;flex-shrink:0"><div style="width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div></div></div>'
        f'{field("Colour", "white")}{field("Brand", None, "e.g. Toteme")}{field("Material", None, "cotton, wool, silk&hellip;")}</div>'
        f'<div style="padding:14px 22px 20px;display:flex;gap:10px;border-top:1px solid ' + T['line'] + '">'
        f'<div style="flex:1">{btn("Cancel", "quiet", None, True)}</div><div style="flex:1.6">{btn("Add to closet", "primary", "check", True)}</div></div>'
    )
    return shell('Add item', content, 'hanger')

# ── 8. Batch Upload review ────────────────────────────────────────────────
def screen_batch_upload():
    content = (
        f'<div style="padding:16px 22px 0"><div style="display:flex;justify-content:space-between;align-items:center">'
        f'<div style="display:flex;align-items:center;gap:6px;font-family:{fS};font-size:13px;font-weight:600">{icon("back",16,1.6)}Cancel</div>'
        f'{mono("3 / 8", 11)}</div><div style="height:2px;background:{T["g200"]};margin-top:12px"><div style="height:100%;width:37%;background:{T["ink"]}"></div></div></div>'
        f'<div style="padding:18px 22px 0"><div style="width:100%;aspect-ratio:4/3;box-shadow:inset 0 0 0 1px {T["line"]}">{ph("rose")}</div></div>'
        f'<div style="padding:22px 22px 0">'
        f'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">{body("Name", 12.5, T["g500"])}{mono("already in closet", 9.5, T["roseDeep"], "text-transform:uppercase")}</div>'
        f'<div style="font-family:{fS};font-size:15px;border-bottom:1px solid {T["line"]};padding-bottom:8px;margin-bottom:20px">Striped Cotton Tee</div>'
        f'<div style="margin-bottom:20px">{body("Category", 12.5, T["g500"], "margin-bottom:8px")}<div style="display:flex;flex-wrap:wrap;gap:6px">{pill("top", True, "ink", "sm")}{pill("btm", False, "ink", "sm")}{pill("1pc", False, "ink", "sm")}{pill("otw", False, "ink", "sm")}</div></div>'
        f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-top:20px;margin-bottom:20px">'
        f'<div>{body("Sport / gym only", 12.5, T["g500"])}{body("Excluded from everyday outfit suggestions", 11, T["g400"], "margin-top:3px")}</div>'
        f'<div style="width:40px;height:24px;border-radius:12px;padding:2px;background:{T["ink"]};display:flex;justify-content:flex-end;flex-shrink:0"><div style="width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div></div></div></div>'
        f'<div style="padding:14px 22px 20px;display:flex;gap:10px;border-top:1px solid {T["line"]}">'
        f'<div style="flex:1">{btn("Back", "quiet", None, True)}</div><div style="flex:1.6">{btn("Next", "primary", None, True)}</div></div>'
    )
    return shell('Batch upload', content, 'hanger')

# ── 9. Log Outfit — pieces ─────────────────────────────────────────────────
def screen_log_pieces():
    cats = ['all','top','btm','1pc','otw','shoe','acc']
    cat_pills = ''.join(pill(c, i == 0, 'ink', 'sm') for i, c in enumerate(cats))
    tones = ['sand','cocoa','rose','peach','sand','cocoa','rose','peach','sand','cocoa']
    tiles = ''.join(item_tile(t, sel=(i in (1,4))) for i, t in enumerate(tones))
    frag_tiles = ''.join(f'<div style="width:68px;flex-shrink:0">{item_tile(t)}</div>' for t in ['ink','cocoa','sand'])
    content = (
        v4bar('Log outfit', False, icon('close',22,1.8)) +
        f'<div style="position:sticky;top:44px;background:{T["paper"]};padding-bottom:8px;border-bottom:1px solid {T["line"]};z-index:4">'
        f'<div style="padding:10px 22px 0"><div style="display:flex;gap:8px;overflow-x:auto">'
        f'<div style="width:52px;height:64px;flex-shrink:0">{ph("cocoa")}</div>'
        f'<div style="width:52px;height:64px;flex-shrink:0;border:1.5px dashed {T["g200"]};display:flex;align-items:center;justify-content:center;color:{T["g400"]}">{icon("plus",18,1.7,T["g400"])}</div></div></div>'
        f'<div style="display:flex;gap:8px;padding:10px 22px 0;overflow-x:auto">{cat_pills}</div></div>'
        f'<div style="padding:14px 22px 0">'
        f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px">{tiles}</div>'
        f'<div style="margin-top:12px;padding-top:12px;border-top:1px solid {T["line"]}">{body("Fragrance", 12.5, T["g500"], "margin-bottom:8px")}'
        f'<div style="display:flex;gap:8px;overflow-x:auto">{frag_tiles}</div></div></div>'
        f'<div style="padding:14px 22px 20px;border-top:1px solid {T["line"]}">{btn("Add the details", "primary", "next")}</div>'
    )
    return shell('Log outfit', content, None)

# ── 10. Log Outfit — context ───────────────────────────────────────────────
def screen_log_context():
    preview = ''.join(f'<div style="width:46px;height:58px;flex-shrink:0">{ph(t)}</div>' for t in ['cocoa','rose','sand','peach','cocoa'])
    occ = ['work','casual','weekend','dinner']
    occ_pills = ''.join(pill(o, i == 0, 'peach', 'md') for i, o in enumerate(occ))
    rating_dots = ''.join(f'<div style="width:7px;height:7px;border-radius:2px;background:{T["cocoa"] if i < 4 else T["g200"]}"></div>' for i in range(5))
    content = (
        v4bar(None, True) +
        f'<div style="padding:4px 22px 0">{disp("Anything to<br/>remember about it?", 24)}</div>'
        f'<div style="padding:18px 22px 0;display:flex;gap:8px;overflow-x:auto">{preview}</div>'
        f'<div style="padding:24px 22px 0">'
        f'<div>{secH("When")}{pill("Today", True, "ink", "md")}</div>'
        f'<div style="margin-top:22px">{secH("What for")}<div style="display:flex;gap:8px;flex-wrap:wrap">{occ_pills}</div>'
        f'<div style="font-family:{fS};font-size:14px;color:{T["g400"]};border-bottom:1px solid {T["line"]};padding:10px 0 6px;margin-top:10px">or type your own&hellip;</div></div>'
        f'<div style="margin-top:22px;display:flex;align-items:center;justify-content:space-between">'
        f'<span style="font-family:{fS};font-size:14.5px;font-weight:500">How did it feel</span><div style="display:flex;gap:5px">{rating_dots}</div></div>'
        f'<div style="margin-top:22px">{body("Optional", 12.5, T["g500"], "margin-bottom:8px;text-align:right")}'
        f'<div style="min-height:62px;background:{T["white"]};box-shadow:inset 0 0 0 1px {T["line"]};padding:15px;font-family:{fS};font-size:14px;color:{T["g400"]}">Too warm for the waistcoat by noon&hellip;</div></div>'
        f'<div style="margin-top:20px;width:100%;border:1.5px dashed {T["g200"]};padding:16px 0;display:flex;align-items:center;justify-content:center;gap:8px">{icon("cam",17,1.5,T["g500"])}{body("Add a photo of the full look (optional)", 13)}</div></div>'
        f'<div style="padding:14px 22px 20px;border-top:1px solid {T["line"]}">{btn("Save to 1 September", "primary", "check")}</div>'
    )
    return shell('Context', content, None)

# ── 11. Log Outfit — saved ─────────────────────────────────────────────────
def screen_log_saved():
    thumbs = ''.join(f'<div style="width:46px;height:58px">{ph(t)}</div>' for t in ['cocoa','rose','sand','peach','cocoa','sand'])
    content = (
        v4bar(None, False, icon('close',22,1.8)) +
        f'<div style="padding:30px 34px 0;text-align:center">{img("wave-rose.png", 110, None, "display:block;margin:0 auto 24px")}'
        f'{disp("Logged.", 28)}{body("Monday, September 1 &mdash; work, 4 pieces. That&#39;s a 6-day streak.", 14.5, None, "margin-top:10px")}'
        f'<div style="display:flex;gap:9px;justify-content:center;margin-top:22px;flex-wrap:wrap">{thumbs}</div>'
        f'<div style="margin-top:28px">{btn("Back to today", "primary")}</div></div>'
    )
    return shell('Saved', content, None)

# ── 12. Ideas ──────────────────────────────────────────────────────────────
def screen_ideas():
    ideas = [('cocoa','sand','Work jumper + trousers','saved 24 aug', True, 'work'), ('rose','peach','Sunday brunch look','saved 20 aug', False, None),
             ('sand','cocoa','Date-night black','saved 13 aug', True, 'dinner'), ('peach','rose','Airport travel set','saved 2 aug', False, None)]
    cards = ''.join(
        f'<div><div style="position:relative;width:100%;aspect-ratio:4/5">{collage([t1,t2])}'
        + (f'<div style="position:absolute;top:9px;left:9px;height:24px;display:inline-flex;align-items:center;padding:0 10px;background:rgba(247,246,245,.92);font-family:{fS};font-size:11.5px;font-weight:600;text-transform:capitalize">{occ}</div>' if occ else '')
        + (f'<div style="position:absolute;bottom:9px;right:9px;width:24px;height:24px;background:rgba(247,246,245,.92);display:flex;align-items:center;justify-content:center">{icon("spark",13,1.7,T["cocoa"])}</div>' if ai else '')
        + f'</div>{body(name, 14, T["ink"], "font-weight:500;margin-top:8px;line-height:1.35")}{mono(day, 10.5, None, "margin-top:3px")}</div>'
        for t1, t2, name, day, ai, occ in ideas
    )
    content = (
        f'<div style="padding:4px 22px 0">{disp("Ideas", 30)}{body("16 looks you&#39;ve saved for a day that hasn&#39;t happened yet.", 13.5, None, "margin-top:6px")}</div>'
        f'<div style="padding:18px 22px 0">{btn("Suggest", "peach", "spark")}</div>'
        f'<div style="display:flex;gap:8px;padding:20px 22px 0">{pill("All", True, "ink", "sm", 16)}{pill("Suggested", False, "ink", "sm", 9)}{pill("Mine", False, "ink", "sm", 7)}</div>'
        f'<div style="padding:18px 22px 0;display:grid;grid-template-columns:1fr 1fr;gap:14px">{cards}</div>'
    )
    return shell('Ideas', content, 'bulb')

# ── 13. Idea Detail ─────────────────────────────────────────────────────────
def screen_idea_detail():
    pairing = [('rose', 'Zara Midi Dress', 'Layer the varsity jacket over it for a toned-down pop of color.'), ('sand', 'Chanel Flats', 'Ties into the jacket&#39;s brown wool body.')]
    rows = ''.join(
        f'<div style="padding:10px 0;border-bottom:1px solid {T["line"]}">{body(txt, 13.5, T["g700"], "line-height:1.5")}'
        f'<div style="display:flex;align-items:center;gap:5px;margin-top:6px;font-family:{fS};font-size:12.5px;color:{T["cocoa"]}">{icon("bookmark",13,1.7,T["cocoa"])}Save to ideas</div></div>'
        for _, _, txt in pairing
    )
    content = (
        v4bar('Ideas', True, mono('claude sonnet', 11)) +
        f'<div style="padding:8px 22px 0"><div style="width:100%;aspect-ratio:4/5">{collage(["cocoa","rose","sand"])}</div></div>'
        f'<div style="padding:18px 22px 0">{mono("WORK", 11, T["cocoa"])}{disp("A relaxed work look.", 22, 600, None, "margin-top:6px")}</div>'
        f'<div style="padding:20px 22px 0">{secH("It could work with")}{rows}</div>'
        f'<div style="padding:20px 22px 0;display:flex;gap:10px">{btn("Log this outfit", "primary", "cal", False, "", 1)}{btn("Delete", "quiet", "trash", False, "", 1)}</div>'
    )
    return shell('Idea', content, 'bulb')

# ── 14. Shop — sheet ─────────────────────────────────────────────────────
def screen_shop_sheet():
    scrim_bg = (
        f'<div style="position:absolute;inset:0;background:{T["paper"]};opacity:.5">'
        f'<div style="height:58px;border-bottom:1px solid {T["line"]};display:flex;align-items:center;justify-content:space-between;padding:0 22px">'
        f'<span style="font-family:{fS};font-size:14px;font-weight:600">closet</span></div>'
        f'<div style="padding:20px 22px 0"><div style="display:flex;align-items:center;justify-content:space-between">{disp("Closet",26)}'
        f'<div style="display:flex;gap:8px"><div style="height:32px;padding:0 12px;background:{T["g200"]}55;display:flex;align-items:center">Add</div>'
        f'<div style="height:32px;padding:0 12px;background:{T["peachSoft"]};display:flex;align-items:center;color:{T["cocoa"]}">Shop</div></div></div></div>'
        f'</div><div style="position:absolute;inset:0;background:rgba(0,0,0,.34)"></div>'
    )
    sheet = (
        f'<div style="position:absolute;left:0;right:0;bottom:0;background:{T["paper"]};border-radius:16px 16px 0 0;'
        f'box-shadow:0 -14px 40px rgba(0,0,0,.16);padding-bottom:14px">'
        f'<div style="display:flex;justify-content:center;padding-top:10px"><div style="width:40px;height:4px;border-radius:2px;background:{T["g200"]}"></div></div>'
        f'<div style="padding:12px 22px 0;display:flex;justify-content:space-between;align-items:flex-start">'
        f'{disp("Thinking about<br/>something?", 22)}{icon("close",20,1.8)}</div>'
        f'<div style="padding:18px 22px 0">{body("Upload a photo of something you&#39;re considering. I&#39;ll check it against your style and what you already own.", 14)}</div>'
        f'<div style="padding:20px 22px 0"><div style="border:1.5px dashed {T["g200"]};padding:56px 24px;display:flex;flex-direction:column;align-items:center;gap:12px">'
        f'{icon("cam",30,1.4,T["g400"])}<div style="font-family:{fS};font-size:14.5px;font-weight:500">Upload photo</div>{mono("tap to select or drag &amp; drop", 10.5)}</div></div>'
        f'<div style="padding:22px 22px 0;border-top:1px solid {T["line"]};margin-top:22px;padding-top:14px">{btn("Should I buy it?", "primary", "spark")}</div></div>'
    )
    # Fixed height (not 100%): this mockup is a sheet-over-screen modal, so it
    # needs an explicit content-area height to match — the shell frame itself
    # is no longer height-clamped, so height:100% here would collapse to 0.
    content = f'<div style="position:relative;height:710px">{scrim_bg}{sheet}</div>'
    return shell('Shop', content, 'hanger')

# ── 15. Shop — verdict ───────────────────────────────────────────────────
def screen_shop_result():
    pros = ['Neutral palette matches your everyday rotation', 'Structured shape layers well over what you own']
    pairing = [('sand', 'Toteme Wide Trousers'), ('cocoa', 'COS Leather Loafers')]
    pro_rows = ''.join(f'<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">{icon("check",14,2.4,T["cocoa"])}{body(p, 13.5, T["g700"])}</div>' for p in pros)
    pair_rows = ''.join(f'<div style="display:flex;align-items:center;gap:13px;padding:10px 0;border-bottom:1px solid {T["line"]}"><div style="width:40px;height:50px">{ph(t)}</div>{body(n, 14, T["ink"], "font-weight:500")}</div>' for t, n in pairing)
    content = (
        v4bar('Closet', True, mono('claude sonnet', 11)) +
        f'<div style="padding:8px 22px 0"><div style="width:100%;aspect-ratio:4/3">{ph("sand")}</div></div>'
        f'<div style="padding:20px 22px 0">{card(mono("the verdict", 11, T["cocoa"]) + disp("Yes, get it.", 28, 600, None, "margin-top:7px") + body("A structured cognac tote in a warm neutral &mdash; it slots right into your rotation.", 14, T["g700"], "margin-top:9px"), T["peach"], 18, False)}</div>'
        f'<div style="padding:22px 22px 0"><div style="display:flex;align-items:flex-end;gap:14px">{disp("82%", 44, 600, T["cocoa"])}{body("style match", 13.5, None, "padding-bottom:6px")}</div>'
        f'<div style="margin-top:16px">{pro_rows}</div></div>'
        f'<div style="padding:24px 22px 0">{secH("You already own")}{pair_rows}</div>'
        f'<div style="padding:24px 22px 0;display:flex;gap:10px">{btn("New photo", "quiet", "cam", False, "", 1)}{btn("Add to closet", "primary", "hanger", False, "", 1)}</div>'
    )
    return shell('Verdict', content, 'hanger')

# ── 16. Suggest — brief ───────────────────────────────────────────────────
def screen_suggest_brief():
    occ = ['work','casual','weekend','dinner','date night']
    occ_pills = ''.join(pill(o, i == 0, 'peach', 'md') for i, o in enumerate(occ))
    content = (
        v4bar(None, False, icon('close',22,1.8)) +
        f'<div style="padding:4px 22px 0">{disp("What are you<br/>dressing for?", 26)}</div>'
        f'<div style="padding:24px 22px 0">{secH("Occasion")}<div style="display:flex;gap:8px;flex-wrap:wrap">{occ_pills}</div></div>'
        f'<div style="padding:24px 22px 0">{secH("Formality", "Optional")}<div style="display:flex;gap:6px">'
        + ''.join(f'<div style="flex:1;height:44px;box-shadow:inset 0 0 0 1px {T["g200"]};display:flex;align-items:center;justify-content:center;font-family:{fM};font-size:12px;color:{T["g400"]}">{i+1}</div>' for i in range(5))
        + '</div></div>'
        f'<div style="padding:24px 22px 0">{secH("Anchor an item", "Optional")}<div style="width:100%;border:1.5px dashed ' + T['g200'] + ';padding:22px;display:flex;align-items:center;justify-content:center;gap:10px">' + icon('plus',18,1.7,T['g400']) + body('Build around a specific piece', 13.5) + '</div></div>'
        f'<div style="padding:14px 22px 20px;border-top:1px solid {T["line"]}">{btn("Suggest three looks", "primary", "spark")}</div>'
    )
    return shell('Suggest', content, None)

# ── 17. Suggest — result ───────────────────────────────────────────────────
def screen_suggest_result():
    look_pills = ''.join(f'<div style="flex:1">{pill(f"Look {i+1}", i==2, "ink", "sm", None, True)}</div>' for i in range(3))
    pieces = [('sand','Zara Knit White Jumper','top'), ('cocoa','Zara White Pants','bottom'), ('rose','Chanel Pink Burgundy Flats','shoes'), ('peach','Maya Rings','accessory')]
    rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:9px 0;border-bottom:1px solid {T["line"]}">'
        f'<div style="width:36px;height:45px;flex-shrink:0">{ph(t)}</div><div style="flex:1">{body(n, 14, T["ink"], "font-weight:500")}</div>{mono(c, 10.5)}</div>'
        for t, n, c in pieces
    )
    content = (
        v4bar('Brief', True, mono('3 / 3', 11.5)) +
        f'<div style="padding:8px 22px 0"><div style="position:relative;width:100%;aspect-ratio:4/3">{collage(["sand","cocoa","rose","peach"])}'
        f'<div style="position:absolute;top:22px;left:22px;height:29px;display:inline-flex;align-items:center;padding:0 12px;background:rgba(247,246,245,.94);font-family:{fS};font-size:12px;font-weight:600">Work</div></div>'
        f'<div style="margin-top:16px;display:flex;justify-content:center;gap:6px"><div style="width:6px;height:6px;border-radius:2px;background:{T["g200"]}"></div><div style="width:6px;height:6px;border-radius:2px;background:{T["g200"]}"></div><div style="width:20px;height:6px;border-radius:2px;background:{T["ink"]}"></div></div>'
        f'<div style="margin-top:14px;display:flex;gap:8px">{look_pills}</div></div>'
        f'<div style="padding:18px 22px 0">{disp("Work, 17&deg;.", 22)}{mono("built around: Zara Knit White Jumper", 10, None, "display:block;margin-top:6px")}</div>'
        f'<div style="padding:18px 22px 0">{rows}</div>'
        f'<div style="padding:20px 22px 0;display:flex;gap:8px">'
        f'<div style="width:34px;height:34px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">&#9650;</div>'
        f'<div style="width:34px;height:34px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">&#9660;</div></div>'
        f'<div style="padding:14px 22px 20px;border-top:1px solid {T["line"]};display:flex;gap:10px">{btn("Wear this today", "primary", "check")}</div>'
    )
    return shell('Suggest result', content, None)

# ── 18. Me ──────────────────────────────────────────────────────────────────
def screen_me():
    cards = [('chart','Statistics','105 outfits'), ('bulb','Ideas','16 saved'), ('archive','Archived','16 pieces'), ('repeat','Constants','0 always on')]
    card_html = ''
    for ic, label, sub in cards:
        inner = (icon(ic, 20, 1.6, T['cocoa']) +
                 f'<div style="margin-top:15px"><div style="font-family:{fS};font-size:14.5px;font-weight:600">{label}</div>'
                 f'<div style="margin-top:1px">{mono(sub, 10.5)}</div></div>')
        card_html += f'<div>{card(inner)}</div>'

    profile_inner = (
        f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:15px">'
        f'<div style="display:flex;align-items:center;gap:15px">'
        f'<div style="width:58px;height:58px;background:{T["white"]};display:flex;align-items:center;justify-content:center;'
        f'font-family:{fS};font-size:21px;font-weight:600;flex-shrink:0">S</div>'
        f'<div>{disp("spelaa.newsletter", 19)}<div style="margin-top:3px">{mono("spelaa.newsletter@icloud.com", 11, T["cocoa"])}</div></div>'
        f'</div>'
        f'<div style="font-family:{fS};font-size:13px;font-weight:500;color:{T["cocoaDeep"]};flex-shrink:0">sign out</div>'
        f'</div>'
    )
    profile_card = card(profile_inner, T['peach'], 18, False)

    style_card = card(body('My style is fundamentally minimalist with bold colour pops, anchored by a reliable rotation of black basics, Zara staples, and neutral tones.', 14, T['g700']))

    notif_switch = (f'<div style="width:40px;height:24px;border-radius:12px;padding:2px;background:{T["ink"]};'
                     f'display:flex;justify-content:flex-end;flex-shrink:0"><div style="width:20px;height:20px;border-radius:50%;background:#fff"></div></div>')

    content = (
        f'<div style="padding:4px 22px 0;display:flex;align-items:center;justify-content:space-between">{disp("Me", 30)}{mono("v3.0", 11)}</div>'
        f'<div style="padding:20px 22px 0">{profile_card}</div>'
        f'<div style="padding:16px 22px 0;display:grid;grid-template-columns:1fr 1fr;gap:11px">{card_html}</div>'
        f'<div style="padding:24px 22px 0">{secH("How I dress", "Edit")}{style_card}</div>'
        f'<div style="padding:26px 22px 0">{body("Account", 12.5, T["g500"])}'
        f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}">'
        f'<span style="font-family:{fS};font-size:15px">Change password</span>{icon("next",16,1.8,T["g400"])}</div>'
        f'<div style="display:flex;align-items:flex-start;padding-top:15px;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}">'
        f'<div><span style="font-family:{fS};font-size:15px">Notifications</span><div style="margin-top:1px">{body("A nudge if you haven&#39;t logged by 9pm", 12, T["g400"])}</div></div>'
        f'{notif_switch}</div></div>'
    )
    return shell('Me', content, 'user')

# ── 19. Statistics ───────────────────────────────────────────────────────
def screen_statistics():
    most_worn = [('cocoa','Zara Black Jumper','24&times;'), ('sand','COS Wide Trousers','19&times;'), ('rose','Nike Sneakers','17&times;')]
    rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:12px;padding:9px 0">'
        f'<div style="width:34px;height:42px;flex-shrink:0">{ph(t)}</div>'
        f'<div style="flex:1;min-width:0">{body(n, 13.5, T["ink"], "font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}</div>{mono(v, 12, T["ink"], "font-weight:700")}</div>'
        for t, n, v in most_worn
    )
    brands = [('COS', 82), ('Zara', 68), ('Toteme', 41), ('Nike', 30)]
    brand_rows = ''.join(
        f'<div style="padding:9px 0"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-family:{fS};font-size:13.5px">{b}</span>{mono(str(v), 12, T["ink"], "font-weight:700")}</div>'
        f'<div style="height:6px;background:{T["g200"]}"><div style="height:6px;width:{v}%;background:{T["cocoa"]}"></div></div></div>'
        for b, v in brands
    )
    content = (
        v4bar('Me', True, mono('Monthly &#9662;', 13)) +
        f'<div style="padding:8px 22px 0">{disp("Statistics", 29)}</div>'
        f'<div style="display:flex;gap:8px;padding:14px 22px 0">{pill("Pieces", True, "ink", "sm")}{pill("Outfits", False, "ink", "sm")}{pill("Colour", False, "ink", "sm")}</div>'
        f'<div style="padding:20px 22px 0">{secH("Most worn", "All")}{rows}</div>'
        f'<div style="padding:22px 22px 0">{secH("Top brands")}{brand_rows}</div>'
    )
    return shell('Statistics', content, 'user')

# ── 20+. Loading screens — the branded pattern, every real variant ────────
DOTTED_BG = (f'background-color:{T["paper"]};background-image:radial-gradient(circle,rgba(0,0,0,.13) 1px,transparent 1.4px);'
             f'background-size:22px 22px;')

def loading_steps_body(headline, steps, active_index, logo_w=100):
    rows = ''
    for i, label in enumerate(steps):
        done = i < active_index
        active = i == active_index
        opacity = '1' if (done or active) else '.4'
        if done:
            box = f'<div style="width:20px;height:20px;background:{T["ink"]};color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">{icon("check",11,2.8,"#fff")}</div>'
        else:
            box = f'<div style="width:20px;height:20px;border:1.5px solid {T["g200"]};flex-shrink:0"></div>'
        color = T['ink'] if done else T['g500']
        rows += f'<div style="display:flex;align-items:center;gap:12px;opacity:{opacity}">{box}{body(label, 14, color)}</div>'
    return (
        f'{img("wave.png", logo_w)}<div style="margin-top:24px">{disp(headline, 26)}</div>'
        f'<div style="margin-top:28px;display:flex;flex-direction:column;gap:15px">{rows}</div>'
    )

def loading_progress_body(headline, count_label, pct, logo_w=100):
    return (
        f'{img("wave.png", logo_w)}<div style="margin-top:24px">{disp(headline, 26)}</div>'
        f'<div style="margin-top:28px;max-width:280px">'
        f'<div style="width:100%;height:2px;background:{T["g200"]};margin-bottom:14px">'
        f'<div style="height:2px;width:{pct}%;background:{T["ink"]}"></div></div>{body(count_label, 14)}</div>'
    )

def loading_screen(name, headline_body, has_close=True):
    right = icon('close', 22, 1.8) if has_close else ''
    content = f'<div style="{DOTTED_BG}min-height:100%">' + v4bar(None, False, right) + f'<div style="padding:40px 40px 0">{headline_body}</div></div>'
    return shell(name, content, None)

def screen_loading_suggest():
    return loading_screen('Loading — Suggest', loading_steps_body('Having a look through your closet.', ['Checking the weather', 'Reading your style profile', 'Choosing from your closet'], 1), True)

def screen_loading_additem():
    return loading_screen('Loading — Add item', loading_steps_body('Reading your photo.', ['Reading the photo', 'Identifying the piece', 'Filling in the details'], 1), False)

def screen_loading_styleprofile():
    return loading_screen('Loading — Style profile', loading_steps_body('Reading your outfits.', ['Going through your outfits', 'Spotting your patterns', 'Writing it up'], 1), False)

def screen_loading_shop():
    return loading_screen('Loading — Shop', loading_steps_body('Sizing it up.', ['Eyeing it up', 'Cross-checking your closet', 'Making the call'], 1), True)

def screen_loading_batch_analyzing():
    return loading_screen('Loading — Batch upload (analyzing)', loading_progress_body('Reading your photos.', '5 of 8 analyzed&hellip;', 62), False)

def screen_loading_batch_saving():
    return loading_screen('Loading — Batch upload (saving)', loading_progress_body('Adding to your closet.', 'saving 6 of 8&hellip;', 75), False)


SCREENS = [
    ('Main', screen_today),
    ('TodayEmpty', screen_today_empty),
    ('Login', screen_login),
    ('Month', screen_month),
    ('OutfitDetail', screen_outfit_detail),
    ('Closet', screen_closet),
    ('ItemDetail', screen_item_detail),
    ('AddItem', screen_add_item),
    ('BatchUpload', screen_batch_upload),
    ('LogOutfitPieces', screen_log_pieces),
    ('LogOutfitContext', screen_log_context),
    ('LogOutfitSaved', screen_log_saved),
    ('Ideas', screen_ideas),
    ('IdeaDetail', screen_idea_detail),
    ('ShopSheet', screen_shop_sheet),
    ('ShopResult', screen_shop_result),
    ('SuggestBrief', screen_suggest_brief),
    ('SuggestResult', screen_suggest_result),
    ('Me', screen_me),
    ('Statistics', screen_statistics),
    ('LoadingSuggest', screen_loading_suggest),
    ('LoadingAddItem', screen_loading_additem),
    ('LoadingStyleProfile', screen_loading_styleprofile),
    ('LoadingShop', screen_loading_shop),
    ('LoadingBatchAnalyzing', screen_loading_batch_analyzing),
    ('LoadingBatchSaving', screen_loading_batch_saving),
]

if __name__ == '__main__':
    for name, fn in SCREENS:
        write(name, fn())
    print(f'{len(SCREENS)} screens written')
