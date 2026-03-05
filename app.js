// ============================================
// RIBEIRIO MÓVEIS - APP.JS COM FIREBASE
// SINCRONIZAÇÃO EM TEMPO REAL PC ↔ CELULAR
// ============================================

let produtos = [];
let currentImageIndex = 0;
let currentProduto = null;
let db = null; // Referência do Firebase

// CONFIGURAÇÃO DO FIREBASE (use os dados da sua foto!)
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
// INICIALIZAÇÃO DO FIREBASE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    
    // Carrega produtos em tempo real
    carregarProdutosFirebase();
});

// ============================================
// CARREGAR PRODUTOS EM TEMPO REAL
// ============================================
function carregarProdutosFirebase() {
    const grid = document.getElementById('produtosGrid');
    if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><div style="width: 40px; height: 40px; border: 4px solid #D4AF37; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div><p style="color: #5D1A1A;">Carregando produtos...</p></div>';
    }

    // Backup local primeiro (para não ficar sem nada)
    const backup = localStorage.getItem('produtos_backup');
    if (backup) {
        try {
            produtos = JSON.parse(backup);
            renderProdutos('todos');
        } catch (e) {}
    }

    // 🔥 ESCUTA EM TEMPO REAL DO FIREBASE
    // Toda vez que alguém adiciona/edita no PC, atualiza no celular automaticamente!
    const produtosRef = db.ref('produtos');
    
    produtosRef.on('value', function(snapshot) {
        const dados = snapshot.val();
        
        if (dados) {
            // Converte objeto Firebase em array
            produtos = Object.keys(dados).map(function(key) {
                return {
                    id: key,
                    ...dados[key]
                };
            });
            
            // Salva backup local
            localStorage.setItem('produtos_backup', JSON.stringify(produtos));
            
            // Atualiza a tela
            renderProdutos('todos');
            console.log('✅ Produtos atualizados do Firebase:', produtos.length);
        } else {
            // Se não tem dados no Firebase, mostra vazio
            produtos = [];
            renderProdutos('todos');
        }
    }, function(error) {
        console.error('❌ Erro Firebase:', error);
        // Se der erro, usa backup local
        if (produtos.length === 0) {
            mostrarErro();
        }
    });
}

// ============================================
// FUNÇÃO PARA ADICIONAR/EDITAR PRODUTO (USE NO ADMIN)
// ============================================
function salvarProdutoFirebase(produto) {
    const produtosRef = db.ref('produtos');
    
    if (produto.id) {
        // Editar existente
        return produtosRef.child(produto.id).update(produto);
    } else {
        // Novo produto
        const novoId = produtosRef.push().key;
        produto.id = novoId;
        return produtosRef.child(novoId).set(produto);
    }
}

// ============================================
// FUNÇÃO PARA DELETAR PRODUTO (USE NO ADMIN)
// ============================================
function deletarProdutoFirebase(id) {
    return db.ref('produtos/' + id).remove();
}

// ============================================
// UPLOAD DE IMAGEM PARA FIREBASE STORAGE
// ============================================
function uploadImagemFirebase(arquivo, callback) {
    const storageRef = firebase.storage().ref();
    const nomeArquivo = 'produtos/' + Date.now() + '_' + arquivo.name;
    const uploadRef = storageRef.child(nomeArquivo);
    
    uploadRef.put(arquivo).then(function(snapshot) {
        return snapshot.ref.getDownloadURL();
    }).then(function(url) {
        callback(null, url);
    }).catch(function(error) {
        callback(error, null);
    });
}

// ============================================
// RESTO DO CÓDIGO (RENDER, MODAL, ETC) - MANTIDO IGUAL
// ============================================
function mostrarErro() {
    const grid = document.getElementById('produtosGrid');
    if (grid) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i><p style="color: #666; margin-bottom: 15px;">Erro ao carregar produtos.</p><button onclick="carregarProdutosFirebase()" style="padding: 10px 20px; background: #5D1A1A; color: #D4AF37; border: none; cursor: pointer;">Tentar novamente</button></div>';
    }
}

function renderProdutos(filtro, subcategoria) {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (produtos.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;"><i class="fas fa-box-open" style="font-size: 3rem; color: #D4AF37; margin-bottom: 15px;"></i><h3 style="color: #5D1A1A; margin-bottom: 10px; font-size: 1.1rem;">Nenhum produto cadastrado</h3><p style="color: #666; font-size: 0.9rem;">Acesse a área administrativa para adicionar produtos.</p></div>';
        return;
    }
    let filtrados;
    if (filtro === 'todos') {
        filtrados = produtos.slice();
    } else if (subcategoria) {
        filtrados = produtos.filter(function(p) { return p.ambiente === filtro && p.subcategoria === subcategoria; });
    } else {
        filtrados = produtos.filter(function(p) { return p.ambiente === filtro; });
    }
    if (filtrados.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;"><p style="color: #666;">Nenhum produto encontrado nesta categoria.</p></div>';
        return;
    }
    filtrados.forEach(function(produto) {
        grid.appendChild(createProdutoCard(produto));
    });
    document.querySelectorAll('.ambiente-btn').forEach(function(btn) {
        btn.classList.remove('active');
        var onclick = btn.getAttribute('onclick');
        if (filtro === 'todos' && onclick && onclick.indexOf("'todos'") > -1) {
            btn.classList.add('active');
        } else if (filtro !== 'todos' && onclick && onclick.indexOf("'" + filtro + "'") > -1) {
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
    var svgPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg ' width='400' height='300'%3E%3Crect fill='%23f5f5f5' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle'%3ESem Imagem%3C/text%3E%3C/svg%3E";
    card.innerHTML = '<div class="produto-image"><img src="' + imgSrc + '" alt="' + (produto.nome || 'Produto') + '" loading="lazy" onerror="this.src=\'' + svgPlaceholder + '\'"></div><div class="produto-info"><h3>' + (produto.nome || 'Produto') + '</h3><p class="produto-price">R$ ' + formatarPreco(produto.preco || 0) + '</p><div class="produto-colors">' + cores + ((produto.cores || []).length > 4 ? '<span class="color-dot" style="background: linear-gradient(45deg, #ddd, #999); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #666;">+</span>' : '') + '</div><button class="produto-btn">Ver Detalhes <i class="fas fa-arrow-right" style="margin-left: 5px;"></i></button></div>';
    return card;
}

function filtrarProdutos(ambiente) {
    renderProdutos(ambiente);
}

function filtrarSubcategoria(ambiente, subcategoria) {
    if (event) event.stopPropagation();
    renderProdutos(ambiente, subcategoria);
}

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

function closeModal() {
    document.getElementById('produtoModal').classList.remove('active');
    currentProduto = null;
}

// WHATSAPP - LINK CORRIGIDO PARA FUNCIONAR EM TODOS OS CELULARES
function enviarWhatsApp() {
    if (!currentProduto) return;
    
    const cor = document.querySelector('.color-option.active')?.textContent || (currentProduto.cores || [])[0] || '';
    const disp = currentProduto.disponibilidade === 'pronta-entrega' ? '*Pronta Entrega* ✅' : '*Sob Encomenda* ⏰';
    const cod = currentProduto.codigo || 'N/A';
    
    // Cria a mensagem formatada
    const mensagem = `*Ribeiro Móveis e Colchões* 👑\n\nOlá! Tenho interesse no produto:\n\n📦 *${currentProduto.nome}*\n🎨 Cor: ${cor}\n${disp}\n🏷️ Código: ${cod}\n\nPor favor, me envie mais informações`;
    
    // Codifica a mensagem para URL (remove espaços e caracteres especiais)
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // NÚMERO CORRETO SEM ESPAÇOS E COM CÓDIGO DO PAÍS
    const numero = '5512991652100'; // 55 = Brasil, 12 = DDD, 991652100 = número
    
    // Cria o link correto do WhatsApp API
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${numero}&text=${mensagemCodificada}`;
    
    // Abre em nova aba
    window.open(linkWhatsApp, '_blank');
}

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

window.onclick = function(event) {
    var modal = document.getElementById('produtoModal');
    if (event.target === modal) {
        closeModal();
    }
};

var style = document.createElement('style');
style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';

document.head.appendChild(style);
