import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react'
import Modal from '../components/Modal'
import ServiceForm from '../components/ServiceForm'
import { getServices, getVehicle, deleteService } from '../api'

export default function VehiclePage({ activeVehicle, onRefresh }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [showAddService, setShowAddService] = useState(false)
  const [editService, setEditService] = useState(null)
  const [vehicle, setVehicle] = useState(null)

  const vehicleId = id || activeVehicle?.id

  const loadData = async () => {
    if (!vehicleId) return
    const [servicesData, vehicleData] = await Promise.all([
      getServices(vehicleId),
      getVehicle(vehicleId)
    ])
    setServices(servicesData)
    setVehicle(vehicleData)
  }

  useEffect(() => { loadData() }, [vehicleId])

  const handleDelete = async (serviceId) => {
    if (confirm('Sigur vrei să ștergi această intervenție?')) {
      await deleteService(serviceId)
      loadData()
    }
  }

  if (!vehicleId) return <div className="empty-state"><p>Selectează o mașină</p></div>

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Istoric intervenții {vehicle?.name ? `- ${vehicle.name}` : ''}
        </h2>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <h3>Nicio intervenție încă</h3>
          <p>Adaugă prima intervenție pentru această mașină.</p>
        </div>
      ) : (
        services.map(s => (
          <div key={s.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="card-icon">{s.category_icon || '🔧'}</span>
                <div>
                  <div className="card-title" style={{ fontSize: '0.95rem' }}>{s.title}</div>
                  <div className="card-subtitle">
                    {s.date} {s.km_at_service ? `· ${s.km_at_service.toLocaleString()} km` : ''}
                  </div>
                </div>
              </div>
              <div className="swipe-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setEditService(s)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {s.location || s.category_name || ''}
              </span>
              {s.cost > 0 && (
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {s.cost.toLocaleString()} {s.currency}
                </span>
              )}
            </div>
            {s.notes && (
              <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {s.notes}
              </div>
            )}
          </div>
        ))
      )}

      <button className="fab" onClick={() => setShowAddService(true)}>
        <Plus size={24} />
      </button>

      {(showAddService || editService) && (
        <Modal
          title={editService ? 'Editează intervenție' : 'Adaugă intervenție'}
          onClose={() => { setShowAddService(false); setEditService(null) }}
        >
          <ServiceForm
            vehicleId={vehicleId}
            service={editService}
            onSave={() => { setShowAddService(false); setEditService(null); loadData(); onRefresh() }}
            onCancel={() => { setShowAddService(false); setEditService(null) }}
          />
        </Modal>
      )}
    </>
  )
}
