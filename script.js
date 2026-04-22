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

// RENDERIZZA L'INTERA STRUTTURA
const render = () => {
    const appEl = document.getElementById('app');
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
                <button id="addAnimBtn" class="bg-amber-500 text-slate-900 py-2 rounded-lg flex-1 font-bold text-[10px] uppercase tracking-wider">➕ Nuovo Animatore</button>
                <button id="manageSqBtn" class="bg-slate-700 text-white py-2 rounded-lg flex-1 font-bold text-[10px] uppercase tracking-wider">⚙️ Squadre</button>
            </div>
        ` : ''}

        <nav class="bg-slate-800 px-4 py-3 flex gap-1 border-b border-slate-700">
            ${['tutti', 'animatori', 'aiuti', 'squadre'].map(t => `
                <button id="tab-${t}" class="tab-button flex-1 ${currentTab === t ? 'active' : 'bg-slate-700 text-slate-400'}">
                    ${t.toUpperCase()}
                </button>
            `).join('')}
        </nav>

        <main id="mainContent" class="flex-1 p-4 pb-20"></main>
    `;

    // Listeners principali
    document.getElementById('adminBtn').onclick = () => { 
        if(!isAdmin) apriModaleLogin(); 
        else { isAdmin = false; render(); } 
    };
    
    document.getElementById('searchInput').oninput = (e) => { 
        searchTerm = e.target.value.toLowerCase(); 
        aggiornaLista(); 
    };

    ['tutti', 'animatori', 'aiuti', 'squadre'].forEach(t => { 
        document.getElementById(`tab-${t}`).onclick = () => { 
            currentTab = t; 
            render(); 
        }; 
    });

    if(isAdmin) {
        document.getElementById('addAnimBtn').onclick = apriModaleAggiungi;
        document.getElementById('manageSqBtn').onclick = () => {
            const n = prompt("Nome nuova squadra:");
            if(n) addDoc(squadreRef, { nome: n });
        };
    }
    aggiornaLista();
};

// AGGIORNA SOLO LA LISTA (Chiamata da render e dai listener Firebase)
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
            </div>`).join('');
        return;
    }

    let lista = filtrati;
    if(currentTab === 'animatori') lista = filtrati.filter(a => a.ruolo !== 'aiutoanimatore');
    if(currentTab === 'aiuti') lista = filtrati.filter(a => a.ruolo === 'aiutoanimatore');

    container.innerHTML = lista.length > 0 ? lista.map(a => `
        <div class="card bg-slate-800 p-4 rounded-xl mb-2 flex justify-between items-center" onclick="${isAdmin ? `window.apriProfilo('${a.id}')` : ''}">
            <div>
                <div class="font-bold text-white">${escapeHtml(a.nome)} ${escapeHtml(a.cognome || '')}</div>
                <div class="text-[10px] text-slate-500 uppercase font-medium">${squadre.find(s => s.id === a.squadraId)?.nome || 'Senza Squadra'}</div>
            </div>
            <div class="text-amber-400 font-black text-xl">${a.punti || 0}</div>
        </div>`).join('') : `<p class="text-center text-slate-600 mt-10">Nessun animatore trovato</p>`;
};

// MODALE LOGIN
const apriModaleLogin = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl modal-content border border-slate-700">
            <h2 class="text-xl font-bold text-amber-400 mb-4 text-center">Coordinatori</h2>
            <input type="password" id="passInput" placeholder="Password" class="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white mb-4 outline-none focus:border-amber-500 text-center">
            <div class="flex gap-2">
                <button id="closeLogin" class="flex-1 bg-slate-700 p-3 rounded-xl font-bold">Annulla</button>
                <button id="confirmLogin" class="flex-1 bg-amber-500 text-slate-900 p-3 rounded-xl font-bold">Entra</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    const inp = document.getElementById('passInput');
    inp.focus();
    const login = () => { 
        if(inp.value === 'grest2026') { isAdmin = true; overlay.remove(); render(); } 
        else { alert('Password Errata'); inp.value = ''; } 
    };
    document.getElementById('confirmLogin').onclick = login;
    document.getElementById('closeLogin').onclick = () => overlay.remove();
    inp.onkeypress = (e) => { if(e.key === 'Enter') login(); };
};

// MODALE AGGIUNGI (Salva e aggiorna istantaneamente)
const apriModaleAggiungi = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-end modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-6 rounded-t-3xl modal-content border-t border-amber-500/30">
            <div class="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>
            <h2 class="text-xl font-bold text-amber-400 mb-6 text-center">Nuovo Animatore</h2>
            <input type="text" id="newNome" placeholder="Nome" class="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white mb-3 outline-none focus:border-amber-500">
            <input type="text" id="newCognome" placeholder="Cognome" class="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white mb-4 outline-none focus:border-amber-500">
            <select id="newRuolo" class="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white mb-6">
                <option value="animatore">Animatore</option>
                <option value="aiutoanimatore">Aiuto Animatore</option>
            </select>
            <div class="flex gap-2">
                <button id="closeAdd" class="flex-1 bg-slate-700 p-4 rounded-xl font-bold">Chiudi</button>
                <button id="confirmAdd" class="flex-1 bg-amber-500 text-slate-900 p-4 rounded-xl font-bold">Salva Ora</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    
    document.getElementById('confirmAdd').onclick = async () => {
        const nome = document.getElementById('newNome').value.trim();
        const cognome = document.getElementById('newCognome').value.trim();
        const ruolo = document.getElementById('newRuolo').value;
        
        if(nome) { 
            try {
                await addDoc(animatoriRef, { 
                    nome, 
                    cognome, 
                    punti: 0, 
                    ruolo, 
                    squadraId: null 
                }); 
                overlay.remove();
                // Non serve chiamare nulla, onSnapshot se ne accorge da solo!
            } catch(e) { alert("Errore nel salvataggio"); }
        } else { alert("Inserisci almeno il nome"); }
    };
    document.getElementById('closeAdd').onclick = () => overlay.remove();
};

// MODALE PUNTI
window.apriProfilo = (id) => {
    const a = animatori.find(x => x.id === id);
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/90 z-[100] flex items-end modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-6 rounded-t-3xl shadow-2xl modal-content">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-amber-400">${a.nome} ${a.cognome || ''}</h2>
                <button onclick="this.closest('.modal-overlay').remove()" class="text-3xl text-slate-500">&times;</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-2xl border border-amber-500/20 text-center mb-6">
                <div class="flex gap-2 justify-center">
                    <input type="number" id="puntiInput" placeholder="+/- Punti" class="bg-slate-800 border-2 border-amber-500 rounded-xl text-center text-3xl font-bold w-full py-4 outline-none text-white">
                    <button id="sendPunti" class="bg-amber-500 text-slate-900 px-8 rounded-xl font-black text-xl">OK</button>
                </div>
            </div>
            <button id="delBtn" class="w-full text-red-500/30 py-2 text-xs font-bold uppercase">Elimina Animatore</button>
        </div>`;
    document.body.appendChild(overlay);
    const input = document.getElementById('puntiInput');
    setTimeout(() => input.focus(), 200);
    
    const save = async () => {
        const val = parseInt(input.value);
        if(!isNaN(val)) { 
            await updateDoc(doc(db, 'animatori', id), { punti: (a.punti || 0) + val }); 
            overlay.remove(); 
        }
    };
    input.onkeypress = (e) => { if(e.key === 'Enter') save(); };
    document.getElementById('sendPunti').onclick = save;
    document.getElementById('delBtn').onclick = async () => { 
        if(confirm(`Eliminare definitivamente ${a.nome}?`)) { 
            await deleteDoc(doc(db, 'animatori', id)); 
            overlay.remove(); 
        } 
    };
};

// LISTENERS FIREBASE (QUESTI SONO IL CUORE DEL "LIVE")
onSnapshot(query(animatoriRef, orderBy("punti", "desc")), (s) => { 
    animatori = s.docs.map(d => ({id: d.id, ...d.data()})); 
    aggiornaLista(); 
});
onSnapshot(squadreRef, (s) => { 
    squadre = s.docs.map(d => ({id: d.id, ...d.data()})); 
    aggiornaLista(); 
});

render();