# AstroLetras: Caligrafía Espacial con Letra Ligada

Aplicación lúdica de caligrafía y copiado con letra ligada diseñada para niños de 7 años, ambientada en una aventura espacial con cohetes, estrellas y misiones cósmicas. Cuenta con cronometraje de precisión línea por línea para superación de marcas personales, control por voz interactivo, y modo dual para practicar tanto en cuaderno de papel como dibujando sobre pantalla pautada.

## User Review & Critical Decisions

> [!IMPORTANT]
> Confirmaciones obtenidas de la fase de clarificación:
> - **Modo de Práctica Dual**: Se incluye tanto el modo asistente para **cuaderno físico** (donde el niño escribe en su cuaderno real mientras la app cronometra y guía por voz) como el modo **pizarra digital con pauta escolar Montessori** (con trazo táctil/ratón, borrador y guía translúcida).
> - **Temática Espacial**: Misión a través de la galaxia con cohetes que despegan línea a línea, recolección de estrellas de combustible y ascensos de rango (Cadete, Astronauta, Comandante).
> - **Biblioteca y Creador**: Biblioteca graduada para 7 años (palabras enlazadas, oraciones cortas, microcuentos espaciales), editor para que padres agreguen oraciones personalizadas, y generador cósmico con IA.

---

## 1. Overview & Core Concept

- **Qué hace**: Presenta textos escolares en caligrafía ligada continua sobre pautas escolares de 4 líneas (línea base, x-height, ascendentes y descendentes). Mide con exactitud el tiempo de inicio y final de cada línea individual, comparándolo con el récord previo del niño para incentivar la superación personal sin frustración.
- **Público Objetivo**: Niños de 6 a 8 años (especialmente 7 años en transición de caligrafía escolar) y sus padres o educadores.
- **Control por Voz**: Integración de Web Speech API para que el niño pueda decir en voz alta *"¡Empezar!"*, *"¡Línea lista!"*, *"¡Terminé!"* o *"¡Pausa!"* sin soltar su lápiz del papel o la pantalla. La app responde con voz amistosa motivacional y efectos sonoros espaciales sintetizados.

---

## 2. User Experience & Visual Design

### Flujo de Usuario Principal
1. **Selección de Misión**: El niño elige una lección de la biblioteca graduada (ej. *Ruta Terrestre*, *Cinturón de Asteroides*, *Órbita Lunar*) o crea su propio texto con ayuda de sus padres.
2. **Elección de Modo**:
   - **Modo Cuaderno Físico**: Vista enfocada en la línea activa en gran tamaño con pauta caligráfica, cronómetro interactivo, visualización del récord anterior a batir y botón/escucha de micrófono activa.
   - **Modo Pizarra Digital**: Lienzo interactivo sobre la pauta escolar donde el niño puede repasar la letra ligada o escribirla libremente con lápiz digital/dedo/ratón.
3. **Inicio de Línea**: El niño presiona el botón o dice *"¡Empezar!"*. El cohete enciende motores, el cronómetro arranca y la línea actual se ilumina.
4. **Finalización de Línea**: Al terminar la línea, dice *"¡Listo!"* o presiona el botón. Se registra el tiempo exacto del parcial, se calcula si batió su récord personal y el cohete viaja a la siguiente estación con fanfarria sonora.
5. **Panel de Misión Cumplida**: Al completar el texto, se muestra el desglose de tiempos por línea, las estrellas ganadas, insignias desbloqueadas y una comparación con sus mejores marcas históricas.

### Identidad Visual y Estilo
- **Paleta de Color Cósmica**: Fondo oscuro azul espacial profundo (`#0b1120`, `#111827`) con nebulosas suaves en índigo/violeta (`#312e81`), acentos en dorado estelar (`#fbbf24`), azul propulsor (`#38bdf8`) y verde esmeralda (`#10b981`) para nuevos récords personales.
- **Tipografía**:
  - *Caligrafía Ligada Escolar*: Google Fonts `Edu SA Beginner` y `Caveat` para una simulación fidedigna de letra manuscrita escolar con enlaces naturales.
  - *Interfaz y Números*: `Outfit` para títulos y textos claros para niños, y `JetBrains Mono` con `tabular-nums` para el cronómetro de carrera.
- **Audio y Feedback**: Sintetizador Web Audio API para efectos de despegue de cohete, chimes de éxito, tic-tac sutil opcional y síntesis de voz en español con tono afectivo y entusiasta.

---

## 3. Key Product Decisions & Trade-Offs

- **Reconocimiento de Voz Nativo (Web Speech API)**:
  - *Enfoque*: Uso de `webkitSpeechRecognition` / `SpeechRecognition` con gramática abierta en español (`es-ES` / `es-419`) y coincidencia de palabras clave acústicas flexibles (*empezar*, *iniciar*, *listo*, *ya*, *terminé*, *siguiente*, *pausa*, *repetir*).
  - *Razón*: Respuesta en tiempo real sin latencia de red, manos libres total mientras el niño sostiene el lápiz físico con ambas manos ocupadas.
- **Sintetizador de Audio Autónomo (Web Audio API)**:
  - *Enfoque*: Generación procedural de efectos espaciales (propulsor, chimes de estrellas, victoria cósmica) mediante osciladores y nodos de ganancia en el navegador.
  - *Razón*: Elimina dependencias de archivos de audio externos que podrían fallar en entornos sandbox y permite modular el tono según la velocidad del niño.
- **Pauta Caligráfica Escolar SVG/Canvas**:
  - *Enfoque*: Cuadrícula estándar de 4 líneas con línea base gruesa, línea media discontinua (cuerpo de las minúsculas como a, c, e) y líneas límite superior e inferior para letras altas (l, b, d, t) y bajas (p, q, g, j).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      AstroLetras App                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
       ▼                       ▼                        ▼
┌──────────────┐       ┌──────────────┐         ┌──────────────┐
│  State & DB  │       │ Voice Engine │         │ Audio Synth  │
│ localStorage │       │  Web Speech  │         │  Web Audio   │
│ • Records    │       │ • Recog (mic)│         │ • Chimes     │
│ • Levels     │       │ • TTS (voice)│         │ • Fanfares   │
└──────┬───────┘       └──────┬───────┘         └──────┬───────┘
       │                      │                        │
       └──────────────────────┼────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Active Screen                         │
│  ┌───────────────────────┐       ┌────────────────────────┐ │
│  │  Pauta / Cursive View │       │ Rocket Progress Track  │ │
│  │  • Guideline Canvas   │       │ • Line-by-line stations│ │
│  │  • Digital Ink engine │       │ • Star fuel counter    │ │
│  └───────────────────────┘       └────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Stopwatch & Voice Controller                           │ │
│  │ • Current Line timer (split)                           │ │
│  │ • Delta vs Personal Best (PB)                          │ │
│  │ • Mic status & Voice triggers ("¡Listo!", "Empezar")   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Componentes Principales
1. `App.tsx`: Enrutamiento entre selección de misión, práctica activa, editor de textos y tablero de trofeos espaciales.
2. `HandwritingCanvas.tsx`: Lienzo de dibujo con suavizado de trazo para el modo pantalla táctil/ratón con pauta escolar visible.
3. `CursiveGuideViewer.tsx`: Renderizado tipográfico de la letra ligada sobre las 4 líneas guía con resalte de la línea en curso.
4. `VoiceController.ts`: Gestión del micrófono con Web Speech API, transcripción continua de comandos de voz y respuestas habladas.
5. `SpaceTimer.tsx`: Cronómetro con visualización de milisegundos, comparador de récord personal histórico por línea e indicador de superación de marca.
6. `MissionCompleteModal.tsx`: Resumen de carrera espacial con animación de estrellas, desglose de tiempos y medallas ganadas.
7. `CustomTextModal.tsx`: Editor para que padres o niños agreguen cualquier texto, dividiéndolo automáticamente en líneas pautadas.
8. `soundEffects.ts`: Generador de sonido procedural con Web Audio API (despegue, estrella, nuevo récord, botón).

### Almacenamiento Local
- `astro_records_v1`: Historial de tiempos por texto y por línea para determinar récords personales (PB).
- `astro_custom_texts_v1`: Textos personalizados agregados por el usuario.
- `astro_badges_v1`: Insignias cósmicas desbloqueadas por constancia y superación de velocidad.
