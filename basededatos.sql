CREATE DATABASE market_ortz;
USE market_ortz;

CREATE TABLE categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200)
);

CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    rut VARCHAR(12) NOT NULL
);

CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    stock INT NOT NULL,
    precio_costo DECIMAL NOT NULL,
    precio_venta DECIMAL NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

CREATE TABLE ventas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nro_boleta VARCHAR(20) NOT NULL,
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

CREATE TABLE detalle_ventas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cantidad INT NOT NULL,
    precio_producto DECIMAL NOT NULL,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas', 'Bebidas y jugos en general'),
('Lacteos', 'Leche, yogurt y derivados'),
('Snacks', 'Papas fritas, galletas y dulces'),
('Aseo', 'Productos de limpieza e higiene'),
('Panaderia', 'Pan y productos de panaderia');

INSERT INTO clientes (nombre, apellido, rut) VALUES
('Joaquin', 'Ortiz', '12345678-9'),
('Camila', 'Soto', '15234567-8'),
('Matias', 'Fuentes', '17890123-4'),
('Francisca', 'Reyes', '14567890-1'),
('Sebastian', 'Munoz', '16789012-3');

INSERT INTO productos (nombre, stock, precio_costo, precio_venta, id_categoria) VALUES
('Coca Cola 1.5L', 50, 800, 1200, 1),
('Leche Soprole 1L', 40, 700, 1000, 2),
('Papas Lays 150g', 30, 900, 1500, 3),
('Cloro Clorinda 1L', 25, 600, 950, 4),
('Marraqueta Kg', 60, 500, 800, 5);

INSERT INTO ventas (nro_boleta, id_cliente) VALUES
('B-0001', 1),
('B-0002', 2),
('B-0003', 3),
('B-0004', 4),
('B-0005', 5);

INSERT INTO detalle_ventas (cantidad, precio_producto, id_venta, id_producto) VALUES
(5, 1200, 1, 1),
(3, 1000, 2, 2),
(2, 1500, 3, 3),
(4, 950, 4, 4),
(6, 800, 5, 5);

CREATE INDEX ventas_fecha ON ventas(fecha);

DELIMITER //

CREATE TRIGGER actualizar_stock
AFTER INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.id_producto;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE ventas_por_dia(IN fecha_consulta DATE)
BEGIN
    SELECT 
        fecha_consulta AS fecha,
        SUM(detalle_ventas.cantidad * detalle_ventas.precio_producto) AS total_recaudado
    FROM detalle_ventas
    INNER JOIN ventas ON detalle_ventas.id_venta = ventas.id
    WHERE DATE(ventas.fecha) = fecha_consulta;
END //

DELIMITER ;

CREATE VIEW vista_ventas_detalle AS
SELECT
    ventas.id,
    ventas.nro_boleta,
    ventas.fecha,
    clientes.nombre AS nombre_cliente,
    clientes.apellido,
    clientes.rut,
    productos.nombre AS nombre_producto,
    categorias.nombre AS nombre_categoria,
    detalle_ventas.cantidad,
    detalle_ventas.precio_producto,
    (detalle_ventas.cantidad * detalle_ventas.precio_producto) AS subtotal
FROM detalle_ventas
INNER JOIN ventas ON detalle_ventas.id_venta = ventas.id
INNER JOIN clientes ON ventas.id_cliente = clientes.id
INNER JOIN productos ON detalle_ventas.id_producto = productos.id
INNER JOIN categorias ON productos.id_categoria = categorias.id;