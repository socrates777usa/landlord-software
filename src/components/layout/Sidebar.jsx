import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, FileText, DollarSign, Wrench,
  Shield, Hammer, CreditCard, TrendingUp, ArrowRightLeft,
  BarChart2, Landmark, Bell, Settings
} from 'lucide-react'
import './Sidebar.css'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
      { to: '/analytics',   icon: BarChart2,       label: 'Analytics'   },
      { to: '/alerts',      icon: Bell,            label: 'Alerts'      },
    ]
  },
  {
    label: 'Portfolio',
    items: [
      { to: '/properties',  icon: Building2,       label: 'Properties'  },
      { to: '/tenants',     icon: Users,           label: 'Tenants'     },
      { to: '/leases',      icon: FileText,        label: 'Leases'      },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/financials',  icon: DollarSign,      label: 'Financials'  },
      { to: '/heloc',       icon: CreditCard,      label: 'Credit Lines'},
      { to: '/capital',     icon: ArrowRightLeft,  label: 'Capital'     },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/maintenance', icon: Wrench,          label: 'Maintenance' },
      { to: '/insurance',   icon: Shield,          label: 'Insurance'   },
      { to: '/vendors',     icon: Hammer,          label: 'Vendors'     },
    ]
  },
  {
    label: 'Strategy',
    items: [
      { to: '/brrrr',       icon: TrendingUp,      label: 'BRRRR Pipeline'},
      { to: '/entities',    icon: Landmark,        label: 'Entities'    },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/settings',    icon: Settings,        label: 'Settings'    },
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
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="nav-group">
            <div className="nav-group-label">{group.label}</div>
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="version">v0.1.0 — Phase 2</span>
      </div>
    </aside>
  )
}
