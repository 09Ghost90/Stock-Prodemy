const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bruno1227!',
    database: 'estoque',
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados estabelecida!');
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'static', 'index.html'));
});

app.post('/add-item', (req, res) => {
    const { codigo, categoria, nome, quantidade, preco, unidade } = req.body;
    if (!codigo || !categoria || !nome || !quantidade || !preco || !unidade) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const query = 'INSERT INTO produtos (codigo, categoria, nome, quantidade, preco, unidade) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [codigo, categoria, nome, quantidade, preco, unidade], (err, result) => {
        if (err) {
            console.error('Erro ao inserir produto:', err);
            return res.status(500).send('Erro ao inserir produto.');
        }
        console.log('Produto inserido com sucesso:', result);
        res.status(200).send('Produto inserido com sucesso!');
    });
});

app.get('/get-products', (req, res) => {
    const searchTerm = req.query.search || '';
    const query = 'SELECT * FROM produtos WHERE nome LIKE ?';
    const values = [`%${searchTerm}%`];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).send('Erro ao buscar produtos.');
        }
        console.log('Produtos encontrados:', results);
        res.status(200).json(results);
    });
});

app.patch('/edit-product', (req, res) => {
    const { codigo, categoria, nome, quantidade, preco, unidade } = req.body;

    if (!codigo) {
        return res.status(400).send('Código do produto é obrigatório.');
    }

    connection.query('SELECT * FROM produtos WHERE codigo = ?', [codigo], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.status(500).send('Erro ao buscar produto.');
        }

        if (results.length === 0) {
            return res.status(404).send('Produto não encontrado.');
        }

        const updatesFields = [];
        const values = [];

        if (categoria) {
            updatesFields.push('categoria = ?');
            values.push(categoria);
        }
        if (nome) {
            updatesFields.push('nome = ?');
            values.push(nome);
        }
        if (quantidade) {
            updatesFields.push('quantidade = ?');
            values.push(quantidade);
        }
        if (preco) {
            updatesFields.push('preco = ?');
            values.push(preco);
        }
        if (unidade) {
            updatesFields.push('unidade = ?');
            values.push(unidade);
        }

        values.push(codigo);

        const query = `UPDATE produtos SET ${updatesFields.join(', ')} WHERE codigo = ?`;

        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Erro ao atualizar produto:', err);
                return res.status(500).send('Erro ao atualizar produto.');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Produto não encontrado.');
            }

            console.log('Produto atualizado com sucesso:', result);
            res.status(200).send('Produto atualizado com sucesso!');
        });
    });
});

app.delete('/delete-product', (req, res) => {
    const { codigo } = req.query;
    if (!codigo) {
        return res.status(400).send('Código do produto não fornecido.');
    }

    const checkQuery = 'SELECT * FROM produtos WHERE codigo = ?';
    connection.query(checkQuery, [codigo], (err, result) => {
        if (err) {
            console.error('Erro ao verificar produto:', err);
            return res.status(500).send('Erro ao verificar produto.');
        }

        if (result.length === 0) {
            return res.status(404).send('Produto não encontrado.');
        }

        const deleteQuery = 'DELETE FROM produtos WHERE codigo = ?';
        connection.query(deleteQuery, [codigo], (err, results) => {
            if (err) {
                console.error('Erro ao excluir produto:', err);
                return res.status(500).send('Erro ao excluir produto.');
            }
            res.status(200).send('Produto excluído com sucesso!');
        });
    });
});

app.post('/add-client', (req, res) => {
    console.log(req.body);

    const { nome, contato, endereco, atendimento, entrega, observacao } = req.body;

    if (!nome || !contato || !endereco || !atendimento || !entrega) {
        return res.status(400).send('Todos os campos exceto a observação são obrigatórios.');
    }

    const query = 'INSERT INTO clientes (nome, contato, endereco, atendimento, entrega, observacao) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [nome, contato, endereco, atendimento, entrega, observacao], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar cliente:', err);
            return res.status(500).send('Erro ao adicionar cliente.');
        }
        console.log('Cliente adicionado com sucesso', result);
        res.status(200).send('Cliente adicionado com sucesso!');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/`);
});
