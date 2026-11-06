import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Calendar, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, CalendarCell, Heading as AriaHeading, Button as AriaButton } from 'react-aria-components'
import { parseDate } from '@internationalized/date'
import { T, fD, fS, V4Icon } from './kit'
import { R } from './radii'

// Date field that opens a calendar right under it (no popover, so it behaves on phones).
// The calendar itself is React Aria's, restyled flat with our tokens; Monday first.
export default function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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

