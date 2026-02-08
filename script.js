const puzzles = [
  {
    name: "마음의 하트",
    grid: [
      "01100110",
      "11111111",
      "11111111",
      "01111110",
      "00111100",
      "00011000",
      "00011000",
      "00000000",
    ],
  },
  {
    name: "작은 새싹",
    grid: [
      "00011000",
      "00111100",
      "01111110",
      "00111100",
      "00011000",
      "00011000",
      "00111100",
      "00100100",
    ],
  },
  {
    name: "따뜻한 미소",
    grid: [
      "00000000",
      "01000010",
      "01000010",
      "00000000",
      "00100100",
      "00011000",
      "00000000",
      "00000000",
    ],
  },
];

const encouragingMessages = [
  "숨을 한번 천천히 들이쉬고, 한 칸씩 채워봐요.",
  "괜찮아요. 실수는 쉬어가는 표시예요.",
  "지금의 집중이 마음을 고요하게 만들고 있어요.",
  "아주 잘하고 있어요. 서두르지 않아도 돼요.",
  "작은 완성이 큰 안정을 만듭니다.",
];

const boardEl = document.getElementById("board");
const messageEl = document.getElementById("message");
const mistakesEl = document.getElementById("mistakes");

const newPuzzleBtn = document.getElementById("newPuzzleBtn");
const hintBtn = document.getElementById("hintBtn");
const resetBtn = document.getElementById("resetBtn");

const MAX_MISTAKES = 6;
let currentPuzzle = null;
let solution = [];
let player = [];
let mistakes = 0;
let hintUsed = false;
let solved = false;

function parseGrid(lines) {
  return lines.map((row) => row.split("").map((c) => Number(c)));
}

function computeClues(line) {
  const clues = [];
  let count = 0;
  for (const cell of line) {
    if (cell === 1) {
      count += 1;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }
  if (count > 0) clues.push(count);
  return clues.length ? clues : [0];
}

function loadPuzzle(puzzle) {
  currentPuzzle = puzzle;
  solution = parseGrid(puzzle.grid);
  player = solution.map((row) => row.map(() => 0));
  mistakes = 0;
  hintUsed = false;
  solved = false;
  hintBtn.disabled = false;
  updateMessage(`퍼즐: ${puzzle.name} · 천천히 시작해봐요.`);
  updateMistakes();
  renderBoard();
}

function updateMessage(text) {
  messageEl.textContent = text;
}

function updateMistakes() {
  mistakesEl.textContent = String(mistakes);
}

function renderBoard() {
  const size = solution.length;
  const rowClues = solution.map(computeClues);
  const colClues = Array.from({ length: size }, (_, col) =>
    computeClues(solution.map((row) => row[col])),
  );

  const topDepth = Math.max(...colClues.map((c) => c.length));
  const leftDepth = Math.max(...rowClues.map((c) => c.length));
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--cols", String(size + leftDepth));
  boardEl.style.setProperty("--rows", String(size + topDepth));

  for (let r = 0; r < topDepth; r += 1) {
    for (let c = 0; c < leftDepth; c += 1) {
      boardEl.appendChild(createClueCell("", true));
    }
    for (let c = 0; c < size; c += 1) {
      const clues = colClues[c];
      const padding = topDepth - clues.length;
      const text = r >= padding ? clues[r - padding] : "";
      boardEl.appendChild(createClueCell(text));
    }
  }

  for (let r = 0; r < size; r += 1) {
    const clues = rowClues[r];
    const padding = leftDepth - clues.length;

    for (let c = 0; c < leftDepth; c += 1) {
      const text = c >= padding ? clues[c - padding] : "";
      boardEl.appendChild(createClueCell(text));
    }

    for (let c = 0; c < size; c += 1) {
      boardEl.appendChild(createPlayCell(r, c));
    }
  }
}

function createClueCell(text, isEmpty = false) {
  const cell = document.createElement("div");
  cell.className = isEmpty ? "clue empty" : "clue";
  cell.textContent = text;
  return cell;
}

function createPlayCell(r, c) {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  cell.dataset.row = String(r);
  cell.dataset.col = String(c);

  paintCell(cell, player[r][c]);

  cell.addEventListener("click", () => handleFill(cell, r, c));
  cell.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    handleMark(cell, r, c);
  });

  return cell;
}

function paintCell(cell, value) {
  cell.classList.remove("filled", "marked");
  if (value === 1) {
    cell.classList.add("filled");
  }
  if (value === -1) {
    cell.classList.add("marked");
  }
}

function handleFill(cell, r, c) {
  if (solved) return;

  if (solution[r][c] === 1) {
    player[r][c] = player[r][c] === 1 ? 0 : 1;
    paintCell(cell, player[r][c]);
    maybeSolved();
    return;
  }

  mistakes += 1;
  updateMistakes();
  cell.classList.add("error");
  setTimeout(() => cell.classList.remove("error"), 300);
  updateMessage(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);

  if (mistakes >= MAX_MISTAKES) {
    updateMessage("괜찮아요. 잠시 쉬고 다시 시작해요.");
    revealSolution();
  }
}

function handleMark(cell, r, c) {
  if (solved) return;
  player[r][c] = player[r][c] === -1 ? 0 : -1;
  paintCell(cell, player[r][c]);
}

function maybeSolved() {
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution.length; c += 1) {
      if (solution[r][c] === 1 && player[r][c] !== 1) {
        return;
      }
    }
  }

  solved = true;
  updateMessage("완성했어요! 오늘의 마음에 미소를 보냈습니다 🌼");
}

function revealSolution() {
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution.length; c += 1) {
      player[r][c] = solution[r][c] === 1 ? 1 : -1;
    }
  }
  solved = true;
  renderBoard();
}

function giveHint() {
  if (hintUsed || solved) return;

  const hidden = [];
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution.length; c += 1) {
      if (solution[r][c] === 1 && player[r][c] !== 1) {
        hidden.push([r, c]);
      }
    }
  }

  if (!hidden.length) {
    maybeSolved();
    return;
  }

  const [r, c] = hidden[Math.floor(Math.random() * hidden.length)];
  player[r][c] = 1;
  hintUsed = true;
  hintBtn.disabled = true;
  updateMessage("힌트를 사용했어요. 한 칸이 마음을 편안하게 해줄 거예요.");
  renderBoard();
  maybeSolved();
}

newPuzzleBtn.addEventListener("click", () => {
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  loadPuzzle(puzzle);
});
resetBtn.addEventListener("click", () => {
  if (currentPuzzle) loadPuzzle(currentPuzzle);
});
hintBtn.addEventListener("click", giveHint);

loadPuzzle(puzzles[Math.floor(Math.random() * puzzles.length)]);
