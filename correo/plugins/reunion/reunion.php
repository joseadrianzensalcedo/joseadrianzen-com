<?php
/* Reuniones desde el correo de joseadrianzen.com.
 *
 * Peras y manzanas: en la barra del correo aparece una cámara. Ahí empiezas una videollamada de Meet al toque,
 * entras a una con su código, o programas una: pones título, día, hora e invitados (salen de tus contactos),
 * y se abre Google Calendar con todo ya llenado. Al guardar, Google le pone el enlace de Meet y manda las
 * invitaciones. La videollamada pasa en Meet, en otra pestaña: Google no deja meter Meet dentro de otra web
 * (se probó el 2 de octubre de 2026, responde "403, no tienes acceso").
 *
 * No usa permisos de Google ni guarda contraseñas: solo arma direcciones de Meet y de Calendar.
 */
class reunion extends rcube_plugin
{
    public $task = '.*';

    public function init()
    {
        $this->load_config();
        if (!$this->permitido()) return;
        $this->add_texts('localization/', false);
        $this->register_task('reunion');
        $this->register_action('index', [$this, 'panel']);
        $this->register_action('contactos', [$this, 'contactos']);
        $this->add_hook('startup', [$this, 'arranque']);
    }

    private function permitido(): bool
    {
        $rc = rcmail::get_instance();
        if (empty($rc->user) || empty($rc->user->ID)) return false;
        $quien = strtolower((string) $rc->user->data['username']);
        return in_array($quien, array_map('strtolower', (array) $rc->config->get('reunion_usuarios', ['yo@joseadrianzen.com'])), true);
    }

    public function arranque($args)
    {
        $rc = rcmail::get_instance();
        if ($rc->output->type == 'html' && !$rc->output->framed) {
            $this->add_button([
                'command' => 'reunion', 'type' => 'link', 'class' => 'reunion', 'classsel' => 'reunion selected',
                'innerclass' => 'inner', 'label' => 'reunion.boton', 'title' => 'reunion.titulo',
            ], 'taskbar');
        }
        $this->include_stylesheet('reunion-boton.css');
        return $args;
    }

    public function panel()
    {
        $rc = rcmail::get_instance();
        $rc->output->set_pagetitle($this->gettext('titulo'));
        $rc->output->set_env('reunion_cuenta', (string) $rc->config->get('reunion_cuenta_google', ''));
        $rc->output->set_env('reunion_zona', (string) $rc->config->get('reunion_zona', 'America/Lima'));
        $this->include_stylesheet('reunion.css');
        $this->include_script('reunion.js');
        $rc->output->send('reunion.panel');
    }

    // Tus contactos (nombre y correo), para sugerir invitados mientras escribes.
    public function contactos()
    {
        $rc = rcmail::get_instance();
        $lista = [];
        foreach ((array) $rc->get_address_sources() as $id => $fuente) {
            $libro = $rc->get_address_book($id);
            if (!$libro) continue;
            $libro->set_pagesize(2000);
            $res = $libro->list_records(['name', 'email', 'firstname', 'surname']);
            while ($res && ($r = $res->next())) {
                $nombre = trim($r['name'] ?? trim(($r['firstname'] ?? '') . ' ' . ($r['surname'] ?? '')));
                foreach ((array) $libro->get_col_values('email', $r, true) as $correo) {
                    if ($correo) $lista[strtolower($correo)] = ['n' => $nombre, 'e' => $correo];
                }
            }
        }
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(array_values($lista), JSON_UNESCAPED_UNICODE);
        exit;
    }
}
