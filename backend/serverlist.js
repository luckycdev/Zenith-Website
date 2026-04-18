const dgram = require('node:dgram');

const MASTER_URL = 'https://master.gettingoverit.mp/list';
const OFFICIAL_ZENITH = '193.122.138.111:12345';
const DISCOVERY_REQUEST = Buffer.from([136, 0, 0, 0, 0]);
const MAX_VARUINT_BYTES = 5;
const MAX_REASONABLE_PLAYER_NAMES = 1000;

function ensureReadable(buf, offset, length) {
  if (offset < 0 || length < 0 || offset + length > buf.length) {
    throw new Error('Malformed server response');
  }
}

function readVarUInt(buf, offset) {
  let value = 0;
  let shift = 0;
  let pos = offset;
  let bytesRead = 0;

  while (true) {
    if (bytesRead >= MAX_VARUINT_BYTES) {
      throw new Error('Malformed varuint in server response');
    }
    ensureReadable(buf, pos, 1);
    const byte = buf[pos++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
    bytesRead += 1;
  }

  return { value, next: pos };
}

function readString(buf, offset) {
  const lenInfo = readVarUInt(buf, offset);
  if (lenInfo.value < 0) {
    throw new Error('Negative string length in server response');
  }
  const start = lenInfo.next;
  const end = start + lenInfo.value;
  ensureReadable(buf, start, lenInfo.value);
  return {
    value: buf.toString('utf8', start, end),
    next: end,
  };
}

function readU16(buf, offset) {
  ensureReadable(buf, offset, 2);
  return { value: buf.readUInt16LE(offset), next: offset + 2 };
}

function readI32(buf, offset) {
  ensureReadable(buf, offset, 4);
  return { value: buf.readInt32LE(offset), next: offset + 4 };
}

async function fetchMasterList() {
  const text = await fetch(MASTER_URL).then(r => r.text());
  const servers = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [ip, port] = line.split(';');
      return { ip, port: Number(port) };
    });

  const uniqueServers = [];
  const seenAddresses = new Set();

  for (const server of servers) {
    const address = `${server.ip}:${server.port}`;
    if (seenAddresses.has(address)) continue;
    seenAddresses.add(address);
    uniqueServers.push(server);
  }

  return uniqueServers;
}

function queryServer(ip, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    const timeout = setTimeout(() => {
      socket.close();
      resolve(null);
    }, timeoutMs);

    socket.on('message', (msg) => {
      clearTimeout(timeout);
      socket.close();

      try {
        if (!Buffer.isBuffer(msg) || msg.length < 5) {
          resolve(null);
          return;
        }

        let offset = 5;

        let read = readString(msg, offset);
        const name = read.value;
        offset = read.next;

        read = readU16(msg, offset);
        const players = read.value;
        offset = read.next;

        read = readU16(msg, offset);
        const maxPlayers = read.value;
        offset = read.next;

        read = readI32(msg, offset);
        offset = read.next;

        read = readI32(msg, offset);
        const serverVersion = read.value;
        offset = read.next;

        read = readI32(msg, offset);
        const nameCount = read.value;
        offset = read.next;

        if (nameCount < 0) {
          resolve(null);
          return;
        }

        const maxExpectedNames = Math.max(players, maxPlayers, 0);
        const safeNameCount = Math.min(nameCount, maxExpectedNames, MAX_REASONABLE_PLAYER_NAMES);

        const playerNames = [];
        for (let i = 0; i < safeNameCount; i++) {
          read = readString(msg, offset);
          playerNames.push(read.value);
          offset = read.next;
        }

        resolve({
          ip,
          port,
          name,
          players,
          maxPlayers,
          serverVersion,
          playerNames,
        });
      } catch {
        resolve(null);
      }
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      socket.close();
      resolve(null);
    });

    socket.bind(0, () => {
      socket.send(DISCOVERY_REQUEST, port, ip);
    });
  });
}

async function fetchServers(timeoutMs) {
  const list = await fetchMasterList();
  const results = await Promise.all(list.map(server => queryServer(server.ip, server.port, timeoutMs)));
  const filtered = results.filter(Boolean);

  const uniqueServers = [];
  const seenAddresses = new Set();

  for (const server of filtered) {
    const address = `${server.ip}:${server.port}`;
    if (seenAddresses.has(address)) continue;
    seenAddresses.add(address);
    uniqueServers.push(server);
  }
  
  // Prioritize official Zenith server
  return uniqueServers.sort((firstServer, secondServer) => {
    const firstIsOfficial = `${firstServer.ip}:${firstServer.port}` === OFFICIAL_ZENITH;
    const secondIsOfficial = `${secondServer.ip}:${secondServer.port}` === OFFICIAL_ZENITH;

    if (firstIsOfficial === secondIsOfficial) return 0;
    return firstIsOfficial ? -1 : 1;
  });
}

function formatServer(server) {
  const address = `${server.ip}:${server.port}`;
  const isOfficialZenith = address === OFFICIAL_ZENITH;
  const playerNameList = server.playerNames.length > 0
    ? server.playerNames
      .map(playerName => playerName.trim().replace(/,+$/, ''))
      .filter(Boolean)
    : [];

  return {
    address,
    name: server.name || 'Unknown',
    players: server.players,
    maxPlayers: server.maxPlayers,
    playerNames: playerNameList,
    isOfficial: isOfficialZenith,
    serverVersion: server.serverVersion,
  };
}

module.exports = {
  fetchServers,
  formatServer,
};
