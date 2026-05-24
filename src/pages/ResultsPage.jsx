// src/pages/ResultsPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateSummary } from '../lib/generateSummary'
import { saveLead } from '../lib/saveLead'

export default function ResultsPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  const [audit, setAudit] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)

  // Email capture state
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Load audit from localStorage using the ID in the URL
  useEffect(() => {
    const data = localStorage.getItem(`audit_${auditId}`)
    if (!data) {
      navigate('/')
      return
    }
    const parsed = JSON.parse(data)
    setAudit(parsed)

    // Step 2: Once audit is loaded, generate AI summary
    generateSummary(parsed).then(text => {
      setSummary(text)
      setSummaryLoading(false)
    })
  }, [auditId])

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    await saveLead({
      email,
      companyName,
      role,
      auditId,
      auditSummary: audit,
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  if (!audit) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading audit...</p>
    </div>
  )

  const isHighSavings = audit.savingsTier === 'high'
  const isOptimal = audit.savingsTier === 'optimal'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* ── Back button ── */}
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← Run another audit
        </button>

        {/* ── Hero: Total Savings ── */}
        <div className={`rounded-2xl p-8 text-center ${
          isOptimal
            ? 'bg-green-950 border border-green-800'
            : 'bg-blue-950 border border-blue-800'
        }`}>
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">
            {isOptimal ? 'Your AI spend is optimized' : 'Potential savings identified'}
          </p>

          {isOptimal ? (
            <h1 className="text-4xl font-bold text-green-400">
              You're spending well ✓
            </h1>
          ) : (
            <>
              <h1 className="text-6xl font-bold text-white mb-2">
                ${audit.totalSavings.toLocaleString()}
                <span className="text-2xl text-gray-400 font-normal">/mo</span>
              </h1>
              <p className="text-blue-300 text-xl">
                ${audit.annualSavings.toLocaleString()} potential annual savings
              </p>
            </>
          )}

          <p className="text-gray-500 text-sm mt-3">
            Current spend: ${audit.totalCurrentSpend.toLocaleString()}/mo
          </p>
        </div>

        {/* ── Credex CTA (only for high savings) ── */}
        {isHighSavings && (
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-700 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-purple-300 text-xs uppercase tracking-widest mb-1">
                  Credex can help
                </p>
                <h2 className="text-xl font-bold text-white mb-2">
                  Capture even more savings with discounted AI credits
                </h2>
                <p className="text-gray-300 text-sm">
                  Credex sources AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise — 
                  from companies that overforecast. Real discounts, same tools.
                </p>
              </div>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                Book a call &#8594;
              </a>
            </div>
          </div>
        )}

        {/* ── AI Summary ── */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
            AI Audit Summary
          </p>
          {summaryLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed">{summary}</p>
          )}
        </div>

        {/* ── Per-tool breakdown ── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Tool-by-tool breakdown</h2>
          {audit.results.map((result, i) => (
            <ToolResult key={i} result={result} />
          ))}
        </div>

        {/* ── Share button ── */}
        <div className="flex justify-end">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors"
          >
            🔗 Share this audit
          </button>
        </div>

        {/* ── Email capture ── */}
        {!submitted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">
              {isOptimal
                ? 'Get notified when new optimizations apply to your stack'
                : 'Get the full report in your inbox'}
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              {isOptimal
                ? "We'll alert you when pricing changes or better plans become available."
                : 'Free. No spam. Credex will reach out if we can find you additional savings.'}
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {/* Honeypot — spam protection */}
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company name (optional)"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Your role (optional)"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Saving...' : 'Send me the report →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-950 border border-green-800 rounded-2xl p-6 text-center">
            <p className="text-green-400 text-lg font-semibold">✓ You're on the list</p>
            <p className="text-gray-400 text-sm mt-1">
              Check your inbox. {isHighSavings && 'Credex will reach out about your savings opportunities.'}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Per-tool result card ──────────────────────────────────────────────────────
function ToolResult({ result }) {
  const isOptimal = result.status === 'optimal'

  return (
    <div className={`rounded-xl p-5 border ${
      isOptimal
        ? 'bg-gray-900 border-gray-800'
        : 'bg-gray-900 border-yellow-900'
    }`}>
      {/* Tool header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{result.toolName}</h3>
          <p className="text-gray-500 text-xs">{result.planName} · {result.seats} seat(s)</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">${result.currentMonthlySpend}/mo</p>
          {result.monthlySavings > 0 && (
            <p className="text-green-400 text-sm">Save ${result.monthlySavings}/mo</p>
          )}
        </div>
      </div>

      {/* Status */}
      {isOptimal ? (
        <p className="text-green-500 text-sm">✓ Plan is well-matched to your usage</p>
      ) : (
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-3">
              <p className="text-yellow-400 text-sm font-medium mb-1">{rec.action}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{rec.reason}</p>
              {rec.savingsAmount > 0 && (
                <p className="text-green-400 text-xs mt-1 font-medium">
                  Saves ${rec.savingsAmount}/mo
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}