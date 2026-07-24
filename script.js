let glume = [];
let provocari = [];
let jackpot = [];

const sloturi = document.querySelectorAll(".slot");
const categorie = document.getElementById("categorie");
const mesaj = document.getElementById("mesaj");
const buton = document.getElementById("startBtn");

const simboluri = ["🍒","🍋","⭐","7️⃣","💎","🍀","🔔","❤️"];

async function incarca() {
    try{
        glume = await fetch("glume.json").then(r=>r.json());
        provocari = await fetch("provocari.json").then(r=>r.json());
        jackpot = await fetch("jackpot.json").then(r=>r.json());
    }catch(e){
        mesaj.textContent="Nu pot încărca fișierele JSON.";
    }
}

function random(lista){
    return lista[Math.floor(Math.random()*lista.length)];
}

ove("slot-spin");
async function spin(){

    buton.disabled = true;

    categorie.textContent = "🎰 SE ÎNVÂRTE...";
    mesaj.textContent = "";

    const intervale = [];

    sloturi.forEach((slot,index)=>{

        slot.classList.add("slot-spin");

        intervale[index] = setInterval(()=>{

            slot.textContent = random(simboluri);

        },100);

    });

    // Oprire rolă 1
    await new Promise(r=>setTimeout(r,1200));
    clearInterval(intervale[0]);
    sloturi[0].classList.remove("slot-spin");

    // Oprire rolă 2
    await new Promise(r=>setTimeout(r,350));
    clearInterval(intervale[1]);
    sloturi[1].classList.remove("slot-spin");

    // Oprire rolă 3
    await new Promise(r=>setTimeout(r,350));
    clearInterval(intervale[2]);
    sloturi[2].classList.remove("slot-spin");

    let rezultat;
    let sansa = Math.random();

    if(sansa < 0.08 && jackpot.length){

        categorie.textContent = "👑 JACKPOT";
        rezultat = random(jackpot);

        confetti({
            particleCount:250,
            spread:120,
            origin:{y:0.6}
        });

    }
    else if(sansa < 0.55 && provocari.length){

        categorie.textContent = "🎯 PROVOCARE";
        rezultat = random(provocari);

        confetti({
            particleCount:120,
            spread:90
        });

    }
    else{

        categorie.textContent = "😂 GLUMĂ";
        rezultat = random(glume);

    }

    mesaj.textContent =
        typeof rezultat === "string"
        ? rezultat
        : rezultat.text;

    buton.disabled = false;

}
            slot.textContent=random(simboluri);
        });

    },100);

    await new Promise(r=>setTimeout(r,2000));

    clearInterval(animatie);

    sloturi.forEach(slot=>slot.classList.remove("slot-spin"));

    let rezultat;
    let sansa=Math.random();

    if(sansa<0.08 && jackpot.length){

        categorie.textContent="👑 JACKPOT";

        rezultat=random(jackpot);

        confetti({
            particleCount:250,
            spread:120,
            origin:{y:0.6}
        });

    }

    else if(sansa<0.55 && provocari.length){

        categorie.textContent="🎯 PROVOCARE";

        rezultat=random(provocari);

        confetti({
            particleCount:120,
            spread:90
        });

    }

    else{

        categorie.textContent="😂 GLUMĂ";

        rezultat=random(glume);

    }

    mesaj.textContent =
        typeof rezultat==="string"
        ? rezultat
        : rezultat.text;

    buton.disabled=false;

}

buton.addEventListener("click",spin);

incarca();
