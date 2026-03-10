import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { getById, save, remove, getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { Field, Input, Select, Textarea, Section } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const today = () => new Date().toISOString().split('T')[0]
const EMPTY = {
  propertyId: '', status: 'open', priority: 'routine',
  description: '', dateReported: today(), dateResolved: '',
  vendor: '', vendorPhone: '', cost: '', notes: '',
}

export default function MaintenanceForm() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const [form, setForm]             = useState(EMPTY)
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(!isNew)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    const tasks = [getAll(STORES.PROPERTIES)]
    if (!isNew) tasks.push(getById(STORES.MAINTENANCE, id))
    Promise.all(tasks).then(([props, item]) => {
      setProperties(props)
      if (item) setForm({ ...EMPTY, ...item })
      setLoading(false)
    })
  }, [id, isNew])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    if (!form.description) { setError('A description is required.'); return }
    setSaving(true); setError('')
    try {
      const saved = await save(STORES.MAINTENANCE, isNew ? form : { ...form, id })
      navigate(`/maintenance/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this work order? This cannot be undone.')) return
    await remove(STORES.MAINTENANCE, id)
    navigate('/maintenance')
  }

  if (loading) return <div className="page-loading">Loading work order...</div>

  const propOptions = [{ value:'', label:'— Select property —' }, ...properties.map(p=>({ value:p.id, label:p.nickname||p.address?.street||p.id }))]

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/maintenance')}><ArrowLeft size={16}/> Maintenance</button>
        <h1 className="form-title">{isNew ? 'Add Work Order' : 'Edit Work Order'}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <Section title="1 — Issue Details">
          <Field label="Property"><Select value={form.propertyId} onChange={v=>set('propertyId',v)} options={propOptions}/></Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={v=>set('priority',v)} options={[
              {value:'emergency',label:'🔴 Emergency'},{value:'urgent',label:'🟠 Urgent'},{value:'routine',label:'🔵 Routine'},
            ]}/>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v=>set('status',v)} options={[
              {value:'open',label:'Open'},{value:'in-progress',label:'In Progress'},{value:'closed',label:'Closed'},
            ]}/>
          </Field>
          <Field label="Date Reported"><Input type="date" value={form.dateReported} onChange={v=>set('dateReported',v)}/></Field>
          <Field label="Date Resolved"><Input type="date" value={form.dateResolved} onChange={v=>set('dateResolved',v)}/></Field>
          <Field label="Description" full>
            <Textarea value={form.description} onChange={v=>set('description',v)} placeholder="Describe the issue in detail..." rows={3}/>
          </Field>
        </Section>

        <Section title="2 — Vendor & Cost">
          <Field label="Vendor / Contractor"><Input value={form.vendor} onChange={v=>set('vendor',v)} placeholder="Joe's Plumbing"/></Field>
          <Field label="Vendor Phone"><Input value={form.vendorPhone} onChange={v=>set('vendorPhone',v)} placeholder="(555) 000-0000"/></Field>
          <Field label="Actual Cost ($)"><Input type="number" value={form.cost} onChange={v=>set('cost',v)} placeholder="250" step="0.01"/></Field>
        </Section>

        <Section title="3 — Notes">
          <Field label="Internal Notes" full>
            <Textarea value={form.notes} onChange={v=>set('notes',v)} placeholder="Photos taken, warranty claim, follow-up needed..." rows={3}/>
          </Field>
        </Section>
      </div>
    </div>
  )
}
