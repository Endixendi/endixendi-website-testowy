/**
 * Statki (Battleship)
 */

const BOARD_SIZE = 10;
const SHIPS_CONFIG = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

// Elementy DOM
const battleshipContainer = document.getElementById('battleshipContainer');
const btnFullscreen = document.getElementById('btn-fullscreen');
const playerGrid = document.getElementById('player-grid');
const computerGrid = document.getElementById('computer-grid');
const btnRandomize = document.getElementById('btn-randomize');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const logContent = document.getElementById('game-log');
const turnStatus = document.getElementById('turn-status');
const difficultySelect = document.getElementById('difficulty-select');

// Stan Gry
const gameState = {
    active: false,
    playerTurn: true,
    playerShips: [],
    computerShips: [],
    playerHits: 0,
    computerHits: 0,
    totalSegments: SHIPS_CONFIG.reduce((a, b) => a + b, 0),
    botQueue: [],
    lastHit: null,
    huntDirection: null,
    difficulty: 'easy'
};

// Dźwięki
const audio = {
    music: new Audio("assets/sounds/statki/battle-bg.mp3"),
    hit: new Audio("assets/sounds/global/hit.mp3"),
    splash: new Audio("assets/sounds/global/drop.mp3"),
    win: new Audio("assets/sounds/global/success.mp3"),
    lose: new Audio("assets/sounds/global/gameover-sad.mp3")
};

// Głośność
Object.values(audio).forEach(s => s.volume = 0.3);
audio.music.loop = true;
audio.music.volume = 0.1;

/* --- OBSŁUGA GŁOŚNOŚCI --- */

const musicSlider = document.getElementById('volume-music');
if (musicSlider) {
    musicSlider.addEventListener('input', () => {
        audio.music.volume = musicSlider.value;
    });
}

const effectsSlider = document.getElementById('volume-effects');
if (effectsSlider) {
    effectsSlider.addEventListener('input', () => {
        const vol = effectsSlider.value;
        audio.hit.volume = vol;
        audio.splash.volume = vol;
        audio.win.volume = vol;
        audio.lose.volume = vol;
    });
}

/* --- OBSŁUGA PEŁNEGO EKRANU --- */

function isFullscreenActive() {
    return GameFullscreen.isActive(battleshipContainer);
}

function updateFullscreenUI() {
    const active = isFullscreenActive();
    if (btnFullscreen) {
        btnFullscreen.textContent = active ? '✕' : '⛶';
        btnFullscreen.title = active ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran';
        btnFullscreen.setAttribute('aria-label', active ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran');
    }
    document.body.style.overflow = active ? 'hidden' : '';
}

function toggleFullscreen() {
    GameFullscreen.toggle(battleshipContainer, updateFullscreenUI);
}

/* --- INICJALIZACJA --- */

function initGame() {
    createGrid(playerGrid, 'player');
    createGrid(computerGrid, 'computer');
    resetData();
    randomizeShips(gameState.playerShips);
    renderGrid(playerGrid, gameState.playerShips, true);
    updateFleetInfo();
    log("Witaj, Kapitanie. Rozmieść flotę i rozpocznij bitwę.", "info");
}

function resetData() {
    gameState.playerShips = createEmptyBoard();
    gameState.computerShips = createEmptyBoard();
    gameState.active = false;
    gameState.playerHits = 0;
    gameState.computerHits = 0;
    gameState.botQueue = [];
    gameState.lastHit = null;
    gameState.huntDirection = null;
    gameState.playerTurn = true;

    logContent.classList.remove('mode-cheater');
    difficultySelect.disabled = false;

    btnStart.style.display = 'inline-block';
    btnRestart.style.display = 'none';
    btnRandomize.disabled = false;
    computerGrid.classList.add('locked');
    turnStatus.textContent = "Rozstawianie Floty";
    turnStatus.style.color = "";

    document.querySelectorAll('.cell').forEach(c => c.className = 'cell');
    logContent.innerHTML = '';
}

function createEmptyBoard() {
    return Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
}

function createGrid(container, owner) {
    container.innerHTML = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            if (owner === 'computer') {
                cell.addEventListener('click', handlePlayerShot);
            }
            container.appendChild(cell);
        }
    }
}

/* --- LOGIKA ROZMIESZCZANIA --- */

function randomizeShips(board) {
    for (let attempt = 0; attempt < 500; attempt++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            board[y].fill(0);
        }

        let allPlaced = true;
        for (const size of SHIPS_CONFIG) {
            let placed = false;
            for (let tries = 0; tries < 200 && !placed; tries++) {
                const horizontal = Math.random() < 0.5;
                const x = Math.floor(Math.random() * BOARD_SIZE);
                const y = Math.floor(Math.random() * BOARD_SIZE);

                if (canPlace(board, x, y, size, horizontal)) {
                    place(board, x, y, size, horizontal);
                    placed = true;
                }
            }
            if (!placed) { allPlaced = false; break; }
        }

        if (allPlaced) return;
    }
}

function canPlace(board, x, y, size, horizontal) {
    if (horizontal && x + size > BOARD_SIZE) return false;
    if (!horizontal && y + size > BOARD_SIZE) return false;

    const startX = Math.max(0, x - 1);
    const endX = Math.min(BOARD_SIZE - 1, horizontal ? x + size : x + 1);
    const startY = Math.max(0, y - 1);
    const endY = Math.min(BOARD_SIZE - 1, horizontal ? y + 1 : y + size);

    for (let i = startY; i <= endY; i++) {
        for (let j = startX; j <= endX; j++) {
            if (board[i][j] !== 0) return false;
        }
    }
    return true;
}

function place(board, x, y, size, horizontal) {
    for (let i = 0; i < size; i++) {
        if (horizontal) {
            board[y][x + i] = 1;
        } else {
            board[y + i][x] = 1;
        }
    }
}

/* --- ROZGRYWKA --- */

function handlePlayerShot(e) {
    if (!gameState.active || !gameState.playerTurn) return;

    const cell = e.target.closest('.cell');
    if (!cell || !computerGrid.contains(cell)) return;

    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    if (Number.isNaN(x) || Number.isNaN(y)) return;

    if (gameState.computerShips[y][x] >= 2) return;

    const isHit = (gameState.computerShips[y][x] === 1);
    gameState.computerShips[y][x] = isHit ? 3 : 2;

    updateVisuals(cell, isHit);

    if (isHit) {
        gameState.computerHits++;
        const sunk = resolveSunk('computer', x, y);
        log(`Trafienie [${x},${y}]! Masz dodatkowy ruch!`, "player");
        if (sunk) log("Zatopiony! Wokół statku nie ma już innych jednostek.", "player");
        updateFleetInfo();
        turnStatus.textContent = "TRAFIENIE! STRZELAJ DALEJ";
        playAudio('hit');
        checkWin();
    } else {
        log(`Pudło [${x},${y}].`, "info");
        playAudio('splash');
        endTurn();
    }
}

function endTurn() {
    gameState.playerTurn = !gameState.playerTurn;

    if (gameState.playerTurn) {
        turnStatus.textContent = "TWÓJ RUCH";
        turnStatus.style.color = "var(--accent)";
    } else {
        turnStatus.textContent = "RUCH KOMPUTERA";
        turnStatus.style.color = "var(--danger)";
        setTimeout(botTurn, 800);
    }
}

/* --- AI (BOT) --- */

function botTurn() {
    if (!gameState.active) return;

    let target = null;
    let cheatChance = 0;

    if (gameState.difficulty === 'hard') cheatChance = 0.3;
    if (gameState.difficulty === 'cheater') cheatChance = 0.7;

    if (gameState.botQueue.length === 0 && Math.random() < cheatChance) {
        const playerShipCoordinates = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (gameState.playerShips[y][x] === 1) {
                    playerShipCoordinates.push({ x, y });
                }
            }
        }

        if (playerShipCoordinates.length > 0) {
            target = playerShipCoordinates[Math.floor(Math.random() * playerShipCoordinates.length)];

            if (gameState.difficulty === 'cheater') {
                log("!!! SYSTEMY ZAKŁÓCONE: Wróg namierzył Twój sygnał !!!", "enemy");
            } else {
                log("Bot użył sonaru dalekiego zasięgu.", "enemy");
            }
        }
    }

    if (!target) {
        while (gameState.botQueue.length > 0 && gameState.playerShips[gameState.botQueue[0].y][gameState.botQueue[0].x] >= 2) {
            gameState.botQueue.shift();
        }

        if (gameState.botQueue.length > 0) {
            target = gameState.botQueue.shift();
        } else {
            gameState.lastHit = null;
            gameState.huntDirection = null;
            do {
                target = {
                    x: Math.floor(Math.random() * BOARD_SIZE),
                    y: Math.floor(Math.random() * BOARD_SIZE)
                };
            } while (gameState.playerShips[target.y][target.x] >= 2);
        }
    }

    const x = target.x;
    const y = target.y;
    const isHit = (gameState.playerShips[y][x] === 1);
    gameState.playerShips[y][x] = isHit ? 3 : 2;

    const cellIndex = y * BOARD_SIZE + x;
    const cell = playerGrid.children[cellIndex];
    updateVisuals(cell, isHit);

    if (isHit) {
        gameState.playerHits++;
        log(`Wróg trafił [${x},${y}]!`, "enemy");
        playAudio('hit');

        if (resolveSunk('player', x, y)) {
            log("Wróg zatopił jeden z Twoich statków!", "enemy");
            gameState.botQueue = [];
            gameState.lastHit = null;
            gameState.huntDirection = null;
        } else {
            addSmartNeighbors(x, y);
            gameState.lastHit = { x, y };
        }
        updateFleetInfo();
        checkWin();
        if (gameState.active) {
            setTimeout(botTurn, 1000);
        }
    } else {
        log("Wróg spudłował.", "info");
        playAudio('splash');
        endTurn();
    }
}

function addSmartNeighbors(x, y) {
    const directions = [
        { x: 0, y: -1, type: 'v' }, { x: 0, y: 1, type: 'v' },
        { x: -1, y: 0, type: 'h' }, { x: 1, y: 0, type: 'h' }
    ];

    if (gameState.lastHit) {
        if (gameState.lastHit.x === x) {
            gameState.huntDirection = 'v';
        } else if (gameState.lastHit.y === y) {
            gameState.huntDirection = 'h';
        }
    }

    if (gameState.huntDirection) {
        gameState.botQueue = gameState.botQueue.filter(q => {
            if (gameState.huntDirection === 'v') return q.x === x;
            if (gameState.huntDirection === 'h') return q.y === y;
            return true;
        });
    }

    directions.forEach(d => {
        if (gameState.huntDirection && d.type !== gameState.huntDirection) return;
        const nx = x + d.x, ny = y + d.y;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            if (gameState.playerShips[ny][nx] < 2 && isAreaClearForBot(nx, ny)) {
                if (!gameState.botQueue.some(q => q.x === nx && q.y === ny)) {
                    gameState.botQueue.unshift({ x: nx, y: ny });
                }
            }
        }
    });
}

function isAreaClearForBot(x, y) {
    const diagonals = [
        { x: x - 1, y: y - 1 }, { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 }, { x: x + 1, y: y + 1 }
    ];

    for (let d of diagonals) {
        if (d.x >= 0 && d.x < BOARD_SIZE && d.y >= 0 && d.y < BOARD_SIZE) {
            if (gameState.playerShips[d.y][d.x] === 3) return false;
        }
    }
    return true;
}

/* --- ZATOPIENIA I LICZNIK FLOTY --- */

// Zwraca wszystkie pola statku, do którego należy pole (x, y). Statki nie stykają się, więc
// wystarczy przejść po sąsiadach w 4 kierunkach (1 = statek, 3 = trafiony segment).
function shipCells(board, x, y) {
    const out = [];
    const seen = new Set();
    const stack = [{ x, y }];

    while (stack.length) {
        const c = stack.pop();
        const key = c.y * BOARD_SIZE + c.x;
        if (seen.has(key)) continue;
        seen.add(key);

        const v = board[c.y][c.x];
        if (v !== 1 && v !== 3) continue;
        out.push(c);

        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nx = c.x + dx;
            const ny = c.y + dy;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) stack.push({ x: nx, y: ny });
        });
    }
    return out;
}

// Jeśli trafienie zatopiło statek: oznacza go i wszystkie pola wokół jako pudła. Zwraca true/false.
function resolveSunk(owner, x, y) {
    const board = owner === 'computer' ? gameState.computerShips : gameState.playerShips;
    const grid = owner === 'computer' ? computerGrid : playerGrid;
    const cells = shipCells(board, x, y);

    if (!cells.length || !cells.every(c => board[c.y][c.x] === 3)) return false;

    cells.forEach(c => {
        const el = grid.children[c.y * BOARD_SIZE + c.x];
        if (el) {
            el.classList.remove('hit');
            el.classList.add('sunk');
        }
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = c.x + dx;
                const ny = c.y + dy;
                if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) continue;
                if (board[ny][nx] === 0) {
                    board[ny][nx] = 2;
                    const neighbor = grid.children[ny * BOARD_SIZE + nx];
                    if (neighbor) neighbor.classList.add('miss');
                }
            }
        }
    });
    return true;
}

function countAliveShips(board) {
    const seen = new Set();
    let alive = 0;
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const v = board[y][x];
            if ((v === 1 || v === 3) && !seen.has(y * BOARD_SIZE + x)) {
                const cells = shipCells(board, x, y);
                cells.forEach(c => seen.add(c.y * BOARD_SIZE + c.x));
                if (cells.some(c => board[c.y][c.x] === 1)) alive++;
            }
        }
    }
    return alive;
}

function updateFleetInfo() {
    const playerInfo = document.getElementById('player-ships-info');
    const enemyInfo = document.getElementById('enemy-ships-info');
    const total = SHIPS_CONFIG.length;

    if (playerInfo) {
        playerInfo.textContent = `Twoja flota: ${countAliveShips(gameState.playerShips)}/${total}`;
    }
    if (enemyInfo) {
        const placed = gameState.computerShips.some(row => row.some(v => v === 1 || v === 3));
        enemyInfo.textContent = placed
            ? `Flota wroga: ${countAliveShips(gameState.computerShips)}/${total}`
            : 'Wróg ukryty';
    }
}

/* --- UTILS --- */

function updateVisuals(cell, isHit) {
    if (isHit) {
        cell.classList.add('hit');
    } else {
        cell.classList.add('miss');
    }
}

function renderGrid(container, boardData, showShips) {
    Array.from(container.children).forEach((cell, i) => {
        const x = i % BOARD_SIZE;
        const y = Math.floor(i / BOARD_SIZE);
        const val = boardData[y][x];

        cell.className = 'cell';
        if (val === 1 && showShips) cell.classList.add('ship');
        if (val === 2) cell.classList.add('miss');
        if (val === 3) cell.classList.add('hit');
    });
}

function checkWin() {
    if (gameState.computerHits === gameState.totalSegments) {
        endGame(true);
    } else if (gameState.playerHits === gameState.totalSegments) {
        endGame(false);
    }
}

function endGame(playerWon) {
    gameState.active = false;
    turnStatus.textContent = playerWon ? "ZWYCIĘSTWO!" : "PORAŻKA";
    turnStatus.style.color = playerWon ? "var(--accent-2)" : "var(--danger)";

    log(playerWon ? "GRATULACJE! Wroga flota zniszczona." : "MAYDAY! Nasza flota poszła na dno.", "victory");

    audio.music.pause();
    if (playerWon) playAudio('win');
    else playAudio('lose');

    btnStart.style.display = 'none';
    btnRestart.style.display = 'inline-block';

    renderGrid(computerGrid, gameState.computerShips, true);
}

function log(msg, type) {
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = `> ${msg}`;
    logContent.prepend(div);
}

function playAudio(type) {
    try {
        if (audio[type]) {
            audio[type].currentTime = 0;
            audio[type].play().catch(() => {});
        }
    } catch (e) {
        console.log("Audio error", e);
    }
}

/* --- LISTENERY --- */

if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
}

document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && battleshipContainer && battleshipContainer.classList.contains('is-fullscreen')) {
        battleshipContainer.classList.remove('is-fullscreen');
        updateFullscreenUI();
    }
});

btnRandomize.addEventListener('click', () => {
    randomizeShips(gameState.playerShips);
    renderGrid(playerGrid, gameState.playerShips, true);
    log("Przegrupowano flotę.", "info");
});

btnStart.addEventListener('click', () => {
    gameState.active = true;
    gameState.difficulty = difficultySelect.value;

    if (gameState.difficulty === 'cheater') {
        logContent.classList.add('mode-cheater');
    } else {
        logContent.classList.remove('mode-cheater');
    }

    randomizeShips(gameState.computerShips);
    updateFleetInfo();
    computerGrid.classList.remove('locked');
    difficultySelect.disabled = true;
    btnRandomize.disabled = true;
    btnStart.style.display = 'none';

    audio.music.play().catch(e => console.log("Muzyka wymaga interakcji", e));

    log("Systemy bojowe aktywne. Wybierz cel.", "player");
    turnStatus.textContent = "TWÓJ RUCH";
});

btnRestart.addEventListener('click', () => {
    audio.music.pause();
    audio.music.currentTime = 0;
    initGame();
});

window.addEventListener('load', initGame);