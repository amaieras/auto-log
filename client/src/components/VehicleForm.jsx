import { useState } from 'react'
import { createVehicle, updateVehicle } from '../api'

export default function VehicleForm({ vehicle, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: vehicle?.name || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || '',
    license_plate: vehicle?.license_plate || '',
    vin: vehicle?.vin || '',
    current_km: vehicle?.current_km || '',
    fuel_type: vehicle?.fuel_type || 'Benzină',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      year: form.year ? Number(form.year) : null,
      current_km: form.current_km ? Number(form.current_km) : 0,
    }
    if (vehicle?.id) {
      await updateVehicle(vehicle.id, data)
    } else {
      await createVehicle(data)
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Nume (poreclă)</label>
        <input
          type="text"
          className="form-input"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="ex: Golf-ul meu"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Marcă</label>
          <input
            type="text"
            className="form-input"
            value={form.make}
            onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
            placeholder="ex: Volkswagen"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Model</label>
          <input
            type="text"
            className="form-input"
            value={form.model}
            onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
            placeholder="ex: Golf 7"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">An fabricație</label>
          <input
            type="number"
            className="form-input"
            value={form.year}
            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            placeholder="ex: 2018"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Combustibil</label>
          <select
            className="form-input"
            value={form.fuel_type}
            onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))}
          >
            <option>Benzină</option>
            <option>Motorină</option>
            <option>GPL</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Nr. înmatriculare</label>
          <input
            type="text"
            className="form-input"
            value={form.license_plate}
            onChange={e => setForm(f => ({ ...f, license_plate: e.target.value.toUpperCase() }))}
            placeholder="ex: B 123 ABC"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Kilometraj actual</label>
          <input
            type="number"
            className="form-input"
            value={form.current_km}
            onChange={e => setForm(f => ({ ...f, current_km: e.target.value }))}
            placeholder="ex: 85000"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">VIN (opțional)</label>
        <input
          type="text"
          className="form-input"
          value={form.vin}
          onChange={e => setForm(f => ({ ...f, vin: e.target.value }))}
          placeholder="Serie de șasiu"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" className="btn btn-outline btn-block" onClick={onCancel}>Anulează</button>
        <button type="submit" className="btn btn-primary btn-block">
          {vehicle?.id ? 'Salvează' : 'Adaugă mașină'}
        </button>
      </div>
    </form>
  )
}
