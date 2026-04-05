const express = require('express');
const router = express.Router();
const { query, queryOne, run, runNoReturn } = require('../database');

router.get('/vehicle/:vehicleId', async (req, res) => {
  res.json(await query(`
    SELECT sr.*, sc.name as category_name, sc.icon as category_icon
    FROM service_records sr LEFT JOIN service_categories sc ON sr.category_id = sc.id
    WHERE sr.vehicle_id = $1 ORDER BY sr.date DESC
  `, [Number(req.params.vehicleId)]));
});

router.get('/categories', async (req, res) => {
  res.json(await query('SELECT * FROM service_categories ORDER BY name'));
});

router.get('/stats/:vehicleId', async (req, res) => {
  const vid = Number(req.params.vehicleId);
  const { period } = req.query;
  let df = '', params = [vid];
  if (period === 'month') df = "AND sr.date >= CURRENT_DATE - INTERVAL '1 month'";
  else if (period === 'year') df = "AND sr.date >= CURRENT_DATE - INTERVAL '1 year'";

  const byCategory = await query(`
    SELECT sc.name, sc.icon, COALESCE(SUM(sr.cost),0)::float as total_cost, COUNT(sr.id)::int as count
    FROM service_records sr LEFT JOIN service_categories sc ON sr.category_id = sc.id
    WHERE sr.vehicle_id = $1 ${df} GROUP BY sc.name, sc.icon ORDER BY total_cost DESC
  `, params);

  const byMonth = await query(`
    SELECT to_char(sr.date, 'YYYY-MM') as month, COALESCE(SUM(sr.cost),0)::float as total_cost
    FROM service_records sr WHERE sr.vehicle_id = $1 ${df}
    GROUP BY month ORDER BY month DESC LIMIT 12
  `, params);

  const totalCost = await queryOne(`SELECT COALESCE(SUM(cost),0)::float as total FROM service_records WHERE vehicle_id = $1 ${df}`, params);

  res.json({ by_category: byCategory, by_month: byMonth.reverse(), total_cost: totalCost?.total || 0 });
});

router.post('/', async (req, res) => {
  const { vehicle_id, category_id, title, description, date, km_at_service, cost, currency, location, notes } = req.body;
  const result = await run(
    'INSERT INTO service_records (vehicle_id,category_id,title,description,date,km_at_service,cost,currency,location,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [vehicle_id, category_id||null, title, description||null, date, km_at_service||null, cost||0, currency||'RON', location||null, notes||null]
  );
  if (km_at_service) {
    await runNoReturn('UPDATE vehicles SET current_km = GREATEST(current_km, $1) WHERE id = $2', [km_at_service, vehicle_id]);
  }
  res.status(201).json(await queryOne(`
    SELECT sr.*, sc.name as category_name, sc.icon as category_icon
    FROM service_records sr LEFT JOIN service_categories sc ON sr.category_id = sc.id WHERE sr.id = $1
  `, [result.lastInsertRowid]));
});

router.put('/:id', async (req, res) => {
  const { category_id, title, description, date, km_at_service, cost, currency, location, notes } = req.body;
  const id = Number(req.params.id);
  await runNoReturn(
    'UPDATE service_records SET category_id=$1,title=$2,description=$3,date=$4,km_at_service=$5,cost=$6,currency=$7,location=$8,notes=$9 WHERE id=$10',
    [category_id, title, description, date, km_at_service, cost, currency, location, notes, id]
  );
  res.json(await queryOne(`
    SELECT sr.*, sc.name as category_name, sc.icon as category_icon
    FROM service_records sr LEFT JOIN service_categories sc ON sr.category_id = sc.id WHERE sr.id = $1
  `, [id]));
});

router.delete('/:id', async (req, res) => {
  await runNoReturn('DELETE FROM service_records WHERE id = $1', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
