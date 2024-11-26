// Escuchar el estado de la autenticación
auth.onAuthStateChanged(user => {
  if (user) {
      console.log("Usuario logueado");
      console.log(user);
      setupUI(user);  // Función para configurar la UI después del login
      showAuthenticatedUI(user); // Muestra la barra de autenticación con detalles del usuario
  } else {
      console.log("Usuario deslogueado");
      setupUI();  // Limpia la UI si el usuario está deslogueado
      showLoginForm(); // Muestra el formulario de login
  }
});

// Función para mostrar la interfaz de login
function showLoginForm() {
  document.querySelector('#login-form').style.display = 'block';  // Muestra el formulario de login
  document.querySelector('#authentication-bar').style.display = 'none';  // Oculta la barra de autenticación
  document.getElementById("error-message").style.display = 'none'; // Ocultar el mensaje de error al mostrar el formulario
}

// Función para mostrar la barra de autenticación con detalles del usuario
function showAuthenticatedUI(user) {
  document.querySelector('#login-form').style.display = 'none';  // Oculta el formulario de login
  document.querySelector('#authentication-bar').style.display = 'block';  // Muestra la barra de autenticación
  document.querySelector('#user-details').textContent = user.email;  // Muestra el email del usuario
  document.querySelector('#authentication-status').textContent = 'Usuario logueado';  // Actualiza el texto de estado
}

// Login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm['input-email'].value;
  const password = loginForm['input-password'].value;

  auth.signInWithEmailAndPassword(email, password).then((cred) => {
      loginForm.reset();  // Resetear el formulario después de un login exitoso
      console.log('Usuario logueado: ' + email);
      document.getElementById("error-message").style.display = 'none'; // Ocultar mensaje de error si el login fue exitoso
  })
  .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      // Validar si el error es debido a credenciales incorrectas (código 400)
      if (errorCode === 'auth/invalid-email' || errorCode === 'auth/wrong-password' || errorMessage.includes("INVALID_LOGIN_CREDENTIALS")) {
          document.getElementById("error-message").innerHTML = "<span class='error-icon'>❌</span><span class='error-text'>Los datos de esta cuenta son incorrectos</span>";
          document.getElementById("error-message").style.display = 'block'; // Mostrar mensaje de error
      } else {
          // Para otros errores mostrar el mensaje genérico
          document.getElementById("error-message").innerHTML = "<span class='error-icon'>❌</span><span class='error-text'>Error en el inicio de sesión: " + errorMessage + "</span>";
          document.getElementById("error-message").style.display = 'block'; // Mostrar mensaje de error
      }
      console.log(errorMessage);
  });
});

// Logout
const logout = document.querySelector('#logout-link');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
      showLoginForm(); // Muestra el formulario de login después de cerrar sesión
  });
});
