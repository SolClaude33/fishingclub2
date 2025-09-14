//=============================================================================
// RPG Maker MZ - Disable Click Movement Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Disables click-to-move functionality, keeping only keyboard movement.
 * @author Assistant
 *
 * @help DisableClickMovement.js
 *
 * This plugin disables the click-to-move functionality in RPG Maker MZ,
 * so players can only move using keyboard arrow keys.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Override the onMapTouch function to disable click movement
    const _Scene_Map_onMapTouch = Scene_Map.prototype.onMapTouch;
    Scene_Map.prototype.onMapTouch = function() {
        // Do nothing - this disables click-to-move
        // The original function would set a destination for the player to move to
        // By overriding it with an empty function, clicks are ignored
    };

    // Also override processMapTouch to prevent any touch processing
    const _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        // Do nothing - this prevents any touch/click processing for movement
    };

    console.log('✅ Click movement disabled - only keyboard movement allowed');
})();
