const $=s=>document.querySelector(s);
const SKIP=new Set(['.git','node_modules','target','build','out','dist','.gradle','.idea','.vscode','venv','.venv','__pycache__','bin','obj','.next']);
const SECRET=/(^\.env|\.pem$|\.key$|\.pfx$|\.p12$|^id_rsa|^secrets?\.|credential)/i;
const SRC=/\.(py|js|ts|tsx|jsx|java|kt|cs|go|rs|php|rb|c|cpp|html|vue|dart|swift)$/;
const MAN=['package.json','pom.xml','build.gradle','build.gradle.kts','requirements.txt','pyproject.toml','Cargo.toml','go.mod','composer.json','Dockerfile','README.md'];
const MAIN=/(main|app|index|application|server)/i;
const GI=".idea/\n*.iml\n.vscode/\n.DS_Store\nThumbs.db\n.env\n.env.*\n*.pem\n*.key\nnode_modules/\ntarget/\nbuild/\nout/\ndist/\n.gradle/\n*.class\n__pycache__/\nvenv/\n.venv/\nbin/\nobj/\n*.log\n";
const SYS=`Você é um engenheiro de software sênior escrevendo o README de um projeto para o GitHub.
Leia o código fornecido e explique o que o projeto REALMENTE faz, de modo que um desconhecido entenda sem abrir os arquivos.
Regras:
- Nome do repositório: minúsculas, kebab-case, até 40 caracteres, descritivo (nada genérico como "projeto" ou "teste").
- Baseie-se SOMENTE no contexto. Não invente funcionalidades, comandos, rotas ou tecnologias. Cite nomes reais de arquivos, classes, funções, rotas e comandos que aparecem no código.
- Seja específico e concreto. Evite frases genéricas como "projeto moderno e escalável".
- README em português do Brasil, em Markdown, com estas seções (omita as que não puder deduzir):
  título; "Sobre" (que problema resolve e o que faz, em 1 ou 2 parágrafos); Funcionalidades (explique o comportamento de cada uma, não só liste); Como funciona (fluxo principal passo a passo e responsabilidade dos módulos/classes principais); Tecnologias (e para que cada uma é usada); Estrutura do projeto (pastas e arquivos importantes, uma linha cada); Como executar (instalação, configuração e comandos deduzidos dos arquivos); Configuração (variáveis de ambiente ou arquivos, só os nomes, nunca valores); Exemplos de uso (só se der para deduzir).
Responda EXATAMENTE neste formato, sem nada antes ou depois:
NAME: <nome-do-repo>
DESCRIPTION: <uma frase, até 120 caracteres>
---README---
<markdown do README>`;
let cfg={},proj=null,prop=null,ctx='',createdUrl='';
try{cfg=JSON.parse(localStorage.getItem('d2g')||'{}')}catch(e){}
const store=()=>{try{localStorage.setItem('d2g',JSON.stringify(cfg))}catch(e){toast('Não consegui salvar as configurações neste navegador.')}};
const sanitize=s=>s.trim().replace(/\s+/g,'-').replace(/[^A-Za-z0-9._-]/g,'').replace(/^[.-]+|[.-]+$/g,'')||'projeto';
const redact=t=>t.replace(/((?:password|passwd|secret|token|api[_-]?key|senha)\s*[:=]\s*)(\S+)/gi,'$1***');
const u8=s=>btoa(Array.from(new TextEncoder().encode(s),c=>String.fromCharCode(c)).join(''));
const b64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.onerror=no;r.readAsDataURL(f)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(tt);tt=setTimeout(()=>t.style.display='none',4500)}
function view(id){document.querySelectorAll('.v').forEach(s=>s.hidden=s.id!==id)}
function prog(msg,p,sub){$('#lmsg').textContent=msg;$('#lbar').style.width=(p==null?8:Math.round(p*100))+'%';$('#lsub').textContent=sub||''}

/* ---------- configurações ---------- */
$('#gh').value=cfg.gh||'';$('#ak').value=cfg.ak||'';$('#dpriv').checked=cfg.priv!==false;
if(!cfg.gh)$('#cfg').open=true;
async function gh(path,method='GET',body){
  const r=await fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+cfg.gh,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:body&&JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(j.message||('Erro '+r.status));e.status=r.status;throw e}
  return j;
}
$('#savecfg').onclick=async()=>{
  cfg.gh=$('#gh').value.trim();cfg.ak=$('#ak').value.trim();cfg.priv=$('#dpriv').checked;
  if(cfg.gh.startsWith('github_pat_')){$('#cfgmsg').textContent='Este é um token "fine-grained", que não consegue criar repositórios. Crie um token classic (começa com ghp_).';return}
  $('#cfgmsg').textContent='Testando…';
  try{const u=await gh('/user');cfg.login=u.login;store();$('#cfgmsg').textContent='Conectado como '+u.login+'.';$('#cfg').open=false}
  catch(e){$('#cfgmsg').textContent='Token inválido: '+e.message}
};

/* ---------- ler a pasta ---------- */
const keep=p=>{const s=p.split('/'),n=s[s.length-1];return!s.slice(0,-1).some(d=>SKIP.has(d))&&!SECRET.test(n)&&n!=='.DS_Store'&&n!=='Thumbs.db'};
const readAll=r=>new Promise((ok,no)=>{let all=[];(function go(){r.readEntries(b=>{if(!b.length)return ok(all);all=all.concat(b);go()},no)})()});
let unreadable=0;
async function walk(e,pre,out){
  try{
    if(e.isFile){out.push({path:pre+e.name,file:await new Promise((ok,no)=>e.file(ok,no))})}
    else if(!SKIP.has(e.name)){for(const c of await readAll(e.createReader()))await walk(c,pre+e.name+'/',out)}
  }catch(err){unreadable++}
}
const dz=$('#dz');
['dragover','dragenter'].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add('on')}));
dz.addEventListener('dragleave',()=>dz.classList.remove('on'));
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',e=>e.preventDefault());
dz.addEventListener('drop',async e=>{
  e.preventDefault();dz.classList.remove('on');
  const dirs=[...e.dataTransfer.items].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(x=>x&&x.isDirectory);
  if(!dirs.length)return toast('Solte uma pasta, não um arquivo.');
  view('load');prog('Lendo a pasta…');
  unreadable=0;
  try{
    const out=[];for(const c of await readAll(dirs[0].createReader()))await walk(c,'',out);
    if(!out.length)throw new Error('nenhum arquivo lido');
    if(unreadable)toast(unreadable+' item(ns) não puderam ser lidos e ficaram de fora.');
    start(dirs[0].name,out);
  }catch(err){fail('Não consegui ler a pasta arrastada ('+err.message+'). Volte e use o botão "Escolher pasta…", que é mais confiável.')}
});
$('#pickbtn').onclick=()=>$('#pick').click();
$('#pick').onchange=e=>{
  const fs=[...e.target.files];if(!fs.length)return;
  start(fs[0].webkitRelativePath.split('/')[0],fs.map(f=>({path:f.webkitRelativePath.split('/').slice(1).join('/'),file:f})));
  e.target.value='';
};

/* ---------- análise e proposta ---------- */
async function snip(f,n){try{return redact(await f.file.slice(0,n).text())}catch(e){return''}}
async function start(root,all){
  if(!cfg.gh){view('home');$('#cfg').open=true;return toast('Salve o token do GitHub primeiro.')}
  const files=[],big=[];
  for(const x of all){if(!keep(x.path))continue;if(x.file.size>20e6){big.push(x.path);continue}files.push(x)}
  if(!files.length){view('home');return toast('Nenhum arquivo enviável nessa pasta.')}
  if(files.length>1500){view('home');return toast('Pasta com mais de 1500 arquivos. Verifique se há pastas de dependências.')}
  proj={root,files,big};view('load');prog('Analisando o projeto…');
  let t=`Nome da pasta: ${root}\nArquivos:\n`+files.slice(0,300).map(f=>'  '+f.path).join('\n');
  for(const f of files.filter(f=>MAN.includes(f.path.split('/').pop())).slice(0,8))t+=`\n\n--- ${f.path} ---\n`+await snip(f,3000);
  const code=files.filter(f=>SRC.test(f.path)).sort((a,b)=>(MAIN.test(b.path)-MAIN.test(a.path))||a.path.split('/').length-b.path.split('/').length);
  let used=0;for(const f of code.slice(0,15)){if(used>60000)break;const x=await snip(f,6000);used+=x.length;t+=`\n\n--- ${f.path} ---\n`+x}
  ctx=t;
  const old=files.find(f=>f.path==='README.md');
  prop=null;
  if(cfg.ak){prog('Pedindo ao Claude o nome e o README…');try{prop=await ai()}catch(e){toast('IA indisponível ('+e.message+'). Usei o modo simples.')}}
  prop=prop||simple();
  if(old){prop.readme=await old.file.text();toast('Seu README.md existente foi mantido.')}
  fill();
}
function simple(feedback=''){
  const paths=proj.files.map(f=>f.path);
  const names=paths.map(p=>p.split('/').pop());
  const has=n=>names.includes(n);
  const ext=e=>paths.some(p=>p.toLowerCase().endsWith(e));
  const root=proj.root.replace(/[_-]+/g,' ').trim();
  const repo=sanitize(root).toLowerCase().slice(0,40).replace(/[.-]+$/,'')||'meu-projeto';
  const ctxText=(ctx||'').toLowerCase();
  const tech=[],setup=[],features=[];
  if(has('pom.xml')){tech.push('- **Java** — arquivos/configuração de projeto Java detectados.','- **Maven** — gerenciamento de dependências e build pelo `pom.xml`.');setup.push('1. Instale um JDK compatível.','2. Na pasta que contém `pom.xml`, execute `mvn clean install`.');}
  if(has('build.gradle')||has('build.gradle.kts')){tech.push('- **Gradle** — ferramenta de build identificada pela configuração.');setup.push('Consulte `build.gradle` ou `build.gradle.kts` para confirmar a versão do JDK e as tarefas disponíveis.');}
  if(has('package.json')){tech.push('- **Node.js / npm** — `package.json` define metadados, dependências e possíveis scripts.');setup.push('1. Instale Node.js.','2. Execute `npm install` na pasta de `package.json`.','3. Confira a seção `scripts` do `package.json` para ver como iniciar o projeto.');}
  if(has('requirements.txt')||has('pyproject.toml')||ext('.py')){tech.push('- **Python** — arquivos Python ou configuração de dependências detectados.');setup.push('Instale Python e siga as dependências declaradas em `requirements.txt` ou `pyproject.toml`, quando existentes.');}
  if(has('Cargo.toml')){tech.push('- **Rust / Cargo** — configuração Rust detectada.');setup.push('Instale Rust e Cargo e consulte `Cargo.toml` para os detalhes do projeto.');}
  if(has('go.mod')){tech.push('- **Go** — módulo Go identificado em `go.mod`.');setup.push('Instale Go e consulte `go.mod` para os detalhes do módulo.');}
  if(has('composer.json')){tech.push('- **PHP / Composer** — configuração PHP detectada.');setup.push('Instale PHP e Composer; consulte `composer.json` para as dependências.');}
  if(ext('.html'))tech.push('- **HTML** — estrutura de páginas e conteúdo.');
  if(ext('.css'))tech.push('- **CSS** — estilos visuais.');
  if(ext('.js')||ext('.jsx'))tech.push('- **JavaScript** — arquivos de lógica e interatividade.');
  if(ext('.ts')||ext('.tsx'))tech.push('- **TypeScript** — arquivos TypeScript.');
  if(ext('.sql'))tech.push('- **SQL** — arquivos de consultas ou estrutura de dados.');
  if(has('Dockerfile')||has('docker-compose.yml')||has('compose.yml'))tech.push('- **Docker** — arquivos de configuração de contêiner detectados.');
  if(ext('.html'))features.push('- Contém páginas HTML para estruturar conteúdo.');
  if(ext('.css'))features.push('- Contém estilos CSS para apresentação visual.');
  if(ext('.js')||ext('.ts'))features.push('- Contém arquivos JavaScript/TypeScript; consulte o código para confirmar os comportamentos específicos.');
  if(has('pom.xml'))features.push('- Inclui configuração Maven para dependências e build.');
  if(has('package.json'))features.push('- Inclui `package.json` com dependências e possíveis scripts.');
  if(ext('.sql'))features.push('- Inclui arquivos SQL relacionados a consultas ou estrutura de dados.');
  if(!features.length)features.push('- Os arquivos foram listados automaticamente; revise o código para documentar as funcionalidades específicas.');
  let kind='projeto de software';
  if(has('pom.xml'))kind=ctxText.includes('spring')?'projeto Java que aparenta utilizar Spring, com base nos arquivos analisados':'projeto Java com configuração Maven';
  else if(has('package.json')&&(ext('.html')||ext('.js')))kind='projeto JavaScript/web';
  else if(ext('.html')&&ext('.css')&&ext('.js'))kind='projeto web com HTML, CSS e JavaScript';
  else if(ext('.py')||has('requirements.txt')||has('pyproject.toml'))kind='projeto Python';
  else if(has('Cargo.toml'))kind='projeto Rust';
  else if(has('go.mod'))kind='projeto Go';
  else if(has('composer.json'))kind='projeto PHP';
  const tree=paths.slice(0,60).map(p=>'- `'+p+'`').join('\n');
  const important=paths.filter(p=>/(^|\/)(pom\.xml|package\.json|requirements\.txt|pyproject\.toml|build\.gradle(\.kts)?|Cargo\.toml|go\.mod|composer\.json|Dockerfile|docker-compose\.yml|compose\.yml|application\.properties|application\.yml|schema\.sql)$/i.test(p));
  const desc=(has('pom.xml')?'Projeto Java':(has('package.json')||ext('.html'))?'Projeto web':ext('.py')?'Projeto Python':'Projeto de software')+' '+root;
  let readme=`# ${root}

## Sobre o projeto

Este repositório contém um ${kind}, identificado automaticamente a partir dos arquivos presentes na pasta **${proj.root}**. O README é gerado localmente, sem depender de serviços pagos de IA.

## Funcionalidades e componentes identificados

${features.join('\n')}

## Tecnologias

${tech.length?tech.join('\n'):'- Não foi possível identificar as tecnologias apenas pelos nomes dos arquivos.'}

## Estrutura do projeto

${tree||'- Nenhum arquivo listado.'}

## Como executar

${setup.length?setup.join('\n'):'Não foi possível confirmar o comando de execução automaticamente. Consulte os arquivos de configuração e as instruções da tecnologia utilizada.'}

## Observações

- Revise os comandos e ajuste-os à configuração real do ambiente.
- A documentação automática usa regras locais; confira o código antes de publicar descrições detalhadas.
`;
  if(important.length)readme+=`
## Arquivos de configuração detectados

${important.map(p=>'- `'+p+'`').join('\n')}
`;
  if(feedback.trim())readme+=`
## Observação para revisão

Ajuste solicitado: ${feedback.trim().slice(0,250)}
`;
  return {name:repo,desc:desc.slice(0,120),readme};
}
function parse(t){
  const m=t.match(/NAME:\s*(.+)/),d=t.match(/DESCRIPTION:\s*(.+)/);
  if(!m||!t.includes('---README---'))throw new Error('resposta fora do formato');
  return{name:sanitize(m[1]).toLowerCase(),desc:(d?d[1].trim():'').slice(0,350),readme:t.split('---README---')[1].trim()+'\n'};
}
async function ai(fb){
  let u='Contexto do projeto:\n\n'+ctx;
  if(fb)u+=`\n\nSua proposta anterior:\nNAME: ${sanitize($('#name').value)}\nDESCRIPTION: ${$('#desc').value}\n---README---\n${$('#readme').value}\n\nAjustes pedidos pelo usuário: ${fb}\nGere a nova versão completa.`;
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':cfg.ak,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-5-5',max_tokens:6000,system:SYS,messages:[{role:'user',content:u}]})});
  if(!r.ok)throw new Error('erro '+r.status);
  const j=await r.json();return parse(j.content.map(b=>b.text||'').join(''));
}
function fill(){
  $('#name').value=prop.name;$('#desc').value=prop.desc;$('#readme').value=prop.readme;
  $('#priv').checked=cfg.priv!==false;$('#fb').value='';
  $('#stats').textContent=`· ${proj.files.length} arquivos`+(proj.big.length?` · ${proj.big.length} acima de 20 MB ficaram de fora`:'')+(cfg.ak?'':' · README gerado localmente, sem custo de API');
  $('#redo').style.display='';$('#redo').textContent=cfg.ak?'Refazer com IA':'Gerar novamente';$('#fb').style.display='';$('#fb').placeholder=cfg.ak?'Quer mudar algo? Ex.: mais curto, inclua instalação':'Ajuste opcional. Ex.: destacar instalação ou deixar mais curto';
  view('review');
}
$('#redo').onclick=async()=>{
  const fb=$('#fb').value.trim();
  const b=$('#redo');b.disabled=true;b.textContent='Gerando…';
  try{
    let p;
    if(cfg.ak){
      if(!fb){toast('Descreva o ajuste que deseja fazer.');return}
      p=await ai(fb);
    }else{
      p=simple(fb);
      if(fb)toast('O pedido foi adicionado como observação no README. Revise o texto antes de publicar.');
    }
    $('#name').value=p.name;$('#desc').value=p.desc;$('#readme').value=p.readme;$('#fb').value='';
  }catch(e){toast('Não consegui gerar novamente: '+e.message)}
  finally{b.disabled=false;b.textContent=cfg.ak?'Refazer com IA':'Gerar novamente'}
};
$('#cancel').onclick=()=>{proj=null;view('home')};
$('#again').onclick=()=>{proj=null;view('home')};
$('#back').onclick=()=>view(proj?'review':'home');
function fail(m){$('#emsg').textContent=m;view('fail')}

/* ---------- enviar ao GitHub ---------- */
$('#ok').onclick=async()=>{
  const want=sanitize($('#name').value);createdUrl='';view('load');prog('Criando o repositório…');
  try{
    let repo,n=want,i=2;
    for(;;){
      try{repo=await gh('/user/repos','POST',{name:n,description:$('#desc').value,private:$('#priv').checked,auto_init:true});break}
      catch(e){if(e.status===422&&i<30){n=want+'-'+i++;continue}throw e}
    }
    createdUrl=repo.html_url;
    const list=proj.files.filter(f=>f.path!=='README.md').map(f=>({path:f.path,get:()=>b64(f.file)}));
    list.push({path:'README.md',get:async()=>u8($('#readme').value)});
    if(!proj.files.some(f=>f.path==='.gitignore'))list.push({path:'.gitignore',get:async()=>u8(GI)});
    const tree=new Array(list.length);let k=0,done=0;
    await Promise.all(Array.from({length:4},async()=>{
      while(k<list.length){
        const x=k++,it=list[x];
        const b=await gh(`/repos/${repo.full_name}/git/blobs`,'POST',{content:await it.get(),encoding:'base64'});
        tree[x]={path:it.path,mode:'100644',type:'blob',sha:b.sha};
        prog('Enviando arquivos…',++done/list.length,`${done} de ${list.length}`);
      }
    }));
    prog('Gravando o commit…',1);
    let ref;for(let t=0;t<6;t++){try{ref=await gh(`/repos/${repo.full_name}/git/ref/heads/${repo.default_branch}`);break}catch(e){if(t==5)throw e;await sleep(1000)}}
    const tr=await gh(`/repos/${repo.full_name}/git/trees`,'POST',{tree});
    const cm=await gh(`/repos/${repo.full_name}/git/commits`,'POST',{message:'Commit inicial',tree:tr.sha,parents:[ref.object.sha]});
    await gh(`/repos/${repo.full_name}/git/refs/heads/${repo.default_branch}`,'PATCH',{sha:cm.sha,force:true});
    const a=$('#link');a.href=repo.html_url;a.textContent=repo.html_url;view('done');
  }catch(e){fail((createdUrl?`O repositório ${createdUrl} foi criado, mas o envio falhou: `:'')+e.message)}
};
