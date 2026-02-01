const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const STATE = {
  grade: "all",
  sound: true,
  pane: "lesson",
  idx: 0,
  currentComic: "https://qazcomics.kz/kz/comics/5/2",
  readTimer: null
};

const COMIC_LIST = [
  { t: "QazComics", url: "https://qazcomics.kz/kz" },
  { t: "Ер Тарғын 1", url: "https://qazcomics.kz/kz/comics/5/1" },
  { t: "Ер Тарғын 2", url: "https://qazcomics.kz/kz/comics/5/2" },
  { t: "Ер Тарғын 3", url: "https://qazcomics.kz/kz/comics/5/3" },
  { t: "Ер Тарғын 4", url: "https://qazcomics.kz/kz/comics/5/4" }
];

const WORDS = [
  { kk: "тақырып", ru: "тема" },
  { kk: "негізгі ой", ru: "главная мысль" },
  { kk: "мәтін", ru: "текст" },
  { kk: "кейіпкер", ru: "персонаж" },
  { kk: "оқиға", ru: "событие" },
  { kk: "басы", ru: "начало" },
  { kk: "негізгі бөлім", ru: "основная часть" },
  { kk: "соңы", ru: "конец" },
  { kk: "етістік", ru: "глагол" },
  { kk: "зат есім", ru: "существительное" },
  { kk: "сын есім", ru: "прилагательное" }
];

const LESSONS = [
  {
    grade: "7",
    topic: "Мәтін",
    title: "Тақырып және негізгі ой",
    comic: { name: "Ер Тарғын • 2", url: "https://qazcomics.kz/kz/comics/5/2" },
    lines: [
      { kk: "Тақырып — мәтін не туралы екенін көрсетеді.", ru: "Тема показывает, о чём текст." },
      { kk: "Негізгі ой — автор не айтқысы келеді.", ru: "Главная мысль — что хотел сказать автор." },
      { kk: "Негізгі ойды бір сөйлеммен айтуға болады.", ru: "Главную мысль можно сказать одним предложением." }
    ],
    bank: ["Тақырып", "негізгі", "ойды", "автор", "айтады"],
    quiz: [
      { q: "Негізгі ой деген не?", opts: ["Автордың айтқысы келгені", "Кейіпкердің аты"], ans: "Автордың айтқысы келгені" },
      { q: "Тақырып нені көрсетеді?", opts: ["Не туралы", "Қай жылы"], ans: "Не туралы" },
      { q: "Негізгі ойды қалай айтуға болады?", opts: ["Бір сөйлеммен", "Суретпен ғана"], ans: "Бір сөйлеммен" }
    ],
    pickPool: [
      { q: "Қайсысы негізгі ой?", opts: ["Автордың айтқысы келгені", "Мәтіндегі ең ұзын сөйлем", "Кейіпкердің аты"], ans: "Автордың айтқысы келгені" },
      { q: "Қайсысы тақырыпқа жақын?", opts: ["Не туралы", "Қайда отырды", "Неше болды"], ans: "Не туралы" }
    ]
  },
  {
    grade: "8",
    topic: "Мәтін",
    title: "Мәтін бөліктері",
    comic: { name: "QazComics", url: "https://qazcomics.kz/kz" },
    lines: [
      { kk: "Мәтіннің басы — таныстыру.", ru: "Начало — знакомство." },
      { kk: "Негізгі бөлім — оқиға.", ru: "Основная часть — событие." },
      { kk: "Соңы — қорытынды.", ru: "Конец — итог." }
    ],
    bank: ["Мәтіннің", "басы", "негізгі", "бөлім", "соңы"],
    quiz: [
      { q: "Оқиға қай бөлікте?", opts: ["Негізгі бөлім", "Басы"], ans: "Негізгі бөлім" },
      { q: "Қорытынды қайда?", opts: ["Соңы", "Негізгі бөлім"], ans: "Соңы" },
      { q: "Таныстыру қайда?", opts: ["Басы", "Соңы"], ans: "Басы" }
    ],
    pickPool: [
      { q: "Қайсысы мәтіннің соңы?", opts: ["Қорытынды", "Таныстыру", "Оқиға"], ans: "Қорытынды" },
      { q: "Қайсысы негізгі бөлімге тән?", opts: ["Оқиға", "Тақырып", "Аты"], ans: "Оқиға" }
    ]
  }
];

function speak(text){
  if (!STATE.sound) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

function stopReading(){
  if (STATE.readTimer) {
    clearTimeout(STATE.readTimer);
    STATE.readTimer = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function filteredLessons(){
  return STATE.grade === "all" ? LESSONS : LESSONS.filter(x => x.grade === STATE.grade);
}

function setPane(name){
  STATE.pane = name;
  $$("[data-pane]").forEach(b => b.classList.toggle("is-on", b.dataset.pane === name));
  $$(".pane").forEach(p => p.classList.toggle("is-on", p.id === `pane-${name}`));
}

function setGrade(g){
  STATE.grade = g;
  $$("[data-grade]").forEach(b => b.classList.toggle("is-on", b.dataset.grade === g));
  STATE.idx = 0;
  loadLesson(filteredLessons()[0]);
}

function loadLesson(lesson){
  if (!lesson) return;
  stopReading();

  $("#chipGrade").textContent = (STATE.grade === "all") ? "7–8" : STATE.grade;
  $("#chipTopic").textContent = lesson.topic;
  $("#lessonTitle").textContent = lesson.title;

  // Comic main
  $("#comicName").textContent = lesson.comic.name;
  STATE.currentComic = lesson.comic.url;

  // Text
  const box = $("#lessonText");
  box.innerHTML = "";
  lesson.lines.forEach((ln, i) => {
    const row = document.createElement("div");
    row.className = "line";
    row.innerHTML = `
      <div class="badge" aria-hidden="true">${i+1}</div>
      <div>
        <p class="k">${ln.kk}</p>
        <p class="r">${ln.ru}</p>
      </div>
    `;
    row.addEventListener("click", () => speak(ln.kk));
    box.appendChild(row);
  });

  // Bank
  const bank = $("#bank");
  bank.innerHTML = "";
  lesson.bank.forEach(w => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "wbtn";
    b.textContent = w;
    b.addEventListener("click", () => addWord(w));
    bank.appendChild(b);
  });
  clearLine();

  renderQuiz(lesson.quiz);
  renderPickFromPool(lesson.pickPool);
  renderComics();
  renderWords();
}

function addWord(w){
  const out = $("#out");
  out.textContent = (out.textContent ? out.textContent + " " : "") + w;
  speak(w);
}

function clearLine(){ $("#out").textContent = ""; }

function renderQuiz(items){
  const quiz = $("#quiz");
  quiz.innerHTML = "";

  items.forEach(it => {
    const row = document.createElement("div");
    row.className = "qrow";
    row.innerHTML = `<div class="qt">${it.q}</div><div class="pills"></div>`;
    const pills = row.querySelector(".pills");

    it.opts.forEach(opt => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pillbtn";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (opt === it.ans) {
          b.classList.add("ok");
          speak("Жарайсың");
        } else {
          speak(it.ans);
        }
      });
      pills.appendChild(b);
    });

    quiz.appendChild(row);
  });
}

function pickOne(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(a){ return [...a].sort(() => Math.random() - 0.5); }

function renderPickFromPool(pool){
  const pick = $("#pick");
  pick.innerHTML = "";

  const p = pickOne(pool);
  shuffle(p.opts).forEach(opt => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "abtn";
    b.textContent = opt;
    b.addEventListener("click", () => {
      if (opt === p.ans) {
        b.classList.add("ok");
        speak("Жарайсың");
      } else {
        speak(p.ans);
      }
    });
    pick.appendChild(b);
  });
}

function renderComics(){
  const box = $("#comics");
  box.innerHTML = "";

  COMIC_LIST.forEach(c => {
    const row = document.createElement("div");
    row.className = "com";
    row.innerHTML = `<div class="comt">${c.t}</div><button class="btn ghost" type="button">Ашу</button>`;
    row.querySelector("button").addEventListener("click", () => {
      window.open(c.url, "_blank", "noopener,noreferrer");
    });
    box.appendChild(row);
  });
}

function renderWords(){
  const q = ($("#search").value || "").trim().toLowerCase();
  const list = q
    ? WORDS.filter(w => w.kk.toLowerCase().includes(q) || w.ru.toLowerCase().includes(q))
    : WORDS;

  const box = $("#words");
  box.innerHTML = "";

  list.forEach(w => {
    const row = document.createElement("div");
    row.className = "wi";
    row.innerHTML = `
      <div>
        <div class="wkk">${w.kk}</div>
        <div class="wru">${w.ru}</div>
      </div>
      <button class="btn ghost" type="button">Оқу</button>
    `;
    row.querySelector("button").addEventListener("click", () => speak(w.kk));
    box.appendChild(row);
  });
}

function hookUI(){
  // Grade buttons
  $$("[data-grade]").forEach(b => b.addEventListener("click", () => setGrade(b.dataset.grade)));

  // Pane buttons
  $$("[data-pane]").forEach(b => b.addEventListener("click", () => setPane(b.dataset.pane)));

  // Contrast
  $("#t-contrast").addEventListener("click", () => {
    const on = document.body.classList.toggle("contrast");
    $("#t-contrast").setAttribute("aria-pressed", String(on));
  });

  // Font
  $("#t-font").addEventListener("click", () => {
    const on = document.body.classList.toggle("big");
    $("#t-font").setAttribute("aria-pressed", String(on));
  });

  // Sound
  $("#t-sound").addEventListener("click", () => {
    STATE.sound = !STATE.sound;
    $("#t-sound").classList.toggle("is-on", STATE.sound);
    $("#t-sound").setAttribute("aria-pressed", String(STATE.sound));
    if (!STATE.sound) stopReading();
  });

  // Prev/Next lesson
  $("#prev").addEventListener("click", () => {
    const list = filteredLessons();
    if (!list.length) return;
    STATE.idx = (STATE.idx - 1 + list.length) % list.length;
    loadLesson(list[STATE.idx]);
  });

  $("#next").addEventListener("click", () => {
    const list = filteredLessons();
    if (!list.length) return;
    STATE.idx = (STATE.idx + 1) % list.length;
    loadLesson(list[STATE.idx]);
  });

  // Open main comic
  $("#openComic").addEventListener("click", () => {
    window.open(STATE.currentComic, "_blank", "noopener,noreferrer");
  });

  // Read all text
  $("#readAll").addEventListener("click", () => {
    stopReading();
    const list = filteredLessons();
    const lesson = list[STATE.idx];
    if (!lesson) return;

    let i = 0;
    const seq = () => {
      if (!STATE.sound) return;
      if (i >= lesson.lines.length) return;
      speak(lesson.lines[i].kk);
      i += 1;
      STATE.readTimer = setTimeout(seq, 1200);
    };
    seq();
  });

  // Clear
  $("#clearAll").addEventListener("click", () => {
    stopReading();
    $("#search").value = "";
    renderWords();
    clearLine();
  });

  // Sentence
  $("#sayLine").addEventListener("click", () => speak($("#out").textContent || " "));
  $("#clearLine").addEventListener("click", clearLine);

  // Pick regenerate
  $("#regenPick").addEventListener("click", () => {
    const list = filteredLessons();
    const lesson = list[STATE.idx];
    if (!lesson) return;
    renderPickFromPool(lesson.pickPool);
  });

  // Words
  $("#search").addEventListener("input", renderWords);
  $("#b-readAllWords").addEventListener("click", () => {
    stopReading();
    let i = 0;
    const seq = () => {
      if (!STATE.sound) return;
      if (i >= WORDS.length) return;
      speak(WORDS[i].kk);
      i += 1;
      STATE.readTimer = setTimeout(seq, 1100);
    };
    seq();
  });
}

function start(){
  hookUI();
  setPane("lesson");
  setGrade("all"); // load first
}

start();
