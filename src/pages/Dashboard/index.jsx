import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Home, Users, DollarSign, Activity } from 'lucide-react'
import { getAll } from '../../core/storage/adapter.js'
import { STORES } from '../../core/db/schema.js'
import { calcPortfolio } from '../../core/calculations/property.js'
import { seedSampleData } from '../../core/seed/sampleData.js'
import './Dashboard.css'

function fmt$(n) {
  if (n == null) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(2)}M`
  if (abs >= 1000)    return `${sign}$${(abs/1000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}
function fmtPct(n) { return n == null ? '—' : `${n.toFixed(1)}%` }

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null)
  const [maintenance, setMaintenance] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    let props = await getAll(STORES.PROPERTIES)
    // Seed on first load if empty
    if (!props.length) {
      await seedSampleData()
      props = await getAll(STORES.PROPERTIES)
    }
    const [mx, tx] = await Promise.all([
      getAll(STORES.MAINTENANCE),
      getAll(STORES.TENANTS),
    ])
    setPortfolio(calcPortfolio(props))
    setMaintenance(mx)
    setTenants(tx)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <div className="dash-loading">Loading portfolio...</div>
  if (!portfolio) return null

  const { totalIncome, totalDebt, totalCashFlow, totalEquity,
          totalValue, totalBalance, avgDSCR, occupied, vacant,
          renovation, properties } = portfolio

  const totalUnits  = properties.length
  const occupancy   = totalUnits ? ((occupied / totalUnits) * 100) : 0
  const totalLTV    = totalValue ? ((totalBalance / totalValue) * 100) : 0
  const openMaint   = maintenance.filter(m => m.status !== 'closed').length
  const expiringLeases = tenants.filter(t => {
    if (!t.leaseEndDate) return false
    const daysLeft = (new Date(t.leaseEndDate) - new Date()) / 86400000
    return daysLeft >= 0 && daysLeft <= 90
  })
  const cashFlowPositive = totalCashFlow >= 0

  return (
    <div className="dashboard">
      {/* KPI Grid */}
      <section className="kpi-grid">
        <KpiCard label="Total Units"     value={totalUnits}           sub={`${occupied} occupied · ${vacant} vacant`} icon={<Home size={15}/>} />
        <KpiCard label="Monthly Income"  value={fmt$(totalIncome)}    sub="gross collected"      icon={<DollarSign size={15}/>} accent="green" />
        <KpiCard label="Monthly Debt"    value={fmt$(totalDebt)}      sub="all debt service"     icon={<Activity size={15}/>}  accent="red" />
        <KpiCard label="Net Cash Flow"   value={fmt$(totalCashFlow)}  sub="income minus debt"    icon={<TrendingUp size={15}/>} accent={cashFlowPositive?'green':'red'} mono />
        <KpiCard label="Total Equity"    value={fmt$(totalEquity)}    sub={`${fmtPct(100-totalLTV)} equity · ${fmtPct(totalLTV)} LTV`} icon={<TrendingUp size={15}/>} accent="amber" />
        <KpiCard label="Portfolio Value" value={fmt$(totalValue)}     sub="current market value" icon={<Home size={15}/>} />
        <KpiCard label="Avg DSCR"        value={avgDSCR ?? '—'}       sub="portfolio average"    icon={<Activity size={15}/>} accent={avgDSCR >= 1.25 ? 'green' : avgDSCR >= 1.0 ? 'yellow' : 'red'} mono />
        <KpiCard label="Occupancy"       value={fmtPct(occupancy)}    sub={`${totalUnits} total units`} icon={<Users size={15}/>} accent={occupancy >= 90 ? 'green' : 'yellow'} />
      </section>

      <div className="dash-lower">
        {/* Alerts */}
        <section className="alerts-panel">
          <h2 className="section-title">Active Alerts</h2>
          {!vacant && !openMaint && !expiringLeases.length
            ? <div className="alert-empty">No active alerts — portfolio is healthy ✓</div>
            : <>
                {vacant > 0 && <AlertRow icon="🔴" label={`${vacant} vacant unit${vacant>1?'s':''}`} sub="No active tenant assigned" onClick={()=>navigate('/properties')} />}
                {openMaint > 0 && <AlertRow icon="🟡" label={`${openMaint} open maintenance issue${openMaint>1?'s':''}`} sub="Work orders awaiting resolution" onClick={()=>navigate('/maintenance')} />}
                {expiringLeases.map(t => {
                  const days = Math.ceil((new Date(t.leaseEndDate) - new Date()) / 86400000)
                  return <AlertRow key={t.id} icon="🟠" label={`${t.firstName} ${t.lastName} — lease expires in ${days}d`} sub={t.leaseEndDate} onClick={()=>navigate('/leases')} />
                })}
              </>
          }
        </section>

        {/* Property Snapshot */}
        <section className="prop-snapshot">
          <h2 className="section-title">Properties</h2>
          <div className="prop-table">
            <div className="prop-thead">
              <span>Property</span><span>Status</span><span>Rent</span><span>Cash Flow</span><span>DSCR</span>
            </div>
            {properties.map(p => {
              const { cashFlowMonthly, dscr } = p.c
              const statusColor = p.status === 'active' ? 'green' : p.status === 'vacant' ? 'red' : 'yellow'
              return (
                <div key={p.id} className="prop-row" onClick={()=>navigate('/properties')}>
                  <span className="prop-nick">{p.nickname || p.address}</span>
                  <span className={`status-badge ${statusColor}`}>{p.status}</span>
                  <span className="mono">{fmt$(p.income?.monthlyRent)}</span>
                  <span className={`mono ${cashFlowMonthly >= 0 ? 'text-green' : 'text-red'}`}>{fmt$(cashFlowMonthly)}</span>
                  <span className={`mono ${dscr >= 1.25 ? 'text-green' : dscr >= 1.0 ? 'text-yellow' : 'text-red'}`}>{dscr ?? '—'}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, icon, accent, mono }) {
  return (
    <div className={`kpi-card ${accent || ''}`}>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className={`kpi-value ${mono ? 'mono' : ''}`}>{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

function AlertRow({ icon, label, sub, onClick }) {
  return (
    <div className="alert-row" onClick={onClick}>
      <span className="alert-icon">{icon}</span>
      <div>
        <div className="alert-label">{label}</div>
        <div className="alert-sub">{sub}</div>
      </div>
    </div>
  )
}
