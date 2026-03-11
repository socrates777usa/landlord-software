import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import '../../components/shared/shared.css'

const BLANK = {
  nickname:'', address:'', stage:'identified',
  purchasePrice:'', rehabBudget:'', rehabActual:'', arv:'',
  targetRent:'', projectedDscr:'',
  offerDate:'', contractDate:'', closingDate:'', rehabCompleteDate:'', rentedDate:'', refiDate:'',
  notes:''
}

function genId() { return 'br_' + Date.now() }

export default function BrrrrForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isNew    = !id || id === 'new'
  const [form, setForm]     = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!isNew) {
      const stored = JSON.parse(localStorage.getItem('acme_brrrr') || '[]')
      const found  = stored.find(x => x.id === id)
      if (found) setForm({ ...BLANK, ...found })
    }
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nickname?.trim() && !form.address?.trim()) return setError('Nickname or address required.')
    setSaving(true); setError('')
    try {
      const stored = JSON.parse(localStorage.getItem('acme_brrrr') || '[]')
      const record = { ...form, id: isNew ? genId() : id }
      const idx = stored.findIndex(x => x.id === id)
      if (isNew) stored.push(record)
      else if (idx >= 0) stored[idx] = record
      localStorage.setItem('acme_brrrr', JSON.stringify(stored))
      navigate('/brrrr')
    } catch { setError('Save failed.') } finally { setSaving(false) }
  }

  const handleDelete = () => {
    if (!confirm('Delete this deal?')) return
    const stored = JSON.parse(localStorage.getItem('acme_brrrr') || '[]')
    localStorage.setItem('acme_brrrr', JSON.stringify(stored.filter(x => x.id !== id)))
    navigate('/brrrr')
  }

  const F = ({ label, k, type='text', hint }) => (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} value={form[k] ?? ''} onChange={e => set(k, e.target.value)}/>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )

  const allIn     = Number(form.purchasePrice||0) + Number(form.rehabBudget||0)
  const spread    = Number(form.arv||0) - allIn
  const spreadPct = form.arv && allIn ? ((spread / Number(form.arv)) * 100).toFixed(1) : null
  const refiAmt75 = form.arv ? (Number(form.arv) * 0.75).toFixed(0) : null
  const cashOut   = refiAmt75 ? (Number(refiAmt75) - allIn).toFixed(0) : null

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/brrrr')}><ChevronLeft size={16}/> Pipeline</button>
        <h1 className="form-title">{isNew ? 'Add Deal' : 'Edit Deal'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}><Save size={15}/> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div style={{display:'flex', gap:'1.5rem', alignItems:'flex-start'}}>
        <div className="form-body" style={{flex:1}}>
          <div className="form-section">
            <div className="form-section-title">1 — Deal Identification</div>
            <div className="form-grid">
              <F label="Nickname / Label" k="nickname"/>
              <F label="Address" k="address"/>
              <div className="form-field">
                <label className="form-label">Stage</label>
                <select className="form-select form-input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                  <option value="identified">Identified</option>
                  <option value="offered">Offered</option>
                  <option value="under_contract">Under Contract</option>
                  <option value="rehab">Rehab</option>
                  <option value="rented">Rented</option>
                  <option value="refinanced">Refinanced ✓</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">2 — Deal Numbers</div>
            <div className="form-grid">
              <F label="Purchase Price ($)" k="purchasePrice" type="number"/>
              <F label="Rehab Budget ($)" k="rehabBudget" type="number"/>
              <F label="Rehab Actual ($)" k="rehabActual" type="number" hint="Update as work progresses"/>
              <F label="ARV ($)" k="arv" type="number" hint="After Repair Value"/>
              <F label="Target Monthly Rent ($)" k="targetRent" type="number"/>
              <F label="Projected DSCR (post-refi)" k="projectedDscr" type="number" hint="e.g. 1.25"/>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">3 — Key Dates</div>
            <div className="form-grid">
              <F label="Offer Date" k="offerDate" type="date"/>
              <F label="Contract Date" k="contractDate" type="date"/>
              <F label="Closing Date" k="closingDate" type="date"/>
              <F label="Rehab Complete" k="rehabCompleteDate" type="date"/>
              <F label="Rented Date" k="rentedDate" type="date"/>
              <F label="Refi Date" k="refiDate" type="date"/>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">4 — Notes</div>
            <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Seller info, agent, inspection findings, lender, exit strategy…"/>
          </div>
        </div>

        {/* BRRRR Calculator Sidebar */}
        <div style={{width:'240px', flexShrink:0, position:'sticky', top:'1.5rem'}}>
          <div style={{background:'var(--bg-elevated)', border:'1px solid var(--amber-dim)', borderRadius:'var(--radius)', padding:'1.1rem'}}>
            <div style={{fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--amber)', fontWeight:700, marginBottom:'1rem', fontFamily:'var(--font-display)'}}>BRRRR Calculator</div>
            {[
              ['Purchase', `$${Number(form.purchasePrice||0).toLocaleString()}`],
              ['Rehab Budget', `$${Number(form.rehabBudget||0).toLocaleString()}`],
              ['All-In Cost', `$${allIn.toLocaleString()}`, 'bold'],
              ['ARV', `$${Number(form.arv||0).toLocaleString()}`],
              ['Equity Spread', spread >= 0 ? `$${spread.toLocaleString()}` : `–$${Math.abs(spread).toLocaleString()}`, 'bold', spread >= 0 ? 'var(--green)' : 'var(--red)'],
              ...(spreadPct ? [['ARV Margin', `${spreadPct}%`, null, Number(spreadPct)>=25 ? 'var(--green)' : 'var(--yellow)']] : []),
              ...(refiAmt75 ? [['75% LTV Refi', `$${Number(refiAmt75).toLocaleString()}`]] : []),
              ...(cashOut ? [['Est. Cash Out', `$${Number(cashOut).toLocaleString()}`, 'bold', Number(cashOut)>0 ? 'var(--green)' : 'var(--red)']] : []),
            ].map(([lbl, val, bold, clr]) => (
              <div key={lbl} style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem', padding:'0.3rem 0', borderBottom:'1px solid var(--border)', color: bold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: bold ? 700 : 400}}>
                <span>{lbl}</span>
                <span style={{fontFamily:'var(--font-mono)', fontSize:'0.8rem', color: clr || (bold ? 'var(--text-primary)' : 'var(--text-secondary)')}}>{val}</span>
              </div>
            ))}
            <div style={{marginTop:'0.75rem', fontSize:'0.7rem', color:'var(--text-muted)', lineHeight:1.5}}>
              Rule of thumb: equity spread ≥ 25% ARV means you &quot;buy right&quot; for BRRRR to work.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
