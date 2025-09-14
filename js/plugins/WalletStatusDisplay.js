//=============================================================================
// RPG Maker MZ - Wallet Status Display Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Displays connected wallet information in the status/profile menu.
 * @author Assistant
 *
 * @help WalletStatusDisplay.js
 *
 * This plugin adds wallet information display to the status/profile menu.
 * It shows the connected wallet address below the character information.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Get connected wallet function (use global function if available)
    function getPlayerWallet() {
        // Use global function if available
        if (window.getPlayerWallet) {
            const wallet = window.getPlayerWallet();
            if (wallet && typeof wallet === 'string' && wallet.length >= 10) {
                return wallet;
            }
        }
        
        // Check MetaMask directly
        if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
            const currentAddress = window.ethereum.selectedAddress;
            if (currentAddress && typeof currentAddress === 'string' && currentAddress.length >= 10) {
                return currentAddress;
            }
        }
        
        // Fallback implementation
        const gameWallet = $gameVariables.value(1);
        if (gameWallet && typeof gameWallet === 'string' && gameWallet.length >= 10) {
            return gameWallet;
        }
        
        const storedWallet = localStorage.getItem('fishingGameWallet');
        if (storedWallet && typeof storedWallet === 'string' && storedWallet.length >= 10) {
            return storedWallet;
        }
        
        return null;
    }

    // Get player name function (from existing wallet system)
    function getPlayerName() {
        // Check if name was stored in game variables
        const gameName = $gameVariables.value(2);
        if (gameName) {
            return gameName;
        }
        
        // Check localStorage as backup
        const storedName = localStorage.getItem('fishingGamePlayerName');
        if (storedName) {
            return storedName;
        }
        
        // No name available
        return 'unknown player';
    }

    // Override the drawBasicInfo function to add wallet information
    const _Window_Status_drawBasicInfo = Window_Status.prototype.drawBasicInfo;
    Window_Status.prototype.drawBasicInfo = function(x, y) {
        // Call the original function
        _Window_Status_drawBasicInfo.call(this, x, y);
        
        // Add wallet information
        const lineHeight = this.lineHeight();
        const walletAddress = getPlayerWallet();
        
        if (walletAddress && typeof walletAddress === 'string' && walletAddress.length >= 10) {
            // Display wallet information
            this.changeTextColor(ColorManager.systemColor());
            this.drawText('Wallet:', x, y + lineHeight * 3, 168);
            this.resetTextColor();
            
            // Display shortened wallet address
            const shortWallet = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
            this.drawText(shortWallet, x, y + lineHeight * 4, 168);
        } else {
            // Display "No wallet connected" message
            this.changeTextColor(ColorManager.systemColor());
            this.drawText('Wallet:', x, y + lineHeight * 3, 168);
            this.resetTextColor();
            this.changeTextColor(ColorManager.normalColor());
            this.drawText('Not connected', x, y + lineHeight * 4, 168);
        }
    };

    // Override the actor name to show "Me" instead of "Boy"
    const _Game_Actor_name = Game_Actor.prototype.name;
    Game_Actor.prototype.name = function() {
        return 'Me';
    };

    // Override only the class to show wallet information (keep original name)
    const _Game_Actor_currentClass = Game_Actor.prototype.currentClass;
    Game_Actor.prototype.currentClass = function() {
        const originalClass = _Game_Actor_currentClass.call(this);
        const walletAddress = getPlayerWallet();
        
        if (walletAddress && typeof walletAddress === 'string' && walletAddress.length >= 10) {
            // Create a modified class object
            const modifiedClass = Object.create(originalClass);
            modifiedClass.name = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
            return modifiedClass;
        } else {
            // Create a modified class object for no wallet
            const modifiedClass = Object.create(originalClass);
            modifiedClass.name = 'No wallet';
            return modifiedClass;
        }
    };

    // Override only the drawActorClass function to use custom colors
    const _Window_StatusBase_drawActorClass = Window_StatusBase.prototype.drawActorClass;
    Window_StatusBase.prototype.drawActorClass = function(actor, x, y, width) {
        const walletAddress = getPlayerWallet();
        if (walletAddress && typeof walletAddress === 'string') {
            this.changeTextColor('#2196F3'); // Blue for wallet address
        } else {
            this.changeTextColor('#FF5722'); // Red for no wallet
        }
        _Window_StatusBase_drawActorClass.call(this, actor, x, y, width);
        this.resetTextColor();
    };

    // Update display when wallet connects
    const originalConnectWallet = window.connectWallet;
    if (originalConnectWallet) {
        window.connectWallet = async function() {
            const result = await originalConnectWallet();
            if (result) {
                // Refresh any open status windows
                if (SceneManager._scene instanceof Scene_Menu) {
                    SceneManager._scene.refresh();
                }
            }
            return result;
        };
    }

    // Listen for wallet connection events
    window.addEventListener('walletConnected', function(event) {
        // Refresh any open status windows when wallet connects
        if (SceneManager._scene instanceof Scene_Menu) {
            SceneManager._scene.refresh();
        }
    });

})();
