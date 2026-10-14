sh
#!/bin/sh
set -e

java -jar /app/app.jar &
nginx -g 'daemon off;'
