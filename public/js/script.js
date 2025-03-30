// Função para exibir mensagens de alerta
function showAlert(message, isSuccess = true) {
    alert(message);
    if (isSuccess) {
        document.getElementById('form-produto').reset();
        loadProducts();
    }
}

// Função para fazer requisições HTTP
async function fetchData(url, options) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Adicionar o evento de submit do formulário
document.getElementById('form-produto').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Captura os valores do formulário
    const codigo = document.getElementById('codigo').value;
    const unidade = document.getElementById('unidade').value;
    const nome = document.getElementById('nome').value;
    const preco_unid = document.getElementById('preco-unid').value;
    const preco = document.getElementById('preco').value;
    const quantidade = document.getElementById('quantidade').value;

    if (!codigo || !unidade || !nome || !preco_unid || !preco || !quantidade) {
        showAlert('Preencha todos os campos.', false);
        return;
    }

    try {
        await fetchData('http://localhost:3000/add-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                codigo: parseInt(codigo),
                unidade,
                nome,
                preco_unid: parseFloat(preco_unid),
                preco: parseFloat(preco),
                quantidade: parseInt(quantidade),
            }),
        });

        showAlert('Produto adicionado com sucesso!');
    } catch (error) {
        showAlert(`Erro: ${error.message}`, false);
    }
});

// Função para Carregar os produtos
async function loadProducts() {
    try {
        const products = await fetchData('http://localhost:3000/get-products');
        console.log('Produtos recebidos:', products);

        const tableBody = document.querySelector('#tabela-estoque tbody');
        tableBody.innerHTML = '';

        if (products.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6">Nenhum produto encontrado.</td>';
            tableBody.appendChild(emptyRow);
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.codigo}</td>
                <td>${product.unidade}</td>
                <td>${product.nome}</td>
                <td>R$ ${product.preco_unid}</td>
                <td>R$ ${parseFloat(product.preco).toFixed(2)}</td>
                <td>${product.quantidade}</td>
                <td><button class="btn-excluir" data-codigo="${product.codigo}">
                    <i class="fa fa-trash"></i>
                </button></td>
                <td><button class="btn-editar" data-codigo="${product.codigo}">
                    <i class="fa fa-edit"></i>
                </button></td>
            `;
            tableBody.appendChild(row);
        });

        // Excluir produto
        document.querySelectorAll('.btn-excluir').forEach(button => {
            button.addEventListener('click', async function () {
                const codigo = parseInt(button.getAttribute('data-codigo'));
                try {
                    await fetchData(`http://localhost:3000/delete-product?codigo=${codigo}`, {
                        method: 'DELETE',
                    });

                    showAlert('Produto excluído com sucesso!');
                } catch (error) {
                    showAlert('Erro ao excluir o produto. Tente novamente.', false);
                }
            });
        });

        // Editar produto
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', async function () {
                const codigo = parseInt(button.getAttribute('data-codigo'));
                const product = products.find(p => p.codigo === codigo);

                if (!product) {
                    showAlert('Produto não fornecido.', false);
                    return;
                }

                document.getElementById('codigo-editar').value = product.codigo;
                document.getElementById('unidade-editar').value = product.unidade;
                document.getElementById('nome-editar').value = product.nome;
                document.getElementById('preco-editar-unidade').value = product.preco_unid;
                document.getElementById('preco-editar').value = product.preco;
                document.getElementById('quantidade-editar').value = product.quantidade;

                document.getElementById('modal-editar').style.display = 'block';
            });
        });

    } catch (error) {
        console.error('Erro ao carregar os produtos:', error);
    }
}

document.getElementById('form-editar-produto').addEventListener('submit', async function (event) {
    event.preventDefault();
    await submitEdicaoProduto();
})

async function submitEdicaoProduto() {
    const updateProducts = {
        codigo: document.getElementById('codigo-editar').value,
        unidade: document.getElementById('unidade-editar').value,
        nome: document.getElementById('nome-editar').value,
        preco_unid: document.getElementById('preco-editar-unidade').value,
        preco: document.getElementById('preco-editar').value,
        quantidade: document.getElementById('quantidade-editar').value,
    };

    try {
        await fetchData('http://localhost:3000/edit-product', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(updateProducts),
        });

        showAlert('Produto atualizado com sucesso!');
        closeModal();
    } catch (error) {
        showAlert('Erro ao editar produto.', false);
    }
};

// Fechar o modal ao clicar no botão ou fora do modal
document.getElementById('close-modal').addEventListener('click', closeModal);
window.addEventListener('click', function (event) {
    const modal = document.getElementById('modal-editar');
    if (event.target === modal) {
        closeModal();
    }
});

function closeModal() {
    document.getElementById('modal-editar').style.display = 'none';
    // Limpar os campos do formulário de edição
    document.getElementById('form-editar-produto').reset();
}

loadProducts();