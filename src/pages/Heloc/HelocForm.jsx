import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import { getAll, save, remove } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import '../../components/shared/shared.css'

const BLANK = { name:'', type:'HELOC', lender:'', limit:'', balance:'', rate:'', minPayment:'', openDate:'', notes:'' }

export default function HelocForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id || id === 'new'
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!isNew) getAll(STORES.HELOC).then(list => {
      const found = list.find(x => x.id === id)
      if (found) setForm({ ...BLANK, ...found })
    })
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const available = Number(form.limit||0) - Number(form.balance||0)
  const util      = form.limit ? Math.round((Number(form.balance||0) / Number(form.limit)) * 100) : 0
  const monthlyInterest = form.balance && form.rate ? ((Number(form.balance) * Number(form.rate) / 100) / 12).toFixed(2) : null

  const handleSave = async () => {
    if (!form.name?.trim()) return setError('Name is required.')
    setSaving(true); setError('')
    try { await save(STORES.HELOC, { ...form, id: isNew ? undefined : id }); navigate('/heloc') }
    catch { setError('Save failed.') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this credit line?')) return
    await remove(STORES.HELOC, id); navigate('/heloc')
  }

  const F = ({ label, k, type='text', hint }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[k] ?? ''} onChange={e => set(k, e.target.value)}/>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/heloc')}><ChevronLeft size={16}/> Credit Lines</button>
        <h1 className="form-title">{isNew ? 'Add Credit Line' : 'Edit Credit Line'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}><Save size={15}/> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div style={{display:'flex', gap:'1.5rem', alignItems:'flex-start'}}>
        <div className="form-body" style={{flex:1}}>
          <div className="form-section">
            <div className="form-section-title">1 — Account Details</div>
            <div className="form-grid">
              <F label="Account Name / Nickname" k="name"/>
              <div className="form-field">
                <label className="form-label">Line Type</label>
                <select className="form-select form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['HELOC','Personal LOC','Business LOC','Portfolio LOC','Investment LOC','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <F label="Lender / Bank" k="lender"/>
              <F label="Open Date" k="openDate" type="date"/>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">2 — Balances & Rate</div>
            <div className="form-grid">
              <F label="Credit Limit ($)" k="limit" type="number"/>
              <F label="Current Balance ($)" k="balance" type="number" hint="Amount currently drawn"/>
              <F label="Interest Rate (%)" k="rate" type="number" hint="Current rate (variable or fixed)"/>
              <F label="Min Monthly Payment ($)" k="minPayment" type="number"/>
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">3 — Notes</div>
            <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Draw history, intended use, contact info…"/>
          </div>
        </div>

        {/* Live calculator */}
        <div style={{width:'230px', flexShrink:0, position:'sticky', top:'1.5rem'}}>
          <div style={{background:'var(--bg-elevated)', border:'1px solid var(--amber-dim)', borderRadius:'var(--radius)', padding:'1.1rem'}}>
            <div style={{fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--amber)', fontWeight:700, marginBottom:'1rem', fontFamily:'var(--font-display)'}}>Live Summary</div>
            {[['Limit', `$${Number(form.limit||0).toLocaleString()}`],
              ['Balance', `$${Number(form.balance||0).toLocaleString()}`],
              ['Available', `$${available.toLocaleString()}`, available >= 0 ? 'var(--green)' : 'var(--red)'],
              ['Utilization', `${util}%`, util >= 80 ? 'var(--red)' : util >= 50 ? 'var(--yellow)' : 'var(--green)'],
              ...(monthlyInterest ? [['Monthly Interest', `$${monthlyInterest}`]] : [])
            ].map(([lbl, val, clr]) => (
              <div key={lbl} style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem', padding:'0.3rem 0', color:'var(--text-secondary)'}}>
                <span>{lbl}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:'0.8rem', color: clr || 'var(--text-primary)'}}>{val}</span>
              </div>
            ))}
            <div style={{marginTop:'0.75rem'}}>
              <div style={{height:'8px', background:'var(--border)', borderRadius:'4px'}}>
                <div style={{height:'100%', width:`${Math.min(util,100)}%`, borderRadius:'4px',
                  background: util >= 80 ? 'var(--red)' : util >= 50 ? 'var(--yellow)' : 'var(--green)', transition:'width 0.3s'}}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
