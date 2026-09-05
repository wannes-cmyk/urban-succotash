// Tafels Kampioen - maal- en deeltafelspel voor 2de en 3de leerjaar

const TOTAL_QUESTIONS = 10;

const TABLES_BY_GRADE = {
  2: [1, 2, 5, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const state = {
  grade: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
};

// ---- Elementen ----
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const gradeButtons = document.getElementById('grade-buttons');
const modeButtons = document.getElementById('mode-buttons');
const startBtn = document.getElementById('start-btn');

const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const progressFill = document.getElementById('progress-fill');
const questionText = document.getElementById('question-text');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
const feedbackText = document.getElementById('feedback-text');

const starsEl = document.getElementById('stars');
const resultText = document.getElementById('result-text');
const resultScore = document.getElementById('result-score');
const replayBtn = document.getElementById('replay-btn');
const menuBtn = document.getElementById('menu-btn');

// ---- Startscherm: keuzes ----
gradeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.grade = Number(btn.dataset.grade);
  [...gradeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

modeButtons.addEventListener('click', (e) => {
  const btn = e.target.closest('.choice-btn');
  if (!btn) return;
  state.mode = btn.dataset.mode;
  [...modeButtons.children].forEach((b) => b.classList.toggle('selected', b === btn));
  checkReadyToStart();
});

function checkReadyToStart() {
  startBtn.disabled = !(state.grade && state.mode);
}

startBtn.addEventListener('click', startGame);
replayBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
  showScreen(startScreen);
});

answerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (answerInput.disabled) return;
  const value = answerInput.value.trim();
  if (value === '') return;
  handleAnswer(Number(value));
});

// ---- Spel opbouwen ----
function startGame() {
  state.questions = generateQuestions(state.grade, state.mode, TOTAL_QUESTIONS);
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;

  showScreen(quizScreen);
  renderQuestion();
}

function generateQuestions(grade, mode, count) {
  const tables = TABLES_BY_GRADE[grade];
  const questions = [];

  for (let i = 0; i < count; i++) {
    const table = tables[Math.floor(Math.random() * tables.length)];
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

  questionCounter.textContent = `Vraag ${state.currentIndex + 1} / ${TOTAL_QUESTIONS}`;
  scoreCounter.textContent = `Score: ${state.score}`;
  progressFill.style.width = `${((state.currentIndex) / TOTAL_QUESTIONS) * 100}%`;

  questionText.textContent = q.text;
  feedbackText.textContent = '';

  answerInput.value = '';
  answerInput.disabled = false;
  answerInput.classList.remove('correct', 'wrong');
  answerInput.focus();
}

function handleAnswer(givenAnswer) {
  const q = state.questions[state.currentIndex];
  answerInput.disabled = true;

  const isCorrect = givenAnswer === q.answer;

  if (isCorrect) {
    answerInput.classList.add('correct');
    state.score += 10;
    state.correctCount += 1;
    feedbackText.textContent = pickRandom(['Goed zo! 🎉', 'Top! ⭐', 'Juist! 👏']);
    feedbackText.style.color = 'var(--success)';
  } else {
    answerInput.classList.add('wrong');
    feedbackText.textContent = `Bijna! Het antwoord was ${q.answer}.`;
    feedbackText.style.color = 'var(--error)';
  }

  scoreCounter.textContent = `Score: ${state.score}`;

  setTimeout(() => {
    state.currentIndex += 1;
    if (state.currentIndex < TOTAL_QUESTIONS) {
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

  const percentage = state.correctCount / TOTAL_QUESTIONS;
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
  resultScore.textContent = `${state.correctCount} van de ${TOTAL_QUESTIONS} goed - ${state.score} punten`;
}

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}
