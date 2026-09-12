# Instagram Auto Commenter - Extensão Chrome

Extensão Chrome para automatizar comentários em posts do Instagram.

## 📋 Requisitos

- Google Chrome (versão 88+)
- Conta do Instagram
- Lista de perfis para comentar

## 🚀 Como Instalar

1. **Clone ou baixe este repositório**
   ```bash
   git clone https://github.com/seu-usuario/instagram-auto-comment-extension.git
   ```

2. **Abra o Chrome** e vá para `chrome://extensions/`

3. **Ative o "Modo do desenvolvedor"** (canto superior direito)

4. **Clique em "Carregar extensão sem empacotamento"**

5. **Selecione a pasta do projeto**

## 📖 Como Usar

1. **Abra a extensão** clicando no ícone no Chrome

2. **Adicione os perfis** que deseja comentar (um por linha, com @)
   ```
   @perfil1
   @perfil2
   @perfil3
   ```

3. **Digite o comentário** que será postado
   ```
   você pode fazer uma campanha com @clientepremiadonegocios
   ```

4. **Defina o intervalo** entre perfis (em minutos)

5. **Clique em "Iniciar"** para começar a automação

## ⚙️ Arquivos

- `manifest.json` - Configuração da extensão
- `popup.html` - Interface da extensão
- `popup.js` - Lógica do popup
- `background.js` - Serviço de fundo
- `content.js` - Script injetado no Instagram
- `README.md` - Este arquivo

## ⚠️ Avisos Importantes

- ⚠️ **Use com responsabilidade** - O Instagram pode banir contas que usam automação
- ⚠️ **Respeite os termos de serviço** do Instagram
- ⚠️ **Não use para spam** ou conteúdo indesejado
- ⚠️ **Faça login no Instagram** antes de iniciar a automação
- ⚠️ **Mantenha o Chrome aberto** enquanto a automação está rodando

## 🔧 Troubleshooting

### A extensão não funciona

1. Certifique-se de que está logado no Instagram
2. Verifique se a página do Instagram já foi carregada
3. Abra o DevTools (F12) e verifique o console para erros
4. Recarregue a extensão em `chrome://extensions/`

### Não encontra posts

1. Certifique-se de que o perfil tem posts visíveis
2. Aguarde alguns segundos para os posts carregarem
3. Tente com outro perfil

### Não consegue comentar

1. Verifique se a página do post abriu corretamente
2. Verifique se você pode comentar manualmente no Instagram
3. Verifique o console para mensagens de erro específicas

## 📝 Licença

Este projeto é fornecido como está. Use por sua conta e risco.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!
