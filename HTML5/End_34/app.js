const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '.')));

// Add a route to get the deployment timestamp
app.get('/deployment-timestamp', (req, res) => {
  fs.readFile('deployment_timestamp.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading timestamp');
    }
    res.send(data);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
