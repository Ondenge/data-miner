const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pullRoutes = require('./routes/pullRoutes'); // Import the pullRoutes router

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());
app.use('/api', pullRoutes);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
