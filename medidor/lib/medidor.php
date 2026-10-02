<?php
/* Medidor de visitas de joseadrianzen.com: lo que comparten el recolector y el panel.
 *
 * Peras y manzanas: la web le cuenta a este servidor lo que pasa en cada visita (qué página, cuánto
 * tiempo, qué parte del documental). Aquí se guarda en una base que vive fuera de la carpeta pública,
 * así nadie la puede pedir desde el navegador. La dirección IP se usa un instante para saber el país,
 * la ciudad y la red, y se bota: no se guarda.
 */
declare(strict_types=1);

const MEDIDOR_DIR = __DIR__ . '/..';

function medidor_config(): array
{
    static $c = null;
    if ($c === null) {
        $f = MEDIDOR_DIR . '/config.php';
        $c = is_file($f) ? (require $f) : [];
        $c += [
            'base'      => MEDIDOR_DIR . '/datos/medidor.sqlite',
            'geo_ciudad' => MEDIDOR_DIR . '/geo/dbip-city-lite.mmdb',
            'geo_red'   => MEDIDOR_DIR . '/geo/dbip-asn-lite.mmdb',
            'origenes'  => ['joseadrianzen.com', 'www.joseadrianzen.com'],
            'panel_usuarios' => ['yo@joseadrianzen.com'],
        ];
    }
    return $c;
}

function medidor_db(): PDO
{
    static $db = null;
    if ($db) return $db;
    $ruta = medidor_config()['base'];
    $nueva = !is_file($ruta);
    if ($nueva && !is_dir(dirname($ruta))) mkdir(dirname($ruta), 0750, true);
    $db = new PDO('sqlite:' . $ruta, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA busy_timeout = 5000');
    $db->exec('PRAGMA foreign_keys = ON');
    if ($nueva) {
        $db->exec(file_get_contents(MEDIDOR_DIR . '/sql/esquema.sql'));
        @chmod($ruta, 0640);
    }
    return $db;
}

/* ── quién es por su IP (y se olvida la IP) ─────────────────────────────── */

function medidor_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    // Si el servidor está detrás de un proxy propio (dirección privada), la IP real viene en X-Forwarded-For.
    $privada = !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    if ($privada && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $p = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
        if (filter_var($p, FILTER_VALIDATE_IP)) $ip = $p;
    }
    return $ip;
}

function medidor_mmdb(string $clave): ?MaxMind\Db\Reader
{
    static $r = [];
    if (array_key_exists($clave, $r)) return $r[$clave];
    $f = medidor_config()[$clave];
    if (!is_file($f)) return $r[$clave] = null;
    require_once __DIR__ . '/MaxMind/Db/Reader.php';
    require_once __DIR__ . '/MaxMind/Db/Reader/Decoder.php';
    require_once __DIR__ . '/MaxMind/Db/Reader/InvalidDatabaseException.php';
    require_once __DIR__ . '/MaxMind/Db/Reader/Metadata.php';
    require_once __DIR__ . '/MaxMind/Db/Reader/Util.php';
    try { return $r[$clave] = new MaxMind\Db\Reader($f); } catch (Throwable $e) { return $r[$clave] = null; }
}

function medidor_nombre(?array $n): ?string
{
    if (!$n) return null;
    return $n['es'] ?? $n['en'] ?? (reset($n) ?: null);
}

function medidor_geo(string $ip): array
{
    $g = ['pais' => null, 'pais_codigo' => null, 'region' => null, 'ciudad' => null, 'lat' => null, 'lon' => null, 'red' => null];
    if (!filter_var($ip, FILTER_VALIDATE_IP)) return $g;
    try {
        if ($c = medidor_mmdb('geo_ciudad')) {
            $d = $c->get($ip) ?: [];
            $g['pais'] = medidor_nombre($d['country']['names'] ?? null);
            $g['pais_codigo'] = $d['country']['iso_code'] ?? null;
            $g['region'] = medidor_nombre($d['subdivisions'][0]['names'] ?? null);
            $g['ciudad'] = medidor_nombre($d['city']['names'] ?? null);
            $g['lat'] = isset($d['location']['latitude']) ? (float) $d['location']['latitude'] : null;
            $g['lon'] = isset($d['location']['longitude']) ? (float) $d['location']['longitude'] : null;
        }
        if ($a = medidor_mmdb('geo_red')) {
            $d = $a->get($ip) ?: [];
            $g['red'] = $d['autonomous_system_organization'] ?? null;
        }
    } catch (Throwable $e) {
        // Una base dañada no debe tumbar la medición: se guarda la visita sin lugar.
    }
    return $g;
}

/* ── el aparato, leído del navegador ────────────────────────────────────── */

function medidor_es_robot(string $ua): bool
{
    return $ua === '' || (bool) preg_match('/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|scan|monitor|python|curl|wget|httpclient|java\/|go-http|axios|node-fetch|phantom|selenium|puppeteer|playwright/i', $ua);
}

function medidor_aparato(string $ua): array
{
    $disp = 'Computadora';
    if (preg_match('/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i', $ua)) $disp = 'Tableta';
    elseif (preg_match('/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i', $ua)) $disp = 'Celular';

    $so = 'Otro';
    foreach ([
        'iOS' => '/iPhone|iPad|iPod/', 'Android' => '/Android/', 'Windows' => '/Windows/',
        'macOS' => '/Macintosh|Mac OS X/', 'ChromeOS' => '/CrOS/', 'Linux' => '/Linux/',
    ] as $n => $re) { if (preg_match($re, $ua)) { $so = $n; break; } }

    $nav = 'Otro';
    foreach ([
        'Edge' => '/Edg\//', 'Opera' => '/OPR\/|Opera/', 'Samsung Internet' => '/SamsungBrowser/',
        'Instagram (en la app)' => '/Instagram/', 'Facebook (en la app)' => '/FBAN|FBAV/', 'LinkedIn (en la app)' => '/LinkedInApp/',
        'WhatsApp (en la app)' => '/WhatsApp/', 'Chrome' => '/Chrome\/|CriOS/', 'Firefox' => '/Firefox\/|FxiOS/', 'Safari' => '/Safari\//',
    ] as $n => $re) { if (preg_match($re, $ua)) { $nav = $n; break; } }

    return ['dispositivo' => $disp, 'sistema' => $so, 'navegador' => $nav];
}

/* ── identificador de quien no aceptó: cambia cada día ─────────────────── */

function medidor_sal_del_dia(PDO $db): string
{
    $hoy = gmdate('Y-m-d');
    $s = $db->prepare('SELECT sal FROM sal WHERE dia = ?');
    $s->execute([$hoy]);
    $sal = $s->fetchColumn();
    if (!$sal) {
        $sal = bin2hex(random_bytes(16));
        $db->prepare('INSERT OR IGNORE INTO sal (dia, sal) VALUES (?, ?)')->execute([$hoy, $sal]);
        $db->prepare('DELETE FROM sal WHERE dia < ?')->execute([$hoy]);
        $s->execute([$hoy]);
        $sal = $s->fetchColumn();
    }
    return (string) $sal;
}

/* ── texto seguro ───────────────────────────────────────────────────────── */

function medidor_txt($v, int $max = 200): ?string
{
    if ($v === null || is_array($v) || is_object($v)) return null;
    $v = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', (string) $v) ?? '');
    if ($v === '') return null;
    return mb_substr($v, 0, $max);
}

function medidor_dominio(?string $url): ?string
{
    if (!$url) return null;
    $h = parse_url($url, PHP_URL_HOST);
    if (!$h) return null;
    $h = strtolower(preg_replace('/^www\./', '', $h));
    return mb_substr($h, 0, 120);
}
