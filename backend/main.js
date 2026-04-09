const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { fetchServers, formatServer } = require('./serverlist');

const app = express();
const PORT = process.env.PORT || 5050;
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION_MS) || 30000;
const QUERY_TIMEOUT = parseInt(process.env.QUERY_TIMEOUT_MS) || 5000;

app.use(cors());
app.use(express.json());

let serverCache = null;
let cacheTimestamp = 0;

app.get('/api/servers', async (req, res) => {
  try {
    const now = Date.now();
    
    // Use cache if available
    if (serverCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.json(serverCache);
    }

    const servers = await fetchServers(QUERY_TIMEOUT);
    const formattedServers = servers.map(formatServer);
    
    // Update cache
    serverCache = {
      status: 'success',
      data: formattedServers,
      timestamp: now,
    };
    cacheTimestamp = now;

    res.json(serverCache);
  } catch (error) {
    console.error('Error fetching servers:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch server list',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/servers`);
});
