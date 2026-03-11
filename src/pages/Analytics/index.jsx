import { useState, useEffect } from 'react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { calcProperty } from '../../core/calculations/property.js'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const fmt$ = n => `$${Number(n).toLocaleString()}`
const fmtK = n => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${Number(n).toFixed(0)}`

const AMBER  = '#f59e0b'
const GREEN  = '#10b981'
const RED    = '#ef4444'
const BLUE   = '#3b82f6'

const TipStyle = { background:'#0d1117', border:'1px solid #1e2d3d', color:'#e2e8f0', fontSize:'12px', borderRadius:'6px' }

export default function Analytics() {
  const [props, setProps]     = useState([])
  const [tenants, setTenants] = useState([])
  const [maint, setMaint]     = useState([])
  const [txns, setTxns]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAll(STORES.PROPERTIES), getAll(STORES.TENANTS),
      getAll(STORES.MAINTENANCE), getAll(STORES.TRANSACTIONS)
    ]).then(([p, t, m, tx]) => {
      setProps(p); setTenants(t); setMaint(m); setTxns(tx); setLoading(false)
    })
  }, [])

  if (loading) return <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-secondary)'}}>Loading analytics...</div>

  // Build property data with calcs
  const propData = props.map(p => {
    const c = calcProperty(p)
    const label = p.nickname || p.address?.street || p.id
    const tenantCount = tenants.filter(t => t.propertyId === p.id && t.status === 'active').length
    const maintCost = maint.filter(m => m.propertyId === p.id).reduce((s,m) => s + Number(m.cost||0), 0)
    return { ...p, label, calc: c, tenantCount, maintCost }
  })

  // Cash flow ranking
  const cfRanked = [...propData].sort((a,b) => (b.calc.cashFlow||0) - (a.calc.cashFlow||0))
  const cfData   = cfRanked.map(p => ({ name: p.label.slice(0,14), cashFlow: p.calc.cashFlow || 0 }))

  // DSCR chart
  const dscrData = propData.map(p => ({ name: p.label.slice(0,14), dscr: Number((p.calc.dscr||0).toFixed(2)) }))

  // Equity chart
  const equityData = propData.map(p => ({ name: p.label.slice(0,14), equity: p.calc.equity || 0 }))

  // Maintenance chart
  const maintData = propData.filter(p => p.maintCost > 0).map(p => ({ name: p.label.slice(0,14), cost: p.maintCost }))

  // Portfolio totals
  const totalIncome  = propData.reduce((s,p) => s + (p.income?.monthlyRent||0), 0)
  const totalDebt    = propData.reduce((s,p) => s + (p.loan?.monthlyPayment||0), 0)
  const totalCF      = propData.reduce((s,p) => s + (p.calc.cashFlow||0), 0)
  const totalEquity  = propData.reduce((s,p) => s + (p.calc.equity||0), 0)
  const totalValue   = propData.reduce((s,p) => s + (p.currentValue||0), 0)
  const occupied     = propData.filter(p => p.status === 'active').length
  const occPct       = props.length ? Math.round((occupied / props.length) * 100) : 0
  const avgDscr      = propData.length ? (propData.reduce((s,p) => s + (p.calc.dscr||0), 0) / propData.length).toFixed(2) : '—'

  // Vacancy days estimate (rough — days since last lease or acquisition)
  const vacantProps = propData.filter(p => p.status === 'vacant')

  const KPI = ({ label, value, color }) => (
    <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1rem'}}>
      <div style={{fontSize:'0.68rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem'}}>{label}</div>
      <div style={{fontSize:'1.3rem', fontWeight:700, color: color || 'var(--text-primary)', fontFamily:'var(--font-mono)'}}>{value}</div>
    </div>
  )

  const SectionTitle = ({ children }) => (
    <h2 style={{fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--amber)', fontWeight:700, marginBottom:'1rem', fontFamily:'var(--font-display)', borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem'}}>{children}</h2>
  )

  return (
    <div style={{padding:'2rem', maxWidth:'1400px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontSize:'1.6rem', fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.04em', textTransform:'uppercase'}}>Analytics</h1>
          <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.3rem'}}>{props.length} properties · {tenants.filter(t=>t.status==='active').length} active tenants</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px,1fr))', gap:'1rem', marginBottom:'2rem'}}>
        <KPI label="Monthly Income"   value={fmtK(totalIncome)} color={GREEN}/>
        <KPI label="Monthly Debt"     value={fmtK(totalDebt)}   color={RED}/>
        <KPI label="Net Cash Flow"    value={fmtK(totalCF)}     color={totalCF>=0?GREEN:RED}/>
        <KPI label="Total Equity"     value={fmtK(totalEquity)} color={AMBER}/>
        <KPI label="Portfolio Value"  value={fmtK(totalValue)}/>
        <KPI label="Occupancy"        value={`${occPct}%`}      color={occPct>=90?GREEN:occPct>=70?AMBER:RED}/>
        <KPI label="Avg DSCR"         value={avgDscr}           color={Number(avgDscr)>=1.25?GREEN:Number(avgDscr)>=1.0?AMBER:RED}/>
        <KPI label="Vacant Units"     value={vacantProps.length} color={vacantProps.length>0?RED:GREEN}/>
      </div>

      {/* Charts Grid */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>

        {/* Cash Flow by Property */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem'}}>
          <SectionTitle>Monthly Cash Flow by Property</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cfData} margin={{top:0, right:10, left:10, bottom:40}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
              <XAxis dataKey="name" tick={{fill:'#7a95b0', fontSize:11}} angle={-35} textAnchor="end"/>
              <YAxis tick={{fill:'#7a95b0', fontSize:11}} tickFormatter={n => `$${n}`}/>
              <Tooltip contentStyle={TipStyle} formatter={v => [fmt$(v), 'Cash Flow']}/>
              <Bar dataKey="cashFlow" radius={[4,4,0,0]}>
                {cfData.map((d,i) => <Cell key={i} fill={d.cashFlow >= 0 ? GREEN : RED}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DSCR by Property */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem'}}>
          <SectionTitle>DSCR by Property (≥1.25 = healthy)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dscrData} margin={{top:0, right:10, left:0, bottom:40}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
              <XAxis dataKey="name" tick={{fill:'#7a95b0', fontSize:11}} angle={-35} textAnchor="end"/>
              <YAxis tick={{fill:'#7a95b0', fontSize:11}} domain={[0, 2]}/>
              <Tooltip contentStyle={TipStyle} formatter={v => [v.toFixed(2), 'DSCR']}/>
              <Bar dataKey="dscr" radius={[4,4,0,0]}>
                {dscrData.map((d,i) => <Cell key={i} fill={d.dscr>=1.25 ? GREEN : d.dscr>=1.0 ? AMBER : RED}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Equity by Property */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem'}}>
          <SectionTitle>Equity by Property</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={equityData} margin={{top:0, right:10, left:10, bottom:40}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
              <XAxis dataKey="name" tick={{fill:'#7a95b0', fontSize:11}} angle={-35} textAnchor="end"/>
              <YAxis tick={{fill:'#7a95b0', fontSize:11}} tickFormatter={fmtK}/>
              <Tooltip contentStyle={TipStyle} formatter={v => [fmt$(v), 'Equity']}/>
              <Bar dataKey="equity" fill={AMBER} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Cost */}
        <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem'}}>
          <SectionTitle>Maintenance Cost by Property</SectionTitle>
          {maintData.length === 0 ? (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'220px', color:'var(--text-muted)', fontSize:'0.85rem'}}>No maintenance costs logged yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintData} margin={{top:0, right:10, left:10, bottom:40}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d"/>
                <XAxis dataKey="name" tick={{fill:'#7a95b0', fontSize:11}} angle={-35} textAnchor="end"/>
                <YAxis tick={{fill:'#7a95b0', fontSize:11}} tickFormatter={fmtK}/>
                <Tooltip contentStyle={TipStyle} formatter={v => [fmt$(v), 'Maint. Cost']}/>
                <Bar dataKey="cost" fill={BLUE} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Property Rankings Table */}
      <div style={{background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem', marginTop:'1.5rem'}}>
        <SectionTitle>Property Profitability Rankings</SectionTitle>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.85rem'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Rank','Property','Status','Rent/Mo','Cash Flow','DSCR','Cap Rate','CoC Return','Equity','Value'].map(h => (
                  <th key={h} style={{padding:'0.6rem 0.75rem', textAlign: h==='Rank'||h==='Property'?'left':'right', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-secondary)', fontFamily:'var(--font-display)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfRanked.map((p, i) => {
                const c = p.calc
                return (
                  <tr key={p.id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td style={{padding:'0.7rem 0.75rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)'}}>{i+1}</td>
                    <td style={{padding:'0.7rem 0.75rem', fontWeight:600}}>{p.label}</td>
                    <td style={{padding:'0.7rem 0.75rem'}}>
                      <span style={{padding:'0.15rem 0.5rem', borderRadius:'3px', fontSize:'0.7rem', fontWeight:700,
                        background: p.status==='active'?'var(--green-dim)':'var(--red-dim)',
                        color: p.status==='active'?'var(--green)':'var(--red)'}}>
                        {p.status || 'unknown'}
                      </span>
                    </td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right'}}>{fmt$(p.income?.monthlyRent||0)}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right', color: c.cashFlow>=0?'var(--green)':'var(--red)', fontWeight:700}}>{fmt$(c.cashFlow||0)}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right', color: c.dscr>=1.25?'var(--green)':c.dscr>=1.0?'var(--yellow)':'var(--red)'}}>{(c.dscr||0).toFixed(2)}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right'}}>{c.capRate ? `${c.capRate.toFixed(1)}%` : '—'}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right'}}>{c.cocReturn ? `${c.cocReturn.toFixed(1)}%` : '—'}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right', color:'var(--amber)', fontWeight:700}}>{fmt$(c.equity||0)}</td>
                    <td style={{padding:'0.7rem 0.75rem', textAlign:'right'}}>{fmt$(p.currentValue||0)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
