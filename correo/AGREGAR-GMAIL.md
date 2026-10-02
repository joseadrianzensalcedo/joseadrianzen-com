# Gmail dentro de joseadrianzen.com/correo

Peras y manzanas: hoy el correo de la web abre un solo buzón, yo@joseadrianzen.com. Con esto, arriba a la izquierda,
donde sale el nombre del buzón, aparece un selector. Eliges "Gmail" y ves tu Gmail. Eliges yo@ y vuelves. Los dos en
la misma pantalla, con la misma piel del sitio, sin salir ni volver a entrar.

Nada se copia ni se mueve: cada correo sigue en su servidor (Hostinger y Google). La web solo los muestra.

Técnico: plugin ident_switch 5.0.5 para Roundcube (Gecka, licencia AGPL 3.0), que guarda cada cuenta aparte y cambia
de una a otra en la misma sesión. El Gmail entra por IMAP (imap.gmail.com:993) y sale por SMTP (smtp.gmail.com:465),
los dos con SSL, que son los servidores que publica Google
(https://developers.google.com/workspace/gmail/imap/imap-smtp, consultado el 1 de octubre de 2026).

## Lo que ya está hecho (en este repositorio)

- `agregar-gmail.sh`: instala el plugin en la Roundcube que ya está en el servidor, crea su tabla, lo activa y deja
  el Gmail preconfigurado (los servidores se llenan solos). Hace una copia de la configuración antes de tocarla.
- La piel `adrianzen` ubica el selector donde iba el nombre del buzón, con la letra de máquina del sitio. Sin esto
  el selector quedaba escondido: el plugin solo se ubica solo en las pieles de fábrica.
- La pantalla del plugin en español (el plugin no trae español).
- Probado el 1 de octubre de 2026 en una copia local: Roundcube 1.7.2, PHP 8.4, SQLite, dos buzones de prueba.
  Se entró al buzón de yo@, se agregó el segundo como cuenta aparte, se cambió de una a otra, se leyó el correo de
  cada una y se envió un correo desde la segunda (salió por su propio servidor de salida).

## Lo que haces tú (tres pasos, unos 15 minutos)

### 1. En el servidor, una vez

Entra por SSH a Hostinger y corre:

```
cd ~
curl -fsSLO https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/portada-diseno/correo/agregar-gmail.sh
bash agregar-gmail.sh
```

(La rama `portada-diseno` tiene que estar subida a GitHub antes. Si cambias de rama, cambia esa palabra en la dirección.)

El script se detiene y dice qué pasa si algo falta. Los dos frenos más probables:

- **PHP menor a 8.2.** El plugin pide 8.2 o más. Se cambia en hPanel > Avanzado > Configuración PHP.
- **"El hosting no llega a imap.gmail.com:993".** Hostinger estaría cerrando ese puerto de salida. Se pide a su
  soporte que lo abra. No pude comprobarlo desde aquí: es un supuesto hasta que corras el script.

### 2. En tu cuenta de Google, crea una contraseña de aplicación

Es una contraseña aparte, solo para el correo de la web. No es tu contraseña de Gmail y no sirve para entrar a tu
cuenta de Google.

1. Tu cuenta de Google tiene que tener la verificación en dos pasos encendida.
2. Entra a https://myaccount.google.com/apppasswords
3. Ponle de nombre "Correo joseadrianzen.com" y créala. Google te muestra 16 letras. Cópialas.

Según Google, las contraseñas de aplicación siguen disponibles para cuentas personales con verificación en dos pasos,
pero Google no las recomienda y prefiere "Iniciar sesión con Google"
(https://support.google.com/accounts/answer/185833, consultado el 1 de octubre de 2026). Más abajo explico por qué
aquí sí conviene usarla.

### 3. En el correo de la web, agrega el Gmail

1. Entra a https://joseadrianzen.com/correo con yo@ como siempre.
2. Configuración > Identidades > Crear.
3. Nombre: Jose Adrianzen. Correo electrónico: tu Gmail.
4. Tipo de cuenta: **Cuenta aparte**. Los servidores se llenan solos.
5. Nombre en el selector: Gmail.
6. Contraseña: las 16 letras del paso 2.
7. Guardar. Al guardar, la web prueba la conexión: si algo está mal, lo dice ahí mismo.

Listo. Arriba a la izquierda aparece el selector "yo@joseadrianzen.com / Gmail".

## Por qué así y no de otra forma

- **"Iniciar sesión con Google" en vez de contraseña de aplicación.** Roundcube lo permite, pero para leer correo
  Google pide registrar una aplicación propia. Mientras esa aplicación está "en prueba", el permiso vence cada 7 días
  y tendrías que volver a autorizar cada semana
  (https://developers.google.com/identity/protocols/oauth2, consultado el 1 de octubre de 2026). Para sacarla de
  prueba con permiso de leer correo, Google exige una verificación de "alcance restringido" con revisión de
  seguridad (https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification,
  consultado el 1 de octubre de 2026). Para un solo buzón no vale el trámite.
- **Traer el correo de yo@ al Gmail.** Gmail deja de traer correo de otras cuentas por POP y quita Gmailify en enero
  de 2027 (https://support.google.com/mail/answer/17101213, consultado el 1 de octubre de 2026). Sería armar algo que
  se cae en tres meses.
- **Meter Gmail en un marco dentro de la página.** Google no deja que mail.google.com se muestre dentro de otra
  página. No lo probé hoy: es lo que sé de cómo funciona, sin verificar.

## Cuidados

- La contraseña de aplicación da acceso a todo tu Gmail. Queda guardada cifrada en la base del correo de la web
  (con la clave `des_key` del servidor). Si un día sospechas algo, la borras en
  https://myaccount.google.com/apppasswords y deja de funcionar al instante, sin tocar tu contraseña de Gmail.
- El plugin escribe avisos `Undefined array key "archive_mbox_default_iswitch"` en `logs/errors.log`. Son avisos de
  PHP del propio plugin, no errores: el correo funciona igual. Si llenan mucho el registro, se reporta al autor.

## Deshacer

```
rm -rf ~/domains/joseadrianzen.com/roundcube/plugins/ident_switch
cp ~/domains/joseadrianzen.com/roundcube/config/config.inc.php.antes-de-gmail.* ~/domains/joseadrianzen.com/roundcube/config/config.inc.php
```

(Si hay más de una copia, usa la más vieja.) La tabla `ident_switch` queda en la base, vacía de uso: no molesta.
