CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    categoria VARCHAR(50),
    stock INT DEFAULT 0,
    minimo INT DEFAULT 5,
    precio DECIMAL(10,2),
    proveedor VARCHAR(100)
);