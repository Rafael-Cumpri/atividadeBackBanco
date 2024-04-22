const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3036

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'atividadeback',
    password: 'ds564',
    port: 5432,
});

const catchAge = (datadenascimento) => {
    const today = new Date();
    const birthDate = new Date(datadenascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const catchSign = (datadenascimento) => {
    const date = new Date(datadenascimento);
    const day = date.getDate();
    const month = date.getMonth();
    if ((month == 2 && day >= 21) || (month == 3 && day <= 19)) {
        return 'Áries';
    } else if ((month == 3 && day >= 20) || (month == 4 && day <= 20)) {
        return 'Touro';
    } else if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) {
        return 'Gêmeos';
    } else if ((month == 5 && day >= 21) || (month == 6 && day <= 21)) {
        return 'Câncer';
    } else if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) {
        return 'Leão';
    } else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) {
        return 'Virgem';
    } else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) {
        return 'Libra';
    } else if ((month == 9 && day >= 23) || (month == 10 && day <= 21)) {
        return 'Escorpião';
    } else if ((month == 10 && day >= 22) || (month == 11 && day <= 21)) {
        return 'Sagitário';
    } else if ((month == 11 && day >= 22) || (month == 0 && day <= 19)) {
        return 'Capricórnio';
    } else if ((month == 0 && day >= 20) || (month == 1 && day <= 18)) {
        return 'Aquário';
    } else if ((month == 1 && day >= 19) || (month == 2 && day <= 20)) {
        return 'Peixes';
    }
}

app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json({
            total: result.rowCount,
            users: result.rows,
        });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [
            id,
        ]);
        if (result.rowCount == 0) {
            return res.status(404).send('User not found!');
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/users', async (req, res) => {
    const { nome, sobrenome, datadenascimento, email } = req.body;
    console.log(nome, sobrenome, datadenascimento, email)
    const idade = catchAge(datadenascimento);
    const signo = catchSign(datadenascimento);
    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nome, sobrenome, datadenascimento, email, idade, signo) VALUES ($1, $2, $3, $4, $5, $6)',
            ['nome', sobrenome, datadenascimento, email, idade, signo]
        );
        res.status(201).send('User created successfully!');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, sobrenome, datadenascimento, email } = req.body;
    const idade = catchAge(datadenascimento);
    const signo = catchSign(datadenascimento);
    try {
        const result = await pool.query(
            'UPDATE usuarios SET nome = $1, sobrenome = $2, datadenascimento = $3, email = $4, idade = $5, signo = $6 WHERE id = $7',
            [nome, sobrenome, datadenascimento, email, idade, signo, id]
        );
        if (result.rowCount == 0) {
            return res.status(404).send('User not found!');
        }
        res.send('User updated successfully!');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        if (result.rowCount == 0) {
            return res.status(404).send('User not found!');
        }
        res.send('User deleted successfully!');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});