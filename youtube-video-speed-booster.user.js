// ==UserScript==
// @name         YouTube Video Speed Booster
// @namespace    https://github.com/wallandteen/youtube-video-speed-booster
// @version      0.1.0
// @description  Adds playback speeds above 2x and extends hotkeys on YouTube.
// @author       Valentin Chizhov
// @license      MIT
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    const EXTRA_SPEEDS = [2.5, 3, 3.5, 4, 4.5, 5];

    function getVideo() {
        return document.querySelector('video');
    }

    function changeSpeed(direction) {
        const video = getVideo();
        if (!video) return;
        const current = video.playbackRate;
        const index = SPEEDS.indexOf(current);
        const next = index + direction;
        if (next >= 0 && next < SPEEDS.length) {
            video.playbackRate = SPEEDS[next];
            updateMenuSelection(SPEEDS[next]);
        }
    }

    document.addEventListener('keydown', e => {
        if (!e.shiftKey) return;
        if (e.key === '>' || (e.key === '.' && e.shiftKey)) {
            changeSpeed(1);
        } else if (e.key === '<' || (e.key === ',' && e.shiftKey)) {
            changeSpeed(-1);
        }
    });

    function updateMenuSelection(rate) {
        const labels = document.querySelectorAll('.ytp-menuitem-label');
        labels.forEach(label => {
            if (/^[0-9.]+$/.test(label.textContent.trim())) {
                const item = label.closest('.ytp-menuitem');
                if (parseFloat(label.textContent) === rate) {
                    item?.setAttribute('aria-checked', 'true');
                } else {
                    item?.setAttribute('aria-checked', 'false');
                }
            }
        });
    }

    function addSpeedOptions(menu) {
        const labels = Array.from(menu.querySelectorAll('.ytp-menuitem-label')).map(l => l.textContent.trim());
        EXTRA_SPEEDS.forEach(speed => {
            if (labels.includes(String(speed))) return;
            const template = menu.querySelector('.ytp-menuitem');
            if (!template) return;
            const item = template.cloneNode(true);
            const label = item.querySelector('.ytp-menuitem-label');
            label.textContent = speed;
            item.setAttribute('data-speed', speed);
            item.addEventListener('click', e => {
                e.stopPropagation();
                const video = getVideo();
                if (video) {
                    video.playbackRate = speed;
                    updateMenuSelection(speed);
                }
            });
            menu.appendChild(item);
        });
    }

    function observeMenus() {
        const observer = new MutationObserver(mutations => {
            for (const mut of mutations) {
                mut.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    if (node.matches('.ytp-panel-menu') || node.querySelector('.ytp-panel-menu')) {
                        const menu = node.matches('.ytp-panel-menu') ? node : node.querySelector('.ytp-panel-menu');
                        const labels = Array.from(menu.querySelectorAll('.ytp-menuitem-label')).map(el => el.textContent.trim());
                        if (labels.includes('2')) {
                            addSpeedOptions(menu);
                        }
                    }
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        observeMenus();
    }

    document.addEventListener('spfdone', init);
    document.addEventListener('yt-navigate-finish', init);
    window.addEventListener('load', init);
})();
