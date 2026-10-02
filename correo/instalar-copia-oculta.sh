#!/bin/bash
# Copia oculta obligatoria a joseadrianzensalcedo@gmail.com de todo lo que sale del correo web.
# Se corre en el servidor, por SSH. No pide contraseñas.
set -euo pipefail
RAMA="${RAMA:-portada-diseno}"
BASE="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo/plugins/copia_oculta"
RC="$HOME/domains/joseadrianzen.com/roundcube"
[ -d "$RC/program" ] || { echo "FALLO: no encuentro $RC"; exit 1; }
mkdir -p "$RC/plugins/copia_oculta"
for F in copia_oculta.php config.inc.php config.inc.php.dist; do
  curl -fsSL "$BASE/$F" -o "$RC/plugins/copia_oculta/$F" || { echo "FALLO: no pude bajar $F"; exit 1; }
done
php -l "$RC/plugins/copia_oculta/copia_oculta.php" >/dev/null
CFG="$RC/config/config.inc.php"; BK="$CFG.antes-copia-oculta.$(date +%Y%m%d-%H%M%S)"; cp "$CFG" "$BK"
grep -q "^\$config\['plugins'\].*'copia_oculta'" "$CFG" || sed -i "s/^\$config\['plugins'\] = \[/\$config['plugins'] = ['copia_oculta', /" "$CFG"
php -l "$CFG" >/dev/null || { cp "$BK" "$CFG"; echo "FALLO: configuración, se volvió a la copia"; exit 1; }
grep -n "^\$config\['plugins'\]" "$CFG"
echo "Listo. Todo lo que mandes desde el correo web llega también a joseadrianzensalcedo@gmail.com."
