document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('urlForm');
    const historyOutput = document.getElementById('historyOutput');
    const clearButton = document.getElementById('clearButton');
    const clearHistoryButton = document.getElementById('clearHistoryButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const successGif = document.getElementById('successGif');
    const copyGif = document.getElementById('copyGif');
    
    // Funções para salvar e carregar o estado do formulário
    function saveFormState() {
        const formData = {
            clientId: document.getElementById('clientId').value,
            leadId: document.getElementById('leadId').value,
            origem: document.getElementById('origem').value,
            destino: document.getElementById('destino').value,
            chave: document.getElementById('chave').value,
            hora: document.getElementById('hora').value,
            duracao: document.getElementById('duracao').value,
            platform: document.getElementById('platform').value,
        };
        localStorage.setItem('formState', JSON.stringify(formData));
    }

    function loadFormState() {
        const savedState = localStorage.getItem('formState');
        if (savedState) {
            const formData = JSON.parse(savedState);
            document.getElementById('clientId').value = formData.clientId;
            document.getElementById('leadId').value = formData.leadId;
            document.getElementById('origem').value = formData.origem;
            document.getElementById('destino').value = formData.destino;
            document.getElementById('chave').value = formData.chave;
            document.getElementById('hora').value = formData.hora;
            document.getElementById('duracao').value = formData.duracao;
            document.getElementById('platform').value = formData.platform;
        }
    }

    // Carregar o estado do formulário ao iniciar
    loadFormState();
    
    // Esconder o parágrafo "Nenhuma URL gerada ainda." se houver histórico no localStorage
    if (localStorage.getItem('chamadas')) {
        historyOutput.querySelector('p')?.classList.add('hidden');
    }
    
    // Adicionar listener para salvar o estado do formulário a cada alteração
    form.addEventListener('input', saveFormState);

    // Função para preencher a data com o dia de hoje
    function setDateToday() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById('data').value = `${yyyy}-${mm}-${dd}`;
    }

    // Função para validar a entrada e remover caracteres não numéricos e a letra 'e'
    function validateNumberInput(event) {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
    
    // Aplicar a validação aos campos ID do Cliente, LeadID, Origem, Destino e Duração
    document.getElementById('clientId').addEventListener('input', validateNumberInput);
    document.getElementById('leadId').addEventListener('input', validateNumberInput);
    document.getElementById('origem').addEventListener('input', validateNumberInput);
    document.getElementById('destino').addEventListener('input', validateNumberInput);
    document.getElementById('duracao').addEventListener('input', validateNumberInput);

    // Chamar a função para preencher a data ao carregar a página
    setDateToday();

    form.addEventListener('submit', (event) => {
        // Pega todos os valores do formulário
        const clientId = document.getElementById('clientId').value;
        const leadId = document.getElementById('leadId').value;
        const origem = document.getElementById('origem').value;
        const destino = document.getElementById('destino').value;
        const chave = document.getElementById('chave').value;
        const data = document.getElementById('data').value;
        const hora = document.getElementById('hora').value;
        const duracao = document.getElementById('duracao').value;
        const platform = document.getElementById('platform').value;

        // Formata a data para o formato YYYY/MM/DD
        const [ano, mes, dia] = data.split('-');
        const dataFormatada = `${ano}/${mes}/${dia}`;
        
        // Gerar a URL para verificação
        const baseUrl = `https://calls-${platform}.s3.amazonaws.com`;
        const urlFinal = `${baseUrl}/${dataFormatada}/${clientId}/${chave}.wav`;
        
        // CORRIGIDO: Verifica se a URL já existe no histórico baseada APENAS na chave
        let chamadas = JSON.parse(localStorage.getItem('chamadas') || '[]');
        const isDuplicate = chamadas.some(chamada => chamada.chave === chave);

        if (isDuplicate) {
            event.preventDefault(); // Impede o envio do formulário
            alert('Aaaah, tchê! Essa URL aí tu já gerou! Não vai de novo que nem gaúcho repetindo churrasco!');
            return; // Impede a execução do resto do código
        }

        // Se a validação do HTML5 passar e a URL não for duplicada,
        // o resto da lógica de submissão do formulário acontece aqui
        event.preventDefault();
        
        // Exibir GIF de sucesso
        successGif.classList.remove('hidden');

        // Adicionar um pequeno atraso para a animação do GIF
        setTimeout(() => {
            // Criar um objeto com os dados da chamada
            const chamada = {
                id: Date.now(), // ID único para o histórico
                clientId: clientId,
                leadId: leadId,
                origem: origem,
                destino: destino,
                chave: chave,
                data: data,
                hora: hora,
                duracao: duracao,
                platform: platform,
                url: urlFinal,
                datetime: new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace(',', ' -')
            };
            
            saveToHistory(chamada);
            displayHistory();

            successGif.classList.add('hidden');
            
        }, 1000); // Exibe o GIF por 1 segundo
    });

    // Função para salvar no Local Storage
    function saveToHistory(chamada) {
        let chamadas = JSON.parse(localStorage.getItem('chamadas') || '[]');
        chamadas.unshift(chamada);
        localStorage.setItem('chamadas', JSON.stringify(chamadas));
    }

    // Função para exibir o histórico
    function displayHistory() {
        let chamadas = JSON.parse(localStorage.getItem('chamadas') || '[]');
        
        // Remove o parágrafo "Nenhuma URL gerada ainda."
        historyOutput.querySelector('p')?.classList.add('hidden');
        historyOutput.innerHTML = '';
        
        chamadas.forEach((chamada) => {
            const urlBlock = document.createElement('div');
            urlBlock.className = 'url-block';
            
            urlBlock.innerHTML = `
                <div class="metadata-block">
                    <span class="id-label">${chamada.clientId}</span>
                    <span class="datetime-label">(${chamada.data} - ${chamada.hora} - ${chamada.platform.toUpperCase()})</span>
                </div>
                <div class="url-copia">${chamada.url}</div>
                <div class="url-buttons">
                    <button class="copy-btn copy-url" data-url="${chamada.url}">Copiar URL</button>
                    <button class="copy-btn copy-json" data-id="${chamada.id}">Copiar JSON</button>
                </div>
            `;
            historyOutput.appendChild(urlBlock);
        });
    }

    // Lida com os botões de copiar URL e JSON
    historyOutput.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-url')) {
            const url = event.target.dataset.url;
            navigator.clipboard.writeText(url)
                .then(() => {
                    event.target.textContent = 'URL Copiada!';
                    
                    // Exibir GIF de copiado
                    copyGif.classList.remove('hidden');

                    setTimeout(() => {
                        event.target.textContent = 'Copiar URL';
                        copyGif.classList.add('hidden');
                    }, 1000); // Esconde o GIF após 1 segundo
                })
                .catch(err => {
                    console.error('Erro ao copiar URL:', err);
                });
        }
        
        if (event.target.classList.contains('copy-json')) {
            const id = event.target.dataset.id;
            let chamadas = JSON.parse(localStorage.getItem('chamadas') || '[]');
            const chamada = chamadas.find(item => item.id == id);
            
            if (chamada) {
                // Formatação da data e hora
                const dtInicio = new Date(`${chamada.data}T${chamada.hora}`);
                dtInicio.setSeconds(0); // Garante que os segundos sejam 00
                
                // Cálculo da data e hora de fim
                const dtFim = new Date(dtInicio.getTime() + parseInt(chamada.duracao) * 1000);
                
                // Formata o JSON
                const jsonContent = {
                    "LeadId": parseInt(chamada.leadId),
                    "UrlLigacao": chamada.url,
                    "OrigemTel": chamada.origem,
                    "DestinoTel": chamada.destino,
                    "DtInicioChamada": dtInicio.toISOString().replace('T', ' ').substring(0, 19),
                    "DtFimChamada": dtFim.toISOString().replace('T', ' ').substring(0, 19),
                    "TempoConversacao": parseInt(chamada.duracao)
                };

                navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2))
                    .then(() => {
                        event.target.textContent = 'JSON Copiado!';

                        // Exibir GIF de copiado
                        copyGif.classList.remove('hidden');

                        setTimeout(() => {
                            event.target.textContent = 'Copiar JSON';
                            copyGif.classList.add('hidden');
                        }, 1000); // Esconde o GIF após 1 segundo
                    })
                    .catch(err => {
                        console.error('Erro ao copiar JSON:', err);
                    });
            }
        }
    });

    // Botão para limpar campos do formulário (sem validação)
    clearButton.addEventListener('click', () => {
        form.reset();
        localStorage.removeItem('formState');
        setDateToday();
    });

    // Botão para limpar histórico com dupla verificação
    clearHistoryButton.addEventListener('click', () => {
        const confirmMessage = 'ATENÇÃO!!!!!!!!!!!!!!!!!!!!!!!!!!\n\nObg pela atenção!\nBrinks, presta atenção, se vc limpar tudo vai perder a porra toda ein, confirma se vc já copiou o que precisa, se não vai ter que preencher tudo de novo e de novo e de novo e de novo.';
        if (confirm(confirmMessage)) {
            if (confirm('VOCÊ TEM CERTEZA?????!!!!!!')) {
                localStorage.removeItem('chamadas');
                historyOutput.innerHTML = '<p>Nenhuma URL gerada ainda.</p>';
            }
        }
    });

    // Botão para limpar tudo com dupla verificação
    clearAllButton.addEventListener('click', () => {
        const confirmMessage = 'ATENÇÃO!!!!!!!!!!!!!!!!!!!!!!!!!!\n\nObg pela atenção!\nBrinks, presta atenção, se vc limpar tudo vai perder a porra toda ein, confirma se vc já copiou o que precisa, se não vai ter que preencher tudo de novo e de novo e de novo e de novo.';
        if (confirm(confirmMessage)) {
            if (confirm('VOCÊ TEM CERTEZA?????!!!!!!')) {
                form.reset();
                localStorage.removeItem('chamadas');
                localStorage.removeItem('formState');
                historyOutput.innerHTML = '<p>Nenhuma URL gerada ainda.</p>';
                setDateToday();
            }
        }
    });
    
    // Carregar histórico ao iniciar
    displayHistory();
});