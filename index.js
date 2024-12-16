const jsonServer=require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;


server.use(middlewares);
server.use(router);
server.listen(port);


const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

// Usuarios de ejemplo (puedes conectarlo a tu base de datos)
const users = [
  { email: "docente1@gmail.com", name: "Docente 1" },
  { email: "docente2@gmail.com", name: "Docente 2" },
];

const app = express();
app.use(bodyParser.json());
app.use(cors());

const recoveryCodes = {};

// Configuración de transporte para Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_CORREO@gmail.com", // Cambia esto por tu correo
    pass: "TU_CONTRASEÑA_APP",  // Obtén una contraseña de aplicación desde Gmail
  },
});

// Ruta para enviar el código de recuperación
app.post("/send-code", (req, res) => {
  const { email } = req.body;

  // Verificar si el correo existe en la lista de usuarios
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "El correo no está registrado." });
  }

  // Generar el código de recuperación
  const recoveryCode = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
  recoveryCodes[email] = recoveryCode;

  // Configurar el correo
  const mailOptions = {
    from: "TU_CORREO@gmail.com",
    to: email,
    subject: "Recuperación de contraseña",
    text: `Hola ${user.name},\n\nTu código de recuperación es: ${recoveryCode}\n\nSi no solicitaste este código, ignora este correo.`,
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al enviar el correo." });
    }
    res.status(200).json({ message: "Código enviado con éxito." });
  });
});

// Ruta para verificar el código
app.post("/verify-code", (req, res) => {
  const { email, code } = req.body;

  if (recoveryCodes[email] && recoveryCodes[email] == code) {
    delete recoveryCodes[email]; // Eliminar el código después de su uso
    return res.status(200).json({ message: "Código verificado correctamente." });
  }

  res.status(400).json({ error: "Código inválido o expirado." });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
