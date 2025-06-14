function getServerList(){
fetch("https://corsproxy.io/?https://master.gettingoverit.mp/list")
  .then(res => res.text())
  .then(data => {
    document.getElementById("servers").textContent = data;
  });
}