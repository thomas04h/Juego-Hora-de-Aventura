let musicPlaying = false;

const music = document.getElementById("background-music");
const musicIcon = document.getElementById("music-icon");

// Cambia estas rutas si tus imágenes están en otra ubicación o tienen otro nombre
const musicOnImage = "img/iconodemusica.png";
const musicOffImage = "img/iconodemute.png";

function toggleMusic() {
  if (!musicPlaying) {
    music.play();
    musicIcon.src = musicOffImage;
    musicPlaying = true;
  } else {
    music.pause();
    musicIcon.src = musicOnImage;
    musicPlaying = false;
  }
}

// Asegura que los elementos estén cargados antes de asociar eventos
window.addEventListener("DOMContentLoaded", () => {
  // Reinicia el ícono en caso de recarga
  musicIcon.src = musicOnImage;
});
