import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard    from './pages/Dashboard/index.jsx'
import Properties   from './pages/Properties/index.jsx'
import Tenants      from './pages/Tenants/index.jsx'
import Leases       from './pages/Leases/index.jsx'
import Financials   from './pages/Financials/index.jsx'
import Maintenance  from './pages/Maintenance/index.jsx'
import Analytics    from './pages/Analytics/index.jsx'
import Entities     from './pages/Entities/index.jsx'
import Alerts       from './pages/Alerts/index.jsx'
import Settings     from './pages/Settings/index.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/properties"  element={<Properties />} />
        <Route path="/tenants"     element={<Tenants />} />
        <Route path="/leases"      element={<Leases />} />
        <Route path="/financials"  element={<Financials />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/analytics"   element={<Analytics />} />
        <Route path="/entities"    element={<Entities />} />
        <Route path="/alerts"      element={<Alerts />} />
        <Route path="/settings"    element={<Settings />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
