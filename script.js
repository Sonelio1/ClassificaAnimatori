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

// Lista pulita dai duplicati 
const LISTA_INIZIALE = [
    { Nome: "Thomas", Cognome: "Avezzu", Ruolo: "Animatore" },
    { Nome: "Samuele", Cognome: "Avezzù", Ruolo: "Animatore" },
    { Nome: "Elisa", Cognome: "Bacciu", Ruolo: "Animatore" },
    { Nome: "Agnese", Cognome: "Boetto", Ruolo: "Animatore" },
    { Nome: "Gemma", Cognome: "Borella", Ruolo: "Animatore" },
    { Nome: "Mario", Cognome: "Cecconello", Ruolo: "Animatore" },
    { Nome: "Anna", Cognome: "Crepaldi", Ruolo: "Animatore" },
    { Nome: "Francesca", Cognome: "Dall'Osso", Ruolo: "Animatore" },
    { Nome: "Gabriel", Cognome: "Destro", Ruolo: "Animatore" },
    { Nome: "Giorgia", Cognome: "Destro", Ruolo: "Animatore" },
    { Nome: "Alex", Cognome: "Ferrarese", Ruolo: "Animatore" },
    { Nome: "Vittoria", Cognome: "Filippi", Ruolo: "Animatore" },
    { Nome: "Sofia", Cognome: "Gorgolani", Ruolo: "Animatore" },
    { Nome: "Alberto", Cognome: "Granata", Ruolo: "Animatore" },
    { Nome: "Elena", Cognome: "Grandis", Ruolo: "Animatore" },
    { Nome: "Giacomo", Cognome: "Mantoan", Ruolo: "Animatore" },
    { Nome: "Matilde", Cognome: "Mattiazzi", Ruolo: "Animatore" },
    { Nome: "Viola", Cognome: "Meneghetti", Ruolo: "Animatore" },
    { Nome: "Denny", Cognome: "Miotto", Ruolo: "Animatore" },
    { Nome: "Andrea", Cognome: "Moschini", Ruolo: "Animatore" },
    { Nome: "Sofia", Cognome: "Nalin", Ruolo: "Animatore" },
    { Nome: "Adele", Cognome: "Niola", Ruolo: "Animatore" },
    { Nome: "Letizia", Cognome: "Padovani", Ruolo: "Animatore" },
    { Nome: "Eva", Cognome: "Perazzolo", Ruolo: "Animatore" },
    { Nome: "Ambra", Cognome: "Piva", Ruolo: "Animatore" },
    { Nome: "Tommaso", Cognome: "Santato", Ruolo: "Animatore" },
    { Nome: "Samuele", Cognome: "Scalabrin", Ruolo: "Animatore" },
    { Nome: "Riccardo", Cognome: "Sella", Ruolo: "Animatore" },
    { Nome: "Maddalena", Cognome: "Soprana", Ruolo: "Animatore" },
    { Nome: "Emma", Cognome: "Tosin", Ruolo: "Animatore" },
    { Nome: "Caterina", Cognome: "Uccellatori", Ruolo: "Animatore" },
    { Nome: "Marco", Cognome: "Vallese", Ruolo: "Animatore" },
    { Nome: "Viola", Cognome: "Vitulo", Ruolo: "Animatore" },
    { Nome: "Arianna", Cognome: "Voltan", Ruolo: "Animatore" },
    { Nome: "Anna", Cognome: "Zampieri", Ruolo: "Animatore" },
    { Nome: "Camilla", Cognome: "Zulian", Ruolo: "Animatore" },
    { Nome: "Melissa", Cognome: "Zulian", Ruolo: "Animatore" },
    { Nome: "Sara", Cognome: "Bertaggia", Ruolo: "Animatore" },
    { Nome: "Filippo", Cognome: "Berto", Ruolo: "Animatore" },
    { Nome: "Elisa", Cognome: "Birolo", Ruolo: "Animatore" },
    { Nome: "Diego", Cognome: "Cominato", Ruolo: "Animatore" },
    { Nome: "Diego", Cognome: "Dainese", Ruolo: "Animatore" },
    { Nome: "Antonio", Cognome: "Priore", Ruolo: "Animatore" },
    { Nome: "Sofia", Cognome: "Vettorello", Ruolo: "Animatore" },
    { Nome: "Kevin", Cognome: "Falasco", Ruolo: "Animatore" },
    { Nome: "Emma", Cognome: "Ferro", Ruolo: "Animatore" },
    { Nome: "Tommaso", Cognome: "Frigato", Ruolo: "Animatore" },
    { Nome: "Pietro", Cognome: "Lunardi", Ruolo: "Animatore" },
    { Nome: "Alice", Cognome: "Nalin", Ruolo: "Animatore" },
    { Nome: "Alessandro", Cognome: "Niola", Ruolo: "Animatore" },
    { Nome: "Giovanni", Cognome: "Suardelli", Ruolo: "Animatore" },
    { Nome: "Riccardo", Cognome: "Viola", Ruolo: "Animatore" },
    { Nome: "Viola", Cognome: "Andreetta", Ruolo: "Aiuto Animatore" },
    { Nome: "Christian", Cognome: "Bassan", Ruolo: "Aiuto Animatore" },
    { Nome: "Martina", Cognome: "Bazzan", Ruolo: "Aiuto Animatore" },
    { Nome: "Benedetta", Cognome: "Bergo", Ruolo: "Aiuto Animatore" },
    { Nome: "Laura", Cognome: "Birolo", Ruolo: "Aiuto Animatore" },
    { Nome: "Elisa", Cognome: "Bondesan", Ruolo: "Aiuto Animatore" },
    { Nome: "Asia", Cognome: "Broggio", Ruolo: "Aiuto Animatore" },
    { Nome: "Bajram", Cognome: "Bunjaku", Ruolo: "Aiuto Animatore" },
    { Nome: "Sofia", Cognome: "Cassetta", Ruolo: "Aiuto Animatore" },
    { Nome: "Nicola", Cognome: "Cassetta", Ruolo: "Aiuto Animatore" },
    { Nome: "Asmaa", Cognome: "Chafi", Ruolo: "Aiuto Animatore" },
    { Nome: "Maria Ginevra", Cognome: "Ciaccia", Ruolo: "Aiuto Animatore" },
    { Nome: "Giulia", Cognome: "Crivellaro", Ruolo: "Aiuto Animatore" },
    { Nome: "Alice", Cognome: "Ferrarese", Ruolo: "Aiuto Animatore" },
    { Nome: "Ashley", Cognome: "Fogo", Ruolo: "Aiuto Animatore" },
    { Nome: "Matilde", Cognome: "Fontolan", Ruolo: "Aiuto Animatore" },
    { Nome: "Pietro", Cognome: "Gnocco", Ruolo: "Aiuto Animatore" },
    { Nome: "Cloe Diletta", Cognome: "Gradara", Ruolo: "Aiuto Animatore" },
    { Nome: "Marco", Cognome: "Grisotto", Ruolo: "Aiuto Animatore" },
    { Nome: "Zilin", Cognome: "Guo", Ruolo: "Aiuto Animatore" },
    { Nome: "Bianca", Cognome: "Longhin", Ruolo: "Aiuto Animatore" },
    { Nome: "Michele", Cognome: "Lunardi", Ruolo: "Aiuto Animatore" },
    { Nome: "Adam", Cognome: "Machhour", Ruolo: "Aiuto Animatore" },
    { Nome: "Angelica", Cognome: "Migliorini", Ruolo: "Aiuto Animatore" },
    { Nome: "Iris", Cognome: "Olante", Ruolo: "Aiuto Animatore" },
    { Nome: "Erik", Cognome: "Roccatello", Ruolo: "Aiuto Animatore" },
    { Nome: "Pietro", Cognome: "Rossi", Ruolo: "Aiuto Animatore" },
    { Nome: "Stefano", Cognome: "Sgobbi", Ruolo: "Aiuto Animatore" },
    { Nome: "Lorenzo", Cognome: "Soncin", Ruolo: "Aiuto Animatore" },
    { Nome: "Emma", Cognome: "Tasso", Ruolo: "Aiuto Animatore" },
    { Nome: "Marco", Cognome: "Tordin", Ruolo: "Aiuto Animatore" },
    { Nome: "Rebecca", Cognome: "Vallese", Ruolo: "Aiuto Animatore" },
    { Nome: "Gianluca", Cognome: "Visentin", Ruolo: "Aiuto Animatore" },
    { Nome: "Asia", Cognome: "Zanardo", Ruolo: "Aiuto Animatore" },
    { Nome: "Onisiana", Cognome: "Zyba", Ruolo: "Aiuto Animatore" },
    { Nome: "Anna", Cognome: "Patrese", Ruolo: "Aiuto Animatore" },
    { Nome: "Jacopo", Cognome: "Lissandrin", Ruolo: "Aiuto Animatore" },
    { Nome: "Luca", Cognome: "Lunardi", Ruolo: "Aiuto Animatore" }
];

// Funzione Admin per eseguire il reset e importare la nuova lista
window.resetEImportaDatabase = async () => {
    if(!confirm("ATTENZIONE: Stai per eliminare tutti i dati e importare la nuova lista. Procedere?")) return;
    
    // Cancella esistenti
    const snapshot = await getDocs(animatoriRef);
    for (const docSnap of snapshot.docs) { await deleteDoc(docSnap.ref); }
    
    // Carica nuovi
    for (const a of LISTA_INIZIALE) {
        await addDoc(animatoriRef, { 
            nome: a.Nome, 
            cognome: a.Cognome, 
            ruolo: a.Ruolo, 
            squadraId: null, 
            punti: 0, 
            sessionToken: "", 
            colore: '#ffffff' 
        });
    }
    alert("Database aggiornato con successo!");
};

let isAdmin = false;
let animatori = [];
let squadre = [];
let searchTerm = "";
let currentTab = 'tutti';

// Palette colori per nomi animatori (visibili su sfondo scuro)
const coloriAnimatori = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFD93D', '#DDA0DD', '#FF8C42', '#6BCB77',
    '#AEDEFC', '#FFB3B3', '#C9B1FF', '#FFCF9A'
];
const COLORE_DEFAULT = '#ffffff';

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
                    <div class="bg-amber-500 text-slate-900 h-14 w-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-lg">${s.punti}</div>
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
        <div class="card ${classePodio} bg-slate-800 p-5 rounded-[30px] mb-4 flex justify-between items-center shadow-lg border-2 border-transparent transition-all active:scale-95" onclick="${isAdmin ? `window.apriProfilo('${a.id}')` : ''}">
            <div class="flex items-center gap-5">
                <div class="text-3xl">${medaglia}</div>
                <div>
                    <h4 style="color: ${a.colore || COLORE_DEFAULT}" class="font-black text-lg uppercase leading-none">${escapeHtml(a.nome)} ${escapeHtml(a.cognome || '')}</h4>
                    <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${squadre.find(s => s.id === a.squadraId)?.nome || 'Senza Squadra'}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-amber-400 font-black text-3xl">${a.punti || 0}</div>
                ${isAdmin ? `
                    <button onclick="event.stopPropagation(); window.resetRemoto('${a.id}')" class="bg-red-500/10 text-red-500 p-3 rounded-2xl text-[9px] font-black uppercase border border-red-500/20">Reset</button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
};

// --- LOGICA MODALI ---

window.resetRemoto = async (id) => {
    if (confirm("Vuoi scollegare questo dispositivo? Il telefono dell'animatore tornerà alla schermata di login.")) {
        await updateDoc(doc(db, 'animatori', id), { sessionToken: "RESETPHONE_" + Math.random() });
    }
};

window.apriProfilo = (id) => {
    const a = animatori.find(x => x.id === id);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <h2 class="text-sm font-black text-amber-500 uppercase mb-4 text-center tracking-tight">${a.nome}</h2>
            
            <div class="bg-slate-900 p-3 rounded-lg mb-4 text-center border border-slate-700">
                <p class="text-[9px] text-slate-500 font-bold uppercase mb-2">Inserisci Punti</p>
                <input type="number" id="puntiIn" placeholder="0" class="text-center text-2xl font-black mb-3 bg-transparent border-none outline-none">
                
                <div class="flex gap-2">
                    <button id="mB" class="flex-1 bg-red-600/80 hover:bg-red-600 py-2 text-[10px] font-bold rounded transition-colors uppercase tracking-tighter">- punti</button>
                    <button id="pB" class="flex-1 bg-green-600/80 hover:bg-green-600 py-2 text-[10px] font-bold rounded transition-colors uppercase tracking-tighter">+ punti</button>
                </div>
            </div>

            <p class="text-[9px] text-slate-500 font-bold uppercase mb-1 ml-1">Squadra</p>
            <select id="sS" class="mb-6 text-xs p-2">
                <option value="">Nessuna squadra</option>
                ${squadre.map(s => `<option value="${s.id}" ${a.squadraId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
            </select>

            ${isAdmin ? `
            <p class="text-[9px] text-slate-500 font-bold uppercase mb-2 ml-1">Colore Nome</p>
            <div id="colorPicker" class="flex flex-wrap gap-2 mb-4" style="max-height: 120px; overflow-y: auto;">
                ${coloriAnimatori.map(c => `
                    <button type="button" class="color-btn w-8 h-8 rounded-full border-2 transition-all ${a.colore === c ? 'border-amber-500 scale-110' : 'border-slate-600'}" style="background: ${c}" data-color="${c}" title="${c}"></button>
                `).join('')}
            </div>
            ` : ''}

            <div class="flex flex-col gap-2">
                <button onclick="this.closest('.modal-overlay').remove()" class="w-full bg-slate-700 py-2 text-[9px] font-bold uppercase rounded">Annulla</button>
                <button id="delBtn" class="text-[8px] text-red-500/50 hover:text-red-500 font-bold uppercase mt-2 transition-colors">Elimina Animatore</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    let selectedColor = a.colore || COLORE_DEFAULT;
    if (isAdmin) {
        document.querySelectorAll('#colorPicker .color-btn').forEach(btn => {
            btn.onclick = () => {
                selectedColor = btn.dataset.color;
                document.querySelectorAll('#colorPicker .color-btn').forEach(b => b.classList.remove('border-amber-500', 'scale-110'));
                btn.classList.add('border-amber-500', 'scale-110');
            };
        });
    }

    const up = async (sgn) => {
        const v = parseInt(document.getElementById('puntiIn').value);
        if(isNaN(v)) return alert("Inserisci un numero");
        await updateDoc(doc(db, 'animatori', id), { 
            punti: (a.punti || 0) + (v * sgn), 
            squadraId: document.getElementById('sS').value || null,
            colore: selectedColor
        });
        overlay.remove();
    };

    document.getElementById('pB').onclick = () => up(1);
    document.getElementById('mB').onclick = () => up(-1);
    document.getElementById('delBtn').onclick = async () => {
        if(confirm("Sei sicuro di voler eliminare questo profilo?")) {
            await deleteDoc(doc(db, 'animatori', id));
            overlay.remove();
        }
    };
};

const apriModaleAggiungi = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/80 z-[200] flex items-end';
    overlay.innerHTML = `
        <div class="bg-slate-800 w-full p-10 rounded-t-[50px] border-t-4 border-amber-500 shadow-2xl">
            <h2 class="text-xl font-black text-amber-400 mb-8 uppercase text-center tracking-widest">Nuovo Profilo</h2>
            <input type="text" id="nN" placeholder="Nome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white mb-4 outline-none focus:border-amber-500">
            <input type="text" id="nC" placeholder="Cognome" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white mb-4 outline-none focus:border-amber-500">
            <select id="nR" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white font-bold mb-4 uppercase">
                <option value="animatore">Animatore</option>
                <option value="aiutoanimatore">Aiuto Animatore</option>
            </select>
            <select id="nS" class="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 text-white font-bold mb-10">
                <option value="">Scegli Squadra...</option>
                ${squadre.map(s => `<option value="${s.id}">${s.nome}</option>`).join('')}
            </select>
            <button id="saveNew" class="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-lg shadow-lg uppercase">Salva Animatore</button>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('saveNew').onclick = async () => {
        const n = document.getElementById('nN').value.trim();
        const c = document.getElementById('nC').value.trim();
        const r = document.getElementById('nR').value;
        const s = document.getElementById('nS').value || null;
        if(n) { 
            await addDoc(animatoriRef, { nome: n, cognome: c, ruolo: r, squadraId: s, punti: 0, sessionToken: "", colore: COLORE_DEFAULT });
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