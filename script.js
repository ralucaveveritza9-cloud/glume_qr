let glume = [];
let provocari = [];
let jackpot = [];

// coada de rezultate rămase pentru fiecare categorie (fără repetiție
// până se epuizează lista, apoi se amestecă din nou)
const cozi = { glume: [], provocari: [], jackpot: [] };

const sloturi = document.querySelectorAll(".slot");
const categorie = document.getElementById("categorie");
const mesaj = document.getElementById("mesaj");
const buton = document.getElementById("startBtn");
const sunetBtn = document.getElementById("sunetBtn");

const simboluri = ["🍒", "🍋", "⭐", "7️⃣", "💎", "🍀", "🔔", "❤️"];

// praguri de șansă: sub PRAG_JACKPOT -> jackpot,
// sub PRAG_PROVOCARE -> provocare, restul -> glumă
const PRAG_JACKPOT = 0.08;
const PRAG_PROVOCARE = 0.55;

// ------------------ sunet (sintetizat, fara fisiere externe) ------------------

let sunetActiv = localStorage.getItem("jackpotSunet") !== "off";
let audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
}

function actualizeazaButonSunet() {
    if (sunetBtn) sunetBtn.textContent = sunetActiv ? "🔊" : "🔇";
}

function tonScurt({ frecventa = 440, durata = 0.08, tip = "square", volum = 0.05, intarziere = 0 }) {
    if (!sunetActiv) return;
    const ctx = getAudioCtx();
    const start = ctx.currentTime + intarziere;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tip;
    osc.frequency.setValueAtTime(frecventa, start);

    gain.gain.setValueAtTime(volum, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + durata);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + durata + 0.02);
}

function sunetTick() {
    tonScurt({ frecventa: 700 + Math.random() * 300, durata: 0.05, tip: "square", volum: 0.04 });
}

function sunetOprireReel() {
    tonScurt({ frecventa: 220, durata: 0.12, tip: "triangle", volum: 0.08 });
}

function sunetCastig() {
    [523, 659, 784].forEach((f, i) =>
        tonScurt({ frecventa: f, durata: 0.18, tip: "sine", volum: 0.07, intarziere: i * 0.09 })
    );
}

function sunetJackpot() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) =>
        tonScurt({ frecventa: f, durata: 0.22, tip: "sawtooth", volum: 0.06, intarziere: i * 0.11 })
    );
}

if (sunetBtn) {
    actualizeazaButonSunet();
    sunetBtn.addEventListener("click", () => {
        sunetActiv = !sunetActiv;
        localStorage.setItem("jackpotSunet", sunetActiv ? "on" : "off");
        actualizeazaButonSunet();
        if (sunetActiv) getAudioCtx();
    });
}

// ------------------ date ------------------

async function incarca() {
    try {
        glume = await fetch("glume.json").then(r => r.json());
        provocari = await fetch("provocari.json").then(r => r.json());
        jackpot = await fetch("jackpot.json").then(r => r.json());
    } catch (e) {
        mesaj.textContent = "Nu pot încărca fișierele JSON.";
    }
}

function amesteca(lista) {
    const copie = [...lista];
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

// scoate un element din listă fără să repete unul recent,
// reumple și amestecă din nou coada atunci când se golește
function trage(numeCoada, listaSursa) {
    if (!listaSursa.length) return null;
    if (!cozi[numeCoada].length) {
        cozi[numeCoada] = amesteca(listaSursa);
    }
    return cozi[numeCoada].pop();
}

function random(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function vibreaza(model) {
    if (navigator.vibrate) navigator.vibrate(model);
}

// ------------------ animatie reels (fiecare rola se opreste pe rand) ------------------

function invarteReel(slot, durataMs, simbolFinal) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            slot.textContent = random(simboluri);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            slot.classList.remove("slot-spin");
            slot.textContent = simbolFinal;
            slot.classList.add("slot-stop");
            sunetOprireReel();
            vibreaza(15);
            setTimeout(() => slot.classList.remove("slot-stop"), 200);
            resolve();
        }, durataMs);
    });
}

async function joacaReels(simboluriFinale) {
    sloturi.forEach(slot => slot.classList.add("slot-spin"));

    const ticker = setInterval(sunetTick, 90);

    // fiecare rola se opreste la un moment diferit, ca la pacanelele reale
    const durate = [1000, 1500, 2100];

    await Promise.all(
        Array.from(sloturi).map((slot, i) =>
            invarteReel(slot, durate[i] ?? 2100, simboluriFinale[i])
        )
    );

    clearInterval(ticker);
}

function confettiRealist() {
    const culori = ["#d4af37", "#f5d76e", "#ffffff", "#b8860b"];
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: culori });
}

function confettiJackpot() {
    const culori = ["#d4af37", "#f5d76e", "#ffffff", "#ff4d4d"];
    const durataTotala = 1500;
    const start = Date.now();

    const interval = setInterval(() => {
        const scurs = Date.now() - start;
        if (scurs > durataTotala) {
            clearInterval(interval);
            return;
        }

        confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.7 },
            colors: culori
        });
        confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.7 },
            colors: culori
        });
    }, 200);

    confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.5 },
        colors: culori,
        scalar: 1.2
    });
}

// ------------------ logica principala ------------------

async function spin() {
    buton.disabled = true;

    categorie.textContent = "🎰 SE ÎNVÂRTE...";
    mesaj.textContent = "";

    let rezultat;
    const sansa = Math.random();
    let simboluriFinale;

    const esteJackpot = sansa < PRAG_JACKPOT && jackpot.length;

    if (esteJackpot) {
        simboluriFinale = ["7️⃣", "7️⃣", "7️⃣"];
    } else {
        simboluriFinale = [random(simboluri), random(simboluri), random(simboluri)];
    }

    await joacaReels(simboluriFinale);

    if (esteJackpot) {
        categorie.textContent = "👑 JACKPOT — 777!";
        rezultat = trage("jackpot", jackpot);

        vibreaza([80, 40, 80, 40, 160]);
        sunetJackpot();
        confettiJackpot();

    } else if (sansa < PRAG_PROVOCARE && provocari.length) {
        categorie.textContent = "🎯 PROVOCARE";
        rezultat = trage("provocari", provocari);

        vibreaza(60);
        sunetCastig();
        confettiRealist();

    } else {
        categorie.textContent = "😂 GLUMĂ";
        rezultat = trage("glume", glume);
        vibreaza(30);
        sunetCastig();
    }

    mesaj.textContent = rezultat
        ? (typeof rezultat === "string" ? rezultat : rezultat.text)
        : "Nu mai sunt rezultate în această categorie.";

    buton.disabled = false;
}

buton.addEventListener("click", spin);

incarca();
