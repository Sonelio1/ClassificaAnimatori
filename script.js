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


const render = () => {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
        <header class="bg-slate-800 px-4 py-4 sticky top-0 z-20 shadow-lg flex justify-between items-center border-b border-slate-700">
            <h1 class="text-2xl font-black text-amber-400 tracking-tighter">🏆 GREST 2026</h1>
            <button id="adminBtn" class="${isAdmin ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'} px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                ${isAdmin ? 'ESCI' : '🔑 ADMIN'}
            </button>
        </header>

        <div class="bg-slate-800 px-4 pb-4 sticky top-[68px] z-20 shadow-md">
            <div class="relative">
                <input type="text" id="searchInput" placeholder="Cerca un nome..." value="${searchTerm}"
                    class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-amber-500 outline-none transition-all">
                <span class="absolute left-4 top-3.5 text-xl">🔍</span>
            </div>
        </div>

        ${isAdmin ? `
            <div class="bg-slate-900/50 px-4 py-3 flex gap-3 border-b border-slate-800">
                <button id="addAnimBtn" class="bg-amber-500 text-slate-900 py-3 rounded-xl flex-1 font-black text-xs uppercase shadow-lg">➕ NUOVO ANIMATORE</button>
                <button id="addSqBtn" class="bg-slate-700 text-white py-3 rounded-xl flex-1 font-black text-xs uppercase shadow-lg">🛡️ NUOVA SQUADRA</button>
            </div>
        ` : ''}

        <nav class="bg-slate-800 px-2 py-3 flex gap-1 sticky top-[140px] z-10 border-b border-slate-700">
            ${['tutti', 'animatori', 'aiuti', 'squadre'].map(t => `
                <button id="tab-${t}" class="tab-button flex-1 rounded-xl font-bold transition-all ${currentTab === t ? 'bg-amber-500 text-slate-900 scale-105 shadow-md' : 'text-slate-400'}">
                    ${t.toUpperCase()}
                </button>
            `).join('')}
        </nav>

        <main id="mainContent" class="p-4 pb-24"></main>
    `;

    document.getElementById('adminBtn').onclick = () => { if(!isAdmin) apriModaleLogin(); else { isAdmin = false; render(); } };
    document.getElementById('searchInput').oninput = (e) => { searchTerm = e.target.value.toLowerCase(); aggiornaLista(); };
    ['tutti', 'animatori', 'aiuti', 'squadre'].forEach(t => { document.getElementById(`tab-${t}`).onclick = () => { currentTab = t; render(); }; });
    
    if(isAdmin) {
        document.getElementById('addAnimBtn').onclick = apriModaleAggiungi;
        document.getElementById('addSqBtn').onclick = apriModaleSquadra;
    }
    aggiornaLista();
};


const aggiornaLista = () => {
    const container = document.getElementById('mainContent');
    if(!container) return;



    if (currentTab === 'squadre') {
        const classificaSq = squadre.map(s => ({
            ...s,
            membri: animatori.filter(a => a.squadraId === s.id),
            punti: animatori.filter(a => a.squadraId === s.id).reduce((acc, curr) => acc + (curr.punti || 0), 0)
        })).sort((a,b) => b.punti - a.punti);

        container.innerHTML = classificaSq.map((s, i) => {
            const classePodio = i === 0 ? 'oro' : i === 1 ? 'argento' : i === 2 ? 'bronzo' : '';
            const medaglia = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
            return `
            <div class="card ${classePodio} bg-slate-800 p-5 rounded-2xl mb-4 shadow-sm">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-2xl font-black text-amber-400">${medaglia} ${escapeHtml(s.nome)}</span>
                    <span class="bg-slate-900 px-4 py-1 rounded-full font-black text-xl border border-slate-700">${s.punti}</span>
                </div>
                <div class="text-xs text-slate-500 uppercase font-bold border-t border-slate-700 pt-2">
                    Membri: ${s.membri.map(m => m.nome).join(', ') || 'Nessuno'}
                </div>
            </div>`;
        }).join('');
        return;
    }

    let lista = animatori.filter(a => `${a.nome} ${a.cognome}`.toLowerCase().includes(searchTerm));
    if(currentTab === 'animatori') lista = lista.filter(a => a.ruolo !== 'aiutoanimatore');
    if(currentTab === 'aiuti') lista = lista.filter(a => a.ruolo === 'aiutoanimatore');

    container.innerHTML = lista.map((a, i) => {
        const classePodio = (i === 0 && searchTerm === "") ? 'oro' : (i === 1 && searchTerm === "") ? 'argento' : (i === 2 && searchTerm === "") ? 'bronzo' : '';
        const medaglia = (i === 0 && searchTerm === "") ? '🥇' : (i === 1 && searchTerm === "") ? '🥈' : (i === 2 && searchTerm === "") ? '🥉' : '';
        
        return `
        <div class="card ${classePodio} bg-slate-800 p-5 rounded-2xl mb-3 flex justify-between items-center shadow-md active:scale-95" onclick="${isAdmin ? `window.apriProfilo('${a.id}')` : ''}">
            <div class="flex items-center gap-4">
                <div class="text-2xl">${medaglia}</div>
                <div>
                    <div class="font-black text-white text-xl uppercase leading-tight">${escapeHtml(a.nome)} ${escapeHtml(a.cognome || '')}</div>
                    <div class="text-xs text-slate-500 font-bold uppercase tracking-widest">${squadre.find(s => s.id === a.squadraId)?.nome || 'Senza Squadra'}</div>
                </div>
            </div>
            <div class="text-amber-400 font-black text-3xl">${a.punti || 0}</div>
        </div>`;
    }).join('');
};

const apriModaleAggiungi = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-end modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-8 rounded-t-[40px] modal-content shadow-2xl border-t-2 border-amber-500">
            <h2 class="text-2xl font-black text-amber-400 mb-6 text-center">NUOVO ANIMATORE</h2>
            <input type="text" id="newNome" placeholder="Nome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-3 outline-none focus:border-amber-500 text-lg">
            <input type="text" id="newCognome" placeholder="Cognome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-3 outline-none focus:border-amber-500 text-lg">
            
            <label class="text-slate-500 text-xs font-bold ml-2 mb-1 block uppercase">Ruolo</label>
            <select id="newRuolo" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-4 text-lg">
                <option value="animatore">Animatore</option>
                <option value="aiutoanimatore">Aiuto Animatore</option>
            </select>

            <label class="text-slate-500 text-xs font-bold ml-2 mb-1 block uppercase">Squadra</label>
            <select id="newSquadra" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-8 text-lg">
                <option value="">Nessuna Squadra</option>
                ${squadre.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
            </select>

            <div class="flex gap-3">
                <button id="closeAdd" class="flex-1 bg-slate-700 p-5 rounded-2xl font-black text-white">ANNULLA</button>
                <button id="confirmAdd" class="flex-1 bg-amber-500 text-slate-900 p-5 rounded-2xl font-black">SALVA</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    document.getElementById('confirmAdd').onclick = async () => {
        const nome = document.getElementById('newNome').value.trim();
        const cognome = document.getElementById('newCognome').value.trim();
        const ruolo = document.getElementById('newRuolo').value;
        const squadraId = document.getElementById('newSquadra').value || null;
        if(nome) { await addDoc(animatoriRef, { nome, cognome, punti: 0, ruolo, squadraId }); overlay.remove(); }
    };
    document.getElementById('closeAdd').onclick = () => overlay.remove();
};

const apriModaleSquadra = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 p-8 rounded-[32px] w-full max-w-sm border-2 border-slate-700 shadow-2xl">
            <h2 class="text-xl font-black text-amber-400 mb-6 text-center uppercase">Nuova Squadra</h2>
            <input type="text" id="sqNome" placeholder="Nome Squadra (es: Rossi)" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-6 outline-none focus:border-amber-500 text-center">
            <div class="flex gap-2">
                <button id="closeSq" class="flex-1 bg-slate-700 p-4 rounded-2xl font-bold">CHIUDI</button>
                <button id="confirmSq" class="flex-1 bg-amber-500 text-slate-900 p-4 rounded-2xl font-bold">CREA</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmSq').onclick = async () => {
        const n = document.getElementById('sqNome').value.trim();
        if(n) { await addDoc(squadreRef, { nome: n }); overlay.remove(); }
    };
    document.getElementById('closeSq').onclick = () => overlay.remove();
};

const apriModaleLogin = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 p-8 rounded-[32px] w-full max-w-sm border-2 border-slate-700">
            <h2 class="text-xl font-black text-amber-400 mb-6 text-center">PASSWORD ADMIN</h2>
            <input type="password" id="passInput" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white mb-6 outline-none focus:border-amber-500 text-center text-2xl tracking-[1rem]">
            <button id="confirmLogin" class="w-full bg-amber-500 text-slate-900 p-5 rounded-2xl font-black uppercase shadow-lg">ENTRA</button>
        </div>`;
    document.body.appendChild(overlay);
    const inp = document.getElementById('passInput'); inp.focus();
    const login = () => { if(inp.value === 'grest2026') { isAdmin = true; overlay.remove(); render(); } else { alert('Errore!'); inp.value = ''; }};
    document.getElementById('confirmLogin').onclick = login;
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    inp.onkeypress = (e) => { if(e.key === 'Enter') login(); };
};

window.apriProfilo = (id) => {
    const a = animatori.find(x => x.id === id);
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/90 z-[100] flex items-end modal-overlay';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-8 rounded-t-[40px] modal-content shadow-2xl border-t-2 border-amber-500">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-3xl font-black text-amber-400 leading-tight uppercase">${a.nome} ${a.cognome || ''}</h2>
                    <p class="text-slate-500 font-bold uppercase tracking-widest text-sm">${squadre.find(s => s.id === a.squadraId)?.nome || 'Senza Squadra'}</p>
                </div>
                <button onclick="this.closest('.modal-overlay').remove()" class="text-4xl text-slate-600">&times;</button>
            </div>

            <div class="bg-slate-900 p-4 rounded-3xl border-2 border-slate-700 mb-6">
                <div class="text-[10px] text-slate-500 font-black uppercase mb-4 text-center tracking-widest">Modifica rapida punteggio</div>
                
                <input type="number" id="puntiInput" placeholder="Quanti punti?" 
                    class="bg-slate-800 border-2 border-amber-500 rounded-2xl text-center text-4xl font-black w-full py-4 outline-none text-white shadow-inner mb-4">
                
                <div class="flex gap-4 mb-2">
                    <button id="btnMeno" class="flex-1 bg-red-600 text-white py-6 rounded-2xl font-black text-2xl shadow-lg active:bg-red-700 flex flex-col items-center">
                        <span class="text-xs opacity-70 uppercase">Sottrai</span>
                        - PUNTI
                    </button>
                    <button id="btnPiu" class="flex-1 bg-green-600 text-white py-6 rounded-2xl font-black text-2xl shadow-lg active:bg-green-700 flex flex-col items-center">
                        <span class="text-xs opacity-70 uppercase">Aggiungi</span>
                        + PUNTI
                    </button>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <select id="changeSquadra" class="flex-1 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white font-bold text-sm">
                        <option value="">Sposta in Squadra...</option>
                        ${squadre.map(s => `<option value="${s.id}" ${a.squadraId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
                    </select>
                    <button id="saveSqOnly" class="bg-slate-700 text-white px-4 py-4 rounded-2xl font-bold text-xs">OK</button>
                </div>
                <button id="delBtn" class="w-full text-red-500/40 py-2 text-[10px] font-black uppercase tracking-[0.3rem] mt-2">Elimina Animatore</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    
    const input = document.getElementById('puntiInput');

    // Funzione di salvataggio universale
    const applicaModifica = async (operazione) => {
        let valoreDaInserire = parseInt(input.value);
        if(isNaN(valoreDaInserire)) {
            alert("Inserisci un numero prima!");
            return;
        }

        // Se l'operazione è 'sottrai', rendiamo il numero negativo
        const variazione = operazione === 'meno' ? -valoreDaInserire : valoreDaInserire;
        const nuovoTotale = (a.punti || 0) + variazione;

        try {
            await updateDoc(doc(db, 'animatori', id), { punti: nuovoTotale });
            overlay.remove();
        } catch(e) {
            alert("Errore nel salvataggio");
        }
    };

    // Click sui tastoni colorati
    document.getElementById('btnPiu').onclick = () => applicaModifica('piu');
    document.getElementById('btnMeno').onclick = () => applicaModifica('meno');

    // Salvataggio solo squadra
    document.getElementById('saveSqOnly').onclick = async () => {
        const newSq = document.getElementById('changeSquadra').value;
        await updateDoc(doc(db, 'animatori', id), { squadraId: newSq || null });
        overlay.remove();
    };

    document.getElementById('delBtn').onclick = async () => { 
        if(confirm(`Eliminare definitivamente ${a.nome}?`)) { 
            await deleteDoc(doc(db, 'animatori', id)); 
            overlay.remove(); 
        } 
    };
};

onSnapshot(query(animatoriRef, orderBy("punti", "desc")), (s) => { animatori = s.docs.map(d => ({id: d.id, ...d.data()})); aggiornaLista(); });
onSnapshot(squadreRef, (s) => { squadre = s.docs.map(d => ({id: d.id, ...d.data()})); aggiornaLista(); });

render();