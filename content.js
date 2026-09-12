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
        const botoes = Array.from(document.querySelectorAll('button'));
        
        let botaoPost = null;
        
        for (let botao of botoes) {
            const texto = botao.textContent.trim().toLowerCase();
            
            if (texto === 'post' || texto === 'postar' || texto === 'send') {
                if (!botao.disabled && botao.offsetParent !== null) {
                    botaoPost = botao;
                    break;
                }
            }
        }

        if (!botaoPost) {
            console.log('❌ Botão POST não encontrado');
            console.log(`Total de botões: ${botoes.length}`);
            return false;
        }

        console.log('✅ Botão POST encontrado! Clicando...');
        botaoPost.click();
        await aguardar(3000);

        console.log('✅ Comentário enviado com sucesso!');
        return true;

    } catch (erro) {
        console.error('❌ Erro durante processamento:', erro.message);
        console.error('Stack:', erro.stack);
        return false;
    }
}

function aguardar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✅ Content script pronto para receber mensagens');
