import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { getById, save, remove, getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { Field, Input, Select, Textarea, Section } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const EMPTY = {
  propertyId: '', tenantId: '', type: 'standard', status: 'active',
  startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', petDeposit: '',
  lateFeeAmount: '', lateFeeGraceDays: '5', rentDueDay: '1', notes: '',
}

export default function LeaseForm() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const [form, setForm]             = useState(EMPTY)
  const [properties, setProperties] = useState([])
  const [tenants, setTenants]       = useState([])
  const [loading, setLoading]       = useState(!isNew)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    const tasks = [getAll(STORES.PROPERTIES), getAll(STORES.TENANTS)]
    if (!isNew) tasks.push(getById(STORES.LEASES, id))
    Promise.all(tasks).then(([props, ten, lease]) => {
      setProperties(props); setTenants(ten)
      if (lease) setForm({ ...EMPTY, ...lease })
      setLoading(false)
    })
  }, [id, isNew])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    if (!form.propertyId) { setError('A property is required.'); return }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required.'); return }
    setSaving(true); setError('')
    try {
      const saved = await save(STORES.LEASES, isNew ? form : { ...form, id })
      navigate(`/leases/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this lease? This cannot be undone.')) return
    await remove(STORES.LEASES, id)
    navigate('/leases')
  }

  if (loading) return <div className="page-loading">Loading lease...</div>

  const propOptions   = [{ value:'', label:'— Select property —' },  ...properties.map(p=>({ value:p.id, label:p.nickname||p.address?.street||p.id }))]
  const tenantOptions = [{ value:'', label:'— Select tenant —' },    ...tenants.map(t=>({ value:t.id, label:`${t.firstName} ${t.lastName}` }))]

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/leases')}><ArrowLeft size={16}/> Leases</button>
        <h1 className="form-title">{isNew ? 'Add Lease' : 'Edit Lease'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <Section title="1 — Lease Parties">
          <Field label="Property"><Select value={form.propertyId} onChange={v=>set('propertyId',v)} options={propOptions}/></Field>
          <Field label="Tenant"><Select value={form.tenantId} onChange={v=>set('tenantId',v)} options={tenantOptions}/></Field>
          <Field label="Lease Type">
            <Select value={form.type} onChange={v=>set('type',v)} options={[
              {value:'standard',label:'Standard'},{value:'section8',label:'Section 8 / HUD'},
              {value:'month-to-month',label:'Month-to-Month'},
            ]}/>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v=>set('status',v)} options={[
              {value:'active',label:'Active'},{value:'expired',label:'Expired'},{value:'terminated',label:'Terminated'},
            ]}/>
          </Field>
        </Section>

        <Section title="2 — Dates">
          <Field label="Lease Start Date"><Input type="date" value={form.startDate} onChange={v=>set('startDate',v)}/></Field>
          <Field label="Lease End Date"><Input type="date" value={form.endDate} onChange={v=>set('endDate',v)}/></Field>
          <Field label="Rent Due Day of Month" hint="e.g. 1 = 1st"><Input type="number" value={form.rentDueDay} onChange={v=>set('rentDueDay',v)} min="1" max="28"/></Field>
        </Section>

        <Section title="3 — Financial Terms">
          <Field label="Monthly Rent"><Input type="number" value={form.monthlyRent} onChange={v=>set('monthlyRent',v)} placeholder="1500"/></Field>
          <Field label="Security Deposit"><Input type="number" value={form.securityDeposit} onChange={v=>set('securityDeposit',v)} placeholder="1500"/></Field>
          <Field label="Pet Deposit"><Input type="number" value={form.petDeposit} onChange={v=>set('petDeposit',v)} placeholder="0"/></Field>
          <Field label="Late Fee Amount"><Input type="number" value={form.lateFeeAmount} onChange={v=>set('lateFeeAmount',v)} placeholder="50"/></Field>
          <Field label="Late Fee Grace Period (days)"><Input type="number" value={form.lateFeeGraceDays} onChange={v=>set('lateFeeGraceDays',v)} placeholder="5"/></Field>
        </Section>

        <Section title="4 — Notes">
          <Field label="Lease Notes" full>
            <Textarea value={form.notes} onChange={v=>set('notes',v)} placeholder="Special terms, addendums, renewal conditions..." rows={4}/>
          </Field>
        </Section>
      </div>
    </div>
  )
}
