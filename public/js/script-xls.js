document.getElementById('btn-export-excel').addEventListener('click', function () {
    console.log('Botão de exportar para Excel foi clicado');

    // Coletando os dados da tabela

    async function loadProducts() {
        try {
            const response = await fetch('http://localhost:3000/get-products');
            const products = await response.json();

            if (products.length === 0) {
                alert('Nenhum produto encontrado.');
                return;
            }

            const data = products.map(product => {
                return {
                    codigo: product.codigo,
                    unidade: product.unidade,
                    categoria: product.categoria,
                    nome: product.nome,
                    preco: product.preco,
                    quantidade: product.quantidade,
                };
                
            });

            const saveResponse = await fetch('http://localhost:3000/save-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (saveResponse.ok) {
                alert('Arquivo salvo com sucesso no servidor!');
            } else {
                alert('Erro ao salvar o arquivo no servidor.');
            }

        } catch (error) {
            console.error('Erro ao carregar os produtos:', error);
        }
    }

    loadProducts();
});