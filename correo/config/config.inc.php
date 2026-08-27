<?php

/* Correo de joseadrianzen.com — configuracion de Roundcube.
 *
 * Esto es una PLANTILLA. Se copia a <roundcube>/config/config.inc.php en el
 * servidor y ahi se rellenan los dos huecos marcados con CAMBIAR. La copia
 * del servidor tiene secretos: no vuelve al repositorio.
 *
 * Aqui solo van los valores que cambian respecto de config/defaults.inc.php.
 * Todo lo que no este escrito se queda como viene de fabrica, que es lo
 * correcto: cuanto menos se toque, menos se rompe al actualizar.
 */

$config = [];

/* ── el buzon (Hostinger) ────────────────────────────────────────────────
   Mismo buzon de siempre, misma contraseña. Lo unico que cambia es la cara.
   Si Hostinger te da otros servidores en hPanel > Correos > Configuracion,
   manda lo que diga hPanel. */
$config['imap_host'] = 'ssl://imap.hostinger.com:993';
$config['smtp_host'] = 'ssl://smtp.hostinger.com:465';
$config['smtp_user'] = '%u';   // reutiliza el usuario con el que entraste
$config['smtp_pass'] = '%p';   // y su contraseña: no se guarda en ningun sitio

/* Con esto entras escribiendo solo "yo" en vez de yo@joseadrianzen.com. */
$config['username_domain'] = 'joseadrianzen.com';
$config['mail_domain']     = 'joseadrianzen.com';

/* ── base de datos ───────────────────────────────────────────────────────
   SQLite: un fichero, cero mantenimiento, de sobra para un buzon. Queda en
   la raiz de Roundcube, que en la instalacion recomendada esta FUERA de
   public_html y por tanto no se puede descargar desde el navegador. */
$config['db_dsnw'] = 'sqlite:///' . dirname(__DIR__) . '/roundcube.db?mode=0640';

/* ── seguridad ───────────────────────────────────────────────────────────
   CAMBIAR: 24 caracteres exactos, distintos a los de nadie mas. Generalo en
   el servidor con:   openssl rand -base64 24 | cut -c1-24
   Si lo cambias despues, se cierran todas las sesiones abiertas. */
$config['des_key'] = 'CAMBIAR-24-CARACTERES!!!';

$config['force_https']       = true;       // nunca por http
$config['session_lifetime']  = 30;         // minutos de inactividad
$config['session_samesite']  = 'Strict';
$config['login_rate_limit']  = 3;          // intentos fallidos antes de frenar
$config['x_frame_options']   = 'sameorigin';
$config['enable_installer']  = false;      // el instalador se apaga y no se vuelve a tocar

/* ip_check corta la sesion si te cambia la IP. Suena bien y en la practica
   te echa cada vez que el movil salta de antena o de wifi. Queda apagado a
   proposito; enciendelo solo si trabajas siempre desde la misma red. */
$config['ip_check'] = false;

/* ── que no se note Roundcube ────────────────────────────────────────────
   El nombre sale en la pestaña del navegador, en los avisos y en las
   cabeceras de los correos que envias. */
$config['product_name']         = 'Correo · Jose Adrianzen';
$config['skin']                 = 'adrianzen';
$config['support_url']          = '';   // sin enlace de "soporte"
$config['display_product_info'] = 0;    // sin nombre ni version en el pie
$config['useragent']            = 'Correo joseadrianzen.com';  // cabecera X-Mailer

/* ── idioma y comodidad ──────────────────────────────────────────────────*/
$config['language']           = 'es_ES';
$config['layout']             = 'widescreen';  // lista y mensaje en paralelo
$config['prefer_html']        = true;
$config['htmleditor']         = 1;    // redactar con formato (0 = texto plano)
$config['draft_autosave']     = 120;  // guardar borrador cada 2 min
$config['refresh_interval']   = 60;
$config['check_all_folders']  = false;
$config['identities_level']   = 1;    // una identidad, con nombre editable
$config['message_show_email'] = true; // ver la direccion, no solo el nombre

/* Complementos que ya vienen con Roundcube: archivar, descargar adjuntos en
   zip y avisar de correo nuevo. */
$config['plugins'] = ['archive', 'zipdownload', 'newmail_notifier'];

/* ── carpetas ────────────────────────────────────────────────────────────
   Se dejan los nombres de fabrica a proposito. Cada servidor IMAP las llama
   a su manera (unos "Sent", otros "INBOX.Sent") y adivinarlo aqui es la
   forma mas facil de que los enviados acaben en una carpeta fantasma.
   Si al mandar el primer correo no aparece en Enviados, se arregla desde
   Ajustes > Carpetas, sin tocar este fichero. */
