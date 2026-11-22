/**
 * progress-reset.js - jednolity przycisk "Wyzeruj rekord i osiągnięcia" dla wszystkich gier.
 *
 * Wymaga: <body data-game="dino|tetris|shooter|battleship"> oraz listy osiągnięć o id="achievementsList".
 * Skrypt ładuj jako OSTATNI (po skrypcie gry), bo Statki budują sekcję osiągnięć dopiero po załadowaniu strony.
 * Po potwierdzeniu usuwa zapisane dane gry i przeładowuje stronę, żeby nic z pamięci
 * nie zapisało się z powrotem. Ustawienia (głośność, tryb, poziom trudności itp.) zostają.
 */
(function () {
    'use strict';

    var P = 'endixendi:';
    var GAMES = {
        dino: {
            name: 'Dino',
            keys: ['highScore', 'dinoStats', 'dinoAch', 'dinoSkin']
        },
        tetris: {
            name: 'Tetris',
            keys: [
                P + 'tetris:highscore',        // rekord Maratonu
                P + 'tetris:best:sprint',
                P + 'tetris:best:ultra',
                P + 'tetris:best:zen',
                P + 'tetris:best:challenge',
                P + 'tetris:stats',
                P + 'tetris:ach',
                P + 'tetris:skin'
            ]
        },
        shooter: {
            name: 'Shooter',
            keys: [P + 'shooter:highscore', P + 'shooter:stats', P + 'shooter:achievements']
        },
        battleship: {
            name: 'Statki',
            keys: [P + 'battleship:stats', P + 'battleship:ach']
        }
    };

    var game = GAMES[document.body && document.body.getAttribute('data-game')];
    if (!game) return;

    function removeKey(key) {
        try { if (typeof store !== 'undefined' && typeof store.remove === 'function') store.remove(key); } catch (e) { /* ignoruj */ }
        try { localStorage.removeItem(key); } catch (e) { /* ignoruj */ }
    }

    var resetting = false;

    function wipe() { game.keys.forEach(removeKey); }

    // Gry (np. Shooter) zapisują statystyki z pamięci przy opuszczaniu strony (pagehide / visibilitychange).
    // Ten skrypt jest ładowany ostatni, więc jego nasłuchiwanie odpala się po grze i kasuje dane jeszcze raz.
    function wipeAgainOnLeave() { if (resetting) wipe(); }
    window.addEventListener('pagehide', wipeAgainOnLeave);
    document.addEventListener('visibilitychange', wipeAgainOnLeave);

    function resetProgress() {
        var ok = window.confirm('Na pewno wyzerować rekord, statystyki i osiągnięcia w grze: ' + game.name + '?\nTej operacji nie można cofnąć.');
        if (!ok) return;
        resetting = true;
        wipe();
        window.location.reload();
    }

    function inject() {
        if (document.getElementById('resetGameProgress')) return true;
        var list = document.getElementById('achievementsList');
        if (!list || !list.parentElement) return false;

        var wrap = document.createElement('div');
        wrap.className = 'progress-reset';
        wrap.style.marginTop = '16px';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'resetGameProgress';
        btn.className = 'ghost';
        btn.textContent = 'Wyzeruj rekord i osiągnięcia';
        btn.addEventListener('click', resetProgress);

        wrap.appendChild(btn);
        list.parentElement.appendChild(wrap);
        return true;
    }

    function init() {
        if (!inject()) setTimeout(inject, 400); // gdyby sekcja powstała chwilę później
    }

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();
