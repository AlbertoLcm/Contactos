const express = require('express');
const { json } = require('express/lib/response');
const hbs = require('hbs');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PassportLocal = require('passport-local').Strategy;


const conexion = require('./database/db.js');

require('dotenv').config();

const app = express();
const port = process.env.PORT;

//handlebars
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// Middlewers
// Lectura y parseo del body 
app.use(express.urlencoded({extended:false}));
app.use(express(json))

app.use(express.static('public'));

// configuramos para la session
app.use(cookieParser('secreto'));
app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    app.locals.user = req.user;
    console.log(app.locals)
    next();
  });


passport.use(new PassportLocal((username, password, done) => {
    conexion.query('select * from Usuarios where Username = ? and Password = ?',[username, password], (error, results) => {
        try {
            
            console.log(results[0].Username, results[0].Password)
            
            if(username === results[0].Username && password === results[0].Password){
                return done(null, {id:results[0].IdUsuario, name:results[0].NombreUsuario})
            }else{
                done(null, false);
            
            }
        } catch (error) {
            console.log(error, 'Usuario o contrase;a inconrrecto');
        }

    });
    
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
})

//deserializacion 
passport.deserializeUser((id, done) => {
    conexion.query('select * from Usuarios where IdUsuario = ?',[id], (error, results) => {
        if(error) throw error;
        done(null, {id:results[0].IdUsuario, name:results[0].NombreUsuario});
        console.log(results[0].IdUsuario);
    });
})

app.get('/', (req, res) => {
    res.render('login');
});


app.post('/', passport.authenticate('local', {
    successRedirect: '/agenda',
    failureRedirect: '/',
    passReqToCallback: true
    }));

// fin de session

// Routers del login
app.post('/registrar', (req, res) => {
    const {nombre, apellido, username, password} = req.body;

    conexion.query('insert into Usuarios set ?', {
        NombreUsuario: nombre, 
        ApellidoUsuario: apellido, 
        Username: username, 
        Password: password}, (error, results) => {
        if (error) throw error;
        res.redirect('/agenda');
    });
});

app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

// Routes de agenda
app.get('/agenda', (req, res, next)=>{
    if(req.isAuthenticated()) return next();

    res.redirect('/');
}, (req, res) => {
    const id = req.user.id;
    conexion.query('select * from contactos where IdUsuario = ?', [id], (error, contactos) => {
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

app.post('/agenda/guardar/:id', (req, res) => {
    const {txtNombre, txtApellido, txtNumero} = req.body;
    const id = req.params.id;

    conexion.query('insert into Contactos set ?', {
        NombreContacto: txtNombre, 
        ApellidoContacto: txtApellido, 
        Numero: txtNumero, 
        IdUsuario: id}, (error, results) => {
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