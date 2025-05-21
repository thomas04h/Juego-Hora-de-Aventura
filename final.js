function getParametro(nombre) {
  const url = new URL(window.location.href);
  return url.searchParams.get(nombre);
}

function volverAJugar() {
  window.location.href = "seleccion.html";
}

window.onload = () => {
  const estado = getParametro("estado");
  const mensaje = document.getElementById("mensaje-final");

  if (estado === "ganaste") {
    mensaje.innerText = "¡GANASTE!";
    document.body.style.background = "radial-gradient(circle, rgba(40,167,69,0.9), rgba(0,0,0,0.95))";
  } else if (estado === "perdiste") {
    mensaje.innerText = "¡PERDISTE!";
    document.body.style.background = "radial-gradient(circle, rgba(220,53,69,0.9), rgba(0,0,0,0.95))";
  } else {
    mensaje.innerText = "Resultado Desconocido";
  }
};
function getParametro(nombre) {
  const url = new URL(window.location.href);
  return url.searchParams.get(nombre);
}

function volverAJugar() {
  window.location.href = "seleccion.html";
}

window.onload = () => {
  const estado = getParametro("estado");
  const mensaje = document.getElementById("mensaje-final");

  if (estado === "ganaste") {
    mensaje.innerText = "¡GANASTE!";
    document.body.style.background = "radial-gradient(circle, rgba(40,167,69,0.9), rgba(0,0,0,0.95))";
  } else if (estado === "perdiste") {
    mensaje.innerText = "¡PERDISTE!";
    document.body.style.background = "radial-gradient(circle, rgba(220,53,69,0.9), rgba(0,0,0,0.95))";
  } else {
    mensaje.innerText = "Resultado Desconocido";
  }
};

// 🔊 Lógica de volumen/mute
const botonVolumen = document.getElementById("btn-volumen");
const musica = document.getElementById("audio-final");
let reproduciendo = true;

function toggleMusica() {
  if (reproduciendo) {
    musica.pause();
    botonVolumen.src = "img/iconodemusica.png";
  } else {
    musica.play();
    botonVolumen.src = "img/iconodemute.png";
  }
  reproduciendo = !reproduciendo;
}
