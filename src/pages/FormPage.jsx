import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { runAudit } from '../engine/auditEngine'
import { TOOLS } from '../data/pricingData'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'spendlens_form'

const DEFAULT_TOOL_ENTRY = {
  toolKey: 'cursor',
  planKey: 'pro',
  seats: 1,
  monthlySpend: 20,
}

const ANIM_CSS = `
  @keyframes scanLR  { 0%{left:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{left:100%;opacity:0} }
  @keyframes scanRL  { 0%{right:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{right:100%;opacity:0} }
  @keyframes scanTB  { 0%{top:-100%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes scanD   { 0%{left:-150%;opacity:0} 4%{opacity:1} 90%{opacity:1} 100%{left:100%;opacity:0} }
  @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  @keyframes brPulse { 0%,100%{opacity:.2} 50%{opacity:.7} }
  @keyframes lensFloat{ 0%,100%{transform:translateY(-50%) scale(1)} 50%{transform:translateY(-51%) scale(1.025)} }
  @keyframes magMove {
    0%  {transform:translate(0,0)}
    25% {transform:translate(40px,15px)}
    50% {transform:translate(20px,40px)}
    75% {transform:translate(-15px,20px)}
    100%{transform:translate(0,0)}
  }
  @keyframes glowBeat { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
  @keyframes shimmer  { 0%{left:-100%} 100%{left:200%} }
`

const WATERMARKS = [
  { text:'GPT-4o',     size:78, color:'rgba(124,58,237,0.08)',  top:'6%',  left:'-2%',  rotate:'-8deg'  },
  { text:'Claude',     size:44, color:'rgba(99,102,241,0.07)',  top:'4%',  right:'4%',  rotate:'5deg'   },
  { text:'Cursor',     size:58, color:'rgba(14,165,233,0.07)',  top:'33%', left:'1%',   rotate:'9deg'   },
  { text:'Copilot',    size:36, color:'rgba(249,115,22,0.06)',  top:'40%', right:'1%',  rotate:'-6deg'  },
  { text:'Anthropic',  size:66, color:'rgba(124,58,237,0.06)',  top:'53%', left:'32%',  rotate:'3deg'   },
  { text:'Windsurf',   size:42, color:'rgba(99,102,241,0.07)',  top:'63%', left:'-1%',  rotate:'-9deg'  },
  { text:'OpenAI',     size:50, color:'rgba(14,165,233,0.06)',  top:'78%', left:'18%',  rotate:'-4deg'  },
  { text:'Gemini',     size:34, color:'rgba(124,58,237,0.07)',  top:'86%', right:'22%', rotate:'7deg'   },
  { text:'Team Plan',  size:46, color:'rgba(99,102,241,0.06)',  top:'48%', left:'16%',  rotate:'4deg'   },
  { text:'ChatGPT',    size:26, color:'rgba(14,165,233,0.08)',  top:'91%', left:'4%',   rotate:'-8deg'  },
  { text:'API credits',size:24, color:'rgba(249,115,22,0.06)',  top:'14%', left:'38%',  rotate:'-3deg'  },
  { text:'Sonnet',     size:54, color:'rgba(124,58,237,0.05)',  top:'73%', left:'50%',  rotate:'2deg'   },
]

const H_LINES = [
  { color:'rgba(168,85,247,0.65)',  top:'18%', dur:'9s',  delay:'0s'   },
  { color:'rgba(192,132,252,0.55)', top:'42%', dur:'11s', delay:'3.5s' },
  { color:'rgba(236,72,153,0.45)',  top:'71%', dur:'8s',  delay:'7s'   },
  { color:'rgba(124,58,237,0.5)',   top:'88%', dur:'13s', delay:'1.5s' },
]
const RL_LINES = [
  { color:'rgba(99,102,241,0.5)',  top:'30%', dur:'10s', delay:'2s'  },
  { color:'rgba(124,58,237,0.55)', top:'60%', dur:'12s', delay:'5s'  },
  { color:'rgba(14,165,233,0.45)', top:'80%', dur:'9s',  delay:'8s'  },
]
const V_LINES = [
  { color:'rgba(124,58,237,0.55)', left:'15%', dur:'10s', delay:'1s'   },
  { color:'rgba(99,102,241,0.5)',  left:'45%', dur:'13s', delay:'4s'   },
  { color:'rgba(14,165,233,0.45)', left:'72%', dur:'9s',  delay:'0.5s' },
  { color:'rgba(124,58,237,0.45)', left:'88%', dur:'11s', delay:'6s'   },
]
const D_LINES = [
  { color:'rgba(124,58,237,0.55)', top:'10%', rot:'25deg',  dur:'11s', delay:'0s'   },
  { color:'rgba(99,102,241,0.5)',  top:'35%', rot:'-18deg', dur:'13s', delay:'3s'   },
  { color:'rgba(14,165,233,0.45)', top:'62%', rot:'12deg',  dur:'10s', delay:'6s'   },
  { color:'rgba(124,58,237,0.45)', top:'20%', rot:'40deg',  dur:'12s', delay:'4.5s' },
]

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function LoadingOverlay({ active }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-7"
      style={{ background: 'linear-gradient(180deg, rgba(7,7,15,0.97), rgba(15,5,30,0.97))', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 0 120px rgba(124,58,237,0.08)' }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.08) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative" style={{ width: 180, height: 180 }}>
        <div className="absolute rounded-full pointer-events-none"
          style={{ inset: -20, background: 'radial-gradient(circle,rgba(124,58,237,0.25) 0%,transparent 70%)', animation: 'glowBeat 2s ease-in-out infinite' }} />

        <div className="absolute rounded-full"
          style={{
            width: 140, height: 140, top: 10, left: 10,
            border: '2px solid rgba(167,139,250,0.7)',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 0 40px rgba(124,58,237,0.2)',
            animation: 'magMove 2.6s ease-in-out infinite',
          }}>
          <div className="absolute rounded-full" style={{ inset: 12, border: '1px solid rgba(124,58,237,0.2)' }} />
          <div className="absolute" style={{ top: '50%', left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.7),transparent)', transform: 'translateY(-50%)' }} />
          <div className="absolute" style={{ left: '50%', top: '18%', bottom: '18%', width: 1, background: 'linear-gradient(to bottom,transparent,rgba(168,85,247,0.7),transparent)', transform: 'translateX(-50%)' }} />
        </div>

        <div className="absolute rounded-sm"
          style={{ bottom: -44, right: -16, width: 3, height: 50, background: 'linear-gradient(to bottom,rgba(167,139,250,0.8),rgba(124,58,237,0.1))', transform: 'rotate(42deg)', transformOrigin: 'top' }} />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#a78bfa', letterSpacing: '0.14em' }}>
          Analysing your stack
        </p>
        <div className="flex gap-1.5">
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'rgba(167,139,250,0.7)', animation: `pulse 1.2s ${d}s ease-in-out infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) { try { return JSON.parse(saved).tools } catch { return [{ ...DEFAULT_TOOL_ENTRY }] } }
    return [{ ...DEFAULT_TOOL_ENTRY }]
  })
  const [teamSize, setTeamSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) { try { return JSON.parse(saved).teamSize } catch { return 1 } }
    return 1
  })
  const [useCase, setUseCase] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) { try { return JSON.parse(saved).useCase } catch { return 'mixed' } }
    return 'mixed'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }))
  }, [tools, teamSize, useCase])

  function updateTool(index, field, value) {
    setTools(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }
  function handleToolChange(index, toolKey) {
    const firstPlan = Object.keys(TOOLS[toolKey]?.plans || {})[0]
    const price = TOOLS[toolKey]?.plans[firstPlan]?.price || 0
    setTools(prev => prev.map((t, i) => i === index ? { ...t, toolKey, planKey: firstPlan, monthlySpend: price || 0 } : t))
  }
  function handlePlanChange(index, planKey) {
    const toolKey = tools[index].toolKey
    const price = TOOLS[toolKey]?.plans[planKey]?.price || 0
    const seats = tools[index].seats || 1
    setTools(prev => prev.map((t, i) => i === index ? { ...t, planKey, monthlySpend: price * seats } : t))
  }
  function addTool() { setTools(prev => [...prev, { ...DEFAULT_TOOL_ENTRY }]) }
  function removeTool(index) { setTools(prev => prev.filter((_, i) => i !== index)) }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const auditResult = runAudit(tools, { teamSize: Number(teamSize), useCase })
      const auditId = uuidv4()
      localStorage.setItem(`audit_${auditId}`, JSON.stringify(auditResult))
      setLoading(false)
      navigate(`/results/${auditId}`)
    }, 1800)
  }

  const CARD_ACCENTS = [
    {
      border: 'rgba(168,85,247,0.35)',
      shimmer: 'rgba(216,180,254,0.6)',
      numColor: 'rgba(196,148,255,0.9)',
      labelColor: 'rgba(196,148,255,0.65)',
      gradient: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(124,58,237,0.04))',
    },
    {
      border: 'rgba(236,72,153,0.30)',
      shimmer: 'rgba(251,182,206,0.55)',
      numColor: 'rgba(251,107,173,0.9)',
      labelColor: 'rgba(251,107,173,0.65)',
      gradient: 'linear-gradient(145deg, rgba(236,72,153,0.08), rgba(190,24,93,0.04))',
    },
    {
      border: 'rgba(99,102,241,0.32)',
      shimmer: 'rgba(165,180,252,0.55)',
      numColor: 'rgba(148,155,255,0.9)',
      labelColor: 'rgba(148,155,255,0.65)',
      gradient: 'linear-gradient(145deg, rgba(99,102,241,0.08), rgba(67,56,202,0.04))',
    },
    {
      border: 'rgba(14,165,233,0.28)',
      shimmer: 'rgba(125,211,252,0.55)',
      numColor: 'rgba(56,189,248,0.9)',
      labelColor: 'rgba(56,189,248,0.65)',
      gradient: 'linear-gradient(145deg, rgba(14,165,233,0.08), rgba(2,132,199,0.04))',
    },
  ]

  return (
    <>
      <style>{ANIM_CSS}</style>
      <LoadingOverlay active={loading} />

      {/* ── Dark page background ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 10% 10%,rgba(124,58,237,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 90% 20%,rgba(99,102,241,0.14) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at 50% 90%,rgba(14,165,233,0.10) 0%,transparent 60%),#07070f' }} />

      {/* ── Watermarks ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {WATERMARKS.map((w, i) => (
          <div key={i} className="absolute select-none font-black"
            style={{ fontSize: w.size, color: w.color, top: w.top, left: w.left, right: w.right, transform: `rotate(${w.rotate})`, fontFamily: "'Space Grotesk',sans-serif", whiteSpace: 'nowrap' }}>
            {w.text}
          </div>
        ))}
      </div>

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
        <span className="text-xs font-medium" style={{ color: 'rgba(150,140,200,0.5)' }}>Free · No signup required</span>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '88vh', padding: '80px 48px 60px' }}>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.06) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />

        {/* Scan lines L→R */}
        {H_LINES.map((l, i) => (
          <div key={`h${i}`} className="absolute pointer-events-none" style={{
            height: 1.5, left: '-100%', width: '100%', top: l.top,
            background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
            boxShadow: `0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2), 0 0 40px rgba(124,58,237,0.12)`,
            filter: 'blur(0.2px)',
            animation: `scanLR ${l.dur} ${l.delay} linear infinite`, opacity: 0,
          }} />
        ))}

        {/* Scan lines R→L */}
        {RL_LINES.map((l, i) => (
          <div key={`rl${i}`} className="absolute pointer-events-none" style={{
            height: 1.5, right: '-100%', left: 'auto', width: '100%', top: l.top,
            background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
            boxShadow: `0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2), 0 0 40px rgba(124,58,237,0.12)`,
            filter: 'blur(0.2px)',
            animation: `scanRL ${l.dur} ${l.delay} linear infinite`, opacity: 0,
          }} />
        ))}

        {/* Scan lines T→B */}
        {V_LINES.map((l, i) => (
          <div key={`v${i}`} className="absolute pointer-events-none" style={{
            width: 1.5, top: '-100%', height: '100%', left: l.left,
            background: `linear-gradient(to bottom,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
            boxShadow: `0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)`,
            filter: 'blur(0.2px)',
            animation: `scanTB ${l.dur} ${l.delay} linear infinite`, opacity: 0,
          }} />
        ))}

        {/* Diagonal scan lines */}
        {D_LINES.map((l, i) => (
          <div key={`d${i}`} className="absolute pointer-events-none" style={{
            height: 1.5, width: '140%', left: '-150%', top: l.top,
            transform: `rotate(${l.rot})`, transformOrigin: 'left center',
            background: `linear-gradient(90deg,transparent,rgba(236,72,153,0.3),${l.color},rgba(168,85,247,0.5),transparent)`,
            boxShadow: `0 0 10px rgba(236,72,153,0.25), 0 0 22px rgba(168,85,247,0.2)`,
            filter: 'blur(0.2px)',
            animation: `scanD ${l.dur} ${l.delay} linear infinite`, opacity: 0,
          }} />
        ))}

        {/* Corner brackets */}
        {[
          { style: { top: 20, left: 20, borderTop: '1.5px solid rgba(124,58,237,0.35)', borderLeft: '1.5px solid rgba(124,58,237,0.35)' }, delay: '0s' },
          { style: { top: 20, right: 20, borderTop: '1.5px solid rgba(99,102,241,0.35)', borderRight: '1.5px solid rgba(99,102,241,0.35)' }, delay: '.75s' },
          { style: { bottom: 20, left: 20, borderBottom: '1.5px solid rgba(14,165,233,0.35)', borderLeft: '1.5px solid rgba(14,165,233,0.35)' }, delay: '1.5s' },
          { style: { bottom: 20, right: 20, borderBottom: '1.5px solid rgba(124,58,237,0.35)', borderRight: '1.5px solid rgba(124,58,237,0.35)' }, delay: '2.25s' },
        ].map((b, i) => (
          <div key={i} className="absolute w-7 h-7 pointer-events-none"
            style={{ ...b.style, animation: `brPulse 3s ${b.delay} ease-in-out infinite` }} />
        ))}

        {/* Ambient lens decoration */}
        <div className="absolute pointer-events-none hidden lg:block"
          style={{ width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.2)', right: '9%', top: '50%', animation: 'lensFloat 6s ease-in-out infinite' }}>
          <div className="absolute rounded-full" style={{ inset: 10, border: '0.5px solid rgba(124,58,237,0.1)' }} />
          <div className="absolute rounded-sm" style={{ bottom: -48, right: -16, width: 2, height: 52, background: 'linear-gradient(to bottom,rgba(124,58,237,0.4),transparent)', transform: 'rotate(42deg)' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center" style={{ maxWidth: 620 }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold mb-7 px-4 py-1.5 rounded-full"
            style={{ color: 'rgba(200,190,255,0.85)', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.28)', boxShadow: '0 2px 12px rgba(124,58,237,0.12)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa', animation: 'pulse 2s ease-in-out infinite' }} />
            Free AI Spend Audit · 60 seconds
          </div>

          <h1 className="font-bold leading-tight mb-3"
            style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(34px,5vw,56px)', color: '#f0f0ff', letterSpacing: '-0.03em' }}>
            Scale AI.<br />Not <span style={{ color: '#a78bfa' }}>expenses.</span>
          </h1>

          <p className="mb-10 mx-auto"
            style={{ fontSize: 15, color: 'rgba(190,185,230,0.75)', lineHeight: 1.7, maxWidth: 460 }}>
            Audit your AI stack in under a minute.<br />Find what's leaking. Fix it instantly.
          </p>
        </div>
      </section>

      {/* ── Form section ── */}
      <section className="relative z-10 px-12 pb-24" style={{ paddingTop: 64 }}>
        <div className="mx-auto" style={{ maxWidth: 680 }}>

          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(150,140,200,0.6)', letterSpacing: '0.1em' }}>
            Step 01 — <span style={{ color: '#a78bfa' }}>Your AI stack</span>
          </p>
          <h2 className="font-bold mb-6" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, color: '#f0f0ff', letterSpacing: '-0.02em' }}>
            What are you paying for?
          </h2>

          <form onSubmit={handleSubmit}>

            {tools.map((tool, index) => {
              const acc = CARD_ACCENTS[index % CARD_ACCENTS.length]
              return (
                <ToolRow
                  key={index}
                  tool={tool}
                  index={index}
                  accent={acc}
                  onToolChange={handleToolChange}
                  onPlanChange={handlePlanChange}
                  onUpdate={updateTool}
                  onRemove={() => removeTool(index)}
                  showRemove={tools.length > 1}
                />
              )
            })}

            {/* Add tool button */}
            <button type="button" onClick={addTool}
              className="w-full mb-8 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1.5px dashed rgba(124,58,237,0.35)', color: 'rgba(150,140,200,0.6)', background: 'rgba(124,58,237,0.05)', backdropFilter: 'blur(8px)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'; e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.10)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'; e.currentTarget.style.color = 'rgba(150,140,200,0.6)'; e.currentTarget.style.background = 'rgba(124,58,237,0.05)' }}>
              + Add another tool
            </button>

            {/* Step 02 */}
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(150,140,200,0.6)', letterSpacing: '0.1em' }}>
              Step 02 — <span style={{ color: '#a78bfa' }}>Your team</span>
            </p>
            <h2 className="font-bold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, color: '#f0f0ff', letterSpacing: '-0.02em' }}>
              A little context
            </h2>

            {/* Context card */}
            <div className="rounded-2xl mb-5 overflow-hidden relative"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(99,102,241,0.1)' }}>
              <div className="absolute top-0 left-0 right-0" style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(148,155,255,0.7),transparent)' }} />
              <div className="grid grid-cols-2 gap-3 p-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                    style={{ fontSize: 9, color: 'rgba(148,155,255,0.7)', letterSpacing: '0.06em' }}>Team size</label>
                  <input type="number" min="1" value={teamSize} onChange={e => setTeamSize(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', color: '#e8e8ff', fontSize: 12 }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                    style={{ fontSize: 9, color: 'rgba(148,155,255,0.7)', letterSpacing: '0.06em' }}>Primary use case</label>
                  <select value={useCase} onChange={e => setUseCase(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', color: '#e8e8ff', fontSize: 12 }}>
                    <option value="coding"   style={{ background: '#1e1b4b' }}>Coding / Engineering</option>
                    <option value="writing"  style={{ background: '#1e1b4b' }}>Writing / Content</option>
                    <option value="data"     style={{ background: '#1e1b4b' }}>Data / Analytics</option>
                    <option value="research" style={{ background: '#1e1b4b' }}>Research</option>
                    <option value="mixed"    style={{ background: '#1e1b4b' }}>Mixed / General</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit"
              className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-xl transition-all"
              style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, padding: '16px 0', background: 'linear-gradient(135deg,#4c1d95,#1e1b4b)', border: '1px solid rgba(124,58,237,0.4)', cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#5b21b6,#2e1b6b)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#4c1d95,#1e1b4b)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.25)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#a78bfa' }} />
              Run My AI Audit →
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

// ─── Tool Row ─────────────────────────────────────────────────────────────────
function ToolRow({ tool, index, accent, onToolChange, onPlanChange, onUpdate, onRemove, showRemove }) {
  const toolData = TOOLS[tool.toolKey]
  const plans = toolData ? Object.entries(toolData.plans) : []

  const inputStyle = {
    width: '100%', borderRadius: 10, padding: '9px 12px', fontSize: 11, outline: 'none',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${accent.border}`,
    color: '#e8e8ff',
  }
  const labelStyle = {
    fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: 5, display: 'block', color: accent.labelColor,
  }

  return (
    <div className="rounded-2xl mb-4 overflow-hidden relative transition-all"
      style={{
        background: accent.gradient,
        border: `1px solid ${accent.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), 0 4px 16px rgba(124,58,237,0.15)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)'
      }}>

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 1, background: `linear-gradient(90deg,transparent,${accent.shimmer},transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="font-bold" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, letterSpacing: '0.1em', color: accent.numColor }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {showRemove && (
          <button type="button" onClick={onRemove}
            className="text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
            remove
          </button>
        )}
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-2 gap-2.5 px-5 pb-5 pt-3">
        <div>
          <label style={labelStyle}>Tool</label>
          <select value={tool.toolKey} onChange={e => onToolChange(index, e.target.value)} style={inputStyle}>
            {Object.entries(TOOLS).map(([key, t]) => (
              <option key={key} value={key} style={{ background: '#1e1b4b' }}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Plan</label>
          <select value={tool.planKey} onChange={e => onPlanChange(index, e.target.value)} style={inputStyle}>
            {plans.map(([key, plan]) => (
              <option key={key} value={key} style={{ background: '#1e1b4b' }}>{plan.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Seats / Users</label>
          <input type="number" min="1" value={tool.seats}
            onChange={e => {
              const seats = Number(e.target.value)
              const price = TOOLS[tool.toolKey]?.plans[tool.planKey]?.price || 0
              onUpdate(index, 'seats', seats)
              onUpdate(index, 'monthlySpend', price * seats)
            }}
            style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Monthly Spend ($)</label>
          <input type="number" min="0" step="0.01" value={tool.monthlySpend}
            onChange={e => onUpdate(index, 'monthlySpend', Number(e.target.value))}
            style={inputStyle} />
          {TOOLS[tool.toolKey]?.plans[tool.planKey]?.price && (
            <p className="mt-1" style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
              Listed: ${TOOLS[tool.toolKey].plans[tool.planKey].price}/user/mo
            </p>
          )}
        </div>
      </div>
    </div>
  )
}