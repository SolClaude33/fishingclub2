/*:
 * @target MZ
 * @plugindesc Simple Fishing Minigame System
 * @author AI Assistant
 * 
 * @param minigameEnabled
 * @text Enable Fishing Minigame
 * @type boolean
 * @default true
 * @desc Enable the interactive fishing minigame
 * 
 * @help
 * Simple Fishing Minigame System
 * 
 * This plugin replaces the random fishing system with a simple
 * timing-based minigame where players must click when the fish
 * is in the target zone.
 * 
 * Usage:
 * - When fishing, a minigame window appears
 * - Click when the fish is in the yellow zone
 * - Better timing = better rewards
 */

(() => {
    'use strict';
    
    const pluginName = "FishingMinigame";
    console.log('[FishingMinigame] Plugin initializing...');
    const parameters = PluginManager.parameters(pluginName);
    
    // Parse parameters
    const MINIGAME_ENABLED = parameters['minigameEnabled'] !== 'false';
    
    // Game variables
    let minigameActive = false;
    let fishPosition = 50;
    let fishDirection = 1;
    let fishSpeed = 2;
    let targetZone = { start: 30, end: 70 }; // in percent of bar width
    let gameTimer = 0;
    let timeLimit = 8;
    let playerScore = 0;
    let gameResult = null;
    let inputLockFrames = 0; // prevents the starting click from auto-winning
    let internalMinigameGrant = false; // allow minigame to grant items while blocking others
    let fishingBlockActive = false; // block old event rewards once fishing starts
    
    //=============================================================================
    // * Start minigame when switch 2 (TimeToFish) is turned ON
    //=============================================================================
    const FISH_SWITCH_ID = 2; // System.json: "TimeToFish"
    let autoStartConsumed = false;
    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(switchId, value) {
        _Game_Switches_setValue.apply(this, arguments);
        if (MINIGAME_ENABLED && switchId === FISH_SWITCH_ID && value && !minigameActive) {
            // Immediately block old path to avoid race conditions
            fishingBlockActive = true;
            autoStartConsumed = true;
            // Defer to ensure interpreter is available
            setTimeout(() => {
                const scene = SceneManager._scene;
                if (scene && scene._interpreter && !minigameActive) {
                    // Mark this interpreter as hijacked to stop further commands
                    scene._interpreter._fishingHijacked = true;
                    console.log('[FishingMinigame] Switch 2 ON detected -> starting minigame');
                    scene._interpreter.startFishingMinigame();
                }
            }, 0);
        }
    };

    // Safety: auto-start minigame on map update when switch 2 is ON
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (MINIGAME_ENABLED && $gameSwitches && $gameSwitches.value(FISH_SWITCH_ID) && !minigameActive && !autoStartConsumed) {
            const scene = SceneManager._scene;
            if (scene && scene._interpreter) {
                fishingBlockActive = true;
                autoStartConsumed = true;
                console.log('[FishingMinigame] Scene_Map.update detected switch 2 -> starting minigame');
                scene._interpreter.startFishingMinigame();
            }
        }
    };

    //=============================================================================
    // * Override Game_Interpreter to intercept fishing events
    //=============================================================================
    
    // Intercept Label command: events begin with label "FISHING SYSTEM"
    const _Game_Interpreter_command118 = Game_Interpreter.prototype.command118;
    Game_Interpreter.prototype.command118 = function() {
        const params = this && this._params;
        const labelName = Array.isArray(params) ? params[0] : undefined;
        if (MINIGAME_ENABLED && typeof labelName === 'string' && labelName.toUpperCase() === 'FISHING SYSTEM') {
            console.log('[FishingMinigame] Intercepted label: FISHING SYSTEM');
            fishingBlockActive = true;
            this._fishingHijacked = true;
            console.log('[FishingMinigame] Starting from label intercept');
            this.startFishingMinigame();
            return true;
        }
        return _Game_Interpreter_command118.apply(this, arguments);
    };

	const _Game_Interpreter_command111 = Game_Interpreter.prototype.command111;
	Game_Interpreter.prototype.command111 = function() {
		// Guard against missing params
		const params = this && this._params;
		if (!Array.isArray(params)) {
			return _Game_Interpreter_command111.apply(this, arguments);
		}

		const branchType = params[0];
		// If this is an Item check (branch type 8) and minigame is enabled
		if (MINIGAME_ENABLED && branchType === 8) {
			const itemId = params[4];
			if (typeof itemId === 'number' && itemId === 1) {
				// Ensure player has Fishing Rod (item 1)
				if ($dataItems && $dataItems[1] && !$gameParty.hasItem($dataItems[1])) {
					$gameParty.gainItem($dataItems[1], 1);
				}
				// Force condition true to proceed
				this._branch = this._branch || {};
				this._indent = this._indent || 0;
				this._branch[this._indent] = 0;
				return true;
			}
		}

		return _Game_Interpreter_command111.apply(this, arguments);
	};

	// Intercept the original plugin command used by fishing events
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		if (MINIGAME_ENABLED && command === "FISHING SYSTEM") {
			fishingBlockActive = true;
			this._fishingHijacked = true;
			console.log('[FishingMinigame] Starting from plugin command intercept');
			this.startFishingMinigame();
			return;
		}
		_Game_Interpreter_pluginCommand.call(this, command, args);
	};

    // Stop executing any further event commands once hijacked
    const _Game_Interpreter_executeCommand = Game_Interpreter.prototype.executeCommand;
    Game_Interpreter.prototype.executeCommand = function() {
        if (MINIGAME_ENABLED) {
            // If already hijacked, abort further processing
            if (this._fishingHijacked) {
                this._index = this._list ? this._list.length : 0;
                return false;
            }
            // Proactively detect fishing events by first label before any command runs
            const cmd = this.currentCommand && this.currentCommand();
            if (cmd && cmd.code === 118 && cmd.parameters && typeof cmd.parameters[0] === 'string') {
                const label = String(cmd.parameters[0]).toUpperCase();
                if (label === 'FISHING SYSTEM') {
                    console.log('[FishingMinigame] Detected fishing label via executeCommand -> hijacking');
                    fishingBlockActive = true;
                    this._fishingHijacked = true;
                    this.startFishingMinigame();
                    // Abort processing this command list entirely
                    this._index = this._list ? this._list.length : 0;
                    return false;
                }
            }
        }
        return _Game_Interpreter_executeCommand.call(this);
    };
    
    Game_Interpreter.prototype.startFishingMinigame = function() {
        if (minigameActive) return;
        console.log('[FishingMinigame] startFishingMinigame called');
        this._fishingHijacked = true;
        
        // Stop the current event processing
        this._index = this._list.length;
        
        // Start the minigame in its own scene for reliability
        this.initializeMinigame();
        window._fishingInterpreterRef = this;
        SceneManager.push(Scene_FishingMinigame);
    };
    
    Game_Interpreter.prototype.initializeMinigame = function() {
        minigameActive = true;
        // Randomize difficulty: target zone size, fish speed, time limit, and target zone position
        // Difficulty presets (percent width, speed, time limit seconds)
        const presets = [
            { name: 'Easy',    width: 40, speed: 2.0, time: 10 },
            { name: 'Normal',  width: 28, speed: 3.0, time: 9 },
            { name: 'Hard',    width: 18, speed: 4.0, time: 8 },
            { name: 'Insane',  width: 10, speed: 5.5, time: 7 }
        ];
        const preset = presets[Math.floor(Math.random() * presets.length)];

        // Pick a random center for the zone, clamped so zone stays within [0,100]
        const half = preset.width / 2;
        const center = Math.max(half, Math.min(100 - half, 15 + Math.random() * 70));
        targetZone = { start: center - half, end: center + half };

        // Start fish away from target zone
        if (Math.random() < 0.5) {
            fishPosition = Math.max(0, targetZone.start - 20);
            fishDirection = 1;
        } else {
            fishPosition = Math.min(100, targetZone.end + 20);
            fishDirection = -1;
        }
        fishSpeed = preset.speed;
        gameTimer = 0;
        timeLimit = preset.time;
        playerScore = 0;
        gameResult = null;
        inputLockFrames = 18; // ~300ms at 60fps
        
        // Create minigame window
        this.createMinigameWindow();
        
        // Start game loop
        this.startGameLoop();
    };
    
    Game_Interpreter.prototype.createMinigameWindow = function() {
        // Window is handled by Scene_FishingMinigame
        console.log('[FishingMinigame] Minigame window will be created by Scene');
    };
    
    Game_Interpreter.prototype.startGameLoop = function() {
        // Game loop handled by Scene_FishingMinigame.update
    };
    
    Game_Interpreter.prototype.updateFishPosition = function() {
        // Move fish
        fishPosition += fishDirection * fishSpeed * 0.5;
        
        // Bounce off edges
        if (fishPosition <= 0 || fishPosition >= 100) {
            fishDirection *= -1;
            fishPosition = Math.max(0, Math.min(100, fishPosition));
        }
    };
    
    Game_Interpreter.prototype.onFishingClick = function() {
        if (!minigameActive) return;
        // Extra safety: ignore any clicks in the first 0.5s to prevent buffered input from events
        if (gameTimer < 0.5 || inputLockFrames > 0) {
            return;
        }
        // Immediately hide fish sprite to avoid lingering visual during result
        try { if (this._minigameWindow && typeof this._minigameWindow.hideFishSprite === 'function') this._minigameWindow.hideFishSprite(); } catch (e) {}
        
        // Check if fish is in target zone
        if (fishPosition >= targetZone.start && fishPosition <= targetZone.end) {
            // Success! Calculate score based on proximity to target zone center
            const zoneCenter = (targetZone.start + targetZone.end) / 2;
            const halfZone = Math.max(1, (targetZone.end - targetZone.start) / 2);
            const distance = Math.abs(fishPosition - zoneCenter);
            const accuracy = Math.max(0, 1 - (distance / halfZone));
            playerScore = Math.round(accuracy * 100);
            
            this.endMinigame('success');
        } else {
            // Miss
            playerScore = 0;
            this.endMinigame('miss');
        }
    };
    
    Game_Interpreter.prototype.endMinigame = function(result) {
        minigameActive = false;
        gameResult = result;
        fishingBlockActive = false;
        autoStartConsumed = false;
        // Allow interpreter to run again
        this._fishingHijacked = false;
        console.log('[FishingMinigame] Minigame ended with result:', result, 'score:', playerScore);
        
        // Show result
        if (this._minigameWindow) {
            this._minigameWindow.showResult(result, playerScore);
        }
        
        // Process result after delay
        setTimeout(() => {
            this.processFishingResult(result);
            if (this._minigameWindow) {
                this._minigameWindow.close();
            }
            // Pop the minigame scene and return to map
            if (SceneManager._scene && SceneManager._scene.constructor && SceneManager._scene.constructor.name === 'Scene_FishingMinigame') {
                SceneManager.pop();
            }
        }, 2000);
    };
    
    Game_Interpreter.prototype.processFishingResult = function(result) {
        if (result === 'success') {
            // Give player a random fish based on score
            // Map to match old minigame visuals and item IDs exactly
            const fishTypes = [
                { name: 'Mackerel', itemId: 3, rarity: 40, anim: 'Mackerel' },
                { name: 'Salmon',   itemId: 4, rarity: 20, anim: 'Salmon' },
                { name: 'Trout',    itemId: 5, rarity: 15, anim: 'Trout' },
                { name: 'Bigcoin',  itemId: 6, rarity: 5,  anim: 'bigcoin' },
            ];
            
            // Select fish based on score and rarity
            const random = Math.random() * 100;
            let cumulativeRarity = 0;
            let selectedFish = fishTypes[0];
            
            for (const fish of fishTypes) {
                cumulativeRarity += fish.rarity;
                if (random <= cumulativeRarity) {
                    selectedFish = fish;
                    break;
                }
            }
            
            // Show classic catch picture via Game_Screen to match old behavior
            const picName = String(selectedFish.anim || '').replace(/\.(png|jpg|jpeg)$/i, '');
            const pid = 50; // use a high, safe picture ID
            if ($gameScreen && picName) {
                // Show centered, scaled a bit up
                $gameScreen.showPicture(pid, picName, 1, Graphics.width/2, Graphics.height/2, 100, 100, 255, 0);
                // Zoom in slightly and then smoothly zoom back out to avoid clipping the map edges
                $gameScreen.startZoom(Graphics.width/2, Graphics.height/2, 1.15, 30);
                // Begin zoom-out shortly after the zoom-in starts
                setTimeout(() => {
                    try { $gameScreen.startZoom(Graphics.width/2, Graphics.height/2, 1.0, 30); } catch (e) {}
                }, 600);
                // Erase the picture around 1s
                setTimeout(() => { try { $gameScreen.erasePicture(pid); } catch (e) {} }, 1000);
                // Ensure zoom is fully cleared after the animation finishes
                setTimeout(() => { try { $gameScreen.clearZoom(); } catch (e) {} }, 1300);
            }

            // Add fish to inventory via internal grant
            internalMinigameGrant = true;
            $gameParty.gainItem($dataItems[selectedFish.itemId], 1);
            internalMinigameGrant = false;
            
            // Immediately update collection counter and leaderboard
            try { if (typeof window.updateFishCounterDisplay === 'function') window.updateFishCounterDisplay(); } catch (e) { }
            try { if (typeof window.updatePlayerScore === 'function') window.updatePlayerScore(); } catch (e) { }
            
            // Show message
            $gameMessage.add(`Great catch! You caught a ${selectedFish.name}!`);
            $gameMessage.add(`+1 ${selectedFish.name} added to inventory!`);
        } else {
            $gameMessage.add("No fish caught this time. Try again!");
        }
    };

    //=============================================================================
    // * Block external item gains during minigame to prevent old event rewards
    //=============================================================================
    const _Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        if ((minigameActive || fishingBlockActive) && !internalMinigameGrant && amount > 0) {
            console.log('[FishingMinigame] Blocked external item gain during fishing');
            return;
        }
        return _Game_Party_gainItem.call(this, item, amount, includeEquip);
    };

    // Prevent event command 126 (Change Items) during fishing block
    const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126 = function(params) {
        if ((minigameActive || fishingBlockActive) && MINIGAME_ENABLED) {
            console.log('[FishingMinigame] Suppressed command126 during fishing');
            return true;
        }
        return _Game_Interpreter_command126.call(this, params);
    };
    
    //=============================================================================
    // * Override Input handling for minigame
    //=============================================================================
    
    const _Input_isTriggered = Input.isTriggered;
    Input.isTriggered = function(keyName) {
        // Do not auto-route OK to the minigame globally; handled inside the scene
        return _Input_isTriggered.call(this, keyName);
    };
    
    //=============================================================================
    // * Fishing Minigame Window
    //=============================================================================
    
    class Window_FishingMinigame extends Window_Base {
        constructor() {
            const width = 200;
            const height = 420;
            const x = Math.floor((Graphics.boxWidth - width) / 2);
            const y = Math.floor((Graphics.boxHeight - height) / 2);
            super(new Rectangle(x, y, width, height));
            this._fishPosition = 50;
            this._time = 8;
            this._result = null;
            this._score = 0;
            // Tint the window skin to a golden tone
            // Positive red/green and a slight negative blue yields a gold-like color
            if (this.setTone) {
                this.setTone(80, 70, -20);
            }
            // Create fish sprite (uses picture 'Mackerel') as the moving pointer
            try {
                const fishBitmap = ImageManager.loadPicture('Mackerel');
                const fishSprite = new Sprite(fishBitmap);
                fishSprite.anchor.x = 0.5;
                fishSprite.anchor.y = 0.5;
                fishSprite.scale.x = 0.18;
                fishSprite.scale.y = 0.18;
                // Hide offscreen until first layout pass
                fishSprite.x = -9999;
                fishSprite.y = -9999;
                this.addChild(fishSprite);
                this._fishSprite = fishSprite;
            } catch (e) {
                console.warn('[FishingMinigame] Mackerel picture not found or failed to load:', e);
            }
            this.refresh();
        }
        
        setFishPosition(position) {
            this._fishPosition = position;
            this.refresh();
        }
        
        setTime(time) {
            this._time = time;
            this.refresh();
        }
        
        showResult(result, score) {
            this._result = result;
            this._score = score;
            if (this.hideFishSprite) this.hideFishSprite();
            this.refresh();
        }
        
        refresh() {
            this.contents.clear();
            this.contents.fontSize = 20;
            
            if (this._result) {
                // Show result
                this.contents.textColor = this._result === 'success' ? '#00FF00' : '#FF0000';
                this.contents.drawText(`Result: ${this._result.toUpperCase()}`, 0, 0, this.contents.width, 30, 'center');
                this.contents.drawText(`Score: ${this._score}`, 0, 30, this.contents.width, 30, 'center');
            } else {
                // Show minigame
                this.contents.textColor = '#FFFFFF';
                this.contents.drawText(`Time: ${this._time.toFixed(1)}s`, 0, 4, this.contents.width, 24, 'center');
                
                // Draw progress bar
                this.drawProgressBar();
                
                // Draw instructions
                const instructionsY = this.contents.height - 22;
                this.contents.drawText('Click when fish is in yellow zone!', 0, instructionsY, this.contents.width, 22, 'center');
                // Update fish sprite position after drawing geometry
                if (this.updateFishSpritePosition) this.updateFishSpritePosition();
            }
        }
        
        drawProgressBar() {
            // Vertical, pixel-like fishing bar
            const outerWidth = 56;
            const outerHeight = this.contents.height - 90;
            const outerX = Math.floor((this.contents.width - outerWidth) / 2);
            const outerY = 40;

            // Wooden outer frame
            this.contents.fillRect(outerX, outerY, outerWidth, outerHeight, '#3b2613');
            this.drawBorder(outerX, outerY, outerWidth, outerHeight, '#2a1a0e');

            // Inner wood
            const innerWoodX = outerX + 4;
            const innerWoodY = outerY + 4;
            const innerWoodW = outerWidth - 8;
            const innerWoodH = outerHeight - 8;
            this.contents.fillRect(innerWoodX, innerWoodY, innerWoodW, innerWoodH, '#8b5a2b');
            this.drawBorder(innerWoodX, innerWoodY, innerWoodW, innerWoodH, '#5e3c1b');

            // Water cavity (actual bar)
            const barX = innerWoodX + 10;
            const barY = innerWoodY + 10;
            const barW = innerWoodW - 20;
            const barH = innerWoodH - 20;

            // Water gradient background
            const ctx = this.contents._context;
            const grad = ctx.createLinearGradient(0, barY + barH, 0, barY);
            grad.addColorStop(0, '#1e78ff');
            grad.addColorStop(1, '#9ac7ff');
            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY, barW, barH);
            this.drawBorder(barX, barY, barW, barH, '#ffffff');

            // Target zone (vertical segment)
            const zoneStartY = barY + Math.floor((100 - targetZone.end) / 100 * barH);
            const zoneEndY = barY + Math.floor((100 - targetZone.start) / 100 * barH);
            const zoneH = Math.max(6, zoneEndY - zoneStartY);
            this.contents.fillRect(barX, zoneStartY, barW, zoneH, 'rgba(255, 230, 0, 0.35)');
            this.drawBorder(barX, zoneStartY, barW, zoneH, '#e6c300');

            // Save geometry for sprite positioning
            this._barGeom = { barX, barY, barW, barH, outerX, outerY, outerHeight };

            // Fishing rod next to the bar
            this.drawFishingRod(outerX, outerY, outerHeight, barX, barY, barW, barH);
        }

        updateFishSpritePosition() {
            if (!this._fishSprite || !this._barGeom) return;
            const { barX, barY, barW, barH } = this._barGeom;
            const y = barY + Math.floor((100 - this._fishPosition) / 100 * barH);
            const x = barX + Math.floor(barW / 2);
            this._fishSprite.x = x;
            this._fishSprite.y = y;
        }

        hideFishSprite() {
            if (this._fishSprite) this._fishSprite.visible = false;
        }

        drawFishingRod(frameX, frameY, frameH, barX, barY, barW, barH) {
            const ctx = this.contents._context;
            // Thinner graphite rod with cork handle and reel, plus guides
            const rodWidth = 6;
            const rodX = frameX - 36;
            const rodY = frameY;
            const rodH = frameH;
            const grad = ctx.createLinearGradient(rodX, 0, rodX + rodWidth, 0);
            grad.addColorStop(0, '#1f2327');
            grad.addColorStop(0.5, '#3b4046');
            grad.addColorStop(1, '#111417');
            ctx.fillStyle = grad;
            ctx.fillRect(rodX, rodY, rodWidth, rodH - 60);
            this.drawBorder(rodX, rodY, rodWidth, rodH - 60, '#0c0e10');

            // Cork handle
            const handleW = rodWidth + 8;
            const handleH = 56;
            const handleX = rodX - 1;
            const handleY = rodY + rodH - handleH - 4;
            this.contents.fillRect(handleX, handleY, handleW, handleH, '#c89f6f');
            this.drawBorder(handleX, handleY, handleW, handleH, '#8c6a43');

            // Reel with small handle
            const reelR = 11;
            const reelCX = handleX + Math.floor(handleW / 2) + 4;
            const reelCY = handleY + Math.floor(handleH / 2);
            ctx.beginPath();
            ctx.arc(reelCX, reelCY, reelR, 0, Math.PI * 2);
            ctx.fillStyle = '#9aa1a8';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#5b6168';
            ctx.stroke();
            // reel handle arm
            ctx.beginPath();
            ctx.moveTo(reelCX + reelR, reelCY);
            ctx.lineTo(reelCX + reelR + 8, reelCY - 5);
            ctx.strokeStyle = '#7b848c';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Guides along the rod
            const guides = 5;
            for (let i = 0; i < guides; i++) {
                const gy = rodY + 10 + i * ((rodH - 80) / (guides - 1));
                const gx = rodX + rodWidth;
                ctx.beginPath();
                ctx.arc(gx + 3, gy, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#cfd5db';
                ctx.fill();
                ctx.strokeStyle = '#5b6168';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(gx, gy);
                ctx.lineTo(gx + 3, gy);
                ctx.strokeStyle = '#cfd5db';
                ctx.stroke();
            }

            // Fishing line with slight curve
            const tipX = rodX + Math.floor(rodWidth / 2) + 2;
            const tipY = rodY + 6;
            const attachX = barX + Math.floor(barW / 2);
            const attachY = barY + 6;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.quadraticCurveTo(tipX + 20, tipY + 10, attachX, attachY);
            ctx.strokeStyle = '#e6e6e6';
            ctx.lineWidth = 2;
            ctx.stroke();
            // small hook
            ctx.beginPath();
            ctx.moveTo(attachX, attachY);
            ctx.lineTo(attachX + 6, attachY + 6);
            ctx.lineTo(attachX + 2, attachY + 10);
            ctx.strokeStyle = '#d4d4d4';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        drawBorder(x, y, w, h, color) {
            // top
            this.contents.fillRect(x, y, w, 1, color);
            // bottom
            this.contents.fillRect(x, y + h - 1, w, 1, color);
            // left
            this.contents.fillRect(x, y, 1, h, color);
            // right
            this.contents.fillRect(x + w - 1, y, 1, h, color);
        }
    }
    
    class Scene_FishingMinigame extends Scene_Base {
        create() {
            super.create();
            // Create background image (avoids black screen)
            this._createBackgroundImage();
            if (!this._windowLayer && this.createWindowLayer) {
                this.createWindowLayer();
            }
            this._window = new Window_FishingMinigame();
            if (this.addWindow) {
                this.addWindow(this._window);
            } else {
                this.addChild(this._window);
            }
            if (window._fishingInterpreterRef) {
                window._fishingInterpreterRef._minigameWindow = this._window;
            }
        }
        _createBackgroundImage() {
            try {
                // Load image from project root: 'IMAGEN3.png'
                const bitmap = Bitmap.load('IMAGEN3.png');
                const sprite = new Sprite(bitmap);
                // Once loaded, scale to cover the whole screen while preserving aspect ratio
                bitmap.addLoadListener(() => {
                    const scaleX = Graphics.width / bitmap.width;
                    const scaleY = Graphics.height / bitmap.height;
                    const scale = Math.max(scaleX, scaleY);
                    sprite.scale.x = scale;
                    sprite.scale.y = scale;
                    sprite.x = (Graphics.width - bitmap.width * scale) / 2;
                    sprite.y = (Graphics.height - bitmap.height * scale) / 2;
                });
                // Add as the very first child so it's behind windows
                if (this.addChildAt) {
                    this.addChildAt(sprite, 0);
                } else {
                    this.addChild(sprite);
                }
                this._bgSprite = sprite;
            } catch (e) {
                // If for any reason the image cannot be loaded, fail silently
                // to avoid interrupting the minigame flow.
                console.warn('[FishingMinigame] Could not load IMAGEN3.png background:', e);
            }
        }
        start() {
            super.start();
            this._elapsed = 0;
            this._ticker = 0;
            // Clear any latched inputs from triggering the event
            if (Input.clear) Input.clear();
            if (TouchInput.clear) TouchInput.clear();
        }
        update() {
            super.update();
            if (!minigameActive) return;
            const dt = 1/60; // use fixed timestep to avoid large delta spikes
            this._elapsed += dt;
            this._ticker++;
            if (inputLockFrames > 0) inputLockFrames--;

            // Handle input explicitly here: ONLY keyboard OK/Enter/Space. No auto-tap.
            if (inputLockFrames <= 0 && Input.isTriggered('ok')) {
                this.onFishingClick();
            }
            // Move fish
            fishPosition += fishDirection * fishSpeed * 0.5;
            if (fishPosition <= 0 || fishPosition >= 100) {
                fishDirection *= -1;
                fishPosition = Math.max(0, Math.min(100, fishPosition));
            }
            // Update time
            gameTimer += dt;
            // Update window
            this._window.setFishPosition(fishPosition);
            this._window.setTime(timeLimit - gameTimer);
            // Timeout
            if (gameTimer >= timeLimit) {
                if (window._fishingInterpreterRef && typeof window._fishingInterpreterRef.endMinigame === 'function') {
                    window._fishingInterpreterRef.endMinigame('timeout');
                } else {
                    minigameActive = false;
                    SceneManager.pop();
                }
            }
        }
        onFishingClick() {
            if (!minigameActive) return;
            if (inputLockFrames > 0) return;
            if (window._fishingInterpreterRef && typeof window._fishingInterpreterRef.onFishingClick === 'function') {
                window._fishingInterpreterRef.onFishingClick();
            }
        }
        isReady() {
            return super.isReady();
        }
        terminate() {
            super.terminate();
        }
    }
    
})();
