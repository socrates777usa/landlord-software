import { useState, useEffect } from 'react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { calcProperty } from '../../core/calculations/property.js'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid
} from 'recharts'

const fmt$ = n => `$${Math.abs(Number(n)).toLocaleString()}${Number(n) < 0 ? ' (neg)' : ''}`
const fmtSimple = n => `$${Number(n).toLocaleString()}`
const fmtK = n => {
  const v = Number(n)
  if (Math.abs(v) >= 1000) return `${v < 0 ? '-' : ''}$${(Math.abs(v)/1000).toFixed(0)}K`
  return `${v < 0 ? '-' : ''}$${Math.abs(v).toFixed(0)}`
}

// Carbon Ledger palette — matches iOS system colors used in index.css
const AMBER  = '#ffd60a'
const GREEN  = '#30d158'
const RED    = '#ff453a'
const BLUE   = '#0a84ff'
const INDIGO = '#635BFF'

const TipStyle = {
  background: '#1c1c1e',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#ededed',
  fontSize: '12px',
  fontFamily: "'Inter', sans-serif",
  borderRadius: '6px',
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
}
// Axis tick color — Carbon Ledger muted
const TICK = { fill: '#48484a', fontSize: 10, fontFamily: 'Inter, sans-serif' }
const GRID = 'rgba(255,255,255,0.05)'

export default function Analytics() {
  const [props, setProps]     = useState([])
  const [tenants, setTenants] = useState([])
  const [maint, setMaint]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAll(STORES.PROPERTIES),
      getAll(STORES.TENANTS),
      getAll(STORES.MAINTENANCE)
    ]).then(([p, t, m]) => {
      setProps(p); setTenants(t); setMaint(m); setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:'60vh',color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:'12px',letterSpacing:'0.04em'}}>
      Loading analytics...
    </div>
  )

  const propData = props.map(p => {
    const c = calcProperty(p)
    const label = p.nickname || p.address?.street || p.id
    const tenantCount = tenants.filter(t => t.propertyId === p.id && t.status === 'active').length
    const maintCost   = maint.filter(m => m.propertyId === p.id).reduce((s,m) => s + Number(m.cost||0), 0)
    return { ...p, label, calc: c, tenantCount, maintCost }
  })

  // FIX: use cashFlowMonthly not cashFlow
  const cfRanked = [...propData].sort((a,b) => (b.calc.cashFlowMonthly||0) - (a.calc.cashFlowMonthly||0))
  const cfData   = cfRanked.map(p => ({ name: p.label.slice(0,12), cf: Math.round(p.calc.cashFlowMonthly || 0) }))
  const dscrData = propData.map(p => ({ name: p.label.slice(0,12), dscr: Number((p.calc.dscr||0).toFixed(2)) }))
  const equityData = propData.map(p => ({ name: p.label.slice(0,12), equity: Math.round(p.calc.equity || 0) }))
  const maintData  = propData.filter(p => p.maintCost > 0).map(p => ({ name: p.label.slice(0,12), cost: p.maintCost }))

  const totalIncome = propData.reduce((s,p) => s + (p.income?.monthlyRent||0), 0)
  const totalDebt   = propData.reduce((s,p) => s + (p.calc.monthlyPayment||0), 0)
  const totalCF     = propData.reduce((s,p) => s + (p.calc.cashFlowMonthly||0), 0)
  const totalEquity = propData.reduce((s,p) => s + (p.calc.equity||0), 0)
  const totalValue  = propData.reduce((s,p) => s + (p.currentValue||0), 0)
  const occupied    = propData.filter(p => p.status === 'active').length
  const occPct      = props.length ? Math.round((occupied / props.length) * 100) : 0
  const validDSCR   = propData.filter(p => p.calc.dscr !== null)
  const avgDscr     = validDSCR.length ? (validDSCR.reduce((s,p)=>s+(p.calc.dscr||0),0)/validDSCR.length).toFixed(2) : '—'
  const vacantCount = propData.filter(p => p.status === 'vacant').length

  const KPI = ({ label, value, color }) => (
    <div style={{
      background:'var(--bg-surface)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:'1rem 1.2rem',
      boxShadow:'var(--shadow-sm)'
    }}>
      <div style={{fontSize:'0.66rem',color:'var(--text-muted)',textTransform:'uppercase',
        letterSpacing:'0.12em',marginBottom:'0.4rem',fontFamily:'var(--font-display)',fontWeight:700}}>{label}</div>
      <div style={{fontSize:'1.4rem',fontWeight:700,color:color||'var(--text-primary)',
        fontFamily:'var(--font-mono)',letterSpacing:'-0.02em'}}>{value}</div>
    </div>
  )

  const ChartCard = ({ title, children }) => (
    <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)',padding:'1.25rem',boxShadow:'var(--shadow-sm)'}}>
      <div style={{fontSize:'0.66rem',textTransform:'uppercase',letterSpacing:'0.12em',
        color:'var(--amber)',fontWeight:700,marginBottom:'1rem',fontFamily:'var(--font-display)',
        borderBottom:'1px solid rgba(245,158,11,0.15)',paddingBottom:'0.6rem'}}>{title}</div>
      {children}
    </div>
  )

  const noData = (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:200,color:'var(--text-muted)',fontSize:'0.8rem',fontFamily:'var(--font-mono)'}}>
      No data yet
    </div>
  )

  return (
    <div style={{padding:'1.75rem 2rem',maxWidth:'1400px',margin:'0 auto'}}>
      <div style={{marginBottom:'1.75rem'}}>
        <h1 style={{fontSize:'1.4rem',fontWeight:700,fontFamily:'var(--font-display)',
          letterSpacing:'-0.01em',color:'var(--text-primary)',margin:0}}>Analytics</h1>
        <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:'0.3rem'}}>
          {props.length} properties · {tenants.filter(t=>t.status==='active').length} active tenants
        </p>
      </div>

      {/* KPI Row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',
        gap:'0.85rem',marginBottom:'1.75rem'}}>
        <KPI label="Monthly Income"  value={fmtK(totalIncome)} color={GREEN}/>
        <KPI label="Monthly Debt"    value={fmtK(totalDebt)}   color={RED}/>
        <KPI label="Net Cash Flow"   value={fmtK(totalCF)}     color={totalCF>=0?GREEN:RED}/>
        <KPI label="Total Equity"    value={fmtK(totalEquity)} color={AMBER}/>
        <KPI label="Portfolio Value" value={fmtK(totalValue)}/>
        <KPI label="Occupancy"       value={`${occPct}%`}      color={occPct>=90?GREEN:occPct>=70?AMBER:RED}/>
        <KPI label="Avg DSCR"        value={avgDscr}           color={Number(avgDscr)>=1.25?GREEN:Number(avgDscr)>=1.0?AMBER:RED}/>
        <KPI label="Vacant Units"    value={vacantCount}       color={vacantCount>0?RED:GREEN}/>
      </div>

      {/* Charts 2x2 */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.25rem'}}>

        <ChartCard title="Monthly Cash Flow by Property">
          {cfData.length === 0 ? noData : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cfData} margin={{top:4,right:8,left:8,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'#3d4a6b',fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
                <YAxis tick={{fill:'#3d4a6b',fontSize:10}} tickFormatter={n=>n>=0?`$${n}`:`-$${Math.abs(n)}`}/>
                <Tooltip contentStyle={TipStyle} formatter={v=>[`$${Number(v).toLocaleString()}/mo`,'Cash Flow']}/>
                <Bar dataKey="cf" radius={[4,4,0,0]}>
                  {cfData.map((d,i) => <Cell key={i} fill={d.cf>=0?GREEN:RED}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="DSCR by Property  (≥ 1.25 = Healthy)">
          {dscrData.length === 0 ? noData : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dscrData} margin={{top:4,right:8,left:0,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'#3d4a6b',fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
                <YAxis tick={{fill:'#3d4a6b',fontSize:10}} domain={[0,'auto']}/>
                <Tooltip contentStyle={TipStyle} formatter={v=>[Number(v).toFixed(2),'DSCR']}/>
                <Bar dataKey="dscr" radius={[4,4,0,0]}>
                  {dscrData.map((d,i)=><Cell key={i} fill={d.dscr>=1.25?GREEN:d.dscr>=1.0?AMBER:RED}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Equity by Property">
          {equityData.length === 0 ? noData : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={equityData} margin={{top:4,right:8,left:8,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'#3d4a6b',fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
                <YAxis tick={{fill:'#3d4a6b',fontSize:10}} tickFormatter={n=>`$${(n/1000).toFixed(0)}K`}/>
                <Tooltip contentStyle={TipStyle} formatter={v=>[`$${Number(v).toLocaleString()}`,'Equity']}/>
                <Bar dataKey="equity" fill={AMBER} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Maintenance Cost by Property">
          {maintData.length === 0 ? noData : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintData} margin={{top:4,right:8,left:8,bottom:50}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'#3d4a6b',fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
                <YAxis tick={{fill:'#3d4a6b',fontSize:10}} tickFormatter={n=>`$${n}`}/>
                <Tooltip contentStyle={TipStyle} formatter={v=>[`$${Number(v).toLocaleString()}`,'Maint.']}/>
                <Bar dataKey="cost" fill={BLUE} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Rankings Table */}
      <div style={{background:'var(--bg-surface)',border:'1px solid var(--border)',
        borderRadius:'var(--radius-lg)',padding:'1.25rem',boxShadow:'var(--shadow-sm)'}}>
        <div style={{fontSize:'0.66rem',textTransform:'uppercase',letterSpacing:'0.12em',
          color:'var(--amber)',fontWeight:700,marginBottom:'1rem',fontFamily:'var(--font-display)',
          borderBottom:'1px solid rgba(245,158,11,0.15)',paddingBottom:'0.6rem'}}>
          Property Profitability Rankings
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.84rem'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['#','Property','Status','Rent/Mo','Cash Flow','DSCR','Cap Rate','CoC','Equity','Value'].map(h=>(
                  <th key={h} style={{padding:'0.55rem 0.75rem',textAlign:h==='#'||h==='Property'?'left':'right',
                    fontSize:'0.66rem',textTransform:'uppercase',letterSpacing:'0.1em',
                    color:'var(--text-muted)',fontFamily:'var(--font-display)',fontWeight:700,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfRanked.map((p,i) => {
                const c = p.calc
                const cf = c.cashFlowMonthly || 0
                return (
                  <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'0.65rem 0.75rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:'0.75rem'}}>{i+1}</td>
                    <td style={{padding:'0.65rem 0.75rem',fontWeight:600,color:'var(--text-primary)'}}>{p.label}</td>
                    <td style={{padding:'0.65rem 0.75rem'}}>
                      <span style={{padding:'0.15rem 0.55rem',borderRadius:'20px',fontSize:'0.66rem',fontWeight:700,
                        background:p.status==='active'?'var(--green-dim)':'p.status==="vacant"?var(--red-dim):"rgba(255,255,255,0.05)"',
                        color:p.status==='active'?'#34d399':p.status==='vacant'?'#fb7185':'var(--text-muted)',
                        border:`1px solid ${p.status==='active'?'rgba(16,185,129,0.2)':p.status==='vacant'?'rgba(244,63,94,0.2)':'var(--border)'}`
                      }}>{p.status||'unknown'}</span>
                    </td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem'}}>{fmtSimple(p.income?.monthlyRent||0)}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',
                      color:cf>=0?'var(--green)':'var(--red)',fontWeight:700}}>{cf>=0?'+':''}{fmtSimple(cf)}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',
                      color:c.dscr>=1.25?'var(--green)':c.dscr>=1.0?'var(--yellow)':'var(--red)',fontWeight:600}}>
                      {c.dscr?c.dscr.toFixed(2):'—'}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--text-secondary)'}}>
                      {c.capRate?`${c.capRate.toFixed(1)}%`:'—'}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--text-secondary)'}}>
                      {c.cocReturn?`${c.cocReturn.toFixed(1)}%`:'—'}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--amber)',fontWeight:700}}>
                      {fmtSimple(c.equity||0)}</td>
                    <td style={{padding:'0.65rem 0.75rem',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--text-secondary)'}}>
                      {fmtSimple(p.currentValue||0)}</td>
                  </tr>
                )
              })}
              {cfRanked.length === 0 && (
                <tr><td colSpan={10} style={{padding:'3rem',textAlign:'center',color:'var(--text-muted)',fontFamily:'var(--font-mono)',fontSize:'0.8rem'}}>
                  No properties to rank yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
