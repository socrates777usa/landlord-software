import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import './AppShell.css'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
