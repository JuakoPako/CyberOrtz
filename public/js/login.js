const inputUsuario = document.getElementById('input-usuario');
const inputPassword = document.getElementById('input-password');
const btnLogin = document.getElementById('btn-login');
const mensajeError = document.getElementById('mensaje-error');

const iniciarSesion = async () => {
  const usuario = inputUsuario.value.trim();
  const password = inputPassword.value.trim();

  mensajeError.textContent = '';

  if (!usuario || !password) {
    mensajeError.textContent = 'Completa usuario y contraseña.';
    return;
  }

  try {
    const respuesta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const datos = await respuesta.json();

    if (respuesta.ok) {
      window.location.href = '/admin';
    } else {
      mensajeError.textContent = datos.error;
    }
  } catch (err) {
    mensajeError.textContent = 'Error: ' + err.message;
  }
};

btnLogin.addEventListener('click', iniciarSesion);