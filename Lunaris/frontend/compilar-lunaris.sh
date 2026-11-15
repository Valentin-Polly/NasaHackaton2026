#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# Wine (necesario para incrustar icono y nombre en el .exe desde Linux)
if ! command -v wine >/dev/null 2>&1; then
  sudo dpkg --add-architecture i386
  sudo apt update
  sudo apt install -y wine64 wine32 libwine
fi

export WINEDEBUG=-all
rm -rf node_modules/.cache
npm install
npm run dist:win

echo
echo "Listo. Los .exe estan en: $(pwd)/release"
ls -lh release/*.exe
