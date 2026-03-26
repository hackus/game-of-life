import { renderGrid, CELL_SIZE } from "./renderer.js";
import { setupUI } from "./ui.js";

const ROWS = 60;
const COLS = 90;
const TICK_MS = 200;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let running = false;

let grid = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => 0)
);

drawImageSilhouette(grid, "../images/hood.png");

let generation = 0;
const generationLabel = document.getElementById("generation");

const ui = setupUI({
  onToggle: () => {
    if (running) {
      // Pause
      running = false;
      ui.setRunningState(false);
      return;
    }

    running = true;
    ui.setRunningState(true);
  },

  onReset: () => {
    running = false;
    grid = createRandomGrid();
    generation = 0;
    ui.setRunningState(false);
    render(grid);
  }
});

function createRandomGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => (Math.random() < 0.3 ? 1 : 0))
  );
}

function countNeighbors(grid, x, y) {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const ny = y + dy;
      const nx = x + dx;

      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
        count += grid[ny][nx];
      }
    }
  }

  return count;
}

function nextGeneration(current) {
  return current.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(current, x, y);

      if (cell === 1) {
        if (neighbors < 2 || neighbors > 3) return 0;
        return 1;
      }

      return neighbors === 3 ? 1 : 0;
    })
  );
}

function render(gridToRender = grid) {
  if (gridToRender !== grid) {
    grid = gridToRender.map(row => [...row]);
  }
  renderGrid(ctx, grid);
  generationLabel.textContent = `Generation: ${generation}`;
}


function step() {
  grid = nextGeneration(grid);
  generation++;
  render(grid);
}

function loop() {
  if (running) step();
  setTimeout(loop, TICK_MS);
}

function drawImageSilhouette(grid, imageSrc) {
  const img = new Image();
  img.src = imageSrc;

  img.onload = () => {
    const canvasTmp = document.createElement("canvas");
    const ctxTmp = canvasTmp.getContext("2d");

    // scale image to grid size
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

        const brightness = (r + g + b) / 3;

        if (brightness < 60) {
          startGrid[y][x] = 0;
        } else {
          startGrid[y][x] = 1;
        }
      }
    }

    render(startGrid); 
  };
}

function init() {
  try {
    drawImageSilhouette(grid, "../images/hood.png");
  } catch (e) {
    console.error(e);
  }

  render(grid);
  loop();
}

init();