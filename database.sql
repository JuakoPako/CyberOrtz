CREATE DATABASE cyberortz;
USE cyberortz;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL
);

INSERT INTO usuarios (usuario, password) VALUES
('admin', 'admin123'),
('dueno', 'dueno2024');

CREATE TABLE estaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  plataforma VARCHAR(50) NOT NULL,
  precio_hora DECIMAL(10,2) NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  descripcion TEXT
);

CREATE TABLE arriendos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estacion_id INT NOT NULL,
    horas INT NOT NULL,
    hora_inicio DATETIME NOT NULL,
    hora_fin DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    FOREIGN KEY (estacion_id) REFERENCES estaciones(id)
);


INSERT INTO estaciones (nombre, tipo, plataforma, precio_hora, disponible, descripcion) VALUES
('PC Gamer RTX 4070 #1', 'PC', 'PC', 2500, TRUE, 'RTX 4070, 32GB RAM, monitor 144Hz'),
('PS5 #1', 'Consola', 'PlayStation 5', 2000, TRUE, 'Control extra DualSense, pantalla 4K'),
('Xbox Series X #1', 'Consola', 'Xbox Series X', 2000, FALSE, 'Game Pass incluido'),
('Switch #1', 'Consola', 'Nintendo Switch', 1500, TRUE, 'Modo TV y portátil');