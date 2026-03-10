import { useLocation } from 'react-router-dom'
import './Header.css'

const TITLES = {
  '/':            'Dashboard',
  '/properties':  'Properties',
  '/tenants':     'Tenants',
  '/leases':      'Leases',
  '/financials':  'Financials',
  '/maintenance': 'Maintenance',
  '/analytics':   'Analytics',
  '/entities':    'Entities',
  '/alerts':      'Alerts',
  '/settings':    'Settings',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'ACME'
  const today = new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-right">
        <span className="header-date">{today}</span>
        <div className="header-dot" title="Local storage — data on this device" />
      </div>
    </header>
  )
}
