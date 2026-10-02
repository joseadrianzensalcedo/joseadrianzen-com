#!/bin/bash
#
# Medidor de visitas de joseadrianzen.com: instalación en el servidor de Hostinger, por SSH.
#
# Peras y manzanas: deja en el servidor tres cosas.
#   1. La carpeta ~/domains/joseadrianzen.com/medidor, fuera de public_html, con la base de visitas.
#   2. Las bases gratuitas que dicen de dónde viene cada visita (DB-IP).
#   3. El candado dentro del correo (plugin "medidor" de Roundcube), que solo ve yo@joseadrianzen.com.
# La puerta /v/ que recibe los datos llega con la web (public/v/index.php) cuando se publica la rama.
#
# No pide ni guarda contraseñas. Corre:  bash instalar-medidor.sh
#
set -euo pipefail
DOMINIO="joseadrianzen.com"
RAMA="${RAMA:-portada-diseno}"
REPO="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}"
BASE="${BASE_PRUEBA:-$HOME/domains/$DOMINIO}"   # BASE_PRUEBA y LOCAL solo sirven para probar fuera del servidor

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
paso()  { printf '\n\033[33m── %s\033[0m\n' "$*"; }
fallo() { rojo "FALLO: $*"; exit 1; }
traer() {   # $1 ruta en el repositorio, $2 destino
  mkdir -p "$(dirname "$2")"
  if [ -n "${LOCAL:-}" ]; then cp "$LOCAL/$1" "$2"
  else curl -fsSL "$REPO/$1" -o "$2" || fallo "No pude bajar $1 de la rama $RAMA (¿la subiste a GitHub?)"; fi
}

paso "1/6  Revisando el servidor"
[ -d "$BASE" ] || fallo "No existe $BASE"
if   [ -d "$BASE/roundcube/program" ]; then RC="$BASE/roundcube"
elif [ -d "$BASE/public_html/correo/program" ]; then RC="$BASE/public_html/correo"
else fallo "No encuentro la Roundcube. Dime qué sale con: ls $BASE"; fi
echo "     roundcube en $RC"
php -r 'exit(version_compare(PHP_VERSION, "8.1.0", ">=") ? 0 : 1);' || fallo "Hace falta PHP 8.1 o más (hPanel > Avanzado > Configuración PHP)."
php -r 'exit(extension_loaded("pdo_sqlite") ? 0 : 1);' || fallo "Falta la extensión pdo_sqlite de PHP (hPanel > Configuración PHP > Extensiones)."
php -r 'exit(extension_loaded("mbstring") ? 0 : 1);' || fallo "Falta la extensión mbstring de PHP."
MED="$BASE/medidor"
echo "     medidor en $MED"

paso "2/6  Archivos del medidor"
for F in lib/medidor.php lib/MaxMind/LICENSE lib/MaxMind/Db/Reader.php lib/MaxMind/Db/Reader/Decoder.php \
         lib/MaxMind/Db/Reader/InvalidDatabaseException.php lib/MaxMind/Db/Reader/Metadata.php lib/MaxMind/Db/Reader/Util.php \
         publico/index.php publico/.htaccess sql/esquema.sql config.ejemplo.php actualizar-geo.sh; do
  traer "medidor/$F" "$MED/$F"
done
mkdir -p "$MED/datos" "$MED/geo"
chmod 750 "$MED/datos"
for F in $(cd "$MED" && find . -name '*.php'); do php -l "$MED/$F" >/dev/null || fallo "$F quedó con error."; done
echo "     listo"

paso "3/6  Bases de lugar y red (DB-IP)"
bash "$MED/actualizar-geo.sh" || rojo "     aviso: sin estas bases el medidor funciona igual, pero sin país ni ciudad. Se puede repetir después."

paso "4/6  Candado en el correo (plugin medidor)"
P="$RC/plugins/medidor"
for F in medidor.php datos.php medidor.js medidor.css medidor-boton.css config.inc.php.dist \
         localization/es_ES.inc localization/en_US.inc skins/elastic/templates/panel.html; do
  traer "correo/plugins/medidor/$F" "$P/$F"
done
cat > "$P/config.inc.php" <<PHP
<?php
\$config['medidor_usuarios'] = ['yo@$DOMINIO'];
\$config['medidor_dir'] = '$MED';
PHP
php -l "$P/medidor.php" >/dev/null && php -l "$P/datos.php" >/dev/null || fallo "El plugin quedó con error."
CFG="$RC/config/config.inc.php"
BK="$CFG.antes-del-medidor.$(date +%Y%m%d-%H%M%S)"
cp "$CFG" "$BK"
if grep -q "^\$config\['plugins'\].*'medidor'" "$CFG"; then echo "     ya estaba activado"
elif grep -q "^\$config\['plugins'\] = \[" "$CFG"; then sed -i "s/^\$config\['plugins'\] = \[/\$config['plugins'] = ['medidor', /" "$CFG"
elif grep -q "^\$config\['plugins'\] = array(" "$CFG"; then sed -i "s/^\$config\['plugins'\] = array(/\$config['plugins'] = array('medidor', /" "$CFG"
else printf "\n\$config['plugins'][] = 'medidor';\n" >> "$CFG"; fi
php -l "$CFG" >/dev/null || { cp "$BK" "$CFG"; fallo "La configuración del correo quedó con error. Se volvió a la copia."; }
echo "     activado (copia en $BK)"

paso "5/6  Base de visitas"
php -r 'require $argv[1]."/lib/medidor.php"; medidor_db(); echo "     base creada en ", medidor_config()["base"], "\n";' "$MED"

paso "6/6  Prueba de la puerta /v/"
if [ -z "${LOCAL:-}" ]; then
  C=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://$DOMINIO/v/" -H "Origin: https://$DOMINIO" -A "instalar-medidor" --data '{"s":"pruebadeinstalacion01","e":[]}' || true)
  case "$C" in
    204) echo "     /v/ responde bien";;
    404) rojo "     /v/ todavía no existe: llega cuando publiques la web nueva (rama $RAMA a main).";;
    *)   rojo "     /v/ respondió $C. Mira ~/domains/$DOMINIO/logs o avísame.";;
  esac
fi

verde "
Listo.
  El candado aparece en https://$DOMINIO/correo al entrar como yo@$DOMINIO.
  Al abrirlo una vez, tu navegador deja de contarse como visita. En otro aparato,
  abre una vez el correo o entra a la web con #no-medir al final de la dirección.
  Cada mes: en hPanel > Avanzado > Cron, agrega
     0 4 3 * *  bash $MED/actualizar-geo.sh
Para deshacer: borra $P y vuelve a la copia $BK. La carpeta $MED se puede borrar entera."
