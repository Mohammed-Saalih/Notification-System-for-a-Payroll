const path = require('path');
const express = require('express');
const { seedData } = require('./data/store');
const { startJobs } = require('./services/jobService');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const financeRoutes = require('./routes/financeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  return res.redirect('/login.html');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// In-memory data store seeding before server starts handling requests.
seedData();
startJobs();

app.listen(PORT, () => {
  console.log(`Anna Pay server running on http://localhost:${PORT}`);
});
