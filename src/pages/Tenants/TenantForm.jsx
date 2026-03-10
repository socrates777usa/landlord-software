import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { getById, save, remove, getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { Field, Input, Select, Textarea, Section } from '../../components/shared/FormKit.jsx'
import '../../components/shared/shared.css'

const EMPTY = {
  firstName: '', lastName: '', dob: '', phone: '', email: '',
  emergencyName: '', emergencyPhone: '',
  propertyId: '', status: 'active',
  moveInDate: '', moveOutDate: '', leaseStartDate: '', leaseEndDate: '',
  monthlyRent: '', securityDeposit: '', petDeposit: '',
  section8: false, hapContractNumber: '',
  paymentNotes: '', notes: '',
}

export default function TenantForm() {
  const { id } = useParams(); const isNew = !id
  const navigate = useNavigate()
  const [form, setForm]         = useState(EMPTY)
  const [properties, setProperties] = useState([])
  const [loading, setLoading]   = useState(!isNew)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    const tasks = [getAll(STORES.PROPERTIES)]
    if (!isNew) tasks.push(getById(STORES.TENANTS, id))
    Promise.all(tasks).then(([props, tenant]) => {
      setProperties(props)
      if (tenant) setForm({ ...EMPTY, ...tenant })
      setLoading(false)
    })
  }, [id, isNew])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    if (!form.firstName || !form.lastName) { setError('First and last name are required.'); return }
    setSaving(true); setError('')
    try {
      const saved = await save(STORES.TENANTS, isNew ? form : { ...form, id })
      navigate(`/tenants/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${form.firstName} ${form.lastName}? This cannot be undone.`)) return
    await remove(STORES.TENANTS, id)
    navigate('/tenants')
  }

  if (loading) return <div className="page-loading">Loading tenant...</div>

  const propOptions = [
    { value: '', label: '— No property assigned —' },
    ...properties.map(p => ({ value: p.id, label: p.nickname || p.address?.street || p.id }))
  ]

  const name = form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : null

  return (
    <div className="form-page">
      <div className="form-header">
        <button className="form-back" onClick={() => navigate('/tenants')}><ArrowLeft size={16}/> Tenants</button>
        <h1 className="form-title">{isNew ? 'Add Tenant' : (name || 'Edit Tenant')}</h1>
        <div className="form-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}

      <div className="form-body">
        <Section title="1 — Personal Information">
          <Field label="First Name"><Input value={form.firstName} onChange={v=>set('firstName',v)} placeholder="Jane"/></Field>
          <Field label="Last Name"><Input value={form.lastName} onChange={v=>set('lastName',v)} placeholder="Smith"/></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dob} onChange={v=>set('dob',v)}/></Field>
          <Field label="Phone"><Input value={form.phone} onChange={v=>set('phone',v)} placeholder="(555) 000-0000"/></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={v=>set('email',v)} placeholder="jane@email.com"/></Field>
          <Field label="Emergency Contact Name"><Input value={form.emergencyName} onChange={v=>set('emergencyName',v)} placeholder="John Smith"/></Field>
          <Field label="Emergency Contact Phone"><Input value={form.emergencyPhone} onChange={v=>set('emergencyPhone',v)} placeholder="(555) 000-0000"/></Field>
        </Section>

        <Section title="2 — Tenancy Details">
          <Field label="Assigned Property">
            <Select value={form.propertyId} onChange={v=>set('propertyId',v)} options={propOptions}/>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v=>set('status',v)} options={[
              {value:'active',label:'Active'},{value:'former',label:'Former Tenant'}
            ]}/>
          </Field>
          <Field label="Move-In Date"><Input type="date" value={form.moveInDate} onChange={v=>set('moveInDate',v)}/></Field>
          <Field label="Move-Out Date"><Input type="date" value={form.moveOutDate} onChange={v=>set('moveOutDate',v)}/></Field>
          <Field label="Lease Start Date"><Input type="date" value={form.leaseStartDate} onChange={v=>set('leaseStartDate',v)}/></Field>
          <Field label="Lease End Date"><Input type="date" value={form.leaseEndDate} onChange={v=>set('leaseEndDate',v)}/></Field>
          <Field label="Monthly Rent"><Input type="number" value={form.monthlyRent} onChange={v=>set('monthlyRent',v)} placeholder="1500"/></Field>
          <Field label="Security Deposit"><Input type="number" value={form.securityDeposit} onChange={v=>set('securityDeposit',v)} placeholder="1500"/></Field>
          <Field label="Pet Deposit"><Input type="number" value={form.petDeposit} onChange={v=>set('petDeposit',v)} placeholder="0"/></Field>
        </Section>

        <Section title="3 — Section 8">
          <Field label="Section 8 Voucher Holder" full>
            <label className="form-check">
              <input type="checkbox" checked={!!form.section8} onChange={e=>set('section8',e.target.checked)}/>
              This tenant holds a Section 8 / HUD voucher
            </label>
          </Field>
          <Field label="HAP Contract Number"><Input value={form.hapContractNumber} onChange={v=>set('hapContractNumber',v)} placeholder="HAP-XXXXX"/></Field>
        </Section>

        <Section title="4 — Notes">
          <Field label="Payment History Notes" full>
            <Textarea value={form.paymentNotes} onChange={v=>set('paymentNotes',v)} placeholder="On-time payer, 1 late in 2024..." rows={3}/>
          </Field>
          <Field label="Internal Notes (not visible to tenant)" full>
            <Textarea value={form.notes} onChange={v=>set('notes',v)} placeholder="Flags, observations, follow-up items..." rows={3}/>
          </Field>
        </Section>
      </div>
    </div>
  )
}
