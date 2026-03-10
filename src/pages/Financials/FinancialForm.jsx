import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { getById, save, remove, getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { Field, Input, Select, Textarea, Section } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const INCOME_CATS  = ['Rent','Late Fee','Pet Fee','Section 8 HAP','Security Deposit Return','Other Income']
const EXPENSE_CATS = ['Mortgage Payment','Property Tax','Insurance','HOA','Maintenance','Repairs','CapEx','Management Fee','Utilities','Lawn/Pest','Supplies','Professional Services','Travel','Other Expense']

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = {
  txType: 'income', date: today(), category: 'Rent',
  propertyId: '', amount: '', description: '', paymentMethod: '', notes: '',
}

export default function FinancialForm() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const [form, setForm]             = useState(EMPTY)
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(!isNew)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    const tasks = [getAll(STORES.PROPERTIES)]
    if (!isNew) tasks.push(getById(STORES.TRANSACTIONS, id))
    Promise.all(tasks).then(([props, txn]) => {
      setProperties(props)
      if (txn) setForm({ ...EMPTY, ...txn })
      setLoading(false)
    })
  }, [id, isNew])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  // Reset category when type changes
  function setType(v) {
    setForm(prev => ({ ...prev, txType: v, category: v==='income' ? 'Rent' : 'Maintenance' }))
  }

  async function handleSave() {
    if (!form.amount || isNaN(parseFloat(form.amount))) { setError('A valid amount is required.'); return }
    if (!form.date) { setError('A date is required.'); return }
    setSaving(true); setError('')
    try {
      const saved = await save(STORES.TRANSACTIONS, isNew ? form : { ...form, id })
      navigate(`/financials/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return
    await remove(STORES.TRANSACTIONS, id)
    navigate('/financials')
  }

  if (loading) return <div className="page-loading">Loading transaction...</div>

  const propOptions = [{ value:'', label:'— No specific property —' }, ...properties.map(p=>({ value:p.id, label:p.nickname||p.address?.street||p.id }))]
  const catOptions  = (form.txType==='income' ? INCOME_CATS : EXPENSE_CATS).map(c=>({ value:c, label:c }))

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/financials')}><ArrowLeft size={16}/> Financials</button>
        <h1 className="form-title">{isNew ? 'Add Transaction' : 'Edit Transaction'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <Section title="Transaction Details">
          <Field label="Type">
            <Select value={form.txType} onChange={setType} options={[
              {value:'income',label:'Income'},{value:'expense',label:'Expense'}
            ]}/>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={v=>set('date',v)}/></Field>
          <Field label="Category"><Select value={form.category} onChange={v=>set('category',v)} options={catOptions}/></Field>
          <Field label="Property"><Select value={form.propertyId} onChange={v=>set('propertyId',v)} options={propOptions}/></Field>
          <Field label="Amount ($)"><Input type="number" value={form.amount} onChange={v=>set('amount',v)} placeholder="1500" step="0.01"/></Field>
          <Field label="Payment Method">
            <Select value={form.paymentMethod} onChange={v=>set('paymentMethod',v)} options={[
              {value:'',label:'— Not specified —'},{value:'ACH',label:'ACH / Bank Transfer'},
              {value:'Check',label:'Check'},{value:'Cash',label:'Cash'},
              {value:'Credit Card',label:'Credit Card'},{value:'Zelle',label:'Zelle'},
              {value:'Venmo',label:'Venmo'},{value:'Other',label:'Other'},
            ]}/>
          </Field>
          <Field label="Description" full><Input value={form.description} onChange={v=>set('description',v)} placeholder="January rent, Water heater repair..."/></Field>
          <Field label="Notes" full>
            <Textarea value={form.notes} onChange={v=>set('notes',v)} placeholder="Additional context, receipt reference, follow-up needed..." rows={3}/>
          </Field>
        </Section>
      </div>
    </div>
  )
}
