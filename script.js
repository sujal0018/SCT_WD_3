let gameState = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pva";
let scores = { X: 0, O: 0 };

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const diffSelect = document.getElementById("difficultySelect");
const diffWrapper = document.getElementById("diffWrapper");

const winConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

function init() {
	boardEl.innerHTML = "";
	for (let i = 0; i < 9; i++) {
		const cell = document.createElement("div");
		cell.className = "cell";
		cell.onclick = () => handleMove(i);
		boardEl.appendChild(cell);
	}
	renderBoard();
}

function handleMove(i) {
	if (gameState[i] !== "" || !gameActive) return;
	if (gameMode === "pva" && currentPlayer === "O") return;

	gameState[i] = currentPlayer;
	renderBoard();

	if (checkWinner()) return;

	if (gameMode === "pva") {
		currentPlayer = "O";
		updateUI();
		processAi();
	} else {
		currentPlayer = currentPlayer === "X" ? "O" : "X";
		updateUI();
	}
}

function processAi() {
	gameActive = false;
	statusEl.innerText = "Computer thinking...";
	boardEl.classList.add("Computer-thinking");

	setTimeout(() => {
		const move = getBestMove();
		if (move !== null) gameState[move] = "O";

		boardEl.classList.remove("Computer-thinking");
		gameActive = true;

		renderBoard();
		if (!checkWinner()) {
			currentPlayer = "X";
			updateUI();
		}
	}, 600);
}

function getBestMove() {
	const available = gameState
		.map((v, i) => (v === "" ? i : null))
		.filter((v) => v !== null);

	if (diffSelect.value === "easy")
		return available[Math.floor(Math.random() * available.length)];

	if (diffSelect.value === "medium" && Math.random() > 0.5) {
		return available[Math.floor(Math.random() * available.length)];
	}

	let bestScore = -Infinity;
	let move = null;
	for (let i of available) {
		gameState[i] = "O";
		let score = minimax(gameState, 0, false);
		gameState[i] = "";
		if (score > bestScore) {
			bestScore = score;
			move = i;
		}
	}
	return move;
}

function minimax(state, depth, isMax) {
	const res = evaluate(state);
	if (res !== null) return res;

	if (isMax) {
		let best = -Infinity;
		for (let i = 0; i < 9; i++) {
			if (state[i] === "") {
				state[i] = "O";
				let score = minimax(state, depth + 1, false);
				state[i] = "";
				best = Math.max(score, best);
			}
		}
		return best;
	} else {
		let best = Infinity;
		for (let i = 0; i < 9; i++) {
			if (state[i] === "") {
				state[i] = "X";
				let score = minimax(state, depth + 1, true);
				state[i] = "";
				best = Math.min(score, best);
			}
		}
		return best;
	}
}

function evaluate(s) {
	for (let c of winConditions) {
		if (s[c[0]] && s[c[0]] === s[c[1]] && s[c[0]] === s[c[2]]) {
			return s[c[0]] === "O" ? 10 : -10;
		}
	}
	return s.includes("") ? null : 0;
}

function renderBoard() {
	gameState.forEach((mark, i) => {
		const cell = boardEl.children[i];
		cell.innerHTML = mark ? `<span>${mark}</span>` : "";
		cell.className = "cell" + (mark ? " disabled" : "");
		if (mark)
			cell.style.color =
				mark === "X" ? "var(--accent-x)" : "var(--accent-o)";
	});
}

function checkWinner() {
	// 1. Check for Win
	for (let c of winConditions) {
		if (
			gameState[c[0]] &&
			gameState[c[0]] === gameState[c[1]] &&
			gameState[c[0]] === gameState[c[2]]
		) {
			gameActive = false;
			statusEl.innerText = `Winner: ${gameState[c[0]]}!`;
			c.forEach((idx) => boardEl.children[idx].classList.add("winner"));
			scores[gameState[c[0]]]++;
			updateUI();
			confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
			return true;
		}
	}

	// 2. Check for Draw with Popup effect
	if (!gameState.includes("")) {
		gameActive = false;
		statusEl.innerText = "It's a Draw!";
		Array.from(boardEl.children).forEach((cell) =>
			cell.classList.add("draw-highlight"),
		);
		confetti({
			particleCount: 50,
			spread: 50,
			colors: ["#ffeaa7", "#bdc3c7"],
		});
		return true;
	}
	return false;
}

function updateUI() {
	if (gameActive) {
		statusEl.innerText =
			gameMode === "pva" && currentPlayer === "O"
				? "Thinking..."
				: `Player ${currentPlayer}'s Turn`;
	}
	document.getElementById("scoreX").innerText = scores.X;
	document.getElementById("scoreO").innerText = scores.O;
	document
		.getElementById("cardX")
		.classList.toggle("active", currentPlayer === "X");
	document
		.getElementById("cardO")
		.classList.toggle("active", currentPlayer === "O");
	diffWrapper.style.display = gameMode === "pva" ? "block" : "none";
}

window.setMode = (m) => {
	gameMode = m;
	document.getElementById("pvpBtn").classList.toggle("active", m === "pvp");
	document.getElementById("pvaBtn").classList.toggle("active", m === "pva");
	resetGame();
};

window.resetGame = () => {
	gameState.fill("");
	currentPlayer = "X";
	gameActive = true;
	init();
	updateUI();
};

document.getElementById("themeToggle").onclick = () => {
	const theme =
		document.documentElement.getAttribute("data-theme") === "dark"
			? "light"
			: "dark";
	document.documentElement.setAttribute("data-theme", theme);
};

init();
