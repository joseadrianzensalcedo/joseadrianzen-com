# Encargo de traducción, sitio joseadrianzen.com

Fuente: `fuente-traduccion.json`. Es un objeto JSON donde cada CLAVE es la frase original en español y cada VALOR es la versión en inglés ya aprobada por el autor (úsala como referencia de sentido, traduce desde el español).

Qué entregar: un archivo `src/data/traducciones/<código>.json` por idioma, con EXACTAMENTE las mismas claves (la frase en español, copiada sin tocar ni un carácter) y como valor la traducción. Las 188 claves, ninguna menos.

Contexto: web personal de Jose Adrianzen, director y productor de cine peruano. Documental premiado "Entre polvo y sueños" sobre mujeres mineras del Perú y cortometraje "ECO", thriller psicológico aún sin estrenar. Público: programadores de festivales, productores, prensa. Tono: directo, sobrio, cinematográfico, sin adornos ni frases de marketing.

Reglas:
1. No traducir nombres propios: Jose Adrianzen (siempre sin tilde), María Reyes, Julia Pomalique, Vilma Contreras, Matilde Carrión, Solidaridad, BÁLU, RECLAIM Sustainability!, EPIC, UTP, TITAN, Noida, Docuvision, Callao, Arequipa, Puno, Madre de Dios, Lima.
2. Los títulos de las películas se traducen en cada idioma (decisión de Jose, 4 oct 2026). La fuente única es `herramientas/titulos_datos.py` y la pasa al sitio `herramientas/titulos_exportar.py`: el exportador reemplaza "Entre polvo y sueños" y "ECO" dentro de los textos ya traducidos, así que al traducir una frase nueva deja el título en español tal cual y el exportador lo cambia. Solo "Toz ve Düşler Arasında" (turco) es título oficial, el resto son propuestas pendientes de revisión por un hablante nativo (ver NOTAS-titulos.md). En los idiomas de otro alfabeto, el nombre "Jose Adrianzen" se escribe en ese alfabeto, igual que en los logos.
3. Conserva símbolos y formato: ▶, ❚❚, ←, ·, |, comillas, mayúsculas iniciales. La clave "Contado|desde|adentro" es una frase partida en tres líneas para un titular gigante: devuelve tu traducción también en tres partes separadas por |, cortas, que se lean como un titular ("Told|from|within" en inglés).
4. Nunca uses guion largo (—) ni guion medio (–) ni punto y coma. Usa coma o punto.
5. "pallaquera" es un oficio (mujer que recoge mineral entre la roca descartada): conserva la palabra en cursiva mental y explica en pocas palabras si hace falta, igual que la versión inglesa.
6. "clave alta" y "clave baja" son términos de iluminación (high key, low key). Usa el término técnico del idioma.
7. Frases de interfaz (Menú, Cerrar, Ver, Leer, Arrastra) van cortas, como en apps reales de ese idioma.
8. Las descripciones (las frases largas que empiezan con "Jose Adrianzen, director..." o "Un artículo por semana...") son para Google: naturales y bajo 160 caracteres.
9. Si un término no tiene traducción segura, déjalo como en la versión inglesa y anótalo en `src/data/traducciones/NOTAS-<código>.md` con la clave y la duda. No inventes datos.

Idiomas y variantes:
pt portugués de Brasil · fr francés · it italiano · de alemán · nl neerlandés · pl polaco · ru ruso · uk ucraniano · tr turco · ar árabe estándar moderno · hi hindi (devanagari) · sw suajili · qu quechua sureño (chanka o collao, escritura oficial del Perú; marca en NOTAS todo lo que no sea seguro) · zh chino mandarín simplificado · ja japonés · ko coreano · id indonesio · vi vietnamita · th tailandés · fil filipino (tagalo).

Al terminar: valida cada archivo con `python3 -c "import json;a=json.load(open('fuente-traduccion.json'));b=json.load(open('src/data/traducciones/<c>.json'));assert set(a)==set(b),set(a)^set(b);assert not any(('—' in v or '–' in v or ';' in v) for v in b.values());print('ok',len(b))"` y corrige hasta que diga ok.
