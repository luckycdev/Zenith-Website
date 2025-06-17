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