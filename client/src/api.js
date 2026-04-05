const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Vehicles
export const getVehicles = () => request('/vehicles');
export const getVehicle = (id) => request(`/vehicles/${id}`);
export const createVehicle = (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) });
export const updateVehicle = (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVehicle = (id) => request(`/vehicles/${id}`, { method: 'DELETE' });

// Services
export const getServices = (vehicleId) => request(`/services/vehicle/${vehicleId}`);
export const getCategories = () => request('/services/categories');
export const getStats = (vehicleId, period = 'all') => request(`/services/stats/${vehicleId}?period=${period}`);
export const createService = (data) => request('/services', { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteService = (id) => request(`/services/${id}`, { method: 'DELETE' });

// Reminders
export const getReminders = (vehicleId) => request(`/reminders/vehicle/${vehicleId}`);
export const getUpcomingReminders = () => request('/reminders/upcoming');
export const createReminder = (data) => request('/reminders', { method: 'POST', body: JSON.stringify(data) });
export const completeReminder = (id) => request(`/reminders/${id}/complete`, { method: 'PUT' });
export const updateReminder = (id, data) => request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteReminder = (id) => request(`/reminders/${id}`, { method: 'DELETE' });
