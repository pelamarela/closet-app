// Dev-only clickable prototype of the overhauled app: new shell, four tabs and a one-sheet Log, sample data.
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { rise } from '../design/rise'
import { Calendar, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, CalendarCell, Heading as AriaHeading, Button as AriaButton } from 'react-aria-components'
import { parseDate } from '@internationalized/date'
import { T, fD, fS, V4Icon, Btn, Pill, Disp, Body, Ph, ItemTile } from '../design/kit'
import type { IconName } from '../design/kit'
import { R } from '../design/radii'
import { usePreviewPalette } from '../design/previewPalette'
import { catLabel } from '../lib/categoryLabel'
import { CATS, ITEMS, OCCASIONS, OUTFIT, TODAY, WEEK_DATES, sortWorn, tierOf, tone, PHOTOS } from '../preview/data'
import { Collage, Heading, Pic } from '../preview/ui'
import type { Nav, Tab, ViewName } from '../preview/nav'
import { ClosetScreen, ItemScreen, AddScreen } from '../preview/closetScreens'
import { SuggestScreen, ShopScreen, IdeasScreen, IdeaScreen } from '../preview/looksScreens'
import { MonthScreen, MeScreen, StatsScreen, ProfileScreen, ArchiveScreen, ConstantsScreen, PasswordScreen, LoginScreen } from '../preview/meScreens'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { usePhotos } from '../preview/usePhotos'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: 'today', icon: 'home' }, { id: 'closet', label: 'closet', icon: 'hanger' },
  { id: 'ideas', label: 'ideas', icon: 'bulb' }, { id: 'me', label: 'me', icon: 'user' },
]

function Today({ desktop, onLog, onOpen, onMonth }: { desktop: boolean; onLog: (date?: string) => void; onOpen: () => void; onMonth: () => void }) {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <div>
        <Body s={14} c={T.g400}>thu, nov 6</Body>
        <Disp s={desktop ? 44 : 34} style={{ marginTop: 6 }}>cloudy, 11°</Disp>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: desktop ? 48 : 32, alignItems: 'start' }}>
        <div>
          <motion.button {...rise(0)} onClick={onOpen} aria-label="Open outfit" style={{ display: 'block', width: '100%', padding: 0, border: 'none', cursor: 'pointer', aspectRatio: desktop ? '4/5' : '1/1', borderRadius: R.lg, overflow: 'hidden' }}><Ph tone="rose" /></motion.button>
          <Disp s={20} style={{ marginTop: 14 }}>linen shirt, cream trousers</Disp>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Btn kind="quiet" flex={1} onClick={() => onLog()}>repeat</Btn>
            <Btn kind="peach" icon="spark" flex={1}>suggest</Btn>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 32 }}>
          <div>
            <Heading action="month" onAction={onMonth}>this week</Heading>
            <div style={{ display: 'flex', gap: 8 }}>
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d, i) => (
                <div key={d} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: fS, fontSize: 12, color: i === 3 ? T.cocoa : T.g400, fontWeight: i === 3 ? 600 : 400 }}>{d}</span>
                  <button onClick={i < 4 ? onOpen : () => onLog(WEEK_DATES[i])} style={{ width: '100%', padding: 0, border: 'none', cursor: 'pointer', aspectRatio: '3/4', borderRadius: R.md, overflow: 'hidden', background: T.white, boxShadow: i === 3 ? `0 0 0 2px ${T.cocoa}` : 'none' }}>{i < 4 ? <Ph tone={tone(i, 2)} /> : null}</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Heading action="calendar" onAction={onMonth}>past</Heading>
            <div style={{ display: 'flex', gap: 12 }}>{[0, 1, 2].map(i => <button key={i} onClick={onOpen} style={{ flex: 1, padding: 0, border: 'none', cursor: 'pointer', aspectRatio: '3/4', borderRadius: R.md, overflow: 'hidden' }}><Ph tone={tone(i, 1)} /></button>)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Date field that opens a calendar right under it (no popover, so it behaves on phones).
// The calendar itself is React Aria's, restyled flat with our tokens; Monday first.
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const label = new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase()
  const nav = { width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: T.ink } as const
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="date" style={{ width: '100%', height: 52, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.white, border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 16, color: T.ink }}>
        {label}<V4Icon n="cal" s={20} w={1.7} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <Calendar aria-label="date" value={parseDate(value)} firstDayOfWeek="mon" onChange={d => { onChange(d.toString()); setOpen(false) }} style={{ padding: '8px 0 4px' }}>
              <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <AriaButton slot="previous" style={nav}><V4Icon n="back" s={20} w={1.8} /></AriaButton>
                <AriaHeading style={{ fontFamily: fD, fontSize: 20, textTransform: 'lowercase' }} />
                <AriaButton slot="next" style={nav}><V4Icon n="next" s={20} w={1.8} /></AriaButton>
              </header>
              <CalendarGrid style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
                <CalendarGridHeader>{d => <CalendarHeaderCell style={{ fontFamily: fS, fontWeight: 400, fontSize: 12, color: T.g400, textTransform: 'lowercase', paddingBottom: 2 }}>{d}</CalendarHeaderCell>}</CalendarGridHeader>
                <CalendarGridBody>
                  {date => (
                    <CalendarCell date={date} style={({ isSelected, isOutsideMonth, isToday }) => ({
                      display: isOutsideMonth ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', height: 40, cursor: 'pointer', outline: 'none',
                      fontFamily: fS, fontSize: 15, fontWeight: isToday ? 700 : 400, borderRadius: R.sm,
                      background: isSelected ? T.cocoa : T.white, color: isSelected ? '#fff' : T.ink,
                    })} />
                  )}
                </CalendarGridBody>
              </CalendarGrid>
            </Calendar>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LogPage({ desktop, onClose, onSave, initial, initialDate }: { desktop: boolean; onClose: () => void; onSave: () => void; initial: number[]; initialDate: string }) {
  const [sel, setSel] = useState<number[]>(initial)
  const [occ, setOcc] = useState('work')
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(initialDate)
  const [cat, setCat] = useState('all')
  const [step, setStep] = useState<'pick' | 'details'>('pick')
  const toggle = (id: number) => setSel(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id])
  const list = ITEMS.filter(i => (cat === 'all' || i.cat === cat))
  const back = step === 'details' ? () => setStep('pick') : onClose
  return (
    <div style={{ paddingBottom: 90 }}>
      {/* header and chosen pieces stay on screen while the grid scrolls */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: T.paper, paddingTop: 4, paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 48 }}>
          <button onClick={back} aria-label="back" style={{ width: 44, height: 44, marginLeft: -10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: T.ink }}><V4Icon n="back" s={22} w={1.8} /></button>
          <Disp s={24}>log</Disp>
        </div>
        {sel.length > 0 && step === 'pick' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', background: T.white, padding: 6, marginTop: 6 }}>
            {sel.map(id => (
              <button key={id} onClick={() => toggle(id)} aria-label={`remove ${ITEMS[id].name}`} style={{ position: 'relative', flexShrink: 0, width: 38, height: 50, padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}>
                <Pic id={id} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="close" s={9} w={2.6} /></span>
              </button>
            ))}
          </div>
        )}
        {step === 'pick' && (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10 }}>
              {CATS.map(c => <Pill key={c} group="pv-logcat" s="sm" on={cat === c} onClick={() => setCat(c)}>{catLabel(c)}</Pill>)}
            </div>
          </>
        )}
      </div>

      {step === 'pick' ? (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${desktop ? 110 : 76}px, 1fr))`, gap: 8, marginTop: 6 }}>
          {list.map(it => <ItemTile key={it.id} src={PHOTOS[it.id]?.src} tone={tone(it.id, 3)} sel={sel.includes(it.id)} onClick={() => toggle(it.id)} />)}
          {list.length === 0 && <Body s={14} style={{ padding: '24px 0' }}>nothing here</Body>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 22, marginTop: 14, maxWidth: 640 }}>
          <DateField value={date} onChange={setDate} />
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{OCCASIONS.map(o => <Pill key={o} group="pv-occ" on={occ === o} onClick={() => setOcc(prev => prev === o ? '' : o)}>{o}</Pill>)}</div>
            <input value={OCCASIONS.includes(occ) ? '' : occ} onChange={e => setOcc(e.target.value)} placeholder="other" style={{ width: '100%', height: 48, marginTop: 10, padding: '0 14px', border: 'none', background: T.white, fontFamily: fS, fontSize: 15, color: T.ink, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.white, padding: '0 14px', height: 52 }}>
            <span style={{ fontFamily: fS, fontSize: 15 }}>feel</span>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(r => r === n ? 0 : n)} aria-label={`feel ${n}`} style={{ width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ width: 14, height: 14, background: n <= rating ? T.cocoa : T.g200, display: 'block' }} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="note" rows={3} style={{ width: '100%', padding: 14, border: 'none', background: T.white, fontFamily: fS, fontSize: 15, color: T.ink, outline: 'none', resize: 'none' }} />
          <button style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: T.white, border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 15, color: T.ink }}><V4Icon n="cam" s={19} w={1.6} />photo</button>
        </div>
      )}

      {/* action bar pinned to the bottom of the screen */}
      <div style={{ position: 'fixed', left: desktop ? 236 : 0, right: 0, bottom: 0, zIndex: 20, background: T.paper, padding: '12px 22px calc(14px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 10 }}>
          {step === 'pick'
            ? <Btn full disabled={sel.length === 0} onClick={() => setStep('details')}>next</Btn>
            : <Btn full onClick={onSave}>save</Btn>}
        </div>
      </div>
    </div>
  )
}

function OutfitDetail({ desktop, onBack, onEdit }: { desktop: boolean; onBack: () => void; onEdit: () => void }) {
  const worn = sortWorn(OUTFIT.pieces)
  const rows = worn.filter(id => tierOf(ITEMS[id].cat) !== 'small')
  const small = worn.filter(id => tierOf(ITEMS[id].cat) === 'small')
  return (
    <div>
      <button onClick={onBack} aria-label="back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 14, color: T.ink, marginBottom: 20 }}>
        <V4Icon n="back" s={18} w={1.8} /> back
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: desktop ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: desktop ? 48 : 24, alignItems: 'start' }}>
        <Collage ids={OUTFIT.pieces} />
        <div>
          <Disp s={desktop ? 36 : 28}>{OUTFIT.title}</Disp>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}><Pill s="sm" on>{OUTFIT.date}</Pill><Pill s="sm">{OUTFIT.occasion}</Pill></div>
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              {rows.map(id => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.white, padding: 8 }}>
                  <div style={{ width: 48, height: 64, flexShrink: 0 }}><Pic id={id} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 600 }}>{ITEMS[id].name}</div><div style={{ fontFamily: fS, fontSize: 13, color: T.g500, marginTop: 2 }}>{catLabel(ITEMS[id].cat)}, {ITEMS[id].worn + 1}×</div></div>
                  <V4Icon n="next" s={16} w={1.8} c={T.g400} />
                </div>
              ))}
            </div>
            {small.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6, marginTop: 14 }}>
                {small.map(id => <div key={id} style={{ aspectRatio: '1/1' }}><Pic id={id} /></div>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <Btn kind="quiet" icon="pen" flex={1} onClick={onEdit}>edit</Btn>
            <Btn kind="peach" icon="repeat" flex={1} onClick={onEdit}>repeat</Btn>
          </div>
          <button style={{ marginTop: 18, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fS, fontSize: 13.5, color: T.g500 }}>delete</button>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const ready = usePreviewPalette()
  usePhotos()
  const { isDesktop } = useBreakpoint()
  const [tab, setTab] = useState<Tab>('today')
  const [logOpen, setLogOpen] = useState(false)
  const [logInitial, setLogInitial] = useState<number[]>([])
  const [logDate, setLogDate] = useState(TODAY)
  const [stack, setStack] = useState<{ name: ViewName; id?: number }[]>([])
  const [toast, setToast] = useState(false)
  if (!ready) return null

  const save = () => { setLogOpen(false); setToast(true); setTimeout(() => setToast(false), 2200) }
  const openLog = (pre: number[] = [], date: string = TODAY) => { setLogInitial(pre); setLogDate(date); setLogOpen(true); window.scrollTo(0, 0) }
  const nav: Nav = {
    go: (name, id) => { setStack(st => [...st, { name, id }]); window.scrollTo(0, 0) },
    back: () => { setStack(st => st.slice(0, -1)); window.scrollTo(0, 0) },
    tab: t => { setStack([]); setLogOpen(false); setTab(t); window.scrollTo(0, 0) },
    log: openLog,
  }
  const top = stack[stack.length - 1]
  const renderView = () => {
    switch (top.name) {
      case 'item': return <ItemScreen id={top.id ?? 0} nav={nav} />
      case 'add': return <AddScreen nav={nav} />
      case 'suggest': return <SuggestScreen nav={nav} />
      case 'shop': return <ShopScreen nav={nav} />
      case 'idea': return <IdeaScreen id={top.id ?? 0} nav={nav} />
      case 'month': return <MonthScreen nav={nav} />
      case 'stats': return <StatsScreen nav={nav} />
      case 'profile': return <ProfileScreen nav={nav} />
      case 'archive': return <ArchiveScreen nav={nav} />
      case 'constants': return <ConstantsScreen nav={nav} />
      case 'password': return <PasswordScreen nav={nav} />
      case 'login': return <LoginScreen nav={nav} />
      case 'outfit': return <OutfitDetail desktop={isDesktop} onBack={nav.back} onEdit={() => openLog(OUTFIT.pieces)} />
    }
  }
  const tabScreen = tab === 'today' ? <Today desktop={isDesktop} onLog={d => openLog([], d)} onOpen={() => nav.go('outfit')} onMonth={() => nav.go('month')} /> : tab === 'closet' ? <ClosetScreen nav={nav} /> : tab === 'ideas' ? <IdeasScreen nav={nav} /> : <MeScreen nav={nav} />
  const screen = logOpen ? <LogPage key={logInitial.join() + logDate} desktop={isDesktop} initial={logInitial} initialDate={logDate} onClose={() => setLogOpen(false)} onSave={save} /> : top ? renderView() : tabScreen
  const bare = top?.name === 'login'

  const tabBtn = (t: (typeof TABS)[number]) => {
    const on = tab === t.id
    return (
      <button key={t.id} aria-label={t.label} aria-current={on ? 'page' : undefined} onClick={() => nav.tab(t.id)} style={{ flex: 1, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', borderRadius: R.sm, color: T.ink, background: on ? T.peach : 'none' }}>
        <V4Icon n={t.icon} s={23} w={1.7} />
      </button>
    )
  }

  return (
    <div style={{ background: T.paper, minHeight: '100svh', display: isDesktop ? 'flex' : 'block' }}>
      {isDesktop && !bare && (
        <aside style={{ width: 236, flexShrink: 0, position: 'sticky', top: 0, height: '100svh', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Disp s={22} style={{ padding: '0 12px 20px' }}>closet</Disp>
          <Btn kind="primary" icon="plus" full onClick={() => openLog()} style={{ marginBottom: 16 }}>log</Btn>
          {TABS.map(t => {
            const on = tab === t.id
            return (
              <button key={t.id} onClick={() => nav.tab(t.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height: 46, padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: fS, fontSize: 14.5, fontWeight: on ? 600 : 400, color: T.ink, textAlign: 'left' }}>
                {on && <motion.div layoutId="pv-side" transition={{ type: 'spring', stiffness: 500, damping: 38 }} style={{ position: 'absolute', inset: 0, background: T.peach, borderRadius: R.sm }} />}
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}><V4Icon n={t.icon} s={20} w={1.7} />{t.label}</span>
              </button>
            )
          })}
        </aside>
      )}
      <main style={{ flex: 1, minWidth: 0, maxWidth: 1100, padding: isDesktop ? '36px 40px 80px' : '28px 22px 110px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={logOpen ? 'log' : top ? `${top.name}${top.id ?? ''}` : tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>{screen}</motion.div>
        </AnimatePresence>
      </main>
      {!isDesktop && !logOpen && !bare && (
        <nav style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', zIndex: 30, background: T.paper, display: 'flex', gap: 4, padding: 4, borderRadius: R.sm }}>
          {tabBtn(TABS[0])}{tabBtn(TABS[1])}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => openLog()} aria-label="log" style={{ flex: 1, height: 52, border: 'none', cursor: 'pointer', borderRadius: R.sm, background: T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><V4Icon n="plus" s={24} w={2} /></motion.button>
          {tabBtn(TABS[2])}{tabBtn(TABS[3])}
        </nav>
      )}
      <AnimatePresence>
        {toast && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} style={{ position: 'fixed', left: '50%', bottom: isDesktop ? 32 : 96, translateX: '-50%', zIndex: 60, background: T.ink, color: '#fff', borderRadius: R.md, padding: '12px 18px', fontFamily: fS, fontSize: 14 }}>logged</motion.div>}
      </AnimatePresence>
    </div>
  )
}
