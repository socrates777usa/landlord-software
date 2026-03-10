import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, FileText,
  DollarSign, Wrench, BarChart2, Landmark,
  Bell, Settings
} from 'lucide-react'
import './Sidebar.css'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/properties',  icon: Building2,       label: 'Properties'  },
  { to: '/tenants',     icon: Users,           label: 'Tenants'     },
  { to: '/leases',      icon: FileText,        label: 'Leases'      },
  { to: '/financials',  icon: DollarSign,      label: 'Financials'  },
  { to: '/maintenance', icon: Wrench,          label: 'Maintenance' },
  { to: '/analytics',   icon: BarChart2,       label: 'Analytics'   },
  { to: '/entities',    icon: Landmark,        label: 'Entities'    },
  { to: '/alerts',      icon: Bell,            label: 'Alerts'      },
  { to: '/settings',    icon: Settings,        label: 'Settings'    },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◈</span>
        <span className="brand-name">ACME</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="version">v0.1.0 — Phase 2</span>
      </div>
    </aside>
  )
}
