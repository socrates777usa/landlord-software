import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Shield } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

export default function InsuranceList() {
  const [policies, setPolicies]     = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.INSURANCE), getAll(STORES.PROPERTIES)]).then(([ins, props]) => {
      setPolicies(ins); setProperties(props); setLoading(false)
    })
  }, [])

  if (loading) return <div className="page-loading">Loading policies...</div>

  const propMap  = Object.fromEntries(properties.map(p => [p.id, p]))
  const today    = new Date()
  const in60days = new Date(today); in60days.setDate(in60days.getDate() + 60)

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Insurance</h1>
          <p className="list-sub">{policies.length} polic{policies.length !== 1 ? 'ies' : 'y'} on record</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/insurance/new')}><Plus size={16}/> Add Policy</button>
      </div>

      {policies.length === 0 ? (
        <div className="list-empty">
          <Shield size={48} className="list-empty-icon"/>
          <h3>No policies yet</h3>
          <p>Track landlord, umbrella, and dwelling policies here.</p>
          <button className="btn-add" onClick={() => navigate('/insurance/new')}><Plus size={16}/> Add Policy</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead><tr>
              <th>Property / Scope</th><th>Type</th><th>Insurer</th>
              <th className="r">Premium/Yr</th><th className="r">Coverage</th>
              <th className="r">Deductible</th><th>Expires</th><th>Status</th>
            </tr></thead>
            <tbody>
              {policies.map(p => {
                const prop  = propMap[p.propertyId]
                const label = p.policyType === 'umbrella' ? 'Portfolio-Wide' : (prop ? (prop.nickname || prop.address?.street) : '—')
                const exp   = p.expirationDate ? new Date(p.expirationDate) : null
                const expiring = exp && exp <= in60days && exp >= today
                const expired  = exp && exp < today
                return (
                  <tr key={p.id} className="list-row" onClick={() => navigate(`/insurance/${p.id}`)}>
                    <td><div className="cell-main">{label}</div><div className="cell-sub">{p.policyNumber || ''}</div></td>
                    <td><span className={`badge ${p.policyType === 'umbrella' ? 'badge-purple' : 'badge-blue'}`}>{p.policyType}</span></td>
                    <td>{p.insurer || '—'}</td>
                    <td className="r">{p.annualPremium ? `$${Number(p.annualPremium).toLocaleString()}` : '—'}</td>
                    <td className="r">{p.dwelling ? `$${(Number(p.dwelling)/1000).toFixed(0)}K` : '—'}</td>
                    <td className="r">{p.deductible ? `$${Number(p.deductible).toLocaleString()}` : '—'}</td>
                    <td className={expired ? 'clr-neg' : expiring ? 'clr-warn' : ''}>{fmtDate(p.expirationDate)}</td>
                    <td><span className={`badge ${expired ? 'badge-red' : expiring ? 'badge-orange' : 'badge-green'}`}>{expired ? 'Expired' : expiring ? 'Expiring' : 'Active'}</span></td>
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
