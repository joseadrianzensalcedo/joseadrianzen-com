<?php
/* Consultas del panel. Todo cuenta solo visitas de personas (sin robots) dentro del periodo elegido. */

function medidor_q(PDO $db, string $sql, array $p = []): array
{
    $s = $db->prepare($sql);
    $s->execute($p);
    return $s->fetchAll(PDO::FETCH_ASSOC);
}

function medidor_v1(PDO $db, string $sql, array $p = [])
{
    $s = $db->prepare($sql);
    $s->execute($p);
    return $s->fetchColumn();
}

const MED_V = 'FROM visitas v WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ?';

function medidor_resumen(PDO $db, int $d, int $h): array
{
    $p = [$d, $h];
    $base = medidor_q($db, 'SELECT COUNT(*) visitas, COUNT(DISTINCT visitante) visitantes,
        COUNT(DISTINCT CASE WHEN visitante LIKE \'p%\' THEN visitante END) reconocidos,
        SUM(CASE WHEN consentimiento = 1 THEN 1 ELSE 0 END) aceptaron, SUM(CASE WHEN consentimiento = 0 THEN 1 ELSE 0 END) rechazaron,
        AVG(segundos) segundos_promedio, AVG(paginas) paginas_promedio,
        SUM(CASE WHEN paginas <= 1 AND segundos < 10 THEN 1 ELSE 0 END) rebote ' . MED_V, $p)[0];
    $doc = medidor_q($db, "SELECT COUNT(DISTINCT CASE WHEN json_extract(e.dato,'$.a') = 'play' AND json_extract(e.dato,'$.f') = 'documental' THEN e.visita END) vieron,
        COUNT(DISTINCT CASE WHEN json_extract(e.dato,'$.a') = 'fin' AND json_extract(e.dato,'$.f') = 'documental' THEN e.visita END) terminaron,
        COUNT(DISTINCT CASE WHEN json_extract(e.dato,'$.a') = 'play' AND json_extract(e.dato,'$.f') = 'trailer' THEN e.visita END) trailer
        FROM eventos e JOIN visitas v ON v.id = e.visita WHERE e.tipo = 'vid' AND v.robot = 0 AND v.inicio BETWEEN ? AND ?", $p)[0];
    $vueltas = medidor_v1($db, "SELECT COUNT(*) FROM (SELECT visitante FROM visitas v WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ? AND visitante LIKE 'p%' GROUP BY visitante HAVING COUNT(*) > 1)", $p);
    // Por día, en hora de Lima (UTC menos 5, sin horario de verano).
    $dias = medidor_q($db, "SELECT date((inicio / 1000) - 18000, 'unixepoch') dia, COUNT(*) visitas, COUNT(DISTINCT visitante) visitantes " . MED_V . ' GROUP BY dia ORDER BY dia', $p);
    $horas = medidor_q($db, "SELECT CAST(strftime('%H', (inicio / 1000) - 18000, 'unixepoch') AS INTEGER) hora, COUNT(*) n " . MED_V . ' GROUP BY hora ORDER BY hora', $p);
    $robots = medidor_v1($db, 'SELECT COUNT(*) FROM visitas WHERE robot = 1 AND inicio BETWEEN ? AND ?', $p);
    return ['base' => $base, 'documental' => $doc, 'volvieron' => (int) $vueltas, 'dias' => $dias, 'horas' => $horas, 'robots' => (int) $robots];
}

function medidor_conteo(PDO $db, string $campo, int $d, int $h, int $lim = 30): array
{
    return medidor_q($db, "SELECT COALESCE($campo, 'Sin dato') k, COUNT(*) n, COUNT(DISTINCT visitante) personas, ROUND(AVG(segundos)) seg " . MED_V . " GROUP BY k ORDER BY n DESC LIMIT $lim", [$d, $h]);
}

function medidor_procedencia(PDO $db, int $d, int $h): array
{
    return [
        'paises'      => medidor_conteo($db, 'pais', $d, $h),
        'lugares'     => medidor_conteo($db, "ciudad || ', ' || COALESCE(region || ', ', '') || pais_codigo", $d, $h, 50),
        'redes'       => medidor_conteo($db, 'red', $d, $h, 40),
        'referencias' => medidor_conteo($db, "COALESCE(referencia, 'Entrada directa')", $d, $h),
        'campanas'    => medidor_conteo($db, 'campana', $d, $h),
        'dispositivos'=> medidor_conteo($db, 'dispositivo', $d, $h),
        'sistemas'    => medidor_conteo($db, 'sistema', $d, $h),
        'navegadores' => medidor_conteo($db, 'navegador', $d, $h),
        'idiomas'     => medidor_conteo($db, 'idioma', $d, $h),
        'zonas'       => medidor_conteo($db, 'zona_horaria', $d, $h),
        'pantallas'   => medidor_conteo($db, 'pantalla', $d, $h),
        'puntos'      => medidor_q($db, 'SELECT ROUND(lat, 1) lat, ROUND(lon, 1) lon, COUNT(*) n ' . MED_V . ' AND lat IS NOT NULL GROUP BY 1, 2', [$d, $h]),
    ];
}

function medidor_paginas(PDO $db, int $d, int $h): array
{
    $p = [$d, $h];
    $j = 'FROM eventos e JOIN visitas v ON v.id = e.visita WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ?';
    $paginas = medidor_q($db, "SELECT e.pagina k, SUM(e.tipo = 'pag') vistas, COUNT(DISTINCT CASE WHEN e.tipo = 'pag' THEN e.visita END) visitas,
        SUM(CASE WHEN e.tipo = 'sal' THEN json_extract(e.dato, '$.seg') ELSE 0 END) seg,
        MAX(CASE WHEN e.tipo = 'sal' THEN json_extract(e.dato, '$.scroll') END) scroll_max,
        AVG(CASE WHEN e.tipo = 'sal' THEN json_extract(e.dato, '$.scroll') END) scroll_prom
        $j GROUP BY e.pagina HAVING vistas > 0 ORDER BY vistas DESC LIMIT 80", $p);
    $entradas = medidor_conteo($db, 'entrada', $d, $h);
    // Secciones: vistas (evento sec) y segundos en pantalla (sumados de cada salida).
    $sec = [];
    foreach (medidor_q($db, "SELECT e.pagina, e.tipo, e.dato $j AND e.tipo IN ('sec', 'sal')", $p) as $r) {
        $x = json_decode((string) $r['dato'], true) ?: [];
        if ($r['tipo'] === 'sec') {
            $k = $r['pagina'] . ' · ' . ($x['id'] ?? '?');
            $sec[$k]['vistas'] = ($sec[$k]['vistas'] ?? 0) + 1;
        } else {
            foreach (($x['secs'] ?? []) as $id => $s) {
                $k = $r['pagina'] . ' · ' . $id;
                $sec[$k]['seg'] = ($sec[$k]['seg'] ?? 0) + (int) $s;
            }
        }
    }
    $secciones = [];
    foreach ($sec as $k => $x) $secciones[] = ['k' => $k, 'vistas' => $x['vistas'] ?? 0, 'seg' => $x['seg'] ?? 0];
    usort($secciones, fn($a, $b) => $b['vistas'] <=> $a['vistas'] ?: $b['seg'] <=> $a['seg']);
    $clics = medidor_q($db, "SELECT COALESCE(json_extract(e.dato, '$.h'), json_extract(e.dato, '$.b'), json_extract(e.dato, '$.n')) k,
        MAX(json_extract(e.dato, '$.x')) texto, COUNT(*) n, COUNT(DISTINCT e.visita) visitas $j AND e.tipo = 'clic' GROUP BY k ORDER BY n DESC LIMIT 60", $p);
    return ['paginas' => $paginas, 'entradas' => $entradas, 'secciones' => array_slice($secciones, 0, 120), 'clics' => $clics];
}

function medidor_documental(PDO $db, int $d, int $h): array
{
    $p = [$d, $h];
    $j = "FROM eventos e JOIN visitas v ON v.id = e.visita WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ?";
    $acciones = medidor_q($db, "SELECT json_extract(e.dato, '$.f') fuente, json_extract(e.dato, '$.a') accion, COUNT(*) n, COUNT(DISTINCT e.visita) visitas
        $j AND e.tipo = 'vid' GROUP BY 1, 2 ORDER BY 1, n DESC", $p);
    $idiomas = medidor_q($db, "SELECT json_extract(e.dato, '$.f') fuente, json_extract(e.dato, '$.i') idioma, COUNT(DISTINCT e.visita) visitas
        $j AND e.tipo = 'vid' AND json_extract(e.dato, '$.a') = 'play' GROUP BY 1, 2 ORDER BY visitas DESC", $p);

    // Retención: de cada 5 segundos del video, cuántas visitas lo vieron. Y dónde dejó de ver cada visita.
    $vistos = []; $dur = [];
    foreach (medidor_q($db, "SELECT e.visita, e.dato $j AND e.tipo = 'vtr'", $p) as $r) {
        $x = json_decode((string) $r['dato'], true) ?: [];
        $f = $x['f'] ?? '?';
        if (!empty($x['d'])) $dur[$f] = max($dur[$f] ?? 0, (int) $x['d']);
        foreach (($x['b'] ?? []) as $b) $vistos[$f][$r['visita']][(int) $b] = true;
    }
    $retencion = []; $abandono = []; $minutos = [];
    foreach ($vistos as $f => $porVisita) {
        $n = (int) ceil(($dur[$f] ?? 0) / 5);
        $curva = array_fill(0, max($n, 1), 0);
        $corte = [];
        foreach ($porVisita as $baldes) {
            foreach ($baldes as $b => $_) { if (!isset($curva[$b])) $curva[$b] = 0; $curva[$b]++; }
            $ult = max(array_keys($baldes));
            $m = intdiv($ult * 5, 60);
            $corte[$m] = ($corte[$m] ?? 0) + 1;
            $minutos[$f][] = count($baldes) * 5;
        }
        ksort($curva); ksort($corte);
        $retencion[$f] = ['duracion' => $dur[$f] ?? 0, 'visitas' => count($porVisita), 'curva' => array_values($curva)];
        $abandono[$f] = $corte;
    }
    $vistoProm = [];
    foreach ($minutos as $f => $l) $vistoProm[$f] = round(array_sum($l) / count($l));

    // Pausas y saltos, por minuto del video.
    $pausas = []; $saltos = [];
    foreach (medidor_q($db, "SELECT e.dato $j AND e.tipo = 'vid' AND json_extract(e.dato, '$.a') IN ('pausa', 'salto')", $p) as $r) {
        $x = json_decode((string) $r['dato'], true) ?: [];
        $f = $x['f'] ?? '?';
        if ($x['a'] === 'pausa' && isset($x['s'])) { $m = intdiv((int) $x['s'], 60); $pausas[$f][$m] = ($pausas[$f][$m] ?? 0) + 1; }
        if ($x['a'] === 'salto') $saltos[$f][] = [round((float) ($x['de'] ?? 0)), round((float) ($x['a2'] ?? 0))];
    }
    foreach ($pausas as &$m) ksort($m);
    return ['acciones' => $acciones, 'idiomas' => $idiomas, 'retencion' => $retencion, 'abandono' => $abandono,
            'visto_promedio' => $vistoProm, 'pausas' => $pausas, 'saltos' => array_map(fn($l) => array_slice($l, -200), $saltos)];
}

function medidor_fotos(PDO $db, int $d, int $h): array
{
    $j = "FROM eventos e JOIN visitas v ON v.id = e.visita WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ?";
    return [
        'vistas' => medidor_q($db, "SELECT e.pagina, json_extract(e.dato, '$.n') foto, MAX(json_extract(e.dato, '$.alt')) alt, COUNT(*) n, COUNT(DISTINCT e.visita) visitas
            $j AND e.tipo = 'foto' GROUP BY 1, 2 ORDER BY n DESC LIMIT 200", [$d, $h]),
        'clics' => medidor_q($db, "SELECT json_extract(e.dato, '$.n') foto, COUNT(*) n $j AND e.tipo = 'clic' AND json_extract(e.dato, '$.foto') = 1 GROUP BY 1 ORDER BY n DESC LIMIT 100", [$d, $h]),
    ];
}

function medidor_visitas(PDO $db, int $d, int $h, ?string $quien): array
{
    $extra = ''; $p = [$d, $h];
    if ($quien) { $extra = ' AND v.visitante = ?'; $p[] = $quien; }
    $filas = medidor_q($db, "SELECT v.*, l.nombre enlace_nombre,
        (SELECT COUNT(*) FROM visitas v2 WHERE v2.visitante = v.visitante AND v.visitante LIKE 'p%') veces
        FROM visitas v LEFT JOIN enlaces l ON l.codigo = v.enlace WHERE v.robot = 0 AND v.inicio BETWEEN ? AND ?$extra ORDER BY v.inicio DESC LIMIT 300", $p);
    // Para cada visita, un resumen de lo que hizo con el documental.
    $ids = array_column($filas, 'id');
    $doc = [];
    if ($ids) {
        $in = implode(',', array_fill(0, count($ids), '?'));
        foreach (medidor_q($db, "SELECT visita, dato FROM eventos WHERE tipo IN ('vid', 'vtr') AND visita IN ($in)", $ids) as $r) {
            $x = json_decode((string) $r['dato'], true) ?: [];
            if (($x['f'] ?? '') !== 'documental') continue;
            $o = &$doc[$r['visita']];
            if (isset($x['b'])) { foreach ($x['b'] as $b) $o['b'][(int) $b] = true; }
            elseif (($x['a'] ?? '') === 'fin') $o['fin'] = true;
            elseif (($x['a'] ?? '') === 'pausa') $o['pausas'] = ($o['pausas'] ?? 0) + 1;
            unset($o);
        }
    }
    foreach ($filas as &$f) {
        $o = $doc[$f['id']] ?? null;
        $f['doc'] = $o ? ['visto' => count($o['b'] ?? []) * 5, 'hasta' => isset($o['b']) ? (max(array_keys($o['b'])) + 1) * 5 : 0,
                         'fin' => !empty($o['fin']), 'pausas' => $o['pausas'] ?? 0] : null;
    }
    return $filas;
}

function medidor_visita(PDO $db, ?string $id): array
{
    $v = medidor_q($db, 'SELECT v.*, l.nombre enlace_nombre FROM visitas v LEFT JOIN enlaces l ON l.codigo = v.enlace WHERE v.id = ?', [$id])[0] ?? null;
    if (!$v) return ['error' => 'no existe'];
    $ev = medidor_q($db, 'SELECT t, tipo, pagina, dato FROM eventos WHERE visita = ? ORDER BY t, id', [$id]);
    foreach ($ev as &$e) $e['dato'] = $e['dato'] ? json_decode($e['dato'], true) : null;
    $otras = str_starts_with($v['visitante'], 'p')
        ? medidor_q($db, 'SELECT id, inicio, segundos, paginas FROM visitas WHERE visitante = ? AND id != ? ORDER BY inicio DESC LIMIT 50', [$v['visitante'], $id]) : [];
    return ['visita' => $v, 'eventos' => $ev, 'otras' => $otras];
}

function medidor_enlaces(PDO $db): array
{
    return medidor_q($db, 'SELECT l.codigo, l.nombre, l.nota, l.creado, COUNT(v.id) visitas, MAX(v.inicio) ultima, SUM(v.segundos) segundos
        FROM enlaces l LEFT JOIN visitas v ON v.enlace = l.codigo AND v.robot = 0 GROUP BY l.codigo ORDER BY l.creado DESC');
}
