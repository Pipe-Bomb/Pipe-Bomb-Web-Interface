![Pipe Bomb Banner](https://raw.githubusercontent.com/Pipe-Bomb/.github/master/assets/github/Banner.jpg)

&nbsp;

# Pipe Bomb Web Interface
### Official web-based interface for Pipe Bomb built with desktops in mind.

&nbsp;

## To Run Locally

1. Install dependencies (do this after first download or after dependency changes)

```sh
npm install
```

2. Start development environment

```sh
npm run dev
```

Pipe Bomb Web Interface is developed using [Vite](https://vitejs.dev/), so any changes you make will immediately be reflected in your browser.

&nbsp;

## To Compile

1. Install dependencies (do this after first download or after dependency changes)

```sh
npm install
```

2. Build website files

```sh
npm run build
```

Compiled HTML, CSS and JS files are located in the `dist` directory.

&nbsp;

## To Host w/ NGINX

Below is a very basic configuration for hosting the Pipe Bomb Web Interface using [NGINX](https://www.nginx.com). To use this config, store the files that were compiled via the instructions above in the `/var/www/PipeBomb-Interface/html` directory. Manually create any directories that don't exist along the way.

```nginx
server {
	listen 80;
	listen [::]:80;

	root /var/www/PipeBomb-Interface/html;

	index index.html;

	server_name _; # replace "_" with your domain name if hosted on server with other websites

	location / {
		try_files $uri /index.html;
	}

    location = /Config.json {
        add_header Access-Control-Allow-Origin *;
        try_files $uri =404;
    }
}
```
