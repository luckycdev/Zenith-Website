function getServerList(){
    document.getElementById("servers").textContent = "Loading...";
    fetch("https://corsproxy.io/?https://master.gettingoverit.mp/list")
      .then(res => res.text())
      .then(data => {
            const lines = data.trim().split("\n");
            const formatted = lines.map(line => {
                const [ip, port] = line.trim().split(";");
                const server = `${ip}:${port}`;
                if (server === "193.122.138.111:12345") {
                    return `${server} (Official Zenith Demo)`;
                }
                return server;
            });
            document.getElementById("servers").innerHTML = formatted.join("<br>");
          })
        .catch(err => {
            console.error("Error fetching server list:", err);
            document.getElementById("servers").textContent = "Error loading servers";
        });
}

function copyText(el) {
    const text = el.textContent.trim();
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
  const containers = document.querySelectorAll('.plugincontainer');

  for (const container of containers) {
    const url = container.dataset.source;
    const versionElement = container.querySelector('.version');

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const text = await res.text();

      const match = text.match(/public\s+string\s+Version\s*=>\s*"([^"]+)"/);
      versionElement.textContent = match ? `v${match[1]}` : '??';
    } catch (e) {
      versionElement.textContent = '??';
    }
  }
}

window.addEventListener('DOMContentLoaded', fillPluginVersions);