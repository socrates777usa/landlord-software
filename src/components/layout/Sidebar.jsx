import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, FileText,
  DollarSign, Wrench, BarChart2, Landmark,
  Bell, Settings, Shield, Hammer,
  CreditCard, ArrowRightLeft, TrendingUp
} from 'lucide-react'
import './Sidebar.css'

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
      { to: '/alerts',    icon: Bell,            label: 'Alerts'    },
    ]
  },
  {
    label: 'Portfolio',
    items: [
      { to: '/properties',  icon: Building2, label: 'Properties' },
      { to: '/tenants',     icon: Users,     label: 'Tenants'    },
      { to: '/leases',      icon: FileText,  label: 'Leases'     },
      { to: '/entities',    icon: Landmark,  label: 'Entities'   },
    ]
  },
  {
    label: 'Financials',
    items: [
      { to: '/financials', icon: DollarSign,     label: 'Transactions' },
      { to: '/heloc',      icon: CreditCard,     label: 'Credit Lines'  },
      { to: '/capital',    icon: ArrowRightLeft, label: 'Capital Events'},
      { to: '/insurance',  icon: Shield,         label: 'Insurance'     },
    ]
  },
  {
    label: 'Acquisitions',
    items: [
      { to: '/brrrr',   icon: TrendingUp, label: 'BRRRR Pipeline' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/maintenance', icon: Wrench,  label: 'Maintenance' },
      { to: '/vendors',     icon: Hammer,  label: 'Vendors'     },
    ]
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◈</span>
        <span className="brand-name">ACME</span>
      </div>
      <nav className="sidebar-nav">
        {GROUPS.map(group => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Icon size={15} strokeWidth={1.8}/>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{marginBottom:'0.5rem'}}>
          <Settings size={15} strokeWidth={1.8}/>
          <span>Settings</span>
        </NavLink>
        <span className="version">v0.2.0 — Phase 2</span>
      </div>
    </aside>
  )
}
