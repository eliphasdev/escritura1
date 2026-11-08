import { Lesson } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'mision-tierra-1',
    title: 'Despegue en la Tierra',
    category: 'Primeros Trazos',
    difficulty: 'Fácil',
    description: 'Palabras cortas y enlaces suaves para calentar la mano de astronauta.',
    lines: [
      'mi mamá me mima',
      'el sol brilla en lo alto',
      'veo la luna blanca',
      'un gato duerme feliz'
    ],
    targetTimePerLineSec: 15,
    iconName: 'Globe'
  },
  {
    id: 'mision-cohete-2',
    title: 'Viaje en Cohete',
    category: 'Aventura Espacial',
    difficulty: 'Fácil',
    description: 'Frases espaciales con letras altas y bajas para practicar los límites de la pauta.',
    lines: [
      'el cohete vuela veloz',
      'viajamos a las estrellas',
      'los cometas tienen cola de luz',
      'saludamos a la tierra azul'
    ],
    targetTimePerLineSec: 18,
    iconName: 'Rocket'
  },
  {
    id: 'mision-luna-3',
    title: 'Paseo por la Luna',
    category: 'Aventura Espacial',
    difficulty: 'Medio',
    description: 'Oraciones con enlaces de letras intermedias (b, v, r, l) en gravedad cero.',
    lines: [
      'los astronautas flotan sin peso',
      'pisamos el suelo de polvo lunar',
      'dejamos una huella dorada',
      'un satélite gira en silencio'
    ],
    targetTimePerLineSec: 20,
    iconName: 'Moon'
  },
  {
    id: 'mision-marte-4',
    title: 'El Planeta Rojo',
    category: 'Aventura Espacial',
    difficulty: 'Medio',
    description: 'Frases con ritmo continuo y palabras de vocabulario astronómico.',
    lines: [
      'el robot explorador busca rocas',
      'marte brilla con color rojo',
      'descubrimos un cráter gigante',
      'el cielo marciano es de color rosa'
    ],
    targetTimePerLineSec: 22,
    iconName: 'Flame'
  },
  {
    id: 'mision-animales-5',
    title: 'Mascotas del Espacio',
    category: 'Mundo Animal',
    difficulty: 'Fácil',
    description: 'Divertidas oraciones sobre animales con trazo fluido y conectado.',
    lines: [
      'el perrito mueve su colita alegre',
      'el delfín salta sobre las olas',
      'las mariposas vuelan en el jardín',
      'un pajarito canta en la rama'
    ],
    targetTimePerLineSec: 17,
    iconName: 'Sparkles'
  },
  {
    id: 'mision-cuento-6',
    title: 'El Pequeño Asteroide',
    category: 'Cuentos y Retos',
    difficulty: 'Desafío',
    description: 'Un microcuento completo para medir velocidad y constancia.',
    lines: [
      'había una vez una pequeña estrella',
      'que quería iluminar todo el universo',
      'con su lápiz mágico dibujaba constelaciones',
      'y todos los planetas sonreían al verla'
    ],
    targetTimePerLineSec: 24,
    iconName: 'BookOpen'
  },
  {
    id: 'mision-trabalenguas-7',
    title: 'Trabalenguas Cósmico',
    category: 'Cuentos y Retos',
    difficulty: 'Desafío',
    description: 'Desafío de agilidad y precisión de trazo con palabras rítmicas.',
    lines: [
      'tres tristes tigres viajan en nave',
      'el cielo estrellado reluce sin parar',
      'la pluma de oro escribe ligera',
      'un cometa veloz cruza el horizonte'
    ],
    targetTimePerLineSec: 25,
    iconName: 'Zap'
  }
];

export const INITIAL_BADGES = [
  {
    id: 'primer-despegue',
    name: 'Primer Despegue',
    description: 'Completaste tu primera misión de copiado espacial.',
    icon: 'Rocket',
    unlocked: false,
    condition: 'Completa 1 misión'
  },
  {
    id: 'velocidad-luz',
    name: 'Velocidad de la Luz',
    description: 'Superaste tu récord personal en una línea de escritura.',
    icon: 'Zap',
    unlocked: false,
    condition: 'Bate 1 récord personal'
  },
  {
    id: 'maestro-ligada',
    name: 'Trazo Perfecto',
    description: 'Escribiste 10 líneas con letra ligada sin interrupción.',
    icon: 'Award',
    unlocked: false,
    condition: 'Copia 10 líneas'
  },
  {
    id: 'comandante-estelar',
    name: 'Comandante Estelar',
    description: 'Obtuviste 15 estrellas cósmicas en tus prácticas.',
    icon: 'Crown',
    unlocked: false,
    condition: 'Consigue 15 estrellas'
  },
  {
    id: 'voz-cosmica',
    name: 'Control por Voz',
    description: 'Avanzaste 3 líneas usando los comandos de voz.',
    icon: 'Mic',
    unlocked: false,
    condition: 'Usa comandos de voz'
  }
];
