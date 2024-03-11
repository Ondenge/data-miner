const express = require('express');
const bodyParser = require('body-parser');
const pullRoutes = require('./pullRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(bodyParser.json());

// Routes
app.use('/api', pullRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
