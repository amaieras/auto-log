const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        make TEXT,
        model TEXT,
        year INTEGER,
        license_plate TEXT,
        vin TEXT,
        current_km INTEGER DEFAULT 0,
        fuel_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        default_interval_km INTEGER,
        default_interval_months INTEGER
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_records (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES service_categories(id),
        title TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        km_at_service INTEGER,
        cost REAL DEFAULT 0,
        currency TEXT DEFAULT 'RON',
        location TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES service_categories(id),
        title TEXT NOT NULL,
        description TEXT,
        due_date DATE,
        due_km INTEGER,
        is_recurring BOOLEAN DEFAULT FALSE,
        interval_km INTEGER,
        interval_months INTEGER,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default categories
    const cats = [
      ['Schimb ulei','🛢️',10000,12], ['Distribuție','⛓️',60000,48], ['Frâne','🛑',30000,24],
      ['Anvelope','🔘',40000,36], ['Filtre','🔧',15000,12], ['Baterie','🔋',null,48],
      ['ITP','📋',null,24], ['Asigurare RCA','📄',null,12], ['Revizie generală','🔩',15000,12],
      ['Altele','🚗',null,null]
    ];
    for (const [name, icon, km, months] of cats) {
      await client.query(
        'INSERT INTO service_categories (name,icon,default_interval_km,default_interval_months) VALUES ($1,$2,$3,$4) ON CONFLICT (name) DO NOTHING',
        [name, icon, km, months]
      );
    }
    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}

async function query(sql, params = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

async function run(sql, params = []) {
  const res = await pool.query(sql + ' RETURNING id', params);
  return { lastInsertRowid: res.rows[0]?.id };
}

async function runNoReturn(sql, params = []) {
  await pool.query(sql, params);
}

module.exports = { initDb, query, queryOne, run, runNoReturn, pool };
