import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Wrench } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate, fmt$ } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const PRIORITY_BADGE = { emergency:'badge-red', urgent:'badge-orange', routine:'badge-blue' }
const STATUS_BADGE   = { open:'badge-orange', 'in-progress':'badge-blue', closed:'badge-gray' }

export default function MaintenanceList() {
  const [items, setItems]           = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.MAINTENANCE), getAll(STORES.PROPERTIES)])
      .then(([m, p]) => { setItems([...m].sort((a,b)=>b.dateReported?.localeCompare(a.dateReported||'')||0)); setProperties(p); setLoading(false) })
  }, [])

  if (loading) return <div className="page-loading">Loading maintenance...</div>

  const propMap = Object.fromEntries(properties.map(p => [p.id, p]))
  const openCount = items.filter(i=>i.status!=='closed').length

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Maintenance</h1>
          <p className="list-sub">{items.length} work order{items.length!==1?'s':''} &nbsp;|&nbsp; {openCount} open</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/maintenance/new')}><Plus size={16}/> Add Work Order</button>
      </div>

      {items.length === 0 ? (
        <div className="list-empty">
          <Wrench size={48} className="list-empty-icon"/>
          <h3>No work orders yet</h3>
          <p>Log maintenance issues to track costs and resolution.</p>
          <button className="btn-add" onClick={() => navigate('/maintenance/new')}><Plus size={16}/> Add Work Order</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Issue</th>
                <th>Reported</th>
                <th>Resolved</th>
                <th className="r">Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => {
                const prop = propMap[m.propertyId]
                return (
                  <tr key={m.id} className="list-row" onClick={() => navigate(`/maintenance/${m.id}`)}>
                    <td><div className="cell-main">{prop?.nickname||prop?.address?.street||'—'}</div></td>
                    <td><span className={`badge ${PRIORITY_BADGE[m.priority]||'badge-gray'}`}>{m.priority||'—'}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[m.status]||'badge-gray'}`}>{m.status||'—'}</span></td>
                    <td><div className="cell-main">{m.description?.substring(0,60)||'—'}{m.description?.length>60?'...':''}</div>
                        {m.vendor && <div className="cell-sub">{m.vendor}</div>}</td>
                    <td>{fmtDate(m.dateReported)}</td>
                    <td>{fmtDate(m.dateResolved)}</td>
                    <td className="r">{m.cost ? fmt$(parseFloat(m.cost)) : '—'}</td>
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
