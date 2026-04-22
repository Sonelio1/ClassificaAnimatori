import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDFKuynAUskoBtT2yUCBtJLpeNjoBrqr8",
    authDomain: "classificaanimatori.firebaseapp.com",
    projectId: "classificaanimatori",
    storageBucket: "classificaanimatori.firebasestorage.app",
    messagingSenderId: "405806350553",
    appId: "1:405806350553:web:7329e6bdfd3d0ce8a57ec8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const animatoriRef = collection(db, "animatori");
const squadreRef = collection(db, "squadre");

let isAdmin = false;
let animatori = [];
let squadre = [];
let searchTerm = "";
let currentTab = 'tutti';

const escapeHtml = (t) => { if(!t) return ''; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

// --- LOGICA RENDERING ---
const render = () => {
    const appEl = document.getElementById('app');
    if(!appEl) return;

    appEl.innerHTML = `
        <header class="bg-slate-800 px-4 py-3 sticky top-0 z-20 shadow-lg flex justify-between items-center">
            <h1 class="text-xl font-bold text-amber-400">🏆 GREST 2026</h1>
            <button id="adminBtn" class="${isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'} px-4 py-2 rounded-lg text-sm font-bold">
                ${isAdmin ? 'Esci' : '🔑 Admin'}
            </button>
        </header>

        <div class="bg-slate-800 px-4 pb-3 sticky top-[52px] z-20 border-b border-slate-700">
            <div class="relative">
                <input type="text" id="searchInput" placeholder="Cerca animatore..." value="${searchTerm}"
                    class="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white focus:border-amber-500 outline-none">
                <span class="absolute left-3 top-2.5">🔍</span>
            </div>
        </div>

        ${isAdmin ? `
            <div class="bg-slate-800/50 px-4 py-2 flex gap-2 border-b border-slate-700">
                <button id="addAnimBtn" class="bg-amber-500 text-slate-900 py-2 rounded-lg flex-1 font-bold text-[10px] uppercase">➕ Nuovo Animatore</button>
                <button id="manageSqBtn" class="bg-slate-700 text-white py-2 rounded-lg flex-1 font-bold text-[10px] uppercase">⚙️ Squadre</button>
            </div>
        ` : ''}

        <nav class="bg-slate-800 px-4 py-3 flex gap-1 border-b border-slate-700">
            ${['tutti', 'animatori', 'aiuti', 'squadre'].map(t => `
                <button id="tab-${t}" class="tab-button flex-1 ${currentTab === t ? 'active' : 'bg-slate-700 text-slate-400'}">
                    ${t}
                </button>
            `).join('')}
        </nav>

        <main id="mainContent" class="flex-1 p-4 pb-20"></main>

        <footer class="bg-slate-800 px-4 py-2 text-[10px] text-slate-500 fixed bottom-0 w-full border-t border-slate-700 flex justify-between z-10">
            <span>ANIMATORI: ${animatori.length}</span>
            <span class="text-green-500 font-bold">● LIVE</span>
        </footer>
    `;

    setupListeners();
    aggiornaLista();
};

const setupListeners = () => {
    document.getElementById('adminBtn').onclick = () => {
        if(!isAdmin) {
            if(prompt("Password:") === 'grest2026') { isAdmin = true; render(); }
        } else { isAdmin = false; render(); }
    };
    document.getElementById('searchInput').oninput = (e) => {
        searchTerm = e.target.value.toLowerCase();
        aggiornaLista();
    };
    ['tutti', 'animatori', 'aiuti', 'squadre'].forEach(t => {
        document.getElementById(`tab-${t}`).onclick = () => { currentTab = t; render(); };
    });
    if(isAdmin) {
        document.getElementById('addAnimBtn').onclick = apriModaleNuovo;
        document.getElementById('manageSqBtn').onclick = apriGestioneSquadre;
    }
};

const aggiornaLista = () => {
    const container = document.getElementById('mainContent');
    if(!container) return;

    const filtrati = animatori.filter(a => `${a.nome} ${a.cognome}`.toLowerCase().includes(searchTerm));

    if (currentTab === 'squadre') {
        const classificaSq = squadre.map(s => ({
            ...s,
            punti: animatori.filter(a => a.squadraId === s.id).reduce((acc, curr) => acc + (curr.punti || 0), 0)
        })).sort((a,b) => b.punti - a.punti);
        container.innerHTML = classificaSq.map((s, i) => `
            <div class="bg-slate-800 p-4 rounded-xl mb-2 flex justify-between items-center border-l-4 border-amber-500">
                <span class="font-bold text-amber-400">#${i+1} ${escapeHtml(s.nome)}</span>
                <span class="bg-slate-700 px-4 py-1 rounded-full font-bold">${s.punti} pt</span>
            </div>
        `).join('');
        return;
    }

    let lista = filtrati;
    if(currentTab === 'animatori') lista = filtrati.filter(a => a.ruolo !== 'aiutoanimatore');
    if(currentTab === 'aiuti') lista = filtrati.filter(a => a.ruolo === 'aiutoanimatore');

    container.innerHTML = lista.map(a => `
        <div class="card bg-slate-800 p-4 rounded-xl mb-2 flex justify-between items-center" 
             onclick="${isAdmin ? `window.apriProfilo('${a.id}')` : ''}">
            <div>
                <div class="font-bold text-white">${escapeHtml(a.nome)} ${escapeHtml(a.cognome)}</div>
                <div class="text-[10px] text-slate-500 uppercase">${squadre.find(s => s.id === a.squadraId)?.nome || 'No Squadra'}</div>
            </div>
            <div class="text-amber-400 font-black text-xl">${a.punti || 0}</div>
        </div>
    `).join('');
};

window.apriProfilo = (id) => {
    const a = animatori.find(x => x.id === id);
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 z-[100] flex items-end modal-overlay';
    modal.innerHTML = `
        <div class="bg-slate-800 w-full p-6 rounded-t-3xl shadow-2xl modal-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-amber-400">${a.nome} ${a.cognome || ''}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="text-3xl text-slate-500">&times;</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-2xl border border-amber-500/20 text-center mb-6">
                <div class="flex gap-2 justify-center">
                    <input type="number" id="puntiInput" placeholder="+/- Punti" 
                        class="bg-slate-800 border-2 border-amber-500 rounded-xl text-center text-3xl font-bold w-full py-4 outline-none text-white">
                    <button id="sendPunti" class="bg-amber-500 text-slate-900 px-8 rounded-xl font-black text-xl">OK</button>
                </div>
            </div>
            <button id="delBtn" class="w-full text-red-500/50 py-2 text-xs uppercase font-bold">Elimina Animatore</button>
        </div>
    `;
    document.body.appendChild(modal);
    const input = document.getElementById('puntiInput');
    const save = async () => {
        const val = parseInt(input.value);
        if(!isNaN(val)) {
            await updateDoc(doc(db, 'animatori', id), { punti: (a.punti || 0) + val });
            modal.remove();
        }
    };
    input.onkeypress = (e) => { if(e.key === 'Enter') save(); };
    document.getElementById('sendPunti').onclick = save;
    document.getElementById('delBtn').onclick = async () => { if(confirm("Eliminare?")) { await deleteDoc(doc(db, 'animatori', id)); modal.remove(); } };
    setTimeout(() => input.focus(), 150);
};

// --- FUNZIONI GESTIONE ---
async function apriModaleNuovo() {
    const nome = prompt("Nome:");
    const cognome = prompt("Cognome:");
    if(nome) await addDoc(animatoriRef, { nome, cognome, punti: 0, ruolo: 'animatore', squadraId: null });
}

async function apriGestioneSquadre() {
    const n = prompt("Nome Nuova Squadra (lascia vuoto per annullare):");
    if(n) await addDoc(squadreRef, { nome: n });
}

// --- SYNC ---
onSnapshot(query(animatoriRef, orderBy("punti", "desc")), (s) => {
    animatori = s.docs.map(d => ({id: d.id, ...d.data()}));
    aggiornaLista();
});
onSnapshot(squadreRef, (s) => {
    squadre = s.docs.map(d => ({id: d.id, ...d.data()}));
    aggiornaLista();
});

render();