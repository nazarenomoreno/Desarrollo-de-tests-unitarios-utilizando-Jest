const EXPRESS = require('express');
const MYSQL = require('mysql');
const CORS = require('cors');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const APP = EXPRESS();
APP.use(EXPRESS.json());
APP.use(CORS());

// Si el entorno no es "test", pedimos los datos de la base de datos
if (process.env.NODE_ENV !== 'test') {
    rl.question('Por favor, ingresa tu contraseña MySQL: ', (password) => {
        rl.question('Por favor, ingresa el nombre de la base de datos: ', (database) => {

            const CONNECTION = MYSQL.createConnection({
                host: 'localhost',
                user: 'root',      
                password: password,
                database: database  
            });

            iniciarApp(CONNECTION);
            rl.close();
        });
    });
} else {
    // Mock connection para pruebas
    const CONNECTION = MYSQL.createConnection();
    iniciarApp(CONNECTION);
}

function iniciarApp(CONNECTION) {
    // Aquí se definen las rutas
    APP.get('/', (req, res) => {
        res.send('¡Conexión exitosa!');
    });

    APP.get('/api/products', (req, res) => {
        CONNECTION.query('SELECT ID as id, descripcion, precio, stock FROM products', (error, rows) => {
            if (error) {
                res.status(500).send('Error de servidor');
            } else {
                res.status(200).send(rows);
            }
        });
    });

    APP.post('/api/products', (req, res) => {
        let data = { descripcion: req.body.descripcion, precio: req.body.precio, stock: req.body.stock };
        let sql = "INSERT INTO products SET ?";
        CONNECTION.query(sql, data, (error, results) => {
            if (error) {
                res.status(500).send('Error de servidor');
            } else {
                Object.assign(data, { id: results.insertId });
                res.status(200).send(data);
            }
        });
    });

    APP.put('/api/products/:id', (req, res) => {
        let id = req.params.id;
        let { descripcion, precio, stock } = req.body;
        let sql = "UPDATE products SET descripcion = ?, precio = ?, stock = ? WHERE id = ?";
        CONNECTION.query(sql, [descripcion, precio, stock, id], (error, results) => {
            if (error) {
                res.status(500).send('Error de servidor');
            } else {
                res.status(200).send(results);
            }
        });
    });

    APP.delete('/api/products/:id', (req, res) => {
        CONNECTION.query('DELETE FROM products WHERE id = ?', [req.params.id], (error, rows) => {
            if (error) {
                res.status(500).send('Error de servidor');
            } else {
                res.status(200).send(rows);
            }
        });
    });
}

module.exports = APP;
