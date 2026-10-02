# Medidor de visitas de joseadrianzen.com

Peras y manzanas: la web anota lo que pasa en cada visita y lo guarda en tu propio servidor. Tú lo ves en el
correo, detrás de un candado que solo aparece cuando entras como yo@joseadrianzen.com. Nada pasa por Google.

## Qué mide

- Quién: visita anónima, persona reconocida (si aceptó el aviso) o nombre propio (si entró por un enlace con nombre).
- Desde dónde: país, región, ciudad y la empresa que le da internet. Sale de la IP en el momento y la IP se bota.
- Con qué: celular, tableta o computadora, sistema, navegador (incluye "dentro de Instagram", LinkedIn, WhatsApp), idioma, zona horaria, pantalla.
- Cómo llegó: sitio de origen, campaña (utm) y enlace con nombre.
- Qué hizo: páginas, tiempo con la página a la vista, hasta dónde bajó, secciones vistas y su tiempo, fotos vistas (un segundo con el 60 % en pantalla), clics.
- Documental y tráiler: si lo abrió, cada play y pausa con el segundo exacto, saltos (de dónde a dónde), subtítulos, sonido, pantalla completa, si llegó al final. Qué tramos de 5 segundos vio. El panel arma la curva de retención, dónde dejaron de ver y dónde pausaron.

## Lo que no se puede saber

- Edad: ninguna visita la trae. Solo Google Analytics con "señales de Google" la estima, para usuarios con sesión de Google y en grupos grandes. No se usa.
- Nombre: solo con enlaces con nombre. Creas uno por persona en el panel ("Enlaces con nombre"), se lo mandas, y su visita sale con su nombre.
- Ciudad exacta: la base gratuita acierta el país casi siempre; la ciudad puede fallar por decenas de kilómetros, y con datos móviles puede salir la ciudad de la antena del operador.

## Aviso y ley

La web muestra un aviso abajo. Sí: se reconoce a la persona cuando vuelve. No: la visita se cuenta igual con un código que cambia cada día.
Hay página de privacidad (/privacidad) y enlace en el pie. Esto busca cumplir la Ley 29733; no soy abogado y
conviene que alguien lo revise antes de publicar.

## Instalar (una vez, por SSH en Hostinger)

1. Sube la rama `portada-diseno` a GitHub.
2. En el servidor:
   ```
   cd ~
   curl -fsSLO https://raw.githubusercontent.com/joseadrianzensalcedo/joseadrianzen-com/portada-diseno/medidor/instalar-medidor.sh
   bash instalar-medidor.sh
   ```
3. En hPanel > Avanzado > Cron, la línea que el script te muestra al final (actualiza las bases cada mes).
4. La puerta `/v/` llega con la web nueva. Hasta que publiques, la web vieja no manda nada.

## Probado (1 de octubre de 2026, copia local)

Roundcube 1.7.2, PHP 8.4, Chromium. Dos visitantes simulados (Lima en iPhone desde Instagram con enlace con nombre, y Madrid en computadora que dijo que no), con un reproductor de Vimeo de prueba.
Todo dato llegó al panel. Sin sesión el panel no responde. Otro buzón no ve el candado ni los datos. Tu navegador, tras abrir el correo, no se cuenta. 40 escrituras al mismo tiempo: 40 guardadas.

Sin probar: el servidor real de Hostinger y la descarga de DB-IP (la dirección `download.db-ip.com/free/dbip-city-lite-AAAA-MM.mmdb.gz` es supuesto, no pude abrirla desde aquí).

## Créditos

IP Geolocation by DB-IP (https://db-ip.com), licencia CC BY 4.0. Lector MaxMind DB para PHP 1.14.0, licencia Apache 2.0.
