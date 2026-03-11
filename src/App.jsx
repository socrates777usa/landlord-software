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

import InsuranceList  from './pages/Insurance/InsuranceList.jsx'
import InsuranceForm  from './pages/Insurance/InsuranceForm.jsx'

import VendorList     from './pages/Vendors/VendorList.jsx'
import VendorForm     from './pages/Vendors/VendorForm.jsx'

import HelocList      from './pages/Heloc/HelocList.jsx'
import HelocForm      from './pages/Heloc/HelocForm.jsx'

import BrrrrList      from './pages/Brrrr/BrrrrList.jsx'
import BrrrrForm      from './pages/Brrrr/BrrrrForm.jsx'

import CapitalList    from './pages/CapitalEvents/CapitalList.jsx'
import CapitalForm    from './pages/CapitalEvents/CapitalForm.jsx'

import Analytics      from './pages/Analytics/index.jsx'
import Alerts         from './pages/Alerts/index.jsx'
import Settings       from './pages/Settings/index.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/"                    element={<Dashboard />} />

        <Route path="/properties"          element={<PropertyList />} />
        <Route path="/properties/new"      element={<PropertyForm />} />
        <Route path="/properties/:id"      element={<PropertyForm />} />

        <Route path="/tenants"             element={<TenantList />} />
        <Route path="/tenants/new"         element={<TenantForm />} />
        <Route path="/tenants/:id"         element={<TenantForm />} />

        <Route path="/leases"              element={<LeaseList />} />
        <Route path="/leases/new"          element={<LeaseForm />} />
        <Route path="/leases/:id"          element={<LeaseForm />} />

        <Route path="/financials"          element={<FinancialList />} />
        <Route path="/financials/new"      element={<FinancialForm />} />
        <Route path="/financials/:id"      element={<FinancialForm />} />

        <Route path="/maintenance"         element={<MaintenanceList />} />
        <Route path="/maintenance/new"     element={<MaintenanceForm />} />
        <Route path="/maintenance/:id"     element={<MaintenanceForm />} />

        <Route path="/entities"            element={<EntityList />} />
        <Route path="/entities/new"        element={<EntityForm />} />
        <Route path="/entities/:id"        element={<EntityForm />} />

        <Route path="/insurance"           element={<InsuranceList />} />
        <Route path="/insurance/new"       element={<InsuranceForm />} />
        <Route path="/insurance/:id"       element={<InsuranceForm />} />

        <Route path="/vendors"             element={<VendorList />} />
        <Route path="/vendors/new"         element={<VendorForm />} />
        <Route path="/vendors/:id"         element={<VendorForm />} />

        <Route path="/heloc"               element={<HelocList />} />
        <Route path="/heloc/new"           element={<HelocForm />} />
        <Route path="/heloc/:id"           element={<HelocForm />} />

        <Route path="/brrrr"               element={<BrrrrList />} />
        <Route path="/brrrr/new"           element={<BrrrrForm />} />
        <Route path="/brrrr/:id"           element={<BrrrrForm />} />

        <Route path="/capital"             element={<CapitalList />} />
        <Route path="/capital/new"         element={<CapitalForm />} />
        <Route path="/capital/:id"         element={<CapitalForm />} />

        <Route path="/analytics"           element={<Analytics />} />
        <Route path="/alerts"              element={<Alerts />} />
        <Route path="/settings"            element={<Settings />} />

        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
