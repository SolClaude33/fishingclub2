//=============================================================================
// RPG Maker MZ - Bigcoin Rarity Adjuster Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adjusts the catch rate of bigcoin to make it much rarer.
 * @author Assistant
 *
 * @help BigcoinRarityAdjuster.js
 *
 * This plugin modifies the fishing minigame to make bigcoin much rarer.
 * It reduces the probability of bigcoin appearing in chests and adds
 * additional rarity checks.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Wait for ESL to be available
    const waitForESL = () => {
        if (typeof ESL !== 'undefined' && ESL.Array && ESL.Array.randomElement) {
            // Store original loot table function
            const _ESL_Array_randomElement = ESL.Array.randomElement;

            // Override the random element selection for loot tables
            ESL.Array.randomElement = function(array) {
                // If this is a loot table with bigcoin (item 6), apply rarity adjustment
                if (array && array.includes(6)) {
                    // Calculate bigcoin rarity - make it much rarer
                    const bigcoinRarity = 0.02; // 2% chance instead of equal probability
                    
                    // If random check passes for bigcoin, return it
                    if (Math.random() < bigcoinRarity) {
                        return 6; // Return bigcoin
                    } else {
                        // Remove bigcoin from the array temporarily and select from other items
                        const filteredArray = array.filter(item => item !== 6);
                        if (filteredArray.length > 0) {
                            return _ESL_Array_randomElement(filteredArray);
                        }
                    }
                }
                
                // For all other cases, use original function
                return _ESL_Array_randomElement(array);
            };

            console.log("BigcoinRarityAdjuster: ESL.Array.randomElement overridden successfully");
        } else {
            // Try again in a few frames
            setTimeout(waitForESL, 100);
        }
    };

    // Wait for Scene_Fishing to be available
    const waitForSceneFishing = () => {
        if (typeof Scene_Fishing !== 'undefined') {
            // Additional rarity check for chest spawning
            const _Scene_Fishing_updateChest = Scene_Fishing.prototype.updateChest;
            Scene_Fishing.prototype.updateChest = function() {
                // Call original function
                _Scene_Fishing_updateChest.call(this);
                
                // If a chest is about to spawn and it might contain bigcoin, add extra rarity check
                if (this._chest && !this._chest.spawned && this._hasChest) {
                    // Check if current loot table contains bigcoin
                    const currentLootTable = FishingParams.lootRef[this._lootTableId];
                    if (currentLootTable && currentLootTable.items && currentLootTable.items.includes(6)) {
                        // Add extra 50% chance to prevent chest spawning if it might contain bigcoin
                        if (Math.random() < 0.5) {
                            this._hasChest = false;
                        }
                    }
                }
            };

            // Override chest spawn rate to make bigcoin chests even rarer
            const _Scene_Fishing_start = Scene_Fishing.prototype.start;
            Scene_Fishing.prototype.start = function() {
                // Call original function
                _Scene_Fishing_start.call(this);
                
                // Check if current loot table contains bigcoin
                const currentLootTable = FishingParams.lootRef[this._lootTableId];
                if (currentLootTable && currentLootTable.items && currentLootTable.items.includes(6)) {
                    // Reduce chest spawn rate by 75% if bigcoin is in the loot table
                    this._chest.spawnRate = Math.floor(this._chest.spawnRate * 0.25);
                    console.log("Bigcoin detected in loot table - reduced chest spawn rate to:", this._chest.spawnRate);
                }
            };

            console.log("BigcoinRarityAdjuster: Scene_Fishing overrides applied successfully");
        } else {
            // Try again in a few frames
            setTimeout(waitForSceneFishing, 100);
        }
    };

    // Start waiting for dependencies
    waitForESL();
    waitForSceneFishing();

})();
