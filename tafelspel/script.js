// Tafels Kampioen - maal-/deeltafels, hoofdrekenen en digitaal kloklezen voor 2de en 3de leerjaar

const TABLES_BY_GRADE = {
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const HARD_TABLES = [3, 4, 6, 7, 8, 9];

// Welke hoofdrekenen-oefeningen er per leerjaar te kiezen zijn.
const HOOFDREKENEN_OPTIONS = {
  2: [
    { value: 'splitsen', label: 'Splitsen (tot 10)' },
    { value: 'brug', label: 'Optellen & aftrekken met brug (tot 20)' },
    { value: 'optellen100', label: 'Optellen & aftrekken (tot 100)' },
  ],
  3: [
    { value: 'optellen1000', label: 'Optellen & aftrekken (tot 1000)' },
  ],
};

const EXERCISE_LABELS = {
  splitsen: 'Splitsen (tot 10)',
  brug: 'Optellen & aftrekken met brug (tot 20)',
  optellen100: 'Optellen & aftrekken (tot 100)',
  optellen1000: 'Optellen & aftrekken (tot 1000)',
};

// Welke minuutwaarden er per klok-niveau voorkomen. Niveau 5 (elke minuut) heeft geen vaste set.
const CLOCK_LEVEL_MINUTES = {
  1: [0],
  2: [30],
  3: [15, 45],
  4: [5, 10, 20, 25, 35, 40, 50, 55],
  5: null,
};

const CLOCK_LEVEL_LABELS = {
  1: 'Hele uren',
  2: 'Halve uren',
  3: 'Kwartieren',
  4: 'Vijfminutenstappen',
  5: 'Elke minuut',
};

const CLOCK_QUESTIONTYPE_LABELS = {
  A: 'meerkeuze',
  C: 'klok instellen',
  mix: 'gemengd',
};

const WORKSHEET_FULL_PAGE_COUNT = 60; // zoveel sommen passen op één A4 in 3 kolommen
const TIME_PER_QUESTION_MS = 10000; // 10 seconden per vraag, als de timer aan staat
const HISTORY_KEY = 'tafelspelGeschiedenis';
const MAX_HISTORY_SESSIONS = 20;

const state = {
  grade: null,
  category: null, // 'tafels' | 'hoofdrekenen'
  mode: null, // enkel bij tafels: 'maal' | 'deel' | 'mix'
  tableMode: null,
  selectedTables: [],
  difficulty: null, // enkel bij tafels
  exerciseType: null, // enkel bij hoofdrekenen
  clockLevel: null, // enkel bij klok: 1-5
  clockQuestionType: null, // enkel bij klok: 'A' | 'C' | 'mix'
  clock24h: false, // enkel bij klok
  questionCount: null,
  totalQuestions: 10,
  timerEnabled: false,
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  roundLog: [],
  timerInterval: null,
  timeLeftMs: 0,
  answered: false,
};

// ---- Elementen ----
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const overviewScreen = document.getElementById('overview-screen');

const gradeButtons = document.getElementById('grade-buttons');
const categoryGroup = document.getElementById('category-group');
const categoryButtons = document.getElementById('category-buttons');
const tablemodeGroup = document.getElementById('tablemode-group');
const tablemodeButtons = document.getElementById('tablemode-buttons');
const tablesCheckboxes = document.getElementById('tables-checkboxes');
const modeGroup = document.getElementById('mode-group');
const modeButtons = document.getElementById('mode-buttons');
const difficultyGroup = document.getElementById('difficulty-group');
const difficultyButtons = document.getElementById('difficulty-buttons');
const hoofdrekenenGroup = document.getElementById('hoofdrekenen-group');
const hoofdrekenenButtons = document.getElementById('hoofdrekenen-buttons');
const klokLevelGroup = document.getElementById('klok-level-group');
const klokLevelButtons = document.getElementById('klok-level-buttons');
const klokQuestiontypeGroup = document.getElementById('klok-questiontype-group');
const klokQuestiontypeButtons = document.getElementById('klok-questiontype-buttons');
const klok24hGroup = document.getElementById('klok-24h-group');
const klok24hCheckbox = document.getElementById('klok-24h-checkbox');
const countGroup = document.getElementById('count-group');
const countButtons = document.getElementById('count-buttons');
const timerToggleGroup = document.getElementById('timer-toggle-group');
const timerToggleCheckbox = document.getElementById('timer-toggle-checkbox');
const startBtn = document.getElementById('start-btn');
const overviewMenuBtn = document.getElementById('overview-menu-btn');
const printLinks = document.getElementById('print-links');
const printCountBtn = document.getElementById('print-count-btn');
const printPageBtn = document.getElementById('print-page-btn');

const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const progressFill = document.getElementById('progress-fill');
const timerWrap = document.getElementById('timer-wrap');
const timerFill = document.getElementById('timer-fill');
const timerSeconds = document.getElementById('timer-seconds');
const questionText = document.getElementById('question-text');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
const choiceOptions = document.getElementById('choice-options');
const clocksetForm = document.getElementById('clockset-form');
const clocksetHourInput = document.getElementById('clockset-hour-input');
const clocksetMinuteInput = document.getElementById('clockset-minute-input');
const feedbackText = document.getElementById('feedback-text');

const starsEl = document.getElementById('stars');
const resultText = document.getElementById('result-text');
const resultScore = document.getElementById('result-score');
const replayBtn = document.getElementById('replay-btn');
const viewOverviewBtn = document.getElementById('view-overview-btn');
const menuBtn = document.getElementById('menu-btn');

const overviewEmpty = document.getElementById('overview-empty');
const overviewContent = document.getElementById('overview-content');
const sessionSelect = document.getElementById('session-select');
const sessionMeta = document.getElementById('session-meta');
const sessionTableBody = document.getElementById('session-table-body');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const overviewBackBtn = document.getElementById('overview-back-btn');

// ---- Startscherm: keuzes ----
gradeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.grade = Number(btn.dataset.grade);
  [...gradeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));

  // Alles na leerjaar hangt af van de categorie, dus resetten en opnieuw laten kiezen.
  state.category = null;
  state.tableMode = null;
  state.selectedTables = [];
  state.mode = null;
  state.difficulty = null;
  state.exerciseType = null;
  state.clockLevel = null;
  state.clockQuestionType = null;
  state.questionCount = null;

  [...categoryButtons.children].forEach((b) => b.classList.remove('selected'));
  [...tablemodeButtons.children].forEach((b) => b.classList.remove('selected'));
  [...modeButtons.children].forEach((b) => b.classList.remove('selected'));
  [...difficultyButtons.children].forEach((b) => b.classList.remove('selected'));
  [...klokLevelButtons.children].forEach((b) => b.classList.remove('selected'));
  [...klokQuestiontypeButtons.children].forEach((b) => b.classList.remove('selected'));
  [...countButtons.children].forEach((b) => b.classList.remove('selected'));

  tablesCheckboxes.classList.add('hidden');
  tablesCheckboxes.innerHTML = '';
  hoofdrekenenButtons.innerHTML = '';

  categoryGroup.classList.remove('hidden');
  tablemodeGroup.classList.add('hidden');
  modeGroup.classList.add('hidden');
  difficultyGroup.classList.add('hidden');
  hoofdrekenenGroup.classList.add('hidden');
  klokLevelGroup.classList.add('hidden');
  klokQuestiontypeGroup.classList.add('hidden');
  klok24hGroup.classList.add('hidden');
  countGroup.classList.add('hidden');
  timerToggleGroup.classList.add('hidden');

  checkReadyToStart();
});

categoryButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.category = btn.dataset.category;
  [...categoryButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));

  const isTafels = state.category === 'tafels';
  const isHoofdrekenen = state.category === 'hoofdrekenen';
  const isKlok = state.category === 'klok';

  // Tafel-keuzes resetten
  state.tableMode = null;
  state.selectedTables = [];
  state.mode = null;
  state.difficulty = null;
  [...tablemodeButtons.children].forEach((b) => b.classList.remove('selected'));
  [...modeButtons.children].forEach((b) => b.classList.remove('selected'));
  [...difficultyButtons.children].forEach((b) => b.classList.remove('selected'));
  tablesCheckboxes.classList.add('hidden');
  tablesCheckboxes.innerHTML = '';

  // Hoofdrekenen-keuze resetten
  state.exerciseType = null;
  hoofdrekenenButtons.innerHTML = '';

  // Klok-keuzes resetten
  state.clockLevel = null;
  state.clockQuestionType = null;
  [...klokLevelButtons.children].forEach((b) => b.classList.remove('selected'));
  [...klokQuestiontypeButtons.children].forEach((b) => b.classList.remove('selected'));

  tablemodeGroup.classList.toggle('hidden', !isTafels);
  modeGroup.classList.toggle('hidden', !isTafels);
  difficultyGroup.classList.toggle('hidden', !isTafels);
  klokLevelGroup.classList.toggle('hidden', !isKlok);
  klokQuestiontypeGroup.classList.toggle('hidden', !isKlok);
  klok24hGroup.classList.toggle('hidden', !isKlok);

  if (isTafels) {
    buildTableCheckboxes(state.grade);
    hoofdrekenenGroup.classList.add('hidden');
  } else if (isHoofdrekenen && state.grade === 3) {
    // 3de leerjaar heeft maar 1 hoofdrekenen-oefening: geen knop nodig, meteen kiezen.
    state.exerciseType = HOOFDREKENEN_OPTIONS[3][0].value;
    hoofdrekenenGroup.classList.add('hidden');
  } else if (isHoofdrekenen) {
    buildHoofdrekenenButtons(state.grade);
    hoofdrekenenGroup.classList.remove('hidden');
  } else {
    hoofdrekenenGroup.classList.add('hidden');
  }

  countGroup.classList.remove('hidden');
  timerToggleGroup.classList.remove('hidden');

  checkReadyToStart();
});

tablemodeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.tableMode = btn.dataset.tablemode;
  [...tablemodeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));

  const isCustom = state.tableMode === 'custom';
  tablesCheckboxes.classList.toggle('hidden', !isCustom);
  if (!isCustom) {
    state.selectedTables = [];
  }

  checkReadyToStart();
});

function buildTableCheckboxes(grade) {
  tablesCheckboxes.innerHTML = '';
  TABLES_BY_GRADE[grade].forEach((t) => {
    const label = document.createElement('label');
    label.className = 'table-checkbox';
    label.innerHTML = `<input type="checkbox" value="${t}"> Tafel van ${t}`;
    tablesCheckboxes.appendChild(label);
  });
}

tablesCheckboxes.addEventListener('change', () => {
  const checked = [...tablesCheckboxes.querySelectorAll('input[type="checkbox"]:checked')];
  state.selectedTables = checked.map((c) => Number(c.value));
  [...tablesCheckboxes.querySelectorAll('.table-checkbox')].forEach((label) => {
    const input = label.querySelector('input');
    label.classList.toggle('checked', input.checked);
  });
  checkReadyToStart();
});

modeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.mode = btn.dataset.mode;
  [...modeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

difficultyButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.difficulty = btn.dataset.difficulty;
  [...difficultyButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

function buildHoofdrekenenButtons(grade) {
  hoofdrekenenButtons.innerHTML = '';
  HOOFDREKENEN_OPTIONS[grade].forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.exercise = opt.value;
    btn.textContent = opt.label;
    hoofdrekenenButtons.appendChild(btn);
  });
}

hoofdrekenenButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.exerciseType = btn.dataset.exercise;
  [...hoofdrekenenButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

klokLevelButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.clockLevel = Number(btn.dataset.level);
  [...klokLevelButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

klokQuestiontypeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.clockQuestionType = btn.dataset.questiontype;
  [...klokQuestiontypeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

countButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.questionCount = Number(btn.dataset.count);
  [...countButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

function checkReadyToStart() {
  if (!state.grade || !state.category || !state.questionCount) {
    startBtn.disabled = true;
    printLinks.classList.add('hidden');
    return;
  }

  let categoryReady;
  if (state.category === 'tafels') {
    const tableModeReady = state.tableMode === 'custom' ? state.selectedTables.length > 0 : !!state.tableMode;
    categoryReady = tableModeReady && !!state.mode && !!state.difficulty;
  } else if (state.category === 'klok') {
    categoryReady = !!state.clockLevel && !!state.clockQuestionType;
  } else {
    categoryReady = !!state.exerciseType;
  }

  startBtn.disabled = !categoryReady;
  // Het printbare werkblad is er enkel voor de klassieke sommen (tafels/hoofdrekenen),
  // niet voor klok-oefeningen (meerkeuze en klok-instellen lenen zich niet tot datzelfde invulblad).
  const canPrint = categoryReady && state.category !== 'klok';
  printLinks.classList.toggle('hidden', !canPrint);
  printCountBtn.textContent = `🖨️ Print ${state.questionCount} oefeningen`;
}

startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => showScreen(startScreen));
overviewMenuBtn.addEventListener('click', () => openOverview());
printCountBtn.addEventListener('click', () => downloadWorksheetPdf(state.questionCount));
printPageBtn.addEventListener('click', () => downloadWorksheetPdf(WORKSHEET_FULL_PAGE_COUNT));
viewOverviewBtn.addEventListener('click', () => openOverview());
overviewBackBtn.addEventListener('click', () => showScreen(startScreen));

answerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (state.answered) return;
  const value = answerInput.value.trim();
  if (value === '') return;
  handleAnswer(Number(value));
});

// ---- Spel opbouwen ----
function startGame() {
  state.totalQuestions = state.questionCount;
  state.timerEnabled = timerToggleCheckbox.checked;
  state.clock24h = klok24hCheckbox.checked;

  state.questions = generateQuestionsForRound(state.totalQuestions);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.roundLog = [];

  timerWrap.classList.toggle('hidden', !state.timerEnabled);

  showScreen(quizScreen);
  renderQuestion();
}

function generateQuestionsForRound(count) {
  if (state.category === 'tafels') {
    const tables = state.tableMode === 'custom' ? state.selectedTables : TABLES_BY_GRADE[state.grade];
    return generateTableQuestions(tables, state.mode, count, state.difficulty);
  }

  if (state.category === 'klok') {
    return generateClockQuestions(count, state.clockLevel, state.clockQuestionType, state.clock24h);
  }

  switch (state.exerciseType) {
    case 'splitsen':
      return generateSplitQuestions(count);
    case 'brug':
      return generateBridgeQuestions(count);
    case 'optellen100':
      return generateAddSubQuestions(count, 100);
    case 'optellen1000':
      return generateAddSubQuestions(count, 1000);
    default:
      return [];
  }
}

function pickWeightedTable(tables, difficulty) {
  if (difficulty !== 'moeilijk') {
    return tables[Math.floor(Math.random() * tables.length)];
  }
  // Focus op moeilijkste tafels: harde tafels wegen 3x zwaarder dan de makkelijke.
  const weighted = [];
  tables.forEach((t) => {
    const weight = HARD_TABLES.includes(t) ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(t);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function generateTableQuestions(tables, mode, count, difficulty) {
  const questions = [];

  for (let i = 0; i < count; i++) {
    const table = pickWeightedTable(tables, difficulty);
    const factor = 1 + Math.floor(Math.random() * 10);

    let opType = mode;
    if (mode === 'mix') {
      opType = Math.random() < 0.5 ? 'maal' : 'deel';
    }

    if (opType === 'maal') {
      const answer = table * factor;
      questions.push({ text: `${table} x ${factor} = ?`, answer });
    } else {
      // deeltafel: table * factor gedeeld door factor = table
      const product = table * factor;
      questions.push({ text: `${product} : ${factor} = ?`, answer: table });
    }
  }

  return questions;
}

// Splitsen tot 10: bv. "3 + ? = 7" of "? + 4 = 7".
function generateSplitQuestions(count) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const total = 2 + Math.floor(Math.random() * 9); // 2..10
    const knownPart = 1 + Math.floor(Math.random() * (total - 1)); // 1..total-1
    const missingPart = total - knownPart;
    const knownFirst = Math.random() < 0.5;
    const text = knownFirst
      ? `${knownPart} + ? = ${total}`
      : `? + ${knownPart} = ${total}`;
    questions.push({ text, answer: missingPart });
  }
  return questions;
}

// Optellen en aftrekken met brug over het tiental, tot 20 (bv. 8 + 5 = 13, 13 - 5 = 8).
function generateBridgeQuestions(count) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.5) {
      const a = 2 + Math.floor(Math.random() * 8); // 2..9
      const minB = Math.max(2, 11 - a);
      const maxB = Math.min(9, 20 - a);
      const b = minB + Math.floor(Math.random() * (maxB - minB + 1));
      questions.push({ text: `${a} + ${b} = ?`, answer: a + b });
    } else {
      const a = 11 + Math.floor(Math.random() * 8); // 11..18
      const minB = Math.max(2, a - 9);
      const maxB = Math.min(9, a - 1);
      const b = minB + Math.floor(Math.random() * (maxB - minB + 1));
      questions.push({ text: `${a} - ${b} = ?`, answer: a - b });
    }
  }
  return questions;
}

// Optellen en aftrekken tot een maximum (100 voor 2de, 1000 voor 3de leerjaar). Nooit een negatief antwoord.
function generateAddSubQuestions(count, max) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.5) {
      const a = 1 + Math.floor(Math.random() * (max - 1));
      const b = 1 + Math.floor(Math.random() * (max - a));
      questions.push({ text: `${a} + ${b} = ?`, answer: a + b });
    } else {
      const a = 2 + Math.floor(Math.random() * (max - 1)); // 2..max
      const b = 1 + Math.floor(Math.random() * (a - 1)); // 1..a-1
      questions.push({ text: `${a} - ${b} = ?`, answer: a - b });
    }
  }
  return questions;
}

// ---- Digitaal kloklezen ----

// Nederlandse (Vlaamse) telwoorden 0-59, nodig voor uren (1-12) en voor niveau 5 (elke minuut).
const NUMBER_UNITS = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
const NUMBER_TEENS = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
const NUMBER_TENS = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig'];

function numberToWords(n) {
  if (n === 0) return 'nul';
  if (n < 10) return NUMBER_UNITS[n];
  if (n < 20) return NUMBER_TEENS[n - 10];
  const tensDigit = Math.floor(n / 10);
  const unit = n % 10;
  if (unit === 0) return NUMBER_TENS[tensDigit];
  const unitPrefix = unit === 2 ? 'tweeën' : unit === 3 ? 'drieën' : `${NUMBER_UNITS[unit]}en`;
  return `${unitPrefix}${NUMBER_TENS[tensDigit]}`;
}

// Zet een willekeurig geheel getal om naar een kloknummer van 1 t/m 12 (wrap-around).
function clockHour(hourRaw) {
  return ((hourRaw - 1) % 12 + 12) % 12 + 1;
}

// Tijd in woorden volgens de Vlaamse schoolconventie, voor niveau 1 t/m 4.
function timeWords(hourRaw, minute) {
  const hour = clockHour(hourRaw);
  const nextHour = clockHour(hour + 1);
  const hourWord = numberToWords(hour);
  const nextHourWord = numberToWords(nextHour);

  switch (minute) {
    case 0: return `${hourWord} uur`;
    case 5: return `vijf over ${hourWord}`;
    case 10: return `tien over ${hourWord}`;
    case 15: return `kwart na ${hourWord}`;
    case 20: return `tien voor half ${nextHourWord}`;
    case 25: return `vijf voor half ${nextHourWord}`;
    case 30: return `half ${nextHourWord}`;
    case 35: return `vijf over half ${nextHourWord}`;
    case 40: return `tien over half ${nextHourWord}`;
    case 45: return `kwart voor ${nextHourWord}`;
    case 50: return `tien voor ${nextHourWord}`;
    case 55: return `vijf voor ${nextHourWord}`;
    default: return `${hourWord} uur ${numberToWords(minute)}`;
  }
}

// Niveau 5 (elke minuut) gebruikt altijd de vorm "zeven uur tweeëntwintig", nooit "kwart voor".
function timeWordsLevel5(hourRaw, minute) {
  const hourWord = numberToWords(clockHour(hourRaw));
  if (minute === 0) return `${hourWord} uur`;
  return `${hourWord} uur ${numberToWords(minute)}`;
}

function dayPeriodLabel(hour24) {
  if (hour24 < 6) return "'s nachts";
  if (hour24 < 12) return "'s ochtends";
  if (hour24 < 14) return "'s middags";
  if (hour24 < 18) return "'s namiddags";
  return "'s avonds";
}

function formatDigital(hour, minute) {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Foute opties bij meerkeuze: dezelfde zinsbouw, maar met het uur (en op niveau 5 soms de minuut)
// een beetje verschoven - precies de typische fouten ("kwart voor zeven" i.p.v. "kwart voor acht").
function buildChoiceOptions(hour, minute, level) {
  const wordsFn = level === 5 ? timeWordsLevel5 : timeWords;
  const correct = wordsFn(hour, minute);
  const candidates = [];

  [-2, -1, 1, 2].forEach((shift) => {
    const phrase = wordsFn(hour + shift, minute);
    if (phrase !== correct && !candidates.includes(phrase)) candidates.push(phrase);
  });

  if (level === 5) {
    [-5, -2, -1, 1, 2, 5].forEach((shift) => {
      const m = ((minute + shift) % 60 + 60) % 60;
      const phrase = wordsFn(hour, m);
      if (phrase !== correct && !candidates.includes(phrase)) candidates.push(phrase);
    });
  }

  const wrongOptions = shuffleArray(candidates).slice(0, 3);
  return { correct, options: shuffleArray([correct, ...wrongOptions]) };
}

function pickClockMinute(level) {
  const fixedOptions = CLOCK_LEVEL_MINUTES[level];
  if (!fixedOptions) return Math.floor(Math.random() * 60); // niveau 5: elke minuut
  return fixedOptions[Math.floor(Math.random() * fixedOptions.length)];
}

function generateClockQuestions(count, level, questionType, is24h) {
  const questions = [];
  const wordsFn = level === 5 ? timeWordsLevel5 : timeWords;

  for (let i = 0; i < count; i++) {
    const minute = pickClockMinute(level);
    const hour24 = is24h ? Math.floor(Math.random() * 24) : 1 + Math.floor(Math.random() * 12);
    const hour12 = clockHour(hour24);
    const type = questionType === 'mix' ? (Math.random() < 0.5 ? 'A' : 'C') : questionType;
    const correctPhrase = wordsFn(hour12, minute);
    const digitalText = formatDigital(hour24, minute);

    if (type === 'A') {
      const { options } = buildChoiceOptions(hour12, minute, level);
      questions.push({ kind: 'choice', text: digitalText, options, answer: correctPhrase });
    } else {
      const prompt = is24h ? `${correctPhrase} ${dayPeriodLabel(hour24)}` : correctPhrase;
      questions.push({
        kind: 'clockset',
        text: prompt,
        answerHour: is24h ? hour24 : hour12,
        answerMinute: minute,
        answer: digitalText,
      });
    }
  }

  return questions;
}

// ---- Vraag tonen ----
function renderQuestion() {
  const q = state.questions[state.currentIndex];
  state.answered = false;
  const kind = q.kind || 'numeric';

  questionCounter.textContent = `Vraag ${state.currentIndex + 1} / ${state.totalQuestions}`;
  scoreCounter.textContent = `Score: ${state.score}`;
  progressFill.style.width = `${(state.currentIndex / state.totalQuestions) * 100}%`;

  questionText.textContent = q.text;
  questionText.classList.toggle('digital-clock', kind === 'choice');
  feedbackText.textContent = '';

  answerForm.classList.toggle('hidden', kind !== 'numeric');
  choiceOptions.classList.toggle('hidden', kind !== 'choice');
  clocksetForm.classList.toggle('hidden', kind !== 'clockset');

  if (kind === 'numeric') {
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.classList.remove('correct', 'wrong');
    answerInput.focus();
  } else if (kind === 'choice') {
    renderChoiceOptions(q);
  } else if (kind === 'clockset') {
    clocksetHourInput.value = '';
    clocksetMinuteInput.value = '';
    clocksetHourInput.disabled = false;
    clocksetMinuteInput.disabled = false;
    clocksetHourInput.classList.remove('correct', 'wrong');
    clocksetMinuteInput.classList.remove('correct', 'wrong');
    clocksetHourInput.focus();
  }

  startTimer();
}

function renderChoiceOptions(q) {
  choiceOptions.innerHTML = '';
  q.options.forEach((option) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = option;
    choiceOptions.appendChild(btn);
  });
}

choiceOptions.addEventListener('click', (e) => {
  if (state.answered) return;
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  handleAnswer(btn.textContent, btn);
});

clocksetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (state.answered) return;
  const h = clocksetHourInput.value.trim();
  const m = clocksetMinuteInput.value.trim();
  if (h === '' || m === '') return;
  handleAnswer({ hour: Number(h), minute: Number(m) });
});

function startTimer() {
  stopTimer();
  if (!state.timerEnabled) return;

  state.timeLeftMs = TIME_PER_QUESTION_MS;
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timeLeftMs -= 100;
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      updateTimerDisplay();
      stopTimer();
      handleAnswer(null); // tijd op = fout, geen antwoord gegeven
      return;
    }
    updateTimerDisplay();
  }, 100);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const ratio = state.timeLeftMs / TIME_PER_QUESTION_MS;
  timerFill.style.width = `${ratio * 100}%`;
  timerSeconds.textContent = `${Math.ceil(state.timeLeftMs / 1000)}s`;

  if (ratio > 0.5) {
    timerFill.style.background = 'var(--success)';
  } else if (ratio > 0.2) {
    timerFill.style.background = 'var(--warning)';
  } else {
    timerFill.style.background = 'var(--error)';
  }
}

function handleAnswer(givenAnswer, choiceBtnEl) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  const q = state.questions[state.currentIndex];
  const kind = q.kind || 'numeric';

  let isCorrect = false;
  let givenDisplay = givenAnswer;
  let correctDisplay = q.answer;

  if (kind === 'choice') {
    [...choiceOptions.children].forEach((b) => { b.disabled = true; });
    isCorrect = givenAnswer === q.answer;
    if (choiceBtnEl) choiceBtnEl.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
      const correctBtn = [...choiceOptions.children].find((b) => b.textContent === q.answer);
      if (correctBtn) correctBtn.classList.add('correct');
    }
  } else if (kind === 'clockset') {
    clocksetHourInput.disabled = true;
    clocksetMinuteInput.disabled = true;
    isCorrect = givenAnswer !== null && givenAnswer.hour === q.answerHour && givenAnswer.minute === q.answerMinute;
    clocksetHourInput.classList.add(isCorrect ? 'correct' : 'wrong');
    clocksetMinuteInput.classList.add(isCorrect ? 'correct' : 'wrong');
    givenDisplay = givenAnswer ? formatDigital(givenAnswer.hour, givenAnswer.minute) : null;
  } else {
    answerInput.disabled = true;
    isCorrect = givenAnswer !== null && givenAnswer === q.answer;
    answerInput.classList.add(isCorrect ? 'correct' : 'wrong');
  }

  if (isCorrect) {
    state.score += 10;
    state.correctCount += 1;
    feedbackText.textContent = pickRandom(['Goed zo! 🎉', 'Top! ⭐', 'Juist! 👏']);
    feedbackText.style.color = 'var(--success)';
  } else if (givenAnswer === null) {
    feedbackText.textContent = `Tijd op! Het antwoord was ${correctDisplay}.`;
    feedbackText.style.color = 'var(--error)';
  } else {
    feedbackText.textContent = `Bijna! Het antwoord was ${correctDisplay}.`;
    feedbackText.style.color = 'var(--error)';
  }

  state.roundLog.push({
    text: q.text,
    given: givenDisplay,
    correct: correctDisplay,
    isCorrect,
  });

  scoreCounter.textContent = `Score: ${state.score}`;

  setTimeout(() => {
    state.currentIndex += 1;
    if (state.currentIndex < state.totalQuestions) {
      renderQuestion();
    } else {
      showResults();
    }
  }, 1100);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Resultaatscherm ----
function showResults() {
  progressFill.style.width = '100%';
  showScreen(resultScreen);

  const percentage = state.correctCount / state.totalQuestions;
  let stars = 1;
  if (percentage >= 0.9) stars = 3;
  else if (percentage >= 0.6) stars = 2;

  starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  const messages = {
    3: 'Wauw, jij bent een echte tafels kampioen!',
    2: 'Goed gedaan! Nog even oefenen en het zit helemaal snor.',
    1: 'Mooie poging! Oefen nog wat en probeer opnieuw.',
  };
  resultText.textContent = messages[stars];
  resultScore.textContent = `${state.correctCount} van de ${state.totalQuestions} goed - ${state.score} punten`;

  saveRoundToHistory();
}

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen, overviewScreen].forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// ---- Geschiedenis (lokaal gecached) ----
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveHistory(sessions) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  } catch (err) {
    // localStorage niet beschikbaar (bv. privé-venster) - overzicht werkt dan gewoon niet.
  }
}

function buildModeLabel() {
  if (state.category === 'tafels') {
    const modeLabels = { maal: 'Maaltafels', deel: 'Deeltafels', mix: 'Mix' };
    return modeLabels[state.mode] || state.mode;
  }
  if (state.category === 'klok') {
    const levelLabel = CLOCK_LEVEL_LABELS[state.clockLevel] || '';
    const typeLabel = CLOCK_QUESTIONTYPE_LABELS[state.clockQuestionType] || state.clockQuestionType;
    const notationLabel = state.clock24h ? ', 24u' : '';
    return `Klok lezen: ${levelLabel} - ${typeLabel}${notationLabel}`;
  }
  return EXERCISE_LABELS[state.exerciseType] || state.exerciseType;
}

function buildTablesLabel() {
  if (state.category !== 'tafels') return null;
  return state.tableMode === 'custom'
    ? `tafels van ${[...state.selectedTables].sort((a, b) => a - b).join(', ')}`
    : 'alle tafels';
}

function saveRoundToHistory() {
  const sessions = loadHistory();

  const tablesLabel = buildTablesLabel();

  const session = {
    date: new Date().toISOString(),
    grade: state.grade,
    category: state.category,
    modeLabel: buildModeLabel(),
    difficulty: state.difficulty,
    tablesLabel,
    timerEnabled: state.timerEnabled,
    total: state.totalQuestions,
    correctCount: state.correctCount,
    score: state.score,
    questions: state.roundLog,
  };

  sessions.unshift(session);
  saveHistory(sessions.slice(0, MAX_HISTORY_SESSIONS));
}

function formatSessionLabel(session) {
  const d = new Date(session.date);
  const dateStr = d.toLocaleString('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  let categoryLabel = 'Tafels';
  if (session.category === 'hoofdrekenen') categoryLabel = 'Hoofdrekenen';
  if (session.category === 'klok') categoryLabel = 'Klok lezen';
  return `${dateStr} - ${session.grade}de leerjaar - ${categoryLabel}: ${session.modeLabel} - ${session.correctCount}/${session.total}`;
}

// ---- Overzichtscherm ----
function openOverview() {
  const sessions = loadHistory();
  showScreen(overviewScreen);

  if (sessions.length === 0) {
    overviewEmpty.classList.remove('hidden');
    overviewContent.classList.add('hidden');
    return;
  }

  overviewEmpty.classList.add('hidden');
  overviewContent.classList.remove('hidden');

  sessionSelect.innerHTML = '';
  sessions.forEach((session, index) => {
    const opt = document.createElement('option');
    opt.value = String(index);
    opt.textContent = formatSessionLabel(session);
    sessionSelect.appendChild(opt);
  });

  sessionSelect.value = '0';
  renderSessionDetail(sessions, 0);

  sessionSelect.onchange = () => {
    renderSessionDetail(sessions, Number(sessionSelect.value));
  };
}

function sessionDetailLabel(session) {
  if (session.category === 'hoofdrekenen' || session.category === 'klok') {
    return session.modeLabel;
  }
  return session.tablesLabel || 'alle tafels';
}

function renderSessionDetail(sessions, index) {
  const session = sessions[index];
  if (!session) return;

  const timerLabel = session.timerEnabled ? 'timer aan' : 'timer uit';
  sessionMeta.textContent = `${sessionDetailLabel(session)} - ${timerLabel} - Score: ${session.score} punten - ${session.correctCount} van de ${session.total} juist`;

  sessionTableBody.innerHTML = '';
  session.questions.forEach((q, i) => {
    const row = document.createElement('tr');
    const givenText = q.given === null || q.given === undefined ? '(geen tijd)' : q.given;
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${q.text}</td>
      <td>${givenText}</td>
      <td>${q.correct}</td>
      <td class="${q.isCorrect ? 'result-correct' : 'result-wrong'}">${q.isCorrect ? 'Juist ✔' : 'Fout ✘'}</td>
    `;
    sessionTableBody.appendChild(row);
  });

  downloadPdfBtn.onclick = () => downloadSessionAsPdf(session);
}

clearHistoryBtn.addEventListener('click', () => {
  const confirmed = window.confirm('Weet je zeker dat je de volledige geschiedenis wil wissen?');
  if (!confirmed) return;
  saveHistory([]);
  openOverview();
});

function downloadSessionAsPdf(session) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margin = 15;
  let y = margin;

  doc.setFontSize(18);
  doc.setTextColor(23, 44, 102);
  doc.text('Tafels Kampioen - Overzicht', margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  const d = new Date(session.date);
  doc.text(`Datum: ${d.toLocaleString('nl-BE')}`, margin, y);
  y += 6;
  doc.text(`Leerjaar: ${session.grade}de leerjaar - ${session.modeLabel}`, margin, y);
  y += 6;
  const timerLabel = session.timerEnabled ? 'timer aan' : 'timer uit';
  doc.text(`${sessionDetailLabel(session)} - ${timerLabel}`, margin, y);
  y += 6;
  doc.text(`Score: ${session.score} punten - ${session.correctCount} van de ${session.total} juist`, margin, y);
  y += 10;

  doc.setFontSize(10);
  session.questions.forEach((q, i) => {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    const givenText = q.given === null || q.given === undefined ? '(geen tijd)' : q.given;
    const resultLabel = q.isCorrect ? 'Juist' : 'Fout';

    doc.setTextColor(23, 44, 102);
    doc.text(`${i + 1}. ${q.text}`, margin, y);
    doc.text(`jouw antwoord: ${givenText}`, margin + 70, y);
    doc.text(`juist: ${q.correct}`, margin + 120, y);

    doc.setTextColor(q.isCorrect ? 40 : 200, q.isCorrect ? 160 : 40, q.isCorrect ? 80 : 40);
    doc.text(resultLabel, margin + 155, y);

    y += 7;
  });

  const fileDate = d.toISOString().slice(0, 10);
  doc.save(`tafelspel-overzicht-${fileDate}.pdf`);
}

// ---- Werkblad afdrukken ----
// Maakt een PDF met de huidige instellingen: pagina 1 is het werkblad, pagina 2 de oplossingen.
function downloadWorksheetPdf(count) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const questions = generateQuestionsForRound(count);

  const margin = 15;
  const columns = 3;
  const columnWidth = (210 - 2 * margin) / columns;
  const rowsPerColumn = Math.ceil(questions.length / columns);

  const settingsLabel = [
    `${state.grade}de leerjaar`,
    buildModeLabel(),
    buildTablesLabel(),
  ].filter(Boolean).join(' - ');

  // Werkblad
  let y = margin;
  doc.setFontSize(18);
  doc.setTextColor(23, 44, 102);
  doc.text('Tafels Kampioen - Werkblad', margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(settingsLabel, margin, y);
  y += 10;

  doc.setTextColor(23, 44, 102);
  doc.text('Naam: ______________________', margin, y);
  doc.text('Datum: ______________', margin + 80, y);
  doc.text(`Score: _____ / ${questions.length}`, margin + 140, y);
  y += 12;

  const rowHeight = Math.min(12, (297 - margin - y) / rowsPerColumn);
  doc.setFontSize(13);
  questions.forEach((q, i) => {
    const col = Math.floor(i / rowsPerColumn);
    const row = i % rowsPerColumn;
    const x = margin + col * columnWidth;
    doc.text(`${i + 1}.`, x, y + row * rowHeight);
    doc.text(q.text.replace('?', '______'), x + 9, y + row * rowHeight);
  });

  // Oplossingen
  doc.addPage();
  y = margin;
  doc.setFontSize(16);
  doc.text('Oplossingen', margin, y);
  y += 7;
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(settingsLabel, margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(23, 44, 102);
  const keyRowHeight = Math.min(8, (297 - margin - y) / rowsPerColumn);
  questions.forEach((q, i) => {
    const col = Math.floor(i / rowsPerColumn);
    const row = i % rowsPerColumn;
    const x = margin + col * columnWidth;
    doc.text(`${i + 1}. ${q.text.replace('?', String(q.answer))}`, x, y + row * keyRowHeight);
  });

  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`tafelspel-werkblad-${fileDate}.pdf`);
}
