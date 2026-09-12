console.log('✅ Content script do Instagram carregado!');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Mensagem recebida no content script:', request.action);
    
    if (request.action === 'processProfile') {
        console.log('Começando a processar perfil:', request.profile);
        
        processarPerfil(request.profile, request.comment)
            .then(resultado => {
                console.log('Resultado final:', resultado);
                sendResponse({ success: resultado });
            })
            .catch(erro => {
                console.error('Erro no content script:', erro);
                sendResponse({ success: false });
            });
        
        return true; // Manter o canal aberto
    }
});

async function processarPerfil(profile, comentario) {
    try {
        console.log('📍 Etapa 1: Aguardando carregamento da página...');
        await aguardar(5000);

        // Encontrar posts
        console.log('📍 Etapa 2: Procurando por posts...');
        const posts = document.querySelectorAll('a[href*="/p/"]');
        console.log(`Encontrados ${posts.length} posts`);

        if (posts.length === 0) {
            console.log('❌ Nenhum post encontrado');
            return false;
        }

        // Selecionar aleatório
        const indiceAleatorio = Math.floor(Math.random() * posts.length);
        const postSelecionado = posts[indiceAleatorio];
        
        console.log(`📍 Etapa 3: Clicando no post ${indiceAleatorio + 1}/${posts.length}...`);
        postSelecionado.click();

        // Aguardar abertura do post
        await aguardar(4000);

        // Rolar até encontrar campo de comentário
        console.log('📍 Etapa 4: Procurando campo de comentário...');
        window.scrollTo(0, document.body.scrollHeight);
        await aguardar(2000);

        // Encontrar textarea
        let textarea = document.querySelector('textarea');
        
        if (!textarea) {
            console.log('⚠️ Textarea não encontrado, procurando alternativas...');
            
            // Procurar por placeholder ou aria-label
            textarea = document.querySelector('textarea[placeholder*="comment"]') ||
                      document.querySelector('textarea[aria-label*="comment"]') ||
                      document.querySelector('[contenteditable="true"]');
        }

        if (!textarea) {
            console.log('❌ Campo de comentário não encontrado');
            return false;
        }

        console.log('✅ Campo de comentário encontrado!');

        // Focar e clicar
        console.log('📍 Etapa 5: Focando no campo...');
        textarea.focus();
        textarea.click();
        await aguardar(1000);

        // Digitar comentário
        console.log('📍 Etapa 6: Digitando comentário...');
        textarea.value = comentario;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log(`Comentário digitado: "${comentario}"`);
        await aguardar(1500);

        // Encontrar botão de envio
        console.log('📍 Etapa 7: Procurando botão de envio...');
        const botaoEnviado = await encontrarEClicarBotao();
        
        if (!botaoEnviado) {
            console.log('❌ Botão de envio não encontrado');
            return false;
        }

        console.log('✅ Comentário enviado com sucesso!');
        await aguardar(2000);
        return true;

    } catch (erro) {
        console.error('❌ Erro durante processamento:', erro.message);
        console.error('Stack:', erro.stack);
        return false;
    }
}

async function encontrarEClicarBotao() {
    try {
        console.log('Procurando botão POST...');
        
        // Estratégia 1: Procurar por buttons normais
        const buttons = document.querySelectorAll('button');
        console.log(`Total de <button>: ${buttons.length}`);
        
        for (let botao of buttons) {
            const texto = botao.textContent.trim().toLowerCase();
            
            if ((texto === 'post' || texto === 'postar' || texto === 'send' || texto === 'enviar') && !botao.disabled) {
                if (botao.offsetParent !== null) {
                    console.log(`✅ Botão <button> encontrado: "${texto}"`);
                    botao.click();
                    await aguardar(500);
                    return true;
                }
            }
        }

        // Estratégia 2: Procurar por div com role="button" (Instagram pode usar isso)
        console.log('Procurando <div> com role="button"...');
        const divButtons = document.querySelectorAll('div[role="button"]');
        console.log(`Total de <div role="button">: ${divButtons.length}`);
        
        for (let div of divButtons) {
            const texto = div.textContent.trim().toLowerCase();
            
            if (texto === 'post' || texto === 'postar' || texto === 'send' || texto === 'enviar') {
                if (div.offsetParent !== null) {
                    console.log(`✅ Div POST encontrada: "${texto}"`);
                    div.click();
                    div.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    await aguardar(500);
                    return true;
                }
            }
        }

        // Estratégia 3: Procurar por qualquer elemento clicável com texto "post"
        console.log('Procurando qualquer elemento com texto "post"...');
        const todosElementos = document.querySelectorAll('*');
        
        for (let el of todosElementos) {
            const texto = el.textContent.trim().toLowerCase();
            const role = el.getAttribute('role') || '';
            
            if ((texto === 'post' || texto === 'postar') && 
                (role === 'button' || el.tagName === 'BUTTON') &&
                el.offsetParent !== null) {
                
                console.log(`✅ Elemento encontrado: ${el.tagName}, role: ${role}, texto: "${texto}"`);
                
                // Usar diferentes métodos para clicar
                el.click();
                el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                
                await aguardar(500);
                return true;
            }
        }

        // Estratégia 4: Última tentativa - procurar por qualquer elemento que tenha exatamente "Postar"
        console.log('Última tentativa: procurando por "Postar" exato...');
        for (let el of todosElementos) {
            if (el.innerText && el.innerText.trim() === 'Postar' && el.offsetParent !== null) {
                console.log(`✅ Elemento "Postar" encontrado: ${el.tagName}`);
                el.click();
                el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                await aguardar(500);
                return true;
            }
        }

        console.log('❌ Nenhum botão POST foi encontrado');
        return false;

    } catch (erro) {
        console.error('Erro ao encontrar botão:', erro);
        return false;
    }
}

function aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✅ Content script pronto para receber mensagens');
