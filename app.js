function atualizarLista() {
    console.log('Atualizando lista...');
    
    const container = document.getElementById('listaProdutos');
    const contador = document.getElementById('contadorProdutos');
    
    if (!container) {
        console.error('ERRO: listaProdutos não existe!');
        return;
    }
    
    if (contador) contador.textContent = produtos.length + ' itens';

    if (produtos.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px">Nenhum produto</div>';
        return;
    }

    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

    const svgPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect fill='%23ddd' width='50' height='50'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ESem%3C/text%3E%3C/svg%3E";

    // USAR FOR EM VEZ DE MAP (mais seguro)
    let html = '';
    for (let i = 0; i < produtos.length; i++) {
        const p = produtos[i];
        const img = p.imagens && p.imagens[0] ? p.imagens[0] : svgPlaceholder;
        
        html += '<div class="produto-item-compact" data-id="' + p.id + '">' +
            '<img src="' + img + '" onerror="this.src=\'' + svgPlaceholder + '\'">' +
            '<div class="produto-info-compact">' +
                '<div><span class="codigo-badge-compact">' + (p.codigo || '----') + '</span></div>' +
                '<h4>' + (p.nome || 'Sem nome') + '</h4>' +
                '<div class="preco">R$ ' + (p.preco || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2}) + '</div>' +
            '</div>' +
            '<div class="produto-acoes-compact">' +
                '<button class="btn-acao-compact btn-editar-compact" onclick="editarProduto(\'' + p.id + '\')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn-acao-compact btn-excluir-compact" onclick="excluirProduto(\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    }
    
    container.innerHTML = html;
    console.log('✅ Lista atualizada:', produtos.length);
}
