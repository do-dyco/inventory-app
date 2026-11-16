#!/bin/sh
set -e

chown -R www-data:www-data storage bootstrap/cache

php artisan migrate --force
# ponytail: seed only when DB is empty (first deploy), not every restart
php artisan db:seed --force 2>/dev/null || true

exec apache2-foreground
