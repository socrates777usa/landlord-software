import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const STAGES = [
  { key:'identified',    label:'Identified',     color:'badge-gray'   },
  { key:'offered',       label:'Offered',         color:'badge-blue'   },
  { key:'under_contract',label:'Under Contract',  color:'badge-orange' },
  { key:'rehab',         label:'Rehab',           color:'badge-purple' },
  { key:'rented',        label:'Rented',          color:'badge-green'  },
  { key:'refinanced',    label:'Refinanced ✓',    color:'badge-green'  },
]
const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]))

const fmt$ = n => n !== '' && n !== null && n !== undefined ? `$${Number(n).toLocaleString()}` : '—'

export default function BrrrrList() {
  const [deals, setDeals]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    // Use CAPITAL_EVENTS store repurposed, or define a BRRRR-specific store
    const stored = JSON.parse(localStorage.getItem('acme_brrrr') || '[]')
    setDeals(stored); setLoading(false)
  }, [])

  if (loading) return <div className="page-loading">Loading pipeline...</div>

  const filtered = filter === 'all' ? deals : deals.filter(d => d.stage === filter)
  const byStage  = STAGES.map(s => ({ ...s, count: deals.filter(d => d.stage === s.key).length }))

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">BRRRR Pipeline</h1>
          <p className="list-sub">{deals.length} deal{deals.length !== 1 ? 's' : ''} in funnel</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/brrrr/new')}><Plus size={16}/> Add Deal</button>
      </div>

      {/* Funnel strip */}
      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.25rem', overflowX:'auto', paddingBottom:'0.25rem'}}>
        <button onClick={() => setFilter('all')}
          style={{padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:'1px solid var(--border-bright)',
            background: filter==='all' ? 'var(--amber)' : 'var(--bg-elevated)',
            color: filter==='all' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            fontSize:'0.78rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'var(--font-body)'}}>
          All ({deals.length})
        </button>
        {byStage.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            style={{padding:'0.4rem 0.9rem', borderRadius:'var(--radius)', border:'1px solid var(--border-bright)',
              background: filter===s.key ? 'var(--amber-glow)' : 'var(--bg-elevated)',
              color: filter===s.key ? 'var(--amber)' : 'var(--text-secondary)',
              fontSize:'0.78rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'var(--font-body)'}}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {deals.length === 0 ? (
        <div className="list-empty">
          <Building size={48} className="list-empty-icon"/>
          <h3>No deals yet</h3>
          <p>Track deals from identification through refinance using the BRRRR funnel.</p>
          <button className="btn-add" onClick={() => navigate('/brrrr/new')}><Plus size={16}/> Add Deal</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead><tr>
              <th>Property</th><th>Stage</th>
              <th className="r">Purchase</th><th className="r">Rehab Budget</th>
              <th className="r">All-In</th><th className="r">ARV</th>
              <th className="r">Target Rent</th><th className="r">Proj. DSCR</th>
            </tr></thead>
            <tbody>
              {filtered.map(d => {
                const allIn   = Number(d.purchasePrice||0) + Number(d.rehabBudget||0)
                const stage   = STAGE_MAP[d.stage] || STAGES[0]
                const dscrClr = d.projectedDscr >= 1.25 ? 'clr-pos' : d.projectedDscr >= 1.0 ? 'clr-warn' : 'clr-neg'
                return (
                  <tr key={d.id} className="list-row" onClick={() => navigate(`/brrrr/${d.id}`)}>
                    <td><div className="cell-main">{d.nickname || d.address || '—'}</div><div className="cell-sub">{d.address || ''}</div></td>
                    <td><span className={`badge ${stage.color}`}>{stage.label}</span></td>
                    <td className="r">{fmt$(d.purchasePrice)}</td>
                    <td className="r">{fmt$(d.rehabBudget)}</td>
                    <td className="r">{fmt$(allIn)}</td>
                    <td className="r">{fmt$(d.arv)}</td>
                    <td className="r">{d.targetRent ? `$${Number(d.targetRent).toLocaleString()}/mo` : '—'}</td>
                    <td className={`r ${dscrClr}`}>{d.projectedDscr ? Number(d.projectedDscr).toFixed(2) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
