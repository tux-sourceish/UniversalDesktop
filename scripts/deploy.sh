#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the target directory is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <target_live_directory>"
  echo "Example: $0 /var/www/ullrichbau.app/dist"
  exit 1
fi

LIVE_DIR="$1"
PROJECT_ROOT=$(pwd)
WEB_USER="www-data"
WEB_GROUP="www-data"

echo "--- Starting UniversalDesktop Deployment ---"
echo "Project Root: $PROJECT_ROOT"
echo "Live Directory: $LIVE_DIR"

echo "1. Building UniversalDesktop..."
npx vite build

echo "2. Removing old deployment directory: $LIVE_DIR"
rm -rf "$LIVE_DIR"

echo "3. Moving new build to live directory: $LIVE_DIR"
mv "$PROJECT_ROOT/dist" "$LIVE_DIR"

echo "4. Setting ownership for web server user: $WEB_USER:$WEB_GROUP"
chown -R "$WEB_USER":"$WEB_GROUP" "$LIVE_DIR"

echo "5. Restarting Apache to clear cache (optional, but recommended)"
systemctl restart apache2

echo "--- Deployment Complete! ---"
