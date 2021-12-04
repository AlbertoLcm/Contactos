document.addEventListener('DOMContentLoaded', () => {
    const add = document.getElementById('btnAdd');
    const nombre = document.getElementById('txtNombre');
    const apellido = document.getElementById('txtApellido');
    const numero = document.getElementById('txtNumero');
    const table = document.getElementById('table');

    const addContact = () => {
        const insert = table.insertRow();
        insert.innerHTML = `
            <th scope="row">1</th>
            <td>${nombre.value}</td>
            <td>${apellido.value}</td>
            <td>${numero.value}</td>
            <td class="text-center">
              <button class="btn btn-primary mb-1">
              <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger mb-1">
                <i class="fa fa-trash"></i>
              </button>
            </td>
        `;
    }
    add.onclick = addContact;
});