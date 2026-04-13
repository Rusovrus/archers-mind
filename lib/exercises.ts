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
    steps: [
      { ro: 'Stai confortabil, ochii inchisi. Inspira pe nas, numarand pana la 4.', en: 'Sit comfortably, eyes closed. Inhale through your nose, counting to 4.' },
      { ro: 'Tine respiratia numarand pana la 7. Simte calmul instalandu-se.', en: 'Hold your breath counting to 7. Feel the calm settling in.' },
      { ro: 'Expira incet pe gura numarand pana la 8. Elibereaza toata tensiunea.', en: 'Exhale slowly through your mouth counting to 8. Release all tension.' },
      { ro: 'Repeta ciclul. Cu fiecare repetare, corpul devine mai relaxat.', en: 'Repeat the cycle. With each repetition, your body becomes more relaxed.' },
      { ro: 'Continua ritmul 4-7-8. Esti in control total al respiratiei tale.', en: 'Continue the 4-7-8 rhythm. You are in full control of your breathing.' },
    ],
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
    steps: [
      { ro: 'Aseaza o mana pe piept si una pe abdomen. Inspira adanc prin nas.', en: 'Place one hand on your chest and one on your abdomen. Inhale deeply through your nose.' },
      { ro: 'Doar abdomenul trebuie sa se ridice. Pieptul ramane nemiscat.', en: 'Only the abdomen should rise. The chest stays still.' },
      { ro: 'Expira incet pe gura. Simte cum abdomenul coboara natural.', en: 'Exhale slowly through your mouth. Feel the abdomen lower naturally.' },
      { ro: 'Continua ritmul. Imagineaza-ti ca respiri stabilitate in corpul tau.', en: 'Continue the rhythm. Imagine you are breathing stability into your body.' },
      { ro: 'Cu fiecare respiratie, tremuratul se reduce. Corpul tau este o ancoraj solid.', en: 'With each breath, trembling decreases. Your body is a solid anchor.' },
    ],
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
    steps: [
      { ro: 'Inspira pe nas numarand pana la 4. Umple-ti plamanii complet.', en: 'Inhale through your nose counting to 4. Fill your lungs completely.' },
      { ro: 'Tine respiratia 4 secunde. Mintea ta este clara si focusata.', en: 'Hold for 4 seconds. Your mind is clear and focused.' },
      { ro: 'Expira controlat in 4 secunde. Elibereaza orice ganduri.', en: 'Exhale controlled for 4 seconds. Release any thoughts.' },
      { ro: 'Tine din nou 4 secunde cu plamanii goi. Simte echilibrul.', en: 'Hold again for 4 seconds with lungs empty. Feel the balance.' },
      { ro: 'Repeta cutia. Esti calm sub presiune, exact ca in concurs.', en: 'Repeat the box. You are calm under pressure, just like in competition.' },
    ],
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
    steps: [
      { ro: 'Alege un punct mic pe tinta sau pe perete. Fixeaza-ti privirea pe el.', en: 'Choose a small point on the target or wall. Fix your gaze on it.' },
      { ro: 'Concentreaza toata atentia pe acel punct. Nimic altceva nu exista.', en: 'Focus all attention on that point. Nothing else exists.' },
      { ro: 'Cand mintea rataceste, adu-o inapoi fara judecata. E normal.', en: 'When your mind wanders, bring it back without judgment. It is normal.' },
      { ro: 'Observa cum focusul devine mai stabil cu fiecare minut.', en: 'Notice how focus becomes more stable with each minute.' },
      { ro: 'Aceasta este concentrarea ta de arcas. Poti accesa acest focus oricand.', en: 'This is your archer focus. You can access this focus anytime.' },
    ],
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
    steps: [
      { ro: 'Incepe numaratoarea inversa de la 100. Spune fiecare numar mental.', en: 'Start counting backwards from 100. Say each number mentally.' },
      { ro: 'Concentreaza-te pe fiecare numar individual. Nu te grabi.', en: 'Focus on each individual number. Do not rush.' },
      { ro: 'Daca te distragi, reincepe de la ultimul numar pe care il amintesti.', en: 'If you get distracted, restart from the last number you remember.' },
      { ro: 'Observa cat de departe ajungi fara distrageri. E un antrenament, nu un test.', en: 'Notice how far you get without distractions. It is training, not a test.' },
      { ro: 'Aceasta disciplina mentala te pregateste pentru serii lungi de concurs.', en: 'This mental discipline prepares you for long competition series.' },
    ],
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
    steps: [
      { ro: 'Inchide ochii. Imagineaza tinta in fata ta, la distanta de concurs.', en: 'Close your eyes. Imagine the target in front of you, at competition distance.' },
      { ro: 'Construieste un tunel vizual intre tine si centrul tintei.', en: 'Build a visual tunnel between you and the target center.' },
      { ro: 'Totul in afara tunelului dispare: zgomote, oameni, vant.', en: 'Everything outside the tunnel disappears: noise, people, wind.' },
      { ro: 'Tunelul se ingusteaza. Doar centrul tintei exista.', en: 'The tunnel narrows. Only the target center exists.' },
      { ro: 'Mentine aceasta viziune. Esti imun la distrageri. Esti focusat total.', en: 'Hold this vision. You are immune to distractions. You are totally focused.' },
    ],
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
    steps: [
      { ro: 'Inchide ochii. Simte arcul in mana, greutatea lui familiara.', en: 'Close your eyes. Feel the bow in your hand, its familiar weight.' },
      { ro: 'Vizualizeaza pozitia perfecta: picioarele, umerii, ancora.', en: 'Visualize the perfect stance: feet, shoulders, anchor.' },
      { ro: 'Trage coarda mental. Simte tensiunea in spate, nu in brate.', en: 'Draw the string mentally. Feel the tension in your back, not arms.' },
      { ro: 'Elibereaza. Urmareste sageata in zbor catre centrul tintei.', en: 'Release. Watch the arrow fly toward the target center.' },
      { ro: 'Auzi impactul in 10. Sageata e exact in centru. Repeta vizualizarea.', en: 'Hear the impact in the 10. The arrow is dead center. Repeat the visualization.' },
    ],
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
    steps: [
      { ro: 'Vizualizeaza dimineata concursului. Te trezesti odihnit si pregatit.', en: 'Visualize competition morning. You wake up rested and prepared.' },
      { ro: 'Ajungi la teren. Faci incalzirea. Corpul tau stie ce sa faca.', en: 'You arrive at the field. You warm up. Your body knows what to do.' },
      { ro: 'Prima serie incepe. Respiri calm. Fiecare sageata urmeaza rutina.', en: 'First series begins. You breathe calmly. Every arrow follows the routine.' },
      { ro: 'Presiunea creste in runda finala. Tu ramai in proces, nu in scor.', en: 'Pressure rises in the final round. You stay in process, not in score.' },
      { ro: 'Fiecare moment de stres primeste un raspuns calm. Esti pregatit.', en: 'Every stressful moment gets a calm response. You are prepared.' },
    ],
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
    steps: [
      { ro: 'Vizualizeaza o sageata care nu a mers bine. Observ-o fara emotie.', en: 'Visualize an arrow that did not go well. Observe it without emotion.' },
      { ro: 'Respira adanc. Elibereaza orice ganduri negative despre acea sageata.', en: 'Breathe deeply. Release any negative thoughts about that arrow.' },
      { ro: 'Sageata a trecut. Nu o mai poti schimba. Accepta si elibereaza.', en: 'The arrow is gone. You cannot change it. Accept and release.' },
      { ro: 'Concentreaza-te pe urmatoarea sageata ca si cum ar fi prima din zi.', en: 'Focus on the next arrow as if it were the first of the day.' },
      { ro: 'Repeta procesul. Cu fiecare repetare, devii mai rezilient.', en: 'Repeat the process. With each repetition, you become more resilient.' },
    ],
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
    steps: [
      { ro: 'Intinde-te confortabil. Incepe cu degetele de la picioare. Incordeaza-le, apoi relaxeaza.', en: 'Lie down comfortably. Start with your toes. Tense them, then relax.' },
      { ro: 'Urca la gambe, genunchi, coapse. Incordeaza fiecare grup muscular 5 secunde, apoi relaxeaza.', en: 'Move up to calves, knees, thighs. Tense each muscle group for 5 seconds, then relax.' },
      { ro: 'Abdomen, piept, spate. Observa unde tii tensiune de la tragere.', en: 'Abdomen, chest, back. Notice where you hold tension from shooting.' },
      { ro: 'Umeri, brate, maini. Degetele care tin arcul merita atentie speciala.', en: 'Shoulders, arms, hands. The fingers that hold the bow deserve special attention.' },
      { ro: 'Gat, fata, frunte. Relaxeaza maxilarul. Tot corpul tau e relaxat acum.', en: 'Neck, face, forehead. Relax your jaw. Your entire body is relaxed now.' },
    ],
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
    steps: [
      { ro: 'Gandeste-te la sesiunea de azi. Ce a mers bine, indiferent de scor?', en: 'Think about today\'s session. What went well, regardless of score?' },
      { ro: 'Primul lucru pozitiv: poate o sageata buna, poate ca ai ramas calm.', en: 'First positive thing: maybe a good arrow, maybe you stayed calm.' },
      { ro: 'Al doilea lucru pozitiv: un moment in care ti-ai urmat rutina perfect.', en: 'Second positive thing: a moment when you followed your routine perfectly.' },
      { ro: 'Al treilea lucru pozitiv: faptul ca ai venit la antrenament e deja o victorie.', en: 'Third positive thing: the fact that you came to practice is already a victory.' },
    ],
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
    steps: [
      { ro: 'Incepe cu 3 minute de respiratie profunda. Calmeaza sistemul nervos.', en: 'Start with 3 minutes of deep breathing. Calm your nervous system.' },
      { ro: 'Vizualizeaza prima serie. Vezi fiecare sageata mergand in centru.', en: 'Visualize the first series. See each arrow going to the center.' },
      { ro: 'Repeta afirmatii pozitive: "Sunt pregatit. Sunt concentrat. Am incredere."', en: 'Repeat positive affirmations: "I am prepared. I am focused. I am confident."' },
      { ro: 'Seteaza obiectivul de proces: "Voi urma rutina la fiecare sageata."', en: 'Set your process goal: "I will follow my routine on every arrow."' },
      { ro: 'Esti activat mental si fizic. Esti gata de concurs.', en: 'You are mentally and physically activated. You are ready to compete.' },
    ],
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
    steps: [
      { ro: 'Alege un cuvant care te defineste la cel mai bun nivel tau. Poate fi "calm", "sigur", "fluid".', en: 'Choose a word that defines you at your best. It could be "calm", "confident", "fluid".' },
      { ro: 'Inchide ochii si repeta cuvantul mental. Simte-i energia.', en: 'Close your eyes and repeat the word mentally. Feel its energy.' },
      { ro: 'Asociaza cuvantul cu cea mai buna sageata pe care ai tras-o vreodata.', en: 'Associate the word with the best arrow you have ever shot.' },
      { ro: 'Inainte de fiecare sageata, spune cuvantul o data. Devine ancora ta.', en: 'Before each arrow, say the word once. It becomes your anchor.' },
    ],
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
