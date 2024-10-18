var express = require('express');
var cors = require('cors');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const con = mysql.createConnection({
    host: "127.0.0.1",
    user: "dos",
    password: "22dos02",
    database: 'dos'
});

con.connect((err) => {
    if (err) throw err;
    console.log("Conectado a la base de datos");
});

// Configurción del transporte de correo
//const transporter = nodemailer.createTransport({
//    service: 'gmail',
//    auth: {
//        user: 'envio.prueba',
//        pass: 'kKdf<65DM7nQ=j~hCs4tH^'
//    }
//});

//Opcion 2?
const transporter = nodemailer.createTransport({
    host: 'correo.ips.edu.ar',
    port: 465,
    secure: true,
    auth: {
        user: 'envio.prueba',
        pass: 'kKdf<65DM7nQ=j~hCs4tH^'
    },
//    tls: {
//        rejectUnauthorized: false
//    }
});

app.listen(3012, () => console.log("Servidor escuchando en el puerto 3012"));

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res) => {
    const { email, name, surname, phone } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    const linkExpiration = Date.now() + 8 * 60 * 60 * 1000; // 8 horas
    const password = crypto.randomBytes(8).toString('hex'); // Genera una contraseña temporal

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO usuarios_autorizados (nombre, apellido, mail, numero_telefono, verification_token, token_expiration, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
    con.query(sql, [name, surname, email, phone, token, linkExpiration, hashedPassword], async (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo ya está en uso' });
            } else {
                return res.status(500).json({ error: 'Error al registrar usuario' });
            }
        }

        const mailOptions = {
            from: 'envio.prueba@correo.ips.edu.ar',
            to: email,
            subject: 'Verifica tu correo electrónico',
            text: `Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico y activar tu cuenta:
                   http://186.136.155.242:30012/verify-email?token=${token}&expires=${linkExpiration}`
        };
        console.log("Antes de send mail");
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Error al enviar el correo de verificación' });
                console.log("NO SE ENVIO NADA");
            }
            res.status(200).json({ message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' });
            console.log("MailEnviado");
        });
        console.log("Llegue");
    });
    console.log("Ruta Registro");
});

// Ruta para verificar el correo electrónico
app.get('/verify-email', (req, res) => {
    const { token, expires } = req.query;
    console.log("Se ejecuta verify-email");

    // Validar si el token ha expirado
    if (Date.now() > parseInt(expires)) {
        return res.status(400).send('El enlace ha expirado');
    }

    // Generar una contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedTempPassword = bcrypt.hashSync(tempPassword, 10);

    // Buscar el usuario por el token antes de actualizar
    const sqlUser = "SELECT mail FROM usuarios_autorizados WHERE verification_token = ? AND token_expiration > ?";
    con.query(sqlUser, [token, Date.now()], (err, userResult) => {
        if (err) {
            console.log("Error al buscar el usuario: ", err);
            return res.status(500).json({ error: 'Error al verificar el correo' });
        }

        if (userResult.length === 0) {
            return res.status(400).send('Token inválido o expirado');
        }

        const email = userResult[0].mail;

        // Ahora actualizamos el estado del usuario y le asignamos la contraseña temporal
        const sql = "UPDATE usuarios_autorizados SET activo = 1, password = ?, verification_token = NULL, token_expiration = NULL WHERE verification_token = ? AND token_expiration > ?";
        con.query(sql, [hashedTempPassword, token, Date.now()], (err, result) => {
            if (err) {
                console.log("Error al actualizar el usuario: ", err);
                return res.status(500).json({ error: 'Error al actualizar el estado del usuario' });
            }

            if (result.affectedRows === 0) {
                return res.status(400).send('Token inválido o expirado');
            }

            console.log("Usuario actualizado con éxito. Enviando correo con la contraseña temporal...");

            // Enviar correo con la contraseña temporal
            const mailOptions = {
                from: 'envio.prueba@correo.ips.edu.ar',
                to: email,
                subject: 'Tu cuenta ha sido verificada',
                text: `Tu cuenta ha sido verificada exitosamente. Aquí está tu contraseña: ${tempPassword}.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error al enviar el correo: ", error);
                    return res.status(500).json({ error: 'Error al enviar la contraseña temporal' });
                }
                console.log("Correo enviado: ", info.response);
                res.send('Correo verificado exitosamente. Revisa tu correo para la contraseña temporal.');
            });
        });
    });
});


// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM usuarios_autorizados WHERE mail = ?";
    con.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar usuario' });
        }

        const user = result[0];
        if (!user || !user.activo) {
            return res.status(400).json({ error: 'Usuario no encontrado o no verificado' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id }, 'tu-clave-secreta', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Ruta para solicitar un nuevo enlace de verificación
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    const linkExpiration = Date.now() + 8 * 60 * 60 * 1000; // 8 horas

    const sql = "UPDATE usuarios_autorizados SET reset_token = ?, reset_token_expiration = ? WHERE mail = ?";
    con.query(sql, [token, linkExpiration, email], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al solicitar el restablecimiento de contraseña' });
        }

        const mailOptions = {
            from: 'envio.prueba@correo.ips.edu.ar',
            to: email,
            subject: 'Restablece tu contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña:
                   http://186.136.155.242:30012/reset-password?token=${token}&expires=${linkExpiration}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ error: 'Error al enviar el correo de restablecimiento de contraseña' });
            }
            res.status(200).json({ message: 'Revisa tu correo para restablecer tu contraseña.' });
        });
    });
});

// Ruta para restablecer la contraseña
app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    const sql = "SELECT * FROM usuarios_autorizados WHERE reset_token = ? AND reset_token_expiration > ?";
    con.query(sql, [token, Date.now()], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error al restablecer la contraseña' });
        }

        const user = result[0];
        if (!user) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updateSql = "UPDATE usuarios_autorizados SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?";
        con.query(updateSql, [hashedPassword, token], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar la contraseña' });
            }
            res.send('Contraseña restablecida exitosamente');
        });
    });
});

// Ruta para obtener todos los usuarios
app.get("/usuarios", (req, res) => {
    con.query("SELECT * FROM usuarios", (err, result, fields) => {
        if (err) throw err;
        res.json(result);
    });
});

// Ruta para agregar un nuevo usuario
app.post("/usuarios", (req, res) => {
    const { nombre, apellido, mail, numero_telefono } = req.body;
    const sql = "INSERT INTO usuarios (nombre, apellido, mail, numero_telefono) VALUES (?, ?, ?, ?)";
    con.query(sql, [nombre, apellido, mail, numero_telefono], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'El correo ya está en uso' });
            } else {
                res.status(500).json({ error: 'Error al agregar usuario' });
            }
        } else {
            res.send(result);
        }
    });
});

// Ruta para modificar un usuario (excepto el mail)
app.put("/usuarios/:mail", (req, res) => {
    const { nombre, apellido, numero_telefono } = req.body;
    const mail = req.params.mail;
    const sql = "UPDATE usuarios SET nombre = ?, apellido = ?, numero_telefono = ? WHERE mail = ?";
    con.query(sql, [nombre, apellido, numero_telefono, mail], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        } else {
            res.send(result);
        }
    });
});

app.get("/buscar", (req, res) => {
    let { campo, criterio, valor } = req.query;
    let sql;

    switch (criterio) {
        case 'comienza':
            sql = `SELECT * FROM usuarios WHERE ${campo} LIKE ?`;
            valor = `${valor}%`;
            break;
        case 'termina':
            sql = `SELECT * FROM usuarios WHERE ${campo} LIKE ?`;
            valor = `%${valor}`;
            break;
        case 'contiene':
            sql = `SELECT * FROM usuarios WHERE ${campo} LIKE ?`;
            valor = `%${valor}%`;
            break;
        default:
            return res.status(400).send("Criterio de búsqueda inválido");
    }

    con.query(sql, [valor], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error al buscar usuarios' });
        } else {
            res.json(result);
        }
    });
});
