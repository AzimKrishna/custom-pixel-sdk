const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors()); // Add CORS support

app.post('/pixel', (req, res) => {
  const event = req.body;
  console.log('Event received:', event);
  // Store the event data in your database
  res.status(200).send('Event received');
});

app.get('/', (req, res) => {
    res.send('Hello World! backend working');
});w

app.listen(3000, () => {
  console.log('Pixel server listening on port 3000');
});