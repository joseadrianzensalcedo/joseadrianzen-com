#!/bin/bash
#
# Baja las bases gratuitas de DB-IP que dicen de qué país, región, ciudad y red viene una visita.
# DB-IP publica una nueva cada mes. Se corre una vez al instalar y después una vez al mes (cron de hPanel).
#
# Licencia de las bases: CC BY 4.0, pide mostrar "IP Geolocation by DB-IP" con enlace a db-ip.com
# (el panel del correo ya lo muestra).
#
# SUPUESTO sin verificar: la dirección de descarga sigue el formato
#   https://download.db-ip.com/free/dbip-city-lite-AAAA-MM.mmdb.gz
# No pude abrir db-ip.com desde aquí el 1 de octubre de 2026. Si falla, el script lo dice y no toca nada.
#
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR/geo"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

bajar() {   # $1 = city | asn
  for MES in "$(date +%Y-%m)" "$(date -d "$(date +%Y-%m-15) -1 month" +%Y-%m)"; do
    URL="https://download.db-ip.com/free/dbip-$1-lite-$MES.mmdb.gz"
    if curl -fsSL "$URL" -o "$TMP/$1.gz"; then
      gunzip -f "$TMP/$1.gz"
      # Se prueba antes de reemplazar: si la base no abre, se queda la anterior.
      php -r 'require $argv[1]."/lib/MaxMind/Db/Reader.php"; foreach (["Decoder","InvalidDatabaseException","Metadata","Util"] as $c) require $argv[1]."/lib/MaxMind/Db/Reader/$c.php";
              $r = new MaxMind\Db\Reader($argv[2]); echo "     ", $r->metadata()->databaseType, " ", date("Y-m-d", $r->metadata()->buildEpoch), "\n";' "$DIR" "$TMP/$1" \
        || { echo "La base $1 de $MES no abre. Queda la anterior."; return 1; }
      mv "$TMP/$1" "$DIR/geo/dbip-$1-lite.mmdb"
      echo "     dbip-$1-lite.mmdb ($MES) lista"
      return 0
    fi
  done
  echo "No pude bajar dbip-$1-lite. Revisa la dirección en https://db-ip.com/db/lite.php"; return 1
}
ok=0
bajar city || ok=1
bajar asn || ok=1
exit $ok
