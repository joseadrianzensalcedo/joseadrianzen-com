<?php
/* Panel del medidor de visitas dentro del correo de joseadrianzen.com.
 *
 * Peras y manzanas: en la barra del correo aparece un candado. Solo lo ve quien entra como yo@joseadrianzen.com.
 * Al abrirlo se ven las visitas de la web: quién entró, desde dónde, qué vio, qué hizo con el documental.
 * Para cualquier otro buzón el candado no existe y la dirección del panel responde como si no hubiera nada.
 *
 * Los datos los junta el recolector (../medidor, fuera de public_html). Este plugin solo los lee.
 */
class medidor extends rcube_plugin
{
    public $task = '.*';
    private $lib;

    public function init()
    {
        $rcmail = rcmail::get_instance();
        $this->load_config();
        if (!$this->permitido()) {
            // Para cualquier otro buzón la tarea no existe: Roundcube responde con su página de error de siempre.
            return;
        }
        $this->add_texts('localization/', false);
        $this->register_task('medidor');
        $this->register_action('index', [$this, 'panel']);
        $this->register_action('datos', [$this, 'datos']);
        $this->register_action('enlace', [$this, 'enlace']);
        $this->add_hook('startup', [$this, 'arranque']);
    }

    private function permitido(): bool
    {
        $rcmail = rcmail::get_instance();
        if (empty($rcmail->user) || empty($rcmail->user->ID)) return false;
        $quien = strtolower((string) $rcmail->user->data['username']);
        $lista = array_map('strtolower', (array) $rcmail->config->get('medidor_usuarios', ['yo@joseadrianzen.com']));
        return in_array($quien, $lista, true);
    }

    private function cargar()
    {
        if ($this->lib) return;
        $dir = rcmail::get_instance()->config->get('medidor_dir') ?: dirname(RCUBE_INSTALL_PATH) . '/medidor';
        require_once $dir . '/lib/medidor.php';
        require_once __DIR__ . '/datos.php';
        $this->lib = $dir;
    }

    public function arranque($args)
    {
        $rcmail = rcmail::get_instance();
        if ($rcmail->output->type == 'html' && !$rcmail->output->framed) {
            $this->add_button([
                'command' => 'medidor', 'type' => 'link', 'class' => 'medidor', 'classsel' => 'medidor selected',
                'innerclass' => 'inner', 'label' => 'medidor.boton', 'title' => 'medidor.boton',
            ], 'taskbar');
            // El navegador de Jose queda marcado para que el medidor de la web no cuente sus propias visitas
            // (el correo y la web comparten dirección, así que comparten esta marca).
            $rcmail->output->add_script("try{localStorage.setItem('ja-no-medir','1')}catch(e){}", 'foot');
        }
        $this->include_stylesheet('medidor-boton.css');
        return $args;
    }

    public function panel()
    {
        $rcmail = rcmail::get_instance();
        $this->add_texts('localization/', false);
        $rcmail->output->set_pagetitle($this->gettext('titulo'));
        $this->include_stylesheet('medidor.css');
        $this->include_script('medidor.js');
        $rcmail->output->send('medidor.panel');
    }

    private function json($datos, int $codigo = 200)
    {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public function datos()
    {
        $this->cargar();
        $vista = rcube_utils::get_input_string('_vista', rcube_utils::INPUT_GET);
        $dias = max(1, min(730, (int) rcube_utils::get_input_string('_dias', rcube_utils::INPUT_GET) ?: 30));
        $hasta = (int) (microtime(true) * 1000);
        $desde = $hasta - $dias * 86400000;
        try {
            $db = medidor_db();
            switch ($vista) {
                case 'resumen':    $this->json(medidor_resumen($db, $desde, $hasta));
                case 'procedencia':$this->json(medidor_procedencia($db, $desde, $hasta));
                case 'paginas':    $this->json(medidor_paginas($db, $desde, $hasta));
                case 'documental': $this->json(medidor_documental($db, $desde, $hasta));
                case 'fotos':      $this->json(medidor_fotos($db, $desde, $hasta));
                case 'visitas':    $this->json(medidor_visitas($db, $desde, $hasta, rcube_utils::get_input_string('_quien', rcube_utils::INPUT_GET)));
                case 'visita':     $this->json(medidor_visita($db, rcube_utils::get_input_string('_id', rcube_utils::INPUT_GET)));
                case 'enlaces':    $this->json(medidor_enlaces($db));
            }
            $this->json(['error' => 'vista'], 400);
        } catch (Throwable $e) {
            rcube::raise_error(['code' => 500, 'message' => 'medidor: ' . $e->getMessage()], true, false);
            $this->json(['error' => 'base'], 500);
        }
    }

    // Crear o borrar un enlace con nombre. Va por POST con la ficha de seguridad de Roundcube.
    public function enlace()
    {
        $rcmail = rcmail::get_instance();
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$rcmail->check_request(rcube_utils::INPUT_POST)) $this->json(['error' => 'ficha'], 403);
        $this->cargar();
        $db = medidor_db();
        $codigo = strtolower(trim(rcube_utils::get_input_string('codigo', rcube_utils::INPUT_POST)));
        if (!preg_match('/^[a-z0-9-]{3,24}$/', $codigo)) $this->json(['error' => 'El código va con letras, números o guiones, de 3 a 24.'], 400);
        if (rcube_utils::get_input_string('borrar', rcube_utils::INPUT_POST)) {
            $db->prepare('DELETE FROM enlaces WHERE codigo = ?')->execute([$codigo]);
        } else {
            $nombre = trim(rcube_utils::get_input_string('nombre', rcube_utils::INPUT_POST));
            if ($nombre === '') $this->json(['error' => 'Falta el nombre.'], 400);
            $db->prepare('INSERT INTO enlaces (codigo, nombre, nota, creado) VALUES (?,?,?,?)
                ON CONFLICT(codigo) DO UPDATE SET nombre = excluded.nombre, nota = excluded.nota')
               ->execute([$codigo, mb_substr($nombre, 0, 120), mb_substr(trim(rcube_utils::get_input_string('nota', rcube_utils::INPUT_POST)), 0, 300) ?: null, (int) (microtime(true) * 1000)]);
        }
        $this->json(medidor_enlaces($db));
    }
}
