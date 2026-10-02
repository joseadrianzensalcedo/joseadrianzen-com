<?php
// Puerta del medidor de visitas. El código de verdad vive fuera de public_html, en ../medidor (no se publica por FTP).
// Si el medidor todavía no está instalado, responde vacío y la página sigue como si nada.
$medidor = dirname(__DIR__, 2) . '/medidor/publico/index.php';
if (!is_file($medidor)) { http_response_code(204); exit; }
require $medidor;
