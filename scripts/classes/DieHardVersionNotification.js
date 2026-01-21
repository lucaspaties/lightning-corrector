import {dieHardLog} from "../lib/helpers.js";
import DieHard from "./DieHard.js";
/*
 * Provides a mechanism to send whisper to GM when new version installed.
 */
export default class DieHardVersionNotification {
  static checkVersion() {
    let functionLogName = 'DieHardVersionNotification.checkVersion'
    let notificationVersion = 8

    // First time module is being loaded
    if (game.user.isGM && game.user.getFlag('foundry-die-hard', 'versionNotification') !== notificationVersion) {
      dieHardLog(false, functionLogName + ' - Send version notification', game.user.getFlag('foundry-die-hard', 'versionNotification'));
      let commonHeader = "<p><b>Die Hard Module</b></p>"
      let commonFooter = "<p>To report problems:<ul><li>open a GitHub issue <a href='https://github.com/UranusBytes/foundry-die-hard/issues' target='_blank'>here</a></li><li>send a message on Discord to <a href='https://discordapp.com/users/530108795796455437' target='_blank'>Glutious#7241</a></li></ul></p>"
      let versionMessage = {
        8: "<b>v0.2.0</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Updated for Foundry VTT v13</li>" +
          "<li>PF2e system only - DnD5e support removed</li>" +
          "<li>Fudge feature only - Karma feature removed</li>" +
          "<li>Code cleanup and simplification</li>" +
          "</ul>"
      }
      let finalMessage = ""
      let startVersion = game.user.getFlag('foundry-die-hard', 'versionNotification')
      dieHardLog(false, functionLogName + ' - startVersion', startVersion, isNaN(startVersion));
      if (!isNaN(startVersion) || startVersion < 8) {
        startVersion = 8
      }
      for (let version = startVersion; version <= notificationVersion; version++) {
        finalMessage += versionMessage[version]
      }

      // GM has never seen current version message
      DieHard.dmToGm(commonHeader + finalMessage + commonFooter);

      // Update the saved version
      game.user.setFlag('foundry-die-hard', 'versionNotification', notificationVersion)
    }
  }
}
