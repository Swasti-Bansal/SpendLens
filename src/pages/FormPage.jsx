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

export default function FormPage() {
  const navigate = useNavigate()

  // Load saved form state from localStorage or use defaults
  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return JSON.parse(saved).tools } catch { return [{ ...DEFAULT_TOOL_ENTRY }] }
    }
    return [{ ...DEFAULT_TOOL_ENTRY }]
  })

  const [teamSize, setTeamSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return JSON.parse(saved).teamSize } catch { return 1 }
    }
    return 1
  })

  const [useCase, setUseCase] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { return JSON.parse(saved).useCase } catch { return 'mixed' }
    }
    return 'mixed'
  })

  // Save to localStorage whenever form changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }))
  }, [tools, teamSize, useCase])

  // Update a specific field in a tool entry
  function updateTool(index, field, value) {
    setTools(prev => prev.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    ))
  }

  // Reset plan when tool changes
  function handleToolChange(index, toolKey) {
    const firstPlan = Object.keys(TOOLS[toolKey]?.plans || {})[0]
    const price = TOOLS[toolKey]?.plans[firstPlan]?.price || 0
    setTools(prev => prev.map((t, i) =>
      i === index ? { ...t, toolKey, planKey: firstPlan, monthlySpend: price || 0 } : t
    ))
  }

  function handlePlanChange(index, planKey) {
    const toolKey = tools[index].toolKey
    const price = TOOLS[toolKey]?.plans[planKey]?.price || 0
    const seats = tools[index].seats || 1
    setTools(prev => prev.map((t, i) =>
      i === index ? { ...t, planKey, monthlySpend: price * seats } : t
    ))
  }

  function addTool() {
    setTools(prev => [...prev, { ...DEFAULT_TOOL_ENTRY }])
  }

  function removeTool(index) {
    setTools(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const auditResult = runAudit(tools, { teamSize: Number(teamSize), useCase })
    const auditId = uuidv4()
    // Save result to localStorage with the auditId as key
    localStorage.setItem(`audit_${auditId}`, JSON.stringify(auditResult))
    navigate(`/results/${auditId}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            🔍 SpendLens
          </h1>
          <p className="text-gray-400 text-lg">
            Find out if you're overpaying for AI tools — in 60 seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Tool entries */}
          {tools.map((tool, index) => (
            <ToolRow
              key={index}
              tool={tool}
              index={index}
              onToolChange={handleToolChange}
              onPlanChange={handlePlanChange}
              onUpdate={updateTool}
              onRemove={() => removeTool(index)}
              showRemove={tools.length > 1}
            />
          ))}

          {/* Add tool button */}
          <button
            type="button"
            onClick={addTool}
            className="w-full py-3 border border-dashed border-gray-600 text-gray-400 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-colors"
          >
            + Add another tool
          </button>

          {/* Team context */}
          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">About your team</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Team size (people using AI tools)</label>
              <input
                type="number"
                min="1"
                value={teamSize}
                onChange={e => setTeamSize(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Primary use case</label>
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="coding">Coding / Engineering</option>
                <option value="writing">Writing / Content</option>
                <option value="data">Data / Analytics</option>
                <option value="research">Research</option>
                <option value="mixed">Mixed / General</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-colors"
          >
            Run My AI Spend Audit →
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Tool Row Component ───────────────────────────────────────────────────────
function ToolRow({ tool, index, onToolChange, onPlanChange, onUpdate, onRemove, showRemove }) {
  const toolData = TOOLS[tool.toolKey]
  const plans = toolData ? Object.entries(toolData.plans) : []

  return (
    <div className="bg-gray-900 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">Tool {index + 1}</h3>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-500 hover:text-red-400 text-sm transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Tool selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tool</label>
          <select
            value={tool.toolKey}
            onChange={e => onToolChange(index, e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {Object.entries(TOOLS).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Plan selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Plan</label>
          <select
            value={tool.planKey}
            onChange={e => onPlanChange(index, e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {plans.map(([key, plan]) => (
              <option key={key} value={key}>{plan.name}</option>
            ))}
          </select>
        </div>

        {/* Seats */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Seats / Users</label>
          <input
            type="number"
            min="1"
            value={tool.seats}
            onChange={e => {
              const seats = Number(e.target.value)
              const price = TOOLS[tool.toolKey]?.plans[tool.planKey]?.price || 0
              onUpdate(index, 'seats', seats)
              onUpdate(index, 'monthlySpend', price * seats)
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Monthly spend */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Monthly Spend ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={tool.monthlySpend}
            onChange={e => onUpdate(index, 'monthlySpend', Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {TOOLS[tool.toolKey]?.plans[tool.planKey]?.price && (
            <p className="text-xs text-gray-600 mt-1">
              Listed price: ${TOOLS[tool.toolKey].plans[tool.planKey].price}/user/mo
            </p>
          )}
        </div>
      </div>
    </div>
  )
}