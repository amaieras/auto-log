import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Edit2, Bell } from 'lucide-react'
import Modal from '../components/Modal'
import ReminderForm from '../components/ReminderForm'
import { getUpcomingReminders, getReminders, completeReminder, deleteReminder } from '../api'

export default function RemindersPage({ activeVehicle, vehicles }) {
  const [reminders, setReminders] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
  const [showAdd, setShowAdd] = useState(false)
  const [editReminder, setEditReminder] = useState(null)
  const [viewMode, setViewMode] = useState('all-vehicles') // 'all-vehicles', 'current'

  const loadReminders = async () => {
    if (viewMode === 'all-vehicles') {
      const data = await getUpcomingReminders()
      setReminders(data)
    } else if (activeVehicle) {
      const data = await getReminders(activeVehicle.id)
      setReminders(data.map(r => {
        let status = 'upcoming'
        if (r.is_completed) status = 'completed'
        else if (r.due_date && r.due_date <= new Date().toISOString().split('T')[0]) status = 'overdue'
        else if (r.due_km && activeVehicle.current_km && r.due_km <= activeVehicle.current_km) status = 'overdue'
        return { ...r, status, vehicle_name: activeVehicle.name }
      }))
    }
  }

  useEffect(() => { loadReminders() }, [activeVehicle, viewMode])

  const handleComplete = async (id) => {
    await completeReminder(id)
    loadReminders()
  }

  const handleDelete = async (id) => {
    if (confirm('Sigur vrei să ștergi acest reminder?')) {
      await deleteReminder(id)
      loadReminders()
    }
  }

  const filtered = reminders.filter(r => {
    if (filter === 'active') return r.status !== 'completed'
    if (filter === 'completed') return r.status === 'completed' || r.is_completed
    return true
  })

  const statusLabel = {
    overdue: 'Depășit',
    soon: 'Curând',
    upcoming: 'Viitor',
    completed: 'Completat'
  }

  return (
    <>
      <div className="tabs">
        <button className={`tab ${viewMode === 'all-vehicles' ? 'active' : ''}`} onClick={() => setViewMode('all-vehicles')}>
          Toate mașinile
        </button>
        <button className={`tab ${viewMode === 'current' ? 'active' : ''}`} onClick={() => setViewMode('current')}>
          {activeVehicle?.name || 'Curentă'}
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Toate</button>
        <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
        <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completate</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Bell size={64} />
          <h3>Niciun reminder</h3>
          <p>Adaugă remindere pentru a nu uita de mentenanță.</p>
        </div>
      ) : (
        filtered.map(r => (
          <div key={r.id} className="card" style={{ opacity: r.is_completed ? 0.6 : 1 }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>{r.category_icon || '🔔'}</span>
                <div>
                  <div className="card-title" style={{ fontSize: '0.95rem' }}>{r.title}</div>
                  <div className="card-subtitle">
                    {r.vehicle_name}
                    {r.due_date ? ` · ${r.due_date}` : ''}
                    {r.due_km ? ` · ${r.due_km.toLocaleString()} km` : ''}
                  </div>
                </div>
              </div>
              <span className={`badge badge-${r.is_completed ? 'completed' : r.status}`}>
                {r.is_completed ? 'Completat' : statusLabel[r.status]}
              </span>
            </div>

            {r.is_recurring ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                🔄 Recurent: {r.interval_km ? `la ${r.interval_km.toLocaleString()} km` : ''} {r.interval_months ? `/ ${r.interval_months} luni` : ''}
              </div>
            ) : null}

            {r.description && (
              <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {r.description}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {!r.is_completed && (
                <button className="btn btn-success btn-sm" onClick={() => handleComplete(r.id)}>
                  <Check size={14} /> Completat
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setEditReminder(r)}>
                <Edit2 size={14} />
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleDelete(r.id)} style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}

      {activeVehicle && (
        <button className="fab" onClick={() => setShowAdd(true)}>
          <Plus size={24} />
        </button>
      )}

      {(showAdd || editReminder) && activeVehicle && (
        <Modal
          title={editReminder ? 'Editează reminder' : 'Adaugă reminder'}
          onClose={() => { setShowAdd(false); setEditReminder(null) }}
        >
          <ReminderForm
            vehicleId={activeVehicle.id}
            reminder={editReminder}
            onSave={() => { setShowAdd(false); setEditReminder(null); loadReminders() }}
            onCancel={() => { setShowAdd(false); setEditReminder(null) }}
          />
        </Modal>
      )}
    </>
  )
}
