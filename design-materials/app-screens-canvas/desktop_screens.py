#!/usr/bin/env python3
from gen import *
from screens import DOTTED_BG, loading_steps_body, loading_progress_body

# ── Today (desktop) ────────────────────────────────────────────────────────
def d_today():
    photo = f'<div style="width:100%;aspect-ratio:340/400;position:relative">{collage(["cocoa","rose","sand","peach"])}' \
            f'<div style="position:absolute;top:14px;left:14px;height:30px;display:inline-flex;align-items:center;padding:0 13px;background:rgba(247,246,245,.94);font-family:{fS};font-size:12.5px;font-weight:600">Work</div></div>'
    rows = [('Zara Black Balloon Pants','bottom','4&times;'), ('Byredo Pulp','fragrance','12&times;'), ('Topshop Ecru Tshirt','top','7&times;'), ('Gucci Princetown Loafer','shoes','8&times;')]
    piece_rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:11px 0;border-bottom:1px solid {T["line"]}">'
        f'<div style="flex:1;min-width:0">{body(n, 14, T["ink"], "font-weight:500")}</div>{mono(c, 10.5, T["g400"])}{mono(w, 11, T["cocoa"], "font-weight:700")}</div>'
        for n, c, w in rows
    )
    info = (f'<div>{disp("Zara Black + 4 more.", 26)}{body("5 pieces &middot; logged at 8:12 AM", 14, None, "margin-top:6px")}</div>'
            f'<div style="margin-top:22px">{piece_rows}</div>'
            f'<div style="margin-top:22px;display:flex;gap:10px">{btn("Wear again", "quiet", "repeat", False)}</div>')
    hero = card(split(photo, info, left_w=280, gap=26), T['white'], 24, True)
    week_days = ['M','T','W','T','F','S','S']
    strip_cells = ''
    for i, d in enumerate(week_days):
        is_today = i == 0
        tone = ['cocoa','rose','peach',None,None,None,None][i]
        inner = ph(tone) if tone else f'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:{T["g200"]}">{icon("plus",15,1.8,T["g200"])}</div>'
        ring = f'inset 0 0 0 2px {T["ink"]}' if is_today else f'inset 0 0 0 1px {T["line"]}'
        strip_cells += (f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">'
                        f'{mono(d, 10.5, T["ink"] if is_today else T["g400"], "font-weight:" + ("700" if is_today else "400") + ";text-transform:uppercase")}'
                        f'<div style="width:100%;aspect-ratio:3/4;overflow:hidden;box-shadow:{ring}">{inner}</div>{mono(f"{i+1:02d}", 10, T["ink"] if is_today else T["g400"])}</div>')
    week_card = card(secH("This week", "aug") + f'<div style="display:flex;gap:7px">{strip_cells}</div>'
                      + f'<div style="margin-top:18px">{card(body("9 outfits logged in aug", 13.5, T["cocoa"]) + disp("Busier than usual.", 17, 400, None, "margin-top:4px"), T["peachSoft"], 16, False)}</div>', T['white'], 22, True)
    past_rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:10px 0;border-bottom:{"1px solid " + T["line"] if i < 2 else "none"}">'
        f'<div style="width:38px;height:47px;flex-shrink:0">{ph(tone)}</div><div style="flex:1;min-width:0">{body(name, 13.5, T["ink"], "font-weight:500")}{mono(day, 10.5, None, "margin-top:2px")}</div>{icon("next",16,1.7,T["g400"])}</div>'
        for tone, name, day in [('rose','Topshop Paradiso + 3 more','fri 28 &middot; casual'), ('peach','Cos Denim + 5 more','thu 27 &middot; work'), ('sand','4505 Leggings + 2 more','wed 26 &middot; tennis')]
    )
    ideas_rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:10px 0">'
        f'<div style="width:38px;height:47px;flex-shrink:0">{ph(tone)}</div><div style="flex:1;min-width:0">{body(name, 13.5, T["ink"], "font-weight:500")}{mono(day, 10.5, None, "margin-top:2px")}</div>{icon("next",16,1.7,T["g400"])}</div>'
        for tone, name, day in [('cocoa','Zara Grey + 5 more','work &middot; saved aug 24'), ('rose','Topshop Polkadots + 4 more','casual &middot; saved aug 20')]
    )
    sidebar = card(secH("Past outfits", "Calendar") + past_rows + f'<div style="margin-top:24px;padding-top:20px;border-top:1px solid {T["line"]}">{secH("Saved for later", "Ideas")}{ideas_rows}</div>', T['white'], 18, True)
    left_col = hero + f'<div style="margin-top:30px">{week_card}</div>'
    content = split(left_col, sidebar, left_w=None, right_w=None, gap=52)
    content = f'<div style="display:grid;grid-template-columns:minmax(220px,58fr) minmax(200px,42fr);gap:52px;align-items:start">' \
              f'<div>{left_col}</div><div>{sidebar}</div></div>'
    return desktop_shell(content, 'home', h=1080)

# ── Month (desktop) ─────────────────────────────────────────────────────────
def d_month():
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
    left = (f'<div style="display:flex;align-items:flex-end;justify-content:space-between">'
            f'<div>{mono("2026", 11.5, T["cocoa"])}{disp("August", 30, 600, None, "margin-top:4px")}</div>'
            f'<div style="display:flex;gap:6px"><div style="width:44px;height:44px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">{icon("back",18,1.7)}</div>'
            f'<div style="width:44px;height:44px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">{icon("next",18,1.7)}</div></div></div>'
            f'<div style="margin-top:18px"><div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:8px">{days_row}</div>'
            f'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">{cells}</div></div>')
    right_photo = f'<div style="width:100%;aspect-ratio:3/4;position:relative">{collage(["rose","peach","sand"])}</div>'
    right = (secH("28 Aug", "Clear")
             + f'<button style="width:100%;max-width:320px;background:none;border:none;padding:0;cursor:pointer;text-align:left">{right_photo}'
             + f'<div style="margin-top:14px">{disp("Topshop Paradiso + 3 more.", 19)}</div>{mono("fri &middot; casual &middot; 4 pieces", 11.5, None, "margin-top:5px")}</button>'
             + f'<div style="margin-top:20px">{btn("Log outfit", "primary", "cal")}</div>')
    content = split(left, right, left_w=None, right_w=None, gap=44)
    content = f'<div style="display:grid;grid-template-columns:1.3fr 1fr;gap:44px;align-items:start">' \
              f'<div>{left}</div><div>{right}</div></div>'
    return desktop_shell(content, 'home', h=980)

# ── Outfit Detail (desktop) ─────────────────────────────────────────────────
def d_outfit_detail():
    photo = f'<div style="width:100%;aspect-ratio:3/4;position:relative">{collage(["cocoa","rose","sand","peach","cocoa","sand"])}</div>'
    pieces = [('rose','Ti Sento Round Ring','accessory','1&times;'), ('sand','Zara Black Balloon Pants','bottom','4&times;'),
              ('cocoa','Byredo Pulp','fragrance','12&times;'), ('peach','Bottega Veneta Andiamo','accessory','2&times;'),
              ('sand','Topshop Ecru Tshirt','top','7&times;'), ('rose','Gucci Princetown Loafer','shoes','8&times;')]
    rows = ''.join(
        f'<div style="display:flex;align-items:center;gap:13px;padding:9px 0;border-bottom:{"1px solid " + T["line"] if i < len(pieces)-1 else "none"}">'
        f'<div style="width:36px;height:45px;flex-shrink:0">{ph(tone)}</div><div style="flex:1;min-width:0">{body(name, 14, T["ink"], "font-weight:500")}{mono(cat, 10.5, None, "margin-top:2px")}</div>{mono(n, 11, T["cocoa"], "font-weight:700")}</div>'
        for i, (tone, name, cat, n) in enumerate(pieces)
    )
    info = (f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">{mono("WORK", 11, T["cocoa"], "text-transform:uppercase")}{mono("01 sep &middot; tue", 11)}</div>'
            f'{disp("Zara Black + 8 more.", 25)}{body("9 pieces", 13, None, "margin-top:5px")}'
            f'<div style="margin-top:22px">{btn("Wear again", "primary", "repeat", False)}</div>'
            f'<div style="margin-top:26px">{secH("In this look", "9 pieces")}{rows}</div>')
    content = v4bar('Month', True, icon('pen',20,1.6) + icon('trash',19,1.6,T['g400'])) + split(photo, info, left_w=380)
    return desktop_shell(content, 'home', h=980)

# ── Closet (desktop) ────────────────────────────────────────────────────────
def d_closet():
    filters = ['all','top','btm','1pc','otw','shoe','acc']
    pills = ''.join(pill(f, i == 0, 'ink', 'sm', 24 if i == 0 else None) for i, f in enumerate(filters))
    tones = ['sand','cocoa','rose','peach'] * 4
    tiles = ''.join(item_tile(t, worn=(i % 5) + 1) for i, t in enumerate(tones))
    content = (
        f'<div style="display:flex;align-items:flex-end;justify-content:space-between">'
        f'<div>{disp("Closet", 30)}{body("24 pieces", 14, None, "margin-top:6px")}</div>'
        f'<div style="display:flex;align-items:center;gap:15px">'
        f'<span style="font-family:{fS};font-size:13px;color:{T["g500"]}">Select</span>'
        f'<div style="display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;background:{T["g200"]}55">{icon("plus",15,1.9)}<span style="font-family:{fS};font-size:12.5px;font-weight:600">Add</span></div>'
        f'<div style="display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;background:{T["peachSoft"]};color:{T["cocoa"]}">{icon("bag",15,1.8,T["cocoa"])}<span style="font-family:{fS};font-size:12.5px;font-weight:600">Shop</span></div></div></div>'
        f'<div style="display:flex;gap:8px;padding:18px 0 0;overflow-x:auto">{pills}</div>'
        f'<div style="padding:16px 0 0;font-family:{fS};font-size:13px;font-weight:500">Recently added</div>'
        f'<div style="padding:10px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">{tiles}</div>'
    )
    return desktop_shell(content, 'hanger', h=1000)

# ── Item Detail (desktop) ────────────────────────────────────────────────────
def d_item_detail():
    photo = f'<div style="width:100%;aspect-ratio:1/1">{ph("cocoa")}</div>'
    stats = [('Worn','8&times;'), ('Last','2026-08-21'), ('Average','2.1 / mo')]
    stat_cells = ''.join(f'<div style="padding:15px 14px;border-left:{"1px solid rgba(0,0,0,.07)" if i else "none"}">'
                          f'<div style="font-family:{fS};font-size:11.5px;color:{T["cocoa"]};font-weight:500">{k}</div>'
                          f'<div style="font-family:{fS};font-size:17px;font-weight:600;margin-top:3px">{v}</div></div>' for i, (k, v) in enumerate(stats))
    attrs = [('Colour','Brown'), ('Material','Wool'), ('Brand','COS')]
    attr_rows = ''.join(f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}">'
                         f'<span style="font-family:{fS};font-size:15px">{k}</span>{mono(v, 12.5)}</div>' for k, v in attrs)
    warmth_row = f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px;border-bottom:1px solid {T["line"]}"><span style="font-family:{fS};font-size:15px">Warmth</span>{dots_row(4, T["cocoa"])}</div>'
    formality_row = f'<div style="display:flex;align-items:center;justify-content:space-between;min-height:54px"><span style="font-family:{fS};font-size:15px">Formality</span>{dots_row(2, T["roseDeep"])}</div>'
    worn_with = ''.join(f'<div style="flex:1;min-width:0"><div style="width:100%;aspect-ratio:3/4">{ph(t)}</div>{mono(d, 10, None, "margin-top:5px")}</div>' for t, d in [('cocoa','21 08'), ('rose','15 08'), ('sand','02 08'), ('peach','28 07')])
    info = (f'{mono("COS &middot; top", 11.5, T["cocoa"])}{disp("Wool Blend Jumper", 27, 600, None, "margin-top:5px")}'
            f'<div style="margin-top:18px">{card(grid3(stat_cells), T["peach"], 0, False)}</div>'
            f'<div style="margin-top:18px">{btn("Wear it today", "primary", "check", False)}</div>'
            f'<div style="margin-top:26px">{secH("Details")}{attr_rows}{warmth_row}{formality_row}</div>'
            f'<div style="margin-top:30px">{secH("Worn with", "All 8")}<div style="display:flex;gap:9px">{worn_with}</div></div>')
    content = v4bar('Closet', True, icon('pen',20,1.6) + icon('archive',19,1.6,T['g400'])) + split(photo, info, left_w=380)
    return desktop_shell(content, 'hanger', h=1080)

# ── Add Item (desktop) ───────────────────────────────────────────────────────
def d_add_item():
    photo = f'<div style="width:100%;box-shadow:inset 0 0 0 1px {T["line"]}">{ph("rose")}</div>'
    warmth_dots = ''.join(f'<div style="flex:1;height:36px;background:{T["cocoa"] if i < 2 else "transparent"};box-shadow:inset 0 0 0 1px {T["cocoa"] if i < 2 else T["g200"]}"></div>' for i in range(5))
    formality_dots = ''.join(f'<div style="flex:1;height:36px;background:{T["roseDeep"] if i < 1 else "transparent"};box-shadow:inset 0 0 0 1px {T["roseDeep"] if i < 1 else T["g200"]}"></div>' for i in range(5))
    cats = ['top','btm','1pc','otw','shoe','acc','frag']
    cat_pills = ''.join(pill(c, i == 0, 'ink', 'sm') for i, c in enumerate(cats))
    field = lambda label, val, ph_text=None: (f'<div style="margin-bottom:18px">{body(label, 12.5, T["g500"], "margin-bottom:6px")}'
                                               f'<div style="font-family:{fS};font-size:15px;color:{T["ink"] if val else T["g400"]};border-bottom:1px solid {T["line"]};padding-bottom:8px">{val or ph_text}</div></div>')
    form = (f'<div style="margin-bottom:20px">{body("Category", 12.5, T["g500"], "margin-bottom:8px")}<div style="display:flex;flex-wrap:wrap;gap:6px">{cat_pills}</div></div>'
            f'<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;margin-bottom:8px">{body("Warmth", 12.5, T["g500"])}{mono("1 = light &middot; 5 = heavy", 11)}</div><div style="display:flex;gap:6px">{warmth_dots}</div></div>'
            f'<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;margin-bottom:8px">{body("Formality", 12.5, T["g500"])}{mono("1 = casual &middot; 5 = formal", 11)}</div><div style="display:flex;gap:6px">{formality_dots}</div></div>'
            f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px">'
            f'<div>{body("Sport / gym only", 12.5, T["g500"])}{body("Excluded from everyday outfit suggestions", 11, T["g400"], "margin-top:3px")}</div>'
            f'<div style="width:40px;height:24px;border-radius:12px;padding:2px;background:{T["g200"]};display:flex;justify-content:flex-start;flex-shrink:0"><div style="width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div></div></div>'
            f'{field("Colour", "white")}{field("Brand", None, "e.g. Toteme")}{field("Material", None, "cotton, wool, silk&hellip;")}'
            f'<div style="margin-top:24px;display:flex;gap:10px">{btn("Cancel", "quiet", None, False, "", 1)}{btn("Add to closet", "primary", "check", False, "", 1.6)}</div>')
    content = v4bar('Closet', True, icon('archive',19,1.6,T['g400'])) + f'<div>{disp("Add an item", 24)}</div>' + f'<div style="margin-top:18px">{split(photo, form, left_w=420)}</div>'
    return desktop_shell(content, 'hanger', h=1080)

# ── Batch Upload (desktop) ───────────────────────────────────────────────────
def d_batch_upload():
    photo = f'<div style="width:100%;box-shadow:inset 0 0 0 1px {T["line"]}">{ph("rose")}</div>'
    form = (f'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">{body("Name", 12.5, T["g500"])}{mono("already in closet", 9.5, T["roseDeep"], "text-transform:uppercase")}</div>'
            f'<div style="font-family:{fS};font-size:15px;border-bottom:1px solid {T["line"]};padding-bottom:8px;margin-bottom:20px">Striped Cotton Tee</div>'
            f'<div style="margin-bottom:20px">{body("Category", 12.5, T["g500"], "margin-bottom:8px")}<div style="display:flex;flex-wrap:wrap;gap:6px">{pill("top", True, "ink", "sm")}{pill("btm", False, "ink", "sm")}{pill("1pc", False, "ink", "sm")}{pill("otw", False, "ink", "sm")}</div></div>'
            f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:20px">'
            f'<div>{body("Sport / gym only", 12.5, T["g500"])}{body("Excluded from everyday outfit suggestions", 11, T["g400"], "margin-top:3px")}</div>'
            f'<div style="width:40px;height:24px;border-radius:12px;padding:2px;background:{T["ink"]};display:flex;justify-content:flex-end;flex-shrink:0"><div style="width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div></div></div>'
            f'<div style="margin-top:24px;display:flex;gap:10px">{btn("Back", "quiet", None, False, "", 1)}{btn("Next", "primary", None, False, "", 1.6)}</div>')
    content = (f'<div style="display:flex;justify-content:space-between;align-items:center">'
               f'<div style="display:flex;align-items:center;gap:6px;font-family:{fS};font-size:13px;font-weight:600">{icon("back",16,1.6)}Cancel</div>{mono("3 / 8", 11)}</div>'
               f'<div style="height:2px;background:{T["g200"]};margin:12px 0 22px"><div style="height:100%;width:37%;background:{T["ink"]}"></div></div>'
               f'{split(photo, form, left_w=420)}')
    return desktop_shell(content, 'hanger', h=1000)

# ── Log Outfit — pieces (desktop) ───────────────────────────────────────────
def d_log_pieces():
    cats = ['all','top','btm','1pc','otw','shoe','acc']
    cat_pills = ''.join(pill(c, i == 0, 'ink', 'sm') for i, c in enumerate(cats))
    tones = ['sand','cocoa','rose','peach','sand','cocoa','rose','peach','sand','cocoa','rose','peach']
    tiles = ''.join(item_tile(t, sel=(i in (1,4))) for i, t in enumerate(tones))
    frag_tiles = ''.join(f'<div style="width:68px;flex-shrink:0">{item_tile(t)}</div>' for t in ['ink','cocoa','sand'])
    left = (f'<div style="display:flex;gap:8px;margin-bottom:18px;overflow-x:auto">{cat_pills}</div>'
            f'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px">{tiles}</div>'
            f'<div style="margin-top:16px;padding-top:16px;border-top:1px solid {T["line"]}">{body("Fragrance", 12.5, T["g500"], "margin-bottom:8px")}<div style="display:flex;gap:8px">{frag_tiles}</div></div>')
    picked = ''.join(f'<div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;background:{T["g200"]}">{ph(t)}'
                      f'<button style="position:absolute;top:5px;right:5px;width:21px;height:21px;background:{T["paper"]};box-shadow:0 0 0 1px {T["g200"]};border:none;display:flex;align-items:center;justify-content:center">{icon("close",11,2.4)}</button></div>' for t in ['cocoa','rose'])
    right = (f'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><span style="font-family:{fS};font-size:14.5px;font-weight:600">2 pieces on</span>'
             f'<span style="font-family:{fS};font-size:13px;color:{T["cocoa"]}">Clear</span></div>'
             f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">{picked}</div>'
             f'<div style="margin-top:22px">{btn("Add the details", "primary", "next")}</div>')
    content = v4bar('Log outfit', False, icon('close',22,1.8)) + split(left, right, right_w=340)
    return desktop_shell(content, None, h=1000)

# ── Log Outfit — context (desktop) ──────────────────────────────────────────
def d_log_context():
    preview = ''.join(f'<div style="width:100%;aspect-ratio:3/4">{ph(t)}</div>' for t in ['cocoa','rose','sand'])
    occ = ['work','casual','weekend','dinner']
    occ_pills = ''.join(pill(o, i == 0, 'peach', 'md') for i, o in enumerate(occ))
    rating_dots = ''.join(f'<div style="width:7px;height:7px;border-radius:2px;background:{T["cocoa"] if i < 4 else T["g200"]}"></div>' for i in range(5))
    left = f'<div style="display:flex;flex-wrap:wrap;gap:8px">{preview}</div>'
    right = (f'{disp("Anything to remember about it?", 24)}'
             f'<div style="margin-top:24px">{secH("When")}{pill("Today", True, "ink", "md")}</div>'
             f'<div style="margin-top:22px">{secH("What for")}<div style="display:flex;gap:8px;flex-wrap:wrap">{occ_pills}</div>'
             f'<div style="font-family:{fS};font-size:14px;color:{T["g400"]};border-bottom:1px solid {T["line"]};padding:10px 0 6px;margin-top:10px">or type your own&hellip;</div></div>'
             f'<div style="margin-top:22px;display:flex;align-items:center;justify-content:space-between"><span style="font-family:{fS};font-size:14.5px;font-weight:500">How did it feel</span><div style="display:flex;gap:5px">{rating_dots}</div></div>'
             f'<div style="margin-top:22px">{body("Optional", 12.5, T["g500"], "margin-bottom:8px;text-align:right")}<div style="min-height:62px;background:{T["white"]};box-shadow:inset 0 0 0 1px {T["line"]};padding:15px;font-family:{fS};font-size:14px;color:{T["g400"]}">Too warm for the waistcoat by noon&hellip;</div></div>'
             f'<div style="margin-top:24px">{btn("Save to 1 September", "primary", "check", False)}</div>')
    content = v4bar(None, True) + split(left, right, left_w=340)
    return desktop_shell(content, None, h=1000)

# ── Ideas (desktop) ──────────────────────────────────────────────────────────
def d_ideas():
    ideas = [('cocoa','sand','Work jumper + trousers','saved 24 aug', True, 'work'), ('rose','peach','Sunday brunch look','saved 20 aug', False, None),
             ('sand','cocoa','Date-night black','saved 13 aug', True, 'dinner'), ('peach','rose','Airport travel set','saved 2 aug', False, None)]
    cards = ''.join(
        f'<div><div style="position:relative;width:100%;aspect-ratio:4/5">{collage([t1,t2])}'
        + (f'<div style="position:absolute;top:9px;left:9px;height:24px;display:inline-flex;align-items:center;padding:0 10px;background:rgba(247,246,245,.92);font-family:{fS};font-size:11.5px;font-weight:600;text-transform:capitalize">{occ}</div>' if occ else '')
        + (f'<div style="position:absolute;bottom:9px;right:9px;width:24px;height:24px;background:rgba(247,246,245,.92);display:flex;align-items:center;justify-content:center">{icon("spark",13,1.7,T["cocoa"])}</div>' if ai else '')
        + f'</div>{body(name, 14, T["ink"], "font-weight:500;margin-top:8px;line-height:1.35")}{mono(day, 10.5, None, "margin-top:3px")}</div>'
        for t1, t2, name, day, ai, occ in ideas * 2
    )
    content = (f'<div style="display:flex;align-items:flex-end;justify-content:space-between">'
               f'<div>{disp("Ideas", 30)}{body("16 looks you&#39;ve saved for a day that hasn&#39;t happened yet.", 13.5, None, "margin-top:6px")}</div>'
               f'<div style="width:220px">{btn("Suggest", "peach", "spark")}</div></div>'
               f'<div style="display:flex;gap:8px;padding:20px 0 0">{pill("All", True, "ink", "sm", 16)}{pill("Suggested", False, "ink", "sm", 9)}{pill("Mine", False, "ink", "sm", 7)}</div>'
               f'<div style="padding:18px 0 0;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">{cards}</div>')
    return desktop_shell(content, 'bulb', h=1080)

# ── Idea Detail (desktop) ────────────────────────────────────────────────────
def d_idea_detail():
    photo = f'<div style="width:100%;aspect-ratio:3/4">{collage(["cocoa","rose","sand"])}</div>'
    pairing = [('rose', 'Zara Midi Dress', 'Layer the varsity jacket over it for a toned-down pop of color.'), ('sand', 'Chanel Flats', 'Ties into the jacket&#39;s brown wool body.')]
    rows = ''.join(f'<div style="padding:10px 0;border-bottom:1px solid {T["line"]}">{body(txt, 13.5, T["g700"], "line-height:1.5")}'
                    f'<div style="display:flex;align-items:center;gap:5px;margin-top:6px;font-family:{fS};font-size:12.5px;color:{T["cocoa"]}">{icon("bookmark",13,1.7,T["cocoa"])}Save to ideas</div></div>' for _, _, txt in pairing)
    info = (f'{mono("WORK", 11, T["cocoa"])}{disp("A relaxed work look.", 22, 600, None, "margin-top:6px")}'
            f'<div style="margin-top:20px">{secH("It could work with")}{rows}</div>'
            f'<div style="margin-top:22px;display:flex;gap:10px">{btn("Log this outfit", "primary", "cal", False, "", 1)}{btn("Delete", "quiet", "trash", False, "", 1)}</div>')
    content = v4bar('Ideas', True, mono('claude sonnet', 11)) + split(photo, info, left_w=380)
    return desktop_shell(content, 'bulb', h=980)

# ── Shop — check (desktop, plain page, no sheet) ────────────────────────────
def d_shop_sheet():
    content = (v4bar(None, False, icon('close',22,1.8))
               + f'<div>{disp("Thinking about something?", 25)}{body("Upload a photo of something you&#39;re considering. I&#39;ll check it against your style and what you already own.", 14, None, "margin-top:8px;max-width:480px")}</div>'
               + f'<div style="margin-top:22px;max-width:340px"><div style="border:1.5px dashed {T["g200"]};padding:56px 24px;display:flex;flex-direction:column;align-items:center;gap:12px">'
               + f'{icon("cam",30,1.4,T["g400"])}<div style="font-family:{fS};font-size:14.5px;font-weight:500">Upload photo</div>{mono("tap to select or drag &amp; drop", 10.5)}</div></div>'
               + f'<div style="margin-top:24px;max-width:340px">{btn("Should I buy it?", "primary", "spark")}</div>')
    return desktop_shell(content, 'bag', h=900)

# ── Shop — verdict (desktop) ─────────────────────────────────────────────────
def d_shop_result():
    photo = f'<div style="width:100%;aspect-ratio:3/4">{ph("sand")}</div>'
    pros = ['Neutral palette matches your everyday rotation', 'Structured shape layers well over what you own']
    pairing = [('sand', 'Toteme Wide Trousers'), ('cocoa', 'COS Leather Loafers')]
    pro_rows = ''.join(f'<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">{icon("check",14,2.4,T["cocoa"])}{body(p, 13.5, T["g700"])}</div>' for p in pros)
    pair_rows = ''.join(f'<div style="display:flex;align-items:center;gap:13px;padding:10px 0;border-bottom:1px solid {T["line"]}"><div style="width:40px;height:50px">{ph(t)}</div>{body(n, 14, T["ink"], "font-weight:500")}</div>' for t, n in pairing)
    info = (f'{card(mono("the verdict", 11, T["cocoa"]) + disp("Yes, get it.", 28, 600, None, "margin-top:7px") + body("A structured cognac tote in a warm neutral &mdash; it slots right into your rotation.", 14, T["g700"], "margin-top:9px"), T["peach"], 18, False)}'
            f'<div style="margin-top:22px"><div style="display:flex;align-items:flex-end;gap:14px">{disp("82%", 44, 600, T["cocoa"])}{body("style match", 13.5, None, "padding-bottom:6px")}</div><div style="margin-top:16px">{pro_rows}</div></div>'
            f'<div style="margin-top:24px">{secH("You already own")}{pair_rows}</div>'
            f'<div style="margin-top:24px;display:flex;gap:10px">{btn("New photo", "quiet", "cam", False, "", 1)}{btn("Add to closet", "primary", "hanger", False, "", 1)}</div>')
    content = v4bar('Closet', True, mono('claude sonnet', 11)) + split(photo, info, left_w=380)
    return desktop_shell(content, 'bag', h=1080)

# ── Suggest — brief (desktop) ────────────────────────────────────────────────
def d_suggest_brief():
    occ = ['work','casual','weekend','dinner','date night']
    occ_pills = ''.join(pill(o, i == 0, 'peach', 'md') for i, o in enumerate(occ))
    formality_boxes = ''.join(f'<div style="flex:1;height:44px;box-shadow:inset 0 0 0 1px {T["g200"]};display:flex;align-items:center;justify-content:center;font-family:{fM};font-size:12px;color:{T["g400"]}">{i+1}</div>' for i in range(5))
    content = (v4bar(None, False, icon('close',22,1.8))
               + f'<div style="max-width:560px">{disp("What are you dressing for?", 26)}'
               + f'<div style="margin-top:24px">{secH("Occasion")}<div style="display:flex;gap:8px;flex-wrap:wrap">{occ_pills}</div></div>'
               + f'<div style="margin-top:24px">{secH("Formality", "Optional")}<div style="display:flex;gap:6px">{formality_boxes}</div></div>'
               + f'<div style="margin-top:24px">{secH("Anchor an item", "Optional")}<div style="width:100%;border:1.5px dashed {T["g200"]};padding:22px;display:flex;align-items:center;justify-content:center;gap:10px">{icon("plus",18,1.7,T["g400"])}{body("Build around a specific piece", 13.5)}</div></div>'
               + f'<div style="margin-top:26px">{btn("Suggest three looks", "primary", "spark", False)}</div></div>')
    return desktop_shell(content, None, h=900)

# ── Suggest — result (desktop) ───────────────────────────────────────────────
def d_suggest_result():
    photo = f'<div style="position:relative;width:100%;aspect-ratio:3/4">{collage(["sand","cocoa","rose","peach"])}' \
            f'<div style="position:absolute;top:22px;left:22px;height:29px;display:inline-flex;align-items:center;padding:0 12px;background:rgba(247,246,245,.94);font-family:{fS};font-size:12px;font-weight:600">Work</div></div>'
    look_pills = ''.join(f'<div style="flex:1">{pill(f"Look {i+1}", i==2, "ink", "sm", None, True)}</div>' for i in range(3))
    left = photo + f'<div style="margin-top:16px;display:flex;justify-content:center;gap:6px"><div style="width:6px;height:6px;border-radius:2px;background:{T["g200"]}"></div><div style="width:6px;height:6px;border-radius:2px;background:{T["g200"]}"></div><div style="width:20px;height:6px;border-radius:2px;background:{T["ink"]}"></div></div><div style="margin-top:14px;display:flex;gap:8px">{look_pills}</div>'
    pieces = [('sand','Zara Knit White Jumper','top'), ('cocoa','Zara White Pants','bottom'), ('rose','Chanel Pink Burgundy Flats','shoes'), ('peach','Maya Rings','accessory')]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:13px;padding:9px 0;border-bottom:1px solid {T["line"]}"><div style="width:36px;height:45px;flex-shrink:0">{ph(t)}</div><div style="flex:1">{body(n, 14, T["ink"], "font-weight:500")}</div>{mono(c, 10.5)}</div>' for t, n, c in pieces)
    right = (f'{disp("Work, 17&deg;.", 22)}{mono("built around: Zara Knit White Jumper", 10, None, "display:block;margin-top:6px")}'
             f'<div style="margin-top:18px">{rows}</div>'
             f'<div style="margin-top:20px;display:flex;gap:8px"><div style="width:34px;height:34px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">&#9650;</div><div style="width:34px;height:34px;border:1px solid {T["g200"]};display:flex;align-items:center;justify-content:center">&#9660;</div></div>'
             f'<div style="margin-top:22px">{btn("Wear this today", "primary", "check", False)}</div>')
    content = v4bar('Brief', True, mono('3 / 3', 11.5)) + split(left, right, left_w=380)
    return desktop_shell(content, None, h=1000)

# ── Me (desktop) ─────────────────────────────────────────────────────────────
def d_me():
    cards = [('chart','Statistics','105 outfits'), ('bulb','Ideas','16 saved'), ('archive','Archived','16 pieces'), ('repeat','Constants','0 always on')]
    card_html = ''
    for ic, label, sub in cards:
        inner = icon(ic, 20, 1.6, T['cocoa']) + f'<div style="margin-top:15px"><div style="font-family:{fS};font-size:14.5px;font-weight:600">{label}</div><div style="margin-top:1px">{mono(sub, 10.5)}</div></div>'
        card_html += f'<div>{card(inner)}</div>'
    profile_inner = (f'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:15px">'
                      f'<div style="display:flex;align-items:center;gap:15px">'
                      f'<div style="width:58px;height:58px;background:{T["white"]};display:flex;align-items:center;justify-content:center;font-family:{fS};font-size:21px;font-weight:600;flex-shrink:0">S</div>'
                      f'<div>{disp("spelaa.newsletter", 19)}<div style="margin-top:3px">{mono("spelaa.newsletter@icloud.com", 11, T["cocoa"])}</div></div></div>'
                      f'<div style="font-family:{fS};font-size:13px;font-weight:500;color:{T["cocoaDeep"]};flex-shrink:0">sign out</div></div>')
    content = (f'<div style="display:flex;align-items:center;justify-content:space-between">{disp("Me", 30)}{mono("v3.0", 11)}</div>'
               f'<div style="margin-top:20px;max-width:640px">{card(profile_inner, T["peach"], 18, False)}</div>'
               f'<div style="margin-top:16px;max-width:640px;display:grid;grid-template-columns:1fr 1fr;gap:11px">{card_html}</div>'
               f'<div style="margin-top:24px;max-width:640px">{secH("How I dress", "Edit")}{card(body("My style is fundamentally minimalist with bold colour pops, anchored by a reliable rotation of black basics, Zara staples, and neutral tones.", 14, T["g700"]))}</div>')
    return desktop_shell(content, 'user', h=900)

# ── Statistics (desktop) ─────────────────────────────────────────────────────
def d_statistics():
    most_worn = [('cocoa','Zara Black Jumper','24&times;'), ('sand','COS Wide Trousers','19&times;'), ('rose','Nike Sneakers','17&times;')]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:12px;padding:9px 0"><div style="width:34px;height:42px;flex-shrink:0">{ph(t)}</div>'
                    f'<div style="flex:1;min-width:0">{body(n, 13.5, T["ink"], "font-weight:500")}</div>{mono(v, 12, T["ink"], "font-weight:700")}</div>' for t, n, v in most_worn)
    brands = [('COS', 82), ('Zara', 68), ('Toteme', 41), ('Nike', 30)]
    brand_rows = ''.join(f'<div style="padding:9px 0"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-family:{fS};font-size:13.5px">{b}</span>{mono(str(v), 12, T["ink"], "font-weight:700")}</div>'
                          f'<div style="height:6px;background:{T["g200"]}"><div style="height:6px;width:{v}%;background:{T["cocoa"]}"></div></div></div>' for b, v in brands)
    left = card(secH("Most worn", "All") + rows, T['white'], 22, True)
    right = card(secH("Top brands") + brand_rows, T['white'], 22, True)
    # Same hierarchy change as the mobile screen: title collapses into the
    # sticky breadcrumb (Me / Statistics), Monthly moves down to sit right
    # above the content it filters instead of the top bar.
    crumb = (
        f'<div style="height:44px;display:flex;align-items:center;gap:7px;'
        f'position:sticky;top:0;background:{T["paper"]};z-index:5">'
        f'{icon("back",20,1.7,T["ink"])}'
        f'<span style="font-family:{fS};font-size:14px;font-weight:500;color:{T["g400"]}">Me</span>'
        f'<span style="font-family:{fS};font-size:14px;font-weight:500;color:{T["g200"]}">/</span>'
        f'<span style="font-family:{fS};font-size:14px;font-weight:600;color:{T["ink"]}">Statistics</span>'
        f'</div>'
    )
    content = (crumb
               + f'<div style="display:flex;gap:8px;margin-top:14px">{pill("Pieces", True, "ink", "sm")}{pill("Outfits", False, "ink", "sm")}{pill("Colour", False, "ink", "sm")}</div>'
               + f'<div style="margin-top:18px;display:flex;justify-content:flex-end">{mono("Monthly &#9662;", 13)}</div>'
               + f'<div style="margin-top:10px">{split(left, right)}</div>')
    return desktop_shell(content, 'chart', h=980)

# ── Today empty / Log saved (desktop, single column) ────────────────────────
def d_today_empty():
    dotted_bg = (f'background-color:{T["paper"]};background-image:radial-gradient(circle,rgba(0,0,0,.13) 1px,transparent 1.4px);background-size:22px 22px;')
    card_inner = (f'{img("wave.png", 92, None, "margin-bottom:18px;opacity:.95")}{disp("Nothing on today yet.", 22)}'
                  f'{body("You can log it yourself or I can pull something together from your closet.", 14, None, "margin-top:8px;max-width:340px")}'
                  f'<div style="display:flex;gap:10px;margin-top:22px;max-width:420px">{btn("Log what I&#39;m wearing", "primary", "cal", False, "", 1)}{btn("Suggest three looks", "peach", "spark", False, "", 1)}</div>')
    content = f'<div style="padding:30px 24px 26px;border:1px solid {T["line"]};{dotted_bg}max-width:640px">{card_inner}</div>'
    return desktop_shell(content, 'home', h=700)

def d_log_saved():
    thumbs = ''.join(f'<div style="width:52px;height:64px">{ph(t)}</div>' for t in ['cocoa','rose','sand','peach','cocoa','sand'])
    content = (v4bar(None, False, icon('close',22,1.8))
               + f'<div style="text-align:center;max-width:420px;margin:20px auto 0">{img("wave-rose.png", 110, None, "display:block;margin:0 auto 24px")}'
               + f'{disp("Logged.", 28)}{body("Monday, September 1 &mdash; work, 4 pieces. That&#39;s a 6-day streak.", 14.5, None, "margin-top:10px")}'
               + f'<div style="display:flex;gap:9px;justify-content:center;margin-top:22px;flex-wrap:wrap">{thumbs}</div>'
               + f'<div style="margin-top:28px">{btn("Back to today", "primary")}</div></div>')
    return desktop_shell(content, None, h=760)

# ── Login (desktop — its own centered card, no app shell) ───────────────────
def d_login():
    field = lambda label: (f'<div style="padding:12px 0;border-bottom:1px solid {T["line"]}">{body(label, 12.5, T["g500"], "margin-bottom:4px")}'
                            f'<div style="font-family:{fS};font-size:15px;color:{T["g400"]}"></div></div>')
    card_content = (f'<div style="padding:36px 22px 0;display:flex;justify-content:center">{img("logo.png", 108, 108)}</div>'
                    f'<div style="padding:22px 22px 0;text-align:center">{disp("Your closet,<br/>on every device.", 34, 600, None, "line-height:1.1")}</div>'
                    f'<div style="padding:28px 22px 0"><div style="height:80px;border:1px solid {T["line"]};display:flex;align-items:center;padding:0 18px;'
                    f'background-color:{T["paper"]};background-image:radial-gradient(circle,rgba(0,0,0,.13) 1px,transparent 1.4px);background-size:22px 22px">'
                    f'{img("wave.png", 46, None, "opacity:.95")}</div></div>'
                    f'<div style="padding:22px 22px 0;display:flex;gap:8px"><div style="flex:1">{pill("Sign in", True, "ink", "lg", None, True)}</div><div style="flex:1">{pill("Create account", False, "ink", "lg", None, True)}</div></div>'
                    f'<div style="padding:22px 22px 28px">{field("Email")}{field("Password")}<div style="margin-top:22px">{btn("Sign in")}</div></div>')
    content = (f'<div style="width:1440px;min-height:900px;background:{T["paper"]};display:flex;align-items:center;justify-content:center;font-family:{fS};box-sizing:border-box;padding:60px 0">'
               f'<div style="width:430px">{card(card_content, T["white"], 0, True)}'
               f'<div style="padding:18px 0;text-align:center">{mono("pelamarela closet app v3.0", 10.5)}</div></div></div>')
    return content  # not wrapped in desktop_shell — Login has no app shell at all

# ── Loading screens (desktop) — sidenav stays; only the main pane goes dotted
def d_loading(headline_body, active, has_close=True, h=900):
    right = icon('close', 22, 1.8) if has_close else ''
    content = v4bar(None, False, right) + f'<div style="margin-top:20px;max-width:420px">{headline_body}</div>'
    return desktop_shell(content, active, h=h, main_bg_css=DOTTED_BG)

def d_loading_suggest():
    return d_loading(loading_steps_body('Having a look through your closet.', ['Checking the weather', 'Reading your style profile', 'Choosing from your closet'], 1), None, True)

def d_loading_additem():
    return d_loading(loading_steps_body('Reading your photo.', ['Reading the photo', 'Identifying the piece', 'Filling in the details'], 1), 'hanger', False)

def d_loading_styleprofile():
    return d_loading(loading_steps_body('Reading your outfits.', ['Going through your outfits', 'Spotting your patterns', 'Writing it up'], 1), 'user', False)

def d_loading_shop():
    return d_loading(loading_steps_body('Sizing it up.', ['Eyeing it up', 'Cross-checking your closet', 'Making the call'], 1), 'bag', True)

def d_loading_batch_analyzing():
    return d_loading(loading_progress_body('Reading your photos.', '5 of 8 analyzed&hellip;', 62), 'hanger', False)

def d_loading_batch_saving():
    return d_loading(loading_progress_body('Adding to your closet.', 'saving 6 of 8&hellip;', 75), 'hanger', False)


DESKTOP_SCREENS = [
    ('MainDesktop', d_today), ('TodayEmptyDesktop', d_today_empty), ('LoginDesktop', d_login),
    ('MonthDesktop', d_month), ('OutfitDetailDesktop', d_outfit_detail), ('ClosetDesktop', d_closet),
    ('ItemDetailDesktop', d_item_detail), ('AddItemDesktop', d_add_item), ('BatchUploadDesktop', d_batch_upload),
    ('LogOutfitPiecesDesktop', d_log_pieces), ('LogOutfitContextDesktop', d_log_context), ('LogOutfitSavedDesktop', d_log_saved),
    ('IdeasDesktop', d_ideas), ('IdeaDetailDesktop', d_idea_detail),
    ('ShopSheetDesktop', d_shop_sheet), ('ShopResultDesktop', d_shop_result),
    ('SuggestBriefDesktop', d_suggest_brief), ('SuggestResultDesktop', d_suggest_result),
    ('MeDesktop', d_me), ('StatisticsDesktop', d_statistics),
    ('LoadingSuggestDesktop', d_loading_suggest), ('LoadingAddItemDesktop', d_loading_additem),
    ('LoadingStyleProfileDesktop', d_loading_styleprofile), ('LoadingShopDesktop', d_loading_shop),
    ('LoadingBatchAnalyzingDesktop', d_loading_batch_analyzing), ('LoadingBatchSavingDesktop', d_loading_batch_saving),
]

if __name__ == '__main__':
    for name, fn in DESKTOP_SCREENS:
        html = fn()
        if name == 'LoginDesktop':
            path = os.path.join(OUT, f'{name}.dc.html')
            with open(path, 'w') as f:
                f.write(frame(name, html))
            print('wrote', name)
        else:
            write(name, html)
    print(f'{len(DESKTOP_SCREENS)} desktop screens written')
