import { Lesson } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'mision-tierra-1',
    title: 'Despegue en la Tierra',
    category: 'Primeros Trazos',
    difficulty: 'Fácil',
    description: 'Palabras cortas y enlaces suaves para calentar la mano de astronauta.',
    lines: [
      'Mi mamá me mima.',
      'El Sol brilla en lo alto.',
      'Veo la Luna blanca.',
      'Un gato duerme feliz.'
    ],
    targetTimePerLineSec: 15,
    iconName: 'Globe'
  },
  {
    id: 'mision-cohete-2',
    title: 'Viaje en Cohete',
    category: 'Aventura Espacial',
    difficulty: 'Fácil',
    description: 'Frases espaciales con letras mayúsculas, altas y bajas para practicar los límites de la pauta.',
    lines: [
      'El cohete vuela veloz.',
      'Viajamos a las estrellas.',
      'Los cometas tienen cola de luz.',
      'Saludamos a la Tierra azul.'
    ],
    targetTimePerLineSec: 18,
    iconName: 'Rocket'
  },
  {
    id: 'mision-luna-3',
    title: 'Paseo por la Luna',
    category: 'Aventura Espacial',
    difficulty: 'Medio',
    description: 'Oraciones con mayúsculas y enlaces de letras intermedias (b, v, r, l) en gravedad cero.',
    lines: [
      'Los astronautas flotan sin peso.',
      'Pisamos el suelo de polvo lunar.',
      'Dejamos una huella dorada.',
      'Un satélite gira en silencio.'
    ],
    targetTimePerLineSec: 20,
    iconName: 'Moon'
  },
  {
    id: 'mision-marte-4',
    title: 'El Planeta Rojo',
    category: 'Aventura Espacial',
    difficulty: 'Medio',
    description: 'Frases con nombres propios de planetas y ritmo continuo.',
    lines: [
      'El robot explorador busca rocas.',
      'Marte brilla con color rojo.',
      'Descubrimos un cráter gigante.',
      'El cielo de Marte es de color rosa.'
    ],
    targetTimePerLineSec: 22,
    iconName: 'Flame'
  },
  {
    id: 'mision-animales-5',
    title: 'Mascotas del Espacio',
    category: 'Mundo Animal',
    difficulty: 'Fácil',
    description: 'Divertidas oraciones sobre animales con trazo fluido, mayúsculas y punto final.',
    lines: [
      'El perrito mueve su colita alegre.',
      'El delfín salta sobre las olas.',
      'Las mariposas vuelan en el jardín.',
      'Un pajarito canta en la rama.'
    ],
    targetTimePerLineSec: 17,
    iconName: 'Sparkles'
  },
  {
    id: 'mision-cuento-6',
    title: 'El Pequeño Asteroide',
    category: 'Cuentos y Retos',
    difficulty: 'Desafío',
    description: 'Un microcuento completo para medir velocidad y constancia con mayúsculas y puntos.',
    lines: [
      'Había una vez una pequeña estrella.',
      'Quería iluminar todo el universo.',
      'Con su lápiz mágico dibujaba constelaciones.',
      'Y todos los planetas sonreían al verla.'
    ],
    targetTimePerLineSec: 24,
    iconName: 'BookOpen'
  },
  {
    id: 'mision-trabalenguas-7',
    title: 'Trabalenguas Cósmico',
    category: 'Cuentos y Retos',
    difficulty: 'Desafío',
    description: 'Desafío de agilidad y precisión de trazo con mayúsculas y puntos.',
    lines: [
      'Tres tristes tigres viajan en nave.',
      'El cielo estrellado reluce sin parar.',
      'La pluma de oro escribe ligera.',
      'Un cometa veloz cruza el horizonte.'
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
