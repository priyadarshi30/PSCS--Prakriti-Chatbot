// ...existing imports...
const mysql = require('mysql2/promise');

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'ayurbot'
});

// Assessment endpoints using MySQL
app.post('/assessment', async (req, res) => {
  const { email, assessmentNumber, data, timestamp, responses } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO assessments (email, assessment_number, assessment_data, timestamp, responses) VALUES (?, ?, ?, ?, ?)',
      [email, assessmentNumber, JSON.stringify(data), timestamp, JSON.stringify(responses)]
    );
    
    res.json({
      id: result.insertId,
      email,
      assessmentNumber,
      data,
      timestamp,
      responses
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.get('/assessments/:email', async (req, res) => {
  try {
    const [assessments] = await pool.execute(
      'SELECT * FROM assessments WHERE email = ? ORDER BY timestamp DESC',
      [req.params.email]
    );
    
    // Parse JSON strings back to objects
    const formattedAssessments = assessments.map(assessment => ({
      ...assessment,
      data: JSON.parse(assessment.assessment_data),
      responses: JSON.parse(assessment.responses)
    }));

    res.json({
      assessments: formattedAssessments,
      count: assessments.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// ...rest of existing code...
