import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import { getAll, save, remove } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const BLANK = { name:'', trade:'', phone:'', email:'', license:'', rating:0, lastUsedDate:'', notes:'' }

export default function VendorForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id || id === 'new'
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!isNew) getAll(STORES.VENDORS).then(list => {
      const found = list.find(x => x.id === id)
      if (found) setForm({ ...BLANK, ...found })
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name?.trim()) return setError('Vendor name is required.')
    setSaving(true); setError('')
    try { await save(STORES.VENDORS, { ...form, id: isNew ? undefined : id }); navigate('/vendors') }
    catch { setError('Save failed.') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this vendor?')) return
    await remove(STORES.VENDORS, id); navigate('/vendors')
  }

  const F = ({ label, k, type='text' }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[k] ?? ''} onChange={e => set(k, e.target.value)}/>
    </div>
  )

  const TRADES = ['HVAC','Plumbing','Electrical','Roofing','Painting','Flooring','General Contractor','Landscaping','Pest Control','Appliance Repair','Locksmith','Inspection','Cleaning','Other']

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/vendors')}><ChevronLeft size={16}/> Vendors</button>
        <h1 className="form-title">{isNew ? 'Add Vendor' : 'Edit Vendor'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}><Save size={15}/> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <div className="form-section">
          <div className="form-section-title">1 — Vendor Info</div>
          <div className="form-grid">
            <F label="Company / Name" k="name"/>
            <div className="form-field">
              <label className="form-label">Trade / Specialty</label>
              <select className="form-select form-input" value={form.trade} onChange={e => set('trade', e.target.value)}>
                <option value="">— Select trade —</option>
                {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <F label="Phone" k="phone" type="tel"/>
            <F label="Email" k="email" type="email"/>
            <F label="License Number" k="license"/>
            <F label="Last Used Date" k="lastUsedDate" type="date"/>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">2 — Rating</div>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.25rem 0'}}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => set('rating', n)}
                style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.6rem',
                  color: n <= (form.rating||0) ? 'var(--amber)' : 'var(--border-bright)'}}>★</button>
            ))}
            <span style={{color:'var(--text-secondary)', fontSize:'0.8rem', marginLeft:'0.5rem'}}>
              {form.rating ? `${form.rating}/5` : 'Not rated'}
            </span>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">3 — Notes</div>
          <textarea className="form-textarea" rows={4} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Past job notes, pricing, availability, reliability…"/>
        </div>
      </div>
    </div>
  )
}
