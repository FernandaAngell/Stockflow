const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
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
    stock_actual,
    stock_minimo,
    precio,
    proveedor
  } = req.body;

  const sql = `
    INSERT INTO productos
    (nombre, categoria, stock_actual, stock_minimo, precio, proveedor)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nombre, categoria, stock_actual, stock_minimo, precio, proveedor],

    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error agregando producto");
      } else {

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
    stock_actual,
    stock_minimo,
    precio,
    proveedor
  } = req.body;

  const sql = `
    UPDATE productos
    SET
      nombre = ?,
      categoria = ?,
      stock_actual = ?,
      stock_minimo = ?,
      precio = ?,
      proveedor = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      categoria,
      stock_actual,
      stock_minimo,
      precio,
      proveedor,
      id
    ],

    (err, result) => {

      if (err) {
        console.log(err);
        res.status(500).send("Error actualizando producto");
      } else {

        res.send("Producto actualizado 😎");
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
    cantidad
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

      if (producto.stock_actual < cantidad) {
        return res.status(400).send("Stock insuficiente");
      }

      const nuevoStock = producto.stock_actual - cantidad;

      db.query(
        "UPDATE productos SET stock_actual = ? WHERE id = ?",
        [nuevoStock, productoId],

        (err2) => {

          if (err2) {
            console.log(err2);
            return res.status(500).send("Error actualizando stock");
          }

          res.send("Venta registrada 😎");

        }
      );

    }
  );

});


// =========================
// SERVIDOR
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo 🚀");
});