import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'

import Dashboard      from './pages/Dashboard/index.jsx'

import PropertyList   from './pages/Properties/PropertyList.jsx'
import PropertyForm   from './pages/Properties/PropertyForm.jsx'

import TenantList     from './pages/Tenants/TenantList.jsx'
import TenantForm     from './pages/Tenants/TenantForm.jsx'

import LeaseList      from './pages/Leases/LeaseList.jsx'
import LeaseForm      from './pages/Leases/LeaseForm.jsx'

import FinancialList  from './pages/Financials/FinancialList.jsx'
import FinancialForm  from './pages/Financials/FinancialForm.jsx'

import MaintenanceList from './pages/Maintenance/MaintenanceList.jsx'
import MaintenanceForm from './pages/Maintenance/MaintenanceForm.jsx'

import EntityList     from './pages/Entities/EntityList.jsx'
import EntityForm     from './pages/Entities/EntityForm.jsx'

import Analytics      from './pages/Analytics/index.jsx'
import Alerts         from './pages/Alerts/index.jsx'
import Settings       from './pages/Settings/index.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        {/* Dashboard */}
        <Route path="/"                    element={<Dashboard />} />

        {/* Properties */}
        <Route path="/properties"          element={<PropertyList />} />
        <Route path="/properties/new"      element={<PropertyForm />} />
        <Route path="/properties/:id"      element={<PropertyForm />} />

        {/* Tenants */}
        <Route path="/tenants"             element={<TenantList />} />
        <Route path="/tenants/new"         element={<TenantForm />} />
        <Route path="/tenants/:id"         element={<TenantForm />} />

        {/* Leases */}
        <Route path="/leases"              element={<LeaseList />} />
        <Route path="/leases/new"          element={<LeaseForm />} />
        <Route path="/leases/:id"          element={<LeaseForm />} />

        {/* Financials */}
        <Route path="/financials"          element={<FinancialList />} />
        <Route path="/financials/new"      element={<FinancialForm />} />
        <Route path="/financials/:id"      element={<FinancialForm />} />

        {/* Maintenance */}
        <Route path="/maintenance"         element={<MaintenanceList />} />
        <Route path="/maintenance/new"     element={<MaintenanceForm />} />
        <Route path="/maintenance/:id"     element={<MaintenanceForm />} />

        {/* Entities */}
        <Route path="/entities"            element={<EntityList />} />
        <Route path="/entities/new"        element={<EntityForm />} />
        <Route path="/entities/:id"        element={<EntityForm />} />

        {/* Read-only / config pages */}
        <Route path="/analytics"           element={<Analytics />} />
        <Route path="/alerts"              element={<Alerts />} />
        <Route path="/settings"            element={<Settings />} />

        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
