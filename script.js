document.addEventListener('DOMContentLoaded', () => {
    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');
    const dice3 = document.getElementById('dice3');
    const scene3 = document.getElementById('scene3');
    const rollBtn = document.getElementById('roll-button');
    const resetBtn = document.getElementById('reset-button');
    const resultDisplay = document.getElementById('current-result');
    const turnDisplay = document.getElementById('turn-display');
    const historyList = document.getElementById('history-list');

    const playersTemplate = ['たいが', 'さっちゃん', 'パピー'];
    let playerStats = {
        'たいが': { wins: 0, games: 0 },
        'さっちゃん': { wins: 0, games: 0 },
        'パピー': { wins: 0, games: 0 }
    };
    let players = [];
    let currentPlayerIndex = 0;
    let currentRound = 1;
    const maxRounds = 5;
    let isGameOver = false;

    // Rotation map matches the CSS 3D Transforms logic
    const rotationMap = {
        1: { x: 0, y: 0 },
        2: { x: 0, y: -90 },
        3: { x: -90, y: 0 },
        4: { x: 90, y: 0 },
        5: { x: 0, y: 90 },
        6: { x: 0, y: 180 }
    };

    function initGame() {
        // Fisher-Yates shuffle
        let shuffled = [...playersTemplate];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        players = shuffled.map(name => ({
            name: name,
            score: 0
        }));

        currentPlayerIndex = 0;
        currentRound = 1;
        isGameOver = false;

        rollBtn.disabled = false;
        rollBtn.style.display = 'inline-block';
        if (scene3) scene3.style.display = 'none';
        if (resetBtn) resetBtn.classList.add('hidden');
        resultDisplay.classList.remove('show');

        updateTurnDisplay();
        updateRankings();
    }

    function getRandomDice() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function rollDice() {
        if (rollBtn.disabled || isGameOver) return;

        rollBtn.disabled = true;
        resultDisplay.classList.remove('show');

        const val1 = getRandomDice();
        const val2 = getRandomDice();
        let val3 = 0;

        const isRound5 = currentRound === 5;
        if (isRound5) {
            val3 = getRandomDice();
            scene3.style.display = 'block';
        } else {
            scene3.style.display = 'none';
        }

        const total = val1 + val2 + val3;

        const extraSpins1X = (Math.floor(Math.random() * 3) + 2) * 360;
        const extraSpins1Y = (Math.floor(Math.random() * 3) + 2) * 360;
        const extraSpins2X = (Math.floor(Math.random() * 3) + 2) * 360;
        const extraSpins2Y = (Math.floor(Math.random() * 3) + 2) * 360;

        const rx1 = rotationMap[val1].x + extraSpins1X;
        const ry1 = rotationMap[val1].y + extraSpins1Y;
        const rx2 = rotationMap[val2].x + extraSpins2X;
        const ry2 = rotationMap[val2].y + extraSpins2Y;

        dice1.style.transform = `translateZ(-50px) rotateX(${rx1}deg) rotateY(${ry1}deg)`;
        dice2.style.transform = `translateZ(-50px) rotateX(${rx2}deg) rotateY(${ry2}deg)`;

        if (isRound5) {
            const extraSpins3X = (Math.floor(Math.random() * 3) + 2) * 360;
            const extraSpins3Y = (Math.floor(Math.random() * 3) + 2) * 360;
            const rx3 = rotationMap[val3].x + extraSpins3X;
            const ry3 = rotationMap[val3].y + extraSpins3Y;
            dice3.style.transform = `translateZ(-50px) rotateX(${rx3}deg) rotateY(${ry3}deg)`;
        }

        setTimeout(() => {
            updateGameState(total);
            if (!isGameOver) rollBtn.disabled = false;
        }, 1500);
    }

    function updateGameState(total) {
        const currentPlayer = players[currentPlayerIndex];
        currentPlayer.score += total;

        resultDisplay.textContent = `${currentPlayer.name} は ${total} を出した！`;
        resultDisplay.className = '';
        resultDisplay.classList.add('win-text', 'show'); // reuse win-text for positive feedback

        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            currentPlayerIndex = 0;
            currentRound++;
        }

        updateRankings();

        if (currentRound > maxRounds) {
            isGameOver = true;
            endGame();
        } else {
            updateTurnDisplay();
        }
    }

    function updateTurnDisplay() {
        const currentPlayer = players[currentPlayerIndex];
        turnDisplay.textContent = `Round ${currentRound}/${maxRounds} - ${currentPlayer.name} の番`;
    }

    function updateRankings() {
        // Create a sorted copy of players by score descending
        const sorted = [...players].sort((a, b) => b.score - a.score);

        const rankEls = [
            { nameBtn: document.getElementById('rank-1-name'), scoreBtn: document.getElementById('rank-1-score') },
            { nameBtn: document.getElementById('rank-2-name'), scoreBtn: document.getElementById('rank-2-score') },
            { nameBtn: document.getElementById('rank-3-name'), scoreBtn: document.getElementById('rank-3-score') }
        ];

        sorted.forEach((player, i) => {
            if (rankEls[i].nameBtn && rankEls[i].scoreBtn) {
                const oldScore = parseInt(rankEls[i].scoreBtn.textContent) || 0;

                rankEls[i].nameBtn.textContent = player.name;
                rankEls[i].scoreBtn.textContent = player.score;

                if (oldScore !== player.score) {
                    const card = rankEls[i].scoreBtn.parentElement;
                    card.style.transform = 'scale(1.05) translateY(-5px)';
                    card.style.borderColor = '#8b5cf6';
                    setTimeout(() => {
                        card.style.transform = 'scale(1) translateY(0)';
                        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }, 300);
                }
            }
        });
    }

    function updateWinRatesDisplay() {
        historyList.innerHTML = '';
        playersTemplate.forEach(name => {
            const stats = playerStats[name];
            const rate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div style="font-size: 1.2rem; font-weight: 600;">${name}</div>
                <div style="font-size: 1.2rem; color: #10b981;">勝率: ${rate}% <span style="font-size: 0.9rem; color: #94a3b8;">(${stats.wins}/${stats.games})</span></div>
            `;
            historyList.appendChild(li);
        });
    }

    function endGame() {
        rollBtn.style.display = 'none';
        if (resetBtn) resetBtn.classList.remove('hidden');

        const sorted = [...players].sort((a, b) => b.score - a.score);

        // Check for tie
        let winners = [sorted[0]];
        if (sorted[1].score === sorted[0].score) winners.push(sorted[1]);
        if (sorted[2].score === sorted[0].score) winners.push(sorted[2]);

        const winnerNames = winners.map(w => w.name).join(' と ');

        turnDisplay.textContent = `ゲーム終了！`;
        resultDisplay.textContent = `🎊 ${winnerNames} の優勝！ (スコア: ${sorted[0].score}) 🎊`;

        playersTemplate.forEach(name => {
            playerStats[name].games++;
        });
        winners.forEach(w => {
            playerStats[w.name].wins++;
        });
        updateWinRatesDisplay();
    }

    rollBtn.addEventListener('click', rollDice);
    if (resetBtn) resetBtn.addEventListener('click', initGame);

    initGame();
    updateWinRatesDisplay();
});
