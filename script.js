// Dados de estado da aplicação 
const dadosFinanceiros = {
    saldo: 0,
    receitas: 0,
    despesas: 0,
    categorias: {
        'alimentacao': {
            nome: 'Alimentação',
            usado: 0,
            limite: 0,
            percentual: 0
        },
        'transporte': {
            nome: 'Transporte',
            usado: 0,
            limite: 0,
            percentual: 0
        },
        'lazer': {
            nome: 'Lazer',
            usado: 0,
            limite: 0,
            percentual: 0
        },
        'moradia': {
            nome: 'Moradia',
            usado: 0,
            limite: 0,
            percentual: 0
        },
        'utilidades': {
            nome: 'Utilidades',
            usado: 0,
            limite: 0,
            percentual: 0
        }
    },
    transacoes: [],
    metas: []
};

// DOM Elements
const modais = {
    transacao: document.getElementById('transacaoModal'),
    categoria: document.getElementById('categoriaModal'),
    meta: document.getElementById('metaModal')
};

const botoes = {
    novaTransacao: document.getElementById('btnNovaTransacao'),
    verTransacoes: document.getElementById('verTodasTransacoes'),
    novaMeta: document.getElementById('novaMeta'),
    editarCategoria: document.querySelectorAll('.editar-categoria')
};

const tabelas = {
    transacoes: document.getElementById('transacoesTabela')
};

const containers = {
    metas: document.getElementById('metasContainer')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização
    carregarDadosSalvos();
    atualizarInterface();
    
    // Event listeners para modais
    botoes.novaTransacao.addEventListener('click', () => abrirModal(modais.transacao));
    botoes.novaMeta.addEventListener('click', () => abrirModal(modais.meta));
    
    // Fechar modais com X
    document.querySelectorAll('.close-modal').forEach(botao => {
        botao.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            fecharModal(modal);
        });
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            fecharModal(e.target);
        }
    });
    
    // Formulários
    document.getElementById('transacaoForm').addEventListener('submit', adicionarTransacao);
    document.getElementById('categoriaForm').addEventListener('submit', atualizarCategoria);
    document.getElementById('metaForm').addEventListener('submit', adicionarMeta);
    
    // Botões de editar categoria
    botoes.editarCategoria.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const categoriaCard = e.target.closest('.categoria-card');
            const categoriaId = categoriaCard.dataset.categoria;
            
            abrirEditarCategoria(categoriaId);
        });
    });
});

// Funções de gerenciamento de interface
function abrirModal(modal) {
    modal.style.display = 'flex';
    // Limpar os campos do formulário
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Definir data atual para campos de data
    const dataField = modal.querySelector('input[type="date"]');
    if (dataField) {
        const hoje = new Date().toISOString().split('T')[0];
        dataField.value = hoje;
    }
}

function fecharModal(modal) {
    modal.style.display = 'none';
}

function abrirEditarCategoria(categoriaId) {
    const categoria = dadosFinanceiros.categorias[categoriaId];
    
    if (!categoria) return;
    
    document.getElementById('categoriaNome').value = categoria.nome;
    document.getElementById('categoriaLimite').value = categoria.limite;
    document.getElementById('categoriaForm').dataset.categoriaId = categoriaId;
    
    abrirModal(modais.categoria);
}

// Funções para gerenciamento de dados
function carregarDadosSalvos() {
    const dadosSalvos = localStorage.getItem('dadosFinanceiros');
    
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        
        // Atualizar o objeto de dados com os valores salvos
        dadosFinanceiros.saldo = dados.saldo || 0;
        dadosFinanceiros.receitas = dados.receitas || 0;
        dadosFinanceiros.despesas = dados.despesas || 0;
        
        // Atualizar categorias
        if (dados.categorias) {
            Object.keys(dados.categorias).forEach(cat => {
                if (dadosFinanceiros.categorias[cat]) {
                    dadosFinanceiros.categorias[cat] = dados.categorias[cat];
                }
            });
        }
        
        // Atualizar transações
        dadosFinanceiros.transacoes = dados.transacoes || [];
        
        // Atualizar metas
        dadosFinanceiros.metas = dados.metas || [];
    }
}

function salvarDados() {
    localStorage.setItem('dadosFinanceiros', JSON.stringify(dadosFinanceiros));
}

// Funções de atualização da interface
function atualizarInterface() {
    atualizarSumario();
    atualizarCategoriasUI();
    atualizarTransacoesUI();
    atualizarMetasUI();
    atualizarGraficos();
}

function atualizarSumario() {
    // Atualizar valores nos cards principais
    document.getElementById('saldoTotal').textContent = formatarMoeda(dadosFinanceiros.saldo);
    document.getElementById('receitasTotal').textContent = formatarMoeda(dadosFinanceiros.receitas);
    document.getElementById('despesasTotal').textContent = formatarMoeda(dadosFinanceiros.despesas);
    
    // TODO: Calcular percentuais de variação
    document.getElementById('saldoPercentual').textContent = "0%";
    document.getElementById('receitasPercentual').textContent = "0%";
    document.getElementById('despesasPercentual').textContent = "0%";
}

function atualizarCategoriasUI() {
    Object.keys(dadosFinanceiros.categorias).forEach(categoriaId => {
        const card = document.querySelector(`.categoria-card[data-categoria="${categoriaId}"]`);
        
        if (!card) return;
        
        const categoria = dadosFinanceiros.categorias[categoriaId];
        const percentual = categoria.limite > 0 ? (categoria.usado / categoria.limite * 100) : 0;
        const restante = categoria.limite - categoria.usado;
        
        // Atualizar valores
        card.querySelector('.card-amount').innerHTML = `${formatarMoeda(categoria.usado)} <span class="goal-total">/ ${formatarMoeda(categoria.limite)}</span>`;
        
        // Atualizar barra de progresso
        const progressBar = card.querySelector('.progress-bar');
        progressBar.style.width = `${percentual}%`;
        
        // Definir classes baseadas no percentual
        progressBar.className = 'progress-bar';
        if (percentual >= 90) {
            progressBar.classList.add('danger');
        } else if (percentual >= 70) {
            progressBar.classList.add('warning');
        } else {
            progressBar.classList.add('good');
        }
        
        // Atualizar labels
        card.querySelectorAll('.budget-labels span')[0].textContent = `${Math.round(percentual)}% utilizado`;
        card.querySelectorAll('.budget-labels span')[1].textContent = `${formatarMoeda(restante)} restantes`;
    });
}

function atualizarTransacoesUI() {
    const tbody = tabelas.transacoes;
    
    // Limpar a tabela
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    if (dadosFinanceiros.transacoes.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'sem-dados';
        tr.innerHTML = `<td colspan="6" class="text-center">Nenhuma transação registrada. Clique em '+ Nova Transação' para começar.</td>`;
        tbody.appendChild(tr);
        return;
    }
    
    // Exibir apenas as 5 transações mais recentes
    const transacoesRecentes = [...dadosFinanceiros.transacoes]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);
    
    transacoesRecentes.forEach((transacao, index) => {
        const tr = document.createElement('tr');
        tr.dataset.index = dadosFinanceiros.transacoes.indexOf(transacao);
        
        const status = transacao.tipo === 'receita' ? 'completed' : 'pending';
        const statusText = transacao.tipo === 'receita' ? 'Receita' : 'Despesa';
        
        tr.innerHTML = `
            <td>${transacao.descricao}</td>
            <td>${getCategoriaName(transacao.categoria)}</td>
            <td>${formatarData(transacao.data)}</td>
            <td class="${transacao.tipo === 'receita' ? 'receita' : 'despesa'}">${formatarMoeda(transacao.valor)}</td>
            <td><span class="status ${status}">${statusText}</span></td>
            <td class="acoes">
                <button class="btn-icon remover-transacao" title="Excluir Transação">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Adicionar event listener para o botão de excluir
        tr.querySelector('.remover-transacao').addEventListener('click', () => removerTransacao(tr.dataset.index));
    });
}

function atualizarMetasUI() {
    const container = containers.metas;
    
    // Limpar o container
    container.innerHTML = '';
    
    if (dadosFinanceiros.metas.length === 0) {
        container.innerHTML = `
            <div class="placeholder-message">
                Nenhuma meta financeira registrada. Clique em '+ Nova Meta' para começar a planejar seus objetivos.
            </div>
        `;
        return;
    }
    
    dadosFinanceiros.metas.forEach((meta, index) => {
        const percentual = meta.valorTotal > 0 ? (meta.valorAtual / meta.valorTotal * 100) : 0;
        const restante = meta.valorTotal - meta.valorAtual;
        const dataAlvo = new Date(meta.dataAlvo);
        
        const metaCard = document.createElement('div');
        metaCard.className = 'goal-card';
        metaCard.dataset.metaId = index;
        
        metaCard.innerHTML = `
            <div class="goal-header">
                <h4>${meta.titulo}</h4>
                <div class="goal-actions">
                    <button class="btn-icon editar-meta">✏️</button>
                    <button class="btn-icon remover-meta">🗑️</button>
                </div>
            </div>
            <div class="goal-date">Meta para ${dataAlvo.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}</div>
            <div class="goal-amount">${formatarMoeda(meta.valorAtual)} <span class="goal-total">/ ${formatarMoeda(meta.valorTotal)}</span></div>
            <div class="budget-progress">
                <div class="progress-bar ${percentual >= 100 ? 'success' : 'info'}" style="width: ${Math.min(percentual, 100)}%;"></div>
            </div>
            <div class="budget-labels">
                <span>${Math.round(percentual)}% alcançado</span>
                <span>${formatarMoeda(restante)} restantes</span>
            </div>
        `;
        
        container.appendChild(metaCard);
        
        // Adicionar event listeners para os botões
        metaCard.querySelector('.editar-meta').addEventListener('click', () => editarMeta(index));
        metaCard.querySelector('.remover-meta').addEventListener('click', () => removerMeta(index));
    });
}

// Função para atualizar os gráficos com os dados financeiros
function atualizarGraficos() {
    atualizarGraficoEvolucao();
    atualizarGraficoPizza();
}

// Gráfico de evolução financeira (linha)
function atualizarGraficoEvolucao() {
    const container = document.getElementById('chart-evolucao');
    
    // Limpar o container
    container.innerHTML = '';
    
    if (dadosFinanceiros.transacoes.length === 0) {
        container.textContent = 'Adicione transações para visualizar o gráfico';
        return;
    }
    
    // Criar o canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'evolucaoChart';
    container.appendChild(canvas);
    
    // Processar dados para o gráfico
    const dados = processarDadosEvolucao();
    
    // Criar o gráfico usando Chart.js
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dados.labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: dados.receitas,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: dados.despesas,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Saldo',
                    data: dados.saldos,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatarMoeda(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Processar dados para o gráfico de evolução
function processarDadosEvolucao() {
    // Ordenar transações por data
    const transacoesOrdenadas = [...dadosFinanceiros.transacoes].sort((a, b) => 
        new Date(a.data) - new Date(b.data)
    );
    
    // Agrupar transações por mês
    const transacoesPorMes = {};
    
    transacoesOrdenadas.forEach(transacao => {
        const data = new Date(transacao.data);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        if (!transacoesPorMes[chave]) {
            transacoesPorMes[chave] = {
                receitas: 0,
                despesas: 0
            };
        }
        
        if (transacao.tipo === 'receita') {
            transacoesPorMes[chave].receitas += transacao.valor;
        } else {
            transacoesPorMes[chave].despesas += transacao.valor;
        }
    });
    
    // Converter para arrays para o Chart.js
    const labels = [];
    const receitas = [];
    const despesas = [];
    const saldos = [];
    
    Object.keys(transacoesPorMes).sort().forEach(mes => {
        const [ano, mesNum] = mes.split('-');
        const nomeMes = new Date(ano, mesNum - 1, 1).toLocaleString('pt-BR', { month: 'short' });
        
        labels.push(`${nomeMes}/${ano}`);
        receitas.push(transacoesPorMes[mes].receitas);
        despesas.push(transacoesPorMes[mes].despesas);
        saldos.push(transacoesPorMes[mes].receitas - transacoesPorMes[mes].despesas);
    });
    
    return { labels, receitas, despesas, saldos };
}

// Gráfico de pizza para distribuição de gastos
function atualizarGraficoPizza() {
    const container = document.getElementById('chart-pizza');
    
    // Limpar o container
    container.innerHTML = '';
    
    // Verificar se existem despesas
    let temDespesas = false;
    dadosFinanceiros.transacoes.forEach(transacao => {
        if (transacao.tipo === 'despesa') {
            temDespesas = true;
        }
    });
    
    if (!temDespesas) {
        container.textContent = 'Adicione despesas para visualizar o gráfico';
        return;
    }
    
    // Criar o canvas para o gráfico
    const canvas = document.createElement('canvas');
    canvas.id = 'pizzaChart';
    container.appendChild(canvas);
    
    // Processar dados para o gráfico
    const dados = processarDadosDistribuicao();
    
    // Gerar cores para categorias
    const cores = [
        'rgba(255, 99, 132, 0.7)',   // Vermelho
        'rgba(54, 162, 235, 0.7)',   // Azul
        'rgba(255, 206, 86, 0.7)',   // Amarelo
        'rgba(75, 192, 192, 0.7)',   // Verde-água
        'rgba(153, 102, 255, 0.7)',  // Roxo
        'rgba(255, 159, 64, 0.7)',   // Laranja
        'rgba(199, 199, 199, 0.7)'   // Cinza
    ];
    
    // Criar o gráfico usando Chart.js
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: dados.labels,
            datasets: [{
                data: dados.valores,
                backgroundColor: cores.slice(0, dados.labels.length),
                borderColor: 'white',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatarMoeda(context.parsed);
                            const percentage = Math.round((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Processar dados para o gráfico de distribuição
function processarDadosDistribuicao() {
    // Agrupar despesas por categoria
    const despesasPorCategoria = {};
    
    dadosFinanceiros.transacoes.forEach(transacao => {
        if (transacao.tipo === 'despesa') {
            const nomeCat = getCategoriaName(transacao.categoria);
            
            if (!despesasPorCategoria[nomeCat]) {
                despesasPorCategoria[nomeCat] = 0;
            }
            
            despesasPorCategoria[nomeCat] += transacao.valor;
        }
    });
    
    // Converter para arrays para o Chart.js
    const labels = [];
    const valores = [];
    
    Object.keys(despesasPorCategoria).forEach(categoria => {
        labels.push(categoria);
        valores.push(despesasPorCategoria[categoria]);
    });
    
    return { labels, valores };
}

// Atualizar os percentuais de variação mensal para os cards de resumo
function atualizarPercentuaisVariacao() {
    // Obter dados do mês atual e do mês anterior
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();
    
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;
    
    if (mesAnterior < 0) {
        mesAnterior = 11;
        anoAnterior--;
    }
    
    // Calcular totais para o mês atual
    const totaisMesAtual = calcularTotaisMes(mesAtual, anoAtual);
    const totaisMesAnterior = calcularTotaisMes(mesAnterior, anoAnterior);
    
    // Calcular e exibir percentuais
    const percSaldo = calcularPercentualMudanca(totaisMesAtual.saldo, totaisMesAnterior.saldo);
    const percReceitas = calcularPercentualMudanca(totaisMesAtual.receitas, totaisMesAnterior.receitas);
    const percDespesas = calcularPercentualMudanca(totaisMesAtual.despesas, totaisMesAnterior.despesas);
    
    // Atualizar elementos da UI
    const saldoPerc = document.getElementById('saldoPercentual');
    const receitasPerc = document.getElementById('receitasPercentual');
    const despesasPerc = document.getElementById('despesasPercentual');
    
    saldoPerc.textContent = `${percSaldo}%`;
    saldoPerc.className = percSaldo >= 0 ? 'percentage-up' : 'percentage-down';
    
    receitasPerc.textContent = `${percReceitas}%`;
    receitasPerc.className = percReceitas >= 0 ? 'percentage-up' : 'percentage-down';
    
    despesasPerc.textContent = `${percDespesas}%`;
    // Para despesas, diminuir é positivo
    despesasPerc.className = percDespesas <= 0 ? 'percentage-up' : 'percentage-down';
}

// Calcular totais para um mês específico
function calcularTotaisMes(mes, ano) {
    let receitas = 0;
    let despesas = 0;
    
    dadosFinanceiros.transacoes.forEach(transacao => {
        const data = new Date(transacao.data);
        
        if (data.getMonth() === mes && data.getFullYear() === ano) {
            if (transacao.tipo === 'receita') {
                receitas += transacao.valor;
            } else {
                despesas += transacao.valor;
            }
        }
    });
    
    return {
        receitas,
        despesas,
        saldo: receitas - despesas
    };
}

// Substituir a função atualizarGraficos existente para incluir os percentuais
function atualizarInterface() {
    atualizarSumario();
    atualizarCategoriasUI();
    atualizarTransacoesUI();
    atualizarMetasUI();
    atualizarGraficos();
    atualizarPercentuaisVariacao();
}

// Funções para adicionar/modificar dados
function adicionarTransacao(e) {
    e.preventDefault();
    
    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.getElementById('tipo').value;
    
    if (!descricao || !categoria || !data || isNaN(valor) || valor <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const novaTransacao = {
        descricao,
        categoria,
        data,
        valor,
        tipo,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar à lista de transações
    dadosFinanceiros.transacoes.push(novaTransacao);
    
    // Atualizar saldos
    if (tipo === 'receita') {
        dadosFinanceiros.receitas += valor;
        dadosFinanceiros.saldo += valor;
    } else {
        dadosFinanceiros.despesas += valor;
        dadosFinanceiros.saldo -= valor;
        
        // Atualizar categoria se for uma despesa
        if (dadosFinanceiros.categorias[categoria]) {
            dadosFinanceiros.categorias[categoria].usado += valor;
            const limite = dadosFinanceiros.categorias[categoria].limite;
            dadosFinanceiros.categorias[categoria].percentual = limite > 0 ? (dadosFinanceiros.categorias[categoria].usado / limite * 100) : 0;
        }
    }
    
    // Salvar e atualizar UI
    salvarDados();
    atualizarInterface();
    fecharModal(modais.transacao);
}

function removerTransacao(index) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        const transacao = dadosFinanceiros.transacoes[index];
        
        if (!transacao) return;
        
        // Atualizar saldos
        if (transacao.tipo === 'receita') {
            dadosFinanceiros.receitas -= transacao.valor;
            dadosFinanceiros.saldo -= transacao.valor;
        } else {
            dadosFinanceiros.despesas -= transacao.valor;
            dadosFinanceiros.saldo += transacao.valor;
            
            // Atualizar categoria se for uma despesa
            if (dadosFinanceiros.categorias[transacao.categoria]) {
                dadosFinanceiros.categorias[transacao.categoria].usado -= transacao.valor;
                const limite = dadosFinanceiros.categorias[transacao.categoria].limite;
                dadosFinanceiros.categorias[transacao.categoria].percentual = 
                    limite > 0 ? (dadosFinanceiros.categorias[transacao.categoria].usado / limite * 100) : 0;
            }
        }
        
        // Remover transação da lista
        dadosFinanceiros.transacoes.splice(index, 1);
        
        // Salvar e atualizar UI
        salvarDados();
        atualizarInterface();
    }
}

function atualizarCategoria(e) {
    e.preventDefault();
    
    const categoriaId = e.target.dataset.categoriaId;
    const limite = parseFloat(document.getElementById('categoriaLimite').value);
    
    if (!categoriaId || isNaN(limite) || limite < 0) {
        alert('Por favor, informe um valor válido para o limite.');
        return;
    }
    
    if (dadosFinanceiros.categorias[categoriaId]) {
        dadosFinanceiros.categorias[categoriaId].limite = limite;
        dadosFinanceiros.categorias[categoriaId].percentual = 
            limite > 0 ? (dadosFinanceiros.categorias[categoriaId].usado / limite * 100) : 0;
    }
    
    // Salvar e atualizar UI
    salvarDados();
    atualizarCategoriasUI();
    fecharModal(modais.categoria);
}

function adicionarMeta(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('metaTitulo').value;
    const valorTotal = parseFloat(document.getElementById('metaValorTotal').value);
    const valorAtual = parseFloat(document.getElementById('metaValorAtual').value);
    const dataAlvo = document.getElementById('metaData').value;
    
    if (!titulo || isNaN(valorTotal) || isNaN(valorAtual) || valorTotal <= 0 || !dataAlvo) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const novaMeta = {
        titulo,
        valorTotal,
        valorAtual,
        dataAlvo,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar à lista de metas
    dadosFinanceiros.metas.push(novaMeta);
    
    // Salvar e atualizar UI
    salvarDados();
    atualizarMetasUI();
    fecharModal(modais.meta);
}

function editarMeta(index) {
    const meta = dadosFinanceiros.metas[index];
    
    if (!meta) return;
    
    document.getElementById('metaTitulo').value = meta.titulo;
    document.getElementById('metaValorTotal').value = meta.valorTotal;
    document.getElementById('metaValorAtual').value = meta.valorAtual;
    document.getElementById('metaData').value = meta.dataAlvo;
    
    document.getElementById('metaForm').dataset.metaId = index;
    document.getElementById('metaForm').dataset.editing = 'true';
    
    // Modificar o texto do botão
    const submitBtn = document.getElementById('metaForm').querySelector('button[type="submit"]');
    submitBtn.textContent = 'Atualizar Meta';
    
    // Evento de submit para edição
    document.getElementById('metaForm').onsubmit = function(e) {
        e.preventDefault();
        
        const index = parseInt(this.dataset.metaId);
        const titulo = document.getElementById('metaTitulo').value;
        const valorTotal = parseFloat(document.getElementById('metaValorTotal').value);
        const valorAtual = parseFloat(document.getElementById('metaValorAtual').value);
        const dataAlvo = document.getElementById('metaData').value;
        
        if (!titulo || isNaN(valorTotal) || isNaN(valorAtual) || valorTotal <= 0 || !dataAlvo) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }
        
        dadosFinanceiros.metas[index] = {
            ...dadosFinanceiros.metas[index],
            titulo,
            valorTotal,
            valorAtual,
            dataAlvo,
            ultimaAtualizacao: new Date().toISOString()
        };
        
        // Restaurar o formulário ao estado original
        submitBtn.textContent = 'Adicionar Meta';
        this.dataset.editing = 'false';
        delete this.dataset.metaId;
        this.onsubmit = adicionarMeta;
        
        // Salvar e atualizar UI
        salvarDados();
        atualizarMetasUI();
        fecharModal(modais.meta);
    };
    
    abrirModal(modais.meta);
}

function removerMeta(index) {
    if (confirm('Tem certeza que deseja remover esta meta?')) {
        dadosFinanceiros.metas.splice(index, 1);
        salvarDados();
        atualizarMetasUI();
    }
}

// Funções utilitárias
function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

function getCategoriaName(categoriaId) {
    if (dadosFinanceiros.categorias[categoriaId]) {
        return dadosFinanceiros.categorias[categoriaId].nome;
    }
    
    // Caso especial para categorias de receita
    if (categoriaId === 'receita') return 'Receita';
    if (categoriaId === 'receita-extra') return 'Receita Extra';
    
    return categoriaId;
}

function calcularPercentualMudanca(valorAtual, valorAnterior) {
    if (valorAnterior === 0) return 0;
    return ((valorAtual - valorAnterior) / valorAnterior * 100).toFixed(1);
}