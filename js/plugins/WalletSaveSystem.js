//=============================================================================
// RPG Maker MZ - Wallet Save System Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Saves and loads game data based on connected wallet address.
 * @author Assistant
 *
 * @help WalletSaveSystem.js
 *
 * This plugin saves and loads game data based on the connected wallet address.
 * When a wallet connects, it loads the saved data for that address.
 * When the player makes progress, it saves the data to that wallet address.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global variables for wallet save system
    let currentWalletAddress = null;
    let walletData = {};

    // Save game data to localStorage with wallet address as key
    function saveWalletData(walletAddress, gameData) {
        try {
            const saveKey = `wallet_save_${walletAddress.toLowerCase()}`;
            localStorage.setItem(saveKey, JSON.stringify(gameData));
            console.log(`Game data saved for wallet: ${walletAddress}`);
        } catch (error) {
            console.error('Error saving wallet data:', error);
        }
    }

    // Load game data from localStorage using wallet address
    function loadWalletData(walletAddress) {
        try {
            const saveKey = `wallet_save_${walletAddress.toLowerCase()}`;
            const savedData = localStorage.getItem(saveKey);
            if (savedData) {
                const gameData = JSON.parse(savedData);
                console.log(`Game data loaded for wallet: ${walletAddress}`);
                return gameData;
            }
        } catch (error) {
            console.error('Error loading wallet data:', error);
        }
        return null;
    }

    // Get current game state
    function getCurrentGameState() {
        const items = {};
        $gameParty.items().forEach(item => {
            if (item && item.id) {
                items[item.id] = $gameParty.numItems(item);
            }
        });

        // Get vehicle state
        const vehicleState = {
            vehicleType: $gamePlayer._vehicleType,
            vehicleDriving: $gamePlayer.isInVehicle() ? $gamePlayer.vehicle()._driving : false,
            vehiclePosition: $gamePlayer.isInVehicle() ? {
                x: $gamePlayer.vehicle().x,
                y: $gamePlayer.vehicle().y,
                mapId: $gamePlayer.vehicle()._mapId
            } : null
        };

        return {
            playerPosition: {
                x: $gamePlayer.x,
                y: $gamePlayer.y,
                direction: $gamePlayer.direction(),
                mapId: $gamePlayer._mapId || $gameMap._mapId
            },
            vehicleState: vehicleState,
            partyItems: items,
            gameVariables: $gameVariables._data,
            gameSwitches: $gameSwitches._data,
            timestamp: Date.now()
        };
    }

    // Apply saved game state
    function applyGameState(gameData) {
        if (!gameData) return;

        try {
            // Check if we need to change maps
            if (gameData.playerPosition && gameData.playerPosition.mapId) {
                const savedMapId = gameData.playerPosition.mapId;
                const currentMapId = $gameMap._mapId;
                
                if (savedMapId !== currentMapId) {
                    console.log(`Changing map from ${currentMapId} to ${savedMapId}`);
                    
                    // Use Scene_Map to change maps properly
                    if (SceneManager._scene instanceof Scene_Map) {
                        SceneManager.push(Scene_Map);
                        $gamePlayer.reserveTransfer(savedMapId, gameData.playerPosition.x, gameData.playerPosition.y, gameData.playerPosition.direction);
                        SceneManager.pop();
                    } else {
                        // If not in map scene, just transfer directly
                        $gamePlayer.reserveTransfer(savedMapId, gameData.playerPosition.x, gameData.playerPosition.y, gameData.playerPosition.direction);
                    }
                    
                    // Wait for map transfer to complete before applying other state
                    setTimeout(() => {
                        applyRemainingGameState(gameData);
                    }, 1000);
                    return;
                }
            }
            
            // If we're on the correct map, apply state normally
            applyRemainingGameState(gameData);
            
        } catch (error) {
            console.error('Error applying game state:', error);
        }
    }
    
    // Apply remaining game state (everything except map transfer)
    function applyRemainingGameState(gameData) {
        try {
            // Restore player position
            if (gameData.playerPosition) {
                $gamePlayer.setPosition(gameData.playerPosition.x, gameData.playerPosition.y);
                $gamePlayer.setDirection(gameData.playerPosition.direction);
            }

            // Restore vehicle state
            if (gameData.vehicleState) {
                const vehicleState = gameData.vehicleState;
                
                // Set vehicle type
                if (vehicleState.vehicleType && vehicleState.vehicleType !== "walk") {
                    $gamePlayer._vehicleType = vehicleState.vehicleType;
                    
                    // Get the vehicle
                    const vehicle = $gamePlayer.vehicle();
                    if (vehicle && vehicleState.vehiclePosition) {
                        // Set vehicle position
                        vehicle.setLocation(vehicleState.vehiclePosition.mapId, vehicleState.vehiclePosition.x, vehicleState.vehiclePosition.y);
                        
                        // Set driving state
                        if (vehicleState.vehicleDriving) {
                            vehicle._driving = true;
                            vehicle.setWalkAnime(true);
                            vehicle.setStepAnime(true);
                            
                            // Make player transparent when inside vehicle
                            $gamePlayer.setTransparent(true);
                            
                            // Set player to same position as vehicle
                            $gamePlayer.setPosition(vehicle.x, vehicle.y);
                            
                            // Ensure player is not in getting on/off state
                            $gamePlayer._vehicleGettingOn = false;
                            $gamePlayer._vehicleGettingOff = false;
                        } else {
                            vehicle._driving = false;
                            vehicle.setWalkAnime(false);
                            vehicle.setStepAnime(false);
                            $gamePlayer.setTransparent(false);
                        }
                        
                        // Refresh vehicle
                        vehicle.refresh();
                    }
                } else {
                    // Player was walking, ensure vehicle state is reset
                    $gamePlayer._vehicleType = "walk";
                    $gamePlayer.setTransparent(false);
                    $gamePlayer._vehicleGettingOn = false;
                    $gamePlayer._vehicleGettingOff = false;
                }
            }

            // Restore party items
            if (gameData.partyItems) {
                // Clear current items first
                $gameParty.items().forEach(item => {
                    if (item && item.id) {
                        $gameParty.loseItem(item, $gameParty.numItems(item), false);
                    }
                });
                
                // Add saved items
                Object.keys(gameData.partyItems).forEach(itemId => {
                    const item = $dataItems[parseInt(itemId)];
                    if (item && gameData.partyItems[itemId] > 0) {
                        $gameParty.gainItem(item, gameData.partyItems[itemId], false);
                    }
                });
            }

            // Restore game variables
            if (gameData.gameVariables) {
                gameData.gameVariables.forEach((value, index) => {
                    if (value !== undefined) {
                        $gameVariables.setValue(index, value);
                    }
                });
            }

            // Restore game switches
            if (gameData.gameSwitches) {
                gameData.gameSwitches.forEach((value, index) => {
                    if (value !== undefined) {
                        $gameSwitches.setValue(index, value);
                    }
                });
            }

            console.log('Game state restored successfully');
            
            // Reset fishing system after loading wallet data
            setTimeout(() => {
                if (window.resetFishingSystem) {
                    console.log('resetting fishing system after loading wallet data');
                    window.resetFishingSystem();
                }
            }, 200);
            
        } catch (error) {
            console.error('Error applying remaining game state:', error);
        }
    }

    // Auto-save function
    function autoSave() {
        if (currentWalletAddress) {
            const gameData = getCurrentGameState();
            saveWalletData(currentWalletAddress, gameData);
        }
    }

    // Set current wallet address when wallet connects
    function setCurrentWalletAddress(address) {
        currentWalletAddress = address;
        console.log(`Current wallet address set to: ${address}`);
    }

    // Expose setCurrentWalletAddress globally
    window.setCurrentWalletAddress = setCurrentWalletAddress;

    // Override Scene_Map to add auto-save functionality
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        
        // Auto-save every 30 seconds
        this._autoSaveTimer = 0;
        
        // Reset fishing system on map start to ensure clean state
        setTimeout(() => {
            if (window.resetFishingSystem) {
                console.log('resetting fishing system on map start in wallet save system');
                window.resetFishingSystem();
            }
        }, 300);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        
        // Auto-save every 30 seconds (1800 frames at 60fps)
        if (this._autoSaveTimer) {
            this._autoSaveTimer++;
            if (this._autoSaveTimer >= 1800) {
                autoSave();
                this._autoSaveTimer = 0;
            }
        } else {
            this._autoSaveTimer = 1;
        }
    };

    // Override Game_Interpreter to save when items are gained
    const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126 = function(params) {
        const result = _Game_Interpreter_command126.call(this, params);
        
        // Auto-save when items are gained
        setTimeout(() => {
            autoSave();
        }, 100);
        
        return result;
    };

    // Override Game_Player to save when moving
    const _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        const result = _Game_Player_moveByInput.call(this);
        
        // Auto-save when player moves (but not too frequently)
        if (!this._lastSaveTime || Date.now() - this._lastSaveTime > 5000) {
            setTimeout(() => {
                autoSave();
            }, 100);
            this._lastSaveTime = Date.now();
        }
        
        return result;
    };

    // Add manual save function
    window.saveWalletGame = function() {
        if (currentWalletAddress) {
            autoSave();
            console.log('Manual save completed');
        } else {
            console.log('No wallet connected for saving');
        }
    };

    // Add manual load function
    window.loadWalletGame = function() {
        if (currentWalletAddress) {
            const savedData = loadWalletData(currentWalletAddress);
            if (savedData) {
                applyGameState(savedData);
                console.log('Manual load completed');
            } else {
                console.log('No saved data found');
            }
        } else {
            console.log('No wallet connected for loading');
        }
    };

    // Expose functions globally for debugging
    window.walletSaveSystem = {
        saveWalletData,
        loadWalletData,
        getCurrentGameState,
        applyGameState,
        autoSave,
        currentWalletAddress: () => currentWalletAddress
    };

})(); 