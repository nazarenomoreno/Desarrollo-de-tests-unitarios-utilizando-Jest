const url = 'http://localhost:3000/api/products/';
let resultados = '';

const mostrar = (articulos) => {
    const contenedor = document.querySelector('tbody');
    resultados = ''; // Limpiar resultados antes de mostrar nuevos
    articulos.forEach(articulo => {
        resultados += `
            <tr id="articulo-${articulo.id}">
                <td>${articulo.id}</td>
                <td>${articulo.descripcion}</td>
                <td>${articulo.stock}</td>
                <td>${articulo.precio}</td>
                <td class="text-center">
                    <a class="btnEditar btn btn-primary">Editar</a>
                    <a class="btnBorrar btn btn-danger">Borrar</a>
                </td>
            </tr>
        `;
    });
    contenedor.innerHTML = resultados;
};

const init = () => {
    const contenedor = document.querySelector('tbody');
    const modalArticulo = new bootstrap.Modal(document.getElementById('modalArticulo'));
    const formArticulo = document.querySelector('form');
    const descripcion = document.getElementById('descripcion');
    const precio = document.getElementById('precio');
    const stock = document.getElementById('stock');
    let opcion = '';

    const btnCrear = document.getElementById('btnCrear');
    btnCrear.addEventListener('click', () => {
        descripcion.value = '';
        precio.value = '';
        stock.value = '';
        modalArticulo.show();
        opcion = 'crear';
    });

    fetch(url)
        .then(response => response.json())
        .then(data => mostrar(data))
        .catch(error => console.log(error));

    const on = (element, event, selector, handler) => {
        element.addEventListener(event, e => {
            if (e.target.closest(selector)) {
                handler(e);
            }
        });
    };

    // Editar
    let idForm = 0;
    on(document, 'click', '.btnEditar', e => {
        const fila = e.target.parentNode.parentNode;
        idForm = fila.children[0].innerHTML;
        const descripcionForm = fila.children[1].innerHTML;
        const precioForm = fila.children[3].innerHTML; // Ajustado para obtener el precio correcto
        const stockForm = fila.children[2].innerHTML; // Ajustado para obtener el stock correcto
        descripcion.value = descripcionForm;
        precio.value = precioForm;
        stock.value = stockForm;
        opcion = 'editar';
        modalArticulo.show();
    });

    // Borrar
    on(document, 'click', '.btnBorrar', e => {
        const fila = e.target.parentNode.parentNode;
        const id = fila.firstElementChild.innerHTML;
        alertify.confirm("Seguro que desea eliminar este producto?",
            function () {
                fetch(url + id, {
                    method: 'DELETE'
                })
                    .then(res => res.json())
                    .then(() => {
                        fila.remove(); // Eliminar fila del DOM
                        alertify.success('Producto borrado!');
                    })
                    .catch(error => {
                        console.error("Error al borrar el artículo:", error);
                        alertify.error('Error al borrar el producto!');
                    });
            },
            function () {
                alertify.error('Acción cancelada!');
            });
    });

    // CREAR/EDITAR
    formArticulo.addEventListener('submit', (e) => {
        e.preventDefault();
        const articulo = {
            descripcion: descripcion.value,
            precio: precio.value,
            stock: stock.value
        };
        if (opcion === 'crear') {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articulo)
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Artículo creado:", data);
                    mostrar([data]);
                })
                .catch(error => console.log("Error al añadir el artículo:", error));
        }
        if (opcion === 'editar') {
            fetch(url + idForm, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(articulo)
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Artículo editado:", data); // Asegúrate de registrar el artículo editado
                    const fila = document.querySelector(`#articulo-${idForm}`);
                    fila.children[1].innerHTML = descripcion.value;
                    fila.children[2].innerHTML = stock.value; // Muestra el stock correcto
                    fila.children[3].innerHTML = precio.value; // Muestra el precio correcto
                })
                .catch(error => console.log("Error al editar el artículo:", error));
        }
        modalArticulo.hide();
    });
};

// Solo ejecutar init si estamos en un entorno de navegador real
if (typeof window !== 'undefined') {
    init();
}

// Exportar las funciones para usarlas en pruebas
module.exports = {
    init,
    mostrar
};








































