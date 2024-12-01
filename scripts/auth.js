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

// Elementos del DOM
const loginForm = document.querySelector('#login-form');
const logoutButton = document.querySelector('#logout-link');
const googleButton = document.querySelector('#google-login');
const forgotPassword = document.querySelector('#forgot-password');

// Login con email y contraseña
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const email = document.querySelector('#input-email').value;
  const password = document.querySelector('#input-password').value;
  
  auth.signInWithEmailAndPassword(email, password).then(() => {
    loginForm.reset();
    document.getElementById('error-message').style.display = 'none';
  }).catch(err => {
    document.getElementById('error-message').style.display = 'block';
  });
});

// Login con Google
googleButton.addEventListener('click', (e) => {
  e.preventDefault();
  
  const provider = new firebase.auth.GoogleAuthProvider();
  
  auth.signInWithPopup(provider)
    .then((result) => {
      // Usuario logueado exitosamente
      console.log('Login con Google exitoso:', result.user.email);
      document.getElementById('error-message').style.display = 'none';
      
      // Mostrar elementos principales
      loginForm.closest('.login-container').style.display = 'none';
      document.querySelector('.content-sign-in').style.display = 'block';
      document.querySelector('#authentication-bar').style.display = 'block';
      document.querySelector('#user-details').textContent = result.user.email;
    })
    .catch((error) => {
      console.error("Error en login con Google:", error);
      document.getElementById('error-message').style.display = 'block';
      
      // Personalizar mensaje de error según el código
      let errorMessage = 'Error al iniciar sesión con Google';
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El popup fue bloqueado. Por favor, permite ventanas emergentes.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'El proceso de login fue cancelado.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'La solicitud de login fue cancelada.';
      }
      
      document.getElementById('error-message').innerHTML = 
        `<span class='error-icon'>❌</span><span class='error-text'>${errorMessage}</span>`;
    });
});

// Recuperar contraseña
forgotPassword.addEventListener('click', (e) => {
  e.preventDefault();
  const email = document.querySelector('#input-email').value;
  
  if (email) {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert('Se ha enviado un correo para restablecer tu contraseña');
      })
      .catch(error => {
        alert('Error al enviar el correo. Verifica tu dirección de email.');
      });
  } else {
    alert('Por favor, ingresa tu correo electrónico');
  }
});

// Logout
logoutButton.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// Monitor de estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('Usuario autenticado:', user.email);
    loginForm.closest('.login-container').style.display = 'none';
    document.querySelector('.content-sign-in').style.display = 'block';
    document.querySelector('#authentication-bar').style.display = 'block';
    document.querySelector('#user-details').textContent = user.email;
    
    // Asegurarse de que los gráficos se inicialicen
    if (typeof initChartsAndIndicators === 'function') {
      console.log('Inicializando gráficos...');
      initChartsAndIndicators();
    }
    
    // Iniciar la actualización de datos
    if (typeof updateChartsAndIndicators === 'function') {
      console.log('Iniciando actualización de datos...');
      updateChartsAndIndicators();
    }
  }
  else {
    console.log('Usuario no autenticado');
    loginForm.closest('.login-container').style.display = 'flex';
    document.querySelector('.content-sign-in').style.display = 'none';
    document.querySelector('#authentication-bar').style.display = 'none';
  }
});
