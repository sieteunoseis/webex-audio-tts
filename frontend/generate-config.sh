#!/bin/sh

# Create the runtime config file
cat <<EOF > /usr/share/nginx/html/config.js
window.APP_CONFIG = {
  WEBEX_CLIENT_ID: "${VITE_WEBEX_CLIENT_ID}",
  WEBEX_REDIRECT_URI: "${VITE_WEBEX_REDIRECT_URI}",
  WEBEX_SCOPE: "${VITE_WEBEX_SCOPE:-spark-admin:telephony_config_write spark-admin:locations_read}",
  BRANDING_URL: "${VITE_BRANDING_URL:-https://automate.builders}",
  BRANDING_NAME: "${VITE_BRANDING_NAME:-Automate Builders}"
};
EOF

echo "Generated config.js contents:"
cat /usr/share/nginx/html/config.js

echo "File permissions:"
ls -l /usr/share/nginx/html/config.js