import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Hammer } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const STARS = n => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function VendorList() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { getAll(STORES.VENDORS).then(v => { setVendors(v); setLoading(false) }) }, [])

  if (loading) return <div className="page-loading">Loading vendors...</div>

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1 className="list-title">Vendors & Contractors</h1>
          <p className="list-sub">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} on record</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/vendors/new')}><Plus size={16}/> Add Vendor</button>
      </div>

      {vendors.length === 0 ? (
        <div className="list-empty">
          <Hammer size={48} className="list-empty-icon"/>
          <h3>No vendors yet</h3>
          <p>Build your contractor directory for maintenance, repairs, and inspections.</p>
          <button className="btn-add" onClick={() => navigate('/vendors/new')}><Plus size={16}/> Add Vendor</button>
        </div>
      ) : (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead><tr>
              <th>Name</th><th>Trade / Specialty</th><th>Phone</th><th>Email</th><th>License #</th><th>Rating</th><th>Last Used</th>
            </tr></thead>
            <tbody>
              {vendors.sort((a,b) => (b.rating||0) - (a.rating||0)).map(v => (
                <tr key={v.id} className="list-row" onClick={() => navigate(`/vendors/${v.id}`)}>
                  <td><div className="cell-main">{v.name}</div></td>
                  <td><span className="badge badge-blue">{v.trade || 'General'}</span></td>
                  <td>{v.phone || '—'}</td>
                  <td>{v.email || '—'}</td>
                  <td>{v.license || '—'}</td>
                  <td style={{color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:'0.8rem'}}>{v.rating ? STARS(v.rating) : '—'}</td>
                  <td>{v.lastUsedDate || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
