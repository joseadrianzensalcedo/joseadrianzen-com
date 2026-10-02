<?php
/* Recolector del medidor. La web le manda aquí, en tandas, lo que pasa en cada visita.
 * Responde siempre 204 (sin contenido) y no dice nada hacia afuera: si algo falla, lo anota en el registro
 * y sigue. Que la medición falle nunca debe romper la página.
 */
declare(strict_types=1);

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('Content-Type: text/plain; charset=utf-8');

function salir(int $codigo = 204): void { http_response_code($codigo); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') salir(404);

require __DIR__ . '/../lib/medidor.php';
$cfg = medidor_config();

// Solo se acepta lo que viene de la propia web (el navegador manda el origen y no se puede falsear desde una página ajena).
$origen = medidor_dominio($_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));
$permitidos = array_map(fn($h) => strtolower(preg_replace('/^www\./', '', $h)), $cfg['origenes']);
if (!$origen || !in_array($origen, $permitidos, true)) salir(403);

$crudo = file_get_contents('php://input', false, null, 0, 65537);
if ($crudo === false || strlen($crudo) > 65536) salir(413);
$q = json_decode($crudo, true);
if (!is_array($q)) salir(400);

$visita = (string) ($q['s'] ?? '');
if (!preg_match('/^[A-Za-z0-9_-]{16,40}$/', $visita)) salir(400);
$persistente = (string) ($q['p'] ?? '');
if ($persistente !== '' && !preg_match('/^[A-Za-z0-9_-]{16,40}$/', $persistente)) $persistente = '';
$consent = array_key_exists('c', $q) && $q['c'] !== null ? (int) (bool) $q['c'] : null;
$eventos = is_array($q['e'] ?? null) ? array_slice($q['e'], 0, 300) : [];
$meta = is_array($q['m'] ?? null) ? $q['m'] : [];

$ahora = (int) round(microtime(true) * 1000);
$ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');

try {
    $db = medidor_db();
    // IMMEDIATE: toma el turno de escritura al empezar. Con BEGIN normal, dos visitas que escriben a la vez
    // chocan y SQLite responde "database is locked" sin esperar (se vio en la prueba con 4 procesos).
    $db->exec('BEGIN IMMEDIATE');

    $s = $db->prepare('SELECT eventos, robot FROM visitas WHERE id = ?');
    $s->execute([$visita]);
    $fila = $s->fetch(PDO::FETCH_ASSOC);

    if (!$fila) {
        // Visita nueva: aquí, y solo aquí, se mira la IP para saber de dónde viene. Después se bota.
        $ip = medidor_ip();
        $geo = medidor_geo($ip);
        $ap = medidor_aparato($ua);
        if ($consent === 1 && $persistente !== '') {
            $quien = 'p' . $persistente;
        } else {
            $quien = 'd' . substr(hash('sha256', medidor_sal_del_dia($db) . '|' . $ip . '|' . $ua), 0, 20);
        }
        unset($ip);
        $camp = array_filter([medidor_txt($meta['us'] ?? null, 60), medidor_txt($meta['um'] ?? null, 60), medidor_txt($meta['uc'] ?? null, 80)]);
        $enlace = medidor_txt($meta['de'] ?? null, 24);
        if ($enlace !== null && !preg_match('/^[a-z0-9-]{3,24}$/', $enlace)) $enlace = null;
        $db->prepare('INSERT INTO visitas (id, visitante, consentimiento, inicio, fin, pais, pais_codigo, region, ciudad, lat, lon, red,
            dispositivo, sistema, navegador, idioma, zona_horaria, pantalla, idioma_pagina, referencia, campana, enlace, entrada, robot)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([
            $visita, $quien, $consent, $ahora, $ahora,
            $geo['pais'], $geo['pais_codigo'], $geo['region'], $geo['ciudad'], $geo['lat'], $geo['lon'], $geo['red'],
            $ap['dispositivo'], $ap['sistema'], $ap['navegador'],
            medidor_txt($meta['id'] ?? null, 35), medidor_txt($meta['zh'] ?? null, 60), medidor_txt($meta['pa'] ?? null, 20),
            medidor_txt($meta['lp'] ?? null, 10),
            medidor_dominio(medidor_txt($meta['ref'] ?? null, 500)),
            $camp ? implode(' / ', $camp) : null, $enlace, medidor_txt($meta['en'] ?? null, 300),
            medidor_es_robot($ua) ? 1 : 0,
        ]);
        $fila = ['eventos' => 0, 'robot' => 0];
    } elseif ($consent !== null) {
        // Decidió en el aviso durante la visita. Si aceptó, desde ahora la visita queda con su identificador fijo.
        $db->prepare('UPDATE visitas SET consentimiento = ? WHERE id = ?')->execute([$consent, $visita]);
        if ($consent === 1 && $persistente !== '') $db->prepare('UPDATE visitas SET visitante = ? WHERE id = ?')->execute(['p' . $persistente, $visita]);
    }

    $cupo = max(0, 5000 - (int) $fila['eventos']);
    $eventos = array_slice($eventos, 0, $cupo);
    $tipos = ['pag', 'sal', 'sec', 'foto', 'clic', 'vid', 'vtr', 'con'];
    $ins = $db->prepare('INSERT INTO eventos (visita, t, tipo, pagina, dato) VALUES (?,?,?,?,?)');
    $paginas = 0; $segundos = 0; $ultimo = 0; $n = 0;
    foreach ($eventos as $e) {
        if (!is_array($e) || count($e) < 2) continue;
        $t = (int) ($e[0] ?? 0);
        if (abs($t - $ahora) > 86400000) $t = $ahora;     // reloj del visitante muy corrido: se usa el del servidor
        $tipo = (string) ($e[1] ?? '');
        if (!in_array($tipo, $tipos, true)) continue;
        $pagina = medidor_txt($e[2] ?? null, 300);
        $dato = is_array($e[3] ?? null) ? json_encode($e[3], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
        if ($dato !== null && strlen($dato) > 8000) continue;
        $ins->execute([$visita, $t, $tipo, $pagina, $dato]);
        $n++;
        $ultimo = max($ultimo, $t);
        if ($tipo === 'pag') $paginas++;
        if ($tipo === 'sal') $segundos += max(0, min(86400, (int) ($e[3]['seg'] ?? 0)));
    }
    if ($n) {
        $db->prepare('UPDATE visitas SET fin = MAX(fin, ?), paginas = paginas + ?, segundos = segundos + ?, eventos = eventos + ? WHERE id = ?')
           ->execute([max($ultimo, $ahora), $paginas, $segundos, $n, $visita]);
    }
    $db->exec('COMMIT');
    // Una de cada 200 llamadas borra lo que pasó los 24 meses (lo que dice la página de privacidad).
    if (random_int(1, 200) === 1) {
        $corte = $ahora - 730 * 86400000;
        $db->prepare('DELETE FROM eventos WHERE visita IN (SELECT id FROM visitas WHERE fin < ?)')->execute([$corte]);
        $db->prepare('DELETE FROM visitas WHERE fin < ?')->execute([$corte]);
    }
} catch (Throwable $e) {
    if (isset($db)) { try { $db->exec('ROLLBACK'); } catch (Throwable $x) {} }
    error_log('medidor: ' . $e->getMessage());
}
salir(204);
