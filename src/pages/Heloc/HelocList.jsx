import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const fmt$ = n => n !== '' && n !== null && n !== undefined ? `$${Number(n).toLocaleString()}` : '—'
const pct  = n => n !== '' && n !== null && n !== undefined ? `${Number(n).toFixed(2)}%` : '—'

export default function HelocList() {
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { getAll(STORES.HELOC).then(h => { setLines(h); setLoading(false) }) }, [])

  if (loading) return <div className="page-loading">Loading credit lines...</div>

  const totalLimit     = lines.reduce((s, l) => s + Number(l.limit || 0), 0)
  const totalBalance   = lines.reduce((s, l) => s + Number(l.balance || 0), 0)
  const totalAvailable = totalLimit - totalBalance
  const totalPayment   = lines.reduce((s, l) => s + Number(l.minPayment || 0), 0)

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">HELOC &amp; Credit Lines</h1>
          <p className="list-sub">{lines.length} line{lines.length !== 1 ? 's' : ''} · Available: <strong style={{color:'var(--green)'}}>{fmt$(totalAvailable)}</strong> of {fmt$(totalLimit)}</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/heloc/new')}><Plus size={16}/> Add Line</button>
      </div>

      {/* Summary Bar */}
      {lines.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.25rem'}}>
          {[['Total Limit', fmt$(totalLimit), 'var(--text-primary)'],
            ['Total Balance', fmt$(totalBalance), 'var(--red)'],
            ['Available Credit', fmt$(totalAvailable), 'var(--green)'],
            ['Monthly Payments', fmt$(totalPayment), 'var(--yellow)']
          ].map(([label, val, color]) => (
            <div key={label} style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'0.9rem 1rem'}}>
              <div style={{fontSize:'0.68rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem'}}>{label}</div>
              <div style={{fontSize:'1.25rem', fontWeight:700, color, fontFamily:'var(--font-mono)'}}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="list-empty">
          <CreditCard size={48} className="list-empty-icon"/>
          <h3>No credit lines yet</h3>
          <p>Track HELOCs, business lines, and portfolio credit lines used for acquisitions.</p>
          <button className="btn-add" onClick={() => navigate('/heloc/new')}><Plus size={16}/> Add Line</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead><tr>
              <th>Name / Lender</th><th>Type</th>
              <th className="r">Limit</th><th className="r">Balance</th>
              <th className="r">Available</th><th className="r">Rate</th>
              <th className="r">Min Payment</th><th>Utilization</th>
            </tr></thead>
            <tbody>
              {lines.map(l => {
                const avail = Number(l.limit||0) - Number(l.balance||0)
                const util  = l.limit ? Math.round((Number(l.balance||0) / Number(l.limit)) * 100) : 0
                const utilColor = util >= 80 ? 'var(--red)' : util >= 50 ? 'var(--yellow)' : 'var(--green)'
                return (
                  <tr key={l.id} className="list-row" onClick={() => navigate(`/heloc/${l.id}`)}>
                    <td><div className="cell-main">{l.name}</div><div className="cell-sub">{l.lender}</div></td>
                    <td><span className="badge badge-blue">{l.type}</span></td>
                    <td className="r">{fmt$(l.limit)}</td>
                    <td className="r clr-neg">{l.balance > 0 ? fmt$(l.balance) : <span style={{color:'var(--green)'}}>$0</span>}</td>
                    <td className="r clr-pos">{fmt$(avail)}</td>
                    <td className="r">{pct(l.rate)}</td>
                    <td className="r">{fmt$(l.minPayment)}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                        <div style={{flex:1, height:'6px', background:'var(--border)', borderRadius:'3px'}}>
                          <div style={{height:'100%', width:`${Math.min(util,100)}%`, background:utilColor, borderRadius:'3px', transition:'width 0.3s'}}/>
                        </div>
                        <span style={{fontSize:'0.75rem', color:utilColor, fontFamily:'var(--font-mono)', width:'35px'}}>{util}%</span>
                      </div>
                    </td>
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
