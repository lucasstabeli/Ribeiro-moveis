// ============================================
// RIBEIRIO MÓVEIS - APP.JS v3.3 (CORREÇÃO FINAL)
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
    'dormitorio': { nome: 'Dormitório', icone: 'fa-bed', subcategorias: ['Beliche','Box', 'Box Baú', 'Cabeceira', 'Cama', 'Colchão', 'Cômoda', 'Guarda-Roupa', 'Mesa de Cabeceira', 'Recamier'] },
    'cozinha': { nome: 'Cozinha', icone: 'fa-utensils', subcategorias: ['Armário', 'Cadeira', 'Conj. Mesa de Jantar', 'Mesa'] },
    'sala': { nome: 'Sala', icone: 'fa-couch', subcategorias: ['Aparador', 'Buffet', 'Cristaleira', 'Home', 'Mesa de Centro', 'Painel', 'Poltrona', 'Rack', 'Sofá'] },
    'colchoes': { nome: 'Colchões', icone: 'fa-mattress-pillow', subcategorias: ['Solteiro', 'Solteiro King', 'Casal', 'Queen', 'King'] },
    'complementos': { nome: 'Complementos', icone: 'fa-plus-circle', subcategorias: ['Mesa de Computador', 'Multiuso', 'Multiuso Área Serviço', 'Penteadeira', 'Puff'] },
    'infantil': { nome: 'Infantil', icone: 'fa-baby', subcategorias: ['Berço', 'Cômoda', 'Guarda-Roupa'] }
};

// ============================================
// BANCO DE DADOS DE CORES CORRIGIDO
// ============================================
const CORES_MOVELARIA = {
    // Madeiras
    'carvalho': '#654321',           // era #65470865
    'carvalho claro': '#D4B896',
    'carvalho escuro': '#8B6914',
    'noce': '#8B5A2B',
    'noce bronze': '#785635',        // era #785635ab
    'noce milano': '#9A8260',
    'noce málaga': '#8B6914',
    'malaga': '#8B6914',
    'málaga': '#8B6914',
    'nogueira': '#5C4033',
    'nogueira clara': '#8B7355',
    'nogueira escura': '#3D2817',
    'imbuia': '#66300a',             // era #9f510dc0
    'imbuia clara': '#A89F91',
    'imbuia escura': '#6B5D4F',
    'freijo': '#A0522D',             // era #a1671bd7
    'freijo claro': '#D4B896',
    'freijo escuro': '#9A8260',
    'cinamomo': '#AB601B',           // era #ab601b
    'cinamomo claro': '#E5D4B8',
    'cinamomo escuro': '#B8956A',
    'cedro': '#A0522D',              // era #ae761ac0
    'cedro claro': '#A0522D',
    'cedro escuro': '#654321',
    'amendoa': '#D4A574',
    'amêndoa': '#D4A574',
    'amendoa off white': '#E8DCC4',
    'castanho': '#8B4513',
    'castanho claro': '#A0522D',
    'castanho escuro': '#654321',
    'tabaco': '#6B4423',
    'tabaco claro': '#8B5A2B',
    'tabaco escuro': '#4A2C17',
    'wengue': '#3D2817',
    'wengué': '#3D2817',
    'chocolate': '#5D4037',
    'chocolate claro': '#8D6E63',
    'chocolate escuro': '#3E2723',
    'canela': '#9C6B4F',
    'caramelo': '#C68E17',
    'avelã': '#A89F91',
    'avela': '#A89F91',
    'cerejeira': '#df7f26',           // era #df7f26 (cerejeira é marrom-avermelhado!)
    'rústico': '#8B7355',
    'rustico': '#8B7355',
    'rústico claro': '#A89F91',
    'rústico escuro': '#6B5344',

    // Cores sólidas
    'branco': '#FFFFFF',
    'off white': '#f8f8e0',          // off white mais quente
    'offwhite': '#f8f8e0',
    'off-white': '#f8f8e0',
    'creme': '#FFFDD0',
    'bege': '#F5F5DC',
    'bege claro': '#F5F5DC',
    'bege escuro': '#C2B280',
    'marfim': '#FFFFF0',
    'cinza': '#808080',
    'bali': '#D3D3D3',               // era #d3d3d3eb
    'cinza escuro': '#696969',
    'cinza grafite': '#414141',
    'grafite': '#414141',
    'preto': '#000000',
    'preto fosco': '#1C1C1C',
    'marrom': '#8B4513',
    'marrom claro': '#A0522D',
    'marrom escuro': '#654321',
    'marrom café': '#6F4E37',

    // Cores vibrantes
    'vermelho': '#FF0000',
    'vermelho cereja': '#DE3163',
    'bordô': '#800020',
    'bordo': '#800020',
    'vinho': '#722F37',
    'vinho marsala': '#B57170',
    'azul': '#0000FF',
    'azul marinho': '#000080',
    'azul royal': '#4169E1',
    'azul petróleo': '#004953',
    'azul turquesa': '#40E0D0',
    'azul claro': '#87CEEB',
    'azul escuro': '#00008B',
    'verde': '#008000',
    'verde musgo': '#6B8E23',
    'verde oliva': '#808000',
    'verde militar': '#4B5320',
    'verde claro': '#90EE90',
    'verde escuro': '#006400',
    'amarelo': '#FFFF00',
    'amarelo ouro': '#FFD700',
    'dourado': '#D4AF37',
    'rosa': '#FFC0CB',
    'rosa claro': '#FFB6C1',
    'rosa escuro': '#E75480',
    'roxo': '#800080',
    'roxo claro': '#BA55D3',
    'lilás': '#C8A2C8',
    'lilas': '#C8A2C8',
    'laranja': '#FFA500',
    'laranja claro': '#FFB347',
    'salmon': '#FA8072',
    'salmão': '#FA8072',
    'salmao': '#FA8072',
    'coral': '#FF7F50',
    'pêssego': '#FFDAB9',
    'pessego': '#FFDAB9',
    'turquesa': '#40E0D0',
    'tiffany': '#0ABAB5',
    'cobre': '#B87333',
    'bronze': '#CD7F32',
    'prata': '#C0C0C0',
    'platina': '#E5E4E2',

    // Neutros
    'nature': '#AB601B',
    'chumbo': '#3f3f3f',
    'cru': '#F5DEB3',
    'linho': '#FAF0E6',
    'areia': '#F4A460',
    'terra': '#8B4513',
    'concreto': '#959595',
    'cimento': '#7F7F7F',
    'grafite escuro': '#2F2F2F',
    'carbono': '#333333',
    'titânio': '#878787',
    'titanio': '#878787'
};

// ============================================
// FUNÇÃO INTELIGENTE DE CORES COM SUPORTE A CORES COMPOSTAS
// ============================================
function getColorCode(cor) {
    if (!cor || typeof cor !== 'string') return '#ddd';

    // Verificar se é cor composta (contém - ou / ou &)
    const separadores = /[-/&|,]/;
    if (separadores.test(cor)) {
        const cores = cor.split(separadores).map(c => c.trim()).filter(c => c);
        if (cores.length >= 2) {
            // Retorna array de cores para gradiente
            return {
                tipo: 'gradiente',
                cores: cores.map(c => getSingleColorCode(c))
            };
        }
    }

    return {
        tipo: 'solido',
        cor: getSingleColorCode(cor)
    };
}

function getSingleColorCode(cor) {
    // Normalizar: remover acentos, lowercase, trim
    let corNormalizada = cor.toLowerCase().trim();

    // Remover acentos
    corNormalizada = corNormalizada.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Tentar match exato primeiro
    if (CORES_MOVELARIA[corNormalizada]) {
        return CORES_MOVELARIA[corNormalizada];
    }

    // Tentar match parcial
    for (let [nome, hex] of Object.entries(CORES_MOVELARIA)) {
        if (corNormalizada.includes(nome) || nome.includes(corNormalizada)) {
            return hex;
        }
    }

    // Tentar encontrar palavras individuais
    const palavras = corNormalizada.split(/\s+/);
    for (let palavra of palavras) {
        if (palavra.length > 2 && CORES_MOVELARIA[palavra]) {
            return CORES_MOVELARIA[palavra];
        }
    }

    // Gerar cor consistente baseada no nome
    return gerarCorDoNome(corNormalizada);
}

// Gerar cor consistente baseada no nome
function gerarCorDoNome(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    const s = 25 + Math.abs((hash >> 8) % 35);
    const l = 60 + Math.abs((hash >> 16) % 25);

    return hslToHex(h, s, l);
}

// Converter HSL para HEX
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Gerar estilo CSS para a bolinha de cor
function getColorStyle(corObj) {
    if (corObj.tipo === 'gradiente') {
        const cores = corObj.cores;
        if (cores.length === 2) {
            return `background: linear-gradient(135deg, ${cores[0]} 50%, ${cores[1]} 50%);`;
        } else {
            return `background: linear-gradient(135deg, ${cores.join(', ')});`;
        }
    }
    return `background-color: ${corObj.cor};`;
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Ribeiro] 🚀 Iniciando app v3.3 (correções finais)...');

    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        console.log('[Ribeiro] ✅ Firebase inicializado');

        try {
            localStorage.removeItem('produtos_backup');
        } catch(e) {}

        carregarProdutosFirebase();
    } catch (e) {
        console.error('[Ribeiro] ❌ Erro ao inicializar:', e);
        mostrarErro('Erro ao conectar com o banco de dados');
    }
});

// ============================================
// CARREGAR PRODUTOS
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

    if (firebaseListener) {
        firebaseListener.off();
    }

    const produtosRef = db.ref('produtos');

    firebaseListener = produtosRef.on('value', function(snapshot) {
        const dados = snapshot.val();
        console.log('[Ribeiro] 📥 Dados recebidos:', dados ? Object.keys(dados).length : 0, 'itens');

        if (dados) {
            produtos = Object.keys(dados).map(function(key) {
                return { 
                    id: key, 
                    ...dados[key],
                    ordem: (dados[key].ordem !== undefined && dados[key].ordem !== null) 
                        ? parseInt(dados[key].ordem) 
                        : 999999
                };
            });

            console.log('[Ribeiro] ✅ Produtos processados:', produtos.length);
            renderProdutos('todos');

        } else {
            produtos = [];
            renderProdutos('todos');
        }
    }, function(error) {
        console.error('[Ribeiro] ❌ Erro Firebase:', error);
        mostrarErro('Erro ao carregar produtos. Verifique sua conexão.');
    });
}

// ============================================
// RENDERIZAÇÃO
// ============================================
function renderProdutos(filtro, subcategoria) {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (produtos.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #D4AF37; margin-bottom: 15px;"></i>
                <h3 style="color: #5D1A1A; margin-bottom: 10px; font-size: 1.1rem;">Nenhum produto cadastrado</h3>
            </div>
        `;
        return;
    }

    let produtosOrdenados = [...produtos].sort(function(a, b) {
        return a.ordem - b.ordem;
    });

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

    if (filtrados.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px;"><p style="color: #666;">Nenhum produto encontrado nesta categoria.</p></div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    filtrados.forEach(function(produto) {
        fragment.appendChild(createProdutoCard(produto));
    });

    grid.appendChild(fragment);

    // Atualizar botões ativos
    document.querySelectorAll('.ambiente-btn').forEach(function(btn) {
        btn.classList.remove('active');
        var onclick = btn.getAttribute('onclick') || '';
        if (filtro === 'todos' && onclick.includes("'todos'")) {
            btn.classList.add('active');
        } else if (filtro !== 'todos' && onclick.includes("'" + filtro + "'")) {
            btn.classList.add('active');
        }
    });
}

function createProdutoCard(produto) {
    var card = document.createElement('div');
    card.className = 'produto-card';
    card.onclick = function() { openModal(produto); };

    // Processar cores com a nova função inteligente
    var cores = (produto.cores || []).slice(0, 4).map(function(cor) {
        const corObj = getColorCode(cor);
        const style = getColorStyle(corObj);
        return '<span class="color-dot" style="' + style + '" title="' + cor + '"></span>';
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

function filtrarProdutos(ambiente) {
    renderProdutos(ambiente);
}

function filtrarSubcategoria(ambiente, subcategoria) {
    if (event) event.stopPropagation();
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

    // Cores no modal também usando a função inteligente
    var coresContainer = document.getElementById('colorOptions');
    var cores = produto.cores || [];
    coresContainer.innerHTML = cores.map(function(cor, idx) {
        const corObj = getColorCode(cor);
        let style = '';
        if (corObj.tipo === 'gradiente') {
            style = getColorStyle(corObj);
        } else {
            style = 'background-color: ' + corObj.cor + '; color: ' + (isLightColor(corObj.cor) ? '#333' : '#fff') + ';';
        }
        return '<span class="color-option ' + (idx === 0 ? 'active' : '') + '" onclick="selectColor(this)" style="' + style + '">' + cor + '</span>';
    }).join('');

    updateGallery();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function isLightColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
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
    const disp = currentProduto.disponibilidade === 'pronta-entrega' ? '*Pronta Entrega* ' : '*Sob Encomenda* ';
    const cod = currentProduto.codigo || 'N/A';

    const mensagem = `*Ribeiro Móveis e Colchões* \n\nOlá! Tenho interesse no produto:\n\n *${currentProduto.nome}*\n Cor: ${cor}\n${disp}\n Código: ${cod}\n\nPor favor, me envie mais informações`;

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

function mostrarErro(mensagem) {
    const grid = document.getElementById('produtosGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                <p style="color: #666; margin-bottom: 15px;">${mensagem || 'Erro ao carregar produtos.'}</p>
                <button onclick="carregarProdutosFirebase()" style="padding: 10px 20px; background: #5D1A1A; color: #D4AF37; border: none; cursor: pointer; border-radius: 5px;">
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

console.log('[Ribeiro] ✅ App.js v3.3 carregado (cores corrigidas + gradientes)');
