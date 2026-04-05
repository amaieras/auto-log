import { useState, useEffect } from 'react'
import { getCategories, createReminder, updateReminder } from '../api'

export default function ReminderForm({ vehicleId, reminder, onSave, onCancel }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    vehicle_id: vehicleId,
    category_id: reminder?.category_id || '',
    title: reminder?.title || '',
    description: reminder?.description || '',
    due_date: reminder?.due_date || '',
    due_km: reminder?.due_km || '',
    is_recurring: reminder?.is_recurring || false,
    interval_km: reminder?.interval_km || '',
    interval_months: reminder?.interval_months || '',
  })

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleCategorySelect = (cat) => {
    setForm(f => ({
      ...f,
      category_id: cat.id,
      title: f.title || cat.name,
      interval_km: f.interval_km || cat.default_interval_km || '',
      interval_months: f.interval_months || cat.default_interval_months || '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      due_km: form.due_km ? Number(form.due_km) : null,
      category_id: form.category_id || null,
      interval_km: form.interval_km ? Number(form.interval_km) : null,
      interval_months: form.interval_months ? Number(form.interval_months) : null,
    }
    if (reminder?.id) {
      await updateReminder(reminder.id, data)
    } else {
      await createReminder(data)
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
          placeholder="ex: Schimb ulei"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Scadent la data</label>
          <input
            type="date"
            className="form-input"
            value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Scadent la km</label>
          <input
            type="number"
            className="form-input"
            value={form.due_km}
            onChange={e => setForm(f => ({ ...f, due_km: e.target.value }))}
            placeholder="ex: 95000"
          />
        </div>
      </div>

      <div className="form-group">
        <div className="toggle-row">
          <span className="form-label" style={{ margin: 0 }}>Recurent</span>
          <button
            type="button"
            className={`toggle ${form.is_recurring ? 'active' : ''}`}
            onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}
          />
        </div>
      </div>

      {form.is_recurring && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">La fiecare (km)</label>
            <input
              type="number"
              className="form-input"
              value={form.interval_km}
              onChange={e => setForm(f => ({ ...f, interval_km: e.target.value }))}
              placeholder="ex: 10000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">La fiecare (luni)</label>
            <input
              type="number"
              className="form-input"
              value={form.interval_months}
              onChange={e => setForm(f => ({ ...f, interval_months: e.target.value }))}
              placeholder="ex: 12"
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Descriere</label>
        <textarea
          className="form-input"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Detalii suplimentare..."
          rows={2}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" className="btn btn-outline btn-block" onClick={onCancel}>Anulează</button>
        <button type="submit" className="btn btn-primary btn-block">
          {reminder?.id ? 'Salvează' : 'Adaugă'}
        </button>
      </div>
    </form>
  )
}
