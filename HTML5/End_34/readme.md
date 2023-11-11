```

npm install express

sudo npm install pm2 -g

pm2 start app.js --name "fruitfall" --watch


sudo npm install -g http-server

sudo ./node_modules/.bin/http-server -p 80 -a 0.0.0.0


# NGINX SETUP: 
sudo vim /etc/nginx/sites-available/fruitfall

server {
    listen 80;
    server_name fruitfall.thecodemountains.com;

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


```