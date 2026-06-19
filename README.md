# CyberOrtz — Sistema de Gestión de Cyber Gamer

## 1. Integrantes del grupo

| Nombre | Rol | Archivos y funcionalidades |
|---|---|---|
| Joaquín Espinoza | Backend & Base de datos | Desarrolló la estructura base del proyecto: `server.js` (configuración Express, rutas), `config/db.js` (conexión MySQL), modelos `Estacion.js`, `Arriendo.js` y `Usuario.js`, controladores `estacionController.js` e `InicioSesionController.js`, CRUD completo de estaciones (listar, agregar, editar, eliminar), sistema de login, y la vista pública (`index.html`, `publico.js`). |
| Bastián Román | Módulo de Arriendos & Panel Admin | Desarrolló el módulo de arriendos: `arriendoController.js` (iniciar, finalizar, auto-cierre de arriendos vencidos y liberación de estaciones), la vista del panel de administración (`panel.html`, `panel.js`) con la tabla de arriendos activos, formulario de arriendo con cálculo de subtotal, IVA y total en tiempo real, y el botón de finalización anticipada. |

---

## 2. Descripción del proyecto

**CyberOrtz** es un sistema web de gestión para un centro de entretenimiento gamer. Permite administrar las estaciones de juego (PCs y consolas), registrar arriendos por hora y controlar la disponibilidad de cada equipo en tiempo real. Resuelve el problema de llevar el control manual de qué estación está ocupada, por cuánto tiempo y a qué costo, reemplazándolo con un panel digital accesible desde cualquier navegador.

---

## 3. Requisitos previos

Tener instalado lo siguiente antes de ejecutar el proyecto:

- **Node.js** v18 o superior → https://nodejs.org
- **XAMPP** (recomendado) o Bitnami WAMP → https://www.apachefriends.org
  - Se necesita el módulo **MySQL/MariaDB** activo
- **Git** (opcional, para clonar el repositorio) → https://git-scm.com

---

## 4. Instalación paso a paso

### 1. Obtener el proyecto

**Opción A — Clonar con Git:**
```bash
git clone https://github.com/JuakoPako/CyberOrtz.git
cd CyberOrtz
```

**Opción B — Descargar ZIP:**
Descargar desde GitHub → Code → Download ZIP, descomprimir.

### 2. Importar la base de datos

1. Abrir XAMPP y iniciar el servicio **MySQL**
2. Ir a `http://localhost/phpmyadmin`
3. Crear una base de datos llamada `cyberortz`
4. Seleccionar la base de datos → pestaña **Importar**
5. Seleccionar el archivo `database.sql` (ubicado en la raíz del proyecto)
6. Hacer clic en **Importar**

### 3. Instalar dependencias

```bash
npm init -y
npm install express mysql2
```

### 4. Ejecutar el servidor

```bash
npm run start
```

El servidor quedará corriendo en `http://localhost:3000`

---

## 5. Configuración de la base de datos

La conexión está definida en `config/db.js`:

```js
host:     'localhost'
user:     'root'
password: ''
database: 'cyberortz'
```

> Si la instalación de MySQL usa una contraseña distinta para `root`, edita el campo `password` en ese archivo antes de ejecutar.

El archivo SQL para importar se encuentra en la raíz del proyecto:
```
database.sql
```

---

## 6. Credenciales de prueba

| Usuario | Contraseña | Acceso |
|---|---|---|
| `admin` | `1234` | Panel de administración |
| `dueno` | `dueno` | Panel de administración |

---

## 7. Uso del sistema

### Vista pública
Acceder a `http://localhost:3000`

Muestra todas las estaciones disponibles con nombre, plataforma, precio por hora y estado (Disponible / Ocupada). Incluye buscador en tiempo real por nombre o plataforma.

### Login
Acceder a `http://localhost:3000/login`

Ingresar con las credenciales de la tabla anterior para acceder al panel de administración.

### Panel de administración
Acceder a `http://localhost:3000/admin`

Operaciones disponibles:

- **Agregar estación** — Registrar una nueva PC o consola con nombre, tipo, plataforma, precio por hora y descripción
- **Editar estación** — Modificar los datos de una estación existente
- **Eliminar estación** — Eliminar permanentemente una estación
- **Arrendar estación** — Iniciar un arriendo ingresando la cantidad de horas; muestra subtotal, IVA (19%) y total antes de confirmar
- **Finalizar arriendo** — Terminar un arriendo anticipadamente; libera la estación de inmediato
- **Auto-cierre** — Los arriendos cuya hora de fin ya pasó se cierran automáticamente al consultar la lista

---

## 8. Estructura del proyecto

```
CyberOrtz/
│
├── server.js                  # Punto de entrada, configuración Express y rutas
├── database.sql               # Script SQL para crear e inicializar la base de datos
├── package.json               # Dependencias del proyecto
│
├── config/
│   └── db.js                  # Conexión a MySQL
│
├── model/
│   ├── Estacion.js            # Clase modelo para estaciones
│   ├── Arriendo.js            # Clase modelo para arriendos
│   └── Usuario.js             # Clase modelo para usuarios
│
├── controllers/
│   ├── estacionController.js      # Lógica CRUD de estaciones
│   ├── arriendoController.js      # Lógica de arriendos (iniciar, finalizar, auto-cierre)
│   └── InicioSesionController.js  # Lógica de autenticación
│
├── public/
│   ├── img/
│   │   └── CyberOrtz.png      # Logo del sistema
│   └── js/
│       ├── login.js           # Lógica del formulario de login
│       ├── panel.js           # Lógica del panel de administración
│       └── publico.js         # Lógica de la vista pública
│
└── views/
    ├── index.html             # Vista pública (estaciones disponibles)
    ├── login.html             # Formulario de inicio de sesión
    └── admin/
        └── panel.html         # Panel de administración
```
