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
  '/insurance':   'Insurance',
  '/vendors':     'Vendors',
  '/heloc':       'Credit Lines',
  '/brrrr':       'BRRRR Pipeline',
  '/capital':     'Capital Events',
}

export default function Header() {
  const { pathname } = useLocation()
  // Match exact or prefix
  const title = TITLES[pathname] ||
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k + '/') && k !== '/')?.[1] ||
    'ACME'
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
