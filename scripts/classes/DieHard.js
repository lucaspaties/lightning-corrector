import {dieHardLog, insertAfter} from '../lib/helpers.js';
import DieHardFudgeDialog from './DieHardFudgeDialog.js';
import DieHardPf2e from './DieHardPf2e.js';

export const DieHardSetting = (setting) => game.settings.get('lightning-corrector', setting);

export default class DieHard {

  constructor() {
    dieHardLog(false, 'DieHard - constructor');
  }

  static renderDieHardIcons() {
    dieHardLog(false, 'DieHard.renderDieHardIcons');
    if (game.dieHardSystem == null) {
      dieHardLog(false, 'Unsupported system for world; not rendering side bar');
      return;
    }
    dieHardLog(false, 'Render side bar');

    // Encontra o elemento de controle do chat
    let chatControlIcon = document.querySelector('.chat-control-icon');
    
    if (!chatControlIcon) {
      chatControlIcon = document.querySelector('#chat-controls .chat-control-icon');
    }
    if (!chatControlIcon) {
      const chatControls = document.querySelector('#chat-controls');
      if (chatControls) {
        chatControlIcon = chatControls.querySelector('label') || chatControls.firstElementChild;
      }
    }
    
    dieHardLog(false, 'DieHard.renderDieHardIcons - chatControlIcon found:', !!chatControlIcon);

    if (document.querySelector('.die-hard-fudge-icon') === null && chatControlIcon) {
      let fudgeButton = document.createElement('label');
      fudgeButton.classList.add('die-hard-fudge-icon');
      fudgeButton.innerHTML = '<span title="Fudge Paused"><i id="die-hard-pause-fudge-icon" class="fas fa-pause-circle die-hard-icon-hidden"></i></span><span title="Fudge"><i id="die-hard-fudge-icon" class="fas fa-poop"></i></span>';
      fudgeButton.addEventListener('click', async (ev) => {
        new DieHardFudgeDialog().render(true);
      });
      fudgeButton.addEventListener('contextmenu', async (ev) => {
        ev.preventDefault();
        game.dieHardSystem.disableAllFudges();
      });

      try {
        insertAfter(fudgeButton, chatControlIcon);
        dieHardLog(false, 'DieHard.renderDieHardIcons - Fudge button inserted');
      } catch (e) {
        dieHardLog(false, 'DieHard.renderDieHardIcons - Error inserting fudge button:', e);
      }
    }
    DieHard.refreshDieHardIcons();
  }

  static getDefaultDieHardSettings() {
    dieHardLog(false, 'DieHard.getDefaultDieHardSettings');
    return {
      debug: {
        allActors: true
      },
      fudgeConfig: {
        maxFudgeAttemptsPerRoll: 150,
        globalDisable: false
      },
      gmFudges: []
    };
  }

  static registerSettings() {
    dieHardLog(false, 'DieHard.registerSettings');
    
    if (game.system.id === 'pf2e') {
      dieHardLog(true, 'Configuring for pf2e system');
      game.dieHardSystem = new DieHardPf2e();
    } else {
      dieHardLog(true, 'Unsupported game system: ' + game.system.id);
    }

    // Enables fudge
    game.settings.register('lightning-corrector', 'fudgeEnabled', {
      name: 'Fudge Enabled',
      hint: 'Enable the Fudge functionality',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
      onChange: DieHard.refreshDieHardStatus
    });

    // Enables debug die
    game.settings.register('lightning-corrector', 'debugDieResultEnabled', {
      name: 'Debug Die Result Enabled',
      hint: 'Enable the use of Debug Die Result',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });

    game.settings.register('lightning-corrector', 'debugDieResult', {
      name: 'Debug Die Result',
      hint: 'Make every initial roll of die value',
      scope: 'world',
      config: true,
      default: 5,
      type: Number,
      range: {
        min: 1,
        max: 20,
        step: 1
      }
    });

    game.settings.register('lightning-corrector', 'dieHardSettings', {
      name: '',
      default: DieHard.getDefaultDieHardSettings(),
      type: Object,
      scope: 'world',
      config: false,
    });
  }

  static async refreshDieHardStatus() {
    dieHardLog(false, 'DieHard.refreshDieHardStatus');
    await DieHard.refreshDieHardIcons();
    if (game.dieHardSystem) {
      game.dieHardSystem.refreshActiveFudgesIcon();
    }
  }

  static async refreshDieHardIcons(globallyDisabled = undefined) {
    dieHardLog(false, 'DieHard.refreshDieHardIcons');
    
    // Guard against settings not being registered yet
    try {
      game.settings.get('lightning-corrector', 'dieHardSettings');
    } catch (e) {
      dieHardLog(false, 'DieHard.refreshDieHardIcons - Settings not ready yet');
      return;
    }
    
    let iconDisabled;
    if (globallyDisabled === undefined) {
      iconDisabled = DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled;
    } else {
      iconDisabled = globallyDisabled;
    }
    
    try {
      if (DieHardSetting('fudgeEnabled')) {
        if (iconDisabled) {
          // Disabled
          dieHardLog(false, 'DieHard.refreshDieHardIcons - Global Disabled');
          document.getElementById('die-hard-pause-fudge-icon')?.classList.remove('die-hard-icon-hidden');
          document.getElementById('die-hard-fudge-icon')?.classList.add('die-hard-icon-hidden');
          return;
        } else {
          // Enabled
          dieHardLog(false, 'DieHard.refreshDieHardIcons - Global Enabled');
          document.getElementById('die-hard-pause-fudge-icon')?.classList.add('die-hard-icon-hidden');
          document.getElementById('die-hard-fudge-icon')?.classList.remove('die-hard-icon-hidden');
        }
        if (game.dieHardSystem?.hasActiveFudges()) {
          document.getElementById('die-hard-fudge-icon')?.classList.add('die-hard-icon-active');
        } else {
          document.getElementById('die-hard-fudge-icon')?.classList.remove('die-hard-icon-active');
        }
      } else {
        document.getElementById('die-hard-pause-fudge-icon')?.classList.add('die-hard-icon-hidden');
        document.getElementById('die-hard-fudge-icon')?.classList.add('die-hard-icon-hidden');
      }
    } catch (e) {
      dieHardLog(false, 'DieHard.refreshDieHardIcons - error:', e);
    }
  }

  static async dmToGm(message) {
    dieHardLog(false, 'DieHard.dmToGm');
    
    const gmUsers = game.users.filter(u => u.isGM);
    
    ChatMessage.create({
      user: game.user.id,
      blind: true,
      content: message,
      whisper: gmUsers.map(u => u.id),
      flags: {'lightning-corrector': {dieHardWhisper: true}}
    });
  }

  static hideDieHardWhisper(message, html) {
    dieHardLog(false, 'DieHard.hideDieHardWhisper');
    try {
      if (!game.user.isGM && message.getFlag('lightning-corrector', 'dieHardWhisper')) {
        html.addClass('die-hard-blind-whisper');
      }
    } catch (e) {
      dieHardLog(false, 'DieHard.hideDieHardWhisper - error:', e);
    }
  }
}
