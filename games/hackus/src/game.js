import { renderGrid, CELL_SIZE } from "./renderer.js";
import { setupUI } from "./ui.js";

const ROWS = 60;
const COLS = 90;
const TICK_MS = 150;
const DEAD_PROBABILITY = 0.7;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const passiveFemalesInput = document.getElementById("passiveFemalesPercent");
const passiveMalesInput = document.getElementById("passiveMalesPercent");
const expansiveFemalesInput = document.getElementById("expansiveFemalesPercent");
const expansiveMalesInput = document.getElementById("expansiveMalesPercent");
const generationLabel = document.getElementById("generation");

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let running = false;
let generation = 0;

// let grid = createRandomGrid();

let grid = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => 0)
);

// use your image path
drawImageSilhouette(grid, "../images/hood.png");

let seenStates = new Set([serializeGrid(grid)]);

const ui = setupUI({
  onToggle: () => {
    if (running) {
      running = false;
      ui.setRunningState(false);
      return;
    }

    if (!validatePercentages()) return;

    running = true;
    ui.setRunningState(true);
  },

  onReset: () => {
    if (!validatePercentages()) return;

    running = false;
    grid = createRandomGrid();
    generation = 0;
    seenStates = new Set([serializeGrid(grid)]);
    ui.setRunningState(false);
    render(grid);
  }
});

// ---------- INPUT HELPERS ----------

function getPercent(input) {
  const value = Number(input.value);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value)) / 100;
}

function getPassiveFemalesPercent() {
  return getPercent(passiveFemalesInput);
}

function getPassiveMalesPercent() {
  return getPercent(passiveMalesInput);
}

function getExpansiveFemalesPercent() {
  return getPercent(expansiveFemalesInput);
}

function getExpansiveMalesPercent() {
  return getPercent(expansiveMalesInput);
}

// ---------- CELL HELPERS ----------

function isAlive(cell) {
  return cell !== null;
}

function isReproductiveFemale(cell) {
  return cell === "F" || cell === "ExpansiveF";
}

function isReproductiveMale(cell) {
  return cell === "M" || cell === "ExpansiveM";
}

function isExpansiveFemale(cell) {
  return cell === "ExpansiveF";
}

function isExpansiveMale(cell) {
  return cell === "ExpansiveM";
}

function validatePercentages() {
  const passivew = Number(passiveFemalesInput.value) || 0;
  const gw = Number(expansiveFemalesInput.value) || 0;
  const passivem = Number(passiveMalesInput.value) || 0;
  const gm = Number(expansiveMalesInput.value) || 0;

  if (passivew + gw > 100) {
    alert("Invalid input: Passive females % + Expansive females % must be ≤ 100");
    return false;
  }

  if (passivem + gm > 100) {
    alert("Invalid input: Passive males % + Expansive men % must be ≤ 100");
    return false;
  }

  return true;
}

// ---------- RANDOM GENERATION ----------

function createPersonCell() {
  if (Math.random() < 0.5) {
    return createFemaleCell();
  }
  return createMaleCell();
}

function createFemaleCell() {
  const passive = getPassiveFemalesPercent();
  const expansive = getExpansiveFemalesPercent();
  const r = Math.random();

  if (r < passive) return "PassiveF";
  if (r < passive + expansive) return "ExpansiveF";
  return "F";
}

function createMaleCell() {
  const passive = getPassiveMalesPercent();
  const expansive = getExpansiveMalesPercent();
  const r = Math.random();

  if (r < passive) return "PassiveM";
  if (r < passive + expansive) return "ExpansiveM";
  return "M";
}

function createRandomCell() {
  if (Math.random() < DEAD_PROBABILITY) return null;
  return createPersonCell();
}

function createRandomGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => createRandomCell())
  );
}

// ---------- GRID HELPERS ----------

function cloneGrid(source) {
  return source.map(row => [...row]);
}

function getNeighborPositions(x, y) {
  const positions = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const ny = y + dy;
      const nx = x + dx;

      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
        positions.push([nx, ny]);
      }
    }
  }

  return positions;
}

function getNeighbors(grid, x, y) {
  return getNeighborPositions(x, y).map(([nx, ny]) => grid[ny][nx]);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

// ---------- SIMULATION ----------

function applySurvival(current) {
  return current.map((row, y) =>
    row.map((cell, x) => {
      if (!isAlive(cell)) return null;

      const liveNeighbors = getNeighbors(current, x, y).filter(isAlive).length;

      if (liveNeighbors < 2) return null;
      if (liveNeighbors > 3) return null;
      return cell;
    })
  );
}

function getBirthCapacityForDeadCell(current, x, y) {
  const neighbors = getNeighbors(current, x, y);

  const liveNeighbors = neighbors.filter(isAlive).length;
  if (liveNeighbors !== 2 && liveNeighbors !== 3) {
    return 0;
  }

  const normalFemales = neighbors.filter(cell => cell === "F").length;
  const expansiveFemales = neighbors.filter(cell => cell === "ExpansiveF").length;
  const normalMales = neighbors.filter(cell => cell === "M").length;
  const expansiveMales = neighbors.filter(cell => cell === "ExpansiveM").length;

  const reproductiveFemales = normalFemales + expansiveFemales;
  const reproductiveMales = normalMales + expansiveMales;

  if (reproductiveFemales < 1 || reproductiveMales < 1) {
    return 0;
  }

  if (expansiveFemales > 0 && expansiveMales > 0) return 4;
  if (expansiveFemales > 0 && normalMales > 0) return 2;
  if (normalFemales > 0 && expansiveMales > 0) return 2;
  if (normalFemales > 0 && normalMales > 0) return 1;

  return 0;
}

function getPositionsAtRadius(cx, cy, radius) {
  const positions = [];

  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue;
      if (x === cx && y === cy) continue;

      const chebyshevDistance = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      if (chebyshevDistance === radius) {
        positions.push([x, y]);
      }
    }
  }

  return positions;
}

function placeBirthsAround(next, centerX, centerY, birthsToPlace, used) {
  let placed = 0;

  if (next[centerY][centerX] === null && !used.has(`${centerX},${centerY}`)) {
    next[centerY][centerX] = createPersonCell();
    used.add(`${centerX},${centerY}`);
    placed++;
  }

  let radius = 1;

  while (placed < birthsToPlace && radius <= Math.max(ROWS, COLS)) {
    const candidates = getPositionsAtRadius(centerX, centerY, radius)
      .filter(([x, y]) => next[y][x] === null && !used.has(`${x},${y}`));

    shuffle(candidates);

    for (const [x, y] of candidates) {
      if (placed >= birthsToPlace) break;

      next[y][x] = createPersonCell();
      used.add(`${x},${y}`);
      placed++;
    }

    radius++;
  }
}

function applyBirths(current, next) {
  const eligibleDeadCells = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (current[y][x] !== null) continue;

      const capacity = getBirthCapacityForDeadCell(current, x, y);
      if (capacity > 0) {
        eligibleDeadCells.push({ x, y, capacity });
      }
    }
  }

  shuffle(eligibleDeadCells);

  const used = new Set();

  for (const candidate of eligibleDeadCells) {
    if (used.has(`${candidate.x},${candidate.y}`)) continue;
    placeBirthsAround(next, candidate.x, candidate.y, candidate.capacity, used);
  }

  return next;
}

function nextGeneration(current) {
  const afterSurvival = applySurvival(current);
  const next = cloneGrid(afterSurvival);

  return applyBirths(current, next);
}

// ---------- STATE / LOOP ----------

function serializeGrid(gridToSerialize) {
  return gridToSerialize.map(row => row.map(cell => cell ?? ".").join(",")).join("|");
}

function render(gridToRender = grid) {
  if (gridToRender !== grid) {
    grid = gridToRender.map(row => [...row]);
  }
  renderGrid(ctx, grid);
  generationLabel.textContent = `Generation: ${generation}`;
}

function step() {
  const next = nextGeneration(grid);
  const key = serializeGrid(next);

  if (seenStates.has(key)) {
    running = false;
    ui.setRunningState(false);
    return;
  }

  grid = next;
  seenStates.add(key);
  generation++;
  render(grid);
}

function loop() {
  if (running) {
    step();
  }
  setTimeout(loop, TICK_MS);
}

function drawImageSilhouette(grid, imageSrc) {
  const img = new Image();
  img.src = imageSrc;

  img.onload = () => {
    const canvasTmp = document.createElement("canvas");
    const ctxTmp = canvasTmp.getContext("2d");

    canvasTmp.width = COLS;
    canvasTmp.height = ROWS;

    let startGrid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => 0)
    );

    ctxTmp.drawImage(img, 0, 0, COLS, ROWS);

    const imageData = ctxTmp.getImageData(0, 0, COLS, ROWS).data;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = (y * COLS + x) * 4;

        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // grayscale
        const gray = (r + g + b) / 3;

        // --- mapping ---
        // darker → more "passive"
        // medium → normal
        // bright → expansive

        let type = null;

        if (gray < 60) {
          // very dark → empty (face interior)
          type = null;
        } else if (gray < 100) {
          // dark → passive
          type = Math.random() < 0.5 ? "PassiveF" : "PassiveM";
        } else if (gray < 170) {
          // mid → normal
          type = Math.random() < 0.5 ? "F" : "M";
        } else {
          // bright → expansive (greedy)
          type = Math.random() < 0.5 ? "ExpansiveF" : "ExpansiveM";
        }

        startGrid[y][x] = type;
      }
    }

    render(startGrid); 
  };
}

function init() {
  try {
    // await preloadSilhouette("../images/hood.png");
    drawImageSilhouette(grid, "../images/hood.png");
  } catch (e) {
    console.error(e);
  }

  render(grid);
  loop();
}

init();