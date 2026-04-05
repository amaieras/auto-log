const express = require('express');
const router = express.Router();
const { query, queryOne, run, runNoReturn } = require('../database');

router.get('/', async (req, res) => {
  res.json(await query('SELECT * FROM vehicles ORDER BY created_at DESC'));
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const vehicle = await queryOne('SELECT * FROM vehicles WHERE id = $1', [id]);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const totalCost = await queryOne('SELECT COALESCE(SUM(cost), 0) as total FROM service_records WHERE vehicle_id = $1', [id]);
  const serviceCount = await queryOne('SELECT COUNT(*) as count FROM service_records WHERE vehicle_id = $1', [id]);
  const pendingReminders = await queryOne('SELECT COUNT(*) as count FROM reminders WHERE vehicle_id = $1 AND is_completed = false', [id]);

  res.json({
    ...vehicle,
    total_cost: Number(totalCost?.total || 0),
    service_count: Number(serviceCount?.count || 0),
    pending_reminders: Number(pendingReminders?.count || 0)
  });
});

router.post('/', async (req, res) => {
  const { name, make, model, year, license_plate, vin, current_km, fuel_type } = req.body;
  const result = await run(
    'INSERT INTO vehicles (name,make,model,year,license_plate,vin,current_km,fuel_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [name, make||null, model||null, year||null, license_plate||null, vin||null, current_km||0, fuel_type||null]
  );
  const vehicle = await queryOne('SELECT * FROM vehicles WHERE id = $1', [result.lastInsertRowid]);
  res.status(201).json(vehicle);
});

router.put('/:id', async (req, res) => {
  const { name, make, model, year, license_plate, vin, current_km, fuel_type } = req.body;
  const id = Number(req.params.id);
  await runNoReturn(
    'UPDATE vehicles SET name=$1,make=$2,model=$3,year=$4,license_plate=$5,vin=$6,current_km=$7,fuel_type=$8,updated_at=CURRENT_TIMESTAMP WHERE id=$9',
    [name, make, model, year, license_plate, vin, current_km, fuel_type, id]
  );
  res.json(await queryOne('SELECT * FROM vehicles WHERE id = $1', [id]));
});

router.delete('/:id', async (req, res) => {
  await runNoReturn('DELETE FROM vehicles WHERE id = $1', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
