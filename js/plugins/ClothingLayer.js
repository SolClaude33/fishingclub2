//=============================================================================
// RPG Maker MZ - Clothing Layer Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adds clothing layer support to character sprites
 * @author Assistant
 *
 * @help ClothingLayer.js
 *
 * This plugin adds support for clothing layers that can be applied over
 * character sprites. It modifies the Sprite_Character class to support
 * additional clothing sprites.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Store original methods
    const _Sprite_Character_initialize = Sprite_Character.prototype.initialize;
    const _Sprite_Character_updateFrame = Sprite_Character.prototype.updateFrame;
    const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;

    // Global clothing state storage - integrate with existing system
    window.playerClothingState = window.playerClothingState || null;
    
    // Function to get clothing from localStorage (existing system)
    function getClothingFromStorage() {
        return localStorage.getItem('penguinFishingClub_currentClothing');
    }
    
    // Function to save clothing to localStorage (existing system)
    function saveClothingToStorage(clothingName) {
        if (clothingName && clothingName !== 'none') {
            localStorage.setItem('penguinFishingClub_currentClothing', clothingName);
        } else {
            localStorage.removeItem('penguinFishingClub_currentClothing');
        }
    }

    // Override Sprite_Character initialization
    Sprite_Character.prototype.initialize = function(character) {
        _Sprite_Character_initialize.call(this, character);
        this._clothingSprite = null;
        this._clothingName = null;
        
        // Load clothing state from localStorage if this is the player
        if (character === $gamePlayer) {
            const savedClothing = getClothingFromStorage();
            if (savedClothing && savedClothing !== 'none') {
                window.playerClothingState = savedClothing;
                // Use the existing applyClothingLayer function if available
                if (typeof window.applyClothingLayer === 'function') {
                    setTimeout(() => {
                        window.applyClothingLayer(this, savedClothing);
                    }, 100);
                } else {
                    this.setClothing(savedClothing);
                }
            }
        }
    };

    // Override updateFrame to handle clothing
    Sprite_Character.prototype.updateFrame = function() {
        _Sprite_Character_updateFrame.call(this);
        this.updateClothingFrame();
    };

    // Override updateBitmap to preserve clothing
    const _Sprite_Character_updateBitmap = Sprite_Character.prototype.updateBitmap;
    Sprite_Character.prototype.updateBitmap = function() {
        // Store clothing state before bitmap update
        const currentClothing = this._clothingName;
        
        // Call original updateBitmap
        _Sprite_Character_updateBitmap.call(this);
        
        // Restore clothing if it was lost during bitmap update
        if (currentClothing && !this._clothingName && this._character === $gamePlayer) {
            setTimeout(() => {
                this.setClothing(currentClothing);
                console.log('Restored clothing after bitmap update:', currentClothing);
            }, 1);
        }
    };

    // Override updatePosition to sync clothing position
    Sprite_Character.prototype.updatePosition = function() {
        _Sprite_Character_updatePosition.call(this);
        this.updateClothingPosition();
    };

    // Add clothing support methods
    Sprite_Character.prototype.setClothing = function(clothingName) {
        if (this._clothingName === clothingName) return;
        
        this._clothingName = clothingName;
        this.removeClothing();
        
        // Save clothing state globally and to localStorage if this is the player
        if (this._character === $gamePlayer) {
            window.playerClothingState = clothingName;
            saveClothingToStorage(clothingName);
        }
        
        if (clothingName && clothingName !== 'none') {
            this.createClothingSprite(clothingName);
        }
    };

    Sprite_Character.prototype.createClothingSprite = function(clothingName) {
        try {
            this._clothingSprite = new Sprite();
            this._clothingSprite.bitmap = ImageManager.loadCharacter(clothingName);
            this._clothingSprite.anchor.x = 0.5;
            this._clothingSprite.anchor.y = 1;
            this._clothingSprite.z = this.z + 1;
            
            // Add to parent
            if (this.parent) {
                this.parent.addChild(this._clothingSprite);
            }
            
            console.log('Created clothing sprite for:', clothingName);
        } catch (error) {
            console.log('Error creating clothing sprite:', error);
        }
    };

    Sprite_Character.prototype.removeClothing = function() {
        if (this._clothingSprite) {
            if (this._clothingSprite.parent) {
                this._clothingSprite.parent.removeChild(this._clothingSprite);
            }
            this._clothingSprite = null;
        }
    };

    Sprite_Character.prototype.updateClothingFrame = function() {
        if (!this._clothingSprite || !this._clothingSprite.bitmap) return;
        
        try {
            // Copy frame from main sprite
            if (this._frame) {
                this._clothingSprite.setFrame(
                    this._frame.x,
                    this._frame.y,
                    this._frame.width,
                    this._frame.height
                );
            }
        } catch (error) {
            console.log('Error updating clothing frame:', error);
        }
    };

    Sprite_Character.prototype.updateClothingPosition = function() {
        if (!this._clothingSprite) return;
        
        try {
            // Sync position with main sprite
            this._clothingSprite.x = this.x;
            this._clothingSprite.y = this.y;
            this._clothingSprite.scale.x = this.scale.x;
            this._clothingSprite.scale.y = this.scale.y;
            this._clothingSprite.visible = this.visible;
        } catch (error) {
            console.log('Error updating clothing position:', error);
        }
    };

    // Add global function to apply clothing
    window.applyClothingToPlayer = function(clothingName) {
        try {
            if (typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
                const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite) {
                    playerSprite.setClothing(clothingName);
                    console.log('Applied clothing to player:', clothingName);
                }
            }
        } catch (error) {
            console.log('Error applying clothing to player:', error);
        }
    };

    // Add function to save clothing state to localStorage for persistence
    window.saveClothingState = function(clothingName) {
        saveClothingToStorage(clothingName);
        console.log('Saved clothing state to localStorage:', clothingName);
    };

    // Add function to load clothing state from localStorage
    window.loadClothingState = function() {
        const savedClothing = getClothingFromStorage();
        if (savedClothing && savedClothing !== 'none') {
            window.playerClothingState = savedClothing;
            console.log('Loaded clothing state from localStorage:', savedClothing);
            return savedClothing;
        }
        return null;
    };

    // Add function to force restore clothing
    window.forceRestoreClothing = function() {
        if (window.playerClothingState && typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
            const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                sprite._character === $gamePlayer
            );
            if (playerSprite) {
                playerSprite.setClothing(window.playerClothingState);
                console.log('Force restored clothing:', window.playerClothingState);
                return true;
            }
        }
        return false;
    };

    // Add debug function to check clothing status
    window.debugClothingStatus = function() {
        console.log('=== Clothing Debug Status ===');
        console.log('Global clothing state:', window.playerClothingState);
        console.log('localStorage clothing:', getClothingFromStorage());
        console.log('Base skin:', localStorage.getItem('penguinFishingClub_baseSkin'));
        
        if (typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
            const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                sprite._character === $gamePlayer
            );
            if (playerSprite) {
                console.log('Player sprite clothing name:', playerSprite._clothingName);
                console.log('Player sprite has clothing sprite:', !!playerSprite._clothingSprite);
                console.log('Player character name:', playerSprite._characterName);
            } else {
                console.log('Player sprite not found');
            }
        } else {
            console.log('Game map or spriteset not available');
        }
        console.log('=============================');
    };

    // Add global function to remove clothing
    window.removeClothingFromPlayer = function() {
        try {
            if (typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
                const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite) {
                    playerSprite.removeClothing();
                    window.playerClothingState = null;
                    window.saveClothingState('none');
                    console.log('Removed clothing from player');
                }
            }
        } catch (error) {
            console.log('Error removing clothing from player:', error);
        }
    };

    // Hook into Scene_Map to restore clothing when map starts
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        
        // Restore clothing after a short delay to ensure sprites are created
        setTimeout(() => {
            const savedClothing = getClothingFromStorage();
            if (savedClothing && savedClothing !== 'none' && typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
                const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite && !playerSprite._clothingName) {
                    // Use the existing applyClothingLayer function if available
                    if (typeof window.applyClothingLayer === 'function') {
                        window.applyClothingLayer(playerSprite, savedClothing);
                    } else {
                        playerSprite.setClothing(savedClothing);
                    }
                    console.log('Restored clothing after map start:', savedClothing);
                }
            }
        }, 100);

        // Start clothing monitoring
        this.startClothingMonitoring();
    };

    // Add clothing monitoring system
    Scene_Map.prototype.startClothingMonitoring = function() {
        if (this._clothingMonitorInterval) {
            clearInterval(this._clothingMonitorInterval);
        }
        
        this._clothingMonitorInterval = setInterval(() => {
            const savedClothing = getClothingFromStorage();
            if (savedClothing && savedClothing !== 'none' && typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
                const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite && !playerSprite._clothingName) {
                    // Use the existing applyClothingLayer function if available
                    if (typeof window.applyClothingLayer === 'function') {
                        window.applyClothingLayer(playerSprite, savedClothing);
                    } else {
                        playerSprite.setClothing(savedClothing);
                    }
                    console.log('Auto-restored clothing via monitoring:', savedClothing);
                }
            }
        }, 1000); // Check every second
    };

    // Stop clothing monitoring when scene ends
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        if (this._clothingMonitorInterval) {
            clearInterval(this._clothingMonitorInterval);
            this._clothingMonitorInterval = null;
        }
        _Scene_Map_terminate.call(this);
    };

    // Hook into Spriteset_Map to restore clothing when sprites are created
    const _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        _Spriteset_Map_createCharacters.call(this);
        
        // Restore clothing after sprites are created
        setTimeout(() => {
            const savedClothing = getClothingFromStorage();
            if (savedClothing && savedClothing !== 'none' && this._characterSprites) {
                const playerSprite = this._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite && !playerSprite._clothingName) {
                    // Use the existing applyClothingLayer function if available
                    if (typeof window.applyClothingLayer === 'function') {
                        window.applyClothingLayer(playerSprite, savedClothing);
                    } else {
                        playerSprite.setClothing(savedClothing);
                    }
                    console.log('Restored clothing after sprite creation:', savedClothing);
                }
            }
        }, 50);
    };

    // Hook into Game_Player refresh to preserve clothing
    const _Game_Player_refresh = Game_Player.prototype.refresh;
    Game_Player.prototype.refresh = function() {
        // Store current clothing state before refresh
        const currentClothing = window.playerClothingState;
        
        // Call original refresh
        _Game_Player_refresh.call(this);
        
        // Restore clothing after refresh
        if (currentClothing && typeof $gameMap !== 'undefined' && $gameMap._spriteset) {
            setTimeout(() => {
                const playerSprite = $gameMap._spriteset._characterSprites.find(sprite => 
                    sprite._character === $gamePlayer
                );
                if (playerSprite && !playerSprite._clothingName) {
                    playerSprite.setClothing(currentClothing);
                    console.log('Restored clothing after player refresh:', currentClothing);
                }
            }, 10);
        }
    };

})();