import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRightLeft } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const TYPE_BADGE = {
  'HELOC Draw':           'badge-orange',
  'DSCR Refi':            'badge-blue',
  'Loan Payoff':          'badge-green',
  'Capital Contribution': 'badge-purple',
  'Distribution':         'badge-gray',
  'Other':                'badge-gray',
}

export default function CapitalList() {
  const [events, setEvents]     = useState([])
  const [properties, setProps]  = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.CAPITAL_EVENTS), getAll(STORES.PROPERTIES)]).then(([evts, props]) => {
      setEvents(evts.sort((a,b) => (b.date||'').localeCompare(a.date||''))); setProps(props); setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Loading capital events...</div>

  const propMap  = Object.fromEntries(properties.map(p => [p.id, p]))
  const totalIn  = events.filter(e => ['DSCR Refi','Capital Contribution'].includes(e.eventType)).reduce((s,e) => s + Number(e.amount||0), 0)
  const totalOut = events.filter(e => ['HELOC Draw','Loan Payoff','Distribution'].includes(e.eventType)).reduce((s,e) => s + Number(e.amount||0), 0)

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Capital Events</h1>
          <p className="list-sub">{events.length} event{events.length !== 1 ? 's' : ''} · Track HELOC draws, refinances &amp; capital recycling</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/capital/new')}><Plus size={16}/> Log Event</button>
      </div>

      {events.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.25rem'}}>
          {[['Total Capital In', `$${totalIn.toLocaleString()}`, 'var(--green)'],
            ['Total Capital Out', `$${totalOut.toLocaleString()}`, 'var(--red)'],
            ['Events Logged', events.length, 'var(--amber)']
          ].map(([label, val, color]) => (
            <div key={label} style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'0.9rem 1rem'}}>
              <div style={{fontSize:'0.68rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem'}}>{label}</div>
              <div style={{fontSize:'1.25rem', fontWeight:700, color, fontFamily:'var(--font-mono)'}}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <div className="list-empty">
          <ArrowRightLeft size={48} className="list-empty-icon"/>
          <h3>No capital events yet</h3>
          <p>Log HELOC draws, DSCR refinances, loan payoffs, and capital contributions here.</p>
          <button className="btn-add" onClick={() => navigate('/capital/new')}><Plus size={16}/> Log Event</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead><tr>
              <th>Date</th><th>Type</th><th>Property</th>
              <th className="r">Amount</th><th>From</th><th>To</th><th>Description</th>
            </tr></thead>
            <tbody>
              {events.map(e => {
                const prop = propMap[e.propertyId]
                const propLabel = prop ? (prop.nickname || prop.address?.street) : (e.propertyId || '—')
                return (
                  <tr key={e.id} className="list-row" onClick={() => navigate(`/capital/${e.id}`)}>
                    <td style={{fontFamily:'var(--font-mono)', fontSize:'0.8rem'}}>{e.date || '—'}</td>
                    <td><span className={`badge ${TYPE_BADGE[e.eventType] || 'badge-gray'}`}>{e.eventType}</span></td>
                    <td>{propLabel}</td>
                    <td className="r" style={{fontWeight:700}}>${Number(e.amount||0).toLocaleString()}</td>
                    <td style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>{e.fromAccount || '—'}</td>
                    <td style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>{e.toAccount || '—'}</td>
                    <td style={{color:'var(--text-secondary)', fontSize:'0.82rem'}}>{e.description || '—'}</td>
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
