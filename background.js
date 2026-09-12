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

        if (currentIndex >= profiles.length) {
            console.log('✅ Todos os perfis foram processados!');
            chrome.storage.local.set({ running: false });
            return;
        }

        const profile = profiles[currentIndex];
        const profileUsername = profile.startsWith('@') ? profile.substring(1) : profile;
        const profileUrl = `https://www.instagram.com/${profileUsername}/`;

        console.log(`Processando ${profile} (${currentIndex + 1}/${profiles.length})`);

        // Abrir a aba do Instagram
        chrome.tabs.query({ url: '*://www.instagram.com/*' }, (tabs) => {
            if (tabs.length > 0) {
                // Usar aba existente
                chrome.tabs.update(tabs[0].id, { url: profileUrl, active: true }, (tab) => {
                    agendarProcessamento(tab.id, profile, currentIndex, profiles, result.comment, result.interval);
                });
            } else {
                // Criar nova aba
                chrome.tabs.create({ url: profileUrl }, (tab) => {
                    agendarProcessamento(tab.id, profile, currentIndex, profiles, result.comment, result.interval);
                });
            }
        });
    });
}

function agendarProcessamento(tabId, profile, currentIndex, profiles, comment, interval) {
    // Aguardar 8 segundos para a página carregar
    setTimeout(() => {
        console.log(`Enviando mensagem para processar ${profile}`);
        
        chrome.tabs.sendMessage(tabId, {
            action: 'processProfile',
            profile: profile,
            comment: comment
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Erro ao enviar mensagem:', chrome.runtime.lastError.message);
                chrome.storage.local.get(['failedCount'], (res) => {
                    chrome.storage.local.set({
                        currentIndex: currentIndex + 1,
                        failedCount: (res.failedCount || 0) + 1
                    });
                });
            } else if (response && response.success) {
                console.log(`✅ ${profile} processado com sucesso`);
                chrome.storage.local.get(['processedCount'], (res) => {
                    chrome.storage.local.set({
                        currentIndex: currentIndex + 1,
                        processedCount: (res.processedCount || 0) + 1
                    });
                });
            } else {
                console.log(`❌ Erro ao processar ${profile}`);
                chrome.storage.local.get(['failedCount'], (res) => {
                    chrome.storage.local.set({
                        currentIndex: currentIndex + 1,
                        failedCount: (res.failedCount || 0) + 1
                    });
                });
            }

            // Agendar próximo perfil
            currentTimer = setTimeout(() => {
                runAutomation();
            }, interval * 60000);
        });
    }, 8000);
}
