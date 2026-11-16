FROM node:22-slim AS assets
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM composer:2 AS vendor
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

FROM php:8.4-apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install mbstring pdo_mysql \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod rewrite \
    && sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Keep Apache pointed at Laravel's public document root.
WORKDIR /var/www/html
COPY --from=vendor /app/vendor/ vendor/
COPY --from=assets /app/public/build/ public/build/
COPY . .
# Fail build early if required extensions are missing from the base image.
RUN php -m | grep -qi pdo_mysql && php -m | grep -qi mbstring
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
