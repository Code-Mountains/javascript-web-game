const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, '.')));

// Add a route to get the current timestamp
app.get('/deployment-timestamp', (req, res) => {
  const now = new Date();
  const timestamp = now.toLocaleString(); // Format date and time in a human-readable format
  res.send(timestamp);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
