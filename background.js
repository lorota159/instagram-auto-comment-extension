console.log('Background service worker carregado');

let isRunning = false;
let currentTimer = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Mensagem recebida:', request.action);
    
    if (request.action === 'startAutomation') {
        console.log('Iniciando automação...');
        isRunning = true;
        runAutomation();
        sendResponse({ success: true });
    } else if (request.action === 'stopAutomation') {
        console.log('Parando automação...');
        isRunning = false;
        if (currentTimer) clearTimeout(currentTimer);
        sendResponse({ success: true });
    }
});

function runAutomation() {
    chrome.storage.local.get(['profiles', 'comment', 'interval', 'running', 'currentIndex'], (result) => {
        if (!result.running || !isRunning) {
            console.log('Automação parada');
            return;
        }

        const profiles = result.profiles || [];
        let currentIndex = result.currentIndex || 0;

        console.log(`📊 Status: ${currentIndex}/${profiles.length} perfis processados`);

        if (currentIndex >= profiles.length) {
            console.log('✅ Todos os perfis foram processados!');
            chrome.storage.local.set({ running: false });
            return;
        }

        const profile = profiles[currentIndex];
        const profileUsername = profile.startsWith('@') ? profile.substring(1) : profile;
        const profileUrl = `https://www.instagram.com/${profileUsername}/`;

        console.log(`🔄 Processando ${profile} (${currentIndex + 1}/${profiles.length})`);

        // Abrir a aba do Instagram
        chrome.tabs.query({ url: '*://www.instagram.com/*' }, (tabs) => {
            if (tabs.length > 0) {
                // Usar aba existente
                console.log(`Atualizando aba existente: ${tabs[0].id}`);
                chrome.tabs.update(tabs[0].id, { url: profileUrl, active: true }, (tab) => {
                    agendarProcessamento(tab.id, profile, currentIndex, profiles, result.comment, result.interval);
                });
            } else {
                // Criar nova aba
                console.log('Criando nova aba');
                chrome.tabs.create({ url: profileUrl }, (tab) => {
                    agendarProcessamento(tab.id, profile, currentIndex, profiles, result.comment, result.interval);
                });
            }
        });
    });
}

function agendarProcessamento(tabId, profile, currentIndex, profiles, comment, interval) {
    console.log(`⏰ Agendando processamento de ${profile} em 10 segundos...`);
    
    // Aguardar 10 segundos para a página carregar completamente
    setTimeout(() => {
        console.log(`📤 Enviando mensagem para processar ${profile} na aba ${tabId}`);
        
        chrome.tabs.sendMessage(tabId, {
            action: 'processProfile',
            profile: profile,
            comment: comment
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('❌ Erro ao enviar mensagem:', chrome.runtime.lastError.message);
                // Incrementar contador mesmo com erro
                atualizarIndice(currentIndex, true);
            } else if (response && response.success) {
                console.log(`✅ ${profile} processado com sucesso`);
                // Incrementar contador de sucesso
                atualizarIndice(currentIndex, false);
            } else {
                console.log(`❌ Erro ao processar ${profile}`);
                // Incrementar contador de falha
                atualizarIndice(currentIndex, true);
            }

            // Agendar próximo perfil após o intervalo especificado
            console.log(`⏳ Agendando próximo perfil em ${interval} minuto(s)...`);
            currentTimer = setTimeout(() => {
                console.log('🔁 Iniciando próximo perfil...');
                runAutomation();
            }, interval * 60000); // Converter minutos para milissegundos
        });
    }, 10000); // 10 segundos de espera
}

function atualizarIndice(currentIndex, isFailed) {
    chrome.storage.local.get(['processedCount', 'failedCount'], (result) => {
        const newProcessed = isFailed ? result.processedCount || 0 : (result.processedCount || 0) + 1;
        const newFailed = isFailed ? (result.failedCount || 0) + 1 : result.failedCount || 0;

        chrome.storage.local.set({
            currentIndex: currentIndex + 1,
            processedCount: newProcessed,
            failedCount: newFailed
        }, () => {
            console.log(`📊 Atualizado: ${newProcessed} sucesso, ${newFailed} falhas`);
        });
    });
}
