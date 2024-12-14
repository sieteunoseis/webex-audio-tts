#!/bin/sh

# Create the runtime config file
cat <<EOF > /usr/share/nginx/html/config.js
window.APP_CONFIG = {
  BRANDING_URL: "${VITE_BRANDING_URL:-https://automate.builders}",
  BRANDING_NAME: "${VITE_BRANDING_NAME:-Automate Builders}",
  TABLE_COLUMNS: "${VITE_TABLE_COLUMNS:-name,hostname,username,password,version}",
};
EOF

echo "Generated config.js contents:"
cat /usr/share/nginx/html/config.js

echo "File permissions:"
ls -l /usr/share/nginx/html/config.js