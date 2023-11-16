```

npm install express
  

# SETUP PM2 for NodeJS
sudo npm install pm2 -g

pm2 start app.js --name "fruitfall" --watch

## Stop NodeJS app using PM2 

pm2 stop fruitfall

## OUTPUT 

[PM2] Applying action stopProcessId on app [fruitfall](ids: [ 0 ])
[PM2] [fruitfall](0) ✓
┌────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ fruitfall    │ default     │ 1.0.0   │ fork    │ 0        │ 0      │ 23   │ stopped   │ 0%       │ 0b       │ sysadmin │ disabled │
└────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘


## Restart NodeJS app using pm2 

pm2 start fruitfall

## OUTPUT 


[PM2] Applying action restartProcessId on app [fruitfall](ids: [ 0 ])
[PM2] [fruitfall](0) ✓
[PM2] Process successfully started
┌────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ fruitfall    │ default     │ 1.0.0   │ fork    │ 26221    │ 0s     │ 23   │ online    │ 0%       │ 24.4mb   │ sysadmin │ disabled │
└────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘


## Setup PM2 Startup Script

pm2 startup
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u sysadmin --hp /home/sysadmin

## OUTPUT 

 sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u sysadmin --hp /home/sysadmin

                        -------------

__/\\\\\\\\\\\\\____/\\\\____________/\\\\____/\\\\\\\\\_____
 _\/\\\/////////\\\_\/\\\\\\________/\\\\\\__/\\\///////\\\___
  _\/\\\_______\/\\\_\/\\\//\\\____/\\\//\\\_\///______\//\\\__
   _\/\\\\\\\\\\\\\/__\/\\\\///\\\/\\\/_\/\\\___________/\\\/___
    _\/\\\/////////____\/\\\__\///\\\/___\/\\\________/\\\//_____
     _\/\\\_____________\/\\\____\///_____\/\\\_____/\\\//________
      _\/\\\_____________\/\\\_____________\/\\\___/\\\/___________
       _\/\\\_____________\/\\\_____________\/\\\__/\\\\\\\\\\\\\\\_
        _\///______________\///______________\///__\///////////////__


                          Runtime Edition

        PM2 is a Production Process Manager for Node.js applications
                     with a built-in Load Balancer.

                Start and Daemonize any application:
                $ pm2 start app.js

                Load Balance 4 instances of api.js:
                $ pm2 start api.js -i 4

                Monitor in production:
                $ pm2 monitor

                Make pm2 auto-boot at server restart:
                $ pm2 startup

                To go further checkout:
                http://pm2.io/


                        -------------

[PM2] Init System found: systemd
Platform systemd
Template
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=sysadmin
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/snap/bin:/home/sysadmin/.dotnet/tools:/opt/mssql-tools/bin:/opt/mssql-tools/bin://home/sysadmin/go/bin:/opt/mssql-tools/bin://home/sysadmin/go/bin:/usr/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/home/sysadmin/.pm2
PIDFile=/home/sysadmin/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/local/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/local/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/local/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target

Target path
/etc/systemd/system/pm2-sysadmin.service
Command list
[ 'systemctl enable pm2-sysadmin' ]
[PM2] Writing init configuration in /etc/systemd/system/pm2-sysadmin.service
[PM2] Making script booting at startup...
[PM2] [-] Executing: systemctl enable pm2-sysadmin...
Created symlink /etc/systemd/system/multi-user.target.wants/pm2-sysadmin.service → /etc/systemd/system/pm2-sysadmin.service.
[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save

[PM2] Remove init script via:
$ pm2 unstartup systemd



sudo npm install -g http-server

sudo ./node_modules/.bin/http-server -p 80 -a 0.0.0.0


# Disable Default Nginx site
sudo rm /etc/nginx/sites-enabled/default


# NGINX SETUP: 
sudo vim /etc/nginx/sites-available/fruitfall

server {
    listen 8080;
    server_name fruitfall.thecodemountains.com;
    return 301 https://$host$request_uri;
}


server {
    listen 8443 ssl;
    server_name fruitfall.thecodemountains.com;

    ssl_certificate /etc/letsencrypt/live/fruitfall.thecodemountains.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fruitfall.thecodemountains.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000; # Node.js app port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}


# Enable Site
sudo ln -s /etc/nginx/sites-available/fruitfall /etc/nginx/sites-enabled/

# Restart Nginx
sudo nginx -t
sudo systemctl restart nginx



# CERTBOT SETUP 
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d fruitfall.thecodemountains.com 

# OUTPUT

sudo certbot certonly --standalone -d fruitfall.thecodemountains.com 
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for fruitfall.thecodemountains.com

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/fruitfall.thecodemountains.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/fruitfall.thecodemountains.com/privkey.pem
This certificate expires on 2024-02-09.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -





# Check which ports are actively listening
ss -tuln | grep -E ':(80|443|8081|8080|8443|3000)\>'
netstat -tuln | grep -E ':(80|443|8081|8080|8443|3000)\>'

## OUTPUT 

ss -tuln | grep -E ':(80|443|8081|8080|8443|3000)\>'
tcp   LISTEN 0      511                             0.0.0.0:80         0.0.0.0:*          
tcp   LISTEN 0      511                             0.0.0.0:443        0.0.0.0:*          
tcp   LISTEN 0      4096                          127.0.0.1:8443       0.0.0.0:*          
tcp   LISTEN 0      4096                          127.0.0.1:8081       0.0.0.0:*          
tcp   LISTEN 0      511                                   *:3000             *:*    


## OUTPUT 

netstat -tuln | grep -E ':(80|443|8081|8080|8443|3000)\>'
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN     
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:8443          0.0.0.0:*               LISTEN     
tcp        0      0 127.0.0.1:8081          0.0.0.0:*               LISTEN     
tcp6       0      0 :::3000                 :::*                    LISTEN     





```
