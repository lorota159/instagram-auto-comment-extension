document.addEventListener('DOMContentLoaded', function() {
    const profilesInput = document.getElementById('profilesList');
    const commentInput = document.getElementById('comment');
    const intervalInput = document.getElementById('interval');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const statusDiv = document.getElementById('status');
    const progressDiv = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');

    // Carregar dados salvos
    chrome.storage.local.get(['profiles', 'comment', 'interval', 'running'], (result) => {
        if (result.profiles) profilesInput.value = result.profiles.join('\n');
        if (result.comment) commentInput.value = result.comment;
        if (result.interval) intervalInput.value = result.interval;
        if (result.running) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            updateStatus();
        }
    });

    startBtn.addEventListener('click', () => {
        const profiles = profilesInput.value
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.startsWith('@') && p.length > 1);

        const comment = commentInput.value.trim();
        const interval = parseInt(intervalInput.value);

        if (profiles.length === 0) {
            showError('❌ Adicione pelo menos um perfil com @');
            return;
        }

        if (!comment) {
            showError('❌ Digite um comentário');
            return;
        }

        // Salvar dados
        chrome.storage.local.set({
            profiles,
            comment,
            interval,
            running: true,
            currentIndex: 0,
            processedCount: 0,
            failedCount: 0
        });

        startBtn.disabled = true;
        stopBtn.disabled = false;
        showStatus('✅ Iniciando automação...');
        
        // Iniciar o processo
        chrome.runtime.sendMessage({ action: 'startAutomation' }, (response) => {
            if (chrome.runtime.lastError) {
                showError('❌ Erro ao iniciar. Recargue a extensão.');
            }
        });
    });

    stopBtn.addEventListener('click', () => {
        chrome.storage.local.set({ running: false });
        chrome.runtime.sendMessage({ action: 'stopAutomation' }, () => {});
        startBtn.disabled = false;
        stopBtn.disabled = true;
        showStatus('⏹️ Automação parada', 'error');
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todos os dados?')) {
            profilesInput.value = '';
            commentInput.value = '';
            intervalInput.value = '5';
            statusDiv.innerHTML = '';
            progressDiv.innerHTML = '<div class="progress-bar"><div class="progress-bar-fill" id="progressBar"></div></div>';
            chrome.storage.local.clear();
        }
    });

    function showStatus(message, type = 'active') {
        statusDiv.innerHTML = message;
        statusDiv.className = 'status ' + type;
    }

    function showError(message) {
        showStatus(message, 'error');
    }

    function updateStatus() {
        chrome.storage.local.get(['profiles', 'currentIndex', 'processedCount', 'failedCount', 'running'], (result) => {
            if (result.running && result.profiles) {
                const current = result.currentIndex || 0;
                const processed = result.processedCount || 0;
                const failed = result.failedCount || 0;
                const total = result.profiles.length;
                const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

                showStatus(`⏳ Em andamento... ${processed} ✅ | ${failed} ❌`);
                
                // Atualizar barra de progresso
                const progressFill = document.getElementById('progressBar');
                if (progressFill) {
                    progressFill.style.width = percentage + '%';
                }
                
                progressDiv.innerHTML = `<div style="margin-bottom: 8px;">Progresso: ${processed}/${total} (${percentage}%)</div><div class="progress-bar"><div class="progress-bar-fill" id="progressBar" style="width: ${percentage}%"></div></div>`;
            }
        });
    }

    // Atualizar status a cada 2 segundos
    setInterval(updateStatus, 2000);
});
