import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import { getAll, save, remove } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const BLANK = {
  propertyId:'', policyType:'landlord', insurer:'', policyNumber:'',
  dwelling:'', liability:'', lossOfRent:'', deductible:'', annualPremium:'',
  effectiveDate:'', expirationDate:'', notes:''
}

export default function InsuranceForm() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isNew     = !id || id === 'new'
  const [form, setForm]       = useState(BLANK)
  const [properties, setProps] = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    getAll(STORES.PROPERTIES).then(setProps)
    if (!isNew) getAll(STORES.INSURANCE).then(list => {
      const found = list.find(x => x.id === id)
      if (found) setForm({ ...BLANK, ...found })
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.policyType) return setError('Policy type is required.')
    setSaving(true); setError('')
    try {
      await save(STORES.INSURANCE, { ...form, id: isNew ? undefined : id })
      navigate('/insurance')
    } catch { setError('Save failed.') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this policy?')) return
    await remove(STORES.INSURANCE, id); navigate('/insurance')
  }

  const F = ({ label, k, type = 'text', hint }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[k] ?? ''} onChange={e => set(k, e.target.value)}/>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/insurance')}><ChevronLeft size={16}/> Insurance</button>
        <h1 className="form-title">{isNew ? 'Add Policy' : 'Edit Policy'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}><Save size={15}/> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <div className="form-section">
          <div className="form-section-title">1 — Policy Details</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Policy Type</label>
              <select className="form-select form-input" value={form.policyType} onChange={e => set('policyType', e.target.value)}>
                <option value="landlord">Landlord / Dwelling</option>
                <option value="umbrella">Umbrella</option>
                <option value="liability">Liability Only</option>
                <option value="flood">Flood</option>
                <option value="other">Other</option>
              </select>
            </div>
            {form.policyType !== 'umbrella' && (
              <div className="form-field">
                <label className="form-label">Property</label>
                <select className="form-select form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)}>
                  <option value="">— Select property —</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.nickname || p.address?.street || p.id}</option>)}
                </select>
              </div>
            )}
            <F label="Insurer / Company" k="insurer"/>
            <F label="Policy Number" k="policyNumber"/>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">2 — Coverage & Costs</div>
          <div className="form-grid">
            <F label="Dwelling Coverage ($)" k="dwelling" type="number"/>
            <F label="Liability Coverage ($)" k="liability" type="number"/>
            <F label="Loss of Rent Coverage ($)" k="lossOfRent" type="number"/>
            <F label="Deductible ($)" k="deductible" type="number"/>
            <F label="Annual Premium ($)" k="annualPremium" type="number"/>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">3 — Dates</div>
          <div className="form-grid">
            <F label="Effective Date" k="effectiveDate" type="date"/>
            <F label="Expiration Date" k="expirationDate" type="date"/>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">4 — Notes</div>
          <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Agent info, claim history, coverage notes…"/>
        </div>
      </div>
    </div>
  )
}
