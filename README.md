https://zenith.luckyc.dev/
---
Website for [Zenith](https://github.com/luckycdev/Zenith) and [Zenith-Plugins](https://github.com/luckycdev/Zenith-Plugins)

# Installation:
* Note: backend is just for server list
1. Install [NodeJS](https://nodejs.org/en/download) (tested on v20.12.2 & npm v10.5.2 but should work on latest)
2. Clone this repo (`git clone https://github.com/luckycdev/Zenith-Website`)
3. Inside of the cloned repos directory (`cd Zenith-Website`), enter the backend directory (`cd backend`)
4. Inside of the backend directory, run `npm i`
5. If you want to change the port the backend runs on or other things, edit the `.env` file
6. If you are using nginx on linux, create a file in your /etc/nginx/sites-enabled directory with whatever your domain is, and use [this](https://pastebin.com/raw/MzMaMFjq) __as a reference__ -- you will need to change the lines with comments -- for certs you can use `sudo cerbot --nginx` (tested on nginx ubuntu v1.18.0 & certbot v4.0.0 but should work on latest)
7. While inside of the backend folder, start the backend with `node main.js`

<details>
<summary>linux screen tutorial</summary>

Install Screen `sudo apt install screen`
  
Create the screen `screen -S zenithwebsite`

And then if you want to return to your screen, run `screen -r zenithwebsite`

If you want to kill your screen, run `screen -X -S zenithwebsite kill`
</details>

8. The site should be running at the domain and your server should be working!

* Note: if using nginx on linux you may have to run `sudo chmod -R 755 Zenith-Website` (change the "Zenith-Website" to the path of your Zenith Website directory) for nginx to make the website work (and then maybe `sudo systemctl reload nginx` and/or `sudo systemctl restart nginx`)