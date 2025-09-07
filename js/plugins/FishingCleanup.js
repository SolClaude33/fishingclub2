/*:
 * @target MZ
 * @plugindesc Fishing System Cleanup Plugin
 * @author Assistant
 * @desc Handles cleanup of fishing sprites and state across all plugins
 * @version 1.0.0
 */

// Global fishing cleanup functions
window.cleanupFishingRodSprites = function() {
    console.log('cleaning up fishing rod sprites from map events...');
    
    // reset switches that control fishing rod sprites
    if ($gameSwitches) {
        const fishingRodSwitches = [3, 4, 5, 6, 7, 8];
        fishingRodSwitches.forEach(switchId => {
            if ($gameSwitches.value(switchId)) {
                console.log(`resetting fishing rod switch ${switchId}`);
                $gameSwitches.setValue(switchId, false);
            }
        });
    }
    
    // reset self switches for fishing events (events 18-26)
    if ($gameSelfSwitches && $gameMap) {
        const mapId = $gameMap.mapId();
        for (let eventId = 18; eventId <= 26; eventId++) {
            ['A', 'B', 'C', 'D'].forEach(switchId => {
                if ($gameSelfSwitches.value([mapId, eventId, switchId])) {
                    console.log(`resetting fishing event ${eventId} self switch ${switchId}`);
                    $gameSelfSwitches.setValue([mapId, eventId, switchId], false);
                }
            });
        }
    }
    
    // refresh the map
    if ($gameMap) {
        $gameMap.refresh();
    }
    
    console.log('fishing rod sprites cleanup complete');
};

window.forceCleanFishingSwitches = function() {
    console.log('forcing cleanup of all fishing switches...');
    if ($gameSwitches) {
        // reset all fishing-related switches
        for (let i = 1; i <= 20; i++) {
            if ($gameSwitches.value(i)) {
                console.log(`forcing reset of switch ${i}`);
                $gameSwitches.setValue(i, false);
            }
        }
        
        // specifically reset fishing rod switches
        const fishingRodSwitches = [3, 4, 5, 6, 7, 8];
        fishingRodSwitches.forEach(switchId => {
            console.log(`forcing reset of fishing rod switch ${switchId}`);
            $gameSwitches.setValue(switchId, false);
        });
    }
    
    // refresh the map
    if ($gameMap) {
        $gameMap.refresh();
    }
    
    console.log('force cleanup complete');
};

window.cleanupFishingSprites = function() {
    console.log('manually cleaning up fishing sprites...');
    
    // clean up fishing rod sprites
    if (window.cleanupFishingRodSprites) {
        window.cleanupFishingRodSprites();
    }
    
    // clean up any lingering sprites in the scene
    if (SceneManager._scene && SceneManager._scene.children) {
        for (let i = SceneManager._scene.children.length - 1; i >= 0; i--) {
            const child = SceneManager._scene.children[i];
            if (child && (child._barBG || child._fish || child._chest)) {
                // this looks like a fishing sprite, remove it
                SceneManager._scene.removeChild(child);
                if (child.destroy) {
                    child.destroy();
                }
            }
        }
    }
    
    // reset fishing state variable
    if ($gameVariables) {
        $gameVariables.setValue(999, 0); // fishing state variable
    }
    
    console.log('manual cleanup complete');
};

// Hook into DataManager to detect autosave scenarios
var FishingCleanup_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    // mark that we just loaded from a save
    window.justReloadedFromAutosave = true;
    
    const result = FishingCleanup_DataManager_extractSaveContents.call(this, contents);
    
    // reset fishing state after loading save data
    setTimeout(() => {
        if (window.cleanupFishingRodSprites) {
            console.log('resetting fishing sprites after loading save data');
            window.cleanupFishingRodSprites();
        }
    }, 200);
    
    return result;
};

// Hook into Scene_Map to ensure fishing sprites are cleaned up when returning to map
var FishingCleanup_Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    // clean up any lingering fishing state when starting map scene
    setTimeout(() => {
        if (window.cleanupFishingRodSprites) {
            console.log('resetting fishing sprites on map start');
            window.cleanupFishingRodSprites();
        }
    }, 300);
    
    return FishingCleanup_Scene_Map_start.call(this);
};

// Hook into Scene_Map update to periodically check for fishing sprites
var FishingCleanup_Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    // run periodic cleanup check every 60 frames (about once per second)
    if (Graphics.frameCount % 60 === 0) {
        // check for stuck fishing rod sprites
        if ($gameSwitches) {
            const fishingRodSwitches = [3, 4, 5, 6, 7, 8];
            const hasFishingRodSprite = fishingRodSwitches.some(switchId => $gameSwitches.value(switchId));
            
            // if we have fishing rod sprites but we're not in a fishing scene, clean them up
            if (hasFishingRodSprite && !(SceneManager._scene && SceneManager._scene.constructor.name === 'Scene_Fishing')) {
                console.log('detected fishing rod sprites blocking spots, cleaning up...');
                window.cleanupFishingRodSprites();
            }
        }
    }
    
    return FishingCleanup_Scene_Map_update.call(this);
};

console.log('Fishing Cleanup Plugin loaded successfully');
