const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

const SITEMAP_DATA_DIR = path.join(__dirname, 'src', 'Hyatt');

app.get('/api/json-files', async (req, res) => {
  try {
    const files = await fs.readdir(SITEMAP_DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Unable to read JSON files' });
  }
});

app.get('/api/sitemap-data/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(SITEMAP_DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).json({ error: 'File not found or unable to read' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});