# FROM phalconphp/cphalcon:v5.9.2-php8.4

# USER root

# RUN apt update && apt install -y curl unzip git

# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# USER phalcon


FROM phalconphp/cphalcon:v5.9.2-php8.4

# 1. Switch to root to perform installations
USER root

# 2. Update and install necessary build tools for Composer/PHP
# 'unzip' and 'git' are required for many Composer packages to install correctly
RUN apt-get update && apt-get install -y curl git unzip \
    && rm -rf /var/lib/apt/lists/*

# 3. Copy Composer from the official image (fastest method)
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# 4. Switch back to the default phalcon user
USER phalcon
