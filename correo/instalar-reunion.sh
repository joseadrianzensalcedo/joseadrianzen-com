#!/bin/bash
# Cámara de reuniones en el correo de joseadrianzen.com (plugin "reunion"). Se corre en el servidor, por SSH.
set -euo pipefail
RAMA="${RAMA:-portada-diseno}"
REPO="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo/plugins/reunion"
RC="$HOME/domains/joseadrianzen.com/roundcube"
[ -d "$RC/program" ] || { echo "FALLO: no encuentro $RC"; exit 1; }
for F in reunion.php reunion.js reunion.css reunion-boton.css config.inc.php config.inc.php.dist \
         localization/es_ES.inc localization/en_US.inc skins/elastic/templates/panel.html; do
  mkdir -p "$(dirname "$RC/plugins/reunion/$F")"
  curl -fsSL "$REPO/$F" -o "$RC/plugins/reunion/$F" || { echo "FALLO: no pude bajar $F (¿subiste la rama $RAMA?)"; exit 1; }
done
php -l "$RC/plugins/reunion/reunion.php" >/dev/null
CFG="$RC/config/config.inc.php"; BK="$CFG.antes-de-reunion.$(date +%Y%m%d-%H%M%S)"; cp "$CFG" "$BK"
grep -q "^\$config\['plugins'\].*'reunion'" "$CFG" || sed -i "s/^\$config\['plugins'\] = \[/\$config['plugins'] = ['reunion', /" "$CFG"
php -l "$CFG" >/dev/null || { cp "$BK" "$CFG"; echo "FALLO: la configuración quedó mal, se volvió a la copia"; exit 1; }
grep -n "^\$config\['plugins'\]" "$CFG"
echo "Listo. Recarga el correo: la cámara aparece en la barra de la izquierda. Copia de la configuración en $BK"
