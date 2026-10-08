#!/bin/bash
set -euo pipefail
node /app/dist/server/entry.mjs &
astro_pid=$!
nginx -g 'daemon off;' &
nginx_pid=$!
trap 'kill "$astro_pid" "$nginx_pid" 2>/dev/null || true; wait || true' EXIT
trap 'exit 0' TERM INT
# If either child exits, stop both so Docker restarts the complete service.
set +e
wait -n "$astro_pid" "$nginx_pid"
status=$?
exit "${status:-1}"
