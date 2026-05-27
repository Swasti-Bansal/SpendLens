// src/pages/ResultsPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { generateSummary } from '../lib/generateSummary'
import { saveLead } from '../lib/saveLead'

const ANIM_CSS = `
  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  @keyframes auraRot  { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }
  @keyframes shimmer  { 0%{left:-100%} 100%{left:200%} }
  @keyframes skelPulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes scanLR   { 0%{left:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{left:100%;opacity:0} }
  @keyframes scanRL   { 0%{right:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{right:100%;opacity:0} }
  @keyframes scanTB   { 0%{top:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes scanD    { 0%{left:-150%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{left:100%;opacity:0} }
  @keyframes brPulse  { 0%,100%{opacity:.2} 50%{opacity:.7} }
`

const WATERMARKS = [
  { text: 'GPT-4o',    size: 78, color: 'rgba(124,58,237,0.08)',  top: '6%',  left: '-2%',  rotate: '-8deg'  },
  { text: 'Claude',    size: 44, color: 'rgba(99,102,241,0.07)',  top: '4%',  right: '4%',  rotate: '5deg'   },
  { text: 'Cursor',    size: 58, color: 'rgba(14,165,233,0.07)',  top: '33%', left: '1%',   rotate: '9deg'   },
  { text: 'Anthropic', size: 66, color: 'rgba(124,58,237,0.06)',  top: '53%', left: '32%',  rotate: '3deg'   },
  { text: 'OpenAI',    size: 50, color: 'rgba(14,165,233,0.06)',  top: '78%', left: '18%',  rotate: '-4deg'  },
  { text: 'Gemini',    size: 34, color: 'rgba(124,58,237,0.07)',  top: '86%', right: '22%', rotate: '7deg'   },
  { text: 'Team Plan', size: 46, color: 'rgba(99,102,241,0.06)',  top: '48%', left: '16%',  rotate: '4deg'   },
  { text: 'Sonnet',    size: 54, color: 'rgba(124,58,237,0.05)',  top: '73%', left: '50%',  rotate: '2deg'   },
]

const H_LINES = [
  { color: 'rgba(168,85,247,0.65)',  top: '18%', dur: '9s',  delay: '0s'   },
  { color: 'rgba(192,132,252,0.55)', top: '42%', dur: '11s', delay: '3.5s' },
  { color: 'rgba(236,72,153,0.45)',  top: '71%', dur: '8s',  delay: '7s'   },
  { color: 'rgba(124,58,237,0.5)',   top: '88%', dur: '13s', delay: '1.5s' },
]
const RL_LINES = [
  { color: 'rgba(99,102,241,0.5)',  top: '30%', dur: '10s', delay: '2s'  },
  { color: 'rgba(124,58,237,0.55)', top: '60%', dur: '12s', delay: '5s'  },
  { color: 'rgba(14,165,233,0.45)', top: '80%', dur: '9s',  delay: '8s'  },
]
const V_LINES = [
  { color: 'rgba(124,58,237,0.55)', left: '15%', dur: '10s', delay: '1s'   },
  { color: 'rgba(99,102,241,0.5)',  left: '45%', dur: '13s', delay: '4s'   },
  { color: 'rgba(14,165,233,0.45)', left: '72%', dur: '9s',  delay: '0.5s' },
  { color: 'rgba(124,58,237,0.45)', left: '88%', dur: '11s', delay: '6s'   },
]
const D_LINES = [
  { color: 'rgba(124,58,237,0.55)', top: '10%', rot: '25deg',  dur: '11s', delay: '0s'   },
  { color: 'rgba(99,102,241,0.5)',  top: '35%', rot: '-18deg', dur: '13s', delay: '3s'   },
  { color: 'rgba(14,165,233,0.45)', top: '62%', rot: '12deg',  dur: '10s', delay: '6s'   },
  { color: 'rgba(124,58,237,0.45)', top: '20%', rot: '40deg',  dur: '12s', delay: '4.5s' },
]

// Matches FormPage dark card palette
const RESULT_ACCENTS = [
  {
    gradient: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(124,58,237,0.04))',
    border: 'rgba(168,85,247,0.35)',
    shimmer: 'rgba(216,180,254,0.6)',
    numColor: 'rgba(196,148,255,0.9)',
    saveColor: '#a78bfa',
    recColor: '#a78bfa',
    recBg: 'rgba(124,58,237,0.07)',
    recBorder: 'rgba(124,58,237,0.18)',
  },
  {
    gradient: 'linear-gradient(145deg, rgba(99,102,241,0.08), rgba(67,56,202,0.04))',
    border: 'rgba(99,102,241,0.32)',
    shimmer: 'rgba(165,180,252,0.55)',
    numColor: 'rgba(148,155,255,0.9)',
    saveColor: '#818cf8',
    recColor: '#818cf8',
    recBg: 'rgba(99,102,241,0.07)',
    recBorder: 'rgba(99,102,241,0.2)',
  },
  {
    gradient: 'linear-gradient(145deg, rgba(14,165,233,0.08), rgba(2,132,199,0.04))',
    border: 'rgba(14,165,233,0.28)',
    shimmer: 'rgba(125,211,252,0.55)',
    numColor: 'rgba(56,189,248,0.9)',
    saveColor: '#38bdf8',
    recColor: '#38bdf8',
    recBg: 'rgba(14,165,233,0.07)',
    recBorder: 'rgba(14,165,233,0.18)',
  },
  {
    gradient: 'linear-gradient(145deg, rgba(236,72,153,0.08), rgba(190,24,93,0.04))',
    border: 'rgba(236,72,153,0.30)',
    shimmer: 'rgba(251,182,206,0.55)',
    numColor: 'rgba(251,107,173,0.9)',
    saveColor: '#f472b6',
    recColor: '#f472b6',
    recBg: 'rgba(236,72,153,0.07)',
    recBorder: 'rgba(236,72,153,0.2)',
  },
  {
    gradient: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(124,58,237,0.04))',
    border: 'rgba(168,85,247,0.35)',
    shimmer: 'rgba(216,180,254,0.6)',
    numColor: 'rgba(196,148,255,0.9)',
    saveColor: '#a78bfa',
    recColor: '#a78bfa',
    recBg: 'rgba(124,58,237,0.07)',
    recBorder: 'rgba(124,58,237,0.18)',
  },
]

// ─── Build a privacy-safe share URL ──────────────────────────────────────────
// Strips tool names, company names, emails etc. — only exposes aggregate
// savings numbers and the auditId (which is a random UUID with no PII).
function buildShareUrl(audit, auditId) {
  const params = new URLSearchParams({
    savings: audit.totalSavings,
    spend: audit.totalCurrentSpend,
    tier: audit.savingsTier,
    tools: audit.results?.length ?? 0,
  })
  return `${window.location.origin}/results/${auditId}?${params.toString()}`
}

// ─── OG meta helpers ─────────────────────────────────────────────────────────
function buildOgMeta(audit) {
  if (!audit) return { title: 'SpendLens — AI Spend Audit', description: 'Audit your AI stack in under a minute.' }

  const { savingsTier, totalSavings, annualSavings, totalCurrentSpend } = audit

  if (savingsTier === 'optimal') {
    return {
      title: 'My AI stack is already optimised — SpendLens',
      description: `Spending $${totalCurrentSpend.toLocaleString()}/mo across ${audit.results?.length ?? 0} AI tools, and every dollar is well-placed. Run your own free audit.`,
    }
  }
  if (savingsTier === 'low') {
    return {
      title: `I could save $${totalSavings.toLocaleString()}/mo on AI tools — SpendLens`,
      description: `Small tweaks could free up $${annualSavings.toLocaleString()} a year. Run your own free AI spend audit in 60 seconds.`,
    }
  }
  // medium / high
  return {
    title: `I found $${totalSavings.toLocaleString()}/mo in AI waste — SpendLens`,
    description: `$${annualSavings.toLocaleString()}/year sitting on the table. See how your AI stack compares — free audit, 60 seconds.`,
  }
}

export default function ResultsPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  const [audit, setAudit] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)

  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem(`audit_${auditId}`)

    if (!data) {
      navigate('/')
      return
    }

    const parsed = JSON.parse(data)

    async function loadAudit() {
      setAudit(parsed)

      const text = await generateSummary(parsed)

      setSummary(text)
      setSummaryLoading(false)
    }

    loadAudit()
  }, [auditId, navigate])

  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (honeypot) return
    setSubmitting(true)
    await saveLead({ email, companyName, role, auditId, auditSummary: audit })
    setSubmitted(true)
    setSubmitting(false)
  }

  function handleShare() {
    if (!audit) return
    const url = buildShareUrl(audit, auditId)
    navigator.clipboard.writeText(url)
    alert('Link copied!')
  }

  if (!audit) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070f' }}>
      <p style={{ color: 'rgba(150,140,200,0.5)' }}>Loading audit...</p>
    </div>
  )

  const isHighSavings = audit.savingsTier === 'high'
  const isLowSavings  = audit.savingsTier === 'low'
  const isOptimal     = audit.savingsTier === 'optimal'

  const ogMeta = buildOgMeta(audit)
  const shareUrl = buildShareUrl(audit, auditId)

  return (
    <>
      {/* ── Open Graph / Twitter Card meta ── */}
      <Helmet>
        <title>{ogMeta.title}</title>
        <meta name="description" content={ogMeta.description} />

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={shareUrl} />
        <meta property="og:title"       content={ogMeta.title} />
        <meta property="og:description" content={ogMeta.description} />
        <meta property="og:site_name"   content="SpendLens" />
        {/* og:image — point at your static card or a dynamic endpoint once you have one */}
        <meta property="og:image"       content={`${window.location.origin}/og-card.png`} />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={ogMeta.title} />
        <meta name="twitter:description" content={ogMeta.description} />
        <meta name="twitter:image"       content={`${window.location.origin}/og-card.png`} />
      </Helmet>

      <style>{ANIM_CSS}</style>

      {/* ── Dark page background ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 10% 10%,rgba(124,58,237,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 90% 20%,rgba(99,102,241,0.14) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at 50% 90%,rgba(14,165,233,0.10) 0%,transparent 60%),#07070f' }} />

      {/* ── Grid ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.06) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />

      {/* ── Watermarks ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {WATERMARKS.map((w, i) => (
          <div key={i} className="absolute select-none font-black"
            style={{ fontSize: w.size, color: w.color, top: w.top, left: w.left, right: w.right, transform: `rotate(${w.rotate})`, fontFamily: "'Space Grotesk',sans-serif", whiteSpace: 'nowrap' }}>
            {w.text}
          </div>
        ))}
      </div>

      {/* ── Scan lines L→R ── */}
      {H_LINES.map((l, i) => (
        <div key={`h${i}`} className="fixed pointer-events-none" style={{
          height: 1.5, left: '-100%', width: '100%', top: l.top, zIndex: 1,
          background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
          boxShadow: '0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)',
          filter: 'blur(0.2px)', animation: `scanLR ${l.dur} ${l.delay} linear infinite`, opacity: 0,
        }} />
      ))}

      {/* ── Scan lines R→L ── */}
      {RL_LINES.map((l, i) => (
        <div key={`rl${i}`} className="fixed pointer-events-none" style={{
          height: 1.5, right: '-100%', left: 'auto', width: '100%', top: l.top, zIndex: 1,
          background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
          boxShadow: '0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)',
          filter: 'blur(0.2px)', animation: `scanRL ${l.dur} ${l.delay} linear infinite`, opacity: 0,
        }} />
      ))}

      {/* ── Scan lines T→B ── */}
      {V_LINES.map((l, i) => (
        <div key={`v${i}`} className="fixed pointer-events-none" style={{
          width: 1.5, top: '-100%', height: '100%', left: l.left, zIndex: 1,
          background: `linear-gradient(to bottom,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
          boxShadow: '0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)',
          filter: 'blur(0.2px)', animation: `scanTB ${l.dur} ${l.delay} linear infinite`, opacity: 0,
        }} />
      ))}

      {/* ── Diagonal scan lines ── */}
      {D_LINES.map((l, i) => (
        <div key={`d${i}`} className="fixed pointer-events-none" style={{
          height: 1.5, width: '140%', left: '-150%', top: l.top, zIndex: 1,
          transform: `rotate(${l.rot})`, transformOrigin: 'left center',
          background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
          boxShadow: '0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)',
          filter: 'blur(0.2px)', animation: `scanD ${l.dur} ${l.delay} linear infinite`, opacity: 0,
        }} />
      ))}

      {/* ── Corner brackets ── */}
      {[
        { style: { top: 20, left: 20, borderTop: '1.5px solid rgba(124,58,237,0.35)', borderLeft: '1.5px solid rgba(124,58,237,0.35)' }, delay: '0s' },
        { style: { top: 20, right: 20, borderTop: '1.5px solid rgba(99,102,241,0.35)', borderRight: '1.5px solid rgba(99,102,241,0.35)' }, delay: '.75s' },
        { style: { bottom: 20, left: 20, borderBottom: '1.5px solid rgba(14,165,233,0.35)', borderLeft: '1.5px solid rgba(14,165,233,0.35)' }, delay: '1.5s' },
        { style: { bottom: 20, right: 20, borderBottom: '1.5px solid rgba(124,58,237,0.35)', borderRight: '1.5px solid rgba(124,58,237,0.35)' }, delay: '2.25s' },
      ].map((b, i) => (
        <div key={i} className="fixed w-7 h-7 pointer-events-none" style={{ ...b.style, zIndex: 2, animation: `brPulse 3s ${b.delay} ease-in-out infinite` }} />
      ))}

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-12 py-4"
        style={{ background: 'rgba(7,7,15,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 font-bold text-lg" style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f0f0ff' }}>
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7c3aed' }} />
            <div className="absolute rounded-sm" style={{ bottom: -5, right: -3, width: 3, height: 10, background: '#7c3aed', transform: 'rotate(42deg)' }} />
          </div>
          SpendLens
        </div>
        <button onClick={() => navigate('/')}
          className="text-sm font-semibold transition-all px-4 py-2 rounded-xl"
          style={{ color: 'rgba(150,140,200,0.6)', background: 'none', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(150,140,200,0.6)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}>
          ← Run another audit
        </button>
      </nav>

      {/* ── Results body ── */}
      <section className="relative z-10 px-12 py-16">
        <div className="mx-auto space-y-4" style={{ maxWidth: 680 }}>

          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(150,140,200,0.6)', letterSpacing: '0.1em' }}>
            Your audit — <span style={{ color: '#a78bfa' }}>Results</span>
          </p>
          <h2 className="font-bold mb-6" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, color: '#f0f0ff', letterSpacing: '-0.02em' }}>
            Here's where your money goes
          </h2>

          {/* ── Savings hero ── */}
          <SavingsHero audit={audit} isOptimal={isOptimal} isLowSavings={isLowSavings} />

          {/* ── 3 stat cards ── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: `$${audit.totalCurrentSpend.toLocaleString()}`,
                label: 'What you pay now',
                sub: 'per month across all tools',
                color: '#f0f0ff',
                bg: 'rgba(255,255,255,0.04)',
                border: 'rgba(255,255,255,0.08)',
              },
              {
                value: `$${audit.totalSavings.toLocaleString()}`,
                label: 'You could save',
                sub: 'per month with these changes',
                color: '#a78bfa',
                bg: 'rgba(124,58,237,0.08)',
                border: 'rgba(124,58,237,0.25)',
              },
              {
                value: `$${audit.annualSavings.toLocaleString()}`,
                label: 'Annual impact',
                sub: 'if you act on all recommendations',
                color: '#10b981',
                bg: 'rgba(16,185,129,0.06)',
                border: 'rgba(16,185,129,0.2)',
              },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 text-center transition-transform"
                style={{ background: s.bg, border: `1px solid ${s.border}`, backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, color: s.color }}>{s.value}</div>
                <div className="font-semibold text-xs mb-1" style={{ color: 'rgba(200,195,240,0.8)', fontSize: 11 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(150,140,200,0.45)', lineHeight: 1.4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Credex CTA (high savings only) ── */}
          {isHighSavings && (
            <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(99,102,241,0.08))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }}>
              <div>
                <p className="font-bold text-sm mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f0f0ff' }}>Go further with Credex</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(150,140,200,0.6)' }}>Discounted AI credits for teams spending $500+/mo — real tools, real discounts.</p>
              </div>
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer"
                className="shrink-0 font-bold text-xs px-5 py-2.5 rounded-xl text-white transition-colors"
                style={{ fontFamily: "'Space Grotesk',sans-serif", background: '#10b981', boxShadow: '0 3px 12px rgba(16,185,129,0.3)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                onMouseLeave={e => e.currentTarget.style.background = '#10b981'}>
                Book a call →
              </a>
            </div>
          )}

          {/* ── Low savings nudge ── */}
          {isLowSavings && (
            <div className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.08),rgba(2,132,199,0.04))', border: '1px solid rgba(14,165,233,0.25)', boxShadow: '0 4px 16px rgba(14,165,233,0.08)' }}>
              <p className="font-bold text-sm mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f0f0ff' }}>
                Small savings, but worth it
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(150,140,200,0.6)' }}>
                Under $100/mo in identified savings isn't dramatic — but compounded over a year that's{' '}
                <strong style={{ color: 'rgba(200,195,240,0.8)' }}>${audit.annualSavings.toLocaleString()}</strong> back in your budget.
                The recommendations below are still worth a quick look.
              </p>
            </div>
          )}

          {/* ── AI Summary ── */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.25)', borderLeft: '3px solid #7c3aed', backdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#a78bfa', letterSpacing: '0.1em' }}>AI Audit Summary</p>
            {summaryLoading ? (
              <div className="space-y-2">
                {[100, 85, 68].map((w, i) => (
                  <div key={i} className="rounded" style={{ height: 13, background: 'rgba(124,58,237,0.15)', width: `${w}%`, animation: 'skelPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(190,185,230,0.8)' }}>{summary}</p>
            )}
          </div>

          {/* ── Per-tool breakdown ── */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(150,140,200,0.6)', letterSpacing: '0.1em' }}>
              Tool — <span style={{ color: '#a78bfa' }}>Breakdown</span>
            </p>
            {audit.results.map((result, i) => (
              <ToolResult key={i} result={result} index={i} accent={RESULT_ACCENTS[i % RESULT_ACCENTS.length]} />
            ))}
          </div>

          {/* ── Share ── */}
          <div className="flex justify-end">
            <button onClick={handleShare}
              className="flex items-center gap-2 text-xs font-medium rounded-xl px-4 py-2 transition-all"
              style={{ color: 'rgba(150,140,200,0.5)', border: '1px solid rgba(124,58,237,0.25)', background: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(150,140,200,0.5)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}>
              🔗 Share this audit
            </button>
          </div>

          {/* ── Email capture ── */}
          {!submitted ? (
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(99,102,241,0.1)' }}>
              {/* Top shimmer */}
              <div className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(148,155,255,0.5),transparent)' }} />
              <h3 className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, color: '#f0f0ff' }}>
                {isOptimal ? 'Get notified when new optimizations apply' : 'Get the full report in your inbox'}
              </h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(150,140,200,0.5)' }}>
                {isOptimal
                  ? "We'll alert you when pricing changes or better plans become available for your stack."
                  : 'Free. No spam. Credex will reach out if we find additional savings opportunities.'}
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />
                <input type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', color: '#e8e8ff', fontFamily: 'inherit' }} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Company (optional)" value={companyName} onChange={e => setCompanyName(e.target.value)}
                    className="rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', color: '#e8e8ff', fontFamily: 'inherit' }} />
                  <input type="text" placeholder="Your role (optional)" value={role} onChange={e => setRole(e.target.value)}
                    className="rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', color: '#e8e8ff', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-3 font-bold text-white rounded-xl transition-all"
                  style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, background: 'linear-gradient(135deg,#4c1d95,#1e1b4b)', border: '1px solid rgba(124,58,237,0.4)', cursor: 'pointer', opacity: submitting ? 0.6 : 1, boxShadow: '0 8px 32px rgba(124,58,237,0.25)' }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = 'linear-gradient(135deg,#5b21b6,#2e1b6b)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.4)' } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#4c1d95,#1e1b4b)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.25)' }}>
                  {submitting ? 'Saving...' : 'Send me the report →'}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p className="font-semibold mb-1" style={{ color: '#10b981', fontSize: 15 }}>✓ You're on the list</p>
              <p className="text-xs" style={{ color: 'rgba(150,140,200,0.5)' }}>
                Check your inbox.{isHighSavings && ' Credex will reach out about your savings opportunities.'}
              </p>
            </div>
          )}

        </div>
      </section>
    </>
  )
}

// ─── Savings hero — handles optimal / low / medium / high tiers ───────────────
function SavingsHero({ audit, isOptimal, isLowSavings }) {
  // low tier: amber palette
  const lowStyle = {
    background: 'linear-gradient(145deg, rgba(245,158,11,0.10), rgba(217,119,6,0.05))',
    border: '1px solid rgba(245,158,11,0.28)',
    boxShadow: '0 8px 32px rgba(245,158,11,0.10)',
  }
  const defaultStyle = {
    background: isOptimal
      ? 'linear-gradient(145deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))'
      : 'linear-gradient(145deg, rgba(124,58,237,0.14), rgba(99,102,241,0.08))',
    border: isOptimal ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(124,58,237,0.35)',
    boxShadow: isOptimal ? '0 8px 32px rgba(16,185,129,0.12)' : '0 8px 40px rgba(124,58,237,0.15)',
  }

  const heroStyle = isLowSavings ? lowStyle : defaultStyle

  return (
    <div className="rounded-2xl text-center relative overflow-hidden" style={{ padding: '44px 36px', ...heroStyle }}>

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 1, background: isLowSavings
          ? 'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)'
          : isOptimal
            ? 'linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)'
            : 'linear-gradient(90deg,transparent,rgba(216,180,254,0.7),transparent)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />

      {/* Aura — only for medium/high */}
      {!isOptimal && !isLowSavings && (
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 400, height: 240, top: '50%', left: '50%', background: 'conic-gradient(from 0deg,rgba(124,58,237,0.14),rgba(99,102,241,0.12),rgba(14,165,233,0.08),rgba(124,58,237,0.14))', filter: 'blur(40px)', animation: 'auraRot 10s linear infinite' }} />
      )}

      <div className="relative">
        {/* Tier label */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{
            color: isLowSavings ? 'rgba(251,191,36,0.8)' : isOptimal ? 'rgba(52,211,153,0.8)' : 'rgba(150,140,200,0.6)',
            letterSpacing: '0.1em',
          }}>
          {isOptimal   ? 'Your AI spend looks optimized'     :
           isLowSavings ? 'A few small wins identified'       :
                          'Potential monthly savings found'}
        </p>

        {isOptimal ? (
          <div className="font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, color: '#10b981', letterSpacing: '-0.02em' }}>
            You're spending well ✓
          </div>
        ) : isLowSavings ? (
          <>
            {/* Low: smaller number, amber color, softer headline */}
            <div className="font-bold leading-none mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(42px,6vw,58px)', color: '#f0f0ff', letterSpacing: '-0.04em' }}>
              <span style={{ color: '#fbbf24' }}>$</span>{audit.totalSavings.toLocaleString()}
              <span className="font-normal ml-1" style={{ fontSize: 20, color: 'rgba(150,140,200,0.6)' }}>/mo</span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'rgba(190,185,230,0.7)' }}>
              That's <strong style={{ color: '#f0f0ff' }}>${audit.annualSavings.toLocaleString()}</strong> back over the year — worth a 5-minute fix
            </p>
          </>
        ) : (
          <>
            <div className="font-bold leading-none mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(52px,7vw,72px)', color: '#f0f0ff', letterSpacing: '-0.04em' }}>
              <span style={{ color: '#a78bfa' }}>$</span>{audit.totalSavings.toLocaleString()}
              <span className="font-normal ml-1" style={{ fontSize: 22, color: 'rgba(150,140,200,0.6)' }}>/mo</span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'rgba(190,185,230,0.7)' }}>
              That's <strong style={{ color: '#f0f0ff' }}>${audit.annualSavings.toLocaleString()}</strong> you could save over a full year
            </p>
          </>
        )}

        <p className="text-xs mt-2" style={{ color: 'rgba(150,140,200,0.5)' }}>
          Based on your current spend of <strong style={{ color: 'rgba(190,185,230,0.7)' }}>${audit.totalCurrentSpend.toLocaleString()}/mo</strong>
        </p>

        {!isOptimal && (
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              color: isLowSavings ? '#fbbf24' : '#10b981',
              background: isLowSavings ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              border: isLowSavings ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(16,185,129,0.25)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ background: isLowSavings ? '#fbbf24' : '#10b981', animation: 'pulse 2s ease-in-out infinite' }} />
            {isLowSavings
              ? `Quick wins across ${audit.results?.filter(r => r.monthlySavings > 0).length || 0} tool(s)`
              : `Savings identified across ${audit.results?.filter(r => r.monthlySavings > 0).length || 0} tool(s)`}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Per-tool result card ─────────────────────────────────────────────────────
function ToolResult({ result, index, accent }) {
  const isOptimal = result.status === 'optimal'

  return (
    <div className="rounded-2xl mb-3 overflow-hidden flex relative transition-all"
      style={{
        background: accent.gradient,
        border: `1px solid ${accent.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), 0 4px 16px rgba(124,58,237,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)' }}>

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 1, background: `linear-gradient(90deg,transparent,${accent.shimmer},transparent)` }} />

      {/* Body */}
      <div className="flex-1 p-4">
        <div className="font-bold mb-1.5" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, letterSpacing: '0.08em', color: accent.numColor }}>
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="font-semibold mb-0.5" style={{ fontSize: 13, color: '#f0f0ff' }}>{result.toolName}</div>
        <div className="mb-2" style={{ fontSize: 10, color: 'rgba(150,140,200,0.5)' }}>
          {result.planName} · {result.seats} seat{result.seats !== 1 ? 's' : ''}
        </div>

        {isOptimal ? (
          <span className="text-xs font-medium" style={{ color: '#10b981' }}>✓ Plan is well-matched to your usage</span>
        ) : (
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl p-2.5"
                style={{ background: accent.recBg, border: `1px solid ${accent.recBorder}` }}>
                <p className="font-semibold text-xs mb-0.5" style={{ color: accent.recColor }}>{rec.action}</p>
                <p style={{ fontSize: 10, color: 'rgba(150,140,200,0.6)', lineHeight: 1.5 }}>{rec.reason}</p>
                {rec.savingsAmount > 0 && (
                  <p className="font-semibold mt-1" style={{ fontSize: 10, color: '#10b981' }}>
                    Saves ${rec.savingsAmount}/mo
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-end justify-center px-5 py-4 shrink-0"
        style={{ minWidth: 110, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-bold" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: '#f0f0ff' }}>
          ${result.currentMonthlySpend}<span className="font-normal text-xs" style={{ color: 'rgba(150,140,200,0.5)' }}>/mo</span>
        </div>
        {result.monthlySavings > 0 && (
          <>
            <div className="font-semibold mt-1 text-xs" style={{ color: accent.saveColor }}>
              save ${result.monthlySavings}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(150,140,200,0.4)', marginTop: 2 }}>per month</div>
          </>
        )}
      </div>
    </div>
  )
}