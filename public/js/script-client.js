document.getElementById('form-cliente').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Coleta os dados do formulário
    const cliente = {
        nome: document.getElementById('nome').value,
        contato: document.getElementById('contato').value,
        endereco: document.getElementById('endereco').value,
        atendimento: document.getElementById('horario-atendimento').value,
        entrega: document.getElementById('horario-entrega').value,
        observacao: document.getElementById('observacao').value
    };

    console.log(cliente);

    try {
        const response = await fetch('http://localhost:3000/add-client', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(cliente)
        });

        if (response.ok) {
            alert('Cliente adicionado com sucesso!');
            document.getElementById('form-cliente').reset();
        } else {
            const errorText = await response.text();
            alert(`Erro: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
    }
});