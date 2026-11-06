import { motion } from 'motion/react'
import { rise } from '../design/rise'
import { CountUp } from '../design/CountUp'
import { SafeImg } from '../design/SafeImg'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSingleFile } from '../lib/batchState'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { T, fS, dotted, V4Icon, V4Bar, Btn, Disp, Body, Mono, SecH, V4Card, CONTENT_MAX_W } from '../design/kit'
import { R } from '../design/radii'

type PairingItem = { id: string; name: string; reason: string }
type AnalysisResult = {
  verdict: 'buy' | 'maybe' | 'skip'
  style_match: number
  pros: string[]
  concerns: string[]
  style_analysis: string
  closet_compatibility: string
  pairing_items: PairingItem[]
  outfit_ideas: string[]
}

const VERDICT_HEADLINE: Record<AnalysisResult['verdict'], string> = {
  buy: 'Yes, get it.',
  maybe: "It's a maybe.",
  skip: "Probably don't.",
}

const LOADING_STEPS = ['eyeing it up', 'cross-checking your closet', 'making the call']

export default function ShopPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const { isDesktop } = useBreakpoint()
  const fileRef = useRef<HTMLInputElement>(null)
  const { saveIdea } = useIdeaMutations()

  const [view, setView] = useState<'input' | 'loading' | 'result'>('input')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set())

  const itemMap = new Map(items.map(i => [i.id, i]))

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('please upload an image file.'); return }
    setError(null)
    try {
      const { compressImage } = await import('../lib/imageUtils')
      const compressed = await compressImage(file)
      setImageFile(compressed)
      const reader = new FileReader()
      reader.onload = e => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(compressed)
    } catch {
      setError('could not process this image. try a different photo.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleAnalyze = async () => {
    if (!imageFile || !imagePreview) return
    setError(null); setView('loading'); setLoadingStep(0)
    const stepTimers = [setTimeout(() => setLoadingStep(1), 900), setTimeout(() => setLoadingStep(2), 1900)]
    try {
      const { data: profileData } = await supabase
        .from('style_profile').select('description, color_season').eq('user_id', user!.id).single()

      const base64 = imagePreview.split(',')[1]
      const res = await apiFetch('/api/analyze-purchase', {
        image_base64: base64,
        media_type: imageFile.type || 'image/jpeg',
        style_profile: profileData?.description ?? '',
        color_season: profileData?.color_season ?? null,
        items: items.map(({ id, name, category, subcategory, color }) => ({ id, name, category, subcategory, color })),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'analysis failed')
      setResult(data)
      setView('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'something went wrong')
      setView('input')
    }
    stepTimers.forEach(clearTimeout)
  }

  const reset = () => {
    setView('input'); setImageFile(null); setImagePreview(null); setResult(null); setError(null); setSavedIdeas(new Set())
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div style={{ ...dotted, minHeight: '70vh' }}>
        <V4Bar right={<button onClick={() => setView('input')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, display: 'flex' }}><V4Icon n="close" s={22} w={1.8} /></button>} />
        <div style={{ padding: '40px 40px 0' }}>
          <img src="/brand/wave.png" alt="" style={{ width: 100, display: 'block', marginBottom: 24 }} />
          <Disp s={26}>sizing it up</Disp>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 15 }}>
            {LOADING_STEPS.map((label, i) => {
              const done = i < loadingStep
              const active = i === loadingStep
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : .4 }}>
                  <div style={{ width: 20, height: 20, background: done ? T.ink : 'transparent', border: done ? 'none' : `1.5px solid ${T.g200}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done && <V4Icon n="check" s={11} w={2.8} />}
                  </div>
                  <Body s={14} c={done ? T.ink : T.g500}>{label}</Body>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const PhotoBlock = imagePreview && (
      <div style={{ borderRadius: R.md, width: '100%', aspectRatio: isDesktop ? '3/4' : '4/3', overflow: 'hidden' }}>
        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )

    const InfoBlock = (
      <>
        <V4Card fill={T.peach} shadow={false} pad={18}>
          <Mono s={11} c={T.cocoa}>the verdict</Mono>
          <Disp s={28} style={{ marginTop: 7 }}>{VERDICT_HEADLINE[result.verdict]}</Disp>
          {result.style_analysis && <Body s={14} c={T.g700} style={{ marginTop: 9 }}>{result.style_analysis}</Body>}
          {result.closet_compatibility && <Body s={14} c={T.g700} style={{ marginTop: 8 }}>{result.closet_compatibility}</Body>}
        </V4Card>
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <Disp s={44} c={T.cocoa}><CountUp to={result.style_match} />%</Disp>
            <Body s={13.5} style={{ paddingBottom: 6 }}>style match</Body>
          </div>
          {(result.pros.length > 0 || result.concerns.length > 0) && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.pros.map((p, i) => (
                <motion.div key={`p${i}`} {...rise(i, 8)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <V4Icon n="check" s={14} w={2.4} c={T.cocoa} style={{ flexShrink: 0, marginTop: 2 }} />
                  <Body s={13.5} c={T.g700}>{p}</Body>
                </motion.div>
              ))}
              {result.concerns.map((c, i) => (
                <motion.div key={`c${i}`} {...rise(result.pros.length + i, 8)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <V4Icon n="close" s={13} w={2.2} c={T.roseDeep} style={{ flexShrink: 0, marginTop: 2 }} />
                  <Body s={13.5} c={T.g700}>{c}</Body>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {result.pairing_items.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <SecH>you already own</SecH>
            {result.pairing_items.map((p, i) => {
              const item = itemMap.get(p.id)
              return (
                <motion.div key={p.id} {...rise(i + 2, 8)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 0', borderBottom: i < result.pairing_items.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                  <div style={{ width: 40, height: 50, flexShrink: 0, overflow: 'hidden', background: T.g200 }}>
                    {item?.signedImageUrl && <SafeImg src={item.signedImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: fS, fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ marginTop: 2 }}><Body s={12} c={T.g500}>{p.reason}</Body></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
        {result.outfit_ideas.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <SecH>it could work with</SecH>
            {result.outfit_ideas.map((idea, i) => {
              const saved = savedIdeas.has(i)
              return (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < result.outfit_ideas.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                  <Body s={13.5} c={T.g700} style={{ lineHeight: 1.5 }}>{idea}</Body>
                  <button
                    onClick={async () => { if (saved) return; await saveIdea('', idea, result.pairing_items.map(p => p.id)); setSavedIdeas(prev => new Set(prev).add(i)) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, marginTop: 6, cursor: saved ? 'default' : 'pointer', fontFamily: fS, fontSize: 12.5, color: saved ? T.g400 : T.cocoa }}
                  >
                    <V4Icon n="bookmark" s={13} w={1.7} />{saved ? 'saved to ideas' : 'save to ideas'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <Btn kind="quiet" flex={1} icon="cam" onClick={reset}>new photo</Btn>
          <Btn flex={1} icon="hanger" onClick={() => { if (imageFile) setSingleFile(imageFile); navigate('/wardrobe/new') }}>add to closet</Btn>
        </div>
      </>
    )

    return (
      <div style={{ paddingBottom: 40 }}>
        <V4Bar back title="closet" onBack={() => navigate('/wardrobe')} right={<Mono s={11}>claude sonnet</Mono>} />
        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 44, alignItems: 'start', padding: '10px 0 0' }}>
            <div style={{ position: 'sticky', top: 'calc(var(--v3-header-h) + 20px)' }}>{PhotoBlock}</div>
            <div>{InfoBlock}</div>
          </div>
        ) : (
          <>
            <div style={{ padding: '10px 22px 0' }}>{PhotoBlock}</div>
            <div style={{ padding: '20px 22px 0' }}>{InfoBlock}</div>
          </>
        )}
      </div>
    )
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  const fileInput = <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

  const UploadArea = imagePreview ? (
    <div style={{ position: 'relative', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ borderRadius: R.md, aspectRatio: '3/4', overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <button onClick={reset} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <V4Icon n="close" s={14} w={2} />
      </button>
    </div>
  ) : (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        borderRadius: 2, border: `1.5px dashed ${dragging ? T.ink : T.g200}`, background: dragging ? 'rgba(0,0,0,.03)' : 'transparent',
        flex: 1, justifyContent: 'center', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer',
      }}
    >
      <V4Icon n="cam" s={30} w={1.4} c={T.g400} />
      <div style={{ fontFamily: fS, fontSize: 14.5, fontWeight: 500, color: T.ink }}>upload photo</div>
      <Mono s={10.5} style={{ textAlign: 'center' }}>tap to select or drag & drop</Mono>
    </div>
  )

  const CTA = (
    <>
      {error && <Body s={12.5} c={T.roseDeep} style={{ marginBottom: 8 }}>{error}</Body>}
      <Btn full icon="spark" disabled={!imagePreview} onClick={handleAnalyze}>should i buy it?</Btn>
    </>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - var(--v3-header-h) - var(--v3-sticky-bottom) - 92px)', minHeight: 420 }}>
      {fileInput}
      <div style={{ padding: '4px 22px 0' }}>
        <Disp s={22}>thinking about something?</Disp>
        <Body s={14} style={{ marginTop: 6 }}>upload a photo, i'll check it against your closet.</Body>
      </div>
      {/* the upload box takes all the space down to the button */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '16px 22px 16px' }}>{UploadArea}</div>
      <div style={{ position: 'fixed', bottom: 'var(--v3-sticky-bottom)', left: 'var(--v3-sidenav-w)', right: 0, padding: '0 22px max(0px, calc(24px - var(--v3-sticky-bottom)))', zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ maxWidth: CONTENT_MAX_W, margin: '0 auto', pointerEvents: 'auto' }}>{CTA}</div>
      </div>
    </div>
  )
}
