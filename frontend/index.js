function getServerList(){
  document.getElementById("servers").textContent = "Loading...";

  fetch('/api/servers')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid response format');
      }

      const servers = data.data;
      const container = document.getElementById('servers');
      container.innerHTML = '';

      if (servers.length === 0) {
        container.innerHTML = '<p style="color: #999;">No online servers found.</p>';
        return;
      }

      const template = document.getElementById('server-template');

      servers.forEach(server => {
        const clone = template.content.cloneNode(true);
        
        // Set server info
        clone.querySelector('.server-name').textContent = server.name;
        clone.querySelector('.server-address').textContent = server.address;
        clone.querySelector('.server-players').textContent = server.players;
        clone.querySelector('.server-max-players').textContent = server.maxPlayers;
        
        if (server.isOfficial) {
          clone.querySelector('.official-badge').style.display = 'inline';
        }
        
        clone.querySelector('.clickable-copy').dataset.copy = server.address;
        
        const playerList = clone.querySelector('.player-list');
        if (server.playerNames.length > 0) {
          server.playerNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            playerList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = 'None';
          li.style.color = '#999';
          playerList.appendChild(li);
        }
        
        container.appendChild(clone);
      });
    })
    .catch(err => {
      console.error("Error fetching server list:", err);
      document.getElementById("servers").innerHTML = '<p style="color: #ff6b6b;">Error loading servers. Please try again later.</p>';
    });
}

function copyText(el) {
  const text = el.dataset.copy?.trim() || el.textContent.trim();
  navigator.clipboard.writeText(text)
    .catch(err => console.error('Copy failed', err));
}

function toggleHeader(){
  var header = document.getElementsByClassName("header")[0];
  if (header.style.display === 'none') {
    header.style.display = 'flex';
  }
  else {
    header.style.display = 'none';
  }
}

function getLatestReleaseTag(){
  fetch('https://api.github.com/repos/luckycdev/zenith/tags')
    .then(res => res.json())
    .then(data => {
      const latestTag = data[0].name;
      document.getElementById('latest-tag').innerHTML = 
        `Current Version: ${latestTag} <img 
          alt="latest release downloads badge" 
          src="https://img.shields.io/github/downloads/luckycdev/zenith/${latestTag}/total?color=%239F7AEA&logo=github" 
          style="vertical-align: middle; margin-left: 8px;">`;
    });
}

async function fillPluginVersions() {
  const containers = document.querySelectorAll('.plugincontainer, .individualplugincontainer');

  for (const container of containers) {
    const url = container.dataset.source;
    const versionElement = container.querySelector('.small');

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();

      const match = text.match(/public\s+string\s+Version\s*=>\s*"([^"]+)"/);
      versionElement.textContent = match ? `v${match[1]}` : 'v???';
    } catch (e) {
      versionElement.textContent = 'v??';
    }
  }
}

window.addEventListener('DOMContentLoaded', fillPluginVersions);

function setupPluginToggle() {
  const descBtn = document.getElementById('descriptionbutton');
  const changelogBtn = document.getElementById('changelogbutton');
  const contentDiv = document.querySelector('.pluginpagecontainer');
  const descContent = document.getElementById('descriptioncontent');
  const changelogContent = document.getElementById('changelogcontent');

  if (!descBtn || !changelogBtn || !contentDiv || !descContent || !changelogContent) {
    console.warn('Plugin toggle elements missing');
    return;
  }

  function showDescription() {
    contentDiv.innerHTML = descContent.innerHTML;
    descBtn.classList.add('active');
    changelogBtn.classList.remove('active');
  }

  function showChangelog() {
    contentDiv.innerHTML = changelogContent.innerHTML;
    changelogBtn.classList.add('active');
    descBtn.classList.remove('active');
  }

  descBtn.addEventListener('click', showDescription);
  changelogBtn.addEventListener('click', showChangelog);

  showDescription();
}