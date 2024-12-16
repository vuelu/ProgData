const jsonServer=require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;


server.use(middlewares);
server.use(router);
server.listen(port);


// Importar dependencias necesarias
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // Instala con: npm install node-fetch

// Inicializar la aplicación
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Diccionario para almacenar códigos de recuperación temporales
const recoveryCodes = {};

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "TU_CORREO@gmail.com", // Cambia por tu correo
    pass: "TU_CONTRASEÑA_APP",   // Genera una contraseña de aplicación en Gmail
  },
});

// Ruta para enviar el código de recuperación
app.post("/send-code", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Correo recibido para recuperación:", email);

    // Consultar la lista de usuarios desde la API
    const response = await fetch("https://progdata.onrender.com/UDocente");
    if (!response.ok) {
      console.error("Error al consultar los usuarios:", response.statusText);
      return res.status(500).json({ error: "No se pudo verificar el correo." });
    }

    const users = await response.json();
    console.log("Usuarios obtenidos:", users);

    // Verificar si el correo existe en la lista
    const user = users.find((u) => u.email === email);
    if (!user) {
      console.error("El correo no está registrado:", email);
      return res.status(404).json({ error: "El correo no está registrado." });
    }

    // Generar el código de recuperación
    const recoveryCode = Math.floor(100000 + Math.random() * 900000); // Código de 6 dígitos
    recoveryCodes[email] = recoveryCode;

    console.log("Código de recuperación generado:", recoveryCode);

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
        console.error("Error al enviar el correo:", error);
        return res.status(500).json({ error: "Error al enviar el correo." });
      }
      console.log("Correo enviado exitosamente a:", email, "Respuesta:", info.response);
      res.status(200).json({ message: "Código enviado con éxito." });
    });
  } catch (error) {
    console.error("Error en el proceso de recuperación:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// Ruta para verificar el código de recuperación
app.post("/verify-code", (req, res) => {
  const { email, code } = req.body;

  if (recoveryCodes[email] && recoveryCodes[email] == code) {
    delete recoveryCodes[email]; // Eliminar el código después de usarlo
    return res.status(200).json({ message: "Código verificado correctamente." });
  }

  res.status(400).json({ error: "Código inválido o expirado." });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
