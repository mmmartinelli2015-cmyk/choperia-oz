// ================================================================
// CONFIGURAÇÕES DA OZ: edite só este arquivo
// ================================================================
window.OZ = {
  // WhatsApp que recebe os pedidos de delivery, só números, com DDI e DDD.
  // Exemplo: "5511999998888". Enquanto estiver vazio, o botão avisa que falta configurar.
  whatsapp: "",

  // "Na brasa agora": link CSV de uma planilha do Google publicada na web.
  // Planilha com 3 colunas: nome | status | preco
  // status aceita: na-brasa, disponivel, esgotado
  // Se ficar vazio, o site usa o arquivo data/brasa.json.
  planilhaBrasaCSV: "",

  // De quanto em quanto tempo o painel recarrega (em segundos)
  atualizarACada: 60,

  // Porções do delivery
  porcoes: ["Salame", "Salame com azeitona", "Batata", "Calabresa"]
};
