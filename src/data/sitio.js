// Datos del sitio. Todo el texto y las listas viven aquí, separados del diseño.
// Cambiar un premio, una sinopsis o una foto se hace en este archivo, sin tocar las páginas.
// Cada texto va en español (es) y en inglés (en). El inglés es traducción de Claude, pendiente de revisión de Jose.

export const persona = {
  nombre: 'Jose Adrianzen',
  rol: { es: 'Director · Productor', en: 'Director · Producer' },
  correo: 'yo@joseadrianzen.com',
  base: { es: 'Lima, Perú', en: 'Lima, Peru' },
  nacimiento: '22.09.1989',
};

/* La idea de la portada. "Contado desde adentro", elegida por Jose el 30 set 2026. Reemplaza "Hasta el último rincón". */
export const idea = {
  lineas: { es: 'Contado|desde|adentro', en: 'Told|from|within' },
  texto: {
    es: 'Cine sobre lo que queda oculto, hasta donde esté. Historias de gente que casi nadie filma, contadas desde adentro.',
    en: 'Films about what stays hidden, wherever it is. Stories of people almost no one films, told from the inside.',
  },
};

export const premios = [
  { k: { es: 'Mejor documental', en: 'Best Documentary' }, v: 'TITAN International Film Festival', d: { es: 'Sídney, Australia · 3.ª edición · 2025', en: 'Sydney, Australia · 3rd edition · 2025' }, corto: 'TITAN 2025' , laurel: 'titan' },
  { k: { es: 'Mejor guion', en: 'Best Screenplay' }, v: '13.º Noida International Film Festival', d: { es: 'Noida, India · 2026', en: 'Noida, India · 2026' }, corto: 'Noida 2026' , laurel: 'noida-guion' },
  { k: { es: 'Best of Festival', en: 'Best of Festival' }, v: 'Docuvision International Film Festival', d: { es: 'Lewes, Delaware, EE. UU. · 2026', en: 'Lewes, Delaware, USA · 2026' }, corto: 'Docuvision 2026' , laurel: 'docuvision' },
  { k: { es: 'Mención especial', en: 'Special Mention' }, v: '13.º Noida International Film Festival', d: { es: 'Noida, India · 2026', en: 'Noida, India · 2026' }, corto: 'Noida 2026' , laurel: 'noida-mencion' },
];

export const selecciones = [
  { n: '21.º International Labour Film Festival', d: { es: 'Türkiye · 2026', en: 'Türkiye · 2026' } , laurel: 'labour' },
  { n: 'The Workers Unite Film Festival', d: { es: 'Nueva York, EE. UU. · 2025', en: 'New York, USA · 2025' } , laurel: 'workers-unite' },
  { n: 'London Vision Film Festival', d: { es: 'Londres, Reino Unido · 2025', en: 'London, United Kingdom · 2025' } , laurel: 'london-vision' },
  { n: 'LISBIFF Lisboa Indie Film Festival', d: { es: 'Lisboa, Portugal · 2025', en: 'Lisbon, Portugal · 2025' } , laurel: 'lisbiff' },
  { n: 'Cine Invisible “Film Sozialak”', d: { es: 'Bilbao, España · 2026', en: 'Bilbao, Spain · 2026' } , laurel: 'cine-invisible' },
  { n: 'FIMMER · Festival Internacional de Mediometrajes', d: { es: 'Manzanares El Real, España · 2025', en: 'Manzanares El Real, Spain · 2025' } , laurel: 'fimmer' },
  { n: 'ImoIFF Creatives International Film Festival', d: { es: 'Imo, Nigeria · 2025', en: 'Imo, Nigeria · 2025' } , laurel: 'imoiff' },
  { n: 'Cinego Shorts · Shorts on the Move', d: { es: 'Karachi, Pakistán', en: 'Karachi, Pakistan' } , laurel: 'cinegoshorts' },
  { n: 'Film Hour · Bodhak Studio', d: { es: 'India', en: 'India' } , laurel: 'film-hour' },
  { n: 'Cinematic Luxe Indie Showcase', d: { es: 'Winter Fest 26 · Cincinnati, EE. UU.', en: 'Winter Fest 26 · Cincinnati, USA' } , laurel: 'cinematic-luxe' },
  { n: '20.ª Muestra Cine + Video Indígena', d: { es: 'Chile · 2026', en: 'Chile · 2026' } },
];

/* Sinopsis del documental.
   Fuente de los hechos: nota de prensa de Solidaridad, coproductora, "Entre Polvo y Sueños: New Documentary on the Strength
   and Collective Power of Women Miners", publicada el 14 ago 2025, consultada el 30 set 2026:
   https://www.solidaridadnetwork.org/news/entre-polvo-y-suenos-new-documentary-on-the-strength-and-collective-power-of-women-miners/
   "Tres años" sale de la bio de Jose. Redactada por Claude y aprobada por Jose como sinopsis oficial el 30 set 2026. */
export const documental = {
  slug: 'entre-polvo-y-suenos',
  titulo: 'Entre polvo y sueños',
  tituloEn: 'Between Dust and Dreams',
  // Títulos que existen de verdad: inglés (nota de Solidaridad) y turco (título del tráiler en Vimeo). Los demás idiomas muestran el título original.
  titulosOficiales: { en: 'Between Dust and Dreams', tr: 'Toz ve Düşler Arasında' },
  anio: '2025',
  duracion: '37:02',
  formato: '2K',
  golpe: { es: 'Ellas no solo buscan mineral.', en: 'They are not only looking for ore.' },
  sinopsis: {
    es: [
      'En Arequipa, María Reyes es pallaquera, busca mineral entre la roca que otros ya descartaron. En Puno, Julia Pomalique enfrenta las barreras de una cultura que no imagina a una mujer en la mina. En Madre de Dios, Vilma Contreras rompió los estereotipos y sigue en pie.',
      'Entre polvo y sueños acompaña a tres mineras de la minería artesanal y de pequeña escala del Perú, un tema que hoy entra a la agenda pública casi siempre sin escucharlas a ellas. Tres años de rodaje en socavones y pampas para que su voz llegue lejos.',
    ],
    en: [
      'In Arequipa, María Reyes is a pallaquera, sifting for ore in the rock others have already discarded. In Puno, Julia Pomalique faces the barriers of a culture that cannot picture a woman in the mine. In Madre de Dios, Vilma Contreras defied the stereotypes and is still standing.',
      'Between Dust and Dreams follows three women in Peru’s artisanal and small scale mining, an issue now on the public agenda that rarely listens to them. Three years of shooting in tunnels and on the plains so their voice can travel far.',
    ],
  },
  ficha: [
    [{ es: 'Dirección', en: 'Director' }, 'Jose Adrianzen'],
    [{ es: 'Guion', en: 'Screenplay' }, 'Jose Adrianzen'],
    [{ es: 'Producción general', en: 'Executive production' }, { es: 'Jose Adrianzen y Solidaridad', en: 'Jose Adrianzen and Solidaridad' }],
    [{ es: 'Producido por', en: 'Produced by' }, 'BÁLU · Solidaridad'],
    [{ es: 'Programa', en: 'Programme' }, 'RECLAIM Sustainability!'],
    [{ es: 'País', en: 'Country' }, { es: 'Perú', en: 'Peru' }],
    [{ es: 'Formato', en: 'Format' }, 'Digital 2K'],
    [{ es: 'Duración', en: 'Running time' }, '37:02'],
    [{ es: 'Idioma', en: 'Language' }, { es: 'Español', en: 'Spanish' }],
    [{ es: 'Subtítulos', en: 'Subtitles' }, 'Français · English · Türkçe'],
  ],
  // Vimeo. Fuente: ficha pública de cada video (oEmbed), consultada el 30 set 2026. Ver segundo cerebro.
  videos: {
    es: { documental: 'https://vimeo.com/1082640610', trailer: 'https://vimeo.com/1056105326' },
    en: { documental: 'https://vimeo.com/1082640629/31b003bd4a', trailer: 'https://vimeo.com/1056105326' },
    fr: { documental: 'https://vimeo.com/1082640645', trailer: 'https://vimeo.com/1056105326' },
    tr: { documental: null, trailer: 'https://vimeo.com/1157320004' },
  },
  fotogramas: [
    ['doc-tunel', 'Mineras caminan dentro del socavón con cascos y linternas', 'Women miners walk inside the tunnel with helmets and lamps'],
    ['doc-mineras', 'Tres mineras almuerzan sobre la roca bajo un cielo de polvo', 'Three women miners eat lunch on the rock under a dusty sky'],
    ['doc-noche', 'Minera con casco rojo llena sacos de piedra de noche', 'A miner in a red helmet fills sacks with stone at night'],
    ['doc-casco', 'Retrato de una minera con casco naranja junto a tuberías', 'Portrait of a miner in an orange helmet next to pipes'],
    ['doc-entrevista', 'Mujer entrevistada en el interior de su vivienda', 'A woman interviewed inside her home'],
  ],
  rodaje: [
    ['bts-doc-2', { es: 'Jose Adrianzen dirige en la calle del asentamiento minero', en: 'Jose Adrianzen directs on a street in the mining settlement' }],
    ['bts-doc-1', { es: 'Ajustando la cámara sobre el trípode en la pampa', en: 'Setting the camera on the tripod on the plains' }],
    ['bts-doc-5', { es: 'Cámara y microfonista durante una entrevista', en: 'Camera operator and boom operator during an interview' }],
    ['bts-doc-3', { es: 'Jose conversa con las mineras en la plaza del pueblo', en: 'Jose talks with the women miners in the town square' }],
    ['bts-doc-4', { es: 'Jose explica una escena dentro de una tienda', en: 'Jose explains a scene inside a shop' }],
    ['bts-doc-8', { es: 'Entrevista iluminada con rebotador y caña de sonido', en: 'An interview lit with a bounce board and a boom pole' }],
    ['bts-doc-7', { es: 'Niños del pueblo miran el monitor de la cámara', en: 'Village children look at the camera monitor' }],
    ['bts-doc-6', { es: 'Jose maneja el control del dron dentro del auto de noche', en: 'Jose flies the drone from inside the car at night' }],
  ],
  fuenteSinopsis: 'https://www.solidaridadnetwork.org/news/entre-polvo-y-suenos-new-documentary-on-the-strength-and-collective-power-of-women-miners/',
};

/* ECO. Regla fija: no se puede ver ni se enlaza hasta su estreno. Solo sinopsis y fotogramas fijos. */
export const eco = {
  slug: 'eco',
  titulo: 'ECO',
  anio: '2023',
  duracion: '13:12',
  formato: '6K',
  sello: { es: 'Aún sin estrenar', en: 'Not yet released' },
  aviso: {
    es: 'Está en circuito de festivales y todavía no se estrena, así que por ahora no se puede ver en línea.',
    en: 'It is on the festival circuit and has not been released yet, so it cannot be watched online for now.',
  },
  golpe: { es: 'Una casa. Un secreto.', en: 'One house. One secret.' },
  sinopsis: {
    es: 'César, un psiquiatra respetable, esconde una doble vida tras su consulta y su matrimonio. Cuando Victoria, su joven paciente y amante, reúne el valor para revelar la verdad, el frágil equilibrio de su mundo se rompe. Entre espejos, secretos y sospechas, la esposa a la que todos creen frágil resulta ser la más lúcida.',
    en: 'César, a respected psychiatrist, hides a double life behind his practice and his marriage. When Victoria, his young patient and lover, finds the courage to tell the truth, the fragile balance of his world breaks. Among mirrors, secrets and suspicion, the wife everyone believes is fragile turns out to be the most lucid of all.',
  },
  ficha: [
    [{ es: 'Dirección', en: 'Director' }, 'Jose Adrianzen'],
    [{ es: 'Guion', en: 'Screenplay' }, { es: 'Jose Adrianzen y Matilde Carrión', en: 'Jose Adrianzen and Matilde Carrión' }],
    [{ es: 'Producción', en: 'Producer' }, 'Jose Adrianzen'],
    [{ es: 'Fotografía', en: 'Cinematography' }, 'Fabricio Raciti'],
    [{ es: 'Arte', en: 'Production design' }, 'Gonzalo Veratudela'],
    [{ es: 'Dirección de actores', en: 'Acting coach' }, 'Aníbal Lozano'],
    [{ es: 'Montaje', en: 'Editing' }, 'Jose Adrianzen'],
    [{ es: 'Sonido', en: 'Sound' }, 'Casko Pérez'],
    [{ es: 'Música', en: 'Music' }, 'Augusto Madueño'],
    [{ es: 'Formato', en: 'Format' }, 'Digital 6K'],
    [{ es: 'Duración', en: 'Running time' }, '13:12'],
  ],
  reparto: [
    ['eco-cesar', 'César', 'Cristian Esquivel'],
    ['eco-victoria', 'Victoria', 'Yamile Caparó'],
    ['eco-cristina', 'Cristina', 'Fiorella Luna'],
    ['eco-madre', { es: 'La madre', en: 'The mother' }, 'Motta'],
  ],
  // Cinco fotogramas ordenados por brillo medido (gris promedio 106, 99, 67, 48 y 26): de clave alta a clave baja.
  luz: ['eco-luz-1', 'eco-luz-5', 'eco-luz-2', 'eco-luz-3', 'eco-luz-4'],
  rodaje: [
    ['eco-bts-set', { es: 'El equipo ilumina el set mientras se prepara la escena', en: 'The crew lights the set while the scene is prepared' }],
    ['eco-bts-cama', { es: 'Rodaje de la escena del dormitorio con luces cálidas y frías', en: 'Shooting the bedroom scene with warm and cool lights' }],
    ['eco-bts-yamile', { es: 'Jose Adrianzen junto a Yamile Caparó con la claqueta', en: 'Jose Adrianzen with Yamile Caparó holding the slate' }],
    ['eco-bts-locacion', { es: 'La sala de la casa vacía, antes de vestir el set', en: 'The empty living room before the set was dressed' }],
    ['eco-bts-ensayo', { es: 'Jose Adrianzen da indicaciones al equipo con la caña de sonido sobre la escena', en: 'Jose Adrianzen gives directions to the crew with the boom pole over the scene' }],
    ['eco-bts-reparto', { es: 'Jose Adrianzen con Matilde Carrión y el reparto sobre la cama del set', en: 'Jose Adrianzen with Matilde Carrión and the cast on the bed of the set' }],
  ],
};

export const fotografia = [
  ['fot-puerto', { es: 'Grúas del puerto del Callao bajo un cielo naranja', en: 'Cranes at the port of Callao under an orange sky' }, 'viajes'],
  ['fot-mar', { es: 'Mar abierto con barcos en el horizonte al amanecer', en: 'Open sea with boats on the horizon at dawn' }, 'viajes'],
  ['fot-barcelona', { es: 'Fachadas con balcones en Barcelona', en: 'Facades with balconies in Barcelona' }, 'viajes'],
  ['jose-shipibo', { es: 'Jose Adrianzen junto a músicos shipibo, en blanco y negro', en: 'Jose Adrianzen with Shipibo musicians, black and white' }, 'retratos'],
  ['fot-gaviota', { es: 'Proa de un buque, una gaviota y un remolcador en el puerto', en: 'A ship’s bow, a seagull and a tugboat in the port' }, 'viajes'],
  ['bts-doc-1', { es: 'Rodaje de Entre polvo y sueños en la pampa', en: 'Shooting Between Dust and Dreams on the plains' }, 'rodajes'],
  ['fot-louvre', { es: 'Pirámide del Museo del Louvre contra las nubes', en: 'The Louvre pyramid against the clouds' }, 'viajes'],
  ['jose-teatro', { es: 'Jose Adrianzen en escena durante una obra de teatro', en: 'Jose Adrianzen on stage during a play' }, 'retratos'],
  ['fot-muelle', { es: 'Muelle de madera sobre un mar turquesa', en: 'Wooden pier over a turquoise sea' }, 'viajes'],
  ['eco-bts-luces', { es: 'Rodaje de ECO con luz azul y cálida', en: 'Shooting Echo with blue and warm light' }, 'rodajes'],
  ['fot-barco', { es: 'Barco pesquero solitario sobre un mar naranja', en: 'A lone fishing boat on an orange sea' }, 'viajes'],
  ['jose-taxi', { es: 'Jose Adrianzen dentro de un taxi frente a un mural', en: 'Jose Adrianzen in a taxi in front of a mural' }, 'retratos'],
  ['bts-doc-7', { es: 'Niños del pueblo miran el monitor de la cámara', en: 'Village children look at the camera monitor' }, 'rodajes'],
];

export const sobreMi = {
  retrato: 'jose-escenario',
  bio: {
    es: [
      'Desde pequeño, el cine y la política fueron mis dos grandes pasiones. Al inicio quería ser presidente, así que estudié derecho para entender a fondo las leyes y el funcionamiento del Estado. La vida me llevó por otro camino. En el cine encontré una forma más poderosa de generar impacto y de contar las historias que merecen ser escuchadas.',
      'La curiosidad me ha llevado a recorrer casi todo el Perú, buena parte de Sudamérica y distintos rincones del mundo. Esos viajes me enseñaron a mirar realidades muy distintas a la mía y me confirmaron algo, el cine es una herramienta de transformación social.',
      'Tengo estudios en cine y en actuación. Quería aportar a la industria también desde la gestión (producción, financiamiento y distribución), por eso estudio ingeniería empresarial. En los últimos años he trabajado con varias ONG, contando historias que suelen quedar en el olvido.',
      'Terminé de rodar el cortometraje ECO, hoy en circuito de festivales. Pero el proyecto que ha marcado mi trayectoria es Entre polvo y sueños, tres años de mi vida para dar voz a las mujeres mineras del Perú y reivindicar su lucha.',
    ],
    en: [
      'Since I was a child, film and politics were my two great passions. At first I wanted to be president, so I studied law to understand the laws and how the State works. Life took me somewhere else. In film I found a more powerful way to make an impact and to tell the stories that deserve to be heard.',
      'Curiosity has taken me across almost all of Peru, much of South America and different corners of the world. Those journeys taught me to look at realities very different from mine and confirmed one thing, film is a tool for social change.',
      'I trained in filmmaking and acting. I also wanted to contribute to the industry from the management side (production, financing and distribution), so I am studying business engineering. In recent years I have worked with several NGOs, telling stories that tend to be forgotten.',
      'I finished shooting the short film Echo, now on the festival circuit. But the project that has defined my path is Between Dust and Dreams, three years of my life to give a voice to Peru’s women miners and stand up for their struggle.',
    ],
  },
  cita: {
    es: 'Siempre he creído que las personas valen mucho y que, si es necesario, hay que llegar hasta el último rincón para visibilizarlas.',
    en: 'I have always believed that people matter a great deal and that, if necessary, you have to reach the farthest corner to make them visible.',
  },
  trayecto: [
    { es: 'Televisión y publicidad', en: 'Television and advertising' },
    { es: 'Videos institucionales y ONG', en: 'Institutional films and NGOs' },
    { es: 'Entre polvo y sueños', en: 'Between Dust and Dreams' },
    { es: 'ECO', en: 'Echo' },
  ],
  formacion: [
    { es: 'Dirección y Realización de Cine y TV, EPIC (IES Peruano de Cine y Creatividad)', en: 'Film and TV Directing, EPIC (Peruvian Institute of Film and Creativity)' },
    { es: 'Estudios de derecho', en: 'Law studies' },
    { es: 'Ingeniería empresarial, UTP', en: 'Business engineering, UTP' },
  ],
  muro: [
    ['jose-calavera', { es: 'Jose Adrianzen actuando, encapuchado y con una calavera y una vela', en: 'Jose Adrianzen acting, hooded, with a skull and a candle' }],
    ['jose-shipibo', { es: 'Jose Adrianzen junto a músicos shipibo, en blanco y negro', en: 'Jose Adrianzen with Shipibo musicians, black and white' }],
    ['jose-naipes', { es: 'Claqueta de rodaje sobre una mesa de juego', en: 'A film slate on a card table' }],
  ],
};

export const vias = [
  { t: { es: 'Correo', en: 'Email' }, v: 'yo@joseadrianzen.com', href: 'mailto:yo@joseadrianzen.com?subject=Desde%20la%20web', ext: false },
  { t: 'WhatsApp', v: '+51 984 323 201', href: 'https://wa.me/51984323201', ext: true },
  { t: 'Instagram', v: '@jadrianzens', href: 'https://www.instagram.com/jadrianzens/', ext: true },
  { t: 'LinkedIn', v: 'in/joseadrianzens', href: 'https://www.linkedin.com/in/joseadrianzens/', ext: true },
];

export const correoUrl = 'https://joseadrianzen.com/correo/';

/* Servicios de Google en la web. Mientras un enlace esté en null, la web no lo muestra (o deja el "pronto").
   citas: la dirección para insertar tu agenda de citas de Google Calendar (Agenda de citas > Compartir >
          Página de reservas o "Insertar en el sitio web", la que termina en ?gv=true).
   dossier, fotosAlta: enlaces de Google Drive compartidos como "Cualquier persona con el enlace". */
export const google = {
  // Tu calendario personal publicado en modo "solo libre/ocupado": la web muestra los bloques ocupados, sin títulos.
  disponibilidad: 'joseadrianzensalcedo@gmail.com',
  citas: null,
  dossier: null,
  fotosAlta: null,
};
