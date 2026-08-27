'use strict';

// Compatibilità con vecchi link/cache: l'app autorevole vive in /gioco.
if (window.location.pathname !== '/gioco' && window.location.pathname !== '/game.html') {
  window.location.replace('/gioco');
}
