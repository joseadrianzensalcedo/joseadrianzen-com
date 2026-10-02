-- Medidor de visitas de joseadrianzen.com. Base SQLite, fuera de public_html.
-- Una fila en "visitas" por cada visita (una persona, una pestaña, hasta 30 minutos sin moverse).
-- Una fila en "eventos" por cada cosa que pasó en esa visita.

PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS visitas (
  id            TEXT PRIMARY KEY,        -- lo inventa el navegador al entrar
  visitante     TEXT NOT NULL,           -- 'p...' si aceptó que lo reconozcamos, 'd...' si no (cambia cada día)
  consentimiento INTEGER,                -- 1 aceptó, 0 no aceptó, NULL todavía no decide
  inicio        INTEGER NOT NULL,        -- milisegundos desde 1970 (hora del servidor)
  fin           INTEGER NOT NULL,
  pais          TEXT, pais_codigo TEXT, region TEXT, ciudad TEXT,
  lat           REAL, lon REAL,          -- del centro de la ciudad, no de la persona
  red           TEXT,                    -- quién le da internet: empresa, universidad o proveedor
  dispositivo   TEXT, sistema TEXT, navegador TEXT,
  idioma        TEXT, zona_horaria TEXT, pantalla TEXT, idioma_pagina TEXT,
  referencia    TEXT,                    -- de qué sitio llegó (solo el dominio)
  campana       TEXT,                    -- utm_source / utm_medium / utm_campaign
  enlace        TEXT,                    -- código del enlace con nombre, si llegó por uno
  entrada       TEXT,                    -- primera página
  paginas       INTEGER NOT NULL DEFAULT 0,
  segundos      INTEGER NOT NULL DEFAULT 0, -- tiempo con la página a la vista
  eventos       INTEGER NOT NULL DEFAULT 0,
  robot         INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_visitas_inicio ON visitas(inicio);
CREATE INDEX IF NOT EXISTS ix_visitas_visitante ON visitas(visitante);

CREATE TABLE IF NOT EXISTS eventos (
  id      INTEGER PRIMARY KEY,
  visita  TEXT NOT NULL,
  t       INTEGER NOT NULL,   -- milisegundos desde 1970
  tipo    TEXT NOT NULL,      -- pag, sal, sec, foto, clic, vid, vtr, con
  pagina  TEXT,
  dato    TEXT                -- JSON chico con el detalle
);
CREATE INDEX IF NOT EXISTS ix_eventos_visita ON eventos(visita, t);
CREATE INDEX IF NOT EXISTS ix_eventos_tipo ON eventos(tipo, t);

-- Enlaces con nombre: Jose crea uno por persona (un programador de festival, una productora) y sabe cuándo entró.
CREATE TABLE IF NOT EXISTS enlaces (
  codigo  TEXT PRIMARY KEY,
  nombre  TEXT NOT NULL,
  nota    TEXT,
  creado  INTEGER NOT NULL
);

-- Sal del día para el identificador de quien no aceptó: se borra al día siguiente, así no se puede unir un día con otro.
CREATE TABLE IF NOT EXISTS sal (
  dia  TEXT PRIMARY KEY,
  sal  TEXT NOT NULL
);
