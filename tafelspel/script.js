// Tafels Kampioen - maal- en deeltafelspel voor 2de en 3de leerjaar

const TABLES_BY_GRADE = {
  2: [1, 2, 5, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const HARD_TABLES = [3, 4, 6, 7, 8, 9];

const TIME_PER_QUESTION_MS = 10000; // 10 seconden per vraag, enkel 3de leerjaar
const HISTORY_KEY = 'tafelspelGeschiedenis';
const MAX_HISTORY_SESSIONS = 20;

const state = {
  grade: null,
  mode: null,
  difficulty: null,
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
const modeButtons = document.getElementById('mode-buttons');
const difficultyGroup = document.getElementById('difficulty-group');
const difficultyButtons = document.getElementById('difficulty-buttons');
const countGroup = document.getElementById('count-group');
const countButtons = document.getElementById('count-buttons');
const startBtn = document.getElementById('start-btn');
const overviewMenuBtn = document.getElementById('overview-menu-btn');

const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const progressFill = document.getElementById('progress-fill');
const timerWrap = document.getElementById('timer-wrap');
const timerFill = document.getElementById('timer-fill');
const timerSeconds = document.getElementById('timer-seconds');
const questionText = document.getElementById('question-text');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
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

  const isGrade3 = state.grade === 3;
  difficultyGroup.classList.toggle('hidden', !isGrade3);
  countGroup.classList.toggle('hidden', !isGrade3);

  if (!isGrade3) {
    state.difficulty = null;
    state.questionCount = null;
    [...difficultyButtons.children].forEach((b) => b.classList.remove('selected'));
    [...countButtons.children].forEach((b) => b.classList.remove('selected'));
  }

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

countButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.questionCount = Number(btn.dataset.count);
  [...countButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

function checkReadyToStart() {
  const grade3Ready = state.grade === 3 ? !!(state.difficulty && state.questionCount) : true;
  startBtn.disabled = !(state.grade && state.mode && grade3Ready);
}

startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => showScreen(startScreen));
overviewMenuBtn.addEventListener('click', () => openOverview());
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
  state.totalQuestions = state.grade === 3 ? state.questionCount : 10;
  state.timerEnabled = state.grade === 3;

  const difficulty = state.grade === 3 ? state.difficulty : 'normaal';
  state.questions = generateQuestions(state.grade, state.mode, state.totalQuestions, difficulty);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.roundLog = [];

  timerWrap.classList.toggle('hidden', !state.timerEnabled);

  showScreen(quizScreen);
  renderQuestion();
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

function generateQuestions(grade, mode, count, difficulty) {
  const tables = TABLES_BY_GRADE[grade];
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

// ---- Vraag tonen ----
function renderQuestion() {
  const q = state.questions[state.currentIndex];
  state.answered = false;

  questionCounter.textContent = `Vraag ${state.currentIndex + 1} / ${state.totalQuestions}`;
  scoreCounter.textContent = `Score: ${state.score}`;
  progressFill.style.width = `${(state.currentIndex / state.totalQuestions) * 100}%`;

  questionText.textContent = q.text;
  feedbackText.textContent = '';

  answerInput.value = '';
  answerInput.disabled = false;
  answerInput.classList.remove('correct', 'wrong');
  answerInput.focus();

  startTimer();
}

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

function handleAnswer(givenAnswer) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  const q = state.questions[state.currentIndex];
  answerInput.disabled = true;

  const isCorrect = givenAnswer !== null && givenAnswer === q.answer;

  if (isCorrect) {
    answerInput.classList.add('correct');
    state.score += 10;
    state.correctCount += 1;
    feedbackText.textContent = pickRandom(['Goed zo! 🎉', 'Top! ⭐', 'Juist! 👏']);
    feedbackText.style.color = 'var(--success)';
  } else {
    answerInput.classList.add('wrong');
    if (givenAnswer === null) {
      feedbackText.textContent = `Tijd op! Het antwoord was ${q.answer}.`;
    } else {
      feedbackText.textContent = `Bijna! Het antwoord was ${q.answer}.`;
    }
    feedbackText.style.color = 'var(--error)';
  }

  state.roundLog.push({
    text: q.text,
    given: givenAnswer,
    correct: q.answer,
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

function saveRoundToHistory() {
  const sessions = loadHistory();

  const modeLabels = { maal: 'Maaltafels', deel: 'Deeltafels', mix: 'Mix' };
  const session = {
    date: new Date().toISOString(),
    grade: state.grade,
    mode: state.mode,
    modeLabel: modeLabels[state.mode] || state.mode,
    difficulty: state.difficulty,
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
  return `${dateStr} - ${session.grade}de leerjaar - ${session.modeLabel} - ${session.correctCount}/${session.total}`;
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

function renderSessionDetail(sessions, index) {
  const session = sessions[index];
  if (!session) return;

  sessionMeta.textContent = `Score: ${session.score} punten - ${session.correctCount} van de ${session.total} juist`;

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
