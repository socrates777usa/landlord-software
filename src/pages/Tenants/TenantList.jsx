import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

export default function TenantList() {
  const [tenants, setTenants]     = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.TENANTS), getAll(STORES.PROPERTIES)]).then(([t, p]) => {
      setTenants(t); setProperties(p); setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Loading tenants...</div>

  const propMap = Object.fromEntries(properties.map(p => [p.id, p]))

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Tenants</h1>
          <p className="list-sub">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''} on record</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/tenants/new')}>
          <Plus size={16}/> Add Tenant
        </button>
      </div>

      {tenants.length === 0 ? (
        <div className="list-empty">
          <Users size={48} className="list-empty-icon"/>
          <h3>No tenants yet</h3>
          <p>Add your first tenant to get started.</p>
          <button className="btn-add" onClick={() => navigate('/tenants/new')}><Plus size={16}/> Add Tenant</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Property</th>
                <th>Status</th>
                <th>Move-In</th>
                <th>Lease Ends</th>
                <th className="r">Rent/Mo</th>
                <th>Sec 8</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => {
                const prop = propMap[t.propertyId]
                const propLabel = prop ? (prop.nickname || prop.address?.street || prop.id) : '—'
                const isActive  = t.status === 'active'
                return (
                  <tr key={t.id} className="list-row" onClick={() => navigate(`/tenants/${t.id}`)}>
                    <td>
                      <div className="cell-main">{t.firstName} {t.lastName}</div>
                      <div className="cell-sub">{t.email || t.phone || ''}</div>
                    </td>
                    <td>{propLabel}</td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}>
                        {isActive ? 'Active' : 'Former'}
                      </span>
                    </td>
                    <td>{fmtDate(t.moveInDate)}</td>
                    <td>{fmtDate(t.leaseEndDate)}</td>
                    <td className="r">{t.monthlyRent ? `$${Number(t.monthlyRent).toLocaleString()}` : '—'}</td>
                    <td className="c">
                      {t.section8 ? <span className="badge badge-purple">Sec 8</span> : '—'}
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
