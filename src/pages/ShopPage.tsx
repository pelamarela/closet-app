import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { setSingleFile } from '../lib/batchState'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/apiFetch'
import { useAuth } from '../hooks/useAuth'
import { useItems } from '../hooks/useItems'
import { useIdeaMutations } from '../hooks/useIdeaMutations'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { TopBar, AppBar, SectionLabel, UButton, Icon, MONO, UI, INK, RULE, ACCENT, CREAM, BG } from '../components/ui'
import { catLabel } from '../lib/categoryLabel'
import FixedBar from '../components/FixedBar'
import TextBlock from '../components/TextBlock'

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

const VERDICT_CONFIG = {
  buy:   { label: 'BUY IT',    bg: '#1A1A1A', color: '#fff' },
  maybe: { label: 'MAYBE',     bg: CREAM,      color: INK },
  skip:  { label: 'SKIP IT',   bg: '#9C5544',  color: '#fff' },
}

export default function ShopPage() {

  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useItems()
  const fileRef = useRef<HTMLInputElement>(null)
  const { saveIdea } = useIdeaMutations()
  const { isDesktop } = useBreakpoint()

  const [view, setView] = useState<'input' | 'result'>('input')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set())

  const itemMap = new Map(items.map(i => [i.id, i]))

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setError(null)
    try {
      // Normalize to JPEG client-side — phone photos (HEIC/HEIF etc.) aren't in
      // Anthropic's supported image types and fail with an opaque API error.
      const { compressImage } = await import('../lib/imageUtils')
      const compressed = await compressImage(file)
      setImageFile(compressed)
      const reader = new FileReader()
      reader.onload = e => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(compressed)
    } catch {
      setError('Could not process this image. Try a different photo.')
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
    setLoading(true); setError(null)
    const t0 = Date.now()

    try {
      const { data: profileData } = await supabase
        .from('style_profile').select('description, color_season').eq('user_id', user!.id).single()

      // Strip data URL prefix to get raw base64
      const base64 = imagePreview.split(',')[1]
      const mediaType = imageFile.type || 'image/jpeg'

      const res = await apiFetch('/api/analyze-purchase', {
        image_base64: base64,
        media_type: mediaType,
        style_profile: profileData?.description ?? '',
        color_season: profileData?.color_season ?? null,
        items: items.map(({ id, name, category, subcategory, color }) =>
          ({ id, name, category, subcategory, color })),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed')

      setResult(data)
      setElapsed(Math.round((Date.now() - t0) / 100) / 10)
      setView('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  const reset = () => {
    setView('input')
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setElapsed(null)
    setError(null)
  }

  // ── Result view ──────────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const verdict = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.maybe
    const outfitIdeas = result.outfit_ideas ?? []

    return (
      <div style={{ paddingBottom: 100, maxWidth: '100vw', overflowX: 'hidden' }}>
        <AppBar
          title="Shop"
          back
          onBack={reset}
          meta={elapsed !== null ? `${elapsed}s · AI` : undefined}
        />

        {/* Hero: image + compact verdict + bullets (+ pairing on desktop) */}
        {isDesktop ? (
          <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40% 60%',
            gap: 0,
            alignItems: 'stretch',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{ minWidth: 0, aspectRatio: '3/4', border: RULE, overflow: 'hidden' }}>
              {imagePreview && (
                <img src={imagePreview} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div style={{
              minWidth: 0,
              display: 'flex', flexDirection: 'column',
              borderTop: RULE, borderRight: RULE, borderBottom: RULE,
              overflow: 'hidden',
              background: BG,
            }}>
            {/* Verdict block */}
            <div style={{ background: verdict.bg, padding: '14px 12px', flexShrink: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: verdict.color, opacity: 0.6, letterSpacing: '0.08em', marginBottom: 6 }}>
                verdict
              </div>
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: verdict.color, letterSpacing: '0.05em' }}>
                {verdict.label}
              </div>
            </div>

            {/* Style match block */}
            <div style={{ padding: '10px 12px', borderBottom: RULE, flexShrink: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.08em', marginBottom: 4 }}>
                style match
              </div>
              <div style={{ fontFamily: UI, fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>
                {result.style_match}%
              </div>
              <div style={{ marginTop: 6, height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${result.style_match}%`, background: INK, borderRadius: 1 }} />
              </div>
            </div>

            {/* Bullets */}
            <div style={{ padding: '8px 12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(result.pros ?? []).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: '#2D7A3A', flexShrink: 0, marginTop: 1 }}>
                    <Icon name="check" size={11} stroke={2.5} />
                  </span>
                  <span style={{ fontFamily: UI, fontSize: 11, lineHeight: 1.35, color: 'rgba(0,0,0,0.75)' }}>{p}</span>
                </div>
              ))}
              {(result.concerns ?? []).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}>
                    <Icon name="x" size={11} stroke={2.5} />
                  </span>
                  <span style={{ fontFamily: UI, fontSize: 11, lineHeight: 1.35, color: 'rgba(0,0,0,0.75)' }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Pairing items — shown inline on desktop, below on mobile */}
            {isDesktop && result.pairing_items.length > 0 && (
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: RULE }}>
                <div style={{ padding: '8px 12px 4px', fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  pairs with
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {result.pairing_items.map((p, i) => {
                    const item = itemMap.get(p.id)
                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '40px 1fr',
                        gap: 10, alignItems: 'center',
                        padding: '7px 12px', borderBottom: RULE,
                      }}>
                        <div style={{ width: 40, height: 54, border: RULE, overflow: 'hidden', flexShrink: 0 }}>
                          {item?.signedImageUrl ? (
                            <img src={item.signedImageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 5px, #DCD9D3 5px 10px)' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: INK }}>{p.name}</div>
                          <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.03em', marginTop: 1 }}>
                            {item ? catLabel(item.category) : ''}
                          </div>
                          <div style={{ fontFamily: UI, fontSize: 10.5, color: 'rgba(0,0,0,0.55)', marginTop: 3, lineHeight: 1.35 }}>{p.reason}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          </div>
          </div>
        ) : (
          /* Mobile: 30/70 split */
          <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '30% 70%', border: RULE, overflow: 'hidden', alignItems: 'stretch', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              {imagePreview && (
                <img src={imagePreview} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <div style={{ minWidth: 0, borderLeft: RULE, display: 'flex', flexDirection: 'column', background: BG }}>
              <div style={{ background: verdict.bg, padding: '10px 12px', flexShrink: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: verdict.color, opacity: 0.6, letterSpacing: '0.08em', marginBottom: 3 }}>verdict</div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: verdict.color, letterSpacing: '0.04em' }}>{verdict.label}</div>
              </div>
              <div style={{ padding: '8px 12px', borderTop: RULE, flexShrink: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.08em', marginBottom: 3 }}>style match</div>
                <div style={{ fontFamily: UI, fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>{result.style_match}%</div>
                <div style={{ marginTop: 4, height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${result.style_match}%`, background: INK, borderRadius: 1 }} />
                </div>
              </div>
              <div style={{ padding: '8px 12px 12px', borderTop: RULE, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(result.pros ?? []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <span style={{ color: '#2D7A3A', flexShrink: 0, marginTop: 1 }}><Icon name="check" size={10} stroke={2.5} /></span>
                    <span style={{ fontFamily: UI, fontSize: 11, lineHeight: 1.35, color: 'rgba(0,0,0,0.75)' }}>{p}</span>
                  </div>
                ))}
                {(result.concerns ?? []).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                    <span style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }}><Icon name="x" size={10} stroke={2.5} /></span>
                    <span style={{ fontFamily: UI, fontSize: 11, lineHeight: 1.35, color: 'rgba(0,0,0,0.75)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Style analysis */}
        <div style={{ padding: '20px 20px 0' }}>
          <SectionLabel right="AI">style analysis</SectionLabel>
          <TextBlock>{result.style_analysis}</TextBlock>
        </div>

        {/* Closet compatibility */}
        <div style={{ padding: '16px 20px 0' }}>
          <SectionLabel right="your wardrobe">closet fit</SectionLabel>
          <TextBlock>{result.closet_compatibility}</TextBlock>
        </div>

        {/* Pairing items — mobile only, desktop shows in hero panel */}
        {!isDesktop && result.pairing_items.length > 0 && (
          <div style={{ padding: '16px 20px 0' }}>
            <SectionLabel right={`${result.pairing_items.length} pieces`}>pairs with</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: RULE }}>
              {result.pairing_items.map((p, i) => {
                const item = itemMap.get(p.id)
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr',
                    gap: 12, alignItems: 'center',
                    padding: '10px 0', borderBottom: RULE,
                  }}>
                    <div style={{ width: 48, height: 64, border: RULE, overflow: 'hidden', flexShrink: 0 }}>
                      {item?.signedImageUrl ? (
                        <img src={item.signedImageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(135deg, #ECEAE6 0 6px, #DCD9D3 6px 12px)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: INK, marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.45)', letterSpacing: '0.03em' }}>
                        {item ? catLabel(item.category) : ''}
                      </div>
                      <div style={{ fontFamily: UI, fontSize: 11, color: 'rgba(0,0,0,0.6)', marginTop: 4, lineHeight: 1.4 }}>{p.reason}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Outfit ideas */}
        {outfitIdeas.length > 0 && (
          <div style={{ padding: '16px 20px 0' }}>
            <SectionLabel right={`${outfitIdeas.length} looks`}>outfit ideas</SectionLabel>
            <div style={{ borderTop: RULE }}>
              {outfitIdeas.map((idea, i) => {
                const saved = savedIdeas.has(i)
                return (
                  <div key={i} style={{ padding: '10px 0', borderBottom: RULE }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(0,0,0,0.35)', paddingTop: 2, letterSpacing: '0.04em' }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{ fontFamily: UI, fontSize: 13, lineHeight: 1.5, color: 'rgba(0,0,0,0.78)' }}>
                        {idea}
                      </div>
                    </div>
                    <div style={{ paddingLeft: 28 }}>
                      <button
                        onClick={async () => {
                          if (saved) return
                          await saveIdea('', idea, result.pairing_items.map(p => p.id))
                          setSavedIdeas(prev => new Set(prev).add(i))
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: 'none', border: `1px solid ${saved ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.18)'}`,
                          padding: '4px 10px', cursor: saved ? 'default' : 'pointer',
                          fontFamily: MONO, fontSize: 9, letterSpacing: '0.04em',
                          color: saved ? 'rgba(0,0,0,0.35)' : INK,
                        }}
                      >
                        <Icon name="bookmark" size={11} stroke={1.5} />
                        {saved ? 'saved to ideas' : 'save to ideas'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <FixedBar column zIndex={10}>
          <div style={{ display: 'flex', gap: 8 }}>
            <UButton variant="ghost" style={{ flex: 1 }} icon="camera" onClick={reset}>
              Analyze another
            </UButton>
            <UButton
              icon="hanger"
              style={{ flex: 1.4 }}
              onClick={() => {
                if (imageFile) setSingleFile(imageFile)
                navigate('/wardrobe/new')
              }}
            >
              Add to closet
            </UButton>
          </div>
        </FixedBar>
      </div>
    )
  }

  // ── Input view ───────────────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title="Shop" meta="AI helper" />

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(0,0,0,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          // buy it or skip it?
        </div>
        <div style={{ fontFamily: UI, fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 8, lineHeight: 1.1 }}>
          Shop smarter.
        </div>
        <div style={{ fontFamily: UI, fontSize: 13, color: 'rgba(0,0,0,0.5)', marginTop: 8, lineHeight: 1.5 }}>
          Upload a photo of something you're considering buying. AI helper will tell you if it matches your style and works with what you already own.
        </div>
      </div>

      {/* Upload area */}
      <div style={{ padding: '24px 20px 0' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {imagePreview ? (
          <div style={{ position: 'relative' }}>
            <div style={{ border: RULE, overflow: 'hidden', aspectRatio: '3/4', maxWidth: 280, margin: '0 auto' }}>
              <img src={imagePreview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <button
              onClick={reset}
              style={{
                position: 'absolute', top: 8, right: 'calc(50% - 140px + 8px)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(10,10,10,0.7)', border: 'none',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="x" size={14} stroke={2} />
            </button>
            <div style={{ textAlign: 'center', marginTop: 8, fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.04em' }}>
              {imageFile?.name}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${dragging ? INK : 'rgba(0,0,0,0.20)'}`,
              background: dragging ? 'rgba(0,0,0,0.03)' : 'transparent',
              padding: '56px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{ color: 'rgba(0,0,0,0.3)' }}>
              <Icon name="camera" size={32} stroke={1.2} />
            </div>
            <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 500, color: INK }}>
              Upload photo
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: 'rgba(0,0,0,0.4)', textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.5 }}>
              tap to select or drag & drop<br />jpg, png, webp
            </div>
          </div>
        )}
      </div>

      {/* Wardrobe summary */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionLabel right={`${items.length} items`}>context in use</SectionLabel>
        <div style={{ border: RULE, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: 12, borderRight: RULE }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>wardrobe</div>
            <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>
              {items.length} items
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>engine</div>
            <div style={{ fontFamily: UI, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 4 }}>
              AI
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <FixedBar column zIndex={10}>
        {error && <div style={{ fontFamily: MONO, fontSize: 10, color: ACCENT, marginBottom: 8 }}>{error}</div>}
        <UButton
          full icon="spark"
          disabled={loading || !imagePreview}
          loading={loading}
          loadingLabels={['Eyeing it up', 'Cross-checking your closet', 'Making the call']}
          onClick={handleAnalyze}
        >
          Analyze this piece
        </UButton>
      </FixedBar>
    </div>
  )
}
