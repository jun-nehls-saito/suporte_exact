// A base das suas URLs
const BASE_URL_VIP = "https://calls-vip.s3.amazonaws.com/";
const BASE_URL_GOSAT = "https://calls-gosat.com/";

// Variável global para rastrear o último botão de cópia clicado
let lastCopiedButton = null; 

// Variável para armazenar as URLs geradas na sessão (limpa ao recarregar a página)
let sessionHistory = [];

// AQUI COMEÇA A LÓGICA DE VALIDAÇÃO POR SENHA
const mainContainer = document.getElementById('mainContainer');
const senhaCorreta = "jun"; // Altere para a senha que você quiser!

// NOVO: Verifica se a senha já foi inserida nesta sessão
if (sessionStorage.getItem('acessoLiberado') === 'true') {
    mainContainer.classList.remove('hidden');
} else {
    let senhaUsuario = prompt("Por favor, digite a senha para acessar:");

    while (senhaUsuario !== senhaCorreta) {
        if (senhaUsuario === null) { // Usuário clicou em 'cancelar'
            // Opcionalmente, pode-se redirecionar ou mostrar uma mensagem
            alert("Acesso negado.");
            break; // Sai do loop para não pedir a senha infinitamente
        }
        senhaUsuario = prompt("Senha incorreta. Tente novamente:");
    }

    if (senhaUsuario === senhaCorreta) {
        // NOVO: Armazena a informação na sessão do navegador
        sessionStorage.setItem('acessoLiberado', 'true');
        mainContainer.classList.remove('hidden');
    }
}

// --- A PARTIR DAQUI, O RESTO DO SEU CÓDIGO PERMANECE O MESMO ---

// Pega referências para os elementos do HTML
const form = document.getElementById('urlForm');
const historyOutput = document.getElementById('historyOutput');
const clearButton = document.getElementById('clearButton');
const clearHistoryButton = document.getElementById('clearHistoryButton'); 
const clearAllButton = document.getElementById('clearAllButton'); 
const dataInput = document.getElementById('data');
const timeInput = document.getElementById('hora'); 
const clientIdInput = document.getElementById('clientId');
const chaveInput = document.getElementById('chave');
const duracaoInput = document.getElementById('duracao');
const successGif = document.getElementById('successGif'); 
const platformInput = document.getElementById('platform');

const STORAGE_KEY_FORM = 'urlFormState';
const STORAGE_KEY_HISTORY = 'urlHistoryState';


// NOVO: LÓGICA PARA PERMITIR APENAS NÚMEROS NO CAMPO 'ID do Cliente'
clientIdInput.addEventListener('keypress', function(event) {
    // Permite apenas caracteres numéricos (0-9)
    if (event.key < '0' || event.key > '9') {
        event.preventDefault();
    }
});

// NOVO: LÓGICA PARA LIMITAR O CAMPO 'ID do Cliente' a 5 dígitos
clientIdInput.addEventListener('input', function() {
    if (this.value.length > 5) {
        this.value = this.value.slice(0, 5);
    }
});


// --- LÓGICA DE PERSISTÊNCIA ---

// 1. FUNÇÃO PARA SALVAR O ESTADO DO FORMULÁRIO
function saveFormState() {
    const formState = {
        clientId: clientIdInput.value,
        chave: chaveInput.value,
        data: dataInput.value,
        hora: timeInput.value,
        duracao: duracaoInput.value,
        platform: platformInput.value
    };
    localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(formState));
}

// 2. FUNÇÃO PARA CARREGAR O ESTADO DO FORMULÁRIO
function loadFormState() {
    const savedState = localStorage.getItem(STORAGE_KEY_FORM);
    if (savedState) {
        const formState = JSON.parse(savedState);
        clientIdInput.value = formState.clientId || '';
        chaveInput.value = formState.chave || '';
        dataInput.value = formState.data || '';
        timeInput.value = formState.hora || '';
        duracaoInput.value = formState.duracao || '';
        platformInput.value = formState.platform || '';
    }
}

// 3. FUNÇÃO PARA CARREGAR E EXIBIR O HISTÓRICO
function loadHistory() {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
        historyOutput.innerHTML = ''; // Limpa a área para evitar duplicação
        const historyArray = JSON.parse(savedHistory);
        
        historyArray.forEach(item => {
             addUrlBlockToDOM(item.url, item.clientId, item.data, item.hora);
        });
    } else {
        historyOutput.innerHTML = '<p>Nenhuma URL gerada ainda.</p>';
    }
}

// 4. FUNÇÃO PARA ADICIONAR UM ITEM AO HISTÓRICO SALVO
function saveHistoryItem(url, clientId, data, hora) {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    let historyArray = savedHistory ? JSON.parse(savedHistory) : [];

    historyArray.unshift({
        clientId: clientId,
        url: url,
        data: data, // Salvando a data
        hora: hora, // Salvando a hora
        timestamp: new Date().getTime() 
    });
    
    // Limitar o histórico a 20 itens
    if (historyArray.length > 20) {
        historyArray = historyArray.slice(0, 20);
    }
    
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyArray));
}

// Ouve as mudanças nos campos para salvar o estado a cada digitação
form.addEventListener('input', saveFormState);

// Chama as funções para carregar o estado e o histórico ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    loadFormState();
    loadHistory();
    setTodayDate(); 
});


// --- LÓGICA DOS BOTÕES DE LIMPEZA ---
clearHistoryButton.addEventListener('click', function() {
    // NOVA REGRA: Não exibe alerta se não houver URLs geradas
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!savedHistory || JSON.parse(savedHistory).length === 0) {
        return; 
    }
    
    alert("ATENÇÃO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\nObg pela atenção!\nBrinks, presta atenção, se vc limpar tudo vai perder a porra toda ein, confirma se vc já copiou o que precisa, se não vai ter que preencher tudo de novo e de novo e de novo e de novo.");

    if (confirm("Você tem certeza?")) {
        historyOutput.innerHTML = '<p>Nenhuma URL gerada ainda.</p>';
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        lastCopiedButton = null; 
    }
});

// --- LÓGICA DO NOVO BOTÃO: LIMPAR A PORRA TODA ---
clearAllButton.addEventListener('click', function() {
    // NOVA REGRA: Não exibe alerta se o formulário estiver vazio
    if (isFormEmpty()) {
        return;
    }
    
    alert("ATENÇÃO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\nObg pela atenção!\nBrinks, presta atenção, se vc limpar tudo vai perder a porra toda ein, confirma se vc já copiou o que precisa, se não vai ter que preencher tudo de novo e de novo e de novo e de novo.");

    if (confirm("Você tem certeza disso????????????")) {
        localStorage.removeItem(STORAGE_KEY_HISTORY); 
        historyOutput.innerHTML = '<p>Nenhuma URL gerada ainda.</p>';
        lastCopiedButton = null; 
        sessionHistory = []; 
        form.reset(); 
        setTodayDate(); 
        saveFormState(); 
        
        // NOVO: Remove a flag de acesso liberado da sessão
        sessionStorage.removeItem('acessoLiberado');
    }
});


// --- FUNÇÕES DE UTENSÍLIOS E VALIDAÇÃO ---

// NOVA FUNÇÃO: Checa se o formulário está vazio (ignora a data padrão)
function isFormEmpty() {
    const defaultDate = dataInput.value;
    const clientIdEmpty = clientIdInput.value.trim() === '';
    const chaveEmpty = chaveInput.value.trim() === '';
    const timeEmpty = timeInput.value.trim() === '';
    const duracaoEmpty = duracaoInput.value.trim() === '';
    const platformEmpty = platformInput.value.trim() === '';

    return clientIdEmpty && chaveEmpty && timeEmpty && duracaoEmpty && platformEmpty;
}

// FUNÇÃO PARA DEFINIR A DATA ATUAL (Preenchimento Padrão)
function setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDateFormatted = `${year}-${month}-${day}`;
    
    if (!dataInput.value) {
        dataInput.value = todayDateFormatted;
    }
}

// FUNÇÃO DE VALIDAÇÃO (Garantir 5 dígitos numéricos)
function validateClientId(id) {
    const regex = /^\d{5}$/;
    if (!regex.test(id)) {
        alert('ERRO: O ID do Cliente deve ter exatamente 5 dígitos.');
        return false;
    }
    return true;
}

// LÓGICA DE BLOQUEIO DE ENTRADA MANUAL DE DATA
dataInput.addEventListener('input', function() {
    if (this.value.length > 10) {
         this.value = this.value.substring(0, 10);
    }
});


// --- FUNÇÃO PRINCIPAL DE GERAÇÃO DA URL (LÓGICA DO GIF) ---
form.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    // Validação de campos vazios
    if (clientIdInput.value.trim() === '' || chaveInput.value.trim() === '' || dataInput.value.trim() === '' || timeInput.value.trim() === '' || duracaoInput.value.trim() === '' || platformInput.value.trim() === '') {
        alert('Ta achando que eu sou o Akinator e tenho bola de cristal? Preenche todos os campos ae pow!');
        return; 
    }

    const clientId = clientIdInput.value; 
    const chaveCompleta = chaveInput.value;
    const data = dataInput.value; 
    const hora = timeInput.value; 
    const duracao = duracaoInput.value;
    const platform = platformInput.value;

    const newEntry = `${clientId}-${chaveCompleta}-${data}-${hora}`;
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    const historyArray = savedHistory ? JSON.parse(savedHistory) : [];
    
    const savedEntries = historyArray.map(item => {
        const itemDate = item.data;
        const itemHour = item.hora;
        return `${item.clientId}-${chaveCompleta}-${itemDate}-${itemHour}`;
    });

    if (sessionHistory.includes(newEntry) || savedEntries.includes(newEntry)) {
        alert("Mas bah, oooo meo, presta atenção que tu já gerou essa url, barbaridade tchê!");
        return;
    }
    
    if (!data || data.length < 8) { 
        alert('Ta achando que eu sou o Akinator e tenho bola de cristal? Preenche todos os campos ae pow!');
        return; 
    }
    if (!hora || hora.length < 5) { 
        alert('Ta achando que eu sou o Akinator e tenho bola de cristal? Preenche todos os campos ae pow!');
        return; 
    }
    if (!validateClientId(clientId)) {
        return; 
    }
    
    let baseURL;
    if (platform === 'vip') {
        baseURL = BASE_URL_VIP;
    } else if (platform === 'gosat') {
        baseURL = BASE_URL_GOSAT;
    }

    const partesData = data.split('-'); 
    const ano = partesData[0];
    const mes = partesData[1];
    const dia = partesData[2];
    
    const partesHora = hora.split(':');
    const horaFormatada = partesHora[0];
    const minutoFormatado = partesHora[1];

    const caminhoData = `${ano}/${mes}/${dia}`; 
    const prefixoChave = `${ano}${mes}${dia}_${horaFormatada}${minutoFormatado}00`; 

    const indicePrimeiroUnderline = chaveCompleta.indexOf('_');
    const indiceSegundoUnderline = chaveCompleta.indexOf('_', indicePrimeiroUnderline + 1);

    const sufixoChave = indiceSegundoUnderline > -1 ? chaveCompleta.substring(indiceSegundoUnderline) : '';
    const nomeArquivo = `${prefixoChave}${sufixoChave}`;

    const finalUrl = `${baseURL}${caminhoData}/${clientId}/${nomeArquivo}.wav`;

    sessionHistory.push(newEntry);
    
    saveHistoryItem(finalUrl, clientId, data, hora); 
    addUrlBlockToDOM(finalUrl, clientId, data, hora);

    successGif.classList.remove('hidden'); 
    
    setTimeout(() => {
        successGif.classList.add('hidden');
    }, 1000);
});


// --- FUNÇÃO DE CRIAÇÃO DO BLOCO DE URL ---
function addUrlBlockToDOM(url, clientId, data, hora) {
    
    Array.from(historyOutput.children).forEach(child => {
        if (child.tagName === 'P' && child.textContent.trim() === 'Nenhuma URL gerada ainda.') {
            historyOutput.removeChild(child);
        }
    });

    const block = document.createElement('div');
    block.className = 'url-block'; 

    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'metadata-block';
    
    const idSpan = document.createElement('span');
    idSpan.className = 'id-label';
    idSpan.textContent = clientId; 

    const dateTimeSpan = document.createElement('span');
    dateTimeSpan.className = 'datetime-label';
    const partesData = data.split('-');
    const diaMes = `${partesData[2]}/${partesData[1]}`;
    const provedor = url.includes(BASE_URL_VIP) ? 'VIP' : 'Gosat';
    dateTimeSpan.textContent = `(${diaMes} - ${hora} - ${provedor})`;
    
    metadataDiv.appendChild(idSpan);
    metadataDiv.appendChild(dateTimeSpan);
    
    const urlP = document.createElement('p');
    urlP.className = 'url-copia';
    urlP.textContent = url;
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copiar';
    copyBtn.className = 'copy-btn';
    
    copyBtn.addEventListener('click', function() {
        
        if (lastCopiedButton && lastCopiedButton !== this) {
            lastCopiedButton.textContent = 'Copiar';
            lastCopiedButton.style.backgroundColor = 'var(--color-copy-button)';
            lastCopiedButton.style.color = 'var(--color-primary)';
        }

        navigator.clipboard.writeText(url)
            .then(() => {
                this.textContent = 'Eeeeeita como copia URL';
                this.style.backgroundColor = 'var(--color-primary)';
                this.style.color = 'white';
                lastCopiedButton = this;
            })
            .catch(err => {
                console.error('Erro ao copiar a URL: ', err);
                alert('Não foi possível copiar.');
                this.textContent = 'Erro ao copiar!';
                this.style.backgroundColor = 'var(--color-copy-button)';
                this.style.color = 'var(--color-primary)';
            });
    });

    block.appendChild(metadataDiv);
    block.appendChild(urlP);
    block.appendChild(copyBtn);
    
    historyOutput.prepend(block);
}


// --- FUNÇÃO DE LIMPEZA GERAL ---
clearButton.addEventListener('click', function() {
    // NOVA REGRA: não faz nada se o formulário já estiver vazio
    if (isFormEmpty()) {
        return; 
    }
    form.reset(); 
    setTodayDate(); 
    saveFormState(); 
});