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

// Utility per evitare XSS
const escapeHtml = (t) => { if(!t) return ''; const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

// Funzioni per l'identità locale
const getMioId = () => localStorage.getItem('id_animatore');
const getMioToken = () => localStorage.getItem('session_token');

const render = () => {
    const mioId = getMioId();
    const mioToken = getMioToken();
    const animatoreCorrente = animatori.find(a => a.id === mioId);

    // LOGICA DI LOGOUT REMOTO
    if (mioId && animatoreCorrente && animatoreCorrente.sessionToken !== mioToken) {
        localStorage.removeItem('id_animatore');
        localStorage.removeItem('session_token');
        location.reload();
        return;
    }

    const appEl = document.getElementById('app');

    // SCHERMATA DI BENVENUTO (FIRST ACCESS)
    if (!mioId && !isAdmin) {
        appEl.innerHTML = `
            <div class="min-h-screen bg-slate-900 flex flex-col p-6 items-center justify-center">
                <div class="text-center mb-10">
                    <h1 class="text-5xl font-black text-amber-400 mb-2 italic tracking-tighter text-shadow">GREST 2026</h1>
                    <p class="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Identificazione Animatore</p>
                </div>
                <div class="w-full max-w-sm bg-slate-800 rounded-[45px] p-8 shadow-2xl border-b-8 border-amber-600">
                    <label class="block text-slate-400 text-[10px] font-black uppercase mb-2 ml-2">Seleziona il tuo profilo</label>
                    <select id="selectPrimoAccesso" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white font-black mb-8 appearance-none focus:border-amber-500 outline-none">
                        <option value="">CHI SEI?</option>
                        ${animatori.sort((a,b) => a.nome.localeCompare(b.nome)).map(a => `
                            <option value="${a.id}">${a.nome.toUpperCase()} ${a.cognome?.toUpperCase() || ''}</option>
                        `).join('')}
                    </select>
                    <button id="btnConferma" class="w-full bg-amber-500 text-slate-900 py-6 rounded-3xl font-black text-xl shadow-lg active:translate-y-1 transition-all uppercase">Inizia ora</button>
                    <button id="adminAccess" class="w-full mt-12 text-slate-700 font-bold text-[10px] uppercase tracking-widest hover:text-slate-500 transition-colors">Accesso Riservato Admin</button>
                </div>
            </div>`;

        document.getElementById('btnConferma').onclick = async () => {
            const id = document.getElementById('selectPrimoAccesso').value;
            if(!id) return alert("Per favore, scegli il tuo nome!");
            const a = animatori.find(x => x.id === id);
            if(confirm(`Sei ${a.nome}? Una volta collegato non potrai cambiare profilo senza autorizzazione.`)) {
                const newToken = Math.random().toString(36).substring(2, 15);
                await updateDoc(doc(db, 'animatori', id), { sessionToken: newToken });
                localStorage.setItem('id_animatore', id);
                localStorage.setItem('session_token', newToken);
                render();
            }
        };
        document.getElementById('adminAccess').onclick = apriModaleLogin;
        return;
    }

    // INTERFACCIA PRINCIPALE
    appEl.innerHTML = `
        <header class="bg-slate-800 px-6 py-5 sticky top-0 z-30 shadow-xl flex justify-between items-center border-b border-slate-700">
            <div>
                <h1 class="text-2xl font-black text-amber-400 italic leading-none">GREST 2026</h1>
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Classifica Generale</p>
            </div>
            <button id="adminBtn" class="${isAdmin ? 'bg-red-600 shadow-red-900/20' : 'bg-slate-700 shadow-black/20'} px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all active:scale-95">
                ${isAdmin ? 'Esci Admin' : 'Admin'}
            </button>
        </header>

        <div class="bg-slate-800 px-4 pb-5 sticky top-[76px] z-30 shadow-md">
            <div class="relative max-w-2xl mx-auto">
                <input type="text" id="searchInput" placeholder="Cerca il tuo nome..." value="${searchTerm}"
                    class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-amber-500 outline-none font-bold transition-all placeholder:text-slate-600">
                <span class="absolute left-4 top-4 text-xl opacity-30">🔍</span>
            </div>
        </div>

        ${isAdmin ? `
            <div class="bg-slate-900/80 backdrop-blur-md px-4 py-4 flex gap-4 border-b border-slate-800 sticky top-[152px] z-30">
                <button id="addAnimBtn" class="bg-amber-500 text-slate-900 py-4 rounded-2xl flex-1 font-black text-xs uppercase shadow-lg active:scale-95 transition-all">➕ Animatore</button>
                <button id="addSqBtn" class="bg-slate-700 text-white py-4 rounded-2xl flex-1 font-black text-xs uppercase shadow-lg active:scale-95 transition-all">🛡️ Squadra</button>
            </div>
        ` : ''}

        <nav class="bg-slate-800 px-2 py-4 flex gap-2 sticky ${isAdmin ? 'top-[232px]' : 'top-[152px]'} z-20 border-b border-slate-700 overflow-x-auto no-scrollbar">
            ${['tutti', 'animatori', 'aiuti', 'squadre'].map(t => `
                <button id="tab-${t}" class="tab-button min-w-[100px] py-3 rounded-2xl font-black text-[10px] uppercase tracking-tighter transition-all ${currentTab === t ? 'bg-amber-500 text-slate-900 shadow-lg scale-105' : 'text-slate-500 bg-slate-900/50'}">
                    ${t}
                </button>
            `).join('')}
        </nav>

        <main id="mainContent" class="p-4 max-w-2xl mx-auto pb-32"></main>
    `;

    // Listeners Navigazione
    document.getElementById('adminBtn').onclick = () => { if(!isAdmin) apriModaleLogin(); else { isAdmin = false; render(); } };
    document.getElementById('searchInput').oninput = (e) => { searchTerm = e.target.value.toLowerCase(); aggiornaLista(); };
    ['tutti', 'animatori', 'aiuti', 'squadre'].forEach(t => { 
        const btn = document.getElementById(`tab-${t}`);
        if(btn) btn.onclick = () => { currentTab = t; render(); }; 
    });

    if(isAdmin) {
        document.getElementById('addAnimBtn').onclick = apriModaleAggiungi;
        document.getElementById('addSqBtn').onclick = () => { const n = prompt("Nome Nuova Squadra:"); if(n) addDoc(squadreRef, {nome: n}); };
    }
    
    aggiornaLista();
};

const aggiornaLista = () => {
    const container = document.getElementById('mainContent');
    if(!container) return;

    // --- TAB SQUADRE ---
    if (currentTab === 'squadre') {
        const classificaSq = squadre.map(s => ({
            ...s,
            membri: animatori.filter(a => a.squadraId === s.id),
            punti: animatori.filter(a => a.squadraId === s.id).reduce((acc, curr) => acc + (curr.punti || 0), 0)
        })).sort((a,b) => b.punti - a.punti);

        container.innerHTML = classificaSq.map((s, i) => {
            const podioSq = i === 0 ? 'border-amber-500' : 'border-slate-700';
            return `
            <div class="bg-slate-800 p-6 rounded-[35px] mb-4 border-2 ${podioSq} shadow-xl relative overflow-hidden">
                <div class="flex justify-between items-center relative z-10">
                    <div>
                        <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Posizione #${i+1}</span>
                        <h3 class="text-2xl font-black text-white italic uppercase leading-none">${s.nome}</h3>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="bg-amber-500 text-slate-900 h-14 w-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-lg">${s.punti}</div>
                        ${isAdmin ? `
                            <button onclick="window.eliminaSquadra('${s.id}')" class="bg-red-500/10 text-red-500 p-3 rounded-2xl text-[9px] font-black uppercase border border-red-500/20 active:scale-95 transition-all">Elimina</button>
                        ` : ''}
                    </div>
                </div>
                <p class="mt-4 text-[10px] text-slate-500 font-bold uppercase border-t border-slate-700/50 pt-3">Componenti: ${s.membri.map(m => m.nome).join(', ') || 'Nessuno'}</p>
            </div>`;
        }).join('');
        return;
    }

    // --- CLASSIFICA ANIMATORI (Tutti / Animatori / Aiuti) ---
    let lista = animatori.filter(a => `${a.nome} ${a.cognome}`.toLowerCase().includes(searchTerm));
    if(currentTab === 'animatori') lista = lista.filter(a => a.ruolo !== 'aiutoanimatore');
    if(currentTab === 'aiuti') lista = lista.filter(a => a.ruolo === 'aiutoanimatore');

    container.innerHTML = lista.map((a, i) => {
        const isPodio = (i < 3 && searchTerm === "");
        const classePodio = isPodio ? (i===0 ? 'oro' : i===1 ? 'argento' : 'bronzo') : '';
        const medaglia = isPodio ? (i===0 ? '🥇' : i===1 ? '🥈' : '🥉') : '';
        
        return `
        <div class="card ${classePodio} bg-slate-800 p-5 rounded-[30px] mb-4 flex justify-between items-center shadow-lg border-2 border-transparent transition-all ${isAdmin ? 'active:scale-95 cursor-pointer hover:bg-slate-700' : ''}" onclick="${isAdmin ? `window.apriProfilo('${a.id}')` : ''}">
            <div class="flex items-center gap-5">
                <div class="text-3xl">${medaglia}</div>
                <div>
                    <h4 class="font-black text-lg uppercase leading-none" style="color: ${a.colore || '#ffffff'}">${escapeHtml(a.nome)} ${escapeHtml(a.cognome || '')}</h4>
                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${squadre.find(s => s.id === a.squadraId)?.nome || 'Senza Squadra'}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-amber-400 font-black text-3xl">${a.punti || 0}</div>
            </div>
        </div>`;
    }).join('');
};

// --- LOGICA MODALI ---

window.eliminaSquadra = async (id) => {
    if (confirm("Vuoi davvero eliminare questa squadra? Gli animatori associati rimarranno senza squadra.")) {
        await deleteDoc(doc(db, 'squadre', id));
    }
};

window.resetRemoto = async (id) => {
    if (confirm("Vuoi scollegare questo dispositivo? Il telefono dell'animatore tornerà alla schermata di login.")) {
        await updateDoc(doc(db, 'animatori', id), { sessionToken: "RESETPHONE_" + Math.random() });
    }
};

window.apriProfilo = (id) => {
    const a = animatori.find(x => x.id === id);
    if(!a) return;

    // Crea un livello a tutto schermo (Schermata Profilo)
    const profileScreen = document.createElement('div');
    profileScreen.className = 'fixed inset-0 bg-slate-900 z-[200] flex flex-col overflow-y-auto animate-fade-in';
    profileScreen.innerHTML = `
        <header class="bg-slate-800 px-6 py-5 shadow-xl flex items-center gap-4 sticky top-0 z-10 border-b border-slate-700">
            <button onclick="this.closest('.fixed').remove()" class="bg-slate-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-all">
                ⬅️
            </button>
            <div class="flex-1 overflow-hidden">
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Profilo Animatore</p>
                <h1 class="text-2xl font-black uppercase leading-none tracking-tight truncate" style="color: ${a.colore || '#ffffff'}">
                    ${escapeHtml(a.nome)} ${escapeHtml(a.cognome || '')}
                </h1>
            </div>
        </header>

        <div class="p-6 max-w-2xl mx-auto w-full flex flex-col gap-6 pb-20">
            
            <div class="bg-slate-800 rounded-[35px] p-8 shadow-xl border-2 border-slate-700 text-center relative">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Punteggio Attuale</p>
                <div class="text-7xl font-black text-amber-400 mb-8 drop-shadow-lg">${a.punti || 0}</div>
                
                <div class="bg-slate-900 rounded-3xl p-5 border border-slate-700/50">
                    <p class="text-[10px] text-slate-500 font-bold uppercase mb-4">Aggiungi / Rimuovi</p>
                    <div class="flex items-center gap-3">
                        <button id="mB" class="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-4 text-sm font-black rounded-2xl transition-colors uppercase tracking-widest border border-red-500/20 active:scale-95">- Punti</button>
                        <input type="number" id="puntiIn" placeholder="0" class="w-24 text-center text-3xl font-black bg-transparent border-none outline-none text-white placeholder:text-slate-700">
                        <button id="pB" class="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white py-4 text-sm font-black rounded-2xl transition-colors uppercase tracking-widest border border-green-500/20 active:scale-95">+ Punti</button>
                    </div>
                </div>
            </div>

            <div class="bg-slate-800 rounded-[35px] p-8 shadow-xl border-2 border-slate-700">
                <h3 class="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-slate-700 pb-3">Impostazioni</h3>
                
                <label class="block text-[10px] text-slate-400 font-black uppercase mb-2 ml-2">Squadra</label>
                <select id="sS" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white font-bold mb-6 appearance-none outline-none focus:border-amber-500">
                    <option value="">Nessuna squadra</option>
                    ${squadre.map(s => `<option value="${s.id}" ${a.squadraId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
                </select>

                <label class="block text-[10px] text-slate-400 font-black uppercase mb-2 ml-2">Colore Nome</label>
                <input type="color" id="colorIn" value="${a.colore || '#ffffff'}" class="w-full h-14 bg-slate-900 border-2 border-slate-700 rounded-2xl p-2 mb-8 cursor-pointer">

                <button id="saveInfoBtn" class="w-full bg-amber-500 text-slate-900 py-4 rounded-2xl font-black text-sm uppercase shadow-lg active:scale-95 transition-all">Salva Impostazioni</button>
            </div>

            <div class="mt-2 flex flex-col gap-3">
                <button onclick="window.resetRemoto('${a.id}'); this.closest('.fixed').remove();" class="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase border border-slate-700 hover:text-white active:scale-95 transition-all">Scollega Telefono Animatore</button>
                <button id="delBtn" class="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-xs uppercase border border-red-500/20 hover:bg-red-500 hover:text-white active:scale-95 transition-all">Elimina Profilo Definitivamente</button>
            </div>
        </div>
    `;
    document.body.appendChild(profileScreen);

    // Gestione aggiunta/rimozione punti (chiude la schermata dopo il salvataggio per mostrare la classifica aggiornata)
    const up = async (sgn) => {
        const val = parseInt(document.getElementById('puntiIn').value);
        if(isNaN(val) || val === 0) return alert("Inserisci un numero valido di punti");
        await updateDoc(doc(db, 'animatori', id), { 
            punti: (a.punti || 0) + (val * sgn), 
            squadraId: document.getElementById('sS').value || null,
            colore: document.getElementById('colorIn').value
        });
        profileScreen.remove();
    };

    document.getElementById('pB').onclick = () => up(1);
    document.getElementById('mB').onclick = () => up(-1);
    
    // Solo salvataggio info base (Colore e Squadra)
    document.getElementById('saveInfoBtn').onclick = async () => {
        await updateDoc(doc(db, 'animatori', id), { 
            squadraId: document.getElementById('sS').value || null,
            colore: document.getElementById('colorIn').value
        });
        profileScreen.remove();
    };

    // Eliminazione animatore
    document.getElementById('delBtn').onclick = async () => {
        if(confirm("Sei sicuro di voler eliminare definitivamente questo profilo?")) {
            await deleteDoc(doc(db, 'animatori', id));
            profileScreen.remove();
        }
    };
};

const apriModaleAggiungi = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-end';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-10 rounded-t-[50px] border-t-4 border-amber-500 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 class="text-xl font-black text-amber-400 mb-8 uppercase text-center tracking-widest">Nuovo Profilo</h2>
            <input type="text" id="nN" placeholder="Nome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white mb-4 outline-none focus:border-amber-500">
            <input type="text" id="nC" placeholder="Cognome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white mb-4 outline-none focus:border-amber-500">
            
            <select id="nR" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white font-bold mb-4 uppercase">
                <option value="animatore">Animatore</option>
                <option value="aiutoanimatore">Aiuto Animatore</option>
            </select>
            
            <select id="nS" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white font-bold mb-4">
                <option value="">Scegli Squadra...</option>
                ${squadre.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
            </select>

            <p class="text-[10px] text-slate-400 font-black uppercase mb-2 ml-2 text-left">Colore del Nome</p>
            <input type="color" id="nColor" value="#ffffff" class="w-full h-12 bg-slate-900 border-2 border-slate-700 rounded-2xl p-2 mb-10 cursor-pointer">
            
            <button id="saveNew" class="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-lg shadow-lg uppercase">Salva Animatore</button>
        </div>`;
    document.body.appendChild(overlay);
    
    document.getElementById('saveNew').onclick = async () => {
        const n = document.getElementById('nN').value.trim();
        const c = document.getElementById('nC').value.trim();
        const r = document.getElementById('nR').value;
        const s = document.getElementById('nS').value || null;
        const col = document.getElementById('nColor').value;
        if(n) { 
            await addDoc(animatoriRef, { nome: n, cognome: c, ruolo: r, squadraId: s, punti: 0, sessionToken: "", colore: col });
            overlay.remove(); 
        }
    };
};

const apriModaleLogin = () => {
    const p = prompt("Inserisci Password Master:");
    if(p === 'grest2026') { isAdmin = true; render(); }
};

// --- REALTIME SYNC ---
onSnapshot(query(animatoriRef, orderBy("punti", "desc")), (s) => { 
    animatori = s.docs.map(d => ({id: d.id, ...d.data()})); 
    render(); 
});
onSnapshot(squadreRef, (s) => { 
    squadre = s.docs.map(d => ({id: d.id, ...d.data()})); 
    aggiornaLista(); 
});

render();