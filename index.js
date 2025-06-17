function getServerList(){
    document.getElementById("servers").textContent = "Loading...";
    fetch("https://corsproxy.io/?https://master.gettingoverit.mp/list")
      .then(res => res.text())
      .then(data => {
        document.getElementById("servers").textContent = data;
      });
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
        document.getElementById('latest-tag').textContent = "Current Version: " + data[0].name;
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