export function setupUI({ onToggle, onReset }) {
  const startPauseBtn = document.getElementById("startPauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  startPauseBtn.addEventListener("click", onToggle);
  resetBtn.addEventListener("click", onReset);

  return {
    setRunningState(running) {
      startPauseBtn.textContent = running ? "Pause" : "Start";
    }
  };
}