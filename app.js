// ============================================
// RIBEIRIO MÓVEIS - APP.JS v2.0 CORRIGIDO
// PROBLEMA: Produto 28+ não aparecia
// SOLUÇÃO: Forçar re-render, corrigir ordenação, limpar cache
// ============================================

let produtos = [];
let currentImageIndex = 0;
let currentProduto = null;
let db = null;
let firebaseListener = null;

// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBxlhL9IMFvUKAGxYikutb1BU2WGnC_t5E",
    authDomain: "ribeiro-moveis.firebaseapp.com",
    databaseURL: "https://ribeiro-moveis-default-rtdb.firebaseio.com",
    projectId: "ribeiro-moveis",
    storageBucket: "ribeiro-moveis.firebasestorage.app",
    messagingSenderId: "215506296403",
    appId: "1:215506296403:web:b298fccdfd65d20001b0a6"
};

const AMBIENTES = {
    'dormitorio': { nome: 'Dormitório', icone: 'fa-bed', subcategorias: ['Box', 'Box Baú', 'Cabeceira', 'Cama', 'Colchão', 'Cômoda', 'Guarda-Roupa', 'Mesa de Cabeceira', 'Recamier'] },
    'cozinha': { nome: 'Cozinha', icone: 'fa-utensils', subcategorias: ['Armário', 'Cadeira', 'Conj. Mesa de Jantar', 'Mesa'] },
    'sala': { nome: 'Sala', icone: 'fa-couch', subcategorias: ['Aparador', 'Buffet', 'Cristaleira', 'Home', 'Mesa de Centro', 'Painel', 'Poltrona', 'Rack', 'Sofá'] },
    'colchoes': { nome: 'Colchões', icone: 'fa-mattress-pillow', subcategorias: ['Solteiro', 'Solteiro King', 'Casal', 'Queen', 'King'] },
    'complementos': { nome: 'Complementos', icone: 'fa-plus-circle', subcategorias: ['Mesa de Computador', 'Multiuso', 'Multiuso Área Serviço', 'Penteadeira', 'Puff'] },
    'infantil': { nome: 'Infantil', icone: 'fa-baby', subcategorias: ['Berço', 'Cômoda', 'Guarda-Roupa'] }
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Ribeiro] 🚀 Iniciando app v2.0...');

    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log('[Ribeiro] ✅ Firebase inicializado');
        
        // LIMPAR CACHE ANTIGO (resolver problemas de sync)
        limparCacheAntigo();
        
        carregarProdutosFirebase();
    } catch (e) {
        console.error('[Ribeiro] ❌ Erro ao inicializar:', e);
        mostrarErro('Erro ao conectar com o banco de dados');
    }
});

// ============================================
// LIMPAR CACHE (IMPORTANTE!)
// ============================================
function limparCacheAntigo() {
    // Forçar limpeza do cache se necessário (descomente se quiser limpar tudo)
    // localStorage.removeItem('produtos_backup');
    console.log('[Ribeiro] Cache verificado');
}

// ============================================
// CARREGAR PRODUTOS - VERSÃO CORRIGIDA
// ============================================
function carregarProdutosFirebase() {
    const grid = document.getElementById('produtosGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div style="width: 40px; height: 40px; border: 4px solid #D4AF37; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p style="color: #5D1A1A;">Carregando produtos...</p>
            </div>
        `;
    }

    // Remover listener anterior se existir
    if (firebaseListener) {
        firebaseListener.off();
        console.log('[Ribeiro] Listener anterior removido');
    }

    // Criar novo listener
    const produtosRef = db.ref('produtos');
    
    firebaseListener = produtosRef.on('value', function(snapshot) {
        const dados = snapshot.val();
        console.log('[Ribeiro] 📥 Dados brutos recebidos:', dados ? Object.keys(dados).length : 0, 'itens');

        if (dados) {
            // Converter objeto em array
            const novosProdutos = Object.keys(dados).map(function(key) {
                const produto = dados[key];
                return { 
                    id: key, 
                    ...produto,
                    // CORREÇÃO CRÍTICA: Garantir que ordem seja número válido
                    ordem: (produto.ordem !== undefined && produto.ordem !== null) 
                        ? parseInt(produto.ordem) 
                        : 999999
                };
            });

            console.log('[Ribeiro] ✅ Produtos processados:', novosProdutos.length);
            
            // Log dos últimos produtos para debug
            if (novosProdutos.length > 0) {
                const ultimos = novosProdutos.slice(-3);
                console.log('[Ribeiro] Últimos produtos:', ultimos.map(p => ({id: p.id, nome: p.nome, ordem: p.ordem})));
            }

            // Atualizar array global
            produtos = novosProdutos;

            // Salvar backup
            localStorage.setItem('produtos_backup', JSON.stringify(produtos));

            // Renderizar imediatamente
            renderProdutos('todos');
            
        } else {
            console.log('[Ribeiro] ⚠️ Nenhum dado encontrado');
            produtos = [];
            renderProdutos('todos');
        }
    }, function(error) {
        console.error('[Ribeiro] ❌ Erro Firebase:', error);
        
        // Tentar usar backup em caso de erro
        const backup = localStorage.getItem('produtos_backup');
        if (backup) {
            try {
                produtos = JSON.parse(backup);
                console.log('[Ribeiro] 📦 Usando backup:', produtos.length, 'produtos');
                renderProdutos('todos');
            } catch (e) {
                mostrarErro('Erro ao carregar produtos');
            }
        } else {
            mostrarErro('Erro de conexão');
        }
    });
}

// ============================================
// RENDERIZAÇÃO - VERSÃO CORRIGIDA (SEM LIMITE!)
// ============================================
function renderProdutos(filtro, subcategoria) {
    const grid = document.getElementById('produtosGrid');
    if (!grid) {
        console.error('[Ribeiro] ❌ Grid não encontrado!');
        return;
    }

    // Limpar grid completamente
    grid.innerHTML = '';

    console.log('[Ribeiro] 🎨 Renderizando', produtos.length, 'produtos. Filtro:', filtro);

    if (produtos.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #D4AF37; margin-bottom: 15px;"></i>
                <h3 style="color: #5D1A1A; margin-bottom: 10px; font-size: 1.1rem;">Nenhum produto cadastrado</h3>
            </div>
        `;
        return;
    }

    // CORREÇÃO: Ordenar garantindo que todos apareçam
    let produtosOrdenados = [...produtos].sort(function(a, b) {
        const ordemA = (a.ordem !== undefined && a.ordem !== null) ? parseInt(a.ordem) : 999999;
        const ordemB = (b.ordem !== undefined && b.ordem !== null) ? parseInt(b.ordem) : 999999;
        return ordemA - ordemB;
    });

    // Aplicar filtros
    let filtrados;
    if (filtro === 'todos') {
        filtrados = produtosOrdenados;
    } else if (subcategoria) {
        filtrados = produtosOrdenados.filter(function(p) { 
            return p.ambiente === filtro && p.subcategoria === subcategoria; 
        });
    } else {
        filtrados = produtosOrdenados.filter(function(p) { 
            return p.ambiente === filtro; 
        });
    }

    console.log('[Ribeiro] 📊 Produtos filtrados:', filtrados.length);

    if (filtrados.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;"><p style="color: #666;">Nenhum produto encontrado nesta categoria.</p></div>';
        return;
    }

    // CRIAR TODOS OS CARDS (SEM LIMITE!)
    const fragment = document.createDocumentFragment();
    
    filtrados.forEach(function(produto, index) {
        const card = createProdutoCard(produto);
        // Adicionar data attribute para debug
        card.setAttribute('data-produto-id', produto.id);
        card.setAttribute('data-produto-ordem', produto.ordem);
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    
    console.log('[Ribeiro] ✅ Renderizados:', filtrados.length, 'cards');

    // Atualizar botões ativos
    atualizarBotoesAtivos(filtro);
}

function atualizarBotoesAtivos(filtroAtivo) {
    document.querySelectorAll('.ambiente-btn').forEach(function(btn) {
        btn.classList.remove('active');
        const onclick = btn.getAttribute('onclick') || '';
        
        if (filtroAtivo === 'todos' && onclick.includes("'todos'")) {
            btn.classList.add('active');
        } else if (filtroAtivo !== 'todos' && onclick.includes("'" + filtroAtivo + "'")) {
            btn.classList.add('active');
        }
    });
}

function createProdutoCard(produto) {
    var card = document.createElement('div');
    card.className = 'produto-card';
    card.onclick = function() { openModal(produto); };

    var cores = (produto.cores || []).slice(0, 4).map(function(cor) {
        return '<span class="color-dot" style="background-color: ' + getColorCode(cor) + '" title="' + cor + '"></span>';
    }).join('');

    var imgSrc = produto.imagens && produto.imagens[0] ? produto.imagens[0] : '';
    var svgPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f5f5f5' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle'%3ESem Imagem%3C/text%3E%3C/svg%3E";

    card.innerHTML = `
        <div class="produto-image">
            <img src="${imgSrc}" alt="${produto.nome || 'Produto'}" loading="lazy" onerror="this.src='${svgPlaceholder}'">
        </div>
        <div class="produto-info">
            <h3>${produto.nome || 'Produto'}</h3>
            <p class="produto-price">R$ ${formatarPreco(produto.preco || 0)}</p>
            <div class="produto-colors">
                ${cores}
                ${(produto.cores || []).length > 4 ? '<span class="color-dot" style="background: linear-gradient(45deg, #ddd, #999); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #666;">+</span>' : ''}
            </div>
            <button class="produto-btn">Ver Detalhes <i class="fas fa-arrow-right" style="margin-left: 5px;"></i></button>
        </div>
    `;

    return card;
}

// ============================================
// FUNÇÕES DE FILTRO
// ============================================
function filtrarProdutos(ambiente) {
    console.log('[Ribeiro] 🔍 Filtrando por ambiente:', ambiente);
    renderProdutos(ambiente);
}

function filtrarSubcategoria(ambiente, subcategoria) {
    if (event) event.stopPropagation();
    console.log('[Ribeiro] 🔍 Filtrando por subcategoria:', ambiente, '>', subcategoria);
    renderProdutos(ambiente, subcategoria);
}

// ============================================
// MODAL
// ============================================
function openModal(produto) {
    currentProduto = produto;
    currentImageIndex = 0;

    var modal = document.getElementById('produtoModal');
    document.getElementById('modalTitle').textContent = produto.nome || 'Produto';
    document.getElementById('modalPrice').textContent = 'R$ ' + formatarPreco(produto.preco || 0);

    var dims = parseDimensoes(produto.dimensoes);
    document.getElementById('dimLargura').textContent = dims.largura || '-';
    document.getElementById('dimAltura').textContent = dims.altura || '-';
    document.getElementById('dimProfundidade').textContent = dims.profundidade || '-';

    var dispContainer = document.getElementById('modalDisponibilidade');
    if (produto.disponibilidade === 'pronta-entrega') {
        dispContainer.innerHTML = '<div class="disponibilidade-modal"><i class="fas fa-check-circle"></i> PRONTA ENTREGA</div>';
    } else if (produto.disponibilidade === 'sob-encomenda') {
        dispContainer.innerHTML = '<div class="disponibilidade-modal"><i class="fas fa-clock"></i> SOB ENCOMENDA</div>';
    } else {
        dispContainer.innerHTML = '';
    }

    var coresContainer = document.getElementById('colorOptions');
    var cores = produto.cores || [];
    coresContainer.innerHTML = cores.map(function(cor, idx) {
        return '<span class="color-option ' + (idx === 0 ? 'active' : '') + '" onclick="selectColor(this)">' + cor + '</span>';
    }).join('');

    updateGallery();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('produtoModal').classList.remove('active');
    document.body.style.overflow = '';
    currentProduto = null;
}

function parseDimensoes(dimensoesStr) {
    var dims = { largura: '', altura: '', profundidade: '' };
    if (!dimensoesStr) return dims;
    var partes = dimensoesStr.split(' x ');
    if (partes.length >= 1) dims.largura = partes[0].trim();
    if (partes.length >= 2) dims.altura = partes[1].trim();
    if (partes.length >= 3) dims.profundidade = partes[2].trim();
    return dims;
}

function selectColor(element) {
    document.querySelectorAll('.color-option').forEach(function(el) { el.classList.remove('active'); });
    element.classList.add('active');
}

function updateGallery() {
    if (!currentProduto) return;
    var imagens = currentProduto.imagens || [];
    document.getElementById('modalMainImage').src = imagens[currentImageIndex] || '';
    document.getElementById('galleryThumbs').innerHTML = imagens.map(function(img, idx) {
        return '<img src="' + img + '" class="' + (idx === currentImageIndex ? 'active' : '') + '" onclick="setImage(' + idx + ')" alt="Miniatura">';
    }).join('');
}

function changeImage(direction) {
    if (!currentProduto) return;
    var imagens = currentProduto.imagens || [];
    currentImageIndex = (currentImageIndex + direction + imagens.length) % imagens.length;
    updateGallery();
}

function setImage(index) {
    currentImageIndex = index;
    updateGallery();
}

// ============================================
// WHATSAPP
// ============================================
function enviarWhatsApp() {
    if (!currentProduto) return;

    const cor = document.querySelector('.color-option.active')?.textContent || (currentProduto.cores || [])[0] || '';
    const disp = currentProduto.disponibilidade === 'pronta-entrega' ? '*Pronta Entrega* ✅' : '*Sob Encomenda* ⏰';
    const cod = currentProduto.codigo || 'N/A';

    const mensagem = `*Ribeiro Móveis e Colchões* 👑\n\nOlá! Tenho interesse no produto:\n\n📦 *${currentProduto.nome}*\n🎨 Cor: ${cor}\n${disp}\n🏷️ Código: ${cod}\n\nPor favor, me envie mais informações`;

    const mensagemCodificada = encodeURIComponent(mensagem);
    const numero = '5512991652100';

    window.open(`https://wa.me/${numero}?text=${mensagemCodificada}`, '_blank');
}

// ============================================
// UTILITÁRIOS
// ============================================
function formatarPreco(preco) {
    return preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getColorCode(cor) {
    if (!cor) return '#ddd';
    var cores = {
        'marrom': '#8B4513', 'bege': '#F5F5DC', 'cinza': '#808080', 'branco': '#FFFFFF', 'preto': '#000000',
        'madeira': '#DEB887', 'carvalho': '#D2691E', 'nogueira': '#654321', 'vinho': '#722F37',
        'azul marinho': '#000080', 'azul': '#0000FF', 'vermelho': '#FF0000', 'verde': '#008000',
        'amarelo': '#FFFF00', 'rosa': '#FFC0CB', 'roxo': '#800080', 'laranja': '#FFA500',
        'off white': '#F5F5F5', 'grafite': '#414141', 'offwhite': '#F5F5F5', 'off-white': '#F5F5F5'
    };
    return cores[cor.toLowerCase().trim()] || '#ddd';
}

function mostrarErro(mensagem) {
    const grid = document.getElementById('produtosGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                <p style="color: #666; margin-bottom: 15px;">${mensagem || 'Erro ao carregar produtos.'}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #5D1A1A; color: #D4AF37; border: none; cursor: pointer; border-radius: 5px;">
                    <i class="fas fa-sync"></i> Recarregar
                </button>
            </div>
        `;
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    var modal = document.getElementById('produtoModal');
    if (event.target === modal) {
        closeModal();
    }
};

// CSS de animação
var style = document.createElement('style');
style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
document.head.appendChild(style);

console.log('[Ribeiro] ✅ App.js v2.0 carregado completamente');
