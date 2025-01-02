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
        alert('Preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/add-item', {
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

        if (response.ok) {
            alert('Produto adicionado com sucesso!');
            document.getElementById('form-produto').reset();
            loadProducts();
        } else {
            const errorText = await response.text();
            alert(`Erro: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
    }
});

// Função para Carregar os produtos
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/get-products');
        const products = await response.json();
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
                    const response = await fetch(`http://localhost:3000/delete-product?codigo=${codigo}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('Produto excluído com sucesso!');
                        loadProducts();
                    } else {
                        alert('Erro ao excluir o produto. Tente novamente.');
                    }
                } catch (error) {
                    console.error('Erro ao excluir o produto:', error);
                }
            });
        });

        // Editar produto
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', async function () {
                const codigo = parseInt(button.getAttribute('data-codigo'));
                const product = products.find(p => p.codigo === codigo);

                if (!product) {
                    alert('Produto não encontrado.');
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

// Fechar o modal ao clicar no botão ou fora do modal
document.getElementById('close-modal').addEventListener('click', closeModal);
window.addEventListener('click', function (event) {
    const modal = this.document.getElementById('modal-editar');
    if (event.target === modal) {
        closeModal();
    }
});

// Submeter o formulário de edição
document.getElementById('form-editar').addEventListener('submit', async function (event) {
    event.preventDefault();  
    
    const updateProducts = {
        codigo: document.getElementById('codigo-editar').value,
        unidade: document.getElementById('unidade-editar').value,
        categoria: document.getElementById('nome-editar').value,
        nome: document.getElementById('preco-editar-unidade').value,
        quantidade: document.getElementById('preco-editar').value,
        preco: document.getElementById('quantidade-editar').value,
    };

    try {
        const response = await fetch('http://localhost:3000/edit-product', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(updateProducts),
        });

        if(response.ok){
            alert('Produto atualizado com sucesso!');
            loadProducts();
            closeModal();
        } else {
            alert('Erro ao editar produto.');
        }

    } catch (error) {
        console.error('Erro ao editar produto:', error);
    }
});

function closeModal() {
    document.getElementById('modal-editar').style.display = 'none';
}

loadProducts();
