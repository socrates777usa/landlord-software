import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Trash2, Calculator } from 'lucide-react'
import { getById, save, remove } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { calcProperty, calcMonthlyPayment } from '../../core/calculations/property.js'
import './Properties.css'

const EMPTY = {
  nickname: '', propertyType: 'SFR', yearBuilt: '', sqft: '', bedrooms: '', bathrooms: '',
  lotSize: '', status: 'active', llcSeries: '', acquisitionDate: '', purchasePrice: '',
  currentValue: '', section8: false,
  address: { street: '', city: '', state: 'TX', zip: '' },
  loan: { type: 'DSCR', lender: '', originalAmount: '', balance: '', rate: '', term: 30, refiDate: '' },
  income: { monthlyRent: '', marketRent: '', section8PaymentStd: '', vacancyRate: 5, annualRentIncrease: 4 },
  expenses: {
    propertyTax: '', insurance: '', hoa: 0, mgmtFee: 0, maintenanceSuggested: '',
    maintenanceActual: 0, capexSuggested: '', capexActual: 0, utilities: 0, other: 0
  },
  notes: ''
}

function fmt$(n) {
  if (n == null || n === '') return '—'
  const abs = Math.abs(n); const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(2)}M`
  if (abs >= 1000)    return `${sign}$${(abs/1000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}
function fmtPct(n) { return n == null ? '—' : `${n.toFixed(2)}%` }

function Field({ label, children, hint }) {
  return (
    <div className="pf-field">
      <label className="pf-label">{label}{hint && <span className="pf-hint"> — {hint}</span>}</label>
      {children}
    </div>
  )
}
function Input({ value, onChange, type='text', placeholder='', min, step }) {
  return <input className="pf-input" type={type} value={value ?? ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} min={min} step={step} />
}
function Select({ value, onChange, options }) {
  return (
    <select className="pf-input" value={value ?? ''} onChange={e=>onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
function Section({ title, children }) {
  return (
    <div className="pf-section">
      <div className="pf-section-title">{title}</div>
      <div className="pf-grid">{children}</div>
    </div>
  )
}

export default function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [calcs, setCalcs]     = useState(null)

  useEffect(() => {
    if (!isNew) {
      getById(STORES.PROPERTIES, id).then(p => {
        if (p) setForm({ ...EMPTY, ...p })
        setLoading(false)
      })
    }
  }, [id, isNew])

  // Live calc on every form change
  useEffect(() => {
    try {
      const p = buildRecord(form)
      setCalcs(calcProperty(p))
    } catch { setCalcs(null) }
  }, [form])

  function set(path, val) {
    setForm(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = val
      return next
    })
  }

  function buildRecord(f) {
    const loanBalance = parseFloat(f.loan.balance) || 0
    const loanRate    = parseFloat(f.loan.rate)    || 0
    const loanTerm    = parseFloat(f.loan.term)    || 30
    return {
      ...f,
      purchasePrice: parseFloat(f.purchasePrice) || 0,
      currentValue:  parseFloat(f.currentValue)  || 0,
      loan: { ...f.loan,
        originalAmount: parseFloat(f.loan.originalAmount) || 0,
        balance: loanBalance, rate: loanRate, term: loanTerm,
        monthlyPayment: calcMonthlyPayment(loanBalance, loanRate, loanTerm)
      },
      income: { ...f.income,
        monthlyRent:       parseFloat(f.income.monthlyRent)       || 0,
        marketRent:        parseFloat(f.income.marketRent)        || 0,
        section8PaymentStd:parseFloat(f.income.section8PaymentStd)|| 0,
        vacancyRate:       parseFloat(f.income.vacancyRate)       ?? 5,
        annualRentIncrease:parseFloat(f.income.annualRentIncrease)?? 4,
      },
      expenses: { ...f.expenses,
        propertyTax:       parseFloat(f.expenses.propertyTax)      || 0,
        insurance:         parseFloat(f.expenses.insurance)        || 0,
        hoa:               parseFloat(f.expenses.hoa)              || 0,
        mgmtFee:           parseFloat(f.expenses.mgmtFee)          || 0,
        maintenanceActual: parseFloat(f.expenses.maintenanceActual)|| 0,
        capexActual:       parseFloat(f.expenses.capexActual)      || 0,
        utilities:         parseFloat(f.expenses.utilities)        || 0,
        other:             parseFloat(f.expenses.other)            || 0,
      }
    }
  }

  async function handleSave() {
    if (!form.address?.street) { setError('Street address is required.'); return }
    setSaving(true); setError('')
    try {
      const record = buildRecord(form)
      const saved = await save(STORES.PROPERTIES, isNew ? record : { ...record, id })
      navigate(`/properties/${saved.id}`, { replace: true })
    } catch(e) { setError('Save failed: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this property? This cannot be undone.')) return
    await remove(STORES.PROPERTIES, id)
    navigate('/properties')
  }

  if (loading) return <div className="prop-loading">Loading property...</div>


  const piPayment = calcs?.monthlyPayment ?? 0
  const dscrVal   = calcs?.dscr
  const dscrClass = dscrVal >= 1.25 ? 'calc-pos' : dscrVal >= 1 ? 'calc-warn' : 'calc-neg'

  return (
    <div className="prop-form-page">
      {/* Header */}
      <div className="pf-header">
        <button className="pf-back" onClick={() => navigate('/properties')}><ArrowLeft size={16}/> Properties</button>
        <h1 className="pf-title">{isNew ? 'Add Property' : (form.nickname || form.address?.street || 'Edit Property')}</h1>
        <div className="pf-actions">
          {!isNew && <button className="btn-delete" onClick={handleDelete}><Trash2 size={15}/> Delete</button>}
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error && <div className="pf-error">{error}</div>}

      <div className="pf-body">
        <div className="pf-main">

          {/* SECTION 1 — IDENTIFICATION */}
          <Section title="1 — Property Identification">
            <Field label="Street Address"><Input value={form.address?.street} onChange={v=>set('address.street',v)} placeholder="123 Main St" /></Field>
            <Field label="City"><Input value={form.address?.city} onChange={v=>set('address.city',v)} placeholder="Caddo Mills" /></Field>
            <Field label="State"><Input value={form.address?.state} onChange={v=>set('address.state',v)} placeholder="TX" /></Field>
            <Field label="ZIP"><Input value={form.address?.zip} onChange={v=>set('address.zip',v)} placeholder="75135" /></Field>
            <Field label="Nickname / Label"><Input value={form.nickname} onChange={v=>set('nickname',v)} placeholder="Front house, Unit A..." /></Field>
            <Field label="Property Type">
              <Select value={form.propertyType} onChange={v=>set('propertyType',v)} options={[
                {value:'SFR',label:'Single Family (SFR)'},{value:'Duplex',label:'Duplex'},
                {value:'Manufactured',label:'Manufactured'},{value:'Triplex',label:'Triplex'},
                {value:'Quadplex',label:'Quadplex'},{value:'MFR',label:'Multi-Family (5+)'},
              ]}/>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={v=>set('status',v)} options={[
                {value:'active',label:'Occupied'},{value:'vacant',label:'Vacant'},
                {value:'renovation',label:'Under Renovation'},{value:'forsale',label:'For Sale'},
              ]}/>
            </Field>
            <Field label="Year Built"><Input type="number" value={form.yearBuilt} onChange={v=>set('yearBuilt',v)} placeholder="2005" /></Field>
            <Field label="Sq Ft"><Input type="number" value={form.sqft} onChange={v=>set('sqft',v)} placeholder="1400" /></Field>
            <Field label="Bedrooms"><Input type="number" value={form.bedrooms} onChange={v=>set('bedrooms',v)} placeholder="3" /></Field>
            <Field label="Bathrooms"><Input type="number" value={form.bathrooms} onChange={v=>set('bathrooms',v)} placeholder="2" /></Field>
            <Field label="Lot Size (acres)"><Input type="number" value={form.lotSize} onChange={v=>set('lotSize',v)} placeholder="0.25" step="0.01" /></Field>
            <Field label="LLC / Series"><Input value={form.llcSeries} onChange={v=>set('llcSeries',v)} placeholder="Series A, Rental LLC..." /></Field>
            <Field label="Acquisition Date"><Input type="date" value={form.acquisitionDate} onChange={v=>set('acquisitionDate',v)} /></Field>
            <Field label="Purchase Price"><Input type="number" value={form.purchasePrice} onChange={v=>set('purchasePrice',v)} placeholder="150000" /></Field>
            <Field label="Current Market Value"><Input type="number" value={form.currentValue} onChange={v=>set('currentValue',v)} placeholder="185000" /></Field>
            <Field label="Section 8 / HUD">
              <label className="pf-check"><input type="checkbox" checked={!!form.section8} onChange={e=>set('section8',e.target.checked)}/> Section 8 voucher holder</label>
            </Field>
          </Section>


          {/* SECTION 2 — FINANCING */}
          <Section title="2 — Financing">
            <Field label="Loan Type">
              <Select value={form.loan?.type} onChange={v=>set('loan.type',v)} options={[
                {value:'DSCR',label:'DSCR'},{value:'Conventional',label:'Conventional'},
                {value:'SellerFinance',label:'Seller Finance'},{value:'HELOC',label:'HELOC-Funded'},
                {value:'Cash',label:'Cash (No Loan)'},{value:'Other',label:'Other'},
              ]}/>
            </Field>
            <Field label="Lender"><Input value={form.loan?.lender} onChange={v=>set('loan.lender',v)} placeholder="First National Bank..." /></Field>
            <Field label="Original Loan Amount"><Input type="number" value={form.loan?.originalAmount} onChange={v=>set('loan.originalAmount',v)} placeholder="120000" /></Field>
            <Field label="Current Balance"><Input type="number" value={form.loan?.balance} onChange={v=>set('loan.balance',v)} placeholder="115000" /></Field>
            <Field label="Interest Rate (%)" hint="annual"><Input type="number" value={form.loan?.rate} onChange={v=>set('loan.rate',v)} placeholder="7.5" step="0.125" /></Field>
            <Field label="Loan Term (years)"><Input type="number" value={form.loan?.term} onChange={v=>set('loan.term',v)} placeholder="30" /></Field>
            <Field label="Monthly P&I (calculated)" hint="auto">
              <div className="pf-calc-display">{piPayment > 0 ? `$${piPayment.toFixed(2)}/mo` : '—'}</div>
            </Field>
            <Field label="Refi Date"><Input type="date" value={form.loan?.refiDate} onChange={v=>set('loan.refiDate',v)} /></Field>
          </Section>

          {/* SECTION 3 — INCOME */}
          <Section title="3 — Income">
            <Field label="Monthly Rent"><Input type="number" value={form.income?.monthlyRent} onChange={v=>set('income.monthlyRent',v)} placeholder="1500" /></Field>
            <Field label="Market Rent Estimate"><Input type="number" value={form.income?.marketRent} onChange={v=>set('income.marketRent',v)} placeholder="1600" /></Field>
            <Field label="Section 8 Payment Standard"><Input type="number" value={form.income?.section8PaymentStd} onChange={v=>set('income.section8PaymentStd',v)} placeholder="1450" /></Field>
            <Field label="Vacancy Rate (%)" hint="default 5%"><Input type="number" value={form.income?.vacancyRate} onChange={v=>set('income.vacancyRate',v)} step="0.5" /></Field>
            <Field label="Annual Rent Increase (%)" hint="default 4%"><Input type="number" value={form.income?.annualRentIncrease} onChange={v=>set('income.annualRentIncrease',v)} step="0.5" /></Field>
          </Section>

          {/* SECTION 4 — EXPENSES */}
          <Section title="4 — Expenses">
            <Field label="Property Tax (annual)"><Input type="number" value={form.expenses?.propertyTax} onChange={v=>set('expenses.propertyTax',v)} placeholder="2400" /></Field>
            <Field label="Insurance (annual)"><Input type="number" value={form.expenses?.insurance} onChange={v=>set('expenses.insurance',v)} placeholder="1200" /></Field>
            <Field label="HOA (monthly)"><Input type="number" value={form.expenses?.hoa} onChange={v=>set('expenses.hoa',v)} placeholder="0" /></Field>
            <Field label="Mgmt Fee (monthly)"><Input type="number" value={form.expenses?.mgmtFee} onChange={v=>set('expenses.mgmtFee',v)} placeholder="0" /></Field>
            <Field label="Maintenance Reserve (monthly)" hint="actual amount set aside"><Input type="number" value={form.expenses?.maintenanceActual} onChange={v=>set('expenses.maintenanceActual',v)} placeholder="100" /></Field>
            <Field label="CapEx Reserve (monthly)" hint="actual amount set aside"><Input type="number" value={form.expenses?.capexActual} onChange={v=>set('expenses.capexActual',v)} placeholder="100" /></Field>
            <Field label="Utilities (monthly, if landlord-paid)"><Input type="number" value={form.expenses?.utilities} onChange={v=>set('expenses.utilities',v)} placeholder="0" /></Field>
            <Field label="Other Recurring (monthly)"><Input type="number" value={form.expenses?.other} onChange={v=>set('expenses.other',v)} placeholder="0" /></Field>
          </Section>

          {/* NOTES */}
          <Section title="5 — Notes">
            <div className="pf-field pf-full">
              <label className="pf-label">Property Notes</label>
              <textarea className="pf-textarea" rows={4} value={form.notes || ''} onChange={e=>set('notes',e.target.value)} placeholder="Renovation plans, tenant notes, deal history..." />
            </div>
          </Section>

        </div>{/* end pf-main */}


        {/* SIDEBAR — Live Calculated Outputs */}
        <div className="pf-sidebar">
          <div className="pf-calc-panel">
            <div className="pf-calc-title"><Calculator size={14}/> Live Analysis</div>
            {calcs ? (
              <>
                <div className="pf-calc-row">
                  <span>Effective Income</span><span>{fmt$(calcs.effectiveIncome)}/mo</span>
                </div>
                <div className="pf-calc-row">
                  <span>Total Expenses</span><span>{fmt$(calcs.totalExpenses)}/mo</span>
                </div>
                <div className="pf-calc-divider"/>
                <div className="pf-calc-row bold">
                  <span>NOI</span><span>{fmt$(calcs.noiMonthly)}/mo</span>
                </div>
                <div className="pf-calc-row">
                  <span>Debt Service</span><span>{fmt$(calcs.monthlyPayment)}/mo</span>
                </div>
                <div className="pf-calc-divider"/>
                <div className={`pf-calc-row bold ${calcs.cashFlowMonthly >= 0 ? 'calc-pos' : 'calc-neg'}`}>
                  <span>Cash Flow</span><span>{fmt$(calcs.cashFlowMonthly)}/mo</span>
                </div>
                <div className="pf-calc-row">
                  <span>Annual Cash Flow</span><span>{fmt$(calcs.cashFlowAnnual)}</span>
                </div>
                <div className="pf-calc-divider"/>
                <div className={`pf-calc-row bold ${dscrClass}`}>
                  <span>DSCR</span><span>{calcs.dscr ?? '—'}</span>
                </div>
                <div className="pf-calc-row">
                  <span>Cap Rate</span><span>{fmtPct(calcs.capRate)}</span>
                </div>
                <div className="pf-calc-row">
                  <span>CoC Return</span><span>{fmtPct(calcs.cocReturn)}</span>
                </div>
                <div className="pf-calc-divider"/>
                <div className="pf-calc-row">
                  <span>Equity</span><span>{fmt$(calcs.equity)}</span>
                </div>
                <div className="pf-calc-row">
                  <span>LTV</span><span>{fmtPct(calcs.ltv)}</span>
                </div>
                <div className="pf-calc-divider"/>
                <div className="pf-dscr-legend">
                  <div className="calc-pos">≥ 1.25 — Strong</div>
                  <div className="calc-warn">1.0–1.24 — Marginal</div>
                  <div className="calc-neg">&lt; 1.0 — At Risk</div>
                </div>
              </>
            ) : (
              <div className="pf-calc-empty">Enter loan and income details to see live analysis.</div>
            )}
          </div>
        </div>

      </div>{/* end pf-body */}
    </div>
  )
}
