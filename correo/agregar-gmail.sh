#!/bin/bash
#
# Correo de joseadrianzen.com — agrega Gmail al mismo correo web.
#
# Peras y manzanas: el correo web de joseadrianzen.com/correo hoy abre un solo
# buzón, yo@joseadrianzen.com. Esto le pone un selector de cuentas arriba, para
# pasar al Gmail sin salir ni volver a entrar. Cada cuenta sigue en su servidor
# (Hostinger y Google). Aquí no se copia ni se mueve ningún correo.
#
# Técnico: instala el plugin ident_switch 5.0.5 (Gecka, AGPL 3.0, para
# Roundcube 1.6 o más, pide PHP 8.2 o más) en la Roundcube que ya está
# instalada, crea su tabla en la base SQLite y lo activa en la configuración.
#
# Se ejecuta EN EL SERVIDOR de Hostinger, por SSH, no en la Mac:
#   bash agregar-gmail.sh
# No pide ni guarda ninguna contraseña. La contraseña de Gmail la escribes tú
# después, dentro del correo (ver AGREGAR-GMAIL.md).
#
set -euo pipefail

DOMINIO="joseadrianzen.com"
PLUGIN_VER="5.0.5"
RAMA="${RAMA:-correo-gmail}"   # rama de GitHub de donde salen los archivos de la piel
REPO="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo"
PLUGIN_URL="https://github.com/Gecka-Apps/roundcube-ident_switch/archive/refs/tags/${PLUGIN_VER}.tar.gz"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
paso()  { printf '\n\033[33m── %s\033[0m\n' "$*"; }
fallo() { rojo "FALLO: $*"; exit 1; }

paso "1/7  Buscando la Roundcube instalada"
if   [ -d "$HOME/domains/$DOMINIO/roundcube" ]; then RC="$HOME/domains/$DOMINIO/roundcube"
elif [ -d "$HOME/domains/$DOMINIO/public_html/correo/program" ]; then RC="$HOME/domains/$DOMINIO/public_html/correo"
else fallo "No encuentro la Roundcube. Dime qué sale con: ls ~/domains/$DOMINIO"; fi
echo "     roundcube en: $RC"
[ -f "$RC/config/config.inc.php" ] || fallo "No hay $RC/config/config.inc.php."
[ -e "$RC/plugins/ident_switch" ] && fallo "El plugin ya está en $RC/plugins/ident_switch. No toco nada."
grep -q "RCMAIL_VERSION', '1\.[6-9]" "$RC/program/include/iniset.php" 2>/dev/null \
  || grep -q "RCMAIL_VERSION', '1\.[6-9]" "$RC/program/lib/Roundcube/bootstrap.php" 2>/dev/null \
  || rojo "     aviso: no pude leer la versión de Roundcube; el plugin pide 1.6 o más"

paso "2/7  Comprobando PHP (el plugin pide 8.2 o más)"
PHPV=$(php -r 'echo PHP_VERSION;'); echo "     php $PHPV"
php -r 'exit(version_compare(PHP_VERSION, "8.2.0", ">=") ? 0 : 1);' \
  || fallo "Hace falta PHP 8.2 o más. Cámbialo en hPanel > Avanzado > Configuración PHP y vuelve a correr esto."
php -r 'exit(extension_loaded("ctype") ? 0 : 1);' || fallo "Falta la extensión ctype de PHP (hPanel > Configuración PHP > Extensiones)."

paso "3/7  Comprobando que el servidor puede hablar con Gmail"
# (SALTAR_RED=1 solo sirve para probar el script fuera del servidor; en Hostinger no se usa)
[ "${SALTAR_RED:-0}" = 1 ] && echo "     prueba: se salta este paso" || \
for HP in imap.gmail.com:993 smtp.gmail.com:465; do
  H=${HP%:*}; P=${HP#*:}
  php -r "\$s=@fsockopen('ssl://$H',$P,\$e,\$m,10); exit(\$s?0:1);" \
    && echo "     $HP responde" \
    || fallo "El hosting no llega a $HP. Hostinger puede estar cerrando ese puerto de salida: hay que pedirles que lo abran."
done

paso "4/7  Bajando ident_switch $PLUGIN_VER"
TMP=$(mktemp -d)
if [ -n "${PLUGIN_TAR:-}" ]; then cp "$PLUGIN_TAR" "$TMP/p.tar.gz"   # solo para probar fuera del servidor
else curl -fsSL "$PLUGIN_URL" -o "$TMP/p.tar.gz" || fallo "No pude bajar $PLUGIN_URL"; fi
tar xzf "$TMP/p.tar.gz" -C "$TMP"
mv "$TMP"/roundcube-ident_switch-* "$RC/plugins/ident_switch"
rm -rf "$TMP"
echo "     en $RC/plugins/ident_switch"
# Arreglo de una línea: sin esto el plugin escribe un aviso de PHP en cada clic ("archive_mbox_default_iswitch").
# Si el servidor muestra los avisos dentro de la respuesta, la lista de correos de la otra cuenta sale vacía (2 oct 2026).
sed -i 's/\$val = \$_SESSION\[\$otherKey\] ?? \$_SESSION\[\$defaultKey\];/$val = $_SESSION[$otherKey] ?? $_SESSION[$defaultKey] ?? null;/' "$RC/plugins/ident_switch/ident_switch.php"

paso "5/7  Configuración del plugin (Gmail ya preconfigurado) y piel"
cat > "$RC/plugins/ident_switch/config.inc.php" <<'PHP'
<?php
/* ident_switch en joseadrianzen.com/correo.
 * Con esto, al crear la identidad de Gmail no hay que escribir servidores:
 * se llenan solos. Servidores de Google (developers.google.com/workspace/gmail/imap/imap-smtp,
 * consultado el 1 de octubre de 2026): IMAP imap.gmail.com:993 con SSL, SMTP smtp.gmail.com:465 con SSL. */
$config['ident_switch.preconfig'] = [
    'gmail.com' => [
        'imap_host' => 'ssl://imap.gmail.com:993',
        'smtp_host' => 'ssl://smtp.gmail.com:465',
        'user'      => 'email',   // se entra con la dirección completa
        'readonly'  => true,      // los servidores quedan fijos en la pantalla
    ],
];
$config['ident_switch.check_mail']  = true;   // cuenta los no leídos de la otra cuenta
$config['ident_switch.round_robin'] = false;
PHP
# La pantalla del plugin en español (el plugin trae inglés, alemán, francés y otros, no español).
cat > "$RC/plugins/ident_switch/localization/es_ES.inc" <<'PHP'
<?php
/* ident_switch en español, para joseadrianzen.com/correo (traducción propia del en_US.inc de la versión 5.0.5). */
$labels = array();
$labels['form.caption'] = 'Cuenta aparte';
$labels['form.description'] = 'Usa esta identidad como una cuenta aparte, con su propio servidor de correo.';
$labels['form.preconfig_only_warning'] = 'No se puede configurar una cuenta aparte para el dominio %s.';
$labels['form.common.general'] = 'General';
$labels['form.common.mode'] = 'Tipo de cuenta';
$labels['form.common.mode.primary'] = 'La misma cuenta';
$labels['form.common.mode.separate'] = 'Cuenta aparte';
$labels['form.common.mode.hint'] = 'Une esta identidad a la cuenta de siempre, o úsala como una cuenta aparte con su propio servidor.';
$labels['form.common.label'] = 'Nombre en el selector';
$labels['form.common.label.hint'] = 'Lo que se ve en el selector de cuentas. Si lo dejas vacío, sale el correo.';
$labels['err.label.long'] = 'El nombre en el selector es muy largo (máximo 32 caracteres).';
$labels['form.imap.caption'] = 'Correo que llega (IMAP)';
$labels['form.imap.host'] = 'Servidor de entrada';
$labels['form.imap.security'] = 'Seguridad';
$labels['form.imap.port'] = 'Puerto';
$labels['form.imap.delimiter'] = 'Separador de carpetas';
$labels['form.imap.delimiter.auto'] = 'Automático';
$labels['form.imap.delimiter.manual'] = 'Manual';
$labels['form.imap.username'] = 'Usuario';
$labels['form.imap.password'] = 'Contraseña';
$labels['err.user.long'] = 'El usuario es muy largo (máximo 64 caracteres).';
$labels['form.smtp.caption'] = 'Correo que sale (SMTP)';
$labels['form.smtp.host'] = 'Servidor de salida';
$labels['form.smtp.security'] = 'Seguridad';
$labels['form.smtp.port'] = 'Puerto';
$labels['form.smtp.auth'] = 'Autenticación';
$labels['form.smtp.auth.imap'] = 'La misma de entrada';
$labels['form.smtp.auth.none'] = 'Ninguna';
$labels['form.smtp.auth.custom'] = 'Otra';
$labels['form.smtp.username'] = 'Usuario';
$labels['form.smtp.password'] = 'Contraseña';
$labels['form.sieve.caption'] = 'Filtros (Sieve)';
$labels['form.sieve.host'] = 'Servidor';
$labels['form.sieve.security'] = 'Seguridad';
$labels['form.sieve.port'] = 'Puerto';
$labels['form.sieve.auth'] = 'Autenticación';
$labels['form.sieve.auth.imap'] = 'La misma de entrada';
$labels['form.sieve.auth.none'] = 'Ninguna';
$labels['form.sieve.auth.custom'] = 'Otra';
$labels['form.sieve.username'] = 'Usuario';
$labels['form.sieve.password'] = 'Contraseña';
$labels['form.notify.caption'] = 'Avisos';
$labels['form.notify.check'] = 'Revisar si hay correo nuevo';
$labels['form.notify.basic'] = 'Marcar la pestaña';
$labels['form.notify.sound'] = 'Sonido';
$labels['form.notify.desktop'] = 'Aviso en la pantalla';
$labels['form.notify.default'] = 'como siempre';
$labels['form.notify.on'] = 'Sí';
$labels['form.notify.off'] = 'No';
$labels['form.notify.requires_newmail_notifier'] = 'Los avisos necesitan el plugin newmail_notifier.';
$labels['form.security.none'] = 'Ninguna';
$labels['form.security.starttls'] = 'STARTTLS';
$labels['form.security.ssl'] = 'SSL/TLS';
$labels['form.security.none_warning'] = 'Sin cifrado, la contraseña y los correos pueden ser leídos en el camino. Usa SSL/TLS o STARTTLS.';
$labels['err.host.long'] = 'El nombre del servidor es muy largo (máximo 64 caracteres).';
$labels['err.port.num'] = 'El puerto tiene que ser un número.';
$labels['err.port.range'] = 'El puerto tiene que estar entre 1 y 65535.';
$labels['err.imap.connect'] = 'No se pudo entrar al correo. Revisa el servidor, el puerto, el usuario y la contraseña.';
$labels['err.smtp.connect'] = 'No se pudo conectar para enviar. Revisa el servidor, el puerto, el usuario y la contraseña.';
$labels['err.sieve.connect'] = 'No se pudo conectar a los filtros. Revisa el servidor, el puerto, el usuario y la contraseña.';
$labels['err.save'] = 'No se pudo guardar la cuenta (error de la base de datos).';
PHP
php -l "$RC/plugins/ident_switch/localization/es_ES.inc" >/dev/null || fallo "La traducción quedó con error."
echo "     listo"

# La piel del sitio tiene que ubicar el selector (el plugin solo se ubica en las pieles de fábrica).
# Se bajan sus dos archivos del repositorio y se guarda copia de los que había.
for F in adrianzen.js styles/adrianzen.css; do
  D="$RC/skins/adrianzen/$F"
  [ -f "$D" ] && cp "$D" "$D.antes-de-gmail"
  if [ -n "${PIEL_LOCAL:-}" ]; then cp "$PIEL_LOCAL/$F" "$D"   # solo para probar fuera del servidor
  else curl -fsSL -o "$D" "$REPO/skins/adrianzen/$F" || fallo "No pude bajar skins/adrianzen/$F de $REPO (¿subiste la rama $RAMA a GitHub?)"; fi
  grep -q "ident_switch" "$D" || fallo "skins/adrianzen/$F no trae el ajuste del selector. ¿Es la rama correcta?"
done
echo "     piel actualizada (copias en *.antes-de-gmail)"

paso "6/7  Creando su tabla en la base de datos"
cd "$RC"
# Instalación nueva: se crea la tabla con el esquema inicial. Si ya existía (reinstalación), solo se actualiza.
# Ojo: el README del plugin dice correr updatedb.sh, pero en una base nueva eso falla ("no such table").
# Se probó el 1 de octubre de 2026 con Roundcube 1.7.2 y SQLite.
HAY=$(php -r 'define("INSTALL_PATH", getcwd()."/"); require "program/include/clisetup.php"; $db=rcmail::get_instance()->get_dbh(); echo in_array($db->table_name("ident_switch"), (array)$db->list_tables()) ? "si" : "no";')
if [ "$HAY" = "no" ]; then
  bin/initdb.sh --dir=plugins/ident_switch/SQL || fallo "No se pudo crear la tabla. Mira logs/errors.log"
else
  bin/updatedb.sh --package=ident_switch --dir=plugins/ident_switch/SQL || fallo "No se pudo actualizar la tabla. Mira logs/errors.log"
fi
HAY=$(php -r 'define("INSTALL_PATH", getcwd()."/"); require "program/include/clisetup.php"; $db=rcmail::get_instance()->get_dbh(); echo in_array($db->table_name("ident_switch"), (array)$db->list_tables()) ? "si" : "no";')
[ "$HAY" = "si" ] || fallo "La tabla ident_switch no quedó creada."
echo "     tabla ident_switch lista"

paso "7/7  Activándolo (con copia de la configuración)"
CFG="$RC/config/config.inc.php"
BK="$CFG.antes-de-gmail.$(date +%Y%m%d-%H%M%S)"
cp "$CFG" "$BK"
if grep -q "^\$config\['plugins'\].*'ident_switch'" "$CFG"; then   # mira el arreglo, no los comentarios
  echo "     ya estaba activado"
elif grep -q "^\$config\['plugins'\] = \[" "$CFG"; then
  sed -i "s/^\$config\['plugins'\] = \[/\$config['plugins'] = ['ident_switch', /" "$CFG"
elif grep -q "^\$config\['plugins'\] = array(" "$CFG"; then
  sed -i "s/^\$config\['plugins'\] = array(/\$config['plugins'] = array('ident_switch', /" "$CFG"
else
  printf "\n\$config['plugins'][] = 'ident_switch';\n" >> "$CFG"
fi
# Para crear la identidad del Gmail, la pantalla de identidades tiene que dejar escribir otro correo.
# La configuración original tenía identities_level = 1, que deja el correo fijo: con eso el plugin
# no aparece (se comprobó el 1 de octubre de 2026). Se pasa a 0: varias identidades, todo editable.
if ! grep -q "^\$config\['identities_level'\] *= *0;" "$CFG"; then
  printf "\n/* Gmail en el mismo correo (agregar-gmail.sh): la identidad nueva necesita poder llevar otro correo. */\n\$config['identities_level'] = 0;\n" >> "$CFG"
  echo "     identities_level pasa a 0"
fi
php -l "$CFG" >/dev/null || { cp "$BK" "$CFG"; fallo "La configuración quedó con error. Se volvió a la copia."; }
grep -n "plugins" "$CFG" | head -3

verde "
Listo. Ahora, desde la Mac (AGREGAR-GMAIL.md, pasos 2 y 3):
  1. Crea una contraseña de aplicación en tu cuenta de Google.
  2. Entra a https://$DOMINIO/correo > Ajustes > Identidades > Crear,
     elige 'Cuenta separada', pon tu Gmail y esa contraseña.
Para deshacer: borra $RC/plugins/ident_switch y vuelve a la copia $BK"
