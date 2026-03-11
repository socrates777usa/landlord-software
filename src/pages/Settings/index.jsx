import { useState, useEffect } from 'react'
import { getSetting, setSetting, exportAllData, importAllData } from '../../core/storage/adapter.js'

const DEFAULTS = {
  rentGrowthRate: 4, expenseGrowthRate: 3, vacancyRate: 5,
  maintReservePct: 1, capexReservePct: 1, propertyValueGrowth: 3,
  appName: 'ACME', currency: 'USD', dateFormat: 'MM/DD/YYYY', theme: 'dark'
}

const Row = ({ label, hint, children }) => (
  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px solid var(--border)'}}>
    <div>
      <div style={{fontSize:'0.88rem', color:'var(--text-primary)', fontWeight:500}}>{label}</div>
      {hint && <div style={{fontSize:'0.73rem', color:'var(--text-muted)', marginTop:'0.15rem'}}>{hint}</div>}
    </div>
    <div style={{marginLeft:'1rem'}}>{children}</div>
  </div>
)

const NumInput = ({ value, onChange, unit }) => (
  <div style={{display:'flex', alignItems:'center', gap:'0.3rem'}}>
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
      style={{width:'70px', padding:'0.3rem 0.5rem', background:'var(--bg-surface)', border:'1px solid var(--border-bright)',
        borderRadius:'var(--radius)', color:'var(--text-primary)', fontSize:'0.85rem', textAlign:'right',
        fontFamily:'var(--font-mono)', outline:'none'}}/>
    {unit && <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>{unit}</span>}
  </div>
)

export default function Settings() {
  const [cfg, setCfg]     = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg]     = useState('')

  useEffect(() => {
    Promise.all(Object.keys(DEFAULTS).map(k => getSetting(k))).then(vals => {
      const loaded = {}
      Object.keys(DEFAULTS).forEach((k, i) => {
        loaded[k] = vals[i] !== null && vals[i] !== undefined ? vals[i] : DEFAULTS[k]
      })
      setCfg(loaded)
    })
  }, [])

  const set = (k, v) => { setCfg(c => ({ ...c, [k]: v })); setSaved(false) }

  const handleSave = async () => {
    await Promise.all(Object.entries(cfg).map(([k, v]) => setSetting(k, v)))
    setSaved(true); setMsg('Settings saved.')
    setTimeout(() => setMsg(''), 2500)
  }

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a'); a.href = url
      a.download = `acme-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click(); URL.revokeObjectURL(url)
      setMsg('Backup exported.')
    } catch { setMsg('Export failed.') }
    setTimeout(() => setMsg(''), 3000)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.onchange = async e => {
      const file = e.target.files[0]; if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!confirm('This will overwrite ALL current data. Continue?')) return
        await importAllData(data)
        setMsg('Import successful. Reload the app to see changes.')
      } catch { setMsg('Import failed — invalid backup file.') }
      setTimeout(() => setMsg(''), 5000)
    }
    input.click()
  }

  const Section = ({ title }) => (
    <h2 style={{fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--amber)', fontWeight:700,
      marginTop:'2rem', marginBottom:'0', paddingBottom:'0.4rem', borderBottom:'1px solid var(--amber-dim)',
      fontFamily:'var(--font-display)'}}>{title}</h2>
  )

  return (
    <div style={{padding:'2rem', maxWidth:'680px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <div>
          <h1 style={{fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em', textTransform:'uppercase'}}>Settings</h1>
          <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>Global defaults · Data management · Preferences</p>
        </div>
        <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
          {msg && <span style={{fontSize:'0.78rem', color: msg.includes('fail') ? 'var(--red)' : 'var(--green)'}}>{msg}</span>}
          <button onClick={handleSave}
            style={{padding:'0.5rem 1.25rem', background:'var(--amber)', color:'var(--text-inverse)', border:'none',
              borderRadius:'var(--radius)', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.85rem'}}>
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>

      <Section title="Default Assumptions — Projections"/>
      <Row label="Rent Growth Rate" hint="Annual increase applied to all properties by default">
        <NumInput value={cfg.rentGrowthRate} onChange={v => set('rentGrowthRate', v)} unit="%/yr"/>
      </Row>
      <Row label="Expense Growth Rate" hint="Annual increase applied to operating expenses">
        <NumInput value={cfg.expenseGrowthRate} onChange={v => set('expenseGrowthRate', v)} unit="%/yr"/>
      </Row>
      <Row label="Property Value Growth" hint="Annual appreciation assumption for projections">
        <NumInput value={cfg.propertyValueGrowth} onChange={v => set('propertyValueGrowth', v)} unit="%/yr"/>
      </Row>
      <Row label="Vacancy Rate" hint="Default vacancy assumption (% of rent lost annually)">
        <NumInput value={cfg.vacancyRate} onChange={v => set('vacancyRate', v)} unit="%"/>
      </Row>

      <Section title="Default Reserve Assumptions"/>
      <Row label="Maintenance Reserve" hint="Suggested annual reserve as % of property value">
        <NumInput value={cfg.maintReservePct} onChange={v => set('maintReservePct', v)} unit="%/yr"/>
      </Row>
      <Row label="CapEx Reserve" hint="Suggested annual capital expenditure reserve">
        <NumInput value={cfg.capexReservePct} onChange={v => set('capexReservePct', v)} unit="%/yr"/>
      </Row>

      <Section title="App Preferences"/>
      <Row label="Currency" hint="Display currency format">
        <select value={cfg.currency} onChange={e => set('currency', e.target.value)}
          style={{padding:'0.3rem 0.6rem', background:'var(--bg-surface)', border:'1px solid var(--border-bright)',
            borderRadius:'var(--radius)', color:'var(--text-primary)', fontSize:'0.85rem'}}>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </Row>

      <Section title="Data Management"/>
      <Row label="Export Backup" hint="Download a full JSON backup of all your data">
        <button onClick={handleExport}
          style={{padding:'0.35rem 0.9rem', background:'var(--bg-hover)', border:'1px solid var(--border-bright)',
            borderRadius:'var(--radius)', color:'var(--text-primary)', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--font-body)'}}>
          Export JSON
        </button>
      </Row>
      <Row label="Import Backup" hint="Restore data from a previously exported backup file">
        <button onClick={handleImport}
          style={{padding:'0.35rem 0.9rem', background:'var(--bg-hover)', border:'1px solid var(--border-bright)',
            borderRadius:'var(--radius)', color:'var(--yellow)', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--font-body)'}}>
          Import JSON
        </button>
      </Row>

      <div style={{marginTop:'2rem', padding:'1rem', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)'}}>
        <div style={{fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:'0.5rem'}}>App Info</div>
        <div style={{display:'flex', gap:'2rem', fontSize:'0.8rem', color:'var(--text-secondary)'}}>
          <span>Version: v0.1.0</span>
          <span>Phase: 2 — Operations</span>
          <span>Storage: IndexedDB (local-first)</span>
        </div>
      </div>
    </div>
  )
}
