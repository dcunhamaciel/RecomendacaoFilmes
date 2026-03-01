const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', require('./routes/userRoutes'));
app.use('/movies', require('./routes/movieRoutes'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});