# Choperia e Espetaria Oz · site

Site estático (HTML, CSS e JS puros) para o **GitHub Pages**. Não precisa de servidor nem de build.

## Estrutura

```
index.html        página única com todas as seções
css/style.css     estilos (cores e fontes nas variáveis do topo)
js/config.js      CONFIGURAÇÕES: WhatsApp, planilha do "Na brasa agora", porções
js/main.js        menu mobile, painel ao vivo e montagem do pedido de delivery
data/brasa.json   lista de espetos usada quando a planilha não está ligada
img/              logo, favicon e imagens dos dois ambientes
```

## Seções

1. Abertura com o logo sobre madeira
2. **Na brasa agora**: quadro-negro com os espetos e o status de cada um (na brasa, disponível, acabou). Recarrega sozinho a cada 60 s.
3. **Chopes, cervejas e drinks**: chope Heineken e Petra; garrafa Heineken e Original; drinks na taça com e sem álcool
4. **Ambientes**: Salão da Brasa e Salão do Bar
5. **Delivery**: o cliente escolhe espetos e porções (salame, salame com azeitona, batata, calabresa), preenche nome e endereço, e o pedido abre pronto no WhatsApp da casa
6. Contato e rodapé

## Ligar o "Na brasa agora" ao vivo (pelo celular da churrasqueira)

1. Crie uma planilha no Google Sheets com estas colunas na linha 1: `nome | status | preco`
2. Uma linha por espeto. Em **status** use: `na-brasa`, `disponivel` ou `esgotado`. O **preco** é opcional (ex.: `R$ 9,00`); se ficar vazio, não aparece.
3. Menu **Arquivo → Compartilhar → Publicar na web** → escolha a aba → formato **CSV** → Publicar. Copie o link.
4. Cole o link em `js/config.js`, no campo `planilhaBrasaCSV`.

Pronto: a equipe muda o status no app do Google Sheets e o site mostra em até 1 minuto (o Google pode levar alguns minutos para publicar a alteração).

Sem a planilha, o site lê `data/brasa.json`. Enquanto esse arquivo tiver `"exemplo": true`, aparece o aviso "Lista de exemplo".

## O que falta preencher

- [ ] `js/config.js`: número do WhatsApp (só números, com 55 e DDD)
- [ ] `index.html`, seção Contato: endereço, horário, WhatsApp e Instagram (busque por "a completar")
- [ ] Lista real de espetos e preços (planilha ou `data/brasa.json`)
- [ ] Nomes dos drinks com e sem álcool, se quiser listá-los
- [ ] Fotos reais dos ambientes: as imagens atuais são as projeções. Para trocar, salve o arquivo novo com o mesmo nome em `img/`.

## Publicar no GitHub Pages

1. Envie todos os arquivos desta pasta para a raiz do repositório.
2. **Settings → Pages** → branch `main`, pasta `/ (root)`.
3. Domínio próprio: **Settings → Pages → Custom domain** e aponte o DNS.
