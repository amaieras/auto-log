const express = require('express');
const router = express.Router();
const { query, queryOne, run, runNoReturn } = require('../database');

router.get('/vehicle/:vehicleId', async (req, res) => {
  res.json(await query(`
    SELECT r.*, sc.name as category_name, sc.icon as category_icon
    FROM reminders r LEFT JOIN service_categories sc ON r.category_id = sc.id
    WHERE r.vehicle_id = $1 ORDER BY r.is_completed ASC, r.due_date ASC NULLS LAST
  `, [Number(req.params.vehicleId)]));
});

router.get('/upcoming', async (req, res) => {
  const reminders = await query(`
    SELECT r.*, sc.name as category_name, sc.icon as category_icon, v.name as vehicle_name, v.current_km
    FROM reminders r
    LEFT JOIN service_categories sc ON r.category_id = sc.id
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.is_completed = false
    ORDER BY CASE
      WHEN r.due_date IS NOT NULL AND r.due_date <= CURRENT_DATE THEN 0
      WHEN r.due_km IS NOT NULL AND r.due_km <= v.current_km THEN 0
      ELSE 1 END, r.due_date ASC NULLS LAST
  `);

  const today = new Date().toISOString().split('T')[0];
  const enriched = reminders.map(r => {
    let status = 'upcoming';
    const dueDate = r.due_date ? new Date(r.due_date).toISOString().split('T')[0] : null;
    if (dueDate && dueDate <= today) status = 'overdue';
    if (r.due_km && r.current_km && r.due_km <= r.current_km) status = 'overdue';
    if (status === 'upcoming' && dueDate) {
      const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
      if (daysLeft <= 30 && daysLeft > 0) status = 'soon';
    }
    if (status === 'upcoming' && r.due_km && r.current_km) {
      if (r.due_km - r.current_km <= 1000 && r.due_km - r.current_km > 0) status = 'soon';
    }
    return { ...r, status };
  });
  res.json(enriched);
});

router.post('/', async (req, res) => {
  const { vehicle_id, category_id, title, description, due_date, due_km, is_recurring, interval_km, interval_months } = req.body;
  const result = await run(
    'INSERT INTO reminders (vehicle_id,category_id,title,description,due_date,due_km,is_recurring,interval_km,interval_months) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [vehicle_id, category_id||null, title, description||null, due_date||null, due_km||null, !!is_recurring, interval_km||null, interval_months||null]
  );
  res.status(201).json(await queryOne(`
    SELECT r.*, sc.name as category_name, sc.icon as category_icon
    FROM reminders r LEFT JOIN service_categories sc ON r.category_id = sc.id WHERE r.id = $1
  `, [result.lastInsertRowid]));
});

router.put('/:id/complete', async (req, res) => {
  const id = Number(req.params.id);
  const reminder = await queryOne('SELECT * FROM reminders WHERE id = $1', [id]);
  if (!reminder) return res.status(404).json({ error: 'Reminder not found' });

  await runNoReturn('UPDATE reminders SET is_completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

  if (reminder.is_recurring) {
    let nextDate = null, nextKm = null;
    if (reminder.due_date && reminder.interval_months) {
      const d = new Date(reminder.due_date);
      d.setMonth(d.getMonth() + reminder.interval_months);
      nextDate = d.toISOString().split('T')[0];
    }
    if (reminder.due_km && reminder.interval_km) nextKm = reminder.due_km + reminder.interval_km;
    await run(
      'INSERT INTO reminders (vehicle_id,category_id,title,description,due_date,due_km,is_recurring,interval_km,interval_months) VALUES ($1,$2,$3,$4,$5,$6,true,$7,$8)',
      [reminder.vehicle_id, reminder.category_id, reminder.title, reminder.description, nextDate, nextKm, reminder.interval_km, reminder.interval_months]
    );
  }
  res.json({ success: true });
});

router.put('/:id', async (req, res) => {
  const { category_id, title, description, due_date, due_km, is_recurring, interval_km, interval_months } = req.body;
  const id = Number(req.params.id);
  await runNoReturn(
    'UPDATE reminders SET category_id=$1,title=$2,description=$3,due_date=$4,due_km=$5,is_recurring=$6,interval_km=$7,interval_months=$8 WHERE id=$9',
    [category_id, title, description, due_date, due_km, !!is_recurring, interval_km, interval_months, id]
  );
  res.json(await queryOne(`
    SELECT r.*, sc.name as category_name, sc.icon as category_icon
    FROM reminders r LEFT JOIN service_categories sc ON r.category_id = sc.id WHERE r.id = $1
  `, [id]));
});

router.delete('/:id', async (req, res) => {
  await runNoReturn('DELETE FROM reminders WHERE id = $1', [Number(req.params.id)]);
  res.json({ success: true });
});

module.exports = router;
