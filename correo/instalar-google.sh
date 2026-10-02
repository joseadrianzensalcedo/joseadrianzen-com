#!/bin/bash
# Agenda de Google dentro del correo + el correo de Hannah listo para el selector de cuentas.
# Se corre en el servidor, por SSH. No pide contraseñas.
set -euo pipefail
RAMA="${RAMA:-portada-diseno}"
REPO="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo/plugins/agenda"
DOM="$HOME/domains/joseadrianzen.com"; RC="$DOM/roundcube"
[ -d "$RC/program" ] || { echo "FALLO: no encuentro $RC"; exit 1; }

echo "── 1/3  Plugin agenda"
for F in agenda.php agenda.js agenda.css agenda-boton.css config.inc.php config.inc.php.dist \
         localization/es_ES.inc localization/en_US.inc skins/elastic/templates/panel.html; do
  mkdir -p "$(dirname "$RC/plugins/agenda/$F")"
  curl -fsSL "$REPO/$F" -o "$RC/plugins/agenda/$F" || { echo "FALLO: no pude bajar $F"; exit 1; }
done
php -l "$RC/plugins/agenda/agenda.php" >/dev/null
CFG="$RC/config/config.inc.php"; BK="$CFG.antes-de-agenda.$(date +%Y%m%d-%H%M%S)"; cp "$CFG" "$BK"
grep -q "^\$config\['plugins'\].*'agenda'" "$CFG" || sed -i "s/^\$config\['plugins'\] = \[/\$config['plugins'] = ['agenda', /" "$CFG"
php -l "$CFG" >/dev/null || { cp "$BK" "$CFG"; echo "FALLO: configuración, se volvió a la copia"; exit 1; }
grep -n "^\$config\['plugins'\]" "$CFG"

echo "── 2/3  Permiso para mostrar Google Calendar dentro del correo (regla de seguridad)"
for F in "$DOM/public_html/correo/.htaccess" "$RC/public_html/.htaccess"; do
  [ -f "$F" ] || continue
  grep -q "frame-src 'self' blob: https://calendar.google.com" "$F" && { echo "     ya estaba: $F"; continue; }
  cp "$F" "$F.antes-de-agenda"
  sed -i "s#frame-src 'self' blob:;#frame-src 'self' blob: https://calendar.google.com;#" "$F"
  grep -o "frame-src[^;]*" "$F" | sed "s#^#     $F: #"
done

echo "── 3/3  Correo de Hannah (gerencia@hannahlab.com) preconfigurado en el selector"
IS="$RC/plugins/ident_switch/config.inc.php"
if [ -f "$IS" ] && ! grep -q "hannahlab.com" "$IS"; then
  cp "$IS" "$IS.antes-de-hannah"
  cat >> "$IS" <<'PHP'
/* Hannah Lab usa Google Workspace: mismos servidores que Gmail. */
$config['ident_switch.preconfig']['hannahlab.com'] = [
    'imap_host' => 'ssl://imap.gmail.com:993',
    'smtp_host' => 'ssl://smtp.gmail.com:465',
    'user'      => 'email',
    'readonly'  => true,
];
PHP
  php -l "$IS" >/dev/null || { cp "$IS.antes-de-hannah" "$IS"; echo "FALLO: ident_switch, se volvió a la copia"; exit 1; }
  echo "     listo"
else
  echo "     ya estaba o no hay ident_switch"
fi
echo "Listo. Recarga el correo con Cmd+Shift+R: aparece el calendario en la barra."
