import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Car, Bell, BarChart3, Settings, Wrench } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import VehiclePage from './pages/VehiclePage'
import RemindersPage from './pages/RemindersPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import { getVehicles } from './api'

export default function App() {
  const [vehicles, setVehicles] = useState([])
  const [activeVehicle, setActiveVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const loadVehicles = async () => {
    try {
      const data = await getVehicles()
      setVehicles(data)
      if (data.length > 0 && !activeVehicle) {
        setActiveVehicle(data[0])
      }
      if (activeVehicle) {
        const updated = data.find(v => v.id === activeVehicle.id)
        if (updated) setActiveVehicle(updated)
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVehicles() }, [])

  const tabs = [
    { path: '/', icon: Car, label: 'Mașini' },
    { path: '/reminders', icon: Bell, label: 'Remindere' },
    { path: '/stats', icon: BarChart3, label: 'Statistici' },
    { path: '/settings', icon: Settings, label: 'Setări' },
  ]

  const currentTab = tabs.find(t => t.path === location.pathname) || tabs[0]

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <h1>
            <Wrench size={20} />
            AutoLog
          </h1>
          {vehicles.length > 0 && (
            <select
              className="vehicle-selector"
              value={activeVehicle?.id || ''}
              onChange={(e) => {
                const v = vehicles.find(v => v.id === Number(e.target.value))
                setActiveVehicle(v)
              }}
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Dashboard
                vehicles={vehicles}
                activeVehicle={activeVehicle}
                setActiveVehicle={setActiveVehicle}
                onRefresh={loadVehicles}
              />
            } />
            <Route path="/vehicle/:id" element={
              <VehiclePage
                activeVehicle={activeVehicle}
                onRefresh={loadVehicles}
              />
            } />
            <Route path="/reminders" element={
              <RemindersPage
                activeVehicle={activeVehicle}
                vehicles={vehicles}
                onRefresh={loadVehicles}
              />
            } />
            <Route path="/stats" element={
              <StatsPage activeVehicle={activeVehicle} />
            } />
            <Route path="/settings" element={
              <SettingsPage
                vehicles={vehicles}
                onRefresh={loadVehicles}
              />
            } />
          </Routes>
        )}
      </main>

      <nav className="bottom-nav">
        {tabs.map(tab => (
          <button
            key={tab.path}
            className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.icon size={22} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
