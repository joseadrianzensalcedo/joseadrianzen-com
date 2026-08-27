#!/bin/bash
#
# Correo de joseadrianzen.com — instalador.
#
# Esto se ejecuta EN EL SERVIDOR de Hostinger, no en tu Mac. Hace solo lo que
# esta escrito abajo y avisa antes de cada paso. Si algo falla, para y dice
# que fallo: no deja nada a medias sin decirlo.
#
# Uso:
#   bash instalar.sh
#
set -euo pipefail

DOMINIO="joseadrianzen.com"
RC_VER="1.7.2"
RAMA="staging"
REPO="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
paso()  { printf '\n\033[33m── %s\033[0m\n' "$*"; }

fallo() { rojo "FALLO: $*"; exit 1; }

# ── 0. donde estamos ────────────────────────────────────────────────────
paso "0/9  Buscando la carpeta del dominio"

if [ -d "$HOME/domains/$DOMINIO/public_html" ]; then
  RAIZ="$HOME/domains/$DOMINIO"
elif [ -d "$HOME/public_html" ]; then
  RAIZ="$HOME"
else
  fallo "No encuentro public_html. Entra por SSH y dime que sale con: ls ~ ; ls ~/domains"
fi

PUB="$RAIZ/public_html"
DEST="$RAIZ/roundcube"
echo "     dominio en: $RAIZ"

if [ -e "$DEST" ]; then
  fallo "Ya existe $DEST. Si quieres empezar de cero, borralo tu a mano primero
       (rm -rf $DEST $PUB/correo) y vuelve a lanzar esto."
fi

# ── 1. comprobaciones ───────────────────────────────────────────────────
paso "1/9  Comprobando PHP"

command -v php >/dev/null || fallo "No hay php en la linea de comandos."
PHPV=$(php -r 'echo PHP_VERSION;')
echo "     php $PHPV"
php -r 'exit(version_compare(PHP_VERSION, "8.1.0", ">=") ? 0 : 1);' \
  || fallo "Roundcube 1.7 necesita PHP 8.1 o mas. Cambialo en hPanel > Avanzado > Configuracion PHP."

FALTAN=""
for EXT in pdo_sqlite mbstring iconv intl zip openssl session dom filter; do
  php -r "exit(extension_loaded('$EXT') ? 0 : 1);" || FALTAN="$FALTAN $EXT"
done
[ -z "$FALTAN" ] || fallo "Faltan extensiones de PHP:$FALTAN
       Se activan en hPanel > Avanzado > Configuracion PHP > Extensiones."
echo "     extensiones: todas"

command -v openssl >/dev/null || fallo "No hay openssl (hace falta para la clave de sesion)."

# ── 2. descarga ─────────────────────────────────────────────────────────
paso "2/9  Descargando Roundcube $RC_VER"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
TAR="roundcubemail-${RC_VER}-complete.tar.gz"
curl -fsSL -o "$TMP/$TAR" \
  "https://github.com/roundcube/roundcubemail/releases/download/${RC_VER}/${TAR}" \
  || fallo "No pude descargar Roundcube. Mira si $RC_VER sigue existiendo en roundcube.net/download"
echo "     $(du -h "$TMP/$TAR" | cut -f1) descargados"

tar xzf "$TMP/$TAR" -C "$TMP"
[ -d "$TMP/roundcubemail-${RC_VER}" ] || fallo "El paquete no trae lo que esperaba."

# ── 3. colocar fuera de public_html ─────────────────────────────────────
paso "3/9  Instalando FUERA de public_html"

mv "$TMP/roundcubemail-${RC_VER}" "$DEST"
echo "     $DEST"
echo "     (asi su configuracion y su base de datos no se pueden pedir por web)"

# ── 4. publicar en /correo ──────────────────────────────────────────────
paso "4/9  Publicando en $DOMINIO/correo"

if ln -s ../roundcube/public_html "$PUB/correo" 2>/dev/null && [ -d "$PUB/correo" ]; then
  echo "     enlace simbolico creado"
  MODO="enlace"
else
  rojo "     El enlace simbolico no funciona en este servidor. Uso el plan B."
  rm -f "$PUB/correo"
  mv "$DEST" "$PUB/correo"
  DEST="$PUB/correo"
  MODO="plan B"
  cat > "$DEST/.htaccess" <<'CIERRE'
# Plan B: Roundcube vive dentro de public_html, asi que hay que tapar a mano
# lo que normalmente tapa estar fuera.
RedirectMatch 404 ^/correo/(config|logs|temp|SQL|bin|installer|vendor|program)/
RedirectMatch 404 ^/correo/roundcube\.db
CIERRE
fi

# ── 5. la piel ──────────────────────────────────────────────────────────
paso "5/9  Poniendo la piel del sitio"

PIEL="$DEST/skins/adrianzen"
mkdir -p "$PIEL/styles" "$PIEL/images" "$PIEL/templates/includes"

# Los ficheros se cogen de al lado del script si estan (cuando se ha subido la
# carpeta correo/ entera), y si no, del repositorio publico. Asi el mismo
# script vale tanto si lo lanzo yo por SSH como si lo pegas tu a pelo.
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$AQUI/skins/adrianzen/meta.json" ]; then
  ORIGEN="local"
  echo "     origen: los ficheros que hay junto al script"
else
  ORIGEN="repo"
  echo "     origen: el repositorio publico (rama $RAMA)"
fi

baja() {  # baja <ruta-relativa-en-correo/> <destino>
  if [ "$ORIGEN" = "local" ]; then
    cp "$AQUI/$1" "$2" || fallo "No encuentro $AQUI/$1"
  else
    curl -fsSL -o "$2" "$REPO/$1" || fallo "No pude bajar $1 del repositorio.
       Comprueba que la rama '$RAMA' esta subida a GitHub con la carpeta correo/."
  fi
}
baja "skins/adrianzen/meta.json"                        "$PIEL/meta.json"
baja "skins/adrianzen/adrianzen.js"                     "$PIEL/adrianzen.js"
baja "skins/adrianzen/styles/adrianzen.css"             "$PIEL/styles/adrianzen.css"
baja "skins/adrianzen/images/logo.svg"                  "$PIEL/images/logo.svg"
baja "skins/adrianzen/templates/login.html"             "$PIEL/templates/login.html"
baja "skins/adrianzen/templates/includes/layout.html"   "$PIEL/templates/includes/layout.html"
baja "skins/adrianzen/templates/includes/footer.html"   "$PIEL/templates/includes/footer.html"
echo "     7 ficheros en skins/adrianzen/"

# Red de seguridad: estos dos nombres tumban la interfaz entera.
for PROHIBIDO in "$PIEL/ui.js" "$PIEL/styles/styles.css"; do
  [ -e "$PROHIBIDO" ] && fallo "Hay un $PROHIBIDO. Ese nombre tapa el de Elastic: borralo."
done

# ── 6. configuracion ────────────────────────────────────────────────────
paso "6/9  Configurando el buzon"

baja "config/config.inc.php" "$DEST/config/config.inc.php"

CLAVE=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-24)
[ ${#CLAVE} -eq 24 ] || fallo "No pude generar la clave de 24 caracteres."
php -r '
$f = $argv[1];
$s = file_get_contents($f);
$s = str_replace("CAMBIAR-24-CARACTERES!!!", $argv[2], $s);
file_put_contents($f, $s);
' "$DEST/config/config.inc.php" "$CLAVE"
grep -q "CAMBIAR-24-CARACTERES" "$DEST/config/config.inc.php" \
  && fallo "La clave no se sustituyo."
php -l "$DEST/config/config.inc.php" >/dev/null || fallo "El config.inc.php tiene un error de sintaxis."
chmod 600 "$DEST/config/config.inc.php"
echo "     config.inc.php escrito, con clave de sesion propia"

# ── 7. base de datos ────────────────────────────────────────────────────
paso "7/9  Creando la base de datos"

cd "$DEST"

# Roundcube crea el esquema el solo al abrir una base SQLite que no existia,
# asi que initdb.sh se encuentra las tablas ya hechas y grita "table users
# already exists". Eso NO es un fallo. Por eso no se mira si el script salio
# bien, sino si la base quedo completa, que es lo que de verdad importa.
bin/initdb.sh --dir=SQL 2>&1 | sed 's/^/     /' || true

[ -f "$DEST/roundcube.db" ] || fallo "La base de datos no aparecio donde esperaba."

TABLAS=$(php -r '
$db = new PDO("sqlite:" . $argv[1]);
echo $db->query("SELECT COUNT(*) FROM sqlite_master WHERE type=\"table\"")->fetchColumn();
' "$DEST/roundcube.db" 2>/dev/null || echo 0)
[ "$TABLAS" -ge 15 ] || fallo "La base quedo a medias: solo $TABLAS tablas. Mira $DEST/logs/errors.log"
echo "     esquema completo: $TABLAS tablas"
chmod 640 "$DEST/roundcube.db"
chmod -R 775 "$DEST/logs" "$DEST/temp"
echo "     roundcube.db creada"

# ── 8. cabeceras de seguridad ───────────────────────────────────────────
paso "8/9  Ajustando la CSP de /correo"

HT="$DEST/public_html/.htaccess"
if grep -q "Correo — bloque" "$HT" 2>/dev/null; then
  echo "     ya estaba puesto"
else
  baja "htaccess-anadir.txt" "$TMP/csp.txt"
  cat "$TMP/csp.txt" >> "$HT"
  echo "     bloque añadido a public_html/.htaccess"
fi

# ── 9. listo ────────────────────────────────────────────────────────────
paso "9/9  Hecho"

verde ""
verde "  Entra en:  https://$DOMINIO/correo"
verde "  Usuario:   yo"
verde "  Clave:     la del buzon de siempre"
verde ""
echo "  Instalado en: $DEST  ($MODO)"
echo ""
echo "  Comprueba cuatro cosas antes de darlo por bueno:"
echo "    1. Se ven los correos de la bandeja."
echo "    2. Mandas uno de prueba y aparece en Enviados."
echo "       Si no aparece: Ajustes > Carpetas. NO toques config.inc.php."
echo "    3. Un adjunto se descarga."
echo "    4. En la pestaña del navegador sale la J naranja, no el logo azul."
echo ""
echo "  Si algo se ve a medias, es la CSP: abre la consola del navegador (F12)"
echo "  y mandame lo que ponga en rojo."
