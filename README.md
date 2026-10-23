AtalhoGit2
O AtalhoGit2 é uma aplicação web que facilita a publicação de projetos no GitHub. Em vez de criar manualmente um repositório e enviar os arquivos um por um, o usuário seleciona ou arrasta uma pasta do computador, revisa as informações do projeto e envia tudo para o GitHub pela própria interface.

A aplicação também gera uma sugestão de nome, uma descrição e um arquivo README.md para o repositório. A geração local funciona sem depender de uma API paga de inteligência artificial.
Para que serve?
O AtalhoGit2 foi desenvolvido para simplificar as etapas iniciais de publicação de projetos, ajudando a:
- Criar um repositório no GitHub a partir de uma pasta local.
- Sugerir um nome e uma descrição para o repositório.
- Gerar uma documentação inicial em README.md.
- Revisar e editar o nome, a descrição e o README antes de publicar.
- Enviar os arquivos do projeto ao GitHub em uma única operação.
- Criar um arquivo .gitignore básico quando o projeto ainda não possui um.
Como funciona?
1. Configuração: o usuário informa um token pessoal do GitHub com permissão para criar repositórios. A chave da API da Anthropic é opcional.
2. Seleção da pasta: o usuário arrasta a pasta para a área indicada ou utiliza o botão para escolher uma pasta.
3. Leitura dos arquivos: a aplicação percorre os arquivos selecionados e prepara uma lista do conteúdo que poderá ser enviado.
4. Filtros de segurança e tamanho: pastas de dependências e arquivos de configuração de ferramentas são ignorados. Arquivos que parecem conter segredos, como .env e chaves privadas, também são filtrados; arquivos com mais de 20 MB ficam de fora.
5. Análise e documentação: o sistema identifica arquivos e tecnologias a partir de nomes e configurações conhecidas. Sem a chave da Anthropic, cria localmente uma sugestão de nome, descrição e README usando regras JavaScript. Se uma chave válida da Anthropic estiver configurada, o código também oferece a opção de solicitar uma versão gerada por IA.
6. Revisão: antes do envio, o usuário pode conferir e editar o nome do repositório, a descrição, a visibilidade pública ou privada e o conteúdo do README.
7. Publicação: a aplicação cria o repositório pela API do GitHub, envia os arquivos, prepara a árvore de arquivos e grava o commit inicial.
8. Confirmação: ao concluir, a interface apresenta o link do repositório criado.
Tecnologias utilizadas
- HTML5: estrutura das telas, formulários, áreas de seleção de pasta e etapas do fluxo.
- CSS3: aparência da aplicação, cartões, botões, campos, mensagens, barra de progresso e adaptação a preferências de tema.
- JavaScript: leitura dos arquivos no navegador, filtros, geração local do README, atualização da interface e controle do fluxo de publicação.
- GitHub REST API: validação do token, criação do repositório e envio do conteúdo usando operações da API Git.
- Anthropic API (opcional): geração e revisão do nome, descrição e README com IA quando o usuário fornece uma chave válida.
Estrutura dos arquivos
AtalhoGit2/
├── index.html   # Estrutura da interface
├── style.css    # Estilos e layout
├── script.js    # Lógica, análise de arquivos e integração com APIs
└── README.md    # Documentação do projeto
Como executar
O AtalhoGit2 é uma aplicação web estática. Não é necessário compilar o projeto nem instalar dependências de Node.js para abrir a interface.
1. Baixe ou clone este repositório.
2. Mantenha index.html, style.css e script.js na mesma pasta.
3. Abra index.html em um navegador compatível, como uma versão recente do Chrome ou Edge.
4. Abra Configurações, informe seu token do GitHub e clique em Testar e salvar.
5. Selecione a pasta que deseja publicar, revise os dados gerados e confirme o envio.
A seleção de pastas e o arrastar-e-soltar dependem do suporte do navegador. Se o arrastar-e-soltar não funcionar, utilize o botão Escolher pasta….

Configuração
Token do GitHub
O token do GitHub é necessário para criar repositórios e enviar arquivos à conta do usuário. Crie um token pessoal nas configurações do GitHub e conceda somente as permissões necessárias para a operação. A aplicação atual utiliza um token classic com permissão repo, conforme indicado na tela de configuração.
Chave da Anthropic (opcional)
Sem a chave da Anthropic, a geração do nome, da descrição e do README é feita localmente, sem custo de API. Com uma chave configurada, o usuário pode solicitar geração ou revisão por IA. Nesse modo, trechos de arquivos do projeto são enviados à API da Anthropic para compor a solicitação.
Armazenamento das configurações
As configurações são guardadas no localStorage do navegador utilizado. Isso significa que ficam associadas àquele navegador e computador, não ao repositório do GitHub.

Atenção: guardar tokens no navegador é conveniente para uso pessoal, mas não é a opção mais segura para uma aplicação pública ou compartilhada. Não publique seu token, não o inclua no código-fonte e remova/revogue qualquer token que tenha sido exposto.
Arquivos ignorados

A aplicação exclui diretórios comuns de dependências e arquivos gerados, incluindo:
- .git, node_modules, target, build, dist, out
- .gradle, .idea, .vscode, venv, .venv
- bin, obj, __pycache__, .next
- Arquivos .env, chaves privadas e arquivos que correspondam aos filtros de segredos
- Arquivos individuais com mais de 20 MB
Esses filtros reduzem o envio de arquivos desnecessários ou sensíveis, mas não substituem uma revisão manual. Antes de publicar, confira os arquivos que serão enviados para garantir que não há senhas, tokens, credenciais ou outros dados privados.
Limitações
- A documentação gerada localmente usa regras e padrões identificados nos arquivos; não compreende todos os projetos como uma IA generativa faria.
- Comandos de instalação e execução devem ser revisados para confirmar que correspondem ao projeto real.
- A publicação depende de conexão com a internet e de um token do GitHub válido, com permissões suficientes.
- A chave da Anthropic é opcional; o uso da API pode ter cobrança de acordo com a conta e as condições do provedor.
Objetivo do projeto
O AtalhoGit2 busca tornar mais simples e rápido o processo de transformar uma pasta de código em um repositório organizado no GitHub, com documentação inicial e possibilidade de revisão antes da publicação.

*A parte de descrições do readme ainda esta em fase de melhoria*
