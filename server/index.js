const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'your_pg_user',
  host: 'localhost',
  database: 'your_db',
  password: 'your_password',
  port: 5432,
});

app.get('/movies', async (req, res) => {
  const search = req.query.search;
  const year = req.query.year;
  const sort = req.query.sort || 'title';
  const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  let whereClauses = [];
  let values = [];
  let idx = 1;

  if (search) {
    whereClauses.push(`to_tsvector('english', title || ' ' || genre) @@ plainto_tsquery($${idx})`);
    values.push(search);
    idx++;
  }

  if (year) {
    whereClauses.push(`year = $${idx}`);
    values.push(year);
    idx++;
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT * FROM movies
    ${whereSQL}
    ORDER BY ${sort} ${order}
    LIMIT ${limit} OFFSET ${offset}`;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.post('/movies', async (req, res) => {
  const { title, genre, year } = req.body;

  if (!title || !genre || !year) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const result = await pool.query(
      'INSERT INTO movies (title, genre, year) VALUES ($1, $2, $3) RETURNING *',
      [title, genre, year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
