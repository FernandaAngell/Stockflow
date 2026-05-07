const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

app.get("/", (req, res) => {
  res.send("Backend + MySQL funcionando 🚀");
});


// =========================
// OBTENER PRODUCTOS
// =========================
app.get("/productos", (req, res) => {

  db.query("SELECT * FROM productos", (err, results) => {

    if (err) {
      console.log(err);
      res.status(500).send("Error obteniendo productos");
    } else {
      res.json(results);
    }

  });

});


// =========================
// AGREGAR PRODUCTO
// =========================
app.post("/productos", (req, res) => {

  const {
    nombre,
    categoria,
    stock,
    minimo,
    precio,
    proveedor
  } = req.body;

  const sql = `
    INSERT INTO productos
    (nombre, categoria, stock, minimo, precio, proveedor)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nombre, categoria, stock, minimo, precio, proveedor],

    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error agregando producto");
      } else {

        // HISTORIAL
        db.query(
          "INSERT INTO historial (tipo, descripcion) VALUES (?, ?)",
          ["add", `Producto "${nombre}" agregado`]
        );

        res.send("Producto agregado 😎");
      }

    }
  );

});


// =========================
// ELIMINAR PRODUCTO
// =========================
app.delete("/productos/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM productos WHERE id = ?",
    [id],

    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error eliminando producto");
      } else {

        // HISTORIAL
        db.query(
          "INSERT INTO historial (tipo, descripcion) VALUES (?, ?)",
          ["delete", `Producto eliminado ID ${id}`]
        );

        res.send("Producto eliminado 🗑️");
      }

    }
  );

});


// =========================
// EDITAR PRODUCTO
// =========================
app.put("/productos/:id", (req, res) => {

  const { id } = req.params;

  const {
    nombre,
    categoria,
    stock,
    minimo,
    precio,
    proveedor
  } = req.body;

  const sql = `
    UPDATE productos
    SET
      nombre = ?,
      categoria = ?,
      stock = ?,
      minimo = ?,
      precio = ?,
      proveedor = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [nombre, categoria, stock, minimo, precio, proveedor, id],

    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error actualizando producto");
      } else {

        // HISTORIAL
        db.query(
          "INSERT INTO historial (tipo, descripcion) VALUES (?, ?)",
          ["edit", `Producto "${nombre}" actualizado`]
        );

        res.send("Producto actualizado 😎");
      }

    }
  );

});


// =========================
// OBTENER HISTORIAL
// =========================
app.get("/historial", (req, res) => {

  db.query(
    "SELECT * FROM historial ORDER BY fecha DESC",

    (err, results) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error obteniendo historial");
      } else {
        res.json(results);
      }

    }
  );

});

// =========================
// REGISTRAR VENTA
// =========================
app.post("/ventas", (req, res) => {

  const {
    productoId,
    cantidad,
    cliente
  } = req.body;

  db.query(
    "SELECT * FROM productos WHERE id = ?",
    [productoId],

    (err, results) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Error buscando producto");
      }

      if (!results.length) {
        return res.status(404).send("Producto no encontrado");
      }

      const producto = results[0];

      if (producto.stock < cantidad) {
        return res.status(400).send("Stock insuficiente");
      }

      const nuevoStock = producto.stock - cantidad;

      db.query(
        "UPDATE productos SET stock = ? WHERE id = ?",
        [nuevoStock, productoId],

        (err2) => {

          if (err2) {
            console.log(err2);
            return res.status(500).send("Error actualizando stock");
          }

          db.query(
            "INSERT INTO historial (tipo, descripcion) VALUES (?, ?)",
            [
              "sale",
              `Venta de ${cantidad}x ${producto.nombre}${cliente ? " - Cliente: " + cliente : ""}`
            ]
          );

          res.send("Venta registrada 😎");

        }
      );

    }
  );

});

// =========================
// SERVIDOR
// =========================
app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});