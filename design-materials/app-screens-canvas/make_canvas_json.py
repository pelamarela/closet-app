#!/usr/bin/env python3
import json, os

OUT = os.path.dirname(os.path.abspath(__file__))

# Heights are real measured document.body.scrollHeight values (browser-measured
# against the actual generated .dc.html content) plus ~5% slack, per the design
# skill's sizing guidance — not estimates. Frames are content-driven now (no
# fixed-height clamp in gen.py), so an undersized h here would still clip on a
# static canvas artboard even though the real page itself never clips.

MOBILE = [
    ('Main', 'Today', 1045), ('TodayEmpty', 'Today — nothing logged', 505), ('Login', None, 880), ('Month', None, 820), ('OutfitDetail', None, 1120),
    ('Closet', None, 755), ('ItemDetail', None, 1375), ('AddItem', None, 1240), ('BatchUpload', None, 830), ('LogOutfitPieces', 'Log outfit — pieces', 935),
    ('LogOutfitContext', 'Log outfit — context', 965), ('LogOutfitSaved', 'Log outfit — saved', 580), ('Ideas', None, 940), ('IdeaDetail', None, 1025),
    ('ShopSheet', 'Shop — check', 890), ('ShopResult', 'Shop — verdict', 1095), ('SuggestBrief', 'Suggest — brief', 735), ('SuggestResult', 'Suggest — result', 1050),
    ('Me', None, 940), ('Statistics', None, 795),
    ('LoadingSuggest', 'Loading — Suggest', 485), ('LoadingAddItem', 'Loading — Add item', 450), ('LoadingStyleProfile', 'Loading — style profile', 450),
    ('LoadingShop', 'Loading — Shop', 450), ('LoadingBatchAnalyzing', 'Loading — batch (analyzing)', 390), ('LoadingBatchSaving', 'Loading — batch (saving)', 390),
]

DESKTOP = [
    ('MainDesktop', 'Today', 845), ('TodayEmptyDesktop', 'Today — nothing logged', 575), ('LoginDesktop', None, 905),
    ('MonthDesktop', None, 790), ('OutfitDetailDesktop', None, 755), ('ClosetDesktop', None, 580),
    ('ItemDetailDesktop', None, 1025), ('AddItemDesktop', None, 795), ('BatchUploadDesktop', None, 575),
    ('LogOutfitPiecesDesktop', 'Log outfit — pieces', 580), ('LogOutfitContextDesktop', 'Log outfit — context', 1565),
    ('LogOutfitSavedDesktop', 'Log outfit — saved', 575), ('IdeasDesktop', None, 1040), ('IdeaDetailDesktop', None, 655),
    ('ShopSheetDesktop', 'Shop — check', 575), ('ShopResultDesktop', 'Shop — verdict', 695),
    ('SuggestBriefDesktop', 'Suggest — brief', 575), ('SuggestResultDesktop', 'Suggest — result', 730),
    ('MeDesktop', None, 650), ('StatisticsDesktop', None, 575),
    ('LoadingSuggestDesktop', 'Loading — Suggest', 575), ('LoadingAddItemDesktop', 'Loading — Add item', 575),
    ('LoadingStyleProfileDesktop', 'Loading — style profile', 575), ('LoadingShopDesktop', 'Loading — Shop', 575),
    ('LoadingBatchAnalyzingDesktop', 'Loading — batch (analyzing)', 575), ('LoadingBatchSavingDesktop', 'Loading — batch (saving)', 575),
]

artboards = []
annotations = []

# Mobile page: 5 columns, fixed 390-wide frames, per-screen heights, packed
# rows using each row's tallest artboard so nothing overlaps.
COLS_M = 5
COL_W_M = 390 + 90
ROW_GAP_M = 130
rows_m = [MOBILE[i:i + COLS_M] for i in range(0, len(MOBILE), COLS_M)]
y = 0
for row in rows_m:
    row_h = max(h for _, _, h in row)
    for col, (name, title, h) in enumerate(row):
        ab = {"file": f"{name}.dc.html", "x": col * COL_W_M, "y": y, "w": 390, "h": h, "page": "mobile"}
        if title:
            ab["title"] = title
        artboards.append(ab)
    y += row_h + ROW_GAP_M
annotations.append({"id": "mobile-note", "x": 0, "y": -100, "w": 900, "text": "Closet — mobile screens (static, from the live source)", "page": "mobile"})

# Desktop page: 3 columns, 1440-wide frames, per-screen heights, same packing.
COLS_D = 3
COL_W_D = 1440 + 140
ROW_GAP_D = 140
rows_d = [DESKTOP[i:i + COLS_D] for i in range(0, len(DESKTOP), COLS_D)]
y = 0
for row in rows_d:
    row_h = max(h for _, _, h in row)
    for col, (name, title, h) in enumerate(row):
        ab = {"file": f"{name}.dc.html", "x": col * COL_W_D, "y": y, "w": 1440, "h": h, "page": "desktop"}
        if title:
            ab["title"] = title
        artboards.append(ab)
    y += row_h + ROW_GAP_D
annotations.append({"id": "desktop-note", "x": 0, "y": -100, "w": 900, "text": "Closet — desktop screens (static, from the live source)", "page": "desktop"})

canvas = {
    "artboards": artboards,
    "annotations": annotations,
    "pages": [{"id": "mobile", "name": "Mobile"}, {"id": "desktop", "name": "Desktop"}],
    "launch": {"view": "canvas", "page": "mobile"},
}

with open(os.path.join(OUT, 'canvas.json'), 'w') as f:
    json.dump(canvas, f, indent=2)
print(f'wrote canvas.json: {len(artboards)} artboards, 2 pages')
