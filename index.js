const jsonServer=require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;


server.use(middlewares);
server.use(router);
server.listen(port);


const express = require('express');
const nodemailer = require('nodemailer');
const app = express();


// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu-correo@gmail.com',
    pass: 'tu-contraseña'
  }
});

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Ruta para enviar correo de recuperación
app.post('/recuperar', (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: 'tu-correo@gmail.com',
    to: email,
    subject: 'Recuperación de contraseña',
    text: 'Haz clic en el enlace para recuperar tu contraseña.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error al enviar el correo');
    }
    res.status(200).send('Correo enviado: ' + info.response);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
