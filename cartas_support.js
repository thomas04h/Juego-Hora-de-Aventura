function esCartaSupport(cardName) {
  return /^Support\d+$/.test(cardName);
}
function aplicarBonosSupport(owner) {
  const battlefield = document.getElementById("battlefield");
  const isPlayer = owner === "player";

  const supportIndexes = isPlayer ? [12, 13, 14, 15] : [0, 1, 2, 3];
  const battleIndexes = isPlayer ? [8, 9, 10, 11] : [4, 5, 6, 7];

  for (let i = 0; i < 4; i++) {
    const supportCell = battlefield.children[supportIndexes[i]];
    const battleCell = battlefield.children[battleIndexes[i]];

    let bonus = 0;

    if (supportCell && supportCell.children.length > 0) {
      const supportCard = supportCell.querySelector(".card-container img");
      if (supportCard && esCartaSupport(supportCard.dataset.cardName)) {
        bonus = 2;

        // Mostrar bono en la carta support
        const container = supportCell.querySelector(".card-container");
        const atkLabel = container.querySelector(".attack-label");
        const defLabel = container.querySelector(".defense-label");
        if (atkLabel) atkLabel.textContent = "+2";
        if (defLabel) defLabel.textContent = "+2";
      }
    }

    if (battleCell && battleCell.children.length > 0) {
      const container = battleCell.querySelector(".card-container");

      const baseAtk = parseInt(container.dataset.baseAttack || container.dataset.attack);
      const baseDef = parseInt(container.dataset.baseDefense || container.dataset.defense);
      const atk = baseAtk + bonus;
      const def = baseDef + bonus;

      container.dataset.attack = atk;
      container.dataset.defense = def;

      const atkLabel = container.querySelector(".attack-label");
      const defLabel = container.querySelector(".defense-label");

      if (atkLabel) atkLabel.textContent = `${atk} ${bonus > 0 ? "(+2)" : ""}`;
      if (defLabel) defLabel.textContent = `${def} ${bonus > 0 ? "(+2)" : ""}`;

      // Guardar base si no está ya
      if (!container.dataset.baseAttack) container.dataset.baseAttack = baseAtk;
      if (!container.dataset.baseDefense) container.dataset.baseDefense = baseDef;
    }
  }
}
