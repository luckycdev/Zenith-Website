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