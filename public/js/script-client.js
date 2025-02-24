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

async function loadClients() {
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

loadClients();
