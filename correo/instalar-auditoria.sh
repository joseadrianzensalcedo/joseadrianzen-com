#!/bin/bash
# Arreglos de la auditoría del 2 oct 2026 en el correo: panel vacío oscuro, botones sin el azul de Roundcube
# en el celular y panel de reuniones en una columna en el celular. Se corre en el servidor, por SSH.
set -euo pipefail
RAMA="${RAMA:-portada-diseno}"
BASE="https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/${RAMA}/correo"
RC="$HOME/domains/joseadrianzen.com/roundcube"
[ -d "$RC/program" ] || { echo "FALLO: no encuentro $RC"; exit 1; }
HOY=$(date +%Y%m%d-%H%M%S)
for F in skins/adrianzen/styles/adrianzen.css skins/adrianzen/watermark.html plugins/reunion/reunion.css; do
  [ -f "$RC/$F" ] && cp "$RC/$F" "$RC/$F.antes-auditoria-$HOY"
  curl -fsSL "$BASE/$F" -o "$RC/$F" || { echo "FALLO: no pude bajar $F"; exit 1; }
  echo "     listo $F"
done
echo "Listo. Recarga el correo con Cmd+Shift+R. Copias con el final .antes-auditoria-$HOY"
