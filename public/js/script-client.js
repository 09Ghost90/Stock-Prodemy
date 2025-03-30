document.getElementById('form-cliente').addEventListener('submit', async function (event) {
    event.preventDefault();

    const cliente = {
        nome: document.getElementById('nome').value,
        contato: document.getElementById('contato').value,
        endereco: document.getElementById('endereco').value,
        atendimento: document.getElementById('horario-atendimento').value,
        entrega: document.getElementById('horario-entrega').value,
        observacao: document.getElementById('observacao').value
    };

    if (!cliente.nome || !cliente.contato || !cliente.endereco || !cliente.atendimento || !cliente.entrega) {
        alert('Preencha todos os campos.');
        return;
    }

    // Validação do formato:
    const validacoes = {
        contato: /^(\d{10,11})$/,
        // Adicionar mais campos conforme necessário
    }

    try {
        const response = await fetch('http://localhost:3000/add-client', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(cliente)
        });

        if (response.ok) {
            alert('Cliente adicionado com sucesso!');
            document.getElementById('form-cliente').reset();
            loadClients();
        } else {
            const errorText = await response.text();
            alert(`Erro: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
    }
});

// Função para Carregar os produtos
async function loadClients() {

    // Ainda não implementado no Backend
    const response = await fetch(`http://localhost:3000/get-clients?page=${pagina}&limit=${itensPorPagina}`);
    const data = await response.json();
    const clientes = data.clientes;
    const total = data.total;
    const totalPaginas = Math.ceil(total / itensPorPagina);
    
    try {
        const response = await fetch('http://localhost:3000/get-clients');
        const clients = await response.json();
        console.log('Clientes recebidos:', clients);

        if (!Array.isArray(clients)) {
            console.error('Resposta inesperada:', clients);
            return;
        }

        const tableBody = document.querySelector('#tabela-clientes tbody');
        tableBody.innerHTML = '';

        if (clients.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="8">Nenhum cliente encontrado.</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${client.nome}</td>
                <td>${client.contato}</td>
                <td>${client.endereco}</td>
                <td>${client.atendimento}</td>
                <td>${client.entrega}</td>
                <td>${client.observacao}</td>
                <td><button class="btn btn-editar btn-sm" data-nome="${client.nome}"><i class="fas fa-edit"></i> Editar</button></td>
                <td><button class="btn btn-excluir btn-sm" data-nome="${client.nome}"><i class="fas fa-trash"></i> Excluir</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', () => {
                const nomeCliente = button.getAttribute('data-nome');
                editarCliente(nomeCliente);
            });
        });

        document.querySelectorAll('.btn-excluir').forEach(button => {
            button.addEventListener('click', () => {
                const nomeCliente = button.getAttribute('data-nome');
                excluirCliente(nomeCliente);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function editarCliente(nomeCliente) {
    try {
        const response = await fetch(`http://localhost:3000/get-clients?search=${nomeCliente}`);
        const clientes = await response.json();

        if (clientes.length === 0) {
            alert('Cliente não encontrado.');
            return;
        }

        const cliente = clientes[0];

        document.getElementById('nome-editar').value = cliente.nome;
        document.getElementById('contato-editar').value = cliente.contato;
        document.getElementById('endereco-editar').value = cliente.endereco;
        document.getElementById('horario-atendimento-editar').value = cliente.atendimento;
        document.getElementById('horario-entrega-editar').value = cliente.entrega;
        document.getElementById('observacao-editar').value = cliente.observacao;

        abrirModalEdicao();
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
    }
}

document.getElementById('close-modal-editar').addEventListener('click', function () {
    document.getElementById('modal-editar-cliente').style.display = 'none';
});

function abrirModalEdicao() {
    document.getElementById('modal-editar-cliente').style.display = 'block';
}

// Event listener para o formulário de edição de cliente
document.getElementById('form-editar-cliente').addEventListener('submit', async function (event) {
    event.preventDefault();
    await submitEdicaoCliente();
});

/**
 * Função para enviar os dados atualizados do cliente para o servidor
 * Coleta os dados do formulário de edição e envia uma requisição PATCH
 */
async function submitEdicaoCliente() {
    const clienteAtualizado = {
        nome: document.getElementById('nome-editar').value,
        contato: document.getElementById('contato-editar').value,
        endereco: document.getElementById('endereco-editar').value,
        atendimento: document.getElementById('horario-atendimento-editar').value,
        entrega: document.getElementById('horario-entrega-editar').value,
        observacao: document.getElementById('observacao-editar').value
    };

    // Validação dos campos obrigatórios
    if (!clienteAtualizado.nome || !clienteAtualizado.contato || !clienteAtualizado.endereco || 
        !clienteAtualizado.atendimento || !clienteAtualizado.entrega) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/edit-client', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(clienteAtualizado)
        });

        if (response.ok) {
            alert('Cliente atualizado com sucesso!');
            document.getElementById('modal-editar-cliente').style.display = 'none';
            loadClients(); // Recarrega a lista de clientes
        } else {
            const errorText = await response.text();
            alert(`Erro ao atualizar cliente: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        alert('Ocorreu um erro ao tentar atualizar o cliente. Verifique o console para mais detalhes.');
    }
}

async function excluirCliente(nomeCliente) {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}"?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/delete-client?nome=${encodeURIComponent(nomeCliente)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Cliente excluído com sucesso!');
            loadClients(); // Recarrega a lista de clientes
        } else {
            const errorText = await response.text();
            alert(`Erro ao excluir cliente: ${errorText}`);
            console.log('Erro no Client.js');
        }
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Ocorreu um erro ao tentar excluir o cliente. Verifique o console para mais detalhes.');
    }
}

// Feedback visual:
function mostrarLoading() {
    // ... 
}

// Adicioanr classes de sucesso/erro nos campos
function marcarcampoInvalidado(campo) {
    campo.classList.add('Campo-invalido');
}

// Adicionar função de busca
async function buscarClientes(termo) {
    const response = await fetch(`http://localhost:3000/get-clients?search=${encodeURIComponent(termo)}`);
    // ... resto do código
}

// Adicionar cache local para melhorar performance
function cacheClientes(dados) {
    localStorage.setItem('clientes', JSON.stringify(dados));
}

window.addEventListener('online', () => {
    loadClients(); // Recarregar dados quando voltar online
});
