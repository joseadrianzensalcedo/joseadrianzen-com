<?php
/* Tu calendario de Google dentro del correo de joseadrianzen.com.
 *
 * Peras y manzanas: un ícono de calendario en la barra del correo. Al abrirlo ves tu agenda de Google ahí mismo,
 * sin cambiar de pestaña. Solo se ve si ese navegador tiene tu cuenta de Google abierta: Google muestra los eventos
 * a quien tiene permiso, no a quien abre la página. Se probó el 2 de octubre de 2026 con tu Gmail y mostró tus
 * eventos privados.
 */
class agenda extends rcube_plugin
{
    public $task = '.*';

    public function init()
    {
        $this->load_config();
        $rc = rcmail::get_instance();
        if (empty($rc->user) || empty($rc->user->ID)) return;
        $lista = array_map('strtolower', (array) $rc->config->get('agenda_usuarios', ['yo@joseadrianzen.com']));
        if (!in_array(strtolower((string) $rc->user->data['username']), $lista, true)) return;
        $this->add_texts('localization/', false);
        $this->register_task('agenda');
        $this->register_action('index', [$this, 'panel']);
        $this->add_hook('startup', [$this, 'arranque']);
    }

    public function arranque($args)
    {
        $rc = rcmail::get_instance();
        if ($rc->output->type == 'html' && !$rc->output->framed) {
            $this->add_button(['command' => 'agenda', 'type' => 'link', 'class' => 'agenda', 'classsel' => 'agenda selected',
                'innerclass' => 'inner', 'label' => 'agenda.boton', 'title' => 'agenda.titulo'], 'taskbar');
        }
        $this->include_stylesheet('agenda-boton.css');
        return $args;
    }

    public function panel()
    {
        $rc = rcmail::get_instance();
        $rc->output->set_pagetitle($this->gettext('titulo'));
        $rc->output->set_env('agenda_calendarios', (array) $rc->config->get('agenda_calendarios', []));
        $rc->output->set_env('agenda_zona', (string) $rc->config->get('agenda_zona', 'America/Lima'));
        $this->include_stylesheet('agenda.css');
        $this->include_script('agenda.js');
        $rc->output->send('agenda.panel');
    }
}
