const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0

    });
    return connection;
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    throw err;
  }
}


app.get('/', (req, res) => {
  res.send('Welcome to Faculty Certification SVEC Backend Server!');
});

app.post('/insert', async (req, res) => {
  const { faculty_id, name, branch, email } = req.body;
  const query = 'INSERT INTO faculty (faculty_id, name, branch, email) VALUES (?, ?, ?, ?)';

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query, [faculty_id, name, branch, email]);
    await db.end();
    res.status(201).send({ message: 'Faculty details inserted successfully!' });
  } catch (err) {
    console.error('Failed to insert faculty details:', err);
    res.status(500).send({ error: 'Failed to insert faculty details.' });
  }
});

app.post('/upload', async (req, res) => {
  const { faculty_id, certificate_name, type_of_certification, certificate_url } = req.body;
  const query = 'INSERT INTO faculty_certificates (faculty_id, certificate_name, type_of_certification, certificate_url) VALUES (?, ?, ?, ?)';

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query, [faculty_id, certificate_name, type_of_certification, certificate_url]);
    await db.end();
    res.status(201).send({ message: 'Certificate details inserted successfully!' });
  } catch (err) {
    console.error('Failed to insert certificate details:', err);
    res.status(500).send({ error: 'Failed to insert certificate details.' });
  }
});

app.get('/retrieve_faculty', async (req, res) => {
  const { conditions, columns } = req.query;
  let query = 'SELECT ';

  if (columns) {
    query += `${columns}`;
  } else {
    query += '*';
  }

  query += ' FROM faculty';

  if (conditions) {
    query += ` WHERE ${conditions}`;
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query);
    await db.end();
    res.status(200).send(result);
  } catch (err) {
    console.error('Failed to retrieve faculty data:', err);
    res.status(500).send({ error: 'Failed to retrieve faculty data.' });
  }
});

app.get('/retrieve_certificates', async (req, res) => {
  const { conditions, columns } = req.query;
  let query = 'SELECT ';

  if (columns) {
    query += `${columns}`;
  } else {
    query += '*';
  }

  query += ' FROM faculty_certificates';

  if (conditions) {
    query += ` WHERE ${conditions}`;
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query);
    await db.end();
    res.status(200).send(result);
  } catch (err) {
    console.error('Failed to retrieve certificate data:', err);
    res.status(500).send({ error: 'Failed to retrieve certificate data.' });
  }
});

app.get('/count', async (req, res) => {
  const { conditions } = req.query;
  let query = 'SELECT COUNT(*) AS count FROM faculty_certificates';

  if (conditions) {
    query += ` WHERE ${conditions}`;
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query);
    await db.end();
    res.status(200).send({ count: result[0].count });
  } catch (err) {
    console.error('Failed to count certificate records:', err);
    res.status(500).send({ error: 'Failed to count certificate records.' });
  }
});

app.get('/retrieve', async (req, res) => {
  const { conditions } = req.query;
  let query = `SELECT 
      f.faculty_id,
      f.name,
      f.branch,
      f.email,
      fc.id,  
      fc.certificate_name,
      fc.type_of_certification,
      fc.certificate_url
    FROM 
      faculty f
    LEFT JOIN 
      faculty_certificates fc
    ON 
      f.faculty_id = fc.faculty_id`;

  if (conditions) {
    query += ` WHERE f.${conditions}`;
  }

  try {
    const db = await connectToDatabase();
    const [result] = await db.execute(query);
    await db.end();
    res.status(200).send(result);
  } catch (err) {
    console.error('Failed to retrieve combined data:', err);
    res.status(500).send({ error: 'Failed to retrieve combined data.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server is running...');
});
