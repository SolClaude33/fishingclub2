//=============================================================================
// RPG Maker MZ - Auto Start Game Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Automatically starts the game without showing title screen options.
 * @author Assistant
 *
 * @help AutoStartGame.js
 *
 * This plugin removes the title screen options (New Game, Continue, Options)
 * and automatically starts the game when the title screen loads.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Override Scene_Boot to go directly to the game map instead of title screen
    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        
        // Skip title screen and go directly to the game map
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    };

    // Override the CoreEngine's Window_TitleCommand makeCommandList
    if (typeof VisuMZ !== 'undefined' && VisuMZ.CoreEngine) {
        const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
        Window_TitleCommand.prototype.makeCommandList = function() {
            // Don't add any commands - this removes all title screen options
            // The CoreEngine would normally add commands from TitleCommandList
        };
    } else {
        // Fallback for when CoreEngine is not loaded
        const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
        Window_TitleCommand.prototype.makeCommandList = function() {
            // Don't add any commands - this removes all title screen options
            // The original function would add: newGame, continue, options
        };
    }

    // Override Scene_Title to automatically start the game immediately
    const _Scene_Title_start = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.call(this);
        
        // Start the game immediately without delay
        this.commandNewGame();
    };

    // Override the command handlers to prevent any issues
    Scene_Title.prototype.commandContinue = function() {
        // Do nothing - this prevents continue from working
    };

    Scene_Title.prototype.commandOptions = function() {
        // Do nothing - this prevents options from working
    };
})(); 