import { useState, useEffect } from 'react'
import { Save, Download, Upload, Trash2, RefreshCw } from 'lucide-react'
import { getSetting, setSetting, exportAllData, importAllData } from '../../core/storage/adapter.js'

const DEFAULT_SETTINGS = {
  rentGrowthRate: 4,
  expenseGrowthRate: 3,
  vacancyRate: 5,
  maintenanceReservePct: 1,
  capexReservePct: 1,
  propValueGrowthRate: 3,
  dscrFloor: 1.25,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'dark',
  alertLeadDaysLease: 60,
  alertLeadDaysInsurance: 60,
  enableSmsAlerts: false,
  enableEmailAlerts: false,
  notificationEmail: '',
}

export default function Settings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saved, setSaved]       = useState(false)
  const [importMsg, setImportMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const stored = {}
      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        const val = await getSetting(key)
        if (val !== null && val !== undefined) stored[key] = val
      }
      setSettings(s => ({ ...s, ...stored }))
    }
    load()
  }, [])

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    for (const [k, v] of Object.entries(settings)) await setSetting(k, v)
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `landlord-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllData(data)
      setImportMsg('✓ Import successful! Refresh the page to see changes.')
    } catch { setImportMsg('✗ Import failed — invalid file.') }
  }

  const handleClearData = () => {
    if (!confirm('⚠️  This will permanently delete ALL data in this app. Are you sure?')) return
    if (!confirm('Last chance — click OK to wipe everything.')) return
    indexedDB.deleteDatabase('landlord_db')
    localStorage.clear()
    window.location.reload()
  }

  const F = ({ label, k, type='number', hint, min, max, step }) => (
    <div style={{display:'flex', flexDirection:'column', gap:'0.3rem'}}>
      <label style={{fontSize:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'var(--font-display)'}}>{label}</label>
      <input type={type} value={settings[k] ?? ''} min={min} max={max} step={step || 0.1}
        onChange={e => set(k, type==='number' ? Number(e.target.value) : e.target.value)}
        style={{background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'0.5rem 0.75rem', color:'var(--text-primary)', fontSize:'0.88rem', fontFamily:'var(--font-mono)'}}/>
      {hint && <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>{hint}</span>}
    </div>
  )

  const SectionTitle = ({ children }) => (
    <h2 style={{fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--amber)', fontWeight:700, marginBottom:'1rem', fontFamily:'var(--font-display)', borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem'}}>{children}</h2>
  )

  return (
    <div style={{padding:'2rem', maxWidth:'900px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em', textTransform:'uppercase'}}>Settings</h1>
          <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>Global assumptions, data management, preferences</p>
        </div>
        <button onClick={handleSave}
          style={{display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.1rem', background: saved ? 'var(--green)' : 'var(--amber)', color:'var(--text-inverse)', borderRadius:'var(--radius)', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.85rem', fontFamily:'var(--font-display)'}}>
          <Save size={15}/> {saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
        {/* Projection Assumptions */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem'}}>
          <SectionTitle>Projection Assumptions</SectionTitle>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <F label="Rent Growth (%/yr)" k="rentGrowthRate" min={0} max={20}/>
            <F label="Expense Growth (%/yr)" k="expenseGrowthRate" min={0} max={20}/>
            <F label="Property Value Growth (%/yr)" k="propValueGrowthRate" min={0} max={20}/>
            <F label="Vacancy Rate (%)" k="vacancyRate" min={0} max={50}/>
            <F label="Maintenance Reserve (%)" k="maintenanceReservePct" min={0} max={10} hint="% of property value/yr"/>
            <F label="CapEx Reserve (%)" k="capexReservePct" min={0} max={10} hint="% of property value/yr"/>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem'}}>
          <SectionTitle>Alert Thresholds</SectionTitle>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <F label="DSCR Floor" k="dscrFloor" min={0.5} max={3} step={0.05} hint="Alert when DSCR drops below this"/>
            <F label="Lease Alert Lead (days)" k="alertLeadDaysLease" type="number" min={30} max={180}/>
            <F label="Insurance Alert Lead (days)" k="alertLeadDaysInsurance" type="number" min={30} max={180}/>
          </div>
        </div>

        {/* Data Management */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem'}}>
          <SectionTitle>Data Management</SectionTitle>
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <button onClick={handleExport}
              style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-primary)', cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)'}}>
              <Download size={15}/> Export All Data (JSON backup)
            </button>
            <label style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', background:'var(--bg-base)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text-primary)', cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)'}}>
              <Upload size={15}/> Import From Backup
              <input type="file" accept=".json" onChange={handleImport} style={{display:'none'}}/>
            </label>
            {importMsg && <p style={{fontSize:'0.8rem', color: importMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)'}}>{importMsg}</p>}
            <button onClick={handleClearData}
              style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1rem', background:'var(--red-dim)', border:'1px solid var(--red)', borderRadius:'var(--radius)', color:'var(--red)', cursor:'pointer', fontSize:'0.85rem', fontFamily:'var(--font-body)'}}>
              <Trash2 size={15}/> Clear All Data
            </button>
          </div>
        </div>

        {/* About */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem'}}>
          <SectionTitle>About</SectionTitle>
          <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', fontSize:'0.84rem', color:'var(--text-secondary)'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Version</span><span style={{fontFamily:'var(--font-mono)', color:'var(--amber)'}}>v0.2.0 — Phase 2</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Storage</span><span style={{fontFamily:'var(--font-mono)'}}>IndexedDB (Local)</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>License</span><span style={{fontFamily:'var(--font-mono)'}}>MIT Open Source</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>GitHub</span><span style={{fontFamily:'var(--font-mono)'}}>socrates777usa</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
