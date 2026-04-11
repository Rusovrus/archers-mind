import { Exercise, ExerciseCategory } from '@/types/exercise';

// Static exercise library — later can be moved to Firestore
export const exercises: Exercise[] = [
  // === BREATHING ===
  {
    id: 'breathing-1',
    title: { ro: 'Respirație 4-7-8', en: '4-7-8 Breathing' },
    description: {
      ro: 'Tehnica de respirație 4-7-8 calmează sistemul nervos și reduce anxietatea. Inspiră 4 secunde, ține 7 secunde, expiră 8 secunde. Ideală înainte de a trage.',
      en: 'The 4-7-8 breathing technique calms the nervous system and reduces anxiety. Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Ideal before shooting.',
    },
    category: 'breathing',
    difficulty: 'beginner',
    duration: 300,
    audioUrl: { ro: '', en: '' },
    tags: ['calm', 'anxietate', 'pre-shot'],
    order: 1,
    featured: true,
  },
  {
    id: 'breathing-2',
    title: { ro: 'Respirație diafragmatică', en: 'Diaphragmatic Breathing' },
    description: {
      ro: 'Respirația profundă din diafragmă stabilizează corpul și reduce tremuratul. Pune o mână pe piept și una pe abdomen. Doar abdomenul trebuie să se miște.',
      en: 'Deep diaphragmatic breathing stabilizes the body and reduces trembling. Place one hand on your chest and one on your abdomen. Only the abdomen should move.',
    },
    category: 'breathing',
    difficulty: 'beginner',
    duration: 300,
    audioUrl: { ro: '', en: '' },
    tags: ['stabilitate', 'calm', 'fundație'],
    order: 2,
    featured: false,
  },
  {
    id: 'breathing-3',
    title: { ro: 'Respirație în cutie', en: 'Box Breathing' },
    description: {
      ro: 'Respirația în cutie (4-4-4-4): inspiră 4s, ține 4s, expiră 4s, ține 4s. Folosită de sportivi de elită pentru focus maxim în momente de presiune.',
      en: 'Box breathing (4-4-4-4): inhale 4s, hold 4s, exhale 4s, hold 4s. Used by elite athletes for maximum focus under pressure.',
    },
    category: 'breathing',
    difficulty: 'intermediate',
    duration: 240,
    audioUrl: { ro: '', en: '' },
    tags: ['focus', 'presiune', 'competiție'],
    order: 3,
    featured: false,
  },

  // === FOCUS ===
  {
    id: 'focus-1',
    title: { ro: 'Punct de ancorare vizual', en: 'Visual Anchor Point' },
    description: {
      ro: 'Alege un punct mic pe țintă și concentrează-ți toată atenția pe el timp de 60 de secunde. Când mintea rătăcește, adu-o înapoi fără judecată. Repetă de 3 ori.',
      en: 'Choose a small point on the target and focus all your attention on it for 60 seconds. When your mind wanders, bring it back without judgment. Repeat 3 times.',
    },
    category: 'focus',
    difficulty: 'beginner',
    duration: 300,
    audioUrl: { ro: '', en: '' },
    tags: ['concentrare', 'țintă', 'atenție'],
    order: 4,
    featured: true,
  },
  {
    id: 'focus-2',
    title: { ro: 'Numărătoarea inversă cu atenție', en: 'Mindful Countdown' },
    description: {
      ro: 'Numără invers de la 100, concentrându-te pe fiecare număr. La fiecare distragere, reîncepe de la ultimul număr. Antrenează disciplina mentală necesară pentru serii lungi.',
      en: 'Count backwards from 100, focusing on each number. At every distraction, restart from the last number. Trains the mental discipline needed for long series.',
    },
    category: 'focus',
    difficulty: 'intermediate',
    duration: 360,
    audioUrl: { ro: '', en: '' },
    tags: ['disciplină', 'concentrare', 'rezistență'],
    order: 5,
    featured: false,
  },
  {
    id: 'focus-3',
    title: { ro: 'Tunelul atenției', en: 'Attention Tunnel' },
    description: {
      ro: 'Imaginează-ți un tunel vizual între tine și țintă. Totul în afara tunelului dispare: zgomotul, publicul, vântul. Doar tu și centrul țintei existați. Menține 90 de secunde.',
      en: 'Imagine a visual tunnel between you and the target. Everything outside the tunnel disappears: noise, crowd, wind. Only you and the target center exist. Hold for 90 seconds.',
    },
    category: 'focus',
    difficulty: 'advanced',
    duration: 300,
    audioUrl: { ro: '', en: '' },
    tags: ['tunel', 'competiție', 'eliminare distrageri'],
    order: 6,
    featured: false,
  },

  // === VISUALIZATION ===
  {
    id: 'viz-1',
    title: { ro: 'Săgeata perfectă', en: 'The Perfect Arrow' },
    description: {
      ro: 'Închide ochii și vizualizează în detaliu o săgeată perfectă: poziția corpului, ancora, eliberarea, zborul săgeții, impactul în centru. Simte fiecare senzație. Repetă de 10 ori.',
      en: 'Close your eyes and visualize in detail a perfect arrow: body position, anchor, release, arrow flight, center impact. Feel every sensation. Repeat 10 times.',
    },
    category: 'visualization',
    difficulty: 'beginner',
    duration: 420,
    audioUrl: { ro: '', en: '' },
    tags: ['vizualizare', 'tehnica', 'încredere'],
    order: 7,
    featured: true,
  },
  {
    id: 'viz-2',
    title: { ro: 'Repetiție mentală de concurs', en: 'Competition Mental Rehearsal' },
    description: {
      ro: 'Vizualizează o zi de concurs completă: sosirea, încălzirea, prima serie, presiunea din finală. Simte emoțiile și exersează răspunsul calm la fiecare moment de stres.',
      en: 'Visualize a complete competition day: arrival, warm-up, first series, final pressure. Feel the emotions and practice a calm response at every stressful moment.',
    },
    category: 'visualization',
    difficulty: 'advanced',
    duration: 600,
    audioUrl: { ro: '', en: '' },
    tags: ['concurs', 'pregătire', 'presiune'],
    order: 8,
    featured: false,
  },
  {
    id: 'viz-3',
    title: { ro: 'Resetare după greșeală', en: 'Error Reset Visualization' },
    description: {
      ro: 'Vizualizează cum reacționezi la o săgeată proastă: observi fără emoție, respiri adânc, eliberezi gândul negativ, te concentrezi pe următoarea săgeată ca și cum ar fi prima din zi.',
      en: 'Visualize how you react to a bad arrow: observe without emotion, breathe deeply, release the negative thought, focus on the next arrow as if it were the first of the day.',
    },
    category: 'visualization',
    difficulty: 'intermediate',
    duration: 360,
    audioUrl: { ro: '', en: '' },
    tags: ['recuperare', 'reziliență', 'control emoțional'],
    order: 9,
    featured: false,
  },

  // === RECOVERY ===
  {
    id: 'recovery-1',
    title: { ro: 'Scanarea corporală', en: 'Body Scan' },
    description: {
      ro: 'Scanează progresiv fiecare parte a corpului, de la picioare la cap. Observă tensiunile acumulate și relaxează-le conștient. Esențial după sesiuni intense de antrenament.',
      en: 'Progressively scan each body part, from feet to head. Notice accumulated tension and consciously release it. Essential after intense training sessions.',
    },
    category: 'recovery',
    difficulty: 'beginner',
    duration: 480,
    audioUrl: { ro: '', en: '' },
    tags: ['relaxare', 'tensiune', 'recuperare'],
    order: 10,
    featured: true,
  },
  {
    id: 'recovery-2',
    title: { ro: 'Jurnalul mental de recunoștință', en: 'Mental Gratitude Journal' },
    description: {
      ro: 'După antrenament, identifică mental 3 lucruri pozitive din sesiune, indiferent de scor. Antrenează creierul să se concentreze pe progres, nu pe perfecțiune.',
      en: 'After training, mentally identify 3 positive things from the session, regardless of score. Train your brain to focus on progress, not perfection.',
    },
    category: 'recovery',
    difficulty: 'beginner',
    duration: 180,
    audioUrl: { ro: '', en: '' },
    tags: ['pozitivitate', 'mindset', 'reflecție'],
    order: 11,
    featured: false,
  },

  // === PRE-COMPETITION ===
  {
    id: 'precomp-1',
    title: { ro: 'Activare pre-concurs', en: 'Pre-Competition Activation' },
    description: {
      ro: 'Rutina de activare mentală cu 30 min înainte de concurs: 3 min respirație, 5 min vizualizare a primei serii, afirmații pozitive, setare obiectiv de proces (nu de scor).',
      en: 'Mental activation routine 30 min before competition: 3 min breathing, 5 min visualization of first series, positive affirmations, process goal setting (not score).',
    },
    category: 'precomp',
    difficulty: 'intermediate',
    duration: 600,
    audioUrl: { ro: '', en: '' },
    tags: ['concurs', 'activare', 'pregătire'],
    order: 12,
    featured: true,
  },
  {
    id: 'precomp-2',
    title: { ro: 'Cuvântul cheie', en: 'Power Word' },
    description: {
      ro: 'Alege un cuvânt care te definește la cel mai bun nivel: "fluid", "sigur", "calm". Repetă-l mental înainte de fiecare săgeată. Cuvântul devine ancora ta de performanță.',
      en: 'Choose a word that defines you at your best: "fluid", "confident", "calm". Mentally repeat it before each arrow. The word becomes your performance anchor.',
    },
    category: 'precomp',
    difficulty: 'beginner',
    duration: 180,
    audioUrl: { ro: '', en: '' },
    tags: ['ancoră', 'afirmații', 'rutină'],
    order: 13,
    featured: false,
  },
];

export function getExercises(): Exercise[] {
  return exercises;
}

export function getExercise(id: string): Exercise | null {
  return exercises.find((e) => e.id === id) || null;
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return exercises.filter((e) => e.category === category);
}

export function getFeaturedExercises(): Exercise[] {
  return exercises.filter((e) => e.featured);
}
