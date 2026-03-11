import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'

const PRIORITY_META = {
  critical: { icon: AlertCircle, color: 'var(--red)',    bg: 'var(--red-dim)',    label: 'Critical' },
  warning:  { icon: AlertTriangle, color: 'var(--yellow)', bg: 'var(--yellow-dim)', label: 'Warning' },
  info:     { icon: Info,          color: 'var(--blue)',   bg: 'var(--blue-dim)',   label: 'Info'  },
}

function buildAlerts(properties, tenants, maintenance, leases) {
  const alerts = []
  const today  = new Date()
  const in60   = new Date(today); in60.setDate(in60.getDate() + 60)
  const in90   = new Date(today); in90.setDate(in90.getDate() + 90)

  // Vacant properties
  properties.filter(p => p.status === 'vacant').forEach(p => {
    alerts.push({ id: `vac-${p.id}`, priority: 'critical', category: 'Vacancy',
      title: `Vacant unit: ${p.nickname || p.address?.street || p.id}`,
      body: 'No active tenant assigned. Every vacant day costs money.',
      link: `/properties/${p.id}` })
  })

  // Leases expiring within 60 days
  leases.filter(l => l.endDate && new Date(l.endDate) <= in60 && new Date(l.endDate) >= today).forEach(l => {
    const daysLeft = Math.round((new Date(l.endDate) - today) / 86400000)
    alerts.push({ id: `lease-${l.id}`, priority: daysLeft <= 30 ? 'critical' : 'warning',
      category: 'Lease', title: `Lease expiring in ${daysLeft} days`,
      body: `${l.propertyId || 'Property'} — expires ${l.endDate}`,
      link: `/leases/${l.id}` })
  })

  // Open/urgent maintenance
  const openMaint = maintenance.filter(m => m.status !== 'closed')
  if (openMaint.length > 0) {
    const urgent = openMaint.filter(m => m.priority === 'emergency' || m.priority === 'urgent')
    if (urgent.length > 0) {
      alerts.push({ id: 'maint-urgent', priority: 'critical', category: 'Maintenance',
        title: `${urgent.length} urgent/emergency maintenance issue${urgent.length > 1 ? 's' : ''}`,
        body: 'Emergency or urgent work orders need immediate attention.',
        link: '/maintenance' })
    }
    if (openMaint.length - urgent.length > 0) {
      alerts.push({ id: 'maint-open', priority: 'info', category: 'Maintenance',
        title: `${openMaint.length - urgent.length} open maintenance work order${openMaint.length - urgent.length > 1 ? 's' : ''}`,
        body: 'Routine work orders are open and unresolved.',
        link: '/maintenance' })
    }
  }

  // Low DSCR
  properties.forEach(p => {
    const payment = p.loan?.monthlyPayment || 0
    const rent    = p.income?.monthlyRent || 0
    if (payment > 0 && rent > 0) {
      const annualNOI = (rent * 12) - ((p.expenses?.propertyTax||0) + (p.expenses?.insurance||0) + (p.expenses?.hoa||0) + (p.expenses?.utilities||0))
      const dscr = annualNOI / (payment * 12)
      if (dscr < 1.0) {
        alerts.push({ id: `dscr-${p.id}`, priority: 'critical', category: 'DSCR',
          title: `Low DSCR: ${p.nickname || p.address?.street || p.id} (${dscr.toFixed(2)})`,
          body: 'DSCR below 1.0 — property is not covering its debt service.',
          link: `/properties/${p.id}` })
      } else if (dscr < 1.25) {
        alerts.push({ id: `dscr-warn-${p.id}`, priority: 'warning', category: 'DSCR',
          title: `DSCR warning: ${p.nickname || p.address?.street || p.id} (${dscr.toFixed(2)})`,
          body: 'DSCR below 1.25 — thin margin. Monitor closely.',
          link: `/properties/${p.id}` })
      }
    }
  })

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return (order[a.priority] || 2) - (order[b.priority] || 2)
  })
}

export default function Alerts() {
  const [allAlerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dismissed_alerts') || '[]')) }
    catch { return new Set() }
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getAll(STORES.PROPERTIES), getAll(STORES.TENANTS),
      getAll(STORES.MAINTENANCE), getAll(STORES.LEASES)
    ]).then(([p, t, m, l]) => {
      setAlerts(buildAlerts(p, t, m, l)); setLoading(false)
    })
  }, [])

  const dismiss = (id) => {
    const next = new Set(dismissed); next.add(id)
    setDismissed(next)
    localStorage.setItem('dismissed_alerts', JSON.stringify([...next]))
  }
  const clearAll = () => {
    const ids = allAlerts.map(a => a.id)
    const next = new Set([...dismissed, ...ids])
    setDismissed(next)
    localStorage.setItem('dismissed_alerts', JSON.stringify([...next]))
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'var(--text-secondary)'}}>Loading alerts...</div>

  const visible = allAlerts.filter(a => !dismissed.has(a.id))
  const critical = visible.filter(a => a.priority === 'critical').length
  const warning  = visible.filter(a => a.priority === 'warning').length

  return (
    <div style={{padding:'2rem', maxWidth:'900px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'0.75rem'}}>
            Alerts
            {visible.length > 0 && <span style={{background:'var(--red)', color:'#fff', borderRadius:'12px', padding:'0.1rem 0.55rem', fontSize:'0.8rem', fontWeight:700}}>{visible.length}</span>}
          </h1>
          <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>
            {critical > 0 && <span style={{color:'var(--red)'}}>{critical} critical</span>}
            {critical > 0 && warning > 0 && ' · '}
            {warning > 0 && <span style={{color:'var(--yellow)'}}>{warning} warning</span>}
            {critical === 0 && warning === 0 && visible.length === 0 && <span style={{color:'var(--green)'}}>All clear ✓</span>}
          </p>
        </div>
        {visible.length > 0 && (
          <button onClick={clearAll} style={{padding:'0.4rem 0.9rem', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-secondary)', fontSize:'0.8rem', cursor:'pointer'}}>
            Dismiss All
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'40vh', gap:'1rem', color:'var(--text-secondary)'}}>
          <CheckCircle size={56} style={{color:'var(--green)', opacity:0.7}}/>
          <h3 style={{fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)'}}>No active alerts</h3>
          <p style={{fontSize:'0.85rem'}}>Your portfolio is looking healthy. Check back after adding more properties or data.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
          {visible.map(a => {
            const meta = PRIORITY_META[a.priority] || PRIORITY_META.info
            const Icon = meta.icon
            return (
              <div key={a.id} style={{background:'var(--bg-elevated)', border:`1px solid var(--border)`, borderLeft:`3px solid ${meta.color}`, borderRadius:'var(--radius)', padding:'1rem 1.25rem', display:'flex', alignItems:'flex-start', gap:'1rem', cursor:'pointer'}}
                onClick={() => navigate(a.link)}>
                <Icon size={20} style={{color:meta.color, flexShrink:0, marginTop:'0.1rem'}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem'}}>
                    <span style={{fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, color:meta.color, fontFamily:'var(--font-display)'}}>{a.category}</span>
                    <span style={{fontSize:'0.65rem', background:meta.bg, color:meta.color, borderRadius:'3px', padding:'0.05rem 0.35rem', fontWeight:700, textTransform:'uppercase'}}>{meta.label}</span>
                  </div>
                  <div style={{fontWeight:600, fontSize:'0.9rem', marginBottom:'0.25rem'}}>{a.title}</div>
                  <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{a.body}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); dismiss(a.id) }}
                  style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem', lineHeight:1, padding:'0.2rem', flexShrink:0}}>×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
