export const CELL_SIZE = 12;

const COLORS = {
  F: "#ff4d6d",
  PassiveF: "#ff9bb0",
  ExpansiveF: "#ff1744",  
  M: "#3a86ff",
  PassiveM: "#2f4f7f",
  ExpansiveM: "#00e5ff"   
};

export function renderGrid(ctx, grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  ctx.clearRect(0, 0, cols * CELL_SIZE, rows * CELL_SIZE);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const color = COLORS[cell] || null;

      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      ctx.strokeStyle = "#333";
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}