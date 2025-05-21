
let playerTurn = true;
let inBattleMode = false;
let playerLife = 50;
let botLife = 50;
let drawnCards = new Set();
let playerDeck = [];
let botDeck = [];
let hasDrawnThisTurn = false;
let hasAttackedThisTurn = false;

const battlefield = document.getElementById("battlefield");

const cardStats = {
  Carta1: { attack: 10, defense: 5 },
  Carta2: { attack: 8, defense: 6 },
  Carta3: { attack: 12, defense: 4 },
  Carta4: { attack: 7, defense: 7 },
  Carta5: { attack: 15, defense: 3 },
  Carta6: { attack: 6, defense: 8 },
  Carta7: { attack: 9, defense: 5 },
  Carta8: { attack: 11, defense: 4 },
  Carta9: { attack: 10, defense: 6 },
  Carta10: { attack: 13, defense: 2 },
};
function createBattlefield() {
  const battlefield = document.getElementById("battlefield");
  battlefield.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    cell.addEventListener("dragover", (e) => e.preventDefault());

    cell.addEventListener("drop", (e) => {
      e.preventDefault();

      const index = parseInt(cell.dataset.index);
      const isPlayer = playerTurn;
      const owner = isPlayer ? "player" : "bot";

      if (owner === "bot") {
        alert("¡No puedes colocar cartas en el turno del bot!");
        return;
      }

      const src = e.dataTransfer.getData("text/plain");
      const fromHand = e.dataTransfer.getData("from-hand") === "true";
      const cardId = e.dataTransfer.getData("card-id");
      const cardName = e.dataTransfer.getData("card-name");

      if (!cardName) {
        alert("No se pudo determinar el nombre de la carta.");
        return;
      }

      const isSupport = esCartaSupport(cardName);

      // Validar posición según tipo de carta
      const validSupportIndexes = isPlayer ? [12, 13, 14, 15] : [0, 1, 2, 3];
      const validBattleIndexes = isPlayer ? [8, 9, 10, 11] : [4, 5, 6, 7];

      if (isSupport) {
        if (!validSupportIndexes.includes(index)) {
          alert("¡Solo puedes colocar cartas de soporte en las casillas " + validSupportIndexes.join(", ") + "!");
          return;
        }
      } else {
        if (!validBattleIndexes.includes(index)) {
          alert("¡Solo puedes colocar cartas normales en las casillas " + validBattleIndexes.join(", ") + "!");
          return;
        }
      }

      // Crear contenedor de carta
      const cardContainer = document.createElement("div");
      cardContainer.className = "card-container";

      const attack = isSupport ? 0 : cardStats[cardName]?.attack || 0;
      const defense = isSupport ? 0 : cardStats[cardName]?.defense || 0;

      cardContainer.dataset.attack = attack;
      cardContainer.dataset.defense = defense;
      cardContainer.dataset.owner = owner;

      // Guardar valores base para aplicar bonos
      cardContainer.dataset.baseAttack = attack;
      cardContainer.dataset.baseDefense = defense;

      // Crear imagen
      const img = document.createElement("img");
      img.src = src;
      img.className = "card";
      img.draggable = false;
      img.dataset.cardName = cardName;

      // Etiquetas de ataque y defensa
      const atkLabel = document.createElement("div");
      atkLabel.className = "attack-label";
      atkLabel.textContent = isSupport ? "+0" : attack;

      const defLabel = document.createElement("div");
      defLabel.className = "defense-label";
      defLabel.textContent = isSupport ? "+0" : defense;

      cardContainer.appendChild(img);
      cardContainer.appendChild(atkLabel);
      cardContainer.appendChild(defLabel);

      cell.innerHTML = "";
      cell.appendChild(cardContainer);

      // Eliminar de la mano si es necesario
      if (fromHand && cardId) {
        const original = document.querySelector(`[data-drag-id="${cardId}"]`);
        if (original && original.parentElement) {
          original.remove();
        }
      }

      // Si no es soporte, crear botón de ataque
      if (!isSupport) {
        createAttackButton(cell, cardContainer, owner);
      }

      // Aplicar bonos de soporte tras colocar carta
      aplicarBonosSupport("player");
    });

    battlefield.appendChild(cell);
  }
}
function createAttackButton(cell, container, owner) {
  const attackBtn = document.createElement("button");
  attackBtn.innerText = "Ataque";
  attackBtn.className = "attack-button";

  // Verificar si ya atacó en este turno
  if (container.dataset.attacked === "true") {
    attackBtn.disabled = true;
  }

  attackBtn.addEventListener("click", () => {
    if (!inBattleMode) {
      alert("¡Activa el modo de batalla antes de atacar!");
      return;
    }

    if (container.dataset.attacked === "true") {
      alert("¡Esta carta ya atacó este turno!");
      return;
    }

    const index = parseInt(cell.dataset.index);
    const attack = parseInt(container.dataset.attack);

    let targetNormalIndex, targetSupportIndex;

    if (owner === "player") {
      targetNormalIndex = index - 4;
      targetSupportIndex = index - 8;
    } else {
      targetNormalIndex = index + 4;
      targetSupportIndex = index + 8;
    }

    const battlefield = document.getElementById("battlefield");
    const targetNormalCell = battlefield.children[targetNormalIndex];
    const targetSupportCell = battlefield.children[targetSupportIndex];

    // 1. Atacar carta normal si está enfrente
    if (targetNormalCell && targetNormalCell.children.length > 0) {
      const targetCard = targetNormalCell.querySelector(".card-container");
      const targetDefense = parseInt(targetCard.dataset.defense);

      if (attack >= targetDefense) {
        targetNormalCell.innerHTML = "";
        animateAttack(owner, container);
        container.dataset.attacked = "true";
        attackBtn.disabled = true;
        verificarVictoria();
      } else {
        alert("¡El ataque no fue suficiente para destruir la carta defensiva!");
      }

      inBattleMode = false;
      return;
    }

    // 2. Atacar carta support si está enfrente
    if (targetSupportCell && targetSupportCell.children.length > 0) {
      const targetCard = targetSupportCell.querySelector(".card-container");
      const targetDefense = parseInt(targetCard.dataset.defense);

      if (attack >= targetDefense) {
        targetSupportCell.innerHTML = "";
        animateAttack(owner, container);
        container.dataset.attacked = "true";
        attackBtn.disabled = true;
        verificarVictoria();
      } else {
        alert("¡El ataque no fue suficiente para destruir la carta de soporte!");
      }

      inBattleMode = false;
      return;
    }

    // 3. Si no hay nada al frente, ataque directo
    animateAttack(owner, container);

    if (owner === "player" && playerTurn) {
      botLife -= attack;
    } else if (owner === "bot" && !playerTurn) {
      playerLife -= attack;
    }

    updateLifeBars();
    container.dataset.attacked = "true";
    attackBtn.disabled = true;
    verificarVictoria();

    inBattleMode = false;
  });

  container.appendChild(attackBtn);
}

function updateLifeBars() {
  document.getElementById("player-life").style.width = playerLife * 2 + "%";
  document.getElementById("bot-life").style.width = botLife * 2 + "%";
  document.getElementById("player-life-text").innerText = playerLife;
  document.getElementById("bot-life-text").innerText = botLife;
}

function animateAttack(attacker, attackerContainer) {
  const cardImg = attackerContainer?.querySelector("img");
  const cardName = cardImg?.dataset.cardName || "";

  console.log("Animando:", cardName); // 🐞 debug

  // Eliminar clases anteriores
  cardImg.classList.forEach(cls => {
    if (cls.startsWith("attack-Carta")) {
      cardImg.classList.remove(cls);
    }
  });

  void cardImg.offsetWidth; // Reflow para reiniciar animación

  if (cardName) {
    cardImg.classList.add(`attack-${cardName}`);
  }

  // Sonido
  const audio = new Audio(`sonidos/${cardName}.mp3`);
  audio.play().catch(() => {});

  // Efecto visual
  const efecto = document.createElement("div");
  efecto.className = "visual-efecto";
  efecto.style.top = `${cardImg.offsetTop}px`;
  efecto.style.left = `${cardImg.offsetLeft}px`;
  attackerContainer.appendChild(efecto);
  setTimeout(() => efecto.remove(), 600);

  // Animar objetivo si hay carta
  const battlefield = document.getElementById("battlefield");
  const index = parseInt(attackerContainer.parentElement.dataset.index);
  const targetIndex = attacker === "player" ? index - 8 : index + 8;
  const targetCell = document.querySelector(`.cell[data-index='${targetIndex}']`);

  if (targetCell && targetCell.children.length > 0) {
    const targetImg = targetCell.querySelector("img");
    if (targetImg) {
      targetImg.classList.add("shake");
      setTimeout(() => targetImg.classList.remove("shake"), 400);
    }
  }
}

function drawCard(owner) {
  let deck = owner === "player" ? playerDeck : botDeck;
  let hand = document.getElementById(owner === "player" ? "player-hand" : "bot-hand");

  if (deck.length >= 20) return; // máximo 20 cartas

  let cardNumber;
  let cardName;
  let intentos = 0;

  do {
    const isSupport = Math.random() < 0.5; // 50% probabilidad de ser support
    cardNumber = Math.floor(Math.random() * 10) + 1;
    cardName = isSupport ? `Support${cardNumber}` : `Carta${cardNumber}`;
    intentos++;
  } while (drawnCards.has(`${owner}-${cardName}`) && intentos < 30);

  drawnCards.add(`${owner}-${cardName}`);

  const img = document.createElement("img");
  img.src = `Cartas/${cardName}.jfif`;
  img.className = "card";
  img.draggable = true;
  img.dataset.dragId = `${owner}-card-${Date.now()}`;
  img.dataset.cardName = cardName;

  img.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", img.src);
    e.dataTransfer.setData("from-hand", true);
    e.dataTransfer.setData("card-id", img.dataset.dragId);
    e.dataTransfer.setData("card-name", cardName);
  });

  deck.push(cardName);
  hand.appendChild(img);
}
function botTurn() {
  setTimeout(() => {
    alert("Turno del bot");

    drawCard("bot");

    const battlefield = document.getElementById("battlefield");
    const hand = document.getElementById("bot-hand");
    const card = hand.querySelector(".card");
    if (!card) return;

    const cardName = card.dataset.cardName;
    const isSupport = esCartaSupport(cardName);

    const validIndexes = isSupport ? [0, 1, 2, 3] : [4, 5, 6, 7];
    const emptyCells = [...battlefield.children].filter(
      (cell, i) => validIndexes.includes(i) && cell.children.length === 0
    );
    if (emptyCells.length === 0) return;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const container = document.createElement("div");
    container.className = "card-container";

    const attack = isSupport ? 0 : cardStats[cardName]?.attack || 0;
    const defense = isSupport ? 0 : cardStats[cardName]?.defense || 0;

    container.dataset.attack = attack;
    container.dataset.defense = defense;
    container.dataset.owner = "bot";
    container.dataset.baseAttack = attack;
    container.dataset.baseDefense = defense;
    container.dataset.attacked = "false"; // carta nueva puede atacar

    const img = card.cloneNode(true);
    img.draggable = false;
    img.dataset.cardName = cardName;

    const atk = document.createElement("div");
    atk.className = "attack-label";
    atk.textContent = isSupport ? "+0" : attack;

    const def = document.createElement("div");
    def.className = "defense-label";
    def.textContent = isSupport ? "+0" : defense;

    container.appendChild(img);
    container.appendChild(atk);
    container.appendChild(def);
    cell.innerHTML = "";
    cell.appendChild(container);
    card.remove();

    if (!isSupport) {
      createAttackButton(cell, container, "bot");
    }

    aplicarBonosSupport("bot");

    // ✅ Aseguramos que TODAS las cartas normales del bot puedan atacar este turno
    for (let i = 4; i <= 7; i++) {
      const cell = battlefield.children[i];
      if (cell && cell.children.length > 0) {
        const cont = cell.querySelector(".card-container");
        if (cont && !esCartaSupport(cont.querySelector("img").dataset.cardName)) {
          cont.dataset.attacked = "false";
        }
      }
    }

    // 🗡️ ATACAR CON TODAS LAS CARTAS NORMALES DEL BOT
    setTimeout(() => {
      for (let i = 4; i <= 7; i++) {
        const botCell = battlefield.children[i];
        if (!botCell || botCell.children.length === 0) continue;

        const cardContainer = botCell.querySelector(".card-container");
        if (!cardContainer || cardContainer.dataset.attacked === "true") continue;

        const attack = parseInt(cardContainer.dataset.attack);
        const playerBattleCell = battlefield.children[i + 4];
        const playerSupportCell = battlefield.children[i + 8];

        let atacado = false;

        // 1. Atacar carta normal
        if (playerBattleCell && playerBattleCell.children.length > 0) {
          const target = playerBattleCell.querySelector(".card-container");
          const defense = parseInt(target.dataset.defense);
          if (attack >= defense) {
            playerBattleCell.innerHTML = "";
            animateAttack("bot", cardContainer);
            cardContainer.dataset.attacked = "true";
            verificarVictoria();
            atacado = true;
          }
        }

        // 2. Atacar carta support
        if (!atacado && playerSupportCell && playerSupportCell.children.length > 0) {
          const target = playerSupportCell.querySelector(".card-container");
          const defense = parseInt(target.dataset.defense);
          if (attack >= defense) {
            playerSupportCell.innerHTML = "";
            animateAttack("bot", cardContainer);
            cardContainer.dataset.attacked = "true";
            verificarVictoria();
            atacado = true;
          }
        }

        // 3. Ataque directo
        if (!atacado &&
          (!playerBattleCell || playerBattleCell.children.length === 0) &&
          (!playerSupportCell || playerSupportCell.children.length === 0)) {
          playerLife -= attack;
          updateLifeBars();
          animateAttack("bot", cardContainer);
          cardContainer.dataset.attacked = "true";
          verificarVictoria();
        }
      }

      // 🔁 Fin del turno del bot → empieza el turno del jugador
      setTimeout(() => {
        playerTurn = true;
        hasDrawnThisTurn = false;
        inBattleMode = false;

        // Resetear ataques de las cartas del jugador
        [8, 9, 10, 11].forEach(i => {
          const cell = battlefield.children[i];
          if (cell && cell.children.length > 0) {
            const container = cell.querySelector(".card-container");
            if (container) {
              container.dataset.attacked = "false";
              const btn = container.querySelector(".attack-button");
              if (btn) btn.disabled = false;
            }
          }
        });

        alert("¡Es tu turno!");
      }, 1000);
    }, 500);
  }, 1000);
}




document.getElementById("draw-card").addEventListener("click", () => {
  if (!playerTurn) return;

  if (hasDrawnThisTurn) {
    alert("¡Solo puedes robar una carta por turno!");
    return;
  }

  drawCard("player");
  hasDrawnThisTurn = true;
});


document.getElementById("battle-mode").addEventListener("click", () => {
  if (!playerTurn) return;
  inBattleMode = true;
  alert("¡Modo batalla activado!");
});

document.getElementById("end-turn").addEventListener("click", () => {
  if (!playerTurn) return;

  playerTurn = false;
  inBattleMode = false;
  hasDrawnThisTurn = false;
  hasAttackedThisTurn = false;

  botTurn();
});

window.onload = () => {
  createBattlefield();
  updateLifeBars();

  const jugadorId = localStorage.getItem("personajeSeleccionado");
  const enemigoId = localStorage.getItem("enemigoSeleccionado");

  if (jugadorId && enemigoId) {
    const jugadorImg = document.querySelector(".player-section:not(.bot) .profile-img");
    const botImg = document.querySelector(".player-section.bot .profile-img");

    jugadorImg.src = `imagenesseleccion/personajes/${getNombreArchivo(parseInt(jugadorId))}.png`;
    botImg.src = `imagenesseleccion/personajes/${getNombreArchivo(parseInt(enemigoId))}.png`;

    // 👉 AQUÍ CAMBIAMOS LOS NOMBRES VISIBLES
    document.getElementById("nombre-jugador").innerText = getNombreVisible(parseInt(jugadorId));
    document.getElementById("nombre-bot").innerText = getNombreVisible(parseInt(enemigoId));
  }
};


function getNombreArchivo(id) {
  const nombres = [
    "jake",
    "fin",
    "dulceprincesa",
    "marceline",
    "bmo",
    "princesaflama",
    "liche",
    "reyhelado",
    "mentita",
    "gunter"
  ];
  return nombres[id - 1];
  
}
function getNombreVisible(id) {
  const nombres = [
    "Jake",
    "Fin",
    "Dulce Princesa",
    "Marceline",
    "BMO",
    "Princesa Flama",
    "Caracol",
    "Rey Helado",
    "Mentita",
    "Gunter"
  ];
  return nombres[id - 1];
}




function getCardName(src) {
  const match = src.match(/Carta\d+/);
  return match ? match[0] : "Carta1";
}
function verificarVictoria() {
  if (botLife <= 0) {
    mostrarPantallaFinal("¡GANASTE!", "green");
  } else if (playerLife <= 0) {
    mostrarPantallaFinal("¡PERDISTE!", "red");
  }
}
function mostrarPantallaFinal(texto, color) {
  const estado = color === "green" ? "ganaste" : "perdiste";
  window.location.href = `final.html?estado=${estado}`;
}

