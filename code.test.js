const { JSDOM } = require('jsdom');

// Simula el DOM utilizando JSDOM
const { window } = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <table>
        <tbody></tbody>
    </table>
    <form id="articuloForm">
        <input id="descripcion" type="text" />
        <input id="precio" type="text" />
        <input id="stock" type="text" />
        <button id="btnCrear" type="button">Crear</button>
    </form>
    <div id="modalArticulo"></div>
</body>
</html>
`);

global.document = window.document;
global.window = window;

// Simular el objeto bootstrap para las pruebas
global.bootstrap = {
    Modal: class {
        constructor() {}
        show() {}
        hide() {}
    },
};

// Simula alertify
global.alertify = {
    confirm: jest.fn((message, onConfirm, onCancel) => onConfirm()), // Simula confirmación automática
    success: jest.fn(),
    error: jest.fn(),
};

// Importar el código de code.js después de definir el DOM
const { mostrar, init } = require('./code');

describe('Pruebas unitarias para code.js', () => {
    let btnCrear, descripcion, precio, stock, tbody, formArticulo;

    beforeEach(() => {
        // Limpiar el contenido antes de cada prueba
        btnCrear = document.getElementById('btnCrear');
        descripcion = document.getElementById('descripcion');
        precio = document.getElementById('precio');
        stock = document.getElementById('stock');
        tbody = document.querySelector('tbody');
        formArticulo = document.getElementById('articuloForm');

        // Asegurarse de que el tbody está limpio antes de cada prueba
        tbody.innerHTML = '';
        descripcion.value = '';
        precio.value = '';
        stock.value = '';

        // Agregar un artículo para el test de borrar
        const articulo = document.createElement('tr');
        articulo.innerHTML = `
            <td>1</td>
            <td>Producto a Borrar</td>
            <td>10</td>
            <td>100</td>
            <td class="text-center">
                <a class="btnEditar btn btn-primary">Editar</a>
                <a class="btnBorrar btn btn-danger">Borrar</a>
            </td>
        `;
        tbody.appendChild(articulo);

        // Limpiar mocks antes de cada prueba
        jest.clearAllMocks();
    });

    // Test existente: Crear artículo
    test('debería abrir el modal para crear un nuevo artículo', () => {
        btnCrear.click();

        // Verifica que los campos estén vacíos después de abrir el modal
        expect(descripcion.value).toBe('');
        expect(precio.value).toBe('');
        expect(stock.value).toBe('');
    });

    // Test existente: Mostrar artículos
    test('debería mostrar artículos correctamente', () => {
        const articulos = [
            { id: 1, descripcion: 'Producto 1', stock: 10, precio: 100 },
            { id: 2, descripcion: 'Producto 2', stock: 20, precio: 200 },
        ];

        mostrar(articulos);

        const filas = tbody.querySelectorAll('tr');
        expect(filas.length).toBe(2);
        expect(filas[0].children[1].textContent).toBe('Producto 1');
        expect(filas[1].children[1].textContent).toBe('Producto 2');
    });

    // Test existente: Editar artículo
    test('debería abrir el modal y cargar datos para editar un artículo', () => {
        const articulos = [
            { id: 1, descripcion: 'Producto a Editar', stock: 15, precio: 150 },
        ];

        mostrar(articulos);
        const btnEditar = document.querySelector('.btnEditar');
        btnEditar.click();

        expect(descripcion.value).toBe('Producto a Editar');
        expect(precio.value).toBe('150'); // Verifica el precio correcto
        expect(stock.value).toBe('15');
    });

    // Test de borrar artículo ajustado
    test('debería borrar un artículo correctamente', async () => {
        // Mock de la función fetch para simular la eliminación del artículo
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ message: 'Producto borrado!' }),
            })
        );

        const btnBorrar = document.querySelector('.btnBorrar');

        // Simula la acción de hacer clic en el botón "Borrar"
        btnBorrar.click();

        // Espera un poco para que se complete la operación de fetch
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verifica que tbody esté vacío después de la acción
        expect(tbody.innerHTML).toBe(''); // Espera que no haya artículos después de borrar
    });
});






