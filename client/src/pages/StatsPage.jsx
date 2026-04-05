import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { getStats } from '../api'

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280']

export default function StatsPage({ activeVehicle }) {
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    if (activeVehicle) {
      getStats(activeVehicle.id, period).then(setStats)
    }
  }, [activeVehicle, period])

  if (!activeVehicle) {
    return (
      <div className="empty-state">
        <BarChart3 size={64} />
        <h3>Selectează o mașină</h3>
        <p>Adaugă o mașină pentru a vedea statisticile.</p>
      </div>
    )
  }

  if (!stats) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="tabs">
        <button className={`tab ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Lună</button>
        <button className={`tab ${period === 'year' ? 'active' : ''}`} onClick={() => setPeriod('year')}>An</button>
        <button className={`tab ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>Total</button>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Cost total
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
          {stats.total_cost.toLocaleString()} RON
        </div>
      </div>

      {/* Cost by month chart */}
      {stats.by_month.length > 0 && (
        <div className="chart-container">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>Costuri pe lună</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => {
                  const [y, m] = v.split('-')
                  return `${m}/${y.slice(2)}`
                }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${value.toLocaleString()} RON`, 'Cost']}
                labelFormatter={(label) => {
                  const [y, m] = label.split('-')
                  const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  return `${months[parseInt(m) - 1]} ${y}`
                }}
              />
              <Bar dataKey="total_cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cost by category chart */}
      {stats.by_category.length > 0 && (
        <div className="chart-container">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>Costuri pe categorie</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.by_category}
                dataKey="total_cost"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.by_category.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value.toLocaleString()} RON`]} />
            </PieChart>
          </ResponsiveContainer>

          {/* Category breakdown list */}
          {stats.by_category.map((cat, i) => (
            <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                <span style={{ fontSize: '0.85rem' }}>{cat.icon} {cat.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({cat.count}x)</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat.total_cost.toLocaleString()} RON</span>
            </div>
          ))}
        </div>
      )}

      {stats.by_category.length === 0 && (
        <div className="empty-state">
          <BarChart3 size={64} />
          <h3>Nicio statistică încă</h3>
          <p>Adaugă intervenții pentru a vedea statistici.</p>
        </div>
      )}
    </>
  )
}
