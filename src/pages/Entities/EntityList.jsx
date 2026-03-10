import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { fmtDate } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

export default function EntityList() {
  const [entities, setEntities]     = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAll(STORES.ENTITIES), getAll(STORES.PROPERTIES)])
      .then(([e, p]) => { setEntities(e); setProperties(p); setLoading(false) })
  }, [])

  if (loading) return <div className="page-loading">Loading entities...</div>

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Entities (LLCs)</h1>
          <p className="list-sub">{entities.length} entit{entities.length!==1?'ies':'y'} on record</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/entities/new')}><Plus size={16}/> Add Entity</button>
      </div>

      {entities.length === 0 ? (
        <div className="list-empty">
          <Building2 size={48} className="list-empty-icon"/>
          <h3>No entities yet</h3>
          <p>Add your LLC or Series LLC to track structure and compliance.</p>
          <button className="btn-add" onClick={() => navigate('/entities/new')}><Plus size={16}/> Add Entity</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Type</th>
                <th>State</th>
                <th>EIN</th>
                <th>Formed</th>
                <th className="r">Properties</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entities.map(e => {
                const propCount = properties.filter(p => p.llcSeries === e.name || p.entityId === e.id).length
                return (
                  <tr key={e.id} className="list-row" onClick={() => navigate(`/entities/${e.id}`)}>
                    <td>
                      <div className="cell-main">{e.name}</div>
                      {e.seriesLabel && <div className="cell-sub">Series: {e.seriesLabel}</div>}
                    </td>
                    <td>{e.entityType || '—'}</td>
                    <td>{e.state || 'TX'}</td>
                    <td>{e.ein || '—'}</td>
                    <td>{fmtDate(e.formationDate)}</td>
                    <td className="r">{propCount || 0}</td>
                    <td><span className={`badge ${e.status==='active'?'badge-green':'badge-gray'}`}>{e.status==='active'?'Active':'Inactive'}</span></td>
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
