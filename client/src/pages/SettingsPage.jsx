import { useState } from 'react'
import { Edit2, Trash2, Car, Info } from 'lucide-react'
import Modal from '../components/Modal'
import VehicleForm from '../components/VehicleForm'
import { deleteVehicle } from '../api'

export default function SettingsPage({ vehicles, onRefresh }) {
  const [editVehicle, setEditVehicle] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(null)

  const handleDelete = async (id) => {
    await deleteVehicle(id)
    setShowConfirmDelete(null)
    onRefresh()
  }

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Setări</h2>

      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Mașinile mele
      </h3>

      {vehicles.map(v => (
        <div key={v.id} className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><Car size={16} /> {v.name}</div>
              <div className="card-subtitle">
                {[v.make, v.model, v.year].filter(Boolean).join(' · ')}
                {v.license_plate ? ` · ${v.license_plate}` : ''}
              </div>
            </div>
            <div className="swipe-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setEditVehicle(v)}>
                <Edit2 size={14} />
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowConfirmDelete(v)}
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {vehicles.length === 0 && (
        <div className="empty-state">
          <Car size={48} />
          <p>Nicio mașină adăugată.</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Info size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Despre AutoLog</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          AutoLog v1.0 — Aplicație de tracking pentru mentenanța auto.
          Ține evidența intervențiilor, costurilor și primiești remindere la timp.
        </p>
      </div>

      {editVehicle && (
        <Modal title="Editează mașina" onClose={() => setEditVehicle(null)}>
          <VehicleForm
            vehicle={editVehicle}
            onSave={() => { setEditVehicle(null); onRefresh() }}
            onCancel={() => setEditVehicle(null)}
          />
        </Modal>
      )}

      {showConfirmDelete && (
        <Modal title="Confirmare ștergere" onClose={() => setShowConfirmDelete(null)}>
          <p style={{ marginBottom: 8 }}>
            Sigur vrei să ștergi <strong>{showConfirmDelete.name}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Toate intervențiile și reminderele asociate vor fi șterse permanent.
          </p>
          <div className="confirm-actions">
            <button className="btn btn-outline" onClick={() => setShowConfirmDelete(null)}>Anulează</button>
            <button className="btn btn-danger" onClick={() => handleDelete(showConfirmDelete.id)}>Șterge</button>
          </div>
        </Modal>
      )}
    </>
  )
}
