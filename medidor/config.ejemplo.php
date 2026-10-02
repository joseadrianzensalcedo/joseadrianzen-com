<?php
/* Copia este archivo como config.php (en la misma carpeta) solo si necesitas cambiar algo.
 * Sin config.php, el medidor usa estos mismos valores.
 */
return [
    'base'           => __DIR__ . '/datos/medidor.sqlite',          // la base, fuera de public_html
    'geo_ciudad'     => __DIR__ . '/geo/dbip-city-lite.mmdb',       // país, región, ciudad (DB-IP, CC BY 4.0)
    'geo_red'        => __DIR__ . '/geo/dbip-asn-lite.mmdb',        // empresa o proveedor de internet (DB-IP, CC BY 4.0)
    'origenes'       => ['joseadrianzen.com', 'www.joseadrianzen.com'], // de dónde se aceptan datos
    'panel_usuarios' => ['yo@joseadrianzen.com'],                    // quién ve el candado en el correo
];
