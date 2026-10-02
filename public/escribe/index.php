<?php
/* Formulario "Déjame un mensaje" de /contacto/.
 *
 * Peras y manzanas: recibe nombre, correo, teléfono (obligatorio) y mensaje, guarda una copia en una base fuera de public_html
 * y te lo manda a yo@joseadrianzen.com. Al responder ese correo le contestas directo a la persona (Responder a).
 * No le manda nada a quien escribe, así nadie puede usar el formulario para mandar correos a terceros.
 * Frenos contra robots: campo trampa invisible, mínimo 3 segundos llenando, máximo 5 mensajes por hora por conexión.
 * La IP no se guarda: se guarda una huella que cambia cada día.
 */
const DESTINO = 'yo@joseadrianzen.com';
const DOMINIO = 'joseadrianzen.com';

$json = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;
function fin(int $codigo, ?string $error = null): void {
    global $json;
    http_response_code($codigo);
    header('Cache-Control: no-store');
    if ($json || stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($error ? ['ok' => false, 'error' => $error] : ['ok' => true]);
    } else {
        // Sin JavaScript: vuelve a la página de contacto con el aviso.
        $vuelta = ($_POST['idioma'] ?? 'es') === 'es' ? '/contacto/' : '/' . preg_replace('/[^a-z]/', '', $_POST['idioma']) . '/contacto/';
        header('Location: ' . $vuelta . ($error ? '?error=' . rawurlencode($error) : '?enviado=1') . '#escribeme', true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fin(405, 'metodo');

// Solo desde la propia web.
$origen = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = strtolower((string) parse_url($origen, PHP_URL_HOST));
$propio = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
if ($host !== DOMINIO && $host !== 'www.' . DOMINIO && $host !== $propio) fin(403, 'origen');

$d = $json ? json_decode(file_get_contents('php://input', false, null, 0, 20000), true) : $_POST;
if (!is_array($d)) fin(400, 'datos');
$txt = fn($k, $max) => trim(mb_substr(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) ($d[$k] ?? '')), 0, $max));
$nombre = $txt('nombre', 120);
$correo = $txt('correo', 200);
$telefono = $txt('telefono', 25);
$mensaje = $txt('mensaje', 4000);
$idioma = preg_replace('/[^a-z]/', '', $txt('idioma', 5)) ?: 'es';
$pagina = $txt('pagina', 200);

// Robots: el campo trampa tiene que venir vacío y el envío no puede ser instantáneo.
if ($txt('web', 200) !== '') fin(200);
if (isset($d['t']) && (int) $d['t'] < 3000) fin(200);

if (mb_strlen($nombre) < 2) fin(422, 'nombre');
if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $correo)) fin(422, 'correo');
if (!preg_match('/^\+?[0-9 ().\x2D]{6,25}$/', $telefono) || strlen(preg_replace('/\D/', '', $telefono)) < 6) fin(422, 'telefono');
if (mb_strlen($mensaje) < 10) fin(422, 'mensaje');
if (empty($d['acepto'])) fin(422, 'acepto');

// Base fuera de public_html: ~/domains/joseadrianzen.com/mensajes
$dir = dirname(__DIR__, 2) . '/mensajes';
if (!is_dir($dir)) @mkdir($dir, 0750, true);
try {
    $db = new PDO('sqlite:' . $dir . '/mensajes.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]);
    $db->exec('CREATE TABLE IF NOT EXISTS mensajes (id INTEGER PRIMARY KEY, cuando TEXT NOT NULL, nombre TEXT, correo TEXT, telefono TEXT, mensaje TEXT, idioma TEXT, pagina TEXT, huella TEXT, enviado INTEGER DEFAULT 0)');
    $db->exec('CREATE TABLE IF NOT EXISTS sal (dia TEXT PRIMARY KEY, valor TEXT)');
    $dia = gmdate('Y-m-d');
    $db->exec('BEGIN IMMEDIATE');
    $sal = $db->query("SELECT valor FROM sal WHERE dia = " . $db->quote($dia))->fetchColumn();
    if (!$sal) { $sal = bin2hex(random_bytes(16)); $db->prepare('INSERT INTO sal VALUES (?, ?)')->execute([$dia, $sal]); $db->exec("DELETE FROM sal WHERE dia < " . $db->quote($dia)); }
    $huella = hash('sha256', $sal . ($_SERVER['REMOTE_ADDR'] ?? ''));
    $q = $db->prepare("SELECT COUNT(*) FROM mensajes WHERE huella = ? AND cuando > datetime('now', '-1 hour')");
    $q->execute([$huella]);
    if ((int) $q->fetchColumn() >= 5) { $db->exec('ROLLBACK'); fin(429, 'muchos'); }
    $db->prepare("INSERT INTO mensajes (cuando, nombre, correo, telefono, mensaje, idioma, pagina, huella) VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, ?)")
       ->execute([$nombre, $correo, $telefono, $mensaje, $idioma, $pagina, $huella]);
    $id = (int) $db->lastInsertId();
    $db->exec('COMMIT');
} catch (Throwable $e) {
    error_log('escribe: ' . $e->getMessage());
    $db = null; $id = 0;
}

// Correo a Jose. Responder a = la persona que escribió.
$lima = new DateTime('now', new DateTimeZone('America/Lima'));
$cuerpo = "Mensaje desde el formulario de " . DOMINIO . "\n\n"
        . "Nombre: $nombre\nCorreo: $correo\n" . "Teléfono: $telefono\n"
        . "Idioma de la página: $idioma\nFecha: " . $lima->format('d/m/Y H:i') . " (Lima)\n\n"
        . "$mensaje\n";
$asunto = '=?UTF-8?B?' . base64_encode('Web: mensaje de ' . $nombre) . '?=';
$nombreLimpio = str_replace(['"', "\r", "\n"], '', $nombre);
$cabeceras = implode("\r\n", [
    'From: "Web ' . DOMINIO . '" <' . DESTINO . '>',
    'Reply-To: "' . $nombreLimpio . '" <' . $correo . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);
$enviado = @mail(DESTINO, $asunto, $cuerpo, $cabeceras, '-f' . DESTINO);
if ($enviado && $db && $id) $db->prepare('UPDATE mensajes SET enviado = 1 WHERE id = ?')->execute([$id]);

if (!$enviado && !$id) fin(500, 'servidor');   // ni se guardó ni salió: que la persona escriba directo
fin(200);
