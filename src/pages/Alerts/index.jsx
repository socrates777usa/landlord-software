import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'

const today = new Date()
const in30  = new Date(today); in30.setDate(today.getDate() + 30)
const in60  = new Date(today); in60.setDate(today.getDate() + 60)
const in90  = new Date(today); in90.setDate(today.getDate() + 90)

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getAll(STORES.PROPERTIES), getAll(STORES.TENANTS),
      getAll(STORES.LEASES), getAll(STORES.MAINTENANCE), getAll(STORES.INSURANCE)
    ]).then(([props, tenants, leases, maint, insurance]) => {
      const items = []

      // Vacant properties
      props.filter(p => p.status === 'vacant').forEach(p => {
        items.push({ id:`vac-${p.id}`, severity:'high', category:'Vacancy',
          title:`Vacant unit: ${p.nickname || p.address?.street || p.id}`,
          detail:'No active tenant assigned to this property.',
          action: () => navigate('/tenants/new') })
      })

      // Lease expirations
      leases.forEach(l => {
        if (!l.endDate) return
        const end = new Date(l.endDate)
        if (end < today) {
          items.push({ id:`lease-exp-${l.id}`, severity:'high', category:'Lease',
            title:`Lease expired: ${l.propertyAddress || l.id}`,
            detail:`Lease ended ${l.endDate}. Action required.`,
            action: () => navigate(`/leases/${l.id}`) })
        } else if (end <= in30) {
          items.push({ id:`lease-30-${l.id}`, severity:'high', category:'Lease',
            title:`Lease expires in <30 days: ${l.propertyAddress || l.id}`,
            detail:`Expires ${l.endDate}. Begin renewal process now.`,
            action: () => navigate(`/leases/${l.id}`) })
        } else if (end <= in60) {
          items.push({ id:`lease-60-${l.id}`, severity:'medium', category:'Lease',
            title:`Lease expires in <60 days: ${l.propertyAddress || l.id}`,
            detail:`Expires ${l.endDate}. Start renewal conversation.`,
            action: () => navigate(`/leases/${l.id}`) })
        } else if (end <= in90) {
          items.push({ id:`lease-90-${l.id}`, severity:'low', category:'Lease',
            title:`Lease expires in <90 days: ${l.propertyAddress || l.id}`,
            detail:`Expires ${l.endDate}. Plan ahead.`,
            action: () => navigate(`/leases/${l.id}`) })
        }
      })

      // Open maintenance
      const openMaint = maint.filter(m => m.status === 'open' || m.status === 'in_progress')
      if (openMaint.length > 0) {
        openMaint.forEach(m => {
          const sev = m.priority === 'emergency' ? 'high' : m.priority === 'urgent' ? 'medium' : 'low'
          items.push({ id:`maint-${m.id}`, severity: sev, category:'Maintenance',
            title:`Open work order: ${m.description?.slice(0,50) || m.id}`,
            detail:`Priority: ${m.priority || 'routine'} · Status: ${m.status}`,
            action: () => navigate(`/maintenance/${m.id}`) })
        })
      }

      // Insurance expiring
      insurance.forEach(ins => {
        if (!ins.expirationDate) return
        const exp = new Date(ins.expirationDate)
        if (exp < today) {
          items.push({ id:`ins-exp-${ins.id}`, severity:'high', category:'Insurance',
            title:`Policy EXPIRED: ${ins.insurer || ins.id}`,
            detail:`Policy ${ins.policyNumber || ''} expired ${ins.expirationDate}. Renew immediately.`,
            action: () => navigate(`/insurance/${ins.id}`) })
        } else if (exp <= in60) {
          items.push({ id:`ins-60-${ins.id}`, severity:'medium', category:'Insurance',
            title:`Policy expiring: ${ins.insurer || ins.id}`,
            detail:`Expires ${ins.expirationDate}. Begin renewal process.`,
            action: () => navigate(`/insurance/${ins.id}`) })
        }
      })

      // Low/no maintenance reserve (properties with no reserve set)
      props.forEach(p => {
        const suggested = (p.currentValue || 0) * 0.01 / 12
        const actual    = p.expenses?.maintenanceActual || 0
        if (suggested > 0 && actual < suggested * 0.5) {
          items.push({ id:`res-${p.id}`, severity:'low', category:'Reserve',
            title:`Low maintenance reserve: ${p.nickname || p.address?.street || p.id}`,
            detail:`Suggested $${suggested.toFixed(0)}/mo · Currently $${actual}/mo`,
            action: () => navigate(`/properties/${p.id}`) })
        }
      })

      const SEV = { high:0, medium:1, low:2 }
      items.sort((a,b) => SEV[a.severity] - SEV[b.severity])
      setAlerts(items); setLoading(false)
    })
  }, [])

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'var(--text-secondary)'}}>Loading alerts...</div>

  const FILTERS = ['all','high','medium','low']
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  const SevIcon = ({ sev }) => {
    if (sev === 'high')   return <AlertTriangle size={16} style={{color:'var(--red)', flexShrink:0}}/>
    if (sev === 'medium') return <AlertTriangle size={16} style={{color:'var(--yellow)', flexShrink:0}}/>
    return <Info size={16} style={{color:'var(--blue)', flexShrink:0}}/>
  }
  const sevBg = { high:'var(--red-dim)', medium:'var(--yellow-dim)', low:'var(--blue-dim)' }
  const sevClr = { high:'var(--red)', medium:'var(--yellow)', low:'var(--blue)' }

  const counts = { high: alerts.filter(a=>a.severity==='high').length, medium: alerts.filter(a=>a.severity==='medium').length, low: alerts.filter(a=>a.severity==='low').length }

  return (
    <div className="page-frame" style={{maxWidth:'900px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <div>
          <h1 style={{fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em', textTransform:'uppercase'}}>Alerts</h1>
          <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</p>
        </div>
        {alerts.length === 0 && <CheckCircle size={28} style={{color:'var(--green)'}}/>}
      </div>

      {/* Summary badges */}
      <div style={{display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap'}}>
        {FILTERS.map(f => {
          const cnt = f === 'all' ? alerts.length : counts[f]
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{padding:'0.4rem 1rem', borderRadius:'var(--radius)', border:'1px solid var(--border-bright)',
                background: filter===f ? (f==='all'?'var(--amber)': sevBg[f] || 'var(--bg-hover)') : 'var(--bg-elevated)',
                color: filter===f ? (f==='all'?'var(--text-inverse)': sevClr[f] || 'var(--text-primary)') : 'var(--text-secondary)',
                fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)'}}>
              {f.charAt(0).toUpperCase()+f.slice(1)} ({cnt})
            </button>
          )
        })}
      </div>

      {alerts.length === 0 ? (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 2rem', color:'var(--text-muted)', gap:'1rem'}}>
          <CheckCircle size={56} style={{color:'var(--green)', opacity:0.7}}/>
          <h3 style={{margin:0, color:'var(--green)', fontFamily:'var(--font-display)', fontSize:'1.2rem', letterSpacing:'0.05em'}}>ALL CLEAR</h3>
          <p style={{margin:0, fontSize:'0.85rem'}}>No active alerts. Portfolio is operating normally.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'0.6rem'}}>
          {filtered.map(a => (
            <div key={a.id} onClick={a.action}
              style={{display:'flex', gap:'1rem', alignItems:'flex-start',
                background:'var(--bg-elevated)', border:`1px solid var(--border)`,
                borderLeft:`3px solid ${sevClr[a.severity]}`,
                borderRadius:'var(--radius)', padding:'0.9rem 1rem',
                cursor:'pointer', transition:'background 0.15s'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--bg-elevated)'}>
              <SevIcon sev={a.severity}/>
              <div style={{flex:1}}>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.25rem'}}>
                  <span style={{fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
                    padding:'0.1rem 0.4rem', borderRadius:'3px', background:sevBg[a.severity], color:sevClr[a.severity]}}>
                    {a.category}
                  </span>
                  <span style={{fontSize:'0.9rem', fontWeight:600, color:'var(--text-primary)'}}>{a.title}</span>
                </div>
                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{a.detail}</div>
              </div>
              <div style={{fontSize:'0.7rem', color:'var(--text-muted)', whiteSpace:'nowrap', marginTop:'0.15rem'}}>→ Action</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
