import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { getById, save, remove, getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { Field, Input, Select, Textarea, Section } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const EMPTY = {
  name: '', entityType: 'Series LLC', state: 'TX', ein: '',
  formationDate: '', registeredAgent: '', status: 'active',
  seriesLabel: '', parentEntityId: '',
  bankAccount: '', bankName: '', seriesCount: '',
  boiFiled: false, boiFiledDate: '', franchiseTaxReminder: '',
  notes: '',
}

export default function EntityForm() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const [form, setForm]       = useState(EMPTY)
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    const tasks = [getAll(STORES.ENTITIES)]
    if (!isNew) tasks.push(getById(STORES.ENTITIES, id))
    Promise.all(tasks).then(([allEntities, entity]) => {
      setEntities(allEntities)
      if (entity) setForm({ ...EMPTY, ...entity })
      setLoading(false)
    })
  }, [id, isNew])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    if (!form.name) { setError('Entity name is required.'); return }
    setSaving(true); setError('')
    try {
      const saved = await save(STORES.ENTITIES, isNew ? form : { ...form, id })
      navigate(`/entities/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${form.name}? This cannot be undone.`)) return
    await remove(STORES.ENTITIES, id)
    navigate('/entities')
  }

  if (loading) return <div className="page-loading">Loading entity...</div>

  const parentOptions = [
    { value:'', label:'— None (this is a parent/standalone) —' },
    ...entities.filter(e => e.id !== id).map(e => ({ value: e.id, label: e.name }))
  ]

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/entities')}><ArrowLeft size={16}/> Entities</button>
        <h1 className="form-title">{isNew ? 'Add Entity' : (form.name || 'Edit Entity')}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <Section title="1 — Entity Information">
          <Field label="Entity Name"><Input value={form.name} onChange={v=>set('name',v)} placeholder="Caddo Mills Rentals LLC"/></Field>
          <Field label="Entity Type">
            <Select value={form.entityType} onChange={v=>set('entityType',v)} options={[
              {value:'Series LLC',label:'Series LLC (Parent)'},{value:'Series',label:'Series (Child of Series LLC)'},
              {value:'Traditional LLC',label:'Traditional LLC'},{value:'Trust',label:'Trust'},{value:'Other',label:'Other'},
            ]}/>
          </Field>
          <Field label="State of Formation">
            <Select value={form.state} onChange={v=>set('state',v)} options={[
              {value:'TX',label:'Texas'},{value:'WY',label:'Wyoming'},{value:'DE',label:'Delaware'},{value:'Other',label:'Other'},
            ]}/>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v=>set('status',v)} options={[
              {value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'dissolved',label:'Dissolved'},
            ]}/>
          </Field>
          <Field label="EIN" hint="XX-XXXXXXX"><Input value={form.ein} onChange={v=>set('ein',v)} placeholder="12-3456789"/></Field>
          <Field label="Formation Date"><Input type="date" value={form.formationDate} onChange={v=>set('formationDate',v)}/></Field>
          <Field label="Registered Agent"><Input value={form.registeredAgent} onChange={v=>set('registeredAgent',v)} placeholder="Northwest Registered Agent"/></Field>
          <Field label="Parent Entity (if Series)">
            <Select value={form.parentEntityId} onChange={v=>set('parentEntityId',v)} options={parentOptions}/>
          </Field>
          <Field label="Series Label" hint="e.g. Series A, Series B"><Input value={form.seriesLabel} onChange={v=>set('seriesLabel',v)} placeholder="Series A"/></Field>
          <Field label="Number of Series" hint="if parent"><Input type="number" value={form.seriesCount} onChange={v=>set('seriesCount',v)} placeholder="0"/></Field>
        </Section>

        <Section title="2 — Banking">
          <Field label="Bank Name"><Input value={form.bankName} onChange={v=>set('bankName',v)} placeholder="First National Bank"/></Field>
          <Field label="Account Description" hint="last 4 digits ok"><Input value={form.bankAccount} onChange={v=>set('bankAccount',v)} placeholder="Business Checking ...4421"/></Field>
        </Section>

        <Section title="3 — Compliance">
          <Field label="BOI Report Filed" full>
            <label className="form-check">
              <input type="checkbox" checked={!!form.boiFiled} onChange={e=>set('boiFiled',e.target.checked)}/>
              Beneficial Ownership Information (BOI) report filed with FinCEN
            </label>
          </Field>
          <Field label="BOI Filed Date"><Input type="date" value={form.boiFiledDate} onChange={v=>set('boiFiledDate',v)}/></Field>
          <Field label="Franchise Tax Reminder" hint="Texas due May 15">
            <Input type="date" value={form.franchiseTaxReminder} onChange={v=>set('franchiseTaxReminder',v)}/>
          </Field>
        </Section>

        <Section title="4 — Notes">
          <Field label="Notes" full>
            <Textarea value={form.notes} onChange={v=>set('notes',v)} placeholder="Attorney info, operating agreement location, special notes..." rows={4}/>
          </Field>
        </Section>
      </div>
    </div>
  )
}
