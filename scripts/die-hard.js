import {dieHardLog} from "./lib/helpers.js";
import DieHard from "./classes/DieHard.js";
import DieHardVersionNotification from "./classes/DieHardVersionNotification.js";

Hooks.once('init', () => {
  dieHardLog(true, 'Initializing...');
  dieHardLog(true, 'Foundry Version:', game.version);
  DieHard.registerSettings();
});

Hooks.once('ready', () => {
  dieHardLog(true, 'Ready...');
  
  if (game.dieHardSystem == null) {
    dieHardLog(false, 'Unsupported system for world; not rendering side bar');
    return;
  }
  game.dieHardSystem.hookReady();

  // Check if new version; if so send DM to GM
  DieHardVersionNotification.checkVersion();
});

Hooks.on('renderChatMessage', DieHard.hideDieHardWhisper);

// Hook para renderizar ícones na sidebar
Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;
  
  if (document.getElementById('die-hard-fudge-icon') == null) {
    DieHard.renderDieHardIcons();
    DieHard.refreshDieHardStatus();
  }
});

// Hook adicional para renderChatLog
Hooks.on('renderChatLog', (app, html, data) => {
  if (!game.user.isGM) return;
  
  setTimeout(() => {
    if (document.getElementById('die-hard-fudge-icon') == null) {
      DieHard.renderDieHardIcons();
      DieHard.refreshDieHardStatus();
    }
  }, 200);
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('lightning-corrector');
});
