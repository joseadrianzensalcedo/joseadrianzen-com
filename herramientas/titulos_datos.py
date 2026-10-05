"""Títulos del documental y del cortometraje por idioma. Fuente única: la leen el generador de letras y el sitio.
Estado de cada traducción: 'oficial' solo si la película ya circuló con ese título. Todo lo demás es propuesta
(Claude, 4 oct 2026) aprobada por Jose el 4 oct 2026, pendiente de revisión por un hablante nativo.
Las líneas se separan con | (el título gigante de la portada va en dos líneas)."""
DOC = {
 'es': 'Entre polvo|y sueños', 'en': 'Dust|and Dreams', 'pt': 'Entre pó|e sonhos', 'fr': 'Entre poussière|et rêves',
 'it': 'Tra polvere|e sogni', 'de': 'Zwischen Staub|und Träumen', 'nl': 'Tussen stof|en dromen', 'pl': 'Między kurzem|a marzeniami',
 'ru': 'Между пылью|и мечтами', 'uk': 'Між пилом|і мріями', 'tr': 'Toz ve Düşler|Arasında', 'ar': 'بين الغبار|والأحلام',
 'hi': 'धूल और सपनों|के बीच', 'sw': 'Kati ya vumbi|na ndoto', 'qu': "Ñut'upa musqoykunapa|chawpinpi", 'ay': "Laq'a ukat|samkanaka taypina",
 'zh': '尘埃与|梦想之间', 'ja': '塵と夢の|あいだ', 'ko': '먼지와 꿈|사이', 'id': 'Di antara|debu dan mimpi', 'vi': 'Giữa bụi|và giấc mơ',
 'th': 'ระหว่างฝุ่น|กับความฝัน', 'fil': 'Sa pagitan ng|alikabok at mga pangarap',
}
ECO = {
 'es': 'Eco', 'en': 'Echo', 'pt': 'Eco', 'fr': 'Écho', 'it': 'Eco', 'de': 'Echo', 'nl': 'Echo', 'pl': 'Echo', 'ru': 'Эхо', 'uk': 'Відлуння',
 'tr': 'Yankı', 'ar': 'صدى', 'hi': 'गूँज', 'sw': 'Mwangwi', 'qu': 'Kutimuq', 'ay': 'Jaysäwi', 'zh': '回响', 'ja': 'こだま', 'ko': '메아리',
 'id': 'Gema', 'vi': 'Tiếng vang', 'th': 'เสียงสะท้อน', 'fil': 'Alingawngaw',
}
OFICIAL = {'tr': 'Toz ve Düşler Arasında'}
# Idiomas cuyas letras (todas) hay que crear, porque AWAKENNING solo trae latinas.
SIN_ESPACIO = ['zh', 'ja', 'th']   # en estos idiomas las dos líneas se unen sin espacio
OTRO_ALFABETO = ['ru', 'uk', 'ar', 'hi', 'zh', 'ja', 'ko', 'th']
PALABRAS = ['ar', 'hi', 'th']   # se dibujan por palabra: las letras cambian de forma según las vecinas
NOMBRE = {  # tu nombre en cada alfabeto, igual que en los logos (herramientas/logo_idiomas.py)
 'ru': 'Хосе Адриансен', 'uk': 'Хосе Адріансен', 'zh': '何塞·阿德里安森', 'ja': 'ホセ・アドリアンセン', 'ko': '호세 아드리안센',
 'ar': 'خوسيه أدريانسن', 'hi': 'होसे अद्रियानसेन', 'th': 'โฆเซ อาเดรียนเซน',
}

# Letras que llevan piezas de AWAKENNING (licencia de uso personal): no van a GitHub, igual que AWAKENNING. Se suben a mano al hosting.
# Las demás salen solo de fuentes con licencia abierta (OFL: Noto, Teko, Oswald) y sí van al repositorio.
AW_DERIVADOS = ['ru', 'uk', 'pl', 'tr', 'vi', 'qu', 'ay']
def carpeta(lang): return 'awakenning/titulo' if lang in AW_DERIVADOS else 'titulo'
