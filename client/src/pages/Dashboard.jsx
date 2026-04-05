import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Car, MapPin, Fuel, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import Modal from '../components/Modal'
import VehicleForm from '../components/VehicleForm'
import { getVehicle, getUpcomingReminders } from '../api'

export default function Dashboard({ vehicles, activeVehicle, setActiveVehicle, onRefresh }) {
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [vehicleDetails, setVehicleDetails] = useState(null)
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (activeVehicle) {
      getVehicle(activeVehicle.id).then(setVehicleDetails)
    }
    getUpcomingReminders().then(setUpcomingReminders)
  }, [activeVehicle])

  const overdueCount = upcomingReminders.filter(r => r.status === 'overdue').length
  const soonCount = upcomingReminders.filter(r => r.status === 'soon').length

  return (
    <>
      {/* Alert banner */}
      {overdueCount > 0 && (
        <div className="card" style={{ background: '#fef2f2', borderLeft: '4px solid var(--danger)' }} onClick={() => navigate('/reminders')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="var(--danger)" />
            <div>
              <strong style={{ color: 'var(--danger)' }}>{overdueCount} remindere depășite!</strong>
              <div className="card-subtitle">Apasă pentru a vedea detalii</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--danger)' }} />
          </div>
        </div>
      )}

      {soonCount > 0 && overdueCount === 0 && (
        <div className="card" style={{ background: '#fffbeb', borderLeft: '4px solid var(--warning)' }} onClick={() => navigate('/reminders')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <div>
              <strong style={{ color: '#d97706' }}>{soonCount} remindere se apropie</strong>
              <div className="card-subtitle">Apasă pentru a vedea detalii</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: '#d97706' }} />
          </div>
        </div>
      )}

      {/* Active vehicle card */}
      {vehicleDetails && (
        <div className="card" onClick={() => navigate(`/vehicle/${activeVehicle.id}`)} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Car size={18} />
                {vehicleDetails.name}
              </div>
              <div className="card-subtitle">
                {[vehicleDetails.make, vehicleDetails.model, vehicleDetails.year].filter(Boolean).join(' · ')}
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-secondary)" />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {vehicleDetails.license_plate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <MapPin size={14} /> {vehicleDetails.license_plate}
              </div>
            )}
            {vehicleDetails.fuel_type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Fuel size={14} /> {vehicleDetails.fuel_type}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Calendar size={14} /> {vehicleDetails.current_km?.toLocaleString()} km
            </div>
          </div>

          <div className="card-stats">
            <div className="stat">
              <div className="stat-value">{vehicleDetails.service_count}</div>
              <div className="stat-label">Intervenții</div>
            </div>
            <div className="stat">
              <div className="stat-value">{vehicleDetails.total_cost?.toLocaleString()} RON</div>
              <div className="stat-label">Cost total</div>
            </div>
            <div className="stat">
              <div className="stat-value">{vehicleDetails.pending_reminders}</div>
              <div className="stat-label">Remindere</div>
            </div>
          </div>
        </div>
      )}

      {/* Other vehicles */}
      {vehicles.filter(v => v.id !== activeVehicle?.id).map(v => (
        <div key={v.id} className="card" onClick={() => { setActiveVehicle(v); }} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Car size={16} /> {v.name}</div>
              <div className="card-subtitle">
                {[v.make, v.model, v.year].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Upcoming reminders preview */}
      {upcomingReminders.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '20px 0 8px', color: 'var(--text-secondary)' }}>
            Remindere apropiate
          </h3>
          {upcomingReminders.slice(0, 3).map(r => (
            <div key={r.id} className="card" onClick={() => navigate('/reminders')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>{r.category_icon || '🔧'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</div>
                  <div className="card-subtitle">{r.vehicle_name} · {r.due_date || `${r.due_km?.toLocaleString()} km`}</div>
                </div>
                <span className={`badge badge-${r.status}`}>{
                  r.status === 'overdue' ? 'Depășit' : r.status === 'soon' ? 'Curând' : 'Viitor'
                }</span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Empty state */}
      {vehicles.length === 0 && (
        <div className="empty-state">
          <Car size={64} />
          <h3>Bine ai venit la AutoLog!</h3>
          <p>Adaugă prima ta mașină pentru a începe să urmărești mentenanța.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddVehicle(true)}
            style={{ marginTop: 16 }}
          >
            <Plus size={18} /> Adaugă mașină
          </button>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddVehicle(true)}>
        <Plus size={24} />
      </button>

      {showAddVehicle && (
        <Modal title="Adaugă mașină" onClose={() => setShowAddVehicle(false)}>
          <VehicleForm
            onSave={() => { setShowAddVehicle(false); onRefresh() }}
            onCancel={() => setShowAddVehicle(false)}
          />
        </Modal>
      )}
    </>
  )
}
