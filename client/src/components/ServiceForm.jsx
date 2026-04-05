import { useState, useEffect } from 'react'
import { getCategories, createService, updateService } from '../api'

export default function ServiceForm({ vehicleId, service, onSave, onCancel }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    vehicle_id: vehicleId,
    category_id: service?.category_id || '',
    title: service?.title || '',
    description: service?.description || '',
    date: service?.date || new Date().toISOString().split('T')[0],
    km_at_service: service?.km_at_service || '',
    cost: service?.cost || '',
    currency: service?.currency || 'RON',
    location: service?.location || '',
    notes: service?.notes || '',
  })

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleCategorySelect = (cat) => {
    setForm(f => ({
      ...f,
      category_id: cat.id,
      title: f.title || cat.name
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      km_at_service: form.km_at_service ? Number(form.km_at_service) : null,
      cost: form.cost ? Number(form.cost) : 0,
      category_id: form.category_id || null,
    }
    if (service?.id) {
      await updateService(service.id, data)
    } else {
      await createService(data)
    }
    onSave()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Categorie</label>
        <div className="category-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`category-item ${form.category_id === cat.id ? 'selected' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              <span className="icon">{cat.icon}</span>
              <span className="name">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Titlu</label>
        <input
          type="text"
          className="form-input"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="ex: Schimb ulei + filtru"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Data</label>
          <input
            type="date"
            className="form-input"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Kilometraj</label>
          <input
            type="number"
            className="form-input"
            value={form.km_at_service}
            onChange={e => setForm(f => ({ ...f, km_at_service: e.target.value }))}
            placeholder="ex: 85000"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Cost</label>
          <input
            type="number"
            className="form-input"
            value={form.cost}
            onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
            placeholder="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Moneda</label>
          <select
            className="form-input"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            <option value="RON">RON</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Locație service</label>
        <input
          type="text"
          className="form-input"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          placeholder="ex: Service Auto Popescu"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Note</label>
        <textarea
          className="form-input"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Detalii suplimentare..."
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" className="btn btn-outline btn-block" onClick={onCancel}>Anulează</button>
        <button type="submit" className="btn btn-primary btn-block">
          {service?.id ? 'Salvează' : 'Adaugă'}
        </button>
      </div>
    </form>
  )
}
