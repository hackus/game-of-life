export const CELL_SIZE = 12;

export function renderGrid(ctx, grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  ctx.clearRect(0, 0, cols * CELL_SIZE, rows * CELL_SIZE);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      ctx.strokeStyle = "#222";
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}