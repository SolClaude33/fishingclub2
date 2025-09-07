//=============================================================================
// RPG Maker MZ - Simple Menu Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Removes equipment, save, and other menu options, adds fish counter with images and global leaderboard.
 * @author Assistant
 *
 * @help SimpleMenu.js
 *
 * This plugin removes equipment, save, and other menu options from the main menu.
 * It also adds a fish counter that shows how many fish of each type you have.
 * It includes a global leaderboard with tabs to filter by fish type.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Override Window_MenuCommand to remove unwanted commands
    const _Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        this.addMainCommands();
        // Removed: this.addFormationCommand();
        // Removed: this.addOriginalCommands();
        // Removed: this.addOptionsCommand();
        // Removed: this.addSaveCommand();
        // Removed: this.addGameEndCommand();
    };

    // Override Window_MenuCommand to show social and buy commands
    const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        this.addCommand("Twitter", "twitter", true);
        this.addCommand("Discord", "discord", true);
        this.addCommand("Gitbook", "gitbook", true);
        this.addCommand("GitHub", "github", true);
        this.addCommand("Skins", "skins", true);
        this.addCommand("Updates", "updates", true);
        this.addCommand("Buy", "buy", true);
        this.addCommand("Video", "video", true);
        this.addCommand("Say Hi! ✳️", "sayhi", true);
    };

    // Override Scene_Menu to handle social and buy commands
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        const rect = this.commandWindowRect();
        const commandWindow = new Window_MenuCommand(rect);
        commandWindow.setHandler("twitter", this.commandTwitter.bind(this));
        commandWindow.setHandler("discord", this.commandDiscord.bind(this));
        commandWindow.setHandler("gitbook", this.commandGitbook.bind(this));
        commandWindow.setHandler("github", this.commandGitHub.bind(this));
        commandWindow.setHandler("skins", this.commandSkins.bind(this));
        commandWindow.setHandler("buy", this.commandBuy.bind(this));
        commandWindow.setHandler("video", this.commandVideo.bind(this));
        commandWindow.setHandler("sayhi", this.commandSayHi.bind(this));
        commandWindow.setHandler("updates", this.commandUpdates.bind(this));
        commandWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(commandWindow);
        this._commandWindow = commandWindow;
    };

    // Add twitter command function
    Scene_Menu.prototype.commandTwitter = function() {
        window.open('https://x.com/ABSPFC', '_blank');
        this.popScene();
    };

    // Add discord command function
    Scene_Menu.prototype.commandDiscord = function() {
        window.open('https://discord.gg/sY5KUUQGxw', '_blank');
        this.popScene();
    };

    // Add gitbook command function
    Scene_Menu.prototype.commandGitbook = function() {
        window.open('https://penguin-fishing-club.gitbook.io/penguin-fishing-club/', '_blank');
        this.popScene();
    };

    // Add skins command function
    Scene_Menu.prototype.commandSkins = function() {
        if (typeof window.showSkinSelector === 'function') {
            window.showSkinSelector();
        } else {
            console.log('Skin selector not available');
        }
        this.popScene();
    };

    // Add github command function
    Scene_Menu.prototype.commandGitHub = function() {
        window.open('https://github.com/letsfishgameabs/PENGUIN-FISHING-CLUB', '_blank');
        this.popScene();
    };

    // Add buy command function
    Scene_Menu.prototype.commandBuy = function() {
        window.open('https://dexscreener.com/moonshot', '_blank');
        this.popScene();
    };

    // Add video command function
    Scene_Menu.prototype.commandVideo = function() {
        this.showVideoModal();
        this.popScene();
    };

    // Show video modal function
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

        // Create video container with 3D style
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            padding: 20px;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
        `;

        // Create title with 3D style
        const title = document.createElement('h2');
        title.textContent = 'Game Trailer';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            color: #8B4513;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 1px 1px 0px #F5DEB3;
            border-bottom: 2px solid #8B4513;
            padding-bottom: 10px;
        `;

        // Create video iframe
        const videoFrame = document.createElement('iframe');
        videoFrame.style.cssText = `
            width: 100%;
            height: 400px;
            border: 2px solid #8B4513;
            border-radius: 8px;
            box-shadow: 
                0 3px 0 #8B4513,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        videoFrame.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // Replace with your video URL
        videoFrame.allowFullscreen = true;

        // Create close button with 3D style
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            border: 2px solid #654321;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Add hover effects to close button
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            closeButton.style.transform = 'translateY(-1px)';
            closeButton.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        // Close functionality
        const closeModal = () => {
            safeCloseModal(overlay);
        };

        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        // Assemble the modal
        videoContainer.appendChild(title);
        videoContainer.appendChild(videoFrame);
        videoContainer.appendChild(closeButton);
        overlay.appendChild(videoContainer);
        document.body.appendChild(overlay);
    };

    // Safe modal close utility function
    function safeCloseModal(overlay) {
        if (overlay && overlay.parentNode) {
            try {
                overlay.parentNode.removeChild(overlay);
            } catch (error) {
                console.log('Modal already closed or removed');
            }
        }
    }

    // Add say hi command function
    Scene_Menu.prototype.commandSayHi = function() {
        window.open('https://x.com/Taydripeth', '_blank');
        this.popScene();
    };

    // Add events command function
    Scene_Menu.prototype.commandEvents = function() {
        console.log('Events command triggered from menu');
        // Use the new HTML modal function
        if (typeof window.showEvents === 'function') {
            window.showEvents();
        } else {
            console.error('showEvents function not found');
            this.showMessage('Events system not available');
        }
    };

    // Add updates command function
    Scene_Menu.prototype.commandUpdates = function() {
        window.open('updates.html', '_blank');
        this.popScene();
    };

    // Add registration command function
    Scene_Menu.prototype.commandRegistration = function() {
        console.log('Registration command triggered from menu');
        // Show participants for both events
        if (typeof window.showRegistrationBoard === 'function') {
            // Create a combined participants view
            this.showAllParticipantsModal();
        } else {
            console.error('showRegistrationBoard function not found');
            this.showMessage('Participants system not available');
        }
    };

    // Create and show video modal
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
            z-index: 30000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Create video container with 3D style
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            padding: 20px;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
        `;

        // Create title with 3D style
        const title = document.createElement('h2');
        title.textContent = 'Trailer';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            color: #8B4513;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 1px 1px 0px #F5DEB3;
            border-bottom: 2px solid #8B4513;
            padding-bottom: 10px;
        `;

        // Create video element with 3D style
        const video = document.createElement('video');
        video.style.cssText = `
            width: 100%;
            height: 400px;
            display: block;
            border: 2px solid #8B4513;
            border-radius: 8px;
            box-shadow: 
                0 3px 0 #8B4513,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        video.src = 'movies/video.mp4';
        video.controls = true;
        video.autoplay = true;

        // Create close button with 3D style
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            border: 2px solid #654321;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;

        // Add hover effects to close button
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            closeButton.style.transform = 'translateY(-1px)';
            closeButton.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        // Assemble the modal
        videoContainer.appendChild(title);
        videoContainer.appendChild(video);
        videoContainer.appendChild(closeButton);
        overlay.appendChild(videoContainer);
        document.body.appendChild(overlay);

        // Close modal functionality
        const closeModal = () => {
            video.pause();
            safeCloseModal(overlay);
        };

        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);

        // Handle video errors with 3D style
        video.addEventListener('error', () => {
            videoContainer.innerHTML = `
                <div style="
                    padding: 40px;
                    text-align: center;
                    color: #2F4F2F;
                    font-family: Arial, sans-serif;
                ">
                    <h3 style="color: #8B4513; margin-bottom: 20px; font-weight: bold;">Video not found</h3>
                    <p style="color: #2F4F2F; font-weight: bold;">Make sure video.mp4 is in the game folder</p>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement.parentElement)" 
                            style="
                                background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                                color: white;
                                border: 2px solid #654321;
                                padding: 10px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                margin-top: 15px;
                                font-weight: bold;
                                box-shadow: 
                                    0 2px 0 #654321,
                                    0 1px 3px rgba(0,0,0,0.3),
                                    inset 0 1px 0 rgba(255,255,255,0.2);
                            ">Close</button>
                </div>
            `;
        });
    };

    // Create and show events modal
    Scene_Menu.prototype.showEventsModal = function() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 30000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 10%;
        `;

        // Create events container with clean style inspired by the reference image
        const eventsContainer = document.createElement('div');
        eventsContainer.style.cssText = `
            position: relative;
            max-width: 80%;
            max-height: 80%;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            padding: 0;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            overflow: hidden;
        `;

        // Create header bar like in the reference image
        const headerBar = document.createElement('div');
        headerBar.style.cssText = `
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #654321;
        `;

        // Create title in header
        const title = document.createElement('h2');
        title.textContent = 'EVENTS';
        title.style.cssText = `
            margin: 0;
            color: white;
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            text-shadow: 1px 1px 0px #654321;
        `;

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            background: #F5F5DC;
            border: 2px solid #8B4513;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            color: #8B4513;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;

        // Add hover effect to close button
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = '#8B4513';
            closeButton.style.color = '#F5F5DC';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = '#F5F5DC';
            closeButton.style.color = '#8B4513';
        });

        // Add close functionality
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // Assemble header
        headerBar.appendChild(title);
        headerBar.appendChild(closeButton);
        eventsContainer.appendChild(headerBar);

        // Create events list with cute button style
        const eventsList = document.createElement('div');
        eventsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 25px;
            background: #F5F5DC;
        `;

        // Event 1 - Fishing Tournament (Pixel Art 3D Button Style)
        const event1 = document.createElement('div');
        event1.style.cssText = `
            background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
            border: 3px solid #8B4513;
            border-radius: 12px;
            padding: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
            box-shadow: 
                0 4px 0 #8B4513,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.3);
            position: relative;
            overflow: hidden;
        `;
        event1.innerHTML = `
            <div style="width: 70px; height: 70px; background: #90EE90; border: 3px solid #8B4513; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                <img src="img/favicon.png" style="width: 50px; height: 50px; object-fit: contain;" alt="Fishing Tournament">
            </div>
            <div style="flex: 1;">
                <h3 style="color: #8B4513; margin: 0 0 8px 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3;">FISHING TOURNAMENT</h3>
                <p style="margin: 0; color: #556B2F; font-size: 13px; line-height: 1.4;">Join our monthly fishing tournament and compete with players worldwide!</p>
                <p style="margin: 6px 0 0 0; color: #8B4513; font-size: 11px; font-weight: bold;">📅 Every first Saturday of the month</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%);
                border: 3px solid #2E7D32;
                border-radius: 8px;
                padding: 12px 16px;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 
                    0 4px 0 #2E7D32,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
                position: relative;
                text-shadow: 1px 1px 0px #2E7D32;
            ">
                FREE ENTRY
            </div>
        `;

        // Event 2 - Community Challenge (Pixel Art 3D Button Style)
        const event2 = document.createElement('div');
        event2.style.cssText = `
            background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
            border: 3px solid #8B4513;
            border-radius: 12px;
            padding: 18px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 20px;
            box-shadow: 
                0 4px 0 #8B4513,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.3);
            position: relative;
            overflow: hidden;
        `;
        event2.innerHTML = `
            <div style="width: 70px; height: 70px; background: #FFB6C1; border: 3px solid #8B4513; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                <img src="img/favicon.png" style="width: 50px; height: 50px; object-fit: contain;" alt="Community Challenge">
            </div>
            <div style="flex: 1;">
                <h3 style="color: #8B4513; margin: 0 0 8px 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3;">COMMUNITY CHALLENGE</h3>
                <p style="margin: 0; color: #556B2F; font-size: 13px; line-height: 1.4;">Special challenges with exclusive rewards for active community members!</p>
                <p style="margin: 6px 0 0 0; color: #8B4513; font-size: 11px; font-weight: bold;">📅 Weekly challenges</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%);
                border: 3px solid #2E7D32;
                border-radius: 8px;
                padding: 12px 16px;
                color: white;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 
                    0 4px 0 #2E7D32,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
                position: relative;
                text-shadow: 1px 1px 0px #2E7D32;
            ">
                FREE ENTRY
            </div>
        `;

        // Add 3D button hover effects
        event1.addEventListener('mouseenter', () => {
            event1.style.background = 'linear-gradient(135deg, #F4A460 0%, #E9967A 50%, #F4A460 100%)';
            event1.style.borderColor = '#A0522D';
            event1.style.transform = 'translateY(-3px) scale(1.02)';
            event1.style.boxShadow = '0 8px 16px rgba(139, 69, 19, 0.3)';
            
            // Update button 3D effect on hover
            const button1 = event1.querySelector('div:last-child');
            button1.style.boxShadow = '0 2px 0 #2E7D32, 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            button1.style.transform = 'translateY(2px)';
        });
        event1.addEventListener('mouseleave', () => {
            event1.style.background = 'linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%)';
            event1.style.borderColor = '#8B4513';
            event1.style.transform = 'translateY(0) scale(1)';
            event1.style.boxShadow = '0 4px 0 #8B4513, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            
            // Reset button 3D effect
            const button1 = event1.querySelector('div:last-child');
            button1.style.boxShadow = '0 4px 0 #2E7D32, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            button1.style.transform = 'translateY(0)';
        });

        event2.addEventListener('mouseenter', () => {
            event2.style.background = 'linear-gradient(135deg, #F4A460 0%, #E9967A 50%, #F4A460 100%)';
            event2.style.borderColor = '#A0522D';
            event2.style.transform = 'translateY(-3px) scale(1.02)';
            event2.style.boxShadow = '0 8px 16px rgba(139, 69, 19, 0.3)';
            
            // Update button 3D effect on hover
            const button2 = event2.querySelector('div:last-child');
            button2.style.boxShadow = '0 2px 0 #2E7D32, 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            button2.style.transform = 'translateY(2px)';
        });
        event2.addEventListener('mouseleave', () => {
            event2.style.background = 'linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%)';
            event2.style.borderColor = '#8B4513';
            event2.style.transform = 'translateY(0) scale(1)';
            event2.style.boxShadow = '0 4px 0 #8B4513, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            
            // Reset button 3D effect
            const button2 = event2.querySelector('div:last-child');
            button2.style.boxShadow = '0 4px 0 #2E7D32, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
            button2.style.transform = 'translateY(0)';
        });

        // Add click handlers for events
        event1.addEventListener('click', () => {
            console.log('Fishing Tournament button clicked!');
            this.registerForEvent('fishing_tournament', 'Fishing Tournament');
        });
        event2.addEventListener('click', () => {
            console.log('Community Challenge button clicked!');
            this.registerForEvent('community_challenge', 'Community Challenge');
        });

        // Add simple test button
        const simpleTestButton = document.createElement('button');
        simpleTestButton.textContent = 'Test: Simple Click';
        simpleTestButton.style.cssText = `
            background: linear-gradient(135deg, #E91E63 0%, #F06292 50%, #E91E63 100%);
            color: white;
            border: 2px solid #C2185B;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #C2185B,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        simpleTestButton.addEventListener('click', () => {
            console.log('Simple test button clicked!');
            alert('Button click test successful!');
        });

        // Add debug button to check registrations
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug: Check Registrations';
        debugButton.style.cssText = `
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FF6B6B 100%);
            color: white;
            border: 2px solid #CC5555;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #CC5555,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        debugButton.addEventListener('mouseenter', () => {
            debugButton.style.background = 'linear-gradient(135deg, #FF8E8E 0%, #FFB3B3 50%, #FF8E8E 100%)';
            debugButton.style.transform = 'translateY(-2px)';
            debugButton.style.boxShadow = '0 5px 0 #CC5555, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        debugButton.addEventListener('mouseleave', () => {
            debugButton.style.background = 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FF6B6B 100%)';
            debugButton.style.transform = 'translateY(0)';
            debugButton.style.boxShadow = '0 3px 0 #CC5555, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        debugButton.addEventListener('click', () => {
            console.log('Debug: Checking registrations for both events...');
            this.checkCurrentRegistrations('fishing_tournament');
            this.checkCurrentRegistrations('community_challenge');
            this.showMessage('Check console for registration debug info');
        });

        // Add test registration button
        const testRegButton = document.createElement('button');
        testRegButton.textContent = 'Debug: Add Test Registration';
        testRegButton.style.cssText = `
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%);
            color: white;
            border: 2px solid #388E3C;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #388E3C,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        testRegButton.addEventListener('mouseenter', () => {
            testRegButton.style.background = 'linear-gradient(135deg, #66BB6A 0%, #81C784 50%, #66BB6A 100%)';
            testRegButton.style.transform = 'translateY(-2px)';
            testRegButton.style.boxShadow = '0 5px 0 #388E3C, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        testRegButton.addEventListener('mouseleave', () => {
            testRegButton.style.background = 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #4CAF50 100%)';
            testRegButton.style.transform = 'translateY(0)';
            testRegButton.style.boxShadow = '0 3px 0 #388E3C, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        testRegButton.addEventListener('click', () => {
            console.log('Debug: Adding test registration...');
            this.addTestRegistration('fishing_tournament', 'Fishing Tournament');
        });

        // Add comprehensive test button
        const comprehensiveTestButton = document.createElement('button');
        comprehensiveTestButton.textContent = 'Debug: Comprehensive Firebase Test';
        comprehensiveTestButton.style.cssText = `
            background: linear-gradient(135deg, #2196F3 0%, #42A5F5 50%, #2196F3 100%);
            color: white;
            border: 2px solid #1976D2;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #1976D2,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        comprehensiveTestButton.addEventListener('mouseenter', () => {
            comprehensiveTestButton.style.background = 'linear-gradient(135deg, #42A5F5 0%, #64B5F6 50%, #42A5F5 100%)';
            comprehensiveTestButton.style.transform = 'translateY(-2px)';
            comprehensiveTestButton.style.boxShadow = '0 5px 0 #1976D2, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        comprehensiveTestButton.addEventListener('mouseleave', () => {
            comprehensiveTestButton.style.background = 'linear-gradient(135deg, #2196F3 0%, #42A5F5 50%, #2196F3 100%)';
            comprehensiveTestButton.style.transform = 'translateY(0)';
            comprehensiveTestButton.style.boxShadow = '0 3px 0 #1976D2, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        comprehensiveTestButton.addEventListener('click', () => {
            console.log('Debug: Running comprehensive Firebase test...');
            this.testFirebaseComprehensive();
        });

        // Add rules check button
        const rulesCheckButton = document.createElement('button');
        rulesCheckButton.textContent = 'Debug: Check Firebase Rules';
        rulesCheckButton.style.cssText = `
            background: linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FF9800 100%);
            color: white;
            border: 2px solid #F57C00;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #F57C00,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        rulesCheckButton.addEventListener('mouseenter', () => {
            rulesCheckButton.style.background = 'linear-gradient(135deg, #FFB74D 0%, #FFCC80 50%, #FFB74D 100%)';
            rulesCheckButton.style.transform = 'translateY(-2px)';
            rulesCheckButton.style.boxShadow = '0 5px 0 #F57C00, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        rulesCheckButton.addEventListener('mouseleave', () => {
            rulesCheckButton.style.background = 'linear-gradient(135deg, #FF9800 0%, #FFB74D 50%, #FF9800 100%)';
            rulesCheckButton.style.transform = 'translateY(0)';
            rulesCheckButton.style.boxShadow = '0 3px 0 #F57C00, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        rulesCheckButton.addEventListener('click', () => {
            console.log('Debug: Checking Firebase database rules...');
            this.checkFirebaseRules();
        });

        // Add manual registration trigger button
        const manualRegButton = document.createElement('button');
        manualRegButton.textContent = 'Debug: Trigger Manual Registration';
        manualRegButton.style.cssText = `
            background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #9C27B0 100%);
            color: white;
            border: 2px solid #7B1FA2;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 
                0 3px 0 #7B1FA2,
                0 2px 4px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        `;

        manualRegButton.addEventListener('mouseenter', () => {
            manualRegButton.style.background = 'linear-gradient(135deg, #BA68C8 0%, #CE93D8 50%, #BA68C8 100%)';
            manualRegButton.style.transform = 'translateY(-2px)';
            manualRegButton.style.boxShadow = '0 5px 0 #7B1FA2, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)';
        });

        manualRegButton.addEventListener('mouseleave', () => {
            manualRegButton.style.background = 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #9C27B0 100%)';
            manualRegButton.style.transform = 'translateY(0)';
            manualRegButton.style.boxShadow = '0 3px 0 #7B1FA2, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        manualRegButton.addEventListener('click', () => {
            console.log('Debug: Triggering manual registration...');
            this.triggerManualRegistration();
        });

        // Assemble the modal
        eventsList.appendChild(event1);
        eventsList.appendChild(event2);
        eventsList.appendChild(debugButton);
        eventsList.appendChild(testRegButton);
        eventsList.appendChild(comprehensiveTestButton);
        eventsList.appendChild(rulesCheckButton);
        eventsList.appendChild(manualRegButton);
        eventsList.appendChild(simpleTestButton);
        eventsContainer.appendChild(eventsList);
        overlay.appendChild(eventsContainer);
        document.body.appendChild(overlay);

        // Close modal functionality
        const closeModal = () => {
            safeCloseModal(overlay);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Register for event function
    Scene_Menu.prototype.registerForEvent = function(eventId, eventName) {
        console.log('Attempting to register for event:', eventId, eventName);
        
        const walletAddress = getPlayerWallet();
        console.log('Wallet address:', walletAddress);
        
        if (!walletAddress) {
            console.log('No wallet address found, showing connection message');
            this.showMessage('Please connect your wallet first!');
            return;
        }

        if (!window.firebaseDatabase) {
            console.log('Firebase database not available');
            this.showMessage('Database not available. Please try again later.');
            return;
        }

        // Test Firebase connection first
        this.testFirebaseConnection().then((connectionOk) => {
            if (!connectionOk) {
                console.log('Firebase connection test failed');
                this.showMessage('Database connection failed. Please check your internet connection and try again.');
                return;
            }

            console.log('Firebase connection test passed, proceeding with registration...');
            this.proceedWithRegistration(eventId, eventName, walletAddress);
        }).catch((error) => {
            console.error('Firebase connection test error:', error);
            this.showMessage('Database connection error. Please try again later.');
        });
    };

    // Proceed with registration after connection test
    Scene_Menu.prototype.proceedWithRegistration = function(eventId, eventName, walletAddress) {
        console.log('Checking if already registered...');
        // Check if already registered
        const registrationRef = window.firebaseRef(window.firebaseDatabase, `event_registrations/${eventId}/${walletAddress}`);
        
        window.firebaseGet(registrationRef).then((snapshot) => {
            console.log('Registration check result:', snapshot.exists());
            if (snapshot.exists()) {
                this.showMessage(`You are already registered for ${eventName}!`);
            } else {
                console.log('Not registered, proceeding with registration...');
                // Register the user
                const registrationData = {
                    walletAddress: walletAddress,
                    eventId: eventId,
                    eventName: eventName,
                    registrationDate: new Date().toISOString(),
                    playerName: getPlayerName() || 'Anonymous'
                };

                console.log('Registration data:', registrationData);

                // Try the main path first
                window.firebaseSet(registrationRef, registrationData).then(() => {
                    console.log('Registration successful!');
                    this.showMessage(`Successfully registered for ${eventName}!`);
                    // Show the registration board after a short delay
                    setTimeout(() => {
                        this.showRegistrationBoard(eventId, eventName);
                    }, 1000);
                }).catch((error) => {
                    console.error('Registration error on main path:', error);
                    
                    // Try alternative path if main path fails
                    console.log('Trying alternative registration path...');
                    const altRegistrationRef = window.firebaseRef(window.firebaseDatabase, `registrations/${eventId}/${walletAddress}`);
                    
                    window.firebaseSet(altRegistrationRef, registrationData).then(() => {
                        console.log('Registration successful on alternative path!');
                        this.showMessage(`Successfully registered for ${eventName}!`);
                        // Show the registration board after a short delay
                        setTimeout(() => {
                            this.showRegistrationBoard(eventId, eventName);
                        }, 1000);
                    }).catch((altError) => {
                        console.error('Registration error on alternative path:', altError);
                        
                        // Try leaderboard path as last resort
                        console.log('Trying leaderboard path as last resort...');
                        const leaderboardRegRef = window.firebaseRef(window.firebaseDatabase, `leaderboard/event_registrations/${eventId}/${walletAddress}`);
                        
                        window.firebaseSet(leaderboardRegRef, registrationData).then(() => {
                            console.log('Registration successful on leaderboard path!');
                            this.showMessage(`Successfully registered for ${eventName}!`);
                            // Show the registration board after a short delay
                            setTimeout(() => {
                                this.showRegistrationBoard(eventId, eventName);
                            }, 1000);
                        }).catch((leaderboardError) => {
                            console.error('Registration error on all paths:', leaderboardError);
                            this.showMessage('Registration failed. Please try again or contact support.');
                        });
                    });
                });
            }
        }).catch((error) => {
            console.error('Check registration error:', error);
            this.showMessage('Unable to check registration status. Please try again.');
        });
    };

    // Show message function
    Scene_Menu.prototype.showMessage = function(message) {
        // Create message overlay
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

        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            padding: 30px;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
            text-align: center;
            max-width: 400px;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
        `;

        messageContainer.innerHTML = `
            <h3 style="color: #8B4513; margin: 0 0 20px 0; font-size: 20px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3; border-bottom: 2px solid #8B4513; padding-bottom: 10px;">Event Registration</h3>
            <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #2F4F2F; font-weight: bold;">${message}</p>
            <button id="closeMessage" style="
                background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                color: white;
                border: 2px solid #654321;
                padding: 12px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 
                    0 3px 0 #654321,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.2);
                transition: all 0.2s ease;
            ">OK</button>
        `;

        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);

        // Close functionality
        const closeMessage = () => {
            safeCloseModal(overlay);
        };

        // Add hover effects to the OK button
        const closeButton = document.getElementById('closeMessage');
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            closeButton.style.transform = 'translateY(-1px)';
            closeButton.style.boxShadow = '0 4px 0 #654321, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            closeButton.style.transform = 'translateY(0)';
            closeButton.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });

        closeButton.addEventListener('click', closeMessage);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeMessage();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeMessage();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Show registration board function
    Scene_Menu.prototype.showRegistrationBoard = function(eventId, eventName) {
        console.log('Showing registration board for:', eventId, eventName);
        
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

        // Create board container with 3D style
        const boardContainer = document.createElement('div');
        boardContainer.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            padding: 30px;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
        `;

        // Create title with 3D style
        const title = document.createElement('h2');
        title.textContent = `${eventName} - Registered Participants`;
        title.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            color: #8B4513;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 1px 1px 0px #F5DEB3;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 10px;
        `;

        // Create loading message with 3D style
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: #8B4513; font-size: 18px; font-weight: bold;">Loading registrations...</p>
            </div>
        `;

        boardContainer.appendChild(title);
        boardContainer.appendChild(loadingDiv);
        overlay.appendChild(boardContainer);
        document.body.appendChild(overlay);

        // Try multiple paths to get registrations
        const registrationPaths = [
            `event_registrations/${eventId}`,
            `registrations/${eventId}`,
            `leaderboard/event_registrations/${eventId}`
        ];

        let registrationsFound = false;
        let allRegistrations = [];

        const checkPath = (pathIndex) => {
            if (pathIndex >= registrationPaths.length) {
                // All paths checked, show results
                console.log('All paths checked, total registrations found:', allRegistrations.length);
                loadingDiv.innerHTML = this.createRegistrationList(allRegistrations, eventName);
                return;
            }

            const path = registrationPaths[pathIndex];
            console.log(`Checking registrations from path: ${path}`);
            
            const registrationsRef = window.firebaseRef(window.firebaseDatabase, path);
            
            window.firebaseGet(registrationsRef).then((snapshot) => {
                console.log(`Firebase snapshot for ${path}:`, snapshot.val());
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        console.log('Registration data from', path, ':', data);
                        allRegistrations.push(data);
                    });
                    registrationsFound = true;
                }
                
                // Check next path
                checkPath(pathIndex + 1);
            }).catch((error) => {
                console.error(`Error fetching registrations from ${path}:`, error);
                // Check next path even if this one failed
                checkPath(pathIndex + 1);
            });
        };

        // Start checking paths
        checkPath(0);

        // Close functionality
        const closeBoard = () => {
            safeCloseModal(overlay);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeBoard();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeBoard();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Create registration list HTML with 3D style
    Scene_Menu.prototype.createRegistrationList = function(registrations, eventName) {
        if (registrations.length === 0) {
            return `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #8B4513; font-size: 16px; font-weight: bold;">No registrations yet for ${eventName}</p>
                    <p style="color: #A0522D; font-size: 14px; margin-top: 10px;">Be the first to register!</p>
                </div>
            `;
        }

        let html = `
            <div style="max-height: 400px; overflow-y: auto; border: 2px solid #8B4513; border-radius: 8px; padding: 15px; background: rgba(255,255,255,0.1);">
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #8B4513;">
                    <p style="color: #8B4513; font-weight: bold; margin: 0; text-align: center; font-size: 16px;">
                        Event Participants: ${registrations.length}
                    </p>
                </div>
        `;

        registrations.forEach((registration, index) => {
            const date = new Date(registration.registrationDate);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            html += `
                <div style="
                    background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                    border: 2px solid #8B4513;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 
                        0 2px 0 #8B4513,
                        0 1px 3px rgba(0,0,0,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.2);
                ">
                    <div>
                        <div style="color: #8B4513; font-weight: bold; margin-bottom: 5px; font-size: 14px;">
                            #${index + 1} - ${registration.playerName || 'Anonymous'}
                        </div>
                        <div style="color: #A0522D; font-size: 11px; font-family: monospace;">
                            ${registration.walletAddress && typeof registration.walletAddress === 'string' && registration.walletAddress.length >= 10 ? 
                                registration.walletAddress.substring(0, 6) + '...' + registration.walletAddress.substring(registration.walletAddress.length - 4) : 
                                'Unknown'}
                        </div>
                    </div>
                    <div style="color: #8B4513; font-size: 11px; text-align: right; font-weight: bold;">
                        ${formattedDate}
                    </div>
                </div>
            `;
        });

        html += '</div>';

        return html;
    };

    // Show all participants modal
    Scene_Menu.prototype.showAllParticipantsModal = function() {
        console.log('Showing all participants modal');
        
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

        // Create container with 3D style
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            max-width: 95%;
            max-height: 95%;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            border: 3px solid #8B4513;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            padding: 30px;
            color: #2F4F2F;
            font-family: Arial, sans-serif;
        `;

        // Create title with 3D style
        const title = document.createElement('h2');
        title.textContent = 'Event Participants';
        title.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            color: #8B4513;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 1px 1px 0px #F5DEB3;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 10px;
        `;

        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.style.cssText = `
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid #8B4513;
        `;

        // Create tabs
        const fishingTab = document.createElement('button');
        fishingTab.textContent = 'Fishing Tournament';
        fishingTab.className = 'registration-tab';
        fishingTab.setAttribute('data-event-id', 'fishing_tournament');
        fishingTab.style.cssText = `
            flex: 1;
            padding: 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            border: none;
            border-bottom: 3px solid #654321;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s ease;
        `;

        const challengeTab = document.createElement('button');
        challengeTab.textContent = 'Community Challenge';
        challengeTab.className = 'registration-tab';
        challengeTab.setAttribute('data-event-id', 'community_challenge');
        challengeTab.style.cssText = `
            flex: 1;
            padding: 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.2s ease;
        `;

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.id = 'all-participants-content';
        contentContainer.style.cssText = `
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
        `;

        // Add elements to container
        container.appendChild(title);
        tabsContainer.appendChild(fishingTab);
        tabsContainer.appendChild(challengeTab);
        container.appendChild(tabsContainer);
        container.appendChild(contentContainer);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Tab click handlers
        fishingTab.addEventListener('click', () => {
            this.switchAllParticipantsTab('fishing_tournament', 'Fishing Tournament', contentContainer);
        });

        challengeTab.addEventListener('click', () => {
            this.switchAllParticipantsTab('community_challenge', 'Community Challenge', contentContainer);
        });

        // Load first tab by default
        this.switchAllParticipantsTab('fishing_tournament', 'Fishing Tournament', contentContainer);

        // Close functionality
        const closeModal = () => {
            document.body.removeChild(overlay);
        };

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Close with ESC key
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    };

    // Switch all participants tab
    Scene_Menu.prototype.switchAllParticipantsTab = function(eventId, eventName, contentContainer) {
        // Update active tab
        document.querySelectorAll('.registration-tab').forEach(tab => {
            tab.style.borderBottomColor = 'transparent';
            tab.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            tab.style.color = 'white';
        });
        
        const activeTab = document.querySelector(`[data-event-id="${eventId}"]`);
        if (activeTab) {
            activeTab.style.borderBottomColor = '#654321';
            activeTab.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            activeTab.style.color = 'white';
        }

        // Show loading
        contentContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: #8B4513; font-size: 18px; font-weight: bold;">Loading ${eventName} registrations...</p>
            </div>
        `;

        // Get registrations from Firebase using the HTML function
        if (typeof window.showRegistrationBoard === 'function') {
            // Use the HTML function to get registrations
            this.loadRegistrationsForTab(eventId, eventName, contentContainer);
        } else {
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #8B4513; font-size: 18px; font-weight: bold;">Registration system not available</p>
                </div>
            `;
        }
    };

    // Load registrations for tab
    Scene_Menu.prototype.loadRegistrationsForTab = function(eventId, eventName, contentContainer) {
        if (!window.firebaseDatabase) {
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #8B4513; font-size: 18px; font-weight: bold;">Database not available</p>
                </div>
            `;
            return;
        }

        // Try multiple paths to get registrations
        const registrationPaths = [
            `event_registrations/${eventId}`,
            `registrations/${eventId}`,
            `leaderboard/event_registrations/${eventId}`
        ];

        let allRegistrations = [];

        const checkPath = (pathIndex) => {
            if (pathIndex >= registrationPaths.length) {
                // All paths checked, show results
                console.log('All paths checked, total registrations found:', allRegistrations.length);
                this.updateAllParticipantsContent(allRegistrations, eventName, contentContainer);
                return;
            }

            const path = registrationPaths[pathIndex];
            console.log(`Checking registrations from path: ${path}`);
            
            const registrationsRef = window.firebaseRef(window.firebaseDatabase, path);
            
            window.firebaseGet(registrationsRef).then((snapshot) => {
                console.log(`Firebase snapshot for ${path}:`, snapshot.val());
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const data = childSnapshot.val();
                        console.log('Registration data from', path, ':', data);
                        allRegistrations.push(data);
                    });
                }
                
                // Check next path
                checkPath(pathIndex + 1);
            }).catch((error) => {
                console.error(`Error fetching registrations from ${path}:`, error);
                // Check next path even if this one failed
                checkPath(pathIndex + 1);
            });
        };

        // Start checking paths
        checkPath(0);
    };

    // Update all participants content
    Scene_Menu.prototype.updateAllParticipantsContent = function(registrations, eventName, contentContainer) {
        if (registrations.length === 0) {
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: #8B4513; font-size: 16px; font-weight: bold;">No registrations yet for ${eventName}</p>
                    <p style="color: #A0522D; font-size: 14px; margin-top: 10px;">Be the first to register!</p>
                </div>
            `;
            return;
        }

        // Sort by registration date
        registrations.sort((a, b) => new Date(a.registrationDate) - new Date(b.registrationDate));

        let html = `
            <div style="max-height: 400px; overflow-y: auto; border: 2px solid #8B4513; border-radius: 8px; padding: 15px; background: rgba(255,255,255,0.1);">
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #8B4513;">
                    <p style="color: #8B4513; font-weight: bold; margin: 0; text-align: center; font-size: 16px;">
                        Event Participants: ${registrations.length}
                    </p>
                </div>
        `;

        registrations.forEach((registration, index) => {
            const date = new Date(registration.registrationDate);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            html += `
                <div style="
                    background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                    border: 2px solid #8B4513;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 
                        0 2px 0 #8B4513,
                        0 1px 3px rgba(0,0,0,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.2);
                ">
                    <div>
                        <div style="color: #8B4513; font-weight: bold; margin-bottom: 5px; font-size: 14px;">
                            #${index + 1} - ${registration.playerName || 'Anonymous'}
                        </div>
                        <div style="color: #A0522D; font-size: 11px; font-family: monospace;">
                            ${registration.walletAddress && typeof registration.walletAddress === 'string' && registration.walletAddress.length >= 10 ? 
                                registration.walletAddress.substring(0, 6) + '...' + registration.walletAddress.substring(registration.walletAddress.length - 4) : 
                                'Unknown'}
                        </div>
                    </div>
                    <div style="color: #8B4513; font-size: 11px; text-align: right; font-weight: bold;">
                        ${formattedDate}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        contentContainer.innerHTML = html;
    };

    // Create leaderboard display
    function createLeaderboard() {
        const leaderboard = document.createElement('div');
        leaderboard.id = 'leaderboard';
        leaderboard.style.cssText = `
            position: fixed;
            top: 150px;
            left: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            color: #2F4F2F;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            backdrop-filter: blur(15px);
            border: 3px solid #8B4513;
            min-width: 300px;
            max-width: 350px;
            height: auto;
            overflow: visible;
        `;
        
        return leaderboard;
    }

    // Create tabs for fish types
    function createTabs() {
        const tabs = document.createElement('div');
        tabs.id = 'leaderboard-tabs';
        tabs.style.cssText = `
            display: flex;
            margin-bottom: 16px;
            border-bottom: 2px solid #8B4513;
        `;
        
        const fishTypes = [
            { id: 'mackerel', name: 'Mackerel', icon: 'img/pictures/Mackerel.png' },
            { id: 'salmon', name: 'Salmon', icon: 'img/pictures/Salmon.png' },
            { id: 'trout', name: 'Trout', icon: 'img/pictures/Trout.png' },
            { id: 'bigcoin', name: 'Bigcoin', icon: 'img/pictures/bigcoin.png' }
        ];
        
        fishTypes.forEach((fish, index) => {
            const tab = document.createElement('div');
            tab.className = 'leaderboard-tab';
            tab.dataset.fishType = fish.id;
            tab.style.cssText = `
                flex: 1;
                padding: 8px 12px;
                text-align: center;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                font-size: 12px;
                font-weight: bold;
            `;
            
            tab.innerHTML = `
                <img src="${fish.icon}?v=1" style="width: 20px; height: 20px; object-fit: contain; margin-bottom: 4px;" alt="${fish.name}">
                <div>${fish.name}</div>
            `;
            
            tab.addEventListener('click', () => switchTab(fish.id));
            tabs.appendChild(tab);
        });
        
        return tabs;
    }

    // Switch between tabs
    function switchTab(fishType) {
        // Update active tab
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.style.borderBottomColor = 'transparent';
            tab.style.backgroundColor = 'transparent';
            tab.style.color = '#8B4513';
        });
        
        const activeTab = document.querySelector(`[data-fish-type="${fishType}"]`);
        if (activeTab) {
            activeTab.style.borderBottomColor = '#8B4513';
            activeTab.style.backgroundColor = 'rgba(139, 69, 19, 0.2)';
            activeTab.style.color = '#8B4513';
        }
        
        // Update leaderboard content
        updateLeaderboardContent(fishType);
    }

    // Wallet connection variables
    let connectedWallet = null;
    let playerName = null;

    // Safe access to game variables
    function getGameVariable(index) {
        try {
            if (typeof $gameVariables !== 'undefined' && $gameVariables) {
                return $gameVariables.value(index);
            }
        } catch (error) {
            console.log('game variables not available yet');
        }
        return null;
    }

    // Safe set game variable
    function setGameVariable(index, value) {
        try {
            if (typeof $gameVariables !== 'undefined' && $gameVariables) {
                $gameVariables.setValue(index, value);
                return true;
            }
        } catch (error) {
            console.log('cannot set game variable yet');
        }
        return false;
    }

        // Connect wallet function
    async function connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                connectedWallet = accounts[0];
                playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
                
                console.log('wallet connected:', connectedWallet);
                
                // Store in game variables if available
                setGameVariable(1, connectedWallet);
                setGameVariable(2, playerName);
                
                // Store in localStorage as backup
                localStorage.setItem('fishingGameWallet', connectedWallet);
                localStorage.setItem('fishingGamePlayerName', playerName);
                
                // Update leaderboard display
                updateLeaderboardDisplay();
                // Sync fish from firebase for this wallet
                try { await syncFishFromFirebase(); } catch (e) { console.log('sync on connect failed'); }
                
                // Trigger wallet connected event to reset fishing system
                if (window.resetFishingSystem) {
                    console.log('triggering fishing system reset after wallet connection');
                    window.resetFishingSystem();
                }
                
                // Dispatch custom event for wallet connection
                window.dispatchEvent(new CustomEvent('walletConnected', { detail: { wallet: connectedWallet } }));
             
                return connectedWallet;
                            } else {
                    console.log('metamask not detected');
                    // Fallback: ask user to enter wallet manually
                    const manualWallet = prompt('MetaMask not detected. Please enter your wallet address:');
                    if (manualWallet && manualWallet.startsWith('0x') && manualWallet.length === 42) {
                        connectedWallet = manualWallet;
                        playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
                        
                        // Store in game variables if available
                        setGameVariable(1, connectedWallet);
                        setGameVariable(2, playerName);
                        
                        // Store in localStorage as backup
                        localStorage.setItem('fishingGameWallet', connectedWallet);
                        localStorage.setItem('fishingGamePlayerName', playerName);
                        
                        updateLeaderboardDisplay();
                        // Sync fish from firebase for this wallet (manual connect)
                        try { await syncFishFromFirebase(); } catch (e) { console.log('sync on manual connect failed'); }
                        
                        // Trigger wallet connected event to reset fishing system
                        if (window.resetFishingSystem) {
                            console.log('triggering fishing system reset after manual wallet connection');
                            window.resetFishingSystem();
                        }
                        
                        // Dispatch custom event for wallet connection
                        window.dispatchEvent(new CustomEvent('walletConnected', { detail: { wallet: connectedWallet } }));
                        
                        return connectedWallet;
                } else {
                    alert('invalid wallet address format');
                    return null;
                }
            }
        } catch (error) {
            console.error('error connecting wallet:', error);
            return null;
        }
    }

    // Get connected wallet
    function getPlayerWallet() {
        // First, check if there's a current MetaMask account that might be different
        if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
            const currentAddress = window.ethereum.selectedAddress;
            if (currentAddress && typeof currentAddress === 'string' && currentAddress.length >= 10) {
                // Update connected wallet if it's different
                if (connectedWallet !== currentAddress) {
                    console.log('detected wallet change from', connectedWallet, 'to', currentAddress);
                    connectedWallet = currentAddress;
                    playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
                    
                    // Store in game variables if available
                    setGameVariable(1, connectedWallet);
                    setGameVariable(2, playerName);
                    
                    // Store in localStorage as backup
                    localStorage.setItem('fishingGameWallet', connectedWallet);
                    localStorage.setItem('fishingGamePlayerName', playerName);
                    
                    // Trigger wallet connected event to reset fishing system
                    if (window.resetFishingSystem) {
                        console.log('triggering fishing system reset after wallet change detection');
                        window.resetFishingSystem();
                    }
                    
                    // Dispatch custom event for wallet connection
                    window.dispatchEvent(new CustomEvent('walletConnected', { detail: { wallet: connectedWallet } }));
                }
                return connectedWallet;
            }
        }
        
        // If we have a connected wallet, return it
        if (connectedWallet && typeof connectedWallet === 'string' && connectedWallet.length >= 10) {
            return connectedWallet;
        }
        
        // Check if wallet was stored in game variables
        const gameWallet = getGameVariable(1);
        if (gameWallet && typeof gameWallet === 'string' && gameWallet.length >= 10) {
            connectedWallet = gameWallet;
            playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
            
            // Reset fishing system when wallet is loaded from game variables
            setTimeout(() => {
                if (window.resetFishingSystem) {
                    console.log('resetting fishing system after loading wallet from game variables');
                    window.resetFishingSystem();
                }
            }, 100);
            
            return connectedWallet;
        }
        
        // Check localStorage as backup
        const storedWallet = localStorage.getItem('fishingGameWallet');
        if (storedWallet && typeof storedWallet === 'string' && storedWallet.length >= 10) {
            connectedWallet = storedWallet;
            playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
            
            // Reset fishing system when wallet is loaded from localStorage
            setTimeout(() => {
                if (window.resetFishingSystem) {
                    console.log('resetting fishing system after loading wallet from localStorage');
                    window.resetFishingSystem();
                }
            }, 100);
            
            return connectedWallet;
        }
        
        // No wallet connected, return null to trigger connection
        return null;
    }

    // Make getPlayerWallet available globally
    window.getPlayerWallet = getPlayerWallet;

    // Sync fish counts from Firebase into local inventory for the connected wallet
    async function syncFishFromFirebase() {
        try {
            if (!window.firebaseDatabase) {
                console.log('firebase database not available, cannot sync fish');
                return;
            }
            let walletAddress = getPlayerWallet();
            if (!walletAddress) {
                walletAddress = await connectWallet();
                if (!walletAddress) return;
            }

            const fishTypes = [
                { key: 'mackerel', itemId: 3 },
                { key: 'salmon',   itemId: 4 },
                { key: 'trout',    itemId: 5 },
                { key: 'bigcoin',  itemId: 6 },
            ];

            const snapshots = await Promise.all(
                fishTypes.map(ft => window.firebaseGet(window.firebaseRef(window.firebaseDatabase, `leaderboard/${ft.key}/${walletAddress}`)))
            );

            const setItemCountExact = (itemId, desiredCount) => {
                const item = $dataItems && $dataItems[itemId];
                if (!item) return;
                const currentCount = $gameParty.numItems(item) || 0;
                const diff = (desiredCount || 0) - currentCount;
                if (diff > 0) $gameParty.gainItem(item, diff);
                if (diff < 0) $gameParty.loseItem(item, -diff, false);
            };

            snapshots.forEach((snap, index) => {
                const ft = fishTypes[index];
                // only apply if there is data for this wallet/fish; do not overwrite to 0
                if (snap && typeof snap.val === 'function' && snap.exists()) {
                    const val = snap.val();
                    const count = (val && typeof val.count === 'number') ? val.count : 0;
                    setItemCountExact(ft.itemId, count);
                }
            });

            // refresh ui and leaderboard after sync
            try { updateFishCounterDisplay(); } catch (e) {}
            try { updateLeaderboardDisplay(); } catch (e) {}
        } catch (error) {
            console.error('error syncing fish from firebase:', error);
        }
    }
    window.syncFishFromFirebase = syncFishFromFirebase;

    // Listen for MetaMask account changes
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts.length > 0) {
                console.log('MetaMask account changed to:', accounts[0]);
                connectedWallet = accounts[0];
                playerName = connectedWallet.substring(0, 6) + '...' + connectedWallet.substring(connectedWallet.length - 4);
                
                // Store in game variables if available
                setGameVariable(1, connectedWallet);
                setGameVariable(2, playerName);
                
                // Store in localStorage as backup
                localStorage.setItem('fishingGameWallet', connectedWallet);
                localStorage.setItem('fishingGamePlayerName', playerName);
                
                // Update leaderboard display
                updateLeaderboardDisplay();
                
                // Trigger wallet connected event to reset fishing system
                if (window.resetFishingSystem) {
                    console.log('triggering fishing system reset after MetaMask account change');
                    window.resetFishingSystem();
                }
                
                // Dispatch custom event for wallet connection
                window.dispatchEvent(new CustomEvent('walletConnected', { detail: { wallet: connectedWallet } }));
            } else {
                console.log('MetaMask account disconnected');
                connectedWallet = null;
                playerName = null;
                
                // Clear stored data
                setGameVariable(1, '');
                setGameVariable(2, '');
                localStorage.removeItem('fishingGameWallet');
                localStorage.removeItem('fishingGamePlayerName');
                
                // Update leaderboard display
                updateLeaderboardDisplay();
            }
        });
    }

    // Get player name
    function getPlayerName() {
        if (playerName) {
            return playerName;
        }
        
        // Check if name was stored in game variables
        const gameName = getGameVariable(2);
        if (gameName) {
            playerName = gameName;
            return playerName;
        }
        
        // Check localStorage as backup
        const storedName = localStorage.getItem('fishingGamePlayerName');
        if (storedName) {
            playerName = storedName;
            return playerName;
        }
        
        // No name available
        return 'unknown player';
    }

    // Update player score in Firebase
    async function updatePlayerScore() {
        if (!window.firebaseDatabase) {
            console.log('firebase database not available');
            return;
        }
        
        // Get wallet - if not connected, try to connect
        let walletAddress = getPlayerWallet();
        if (!walletAddress) {
            console.log('no wallet connected, attempting to connect...');
            walletAddress = await connectWallet();
            if (!walletAddress) {
                console.log('wallet connection failed, cannot update scores');
                return;
            }
        }
        
        // Get current fish counts from the game
        const mackerelCount = $gameParty.numItems($dataItems[3]) || 0;
        const salmonCount = $gameParty.numItems($dataItems[4]) || 0;
        const troutCount = $gameParty.numItems($dataItems[5]) || 0;
        const bigcoinCount = $gameParty.numItems($dataItems[6]) || 0;
        
        const playerDisplayName = getPlayerName();
        
        console.log('updating scores for wallet:', walletAddress);
        console.log('fish counts - mackerel:', mackerelCount, 'salmon:', salmonCount, 'trout:', troutCount, 'bigcoin:', bigcoinCount);
        
        // Update each fish type only if you have any of that fish
        const fishData = {
            mackerel: mackerelCount,
            salmon: salmonCount,
            trout: troutCount,
            bigcoin: bigcoinCount
        };
        
        Object.keys(fishData).forEach(fishType => {
            const count = fishData[fishType];
            
            if (count > 0) {
                const scoreData = {
                    playerName: playerDisplayName,
                    count: count,
                    timestamp: Date.now(),
                    walletAddress: walletAddress
                };
                
                console.log('updating', fishType, 'with count:', count, 'for wallet:', walletAddress);
                
                // Use wallet address as the key to prevent duplicates
                const leaderboardRef = window.firebaseRef(window.firebaseDatabase, `leaderboard/${fishType}/${walletAddress}`);
                window.firebaseSet(leaderboardRef, scoreData).then(() => {
                    console.log(fishType + ' score updated successfully for', walletAddress);
                }).catch((error) => {
                    console.error('error updating ' + fishType + ' score:', error);
                });
            } else {
                // If count is 0, remove from leaderboard
                const leaderboardRef = window.firebaseRef(window.firebaseDatabase, `leaderboard/${fishType}/${walletAddress}`);
                window.firebaseSet(leaderboardRef, null).then(() => {
                    console.log(fishType + ' entry removed (count is 0) for', walletAddress);
                }).catch((error) => {
                    console.error('error removing ' + fishType + ' entry:', error);
                });
            }
        });
    }

    // Update leaderboard content for specific fish type
    function updateLeaderboardContent(fishType) {
        const content = document.getElementById('leaderboard-content');
        if (!content) return;
        
        content.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
        
        // Get current player's fish counts
        const mackerelCount = $gameParty.numItems($dataItems[3]) || 0;
        const salmonCount = $gameParty.numItems($dataItems[4]) || 0;
        const troutCount = $gameParty.numItems($dataItems[5]) || 0;
        const bigcoinCount = $gameParty.numItems($dataItems[6]) || 0;
        
        // Get leaderboard data from Firebase
        const leaderboardRef = window.firebaseRef(window.firebaseDatabase, `leaderboard/${fishType}`);
        
        window.firebaseOnValue(leaderboardRef, (snapshot) => {
            const data = snapshot.val();
            let html = '';
            
            // Add current player's stats at the top
            const currentPlayerCount = fishType === 'mackerel' ? mackerelCount : 
                                     fishType === 'salmon' ? salmonCount :
                                     fishType === 'trout' ? troutCount :
                                     fishType === 'bigcoin' ? bigcoinCount : 0;
            
            if (currentPlayerCount > 0) {
                html += `
                    <div style="margin-bottom: 16px; padding: 12px; background: rgba(76, 175, 80, 0.2); border-radius: 8px; border: 2px solid #4CAF50;">
                        <div style="font-weight: bold; font-size: 14px; color: #4CAF50; margin-bottom: 4px;">Your Stats</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 14px;">Your ${fishType.charAt(0).toUpperCase() + fishType.slice(1)}</div>
                            <div style="font-size: 18px; font-weight: bold; color: #4CAF50;">${currentPlayerCount}</div>
                        </div>
                    </div>
                `;
            }
            
            if (data) {
                // Convert to array and sort by count
                const entries = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value
                })).sort((a, b) => b.count - a.count);
                
                console.log('leaderboard data for', fishType, ':', entries);
                
                // Show top 10
                entries.slice(0, 10).forEach((entry, index) => {
                    const rank = index + 1;
                    const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#4CAF50';
                    
                    // Format wallet address for display
                    const walletDisplay = entry.walletAddress && typeof entry.walletAddress === 'string' && entry.walletAddress.length >= 10 ? 
                        entry.walletAddress.substring(0, 6) + '...' + entry.walletAddress.substring(entry.walletAddress.length - 4) : 
                        'Unknown';
                    
                    html += `
                        <div style="margin: 8px 0; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center;">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${rankColor}; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; font-size: 12px;">
                                    ${rank}
                                </div>
                                <div>
                                    <div style="font-weight: bold; font-size: 14px;">${entry.playerName || 'Anonymous'}</div>
                                    <div style="font-size: 12px; opacity: 0.7; color: #4CAF50;">${walletDisplay}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 18px; font-weight: bold; color: #4CAF50;">${entry.count}</div>
                                <div style="font-size: 10px; opacity: 0.7;">fish</div>
                            </div>
                        </div>
                    `;
                });
                
                if (entries.length === 0) {
                    html += '<div style="text-align: center; padding: 20px; opacity: 0.7;">No data yet</div>';
                }
            } else {
                html += '<div style="text-align: center; padding: 20px; opacity: 0.7;">No data yet</div>';
            }
            
            content.innerHTML = html;
        });
    }

    // Update leaderboard display
    function updateLeaderboardDisplay() {
        let leaderboard = document.getElementById('leaderboard');
        if (!leaderboard) {
            leaderboard = createLeaderboard();
            document.body.appendChild(leaderboard);
            
            // Add title
            const title = document.createElement('div');
            title.style.cssText = `
                margin-bottom: 16px;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                color: #8B4513;
                text-shadow: 1px 1px 0px #F5DEB3;
                border-bottom: 2px solid #8B4513;
                padding-bottom: 8px;
            `;
            title.textContent = 'Global Leaderboard';
            leaderboard.appendChild(title);
            
            // Add wallet connection status and buttons
            const walletSection = document.createElement('div');
            walletSection.id = 'wallet-section';
            walletSection.style.cssText = `margin-bottom: 16px;`;
            
            const walletAddress = getPlayerWallet();
            if (walletAddress && typeof walletAddress === 'string') {
                walletSection.innerHTML = `
                    <div style="padding: 8px; background: rgba(76, 175, 80, 0.2); border-radius: 6px; font-size: 12px;">
                        <div style="color: #4CAF50; font-weight: bold;">Wallet Connected</div>
                        <div style="opacity: 0.8;">${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}</div>
                    </div>
                `;
            } else {
                // Add connect wallet button styled like our modals
                const connectButton = document.createElement('button');
                connectButton.textContent = 'Connect Wallet';
                connectButton.style.cssText = `
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                    color: white;
                    border: 2px solid #654321;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: bold;
                    width: 100%;
                    box-shadow: 0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                `;
                connectButton.addEventListener('mouseenter', () => {
                    connectButton.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
                    connectButton.style.transform = 'translateY(-1px)';
                    connectButton.style.boxShadow = '0 4px 0 #654321, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                });
                connectButton.addEventListener('mouseleave', () => {
                    connectButton.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
                    connectButton.style.transform = 'translateY(0)';
                    connectButton.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                });
                connectButton.addEventListener('click', async () => {
                    console.log('connect wallet clicked');
                    const wallet = await connectWallet();
                    if (wallet) {
                        // Refresh leaderboard display
                        updateLeaderboardDisplay();
                    }
                });
                walletSection.appendChild(connectButton);
            }
            
            leaderboard.appendChild(walletSection);
            
            // Add tabs
            const tabs = createTabs();
            leaderboard.appendChild(tabs);
            
            // Add content container
            const content = document.createElement('div');
            content.id = 'leaderboard-content';
            leaderboard.appendChild(content);
            
            // Set default tab
            switchTab('mackerel');
        }
    }

    // Expose key update functions globally so other plugins (e.g., fishing minigame) can trigger UI/leaderboard refreshes after awarding items
    window.updateFishCounterDisplay = updateFishCounterDisplay;
    window.updateLeaderboardDisplay = updateLeaderboardDisplay;
    window.updatePlayerScore = updatePlayerScore;

    // Create fish counter display
    function createFishCounter() {
        const counter = document.createElement('div');
        counter.id = 'fish-counter';
        counter.style.cssText = `
            position: fixed;
            top: 150px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            color: #2F4F2F;
            padding: 16px 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 
                0 6px 0 #8B4513,
                0 4px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            backdrop-filter: blur(15px);
            border: 3px solid #8B4513;
            min-width: 280px;
            max-width: 320px;
        `;
        
        return counter;
    }

    // Update fish counter display
    function updateFishCounterDisplay() {
        let counter = document.getElementById('fish-counter');
        if (!counter) {
            counter = createFishCounter();
            document.body.appendChild(counter);
        }

        // Get fish counts
        const mackerelCount = $gameParty.numItems($dataItems[3]) || 0;
        const salmonCount = $gameParty.numItems($dataItems[4]) || 0;
        const troutCount = $gameParty.numItems($dataItems[5]) || 0;
        const bigcoinCount = $gameParty.numItems($dataItems[6]) || 0;

        // Create display content
        let content = `
            <div style="margin-bottom: 12px; font-size: 18px; font-weight: bold; text-align: center; color: #8B4513; text-shadow: 1px 1px 0px #F5DEB3; border-bottom: 2px solid #8B4513; padding-bottom: 8px;">
                Fish Collection
            </div>
        `;

        if (mackerelCount > 0) {
            content += `
                <div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%); border: 2px solid #8B4513; border-radius: 8px; box-shadow: 0 2px 0 #8B4513, 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);">
                    <div style="display: flex; align-items: center;">
                        <img src="img/pictures/Mackerel.png" style="width: 32px; height: 32px; object-fit: contain; margin-right: 12px;" alt="Mackerel">
                        <span style="font-size: 16px; color: #8B4513; font-weight: bold;">Mackerel</span>
                    </div>
                    <span style="font-size: 18px; font-weight: bold; color: #8B4513;">${mackerelCount}</span>
                </div>
            `;
        }

        if (salmonCount > 0) {
            content += `
                <div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%); border: 2px solid #8B4513; border-radius: 8px; box-shadow: 0 2px 0 #8B4513, 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);">
                    <div style="display: flex; align-items: center;">
                        <img src="img/pictures/Salmon.png" style="width: 32px; height: 32px; object-fit: contain; margin-right: 12px;" alt="Salmon">
                        <span style="font-size: 16px; color: #8B4513; font-weight: bold;">Salmon</span>
                    </div>
                    <span style="font-size: 18px; font-weight: bold; color: #8B4513;">${salmonCount}</span>
                </div>
            `;
        }

        if (troutCount > 0) {
            content += `
                <div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%); border: 2px solid #8B4513; border-radius: 8px; box-shadow: 0 2px 0 #8B4513, 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);">
                    <div style="display: flex; align-items: center;">
                        <img src="img/pictures/Trout.png" style="width: 32px; height: 32px; object-fit: contain; margin-right: 12px;" alt="Trout">
                        <span style="font-size: 16px; color: #8B4513; font-weight: bold;">Trout</span>
                    </div>
                    <span style="font-size: 18px; font-weight: bold; color: #8B4513;">${troutCount}</span>
                </div>
            `;
        }

        if (bigcoinCount > 0) {
            content += `
                <div style="margin: 8px 0; display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%); border: 2px solid #8B4513; border-radius: 8px; box-shadow: 0 2px 0 #8B4513, 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2);">
                    <div style="display: flex; align-items: center;">
                        <img src="img/pictures/bigcoin.png?v=1" style="width: 32px; height: 32px; object-fit: contain; margin-right: 12px;" alt="Bigcoin">
                        <span style="font-size: 16px; color: #8B4513; font-weight: bold;">Bigcoin</span>
                    </div>
                    <span style="font-size: 18px; font-weight: bold; color: #8B4513;">${bigcoinCount}</span>
                </div>
            `;
        }

        // If no fish, show message
        if (mackerelCount === 0 && salmonCount === 0 && troutCount === 0 && bigcoinCount === 0) {
            content += `
                <div style="margin-top: 12px; text-align: center; font-size: 14px; padding: 16px; background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%); border: 2px solid #8B4513; border-radius: 8px; color: #8B4513; font-weight: bold;">
                    No fish caught yet!
                </div>
            `;
        }

        // Add total count
        const totalFish = mackerelCount + salmonCount + troutCount + bigcoinCount;
        if (totalFish > 0) {
            content += `
                <div style="margin-top: 16px; padding: 12px; border-top: 2px solid rgba(255,255,255,0.3); text-align: center; font-size: 18px; color: #4CAF50; background: rgba(76, 175, 80, 0.1); border-radius: 8px;">
                    Total: ${totalFish}
                </div>
            `;
        }

        counter.innerHTML = content;
    }

    // Add background image to entire page
    function addBackgroundImage() {
        document.body.style.backgroundImage = 'url("background.gif")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.overflow = 'hidden';
        
        // Hide scroll bars for webkit browsers
        const style = document.createElement('style');
        style.textContent = `
            body::-webkit-scrollbar {
                display: none;
            }
            html {
                overflow: hidden;
            }
            body {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Create social media footer
    function createSocialFooter() {
        const footer = document.createElement('div');
        footer.id = 'social-footer';
        footer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
            color: #2F4F2F;
            padding: 12px 20px;
            border-radius: 25px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            box-shadow: 
                0 4px 0 #8B4513,
                0 2px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.4);
            backdrop-filter: blur(10px);
            border: 3px solid #8B4513;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        // Twitter button
        const twitterBtn = document.createElement('a');
        twitterBtn.href = 'https://x.com/ABSPFC';
        twitterBtn.target = '_blank';
        twitterBtn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.3s ease;
            border: 2px solid #654321;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        twitterBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
        `;
        twitterBtn.addEventListener('mouseover', () => {
            twitterBtn.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            twitterBtn.style.transform = 'translateY(-1px)';
            twitterBtn.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        twitterBtn.addEventListener('mouseout', () => {
            twitterBtn.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            twitterBtn.style.transform = 'translateY(0)';
            twitterBtn.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        
        // Discord button
        const discordBtn = document.createElement('a');
        discordBtn.href = 'https://discord.gg/sY5KUUQGxw';
        discordBtn.target = '_blank';
        discordBtn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.3s ease;
            border: 2px solid #654321;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        discordBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
        `;
        discordBtn.addEventListener('mouseover', () => {
            discordBtn.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            discordBtn.style.transform = 'translateY(-1px)';
            discordBtn.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        discordBtn.addEventListener('mouseout', () => {
            discordBtn.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            discordBtn.style.transform = 'translateY(0)';
            discordBtn.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        
        // Gitbook button
        const gitbookBtn = document.createElement('a');
        gitbookBtn.href = 'https://penguin-fishing-club.gitbook.io/penguin-fishing-club/';
        gitbookBtn.target = '_blank';
        gitbookBtn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.3s ease;
            border: 2px solid #654321;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        gitbookBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-17v6h2V5h-2zm0 8v6h2v-6h-2z"/>
            </svg>
            Gitbook
        `;
        gitbookBtn.addEventListener('mouseover', () => {
            gitbookBtn.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            gitbookBtn.style.transform = 'translateY(-1px)';
            gitbookBtn.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        gitbookBtn.addEventListener('mouseout', () => {
            gitbookBtn.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            gitbookBtn.style.transform = 'translateY(0)';
            gitbookBtn.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        
        // GitHub button
        const githubBtn = document.createElement('a');
        githubBtn.href = 'https://github.com/letsfishgameabs/PENGUIN-FISHING-CLUB';
        githubBtn.target = '_blank';
        githubBtn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            transition: all 0.3s ease;
            border: 2px solid #654321;
            box-shadow: 
                0 2px 0 #654321,
                0 1px 3px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2);
        `;
        githubBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
        `;
        githubBtn.addEventListener('mouseover', () => {
            githubBtn.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
            githubBtn.style.transform = 'translateY(-1px)';
            githubBtn.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        githubBtn.addEventListener('mouseout', () => {
            githubBtn.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            githubBtn.style.transform = 'translateY(0)';
            githubBtn.style.boxShadow = '0 2px 0 #654321, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
        });
        
        footer.appendChild(twitterBtn);
        footer.appendChild(discordBtn);
        footer.appendChild(gitbookBtn);
        footer.appendChild(githubBtn);
        
        return footer;
    }

    // Update social footer display
    function updateSocialFooterDisplay() {
        let footer = document.getElementById('social-footer');
        if (!footer) {

        }
    }

    // Initialize fish counter and leaderboard
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        
        // Add background image to entire page
        setTimeout(() => {
            addBackgroundImage();
        }, 100);
        
        // Check Firebase connection
        setTimeout(() => {
            console.log('checking firebase connection...');
            console.log('firebase database:', window.firebaseDatabase);
            console.log('firebase ref:', window.firebaseRef);
            console.log('firebase set:', window.firebaseSet);
            
            if (window.firebaseDatabase) {
                console.log('firebase is available');
                // Test connection by writing a test entry
                const testRef = window.firebaseRef(window.firebaseDatabase, 'test');
                window.firebaseSet(testRef, { test: 'connection', timestamp: Date.now() }).then(() => {
                    console.log('firebase connection test successful');
                }).catch((error) => {
                    console.error('firebase connection test failed:', error);
                });
            } else {
                console.error('firebase is not available');
            }
        }, 500);
        
        // Update fish counter and leaderboard after a short delay
        setTimeout(() => {
            updateFishCounterDisplay();
            updateLeaderboardDisplay();
            updateSocialFooterDisplay();
        }, 1000);
        
        // After UI is ready, attempt to sync fish from Firebase for the connected wallet
        setTimeout(() => {
            try { syncFishFromFirebase(); } catch (e) {}
        }, 1400);
        
        // Reset fishing system on map start to ensure clean state
        setTimeout(() => {
            if (window.resetFishingSystem) {
                console.log('resetting fishing system on map start in simple menu');
                window.resetFishingSystem();
            }
        }, 1500);
    };

    // Update counter display periodically
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        
        // Update fish counter every 5 seconds
        if (!this._fishUpdateTime) {
            this._fishUpdateTime = 0;
        }
        
        this._fishUpdateTime++;
        if (this._fishUpdateTime >= 300) { // 5 seconds at 60fps
            updateFishCounterDisplay();
            this._fishUpdateTime = 0;
        }
    };

    // Override Game_Interpreter to update display when items are gained
    const _Game_Interpreter_command126 = Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126 = function(params) {
        const result = _Game_Interpreter_command126.call(this, params);
        
        // Update fish counter when items are gained
        setTimeout(() => {
            updateFishCounterDisplay();
            
            // Update leaderboard scores with current fish counts
            console.log('item gained, updating leaderboard...');
            updatePlayerScore();
        }, 100);
        
        return result;
    };

    // Add keyboard shortcuts
    const _Scene_Map_onKeyDown = Scene_Map.prototype.onKeyDown;
    Scene_Map.prototype.onKeyDown = function(event) {
        _Scene_Map_onKeyDown.call(this, event);
        
        // Toggle counter with F key
        if (event.keyCode === 70) { // F key
            const counter = document.getElementById('fish-counter');
            if (counter) {
                counter.style.display = counter.style.display === 'none' ? 'block' : 'none';
            }
        }
        
        // Toggle leaderboard with L key
        if (event.keyCode === 76) { // L key
            const leaderboard = document.getElementById('leaderboard');
            if (leaderboard) {
                leaderboard.style.display = leaderboard.style.display === 'none' ? 'block' : 'none';
            }
        }
    };

    // Test Firebase connection
    Scene_Menu.prototype.testFirebaseConnection = function() {
        console.log('Testing Firebase connection...');
        
        if (!window.firebaseDatabase) {
            console.log('Firebase database not available');
            return false;
        }

        // Test write to a temporary location
        const testRef = window.firebaseRef(window.firebaseDatabase, 'test_connection');
        const testData = {
            timestamp: Date.now(),
            test: true
        };

        return window.firebaseSet(testRef, testData).then(() => {
            console.log('Firebase connection test successful');
            // Clean up test data
            return window.firebaseSet(testRef, null);
        }).catch((error) => {
            console.error('Firebase connection test failed:', error);
            return false;
        });
    };

    // Check current registrations for debugging
    Scene_Menu.prototype.checkCurrentRegistrations = function(eventId) {
        console.log('Checking current registrations for event:', eventId);
        
        if (!window.firebaseDatabase) {
            console.log('Firebase database not available');
            return;
        }

        const registrationPaths = [
            `event_registrations/${eventId}`,
            `registrations/${eventId}`,
            `leaderboard/event_registrations/${eventId}`
        ];

        registrationPaths.forEach((path, pathIndex) => {
            setTimeout(() => {
                console.log(`Checking path: ${path}`);
                const registrationsRef = window.firebaseRef(window.firebaseDatabase, path);
                
                window.firebaseGet(registrationsRef).then((snapshot) => {
                    console.log(`Current registrations for ${path}:`, snapshot.val());
                    if (snapshot.exists()) {
                        const registrations = [];
                        snapshot.forEach((childSnapshot) => {
                            registrations.push(childSnapshot.val());
                        });
                        console.log(`Total registrations in ${path}:`, registrations.length);
                        registrations.forEach((reg, index) => {
                            console.log(`Registration ${index + 1} in ${path}:`, reg);
                        });
                    } else {
                        console.log(`No registrations found in ${path}`);
                    }
                }).catch((error) => {
                    console.error(`Error checking registrations in ${path}:`, error);
                });
            }, pathIndex * 1000); // Check each path with 1 second delay
        });
    };

    // Add test registration for debugging
    Scene_Menu.prototype.addTestRegistration = function(eventId, eventName) {
        console.log('Adding test registration for:', eventId, eventName);
        
        const walletAddress = getPlayerWallet();
        if (!walletAddress) {
            console.log('No wallet address available for test registration');
            this.showMessage('Please connect your wallet first for test registration');
            return;
        }

        if (!window.firebaseDatabase) {
            console.log('Firebase database not available for test registration');
            this.showMessage('Database not available for test registration');
            return;
        }

        const testRegistrationData = {
            walletAddress: walletAddress,
            eventId: eventId,
            eventName: eventName,
            registrationDate: new Date().toISOString(),
            playerName: getPlayerName() || 'Test Player',
            isTestRegistration: true
        };

        const registrationRef = window.firebaseRef(window.firebaseDatabase, `event_registrations/${eventId}/${walletAddress}_test`);
        
        window.firebaseSet(registrationRef, testRegistrationData).then(() => {
            console.log('Test registration successful!');
            this.showMessage(`Test registration added for ${eventName}!`);
        }).catch((error) => {
            console.error('Test registration error:', error);
            this.showMessage('Test registration failed. Please try again.');
        });
    };

    // Comprehensive Firebase test
    Scene_Menu.prototype.testFirebaseComprehensive = function() {
        console.log('=== COMPREHENSIVE FIREBASE TEST ===');
        
        if (!window.firebaseDatabase) {
            console.log('❌ Firebase database not available');
            this.showMessage('Firebase database not available');
            return;
        }

        console.log('✅ Firebase database object available');

        // Test 1: Basic write/read
        const testRef = window.firebaseRef(window.firebaseDatabase, 'test_comprehensive');
        const testData = {
            timestamp: Date.now(),
            test: 'comprehensive',
            wallet: getPlayerWallet() || 'no_wallet'
        };

        console.log('Testing basic write/read...');
        
        window.firebaseSet(testRef, testData).then(() => {
            console.log('✅ Write test successful');
            
            return window.firebaseGet(testRef);
        }).then((snapshot) => {
            if (snapshot.exists()) {
                console.log('✅ Read test successful:', snapshot.val());
            } else {
                console.log('❌ Read test failed: no data found');
            }
            
            // Clean up
            return window.firebaseSet(testRef, null);
        }).then(() => {
            console.log('✅ Cleanup successful');
            
            // Test 2: Event registrations structure
            console.log('Testing event registrations structure...');
            const eventRegRef = window.firebaseRef(window.firebaseDatabase, 'event_registrations');
            
            return window.firebaseGet(eventRegRef);
        }).then((snapshot) => {
            console.log('Event registrations structure:', snapshot.val());
            
            // Test 3: Try to write to event registrations
            const walletAddress = getPlayerWallet();
            if (walletAddress) {
                console.log('Testing event registration write...');
                const regRef = window.firebaseRef(window.firebaseDatabase, `event_registrations/test_event/${walletAddress}`);
                const regData = {
                    walletAddress: walletAddress,
                    eventId: 'test_event',
                    eventName: 'Test Event',
                    registrationDate: new Date().toISOString(),
                    playerName: getPlayerName() || 'Test Player',
                    isTest: true
                };
                
                return window.firebaseSet(regRef, regData).then(() => {
                    console.log('✅ Event registration write successful');
                    return window.firebaseSet(regRef, null); // Clean up
                }).then(() => {
                    console.log('✅ Event registration cleanup successful');
                });
            } else {
                console.log('⚠️ No wallet connected, skipping registration test');
            }
        }).catch((error) => {
            console.error('❌ Firebase test failed:', error);
            this.showMessage(`Firebase test failed: ${error.message}`);
        });
    };

    // Check Firebase database rules
    Scene_Menu.prototype.checkFirebaseRules = function() {
        console.log('=== CHECKING FIREBASE DATABASE RULES ===');
        
        if (!window.firebaseDatabase) {
            console.log('❌ Firebase database not available');
            return;
        }

        const walletAddress = getPlayerWallet();
        if (!walletAddress) {
            console.log('⚠️ No wallet connected, cannot test with real wallet');
            return;
        }

        console.log('Testing database permissions with wallet:', walletAddress);

        // Test different paths to see which ones work
        const testPaths = [
            'test_permissions',
            'event_registrations',
            'event_registrations/test_event',
            `event_registrations/test_event/${walletAddress}`,
            'leaderboard',
            'leaderboard/mackerel',
            `leaderboard/mackerel/${walletAddress}`
        ];

        testPaths.forEach((path, index) => {
            setTimeout(() => {
                console.log(`Testing path: ${path}`);
                const testRef = window.firebaseRef(window.firebaseDatabase, path);
                const testData = {
                    timestamp: Date.now(),
                    test: `permission_test_${index}`,
                    wallet: walletAddress
                };

                window.firebaseSet(testRef, testData).then(() => {
                    console.log(`✅ Write successful to: ${path}`);
                    // Clean up
                    return window.firebaseSet(testRef, null);
                }).then(() => {
                    console.log(`✅ Cleanup successful for: ${path}`);
                }).catch((error) => {
                    console.log(`❌ Write failed to: ${path}`, error.message);
                });
            }, index * 1000); // Test each path with 1 second delay
        });
    };

    // Manual registration trigger for testing
    Scene_Menu.prototype.triggerManualRegistration = function() {
        console.log('=== MANUAL REGISTRATION TRIGGER ===');
        
        const walletAddress = getPlayerWallet();
        if (!walletAddress) {
            console.log('No wallet connected, cannot trigger manual registration');
            this.showMessage('Please connect your wallet first for manual registration');
            return;
        }

        console.log('Wallet address for manual registration:', walletAddress);
        
        // Test registration for both events
        const events = [
            { id: 'fishing_tournament', name: 'Fishing Tournament' },
            { id: 'community_challenge', name: 'Community Challenge' }
        ];

        events.forEach((event, index) => {
            setTimeout(() => {
                console.log(`Triggering manual registration for ${event.name}...`);
                this.registerForEvent(event.id, event.name);
            }, index * 2000); // Trigger each event with 2 second delay
        });
    };

})(); 