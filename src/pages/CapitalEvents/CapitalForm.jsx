import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import { getAll, save, remove } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const TODAY = new Date().toISOString().split('T')[0]
const BLANK = { eventType:'HELOC Draw', propertyId:'', amount:'', date:TODAY, fromAccount:'', toAccount:'', description:'', notes:'' }

export default function CapitalForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id || id === 'new'
  const [form, setForm]      = useState(BLANK)
  const [properties, setProps] = useState([])
  const [saving, setSaving]  = useState(false)
  const [error, setError]    = useState('')

  useEffect(() => {
    getAll(STORES.PROPERTIES).then(setProps)
    if (!isNew) getAll(STORES.CAPITAL_EVENTS).then(list => {
      const found = list.find(x => x.id === id)
      if (found) setForm({ ...BLANK, ...found })
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) return setError('Amount is required.')
    setSaving(true); setError('')
    try { await save(STORES.CAPITAL_EVENTS, { ...form, id: isNew ? undefined : id }); navigate('/capital') }
    catch { setError('Save failed.') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this capital event?')) return
    await remove(STORES.CAPITAL_EVENTS, id); navigate('/capital')
  }

  const F = ({ label, k, type='text', hint }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[k] ?? ''} onChange={e => set(k, e.target.value)}/>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )

  const COMMON_FROM = ['HELOC','Business LOC','Personal LOC','Portfolio LOC','Cash Reserves','401k Loan']
  const COMMON_TO   = ['HELOC','Checking Account','Property Purchase','Rehab Fund','Closing Costs','Loan Payoff']

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/capital')}><ChevronLeft size={16}/> Capital Events</button>
        <h1 className="form-title">{isNew ? 'Log Capital Event' : 'Edit Capital Event'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}><Save size={15}/> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <div className="form-section">
          <div className="form-section-title">1 — Event Details</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Event Type</label>
              <select className="form-select form-input" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                {['HELOC Draw','DSCR Refi','Loan Payoff','Capital Contribution','Distribution','Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Property (if applicable)</label>
              <select className="form-select form-input" value={form.propertyId} onChange={e => set('propertyId', e.target.value)}>
                <option value="">— Portfolio-wide / N/A —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.nickname || p.address?.street || p.id}</option>)}
              </select>
            </div>
            <F label="Amount ($)" k="amount" type="number"/>
            <F label="Date" k="date" type="date"/>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">2 — Capital Flow</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">From Account</label>
              <input className="form-input" list="from-opts" value={form.fromAccount} onChange={e => set('fromAccount', e.target.value)} placeholder="HELOC, Reserves…"/>
              <datalist id="from-opts">{COMMON_FROM.map(o => <option key={o} value={o}/>)}</datalist>
            </div>
            <div className="form-field">
              <label className="form-label">To Account / Use</label>
              <input className="form-input" list="to-opts" value={form.toAccount} onChange={e => set('toAccount', e.target.value)} placeholder="Property Purchase, Checking…"/>
              <datalist id="to-opts">{COMMON_TO.map(o => <option key={o} value={o}/>)}</datalist>
            </div>
            <div className="form-field form-full">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. HELOC draw for 142 Greenwood Dr acquisition"/>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">3 — Notes</div>
          <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Lender, terms, capital recycling status…"/>
        </div>
      </div>
    </div>
  )
}
