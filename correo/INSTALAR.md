# Correo propio en joseadrianzen.com/correo

> **Gmail en el mismo correo:** ver `AGREGAR-GMAIL.md` (1 de octubre de 2026).

> **Ya esta instalado y funcionando** (26 de agosto de 2026). Esta guia queda
> como referencia para reinstalar, mover el correo a otro hosting o entender
> que hay montado. Para el dia a dia no hace falta abrirla.
>
> Instalado: Roundcube 1.7.2 en `~/domains/joseadrianzen.com/roundcube`,
> **fuera** de `public_html`, publicado en `/correo` con un enlace simbolico.
> Todo el proceso lo hace `instalar.sh` de un tiron.

El buzon sigue siendo el de siempre (`yo@joseadrianzen.com`, en Hostinger).
Lo unico que cambia es quien lo enseña: en vez de `mail.hostinger.com`, un
Roundcube nuestro, vestido con la piel del sitio, servido desde el dominio.
Misma contraseña, mismos correos, misma libreta.

Esto no se puede automatizar desde el repositorio: hay que entrar al hosting
una vez. Son unos veinte minutos.

## Antes de empezar

- **Plan Business de Hostinger con acceso SSH.** Esta en hPanel > Avanzado >
  Acceso SSH. Sin SSH tambien se puede (Administrador de archivos), pero el
  paso de la base de datos se complica bastante.
- **PHP 8.1 o superior.** hPanel > Avanzado > Configuracion PHP. Roundcube 1.7
  ya no funciona por debajo de 8.1.
- **Extensiones de PHP**: `pdo_sqlite`, `mbstring`, `iconv`, `intl`, `zip`,
  `openssl`, `session`, `dom`, `filter`, `exif`. Casi todas vienen puestas;
  las que falten se activan en esa misma pantalla. Ojo: `imap` **no** hace
  falta, Roundcube habla IMAP por su cuenta.
- La contraseña del buzon a mano.

## 1. Bajar Roundcube

Del sitio oficial, la version **complete** (trae ya las dependencias; la
otra obliga a un paso extra con composer).

```
cd ~
curl -LO https://github.com/roundcube/roundcubemail/releases/download/1.7.2/roundcubemail-1.7.2-complete.tar.gz
tar xzf roundcubemail-1.7.2-complete.tar.gz
```

Comprueba en https://roundcube.net/download/ cual es la ultima 1.7.x antes de
copiar el numero: sale una cada pocas semanas y casi siempre son de seguridad.

## 2. Ponerlo FUERA de public_html

Este es el paso que mas seguridad da y el que mas se salta la gente. Si
Roundcube vive dentro de `public_html`, su configuracion, sus registros y su
base de datos quedan a un URL de distancia. Fuera, no existen para el
navegador: solo se publica su carpeta `public_html/`.

```
mv ~/roundcubemail-1.7.2 ~/domains/joseadrianzen.com/roundcube
cd ~/domains/joseadrianzen.com
ln -s ../roundcube/public_html public_html/correo
```

Si el enlace simbolico no funciona (algunos servidores lo capan), ve al
**plan B** del final.

## 3. Poner la piel y la configuracion

Desde este repositorio, sube:

| De aqui | A alli |
|---|---|
| `correo/skins/adrianzen/` | `~/domains/joseadrianzen.com/roundcube/skins/adrianzen/` |
| `correo/config/config.inc.php` | `~/domains/joseadrianzen.com/roundcube/config/config.inc.php` |

Y abre el `config.inc.php` del servidor para rellenar el unico hueco:

```
cd ~/domains/joseadrianzen.com/roundcube
openssl rand -base64 24 | cut -c1-24     # copia el resultado
nano config/config.inc.php               # pegalo en des_key
```

Tienen que ser **24 caracteres exactos**. Con eso Roundcube cifra la
contraseña dentro de la sesion.

## 4. Crear la base de datos

Es un solo fichero SQLite. No hay que crear nada en hPanel.

```
cd ~/domains/joseadrianzen.com/roundcube
bin/initdb.sh --dir=SQL
chmod 640 roundcube.db
chmod -R 775 logs temp
```

## 5. Ajustar el .htaccess

Pega el contenido de `correo/htaccess-anadir.txt` **al final** de
`~/domains/joseadrianzen.com/roundcube/public_html/.htaccess`.

Añadir, no reemplazar. Ese fichero ya trae compresion, cache y `-Indexes`
de Roundcube; lo nuestro solo cambia la CSP, porque la del sitio (pensada
para la portada, con `frame-src` solo para Vimeo) se hereda hacia dentro y
deja el correo a medias sin avisar de nada.

## 6. Entrar

https://joseadrianzen.com/correo

Usuario: `yo` (el `@joseadrianzen.com` lo pone la configuracion).
Contraseña: la del buzon.

Comprueba estas cuatro cosas antes de darlo por bueno:

1. Se ven los correos de la bandeja.
2. Mandas uno de prueba y **aparece en Enviados**. Si no aparece, no toques
   el `config.inc.php`: se arregla en Ajustes > Carpetas, diciendo cual es la
   de enviados. Cada servidor IMAP las llama a su manera.
3. Un adjunto se descarga.
4. En la pestaña del navegador sale la J naranja, no el logo azul.

## Si algo falla

Casi siempre es una de tres:

- **Pantalla en blanco o a medio pintar** → es la CSP. Abre la consola del
  navegador (F12), mira que origen se queja y ajusta el bloque del paso 5.
- **"Connection to storage server failed"** → IMAP. Contrasta los servidores
  con hPanel > Correos > Configuracion: manda lo que diga hPanel, no lo que
  dice la plantilla.
- **Errores raros al guardar** → permisos de `logs/` y `temp/`. El detalle
  esta en `roundcube/logs/errors.log`.

## Actualizar Roundcube

Esto es software con acceso a tu correo: las actualizaciones de seguridad se
ponen. El script `installto.sh` conserva configuracion, base de datos y piel.

```
cd ~
curl -LO https://github.com/roundcube/roundcubemail/releases/download/X.Y.Z/roundcubemail-X.Y.Z-complete.tar.gz
tar xzf roundcubemail-X.Y.Z-complete.tar.gz
cd roundcubemail-X.Y.Z
bin/installto.sh ~/domains/joseadrianzen.com/roundcube
```

Apuntate en el calendario mirar https://roundcube.net/news/ cada tanto, o
suscribete a las notas de version en GitHub.

Despues de cada actualizacion, entra y mira la interfaz un minuto: la piel
repinta encima de la de Elastic, y si Elastic estrena un componente puede
aparecer un trozo con los colores de fabrica. Se arregla añadiendo el
selector nuevo al final de `styles/adrianzen.css`, nunca reescribiendo la
hoja entera.

## Plan B: sin enlace simbolico

Si el `ln -s` del paso 2 no funciona, se instala todo dentro:

```
mv ~/roundcubemail-1.7.2 ~/domains/joseadrianzen.com/public_html/correo
```

Y entonces **hay que tapar a mano** lo que antes tapaba estar fuera. Crea
`public_html/correo/.htaccess` con:

```
<FilesMatch "(config|logs|temp|SQL|bin|installer)">
  Require all denied
</FilesMatch>
RedirectMatch 404 ^/correo/(config|logs|temp|SQL|bin|installer|vendor|program)/
RedirectMatch 404 ^/correo/roundcube\.db
```

Con este plan la direccion pasa a ser la misma, `joseadrianzen.com/correo`,
pero el `public_html/` interno de Roundcube queda accesible como
`/correo/public_html/`. Funciona, pero es mas fragil: si puedes, insiste con
el enlace simbolico.

## Que habia antes (y donde esta)

En el servidor habia un intento anterior de webmail. Se respaldo entero y se
aparto; no se ha borrado nada. Esta en `~/respaldos/AAAAMMDD-HHMM/`:

- `webmail-anterior.tar.gz` (14 MB) — todo tal como estaba.
- `Correo-anterior/` — Roundcube **1.6.9**, que se quedo sin las
  actualizaciones de seguridad de casi un año. Su piel `adrianzen` traia
  `ui.js` y `styles/styles.css`, los dos nombres prohibidos: tapaban los de
  Elastic, asi que la interfaz no llegaba a pintarse bien.
- `correo-anterior/` — una pagina que redirigia a `/Correo/`.
- `correo.zip` (5 MB) y `instalar-7c0fa203161b.php` — estos dos estaban
  **publicados en la web**. El PHP extraia el zip sobre `public_html/correo/`
  sin pedir contraseña a nadie: cualquiera que diera con la direccion podia
  dispararlo. Se sacaron de `public_html` antes que nada.

La base de datos vieja tenia 1 usuario, 1 identidad y **0 contactos**, asi que
no habia nada que migrar. Si algun dia quieres recuperar algo de ahi, esta
todo en el respaldo.

## Lo que no hay que tocar

- **`skins/elastic/`**: nunca. La piel `adrianzen` hereda de ella (`extends`
  en `meta.json`); si la editas, la siguiente actualizacion se lleva tus
  cambios por delante.
- **Los nombres `ui.js` y `styles/styles.css` dentro de `skins/adrianzen/`**:
  estan prohibidos. Roundcube busca esos ficheros primero en nuestra piel y
  luego en Elastic, asi que un fichero con ese nombre no se suma al de
  Elastic: lo sustituye, y la interfaz se cae entera. Por eso los nuestros se
  llaman `adrianzen.js` y `styles/adrianzen.css`.
- **`enable_installer`**: se queda en `false` para siempre. El instalador lee
  la configuracion y no pide contraseña.
