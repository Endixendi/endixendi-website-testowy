/**
 * Wspólna obsługa pełnego ekranu dla gier (dino, tetris, shooter, statki).
 * Natywne Fullscreen API + fallback klasą .is-fullscreen (np. iPhone / iOS Safari).
 * Ładować PRZED plikiem danej gry.
 */
(function () {
    'use strict';

    const FS_CLASS = 'is-fullscreen';

    function isActive(container) {
        return Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            (container && container.classList.contains(FS_CLASS))
        );
    }

    function toggle(container, onChange) {
        if (!container) return;
        const notify = typeof onChange === 'function' ? onChange : () => {};

        if (isActive(container)) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            }
            container.classList.remove(FS_CLASS);
            notify();
            return;
        }

        if (container.requestFullscreen) {
            container.requestFullscreen().then(notify).catch(() => {
                container.classList.add(FS_CLASS);
                notify();
            });
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
            notify();
        } else {
            container.classList.add(FS_CLASS);
            notify();
        }
    }

    window.GameFullscreen = { isActive, toggle };
})();
