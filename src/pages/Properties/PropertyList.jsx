import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Home, TrendingUp, TrendingDown, Circle } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { calcProperty } from '../../core/calculations/property.js'
import './Properties.css'

function fmt$(n) {
  if (n == null) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(2)}M`
  if (abs >= 1000)    return `${sign}$${(abs/1000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}
function fmtPct(n) { return n == null ? '—' : `${n.toFixed(1)}%` }

const STATUS_LABEL = {
  active: 'Occupied', vacant: 'Vacant',
  renovation: 'Renovation', forsale: 'For Sale'
}
const STATUS_CLASS = {
  active: 'status-active', vacant: 'status-vacant',
  renovation: 'status-reno', forsale: 'status-sale'
}

export default function PropertyList() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAll(STORES.PROPERTIES).then(props => {
      setProperties(props)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="prop-loading">Loading properties...</div>

  return (
    <div className="prop-list-page">
      <div className="prop-list-header">
        <div>
          <h1 className="prop-list-title">Properties</h1>
          <p className="prop-list-sub">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} in portfolio</p>
        </div>
        <button className="btn-add-prop" onClick={() => navigate('/properties/new')}>
          <Plus size={16} /> Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="prop-empty">
          <Home size={48} className="prop-empty-icon" />
          <h3>No properties yet</h3>
          <p>Add your first property to get started.</p>
          <button className="btn-add-prop" onClick={() => navigate('/properties/new')}>
            <Plus size={16} /> Add First Property
          </button>
        </div>
      ) : (
        <div className="prop-table-wrap">
          <table className="prop-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>Type</th>
                <th>Status</th>
                <th className="num">Rent/Mo</th>
                <th className="num">Cash Flow</th>
                <th className="num">DSCR</th>
                <th className="num">Equity</th>
                <th className="num">Cap Rate</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => {
                const c = calcProperty(p)
                const cfPos = c.cashFlowMonthly >= 0
                return (
                  <tr key={p.id} onClick={() => navigate(`/properties/${p.id}`)} className="prop-row">
                    <td>
                      <div className="prop-addr">{p.address?.street || '—'}</div>
                      <div className="prop-city">{p.address?.city}{p.address?.state ? `, ${p.address.state}` : ''}</div>
                    </td>
                    <td>{p.propertyType || '—'}</td>
                    <td><span className={`status-badge ${STATUS_CLASS[p.status] || ''}`}>{STATUS_LABEL[p.status] || p.status || '—'}</span></td>
                    <td className="num">{fmt$(p.income?.monthlyRent)}</td>
                    <td className={`num ${cfPos ? 'pos' : 'neg'}`}>
                      {cfPos ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {fmt$(c.cashFlowMonthly)}
                    </td>
                    <td className={`num ${c.dscr >= 1.25 ? 'pos' : c.dscr >= 1 ? 'warn' : 'neg'}`}>{c.dscr ?? '—'}</td>
                    <td className="num">{fmt$(c.equity)}</td>
                    <td className="num">{fmtPct(c.capRate)}</td>
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
