import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const daysUntil = d => { if (!d) return null; const ms = new Date(d+'T00:00:00') - new Date(); return Math.ceil(ms/86400000) }

export default function LeaseList() {
  const [leases, setLeases]         = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants]       = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.LEASES), getAll(STORES.PROPERTIES), getAll(STORES.TENANTS)])
      .then(([l, p, t]) => { setLeases(l); setProperties(p); setTenants(t); setLoading(false) })
  }, [])

  if (loading) return <div className="page-loading">Loading leases...</div>

  const propMap   = Object.fromEntries(properties.map(p => [p.id, p]))
  const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t]))

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Leases</h1>
          <p className="list-sub">{leases.length} lease{leases.length !== 1 ? 's' : ''} on record</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/leases/new')}><Plus size={16}/> Add Lease</button>
      </div>

      {leases.length === 0 ? (
        <div className="list-empty">
          <FileText size={48} className="list-empty-icon"/>
          <h3>No leases yet</h3>
          <p>Add your first lease to get started.</p>
          <button className="btn-add" onClick={() => navigate('/leases/new')}><Plus size={16}/> Add Lease</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Type</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th className="r">Rent/Mo</th>
                <th className="r">Security Dep</th>
              </tr>
            </thead>
            <tbody>
              {leases.map(l => {
                const prop   = propMap[l.propertyId]
                const tenant = tenantMap[l.tenantId]
                const days   = daysUntil(l.endDate)
                const expiring = days !== null && days <= 60 && days >= 0
                let badge = 'badge-gray'; let label = l.status || 'Unknown'
                if (l.status === 'active')     { badge = 'badge-green'; label = 'Active' }
                if (l.status === 'expired')    { badge = 'badge-red';   label = 'Expired' }
                if (l.status === 'terminated') { badge = 'badge-red';   label = 'Terminated' }
                return (
                  <tr key={l.id} className="list-row" onClick={() => navigate(`/leases/${l.id}`)}>
                    <td><div className="cell-main">{prop?.nickname || prop?.address?.street || '—'}</div></td>
                    <td>{tenant ? `${tenant.firstName} ${tenant.lastName}` : '—'}</td>
                    <td>{l.type === 'section8' ? <span className="badge badge-purple">Sec 8</span> : 'Standard'}</td>
                    <td><span className={`badge ${badge}`}>{label}</span></td>
                    <td>{fmtDate(l.startDate)}</td>
                    <td className={expiring ? 'clr-warn' : ''}>
                      {fmtDate(l.endDate)}{expiring ? ` (${days}d)` : ''}
                    </td>
                    <td className="r">{l.monthlyRent ? `$${Number(l.monthlyRent).toLocaleString()}` : '—'}</td>
                    <td className="r">{l.securityDeposit ? `$${Number(l.securityDeposit).toLocaleString()}` : '—'}</td>
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
