// Choperia e Espetaria Oz · scripts do site
(function () {
  var C = window.OZ || {};

  // ---------- Menu mobile ----------
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      toggle.textContent = aberto ? 'Fechar' : 'Menu';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('aberto'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu'; });
    });
  }

  // ---------- Na brasa agora ----------
  var ROTULO = { 'na-brasa': 'Na brasa', 'disponivel': 'Disponível', 'esgotado': 'Acabou' };
  var lista = document.getElementById('brasa-lista');
  var hora = document.getElementById('brasa-hora');
  var aviso = document.getElementById('brasa-aviso');
  var espetosAtuais = [];

  function norm(s) { return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'); }

  function csvParaLinhas(txt) {
    var linhas = [], linha = [], campo = '', aspas = false;
    for (var i = 0; i < txt.length; i++) {
      var ch = txt[i];
      if (aspas) {
        if (ch === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
        else if (ch === '"') aspas = false;
        else campo += ch;
      } else if (ch === '"') aspas = true;
      else if (ch === ',') { linha.push(campo); campo = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && txt[i + 1] === '\n') i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = '';
      } else campo += ch;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    return linhas.filter(function (l) { return l.some(function (c) { return c.trim(); }); });
  }

  function desenhar(itens, info) {
    espetosAtuais = itens.filter(function (i) { return i.status !== 'esgotado'; }).map(function (i) { return i.nome; });
    montarItensPedido();
    if (!itens.length) { lista.innerHTML = '<li class="quadro__vazio">Nenhum espeto cadastrado no momento.</li>'; return; }
    var ordem = { 'na-brasa': 0, 'disponivel': 1, 'esgotado': 2 };
    itens.sort(function (a, b) { return (ordem[a.status] ?? 3) - (ordem[b.status] ?? 3); });
    lista.innerHTML = itens.map(function (i) {
      var st = ROTULO[i.status] ? i.status : 'disponivel';
      var preco = i.preco ? '<span class="item__preco">' + esc(i.preco) + '</span>' : '';
      return '<li class="item item--' + st + '"><i class="st st--' + st + '" aria-hidden="true"></i>' +
        '<span class="item__nome">' + esc(i.nome) + '</span>' + preco +
        '<span class="item__status">' + ROTULO[st] + '</span></li>';
    }).join('');
    hora.textContent = info.hora;
    aviso.hidden = !info.aviso;
    aviso.textContent = info.aviso || '';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function agora() { return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

  function carregarBrasa() {
    if (!lista) return;
    if (C.planilhaBrasaCSV) {
      fetch(C.planilhaBrasaCSV + (C.planilhaBrasaCSV.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now())
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (txt) {
          var linhas = csvParaLinhas(txt);
          var cab = linhas.shift().map(norm);
          var iN = cab.indexOf('nome'), iS = cab.indexOf('status'), iP = cab.indexOf('preco');
          var itens = linhas.map(function (l) { return { nome: (l[iN] || '').trim(), status: norm(l[iS]), preco: iP > -1 ? (l[iP] || '').trim() : '' }; })
            .filter(function (i) { return i.nome; });
          desenhar(itens, { hora: 'Atualizado às ' + agora() });
        })
        .catch(function () { carregarJSON('Não foi possível ler a planilha agora. Mostrando a última lista salva.'); });
    } else {
      carregarJSON();
    }
  }

  function carregarJSON(msgErro) {
    fetch('data/brasa.json?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) {
        desenhar(d.espetos || [], {
          hora: d.atualizado ? 'Atualizado em ' + d.atualizado : 'Atualizado às ' + agora(),
          aviso: msgErro || (d.exemplo ? 'Lista de exemplo. A casa ainda vai ligar a atualização ao vivo.' : '')
        });
      })
      .catch(function () {
        lista.innerHTML = '<li class="quadro__vazio">Não foi possível carregar a lista agora. Pergunte no balcão!</li>';
        hora.textContent = '';
        montarItensPedido();
      });
  }

  carregarBrasa();
  setInterval(carregarBrasa, Math.max(20, C.atualizarACada || 60) * 1000);

  // ---------- Pedido de delivery ----------
  var boxEsp = document.getElementById('itens-espetos');
  var boxPor = document.getElementById('itens-porcoes');
  var resumo = document.getElementById('pedido-resumo');
  var qtd = {};

  function linhaItem(nome, grupo) {
    var id = grupo + '-' + norm(nome);
    var q = qtd[nome] || 0;
    return '<div class="it"><span class="it__nome" id="' + id + '">' + esc(nome) + '</span>' +
      '<div class="it__q" role="group" aria-labelledby="' + id + '">' +
      '<button type="button" data-n="' + esc(nome) + '" data-d="-1" aria-label="Menos ' + esc(nome) + '">−</button>' +
      '<output>' + q + '</output>' +
      '<button type="button" data-n="' + esc(nome) + '" data-d="1" aria-label="Mais ' + esc(nome) + '">+</button></div></div>';
  }

  function montarItensPedido() {
    if (!boxEsp) return;
    var esp = espetosAtuais.length ? espetosAtuais : [];
    boxEsp.innerHTML = esp.length ? esp.map(function (n) { return linhaItem(n, 'esp'); }).join('') : '<p class="it__vazio">Os espetos aparecem aqui assim que a lista da churrasqueira carregar.</p>';
    boxPor.innerHTML = (C.porcoes || []).map(function (n) { return linhaItem('Porção de ' + n.charAt(0).toLowerCase() + n.slice(1), 'por'); }).join('');
    atualizarResumo();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.it__q button');
    if (!b) return;
    var n = b.getAttribute('data-n');
    qtd[n] = Math.max(0, (qtd[n] || 0) + Number(b.getAttribute('data-d')));
    b.parentNode.querySelector('output').textContent = qtd[n];
    atualizarResumo();
  });

  function escolhidos() { return Object.keys(qtd).filter(function (n) { return qtd[n] > 0; }); }

  function atualizarResumo() {
    if (!resumo) return;
    var e = escolhidos();
    resumo.textContent = e.length ? e.map(function (n) { return qtd[n] + '× ' + n; }).join(' · ') : 'Nenhum item escolhido.';
  }

  var form = document.getElementById('pedido');
  var msg = document.getElementById('pedido-msg');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nome = document.getElementById('cli-nome').value.trim();
      var end = document.getElementById('cli-end').value.trim();
      var obs = document.getElementById('cli-obs').value.trim();
      var e = escolhidos();
      msg.hidden = false;
      if (!e.length) { msg.textContent = 'Escolha pelo menos um item.'; return; }
      if (!nome || !end) { msg.textContent = 'Preencha seu nome e o endereço de entrega.'; return; }
      if (!C.whatsapp) { msg.textContent = 'O WhatsApp da Oz ainda não foi configurado no site.'; return; }
      var texto = 'Olá, Oz! Quero fazer um pedido de delivery:\n\n' +
        e.map(function (n) { return '• ' + qtd[n] + 'x ' + n; }).join('\n') +
        '\n\nNome: ' + nome + '\nEndereço: ' + end + (obs ? '\nObservações: ' + obs : '');
      msg.textContent = 'Abrindo o WhatsApp com o seu pedido…';
      window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
