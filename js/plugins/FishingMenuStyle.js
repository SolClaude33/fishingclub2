//=============================================================================
// RPG Maker MZ - Fishing Menu Style Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Transforms the menu into a fishing-themed nautical design with boat-style layout and ocean colors.
 * @author Assistant
 *
 * @help FishingMenuStyle.js
 *
 * This plugin completely redesigns the menu with a fishing theme:
 * - Nautical blue and white color scheme
 * - Boat-shaped menu container
 * - Fishing rod and fish icons
 * - Ocean wave animations
 * - Anchor and compass elements
 * - Fisherman's hat styling
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Override Window_MenuCommand to apply fishing theme styling
    const _Window_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize = function(rect) {
        _Window_MenuCommand_initialize.call(this, rect);
        this.applyFishingTheme();
    };

    // Apply fishing theme to menu command window
    Window_MenuCommand.prototype.applyFishingTheme = function() {
        this.setBackgroundType(2); // Transparent background
        this.opacity = 0; // Make window transparent
        this.backOpacity = 0;
        
        // Create custom fishing-themed container
        this.createFishingMenuContainer();
    };

    // Create the main fishing menu container
    Window_MenuCommand.prototype.createFishingMenuContainer = function() {
        // Remove existing container if it exists
        if (this._fishingContainer) {
            this._fishingContainer.remove();
        }

        // Create main fishing boat container
        this._fishingContainer = document.createElement('div');
        this._fishingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #4a90e2 50%, #87ceeb 75%, #b0e0e6 100%);
            z-index: 10000;
            overflow: hidden;
            font-family: 'Courier New', monospace;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create main content container
        const mainContent = document.createElement('div');
        mainContent.style.cssText = `
            position: relative;
            width: 1200px;
            height: 700px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #4a90e2 50%, #87ceeb 75%, #b0e0e6 100%);
            border: 4px solid #0f4c75;
            border-radius: 30px;
            box-shadow: 
                0 20px 40px rgba(0,0,0,0.4),
                inset 0 2px 0 rgba(255,255,255,0.3),
                inset 0 -2px 0 rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 40px;
            box-sizing: border-box;
            overflow: hidden;
        `;

        // Add boat deck texture to main content
        mainContent.innerHTML = `
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: 
                    repeating-linear-gradient(
                        90deg,
                        transparent 0px,
                        transparent 20px,
                        rgba(255,255,255,0.1) 20px,
                        rgba(255,255,255,0.1) 22px
                    ),
                    repeating-linear-gradient(
                        0deg,
                        transparent 0px,
                        transparent 20px,
                        rgba(255,255,255,0.05) 20px,
                        rgba(255,255,255,0.05) 22px
                    );
                pointer-events: none;
            "></div>
        `;

        // Create character status panel (fisherman's log)
        this.createCharacterPanel(mainContent);

        // Create menu buttons (fishing gear)
        this.createMenuButtons(mainContent);

        // Create ocean waves at bottom
        this.createOceanWaves();

        // Create anchor and compass
        this.createNauticalElements();

        this._fishingContainer.appendChild(mainContent);
        
        // Add to document
        document.body.appendChild(this._fishingContainer);

        // Add CSS animations
        this.addFishingAnimations();
    };

    // Create character status panel styled as fisherman's log
    Window_MenuCommand.prototype.createCharacterPanel = function(parentContainer) {
        const characterPanel = document.createElement('div');
        characterPanel.style.cssText = `
            width: 450px;
            height: 500px;
            background: linear-gradient(135deg, #f4f1de 0%, #e8e4c9 50%, #d4c4a8 100%);
            border: 4px solid #8B4513;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 
                0 12px 24px rgba(0,0,0,0.3),
                inset 0 2px 0 rgba(255,255,255,0.4);
            font-family: 'Courier New', monospace;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        // Add fisherman's hat icon
        const hatIcon = document.createElement('div');
        hatIcon.style.cssText = `
            width: 80px;
            height: 80px;
            background: #FF6B35;
            border: 4px solid #8B4513;
            border-radius: 50% 50% 0 0;
            margin: 0 auto 20px;
            position: relative;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        `;
        hatIcon.innerHTML = `
            <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 90px;
                height: 12px;
                background: #FF6B35;
                border: 3px solid #8B4513;
                border-radius: 6px;
            "></div>
        `;

        // Get player data
        const actor = $gameParty.leader();
        const level = actor ? actor.level : 1;
        const hp = actor ? actor.hp : 100;
        const maxHp = actor ? actor.mhp : 100;
        const mp = actor ? actor.mp : 50;
        const maxMp = actor ? actor.mmp : 50;
        const walletAddress = getPlayerWallet ? getPlayerWallet() : '0x0000...0000';

        characterPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="logo.png" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 15px; box-shadow: 0 6px 12px rgba(0,0,0,0.3);">
                <h3 style="color: #8B4513; margin: 0; font-size: 22px; font-weight: bold; text-shadow: 1px 1px 0px #f4f1de;">FISHERMAN'S LOG</h3>
            </div>
            <div style="font-size: 14px; line-height: 1.6; width: 100%;">
                <div style="margin-bottom: 15px; padding: 10px; background: rgba(139, 69, 19, 0.1); border-radius: 8px;">
                    <span style="color: #8B4513; font-weight: bold;">Wallet:</span> 
                    <span style="color: #2F4F2F; font-family: monospace; font-size: 12px;">${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 4)}</span>
                </div>
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 15px;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
                        border: 2px solid #8B4513;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 
                            0 3px 6px rgba(0,0,0,0.3),
                            inset 0 1px 0 rgba(255,255,255,0.4);
                        position: relative;
                        flex-shrink: 0;
                    ">
                        <div style="
                            width: 35px;
                            height: 35px;
                            background: linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 50%, #FFF8DC 100%);
                            border: 1px solid #8B4513;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 16px;
                            font-weight: bold;
                            color: #8B4513;
                        ">🏆</div>
                    </div>
                    <div style="
                        color: #8B4513;
                        font-weight: bold;
                        font-size: 12px;
                        text-shadow: 1px 1px 0px #f4f1de;
                    ">first login</div>
                </div>

            </div>
        `;

        parentContainer.appendChild(characterPanel);
    };

    // Create menu buttons styled as fishing gear
    Window_MenuCommand.prototype.createMenuButtons = function(parentContainer) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            width: 600px;
            height: 500px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 20px;
            padding: 20px;
        `;

        const menuItems = [
            { name: "Twitter", icon: "", color: "#1DA1F2", row: 1, col: 1 },
            { name: "Discord", icon: "", color: "#5865F2", row: 1, col: 2 },
            { name: "Gitbook", icon: "", color: "#3884FF", row: 1, col: 3 },
            { name: "GitHub", icon: "", color: "#333", row: 1, col: 4 },
            { name: "Updates", icon: "", color: "#FF6B35", row: 2, col: 1 },
            { name: "Buy", icon: "", color: "#FFD700", row: 2, col: 2 },
            { name: "Video", icon: "", color: "#FF0000", row: 2, col: 3 },
            { name: "Say Hi! ✳️", icon: "", color: "#4CAF50", row: 3, col: 2 },
        ];

        menuItems.forEach((item, index) => {
            const button = document.createElement('div');
            button.className = 'fishing-menu-button';
            button.dataset.command = item.name.toLowerCase().replace(/\s+/g, '').replace(/[!✳️]/g, '');
            
            button.style.cssText = `
                background: linear-gradient(135deg, ${item.color} 0%, ${this.darkenColor(item.color, 20)} 100%);
                border: 3px solid ${this.darkenColor(item.color, 40)};
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    0 8px 0 ${this.darkenColor(item.color, 40)},
                    0 4px 8px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
                position: relative;
                overflow: hidden;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: white;
                text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
                font-size: 16px;
                min-height: 80px;
            `;

            button.innerHTML = `
                <span style="font-size: 16px; text-align: center;">${item.name}</span>
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
                    transform: translateX(-100%);
                    transition: transform 0.6s ease;
                "></div>
            `;

            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-6px) scale(1.05)';
                button.style.boxShadow = `
                    0 14px 28px rgba(0,0,0,0.4),
                    0 6px 0 ${this.darkenColor(item.color, 40)},
                    inset 0 1px 0 rgba(255,255,255,0.3)
                `;
                button.querySelector('div').style.transform = 'translateX(100%)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = `
                    0 8px 0 ${this.darkenColor(item.color, 40)},
                    0 4px 8px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3)
                `;
                button.querySelector('div').style.transform = 'translateX(-100%)';
            });

            // Add click handler
            button.addEventListener('click', () => {
                this.handleMenuCommand(button.dataset.command);
            });

            buttonContainer.appendChild(button);
        });

        parentContainer.appendChild(buttonContainer);
    };

    // Create ocean waves at the bottom
    Window_MenuCommand.prototype.createOceanWaves = function() {
        const wavesContainer = document.createElement('div');
        wavesContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            overflow: hidden;
        `;

        // Create multiple wave layers
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.style.cssText = `
                position: absolute;
                bottom: ${i * 20}px;
                left: 0;
                right: 0;
                height: 40px;
                background: linear-gradient(180deg, transparent 0%, rgba(135, 206, 235, ${0.3 - i * 0.1}) 100%);
                border-radius: 50% 50% 0 0;
                animation: oceanWave ${2 + i * 0.5}s ease-in-out infinite;
                animation-delay: ${i * 0.3}s;
            `;
            wavesContainer.appendChild(wave);
        }

        this._fishingContainer.appendChild(wavesContainer);
    };

    // Create nautical elements (anchor and compass)
    Window_MenuCommand.prototype.createNauticalElements = function() {
        // Create anchor
        const anchor = document.createElement('div');
        anchor.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 30px;
            width: 35px;
            height: 50px;
            color: #8B4513;
            font-size: 35px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: anchorSwing 4s ease-in-out infinite;
        `;
        anchor.innerHTML = '⚓';

        // Create compass
        const compass = document.createElement('div');
        compass.style.cssText = `
            position: absolute;
            bottom: 80px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #f4f1de 0%, #e8e4c9 100%);
            border: 3px solid #8B4513;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 2px 0 rgba(255,255,255,0.4);
            animation: compassSpin 10s linear infinite;
        `;
        compass.innerHTML = `
            <div style="
                width: 35px;
                height: 35px;
                background: #8B4513;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #f4f1de;
                font-size: 18px;
                font-weight: bold;
            ">N</div>
        `;

        this._fishingContainer.appendChild(anchor);
        this._fishingContainer.appendChild(compass);
    };

    // Add CSS animations
    Window_MenuCommand.prototype.addFishingAnimations = function() {
        const style = document.createElement('style');
        style.textContent = `
            
            
            @keyframes oceanWave {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
            }
            
            @keyframes anchorSwing {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
            }
            
            @keyframes compassSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .fishing-menu-button:active {
                transform: translateY(2px) scale(0.98) !important;
                box-shadow: 0 2px 0 rgba(0,0,0,0.3) !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Utility function to darken colors
    Window_MenuCommand.prototype.darkenColor = function(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    // Handle menu command clicks
    Window_MenuCommand.prototype.handleMenuCommand = function(command) {
        switch(command) {
            case 'twitter':
                window.open('https://x.com/ABSPFC', '_blank');
                break;
            case 'discord':
                window.open('https://discord.gg/sY5KUUQGxw', '_blank');
                break;
            case 'gitbook':
                window.open('https://penguin-fishing-club.gitbook.io/penguin-fishing-club/', '_blank');
                break;
            case 'github':
                window.open('https://github.com/letsfishgameabs/PENGUIN-FISHING-CLUB', '_blank');
                break;
            case 'updates':
                window.open('updates.html', '_blank');
                break;
            case 'buy':
                window.open('https://dexscreener.com/moonshot', '_blank');
                break;
            case 'video':
                SceneManager._scene.showVideoModal();
                break;
            case 'sayhi':
                window.open('https://x.com/Taydripeth', '_blank');
                break;


        }
        this.closeMenu();
    };

    // Close the fishing menu
    Window_MenuCommand.prototype.closeMenu = function() {
        if (this._fishingContainer) {
            // Show loading circle
            this.showLoadingCircle();
            
            // Close background menu immediately
            SceneManager.pop();
            
            // Remove fishing container after 1.5 seconds
            setTimeout(() => {
                if (this._fishingContainer) {
                    this._fishingContainer.remove();
                    this._fishingContainer = null;
                }
            }, 1500);
        } else {
            SceneManager.pop();
        }
    };

    // Show loading circle
    Window_MenuCommand.prototype.showLoadingCircle = function() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        // Create loading circle
        const loadingCircle = document.createElement('div');
        loadingCircle.style.cssText = `
            width: 80px;
            height: 80px;
            border: 6px solid rgba(255, 255, 255, 0.3);
            border-top: 6px solid #87ceeb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        // Add spinning animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        loadingOverlay.appendChild(loadingCircle);
        this._fishingContainer.appendChild(loadingOverlay);
    };

    // Override Scene_Menu to use fishing theme
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        const rect = this.commandWindowRect();
        const commandWindow = new Window_MenuCommand(rect);
        this.addWindow(commandWindow);
        this._commandWindow = commandWindow;
    };

    // Override Scene_Menu to handle back button
    const _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        
        // Add back button to fishing menu
        setTimeout(() => {
            if (this._commandWindow && this._commandWindow._fishingContainer) {
                this.createBackButton();
            }
        }, 100);
    };

    // Create back button
    Scene_Menu.prototype.createBackButton = function() {
        const backButton = document.createElement('div');
        backButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: 3px solid #721c24;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 
                0 4px 0 #721c24,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.3);
            transition: all 0.2s ease;
            z-index: 1001;
        `;
        backButton.innerHTML = '✕';
        
        backButton.addEventListener('mouseenter', () => {
            backButton.style.transform = 'scale(1.1)';
            backButton.style.boxShadow = '0 6px 0 #721c24, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });
        
        backButton.addEventListener('mouseleave', () => {
            backButton.style.transform = 'scale(1)';
            backButton.style.boxShadow = '0 4px 0 #721c24, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });
        
        backButton.addEventListener('click', () => {
            if (this._commandWindow && this._commandWindow._fishingContainer) {
                // Show loading circle
                this._commandWindow.showLoadingCircle();
                
                // Close background menu immediately
                SceneManager.pop();
                
                // Remove fishing container after 1.5 seconds
                setTimeout(() => {
                    if (this._commandWindow && this._commandWindow._fishingContainer) {
                        this._commandWindow._fishingContainer.remove();
                        this._commandWindow._fishingContainer = null;
                    }
                }, 1500);
            } else {
                SceneManager.pop();
            }
        });
        
        this._commandWindow._fishingContainer.appendChild(backButton);
    };

    // Add modal functions (reuse from SimpleMenu.js)
    Scene_Menu.prototype.showVideoModal = function() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 40000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create video container with fishing theme
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            border: 4px solid #0f4c75;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 
                0 20px 40px rgba(0,0,0,0.5),
                inset 0 2px 0 rgba(255,255,255,0.3);
            padding: 30px;
            color: white;
            font-family: 'Courier New', monospace;
        `;

        // Create title
        const title = document.createElement('h2');
        title.textContent = '🎬 Game Trailer';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            color: white;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            border-bottom: 3px solid #87ceeb;
            padding-bottom: 15px;
        `;

        // Create video element
        const videoElement = document.createElement('video');
        videoElement.style.cssText = `
            width: 100%;
            height: 400px;
            border: 3px solid #87ceeb;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            background: #000;
        `;
        videoElement.controls = true;
        videoElement.autoplay = false;
        videoElement.src = 'movies/video.mp4';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            border: 3px solid #721c24;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 4px 0 #721c24, 0 2px 4px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.transform = 'scale(1.1)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.transform = 'scale(1)';
        });

        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // Assemble the modal
        videoContainer.appendChild(title);
        videoContainer.appendChild(videoElement);
        videoContainer.appendChild(closeButton);
        overlay.appendChild(videoContainer);
        document.body.appendChild(overlay);

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Add events modal with fishing theme
    Scene_Menu.prototype.showEventsModal = function() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 40000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const eventsContainer = document.createElement('div');
        eventsContainer.style.cssText = `
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            border: 4px solid #0f4c75;
            border-radius: 20px;
            max-width: 600px;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            color: white;
            font-family: 'Courier New', monospace;
        `;

        // Header
        const headerBar = document.createElement('div');
        headerBar.style.cssText = `
            background: linear-gradient(135deg, #0f4c75 0%, #1e3c72 100%);
            padding: 20px;
            border-bottom: 3px solid #87ceeb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h2');
        title.textContent = '🎣 Fishing Events';
        title.style.cssText = `
            margin: 0;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.cssText = `
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            border: 2px solid #721c24;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        headerBar.appendChild(title);
        headerBar.appendChild(closeButton);
        eventsContainer.appendChild(headerBar);

        // Events list
        const eventsList = document.createElement('div');
        eventsList.style.cssText = `
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        `;

        // Event 1
        const event1 = document.createElement('div');
        event1.style.cssText = `
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            border: 2px solid #87ceeb;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
        `;
        event1.innerHTML = `
            <div style="font-size: 40px;">🎣</div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #87ceeb;">FISHING TOURNAMENT</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">Join our monthly fishing tournament and compete with players worldwide!</p>
                <p style="margin: 8px 0 0 0; color: #87ceeb; font-weight: bold;">📅 Every first Saturday of the month</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                border: 2px solid #2E7D32;
                border-radius: 8px;
                padding: 12px 16px;
                color: white;
                font-weight: bold;
                text-align: center;
            ">
                FREE ENTRY
            </div>
        `;

        // Event 2
        const event2 = document.createElement('div');
        event2.style.cssText = `
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            border: 2px solid #87ceeb;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
        `;
        event2.innerHTML = `
            <div style="font-size: 40px;">🐟</div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #87ceeb;">COMMUNITY CHALLENGE</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">Special challenges with exclusive rewards for active community members!</p>
                <p style="margin: 8px 0 0 0; color: #87ceeb; font-weight: bold;">📅 Weekly challenges</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                border: 2px solid #2E7D32;
                border-radius: 8px;
                padding: 12px 16px;
                color: white;
                font-weight: bold;
                text-align: center;
            ">
                FREE ENTRY
            </div>
        `;

        // Add hover effects
        [event1, event2].forEach(event => {
            event.addEventListener('mouseenter', () => {
                event.style.transform = 'translateY(-5px) scale(1.02)';
                event.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
            });
            event.addEventListener('mouseleave', () => {
                event.style.transform = 'translateY(0) scale(1)';
                event.style.boxShadow = 'none';
            });
        });

        eventsList.appendChild(event1);
        eventsList.appendChild(event2);
        eventsContainer.appendChild(eventsList);
        overlay.appendChild(eventsContainer);
        document.body.appendChild(overlay);

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Add participants modal
    Scene_Menu.prototype.showAllRegistrationsModal = function() {
        // Implementation similar to SimpleMenu.js but with fishing theme
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 40000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
            border: 4px solid #0f4c75;
            border-radius: 20px;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            color: white;
            font-family: 'Courier New', monospace;
        `;

        container.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <h2 style="margin: 0 0 20px 0; color: #87ceeb; font-size: 28px;">👥 Tournament Participants</h2>
                <p style="font-size: 16px; line-height: 1.5;">Loading participant data...</p>
            </div>
        `;

        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Close functionality
        const closeModal = () => {
            document.body.removeChild(overlay);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

})();
