const express = require('express');
const { json } = require('express/lib/response');
const hbs = require('hbs');
const conexion = require('./database/db.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT;



//handlebars
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// Lectura y parseo del body 
app.use(express.urlencoded({extended:false}));
app.use(express(json))

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/agenda', (req, res) => {
    conexion.query('select * from contactos', (error, contactos) => {
        if (error) throw error;
        res.render('agenda', {contactos});
    });
});

app.get('/agenda/delete/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('delete from contactos where IdContacto = ?;', [id], (error, contactos) => {
        if (error) throw error;
        res.redirect('/agenda');
    });
    console.log('Hola desde el delete', id);
});

app.post('/agenda/guardar', (req, res) => {
    const {txtNombre, txtApellido, txtNumero} = req.body;
    const iduser = 1;

    conexion.query('insert into Contactos set ?', {
        NombreContacto: txtNombre, 
        ApellidoContacto: txtApellido, 
        Numero: txtNumero, 
        IdUsuario: iduser}, (error, results) => {
        if (error) throw error;
        res.redirect('/agenda');
    });
});

app.get('/agenda/edit/:id', (req, res) => {

    const id = req.params.id;

    conexion.query('select * from contactos where IdContacto = ?', [id],(error, contactos) => {
        if (error) throw error;
        res.render('edit', {contacto:contactos[0]});
        console.log(contactos[0]);
    });
});

app.post('/agenda/actualizar', (req, res) => {
    const {txtNombre, txtApellido, txtNumero, id} = req.body;
    const iduser = 1;

    conexion.query('update Contactos set ? where IdContacto = ?', [{
        NombreContacto: txtNombre, 
        ApellidoContacto: txtApellido, 
        Numero: txtNumero},
        id], (error, results) => {
        if (error) throw error;
        res.redirect('/agenda');
    });
});

app.get('*', (req, res) => {
    res.render('404');
});

app.listen(port, () => {
    console.log(`Listen on port http://localhost:${port}`);
});