#!/bin/bash
# Meet y Calendar con dos cuentas de Google (Personal y Hannah) dentro del correo.
# Se corre en el servidor, por SSH. No pide ni guarda contraseñas.
set -euo pipefail
RAMA="${RAMA:-portada-diseno}"
BASE="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo/plugins"
RC="$HOME/domains/joseadrianzen.com/roundcube"
[ -d "$RC/program" ] || { echo "FALLO: no encuentro $RC"; exit 1; }
HOY=$(date +%Y%m%d-%H%M%S)

bajar() {   # $1 plugin, resto archivos
  local P="$1"; shift
  for F in "$@"; do
    mkdir -p "$(dirname "$RC/plugins/$P/$F")"
    [ -f "$RC/plugins/$P/$F" ] && cp "$RC/plugins/$P/$F" "$RC/plugins/$P/$F.antes-hannah-$HOY"
    curl -fsSL "$BASE/$P/$F" -o "$RC/plugins/$P/$F" || { echo "FALLO: no pude bajar $P/$F"; exit 1; }
  done
}

echo "── 1/2  Reuniones (cámara): selector Personal o Hannah"
bajar reunion reunion.php reunion.js reunion.css config.inc.php config.inc.php.dist skins/elastic/templates/panel.html
php -l "$RC/plugins/reunion/reunion.php" >/dev/null && php -l "$RC/plugins/reunion/config.inc.php" >/dev/null
grep -c "gerencia@hannahlab.com" "$RC/plugins/reunion/config.inc.php" | sed 's/^/     cuentas Hannah en la configuración: /'

echo "── 2/2  Agenda (calendario): Personal y Hannah lado a lado"
bajar agenda agenda.php agenda.js agenda.css config.inc.php config.inc.php.dist skins/elastic/templates/panel.html
php -l "$RC/plugins/agenda/agenda.php" >/dev/null && php -l "$RC/plugins/agenda/config.inc.php" >/dev/null
grep -c "age-marcos" "$RC/plugins/agenda/agenda.js" | sed 's/^/     cuadros por cuenta: /'

echo "Listo. Recarga el correo con Cmd+Shift+R."
echo "Para volver atrás: cada archivo cambiado dejó una copia con el final .antes-hannah-$HOY"
