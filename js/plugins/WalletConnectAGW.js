//=============================================================================
// RPG Maker MZ - Abstract Global Wallet Connect Plugin (Official SDK)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adds Abstract Global Wallet integration using official AGW SDK.
 * @author Assistant
 *
 * @help WalletConnectAGW.js
 *
 * This plugin integrates Abstract Global Wallet using the official AGW SDK.
 * It provides seamless wallet connection and transaction signing.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let agwClient = null;
    let agwProvider = null;

    // Function to set button state
    function setButtonState(button, connected, account = null) {
        if (connected && account) {
            // Connected state - disable button
            button.disabled = true;
            button.textContent = `AGW ${account.slice(0, 6)}...${account.slice(-4)}`;
            button.style.background = 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #2E7D32 100%)';
            button.style.border = '2px solid #2E7D32';
            button.style.boxShadow = '0 3px 0 #1B5E20, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'default';
            button.style.opacity = '0.8';
            button.title = `Connected via Abstract Global Wallet: ${account}`;
            
            // Remove hover effects when connected
            button.removeEventListener('mouseenter', button._hoverEnter);
            button.removeEventListener('mouseleave', button._hoverLeave);
        } else {
            // Disconnected state - enable button
            button.disabled = false;
            button.textContent = 'Connect AGW';
            button.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            button.style.border = '2px solid #654321';
            button.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            button.title = 'Connect to Abstract Global Wallet';
            
            // Add hover effects when disconnected
            button._hoverEnter = () => {
                if (!button.disabled) {
                    button.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
                    button.style.transform = 'translateY(-1px)';
                    button.style.boxShadow = '0 4px 0 #654321, 0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)';
                }
            };
            button._hoverLeave = () => {
                if (!button.disabled) {
                    button.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                }
            };
            button.addEventListener('mouseenter', button._hoverEnter);
            button.addEventListener('mouseleave', button._hoverLeave);
        }
    }

    // Create wallet connect button
    function createWalletButton() {
        const button = document.createElement('button');
        button.id = 'wallet-connect-btn';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 24px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 140px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        button.addEventListener('click', () => {
            if (!button.disabled) {
                connectAGW();
            }
        });

        // Set initial state
        setButtonState(button, false);

        return button;
    }

    // Load AGW SDK
    async function loadAGWSDK() {
        return new Promise((resolve, reject) => {
            if (window.AbstractWalletProvider) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@abstract-foundation/agw-client@latest/dist/index.umd.js';
            script.onload = () => {
                console.log('AGW SDK loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load AGW SDK');
                reject(new Error('Failed to load AGW SDK'));
            };
            document.head.appendChild(script);
        });
    }

    // Connect to Abstract Global Wallet using official SDK
    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Load AGW SDK if not already loaded
            if (!window.AbstractWalletProvider) {
                await loadAGWSDK();
            }

            // Initialize AGW provider
            agwProvider = new window.AbstractWalletProvider({
                appId: 'cm04asygd041fmry9zmcyn5o5', // Your app ID
                chainId: 8333, // Abstract mainnet
                redirectUri: window.location.origin
            });

            // Connect to AGW
            const result = await agwProvider.connect();
            
            if (result && result.address) {
                currentAccount = result.address;
                isConnected = true;
                agwClient = agwProvider;

                // Update button state
                setButtonState(button, true, currentAccount);

                // Show success message
                showNotification('Abstract Global Wallet connected successfully!', 'success');

                // Set current wallet address for save system
                if (window.setCurrentWalletAddress) {
                    window.setCurrentWalletAddress(currentAccount);
                }
                
                // Reset fishing system when wallet connects
                if (window.resetFishingSystem) {
                    console.log('resetting fishing system after AGW connection');
                    window.resetFishingSystem();
                }
                
                // Dispatch wallet connected event
                window.dispatchEvent(new CustomEvent('walletConnected', { 
                    detail: { 
                        wallet: currentAccount,
                        provider: 'agw-official'
                    } 
                }));

                // Load saved game data for this wallet
                setTimeout(() => {
                    if (window.walletSaveSystem && window.walletSaveSystem.loadWalletData) {
                        const savedData = window.walletSaveSystem.loadWalletData(currentAccount);
                        if (savedData) {
                            window.walletSaveSystem.applyGameState(savedData);
                            showNotification('Game progress loaded!', 'success');
                            
                            // Reset fishing system after loading wallet data
                            setTimeout(() => {
                                if (window.resetFishingSystem) {
                                    console.log('resetting fishing system after loading wallet data in AGW connect');
                                    window.resetFishingSystem();
                                }
                                // After game state is applied, sync fish counts from Firebase for this wallet
                                setTimeout(() => { 
                                    try { 
                                        if (typeof window.syncFishFromFirebase === 'function') 
                                            window.syncFishFromFirebase(currentAccount); 
                                    } catch (e) { 
                                        console.log('Firebase sync error in AGW connect:', e); 
                                    } 
                                }, 1000); 
                            }, 500);
                        }
                    }
                }, 1000);

            } else {
                throw new Error('Failed to get wallet address from AGW');
            }

        } catch (error) {
            console.error('AGW connection error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Failed to connect Abstract Global Wallet. ';
            if (error.message.includes('User rejected')) {
                errorMessage += 'Connection was cancelled by user.';
            } else if (error.message.includes('Network')) {
                errorMessage += 'Network error. Please check your connection and try again.';
            } else {
                errorMessage += error.message;
            }
            
            showNotification(errorMessage, 'error');
            setButtonState(button, false);
        }
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10001;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Compatibility functions
    window.getPlayerWallet = function() {
        return currentAccount;
    };

    window.getAGWClient = function() {
        return agwClient;
    };

    // Initialize wallet button when the game starts
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        
        // Add wallet button after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (!document.getElementById('wallet-connect-btn')) {
                const walletButton = createWalletButton();
                document.body.appendChild(walletButton);
            }
        }, 1000);
        
        // Reset fishing system when game starts
        setTimeout(() => {
            if (window.resetFishingSystem) {
                console.log('resetting fishing system when game starts');
                window.resetFishingSystem();
            }
        }, 2000);
    };

    console.log('Abstract Global Wallet (Official SDK) plugin loaded');
})();
