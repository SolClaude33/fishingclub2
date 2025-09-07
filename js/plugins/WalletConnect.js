//=============================================================================
// RPG Maker MZ - WalletConnect Plugin (Official AGW + Privy Integration)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Official Abstract Global Wallet + Privy integration using React components.
 * @author Assistant
 *
 * @help WalletConnect.js
 *
 * This plugin integrates Abstract Global Wallet using the official
 * AbstractPrivyProvider and useAbstractPrivyLogin components.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let agwProvider = null;

    // Avoid window.ethereum conflicts
    console.log('WalletConnect: Official AGW + Privy integration');

    // Load required libraries
    async function loadRequiredLibraries() {
        const libraries = [
            {
                name: 'React',
                url: 'https://unpkg.com/react@18/umd/react.production.min.js',
                global: 'React'
            },
            {
                name: 'ReactDOM',
                url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
                global: 'ReactDOM'
            },
            {
                name: 'Privy',
                url: 'https://sdk.privy.io/privy-js.js',
                global: 'Privy'
            }
        ];

        for (const lib of libraries) {
            if (!window[lib.global]) {
                try {
                    await loadScript(lib.url);
                    console.log(`✅ ${lib.name} loaded`);
                } catch (error) {
                    console.error(`❌ Failed to load ${lib.name}:`, error);
                    return false;
                }
            }
        }
        return true;
    }

    // Load a script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initialize AGW + Privy system
    async function initializeAGW() {
        try {
            // Load required libraries
            const librariesLoaded = await loadRequiredLibraries();
            if (!librariesLoaded) {
                throw new Error('Failed to load required libraries');
            }

            // Initialize AGW Provider
            if (window.AGWPrivyProvider) {
                agwProvider = window.AGWPrivyProvider;
                const initialized = agwProvider.init();
                if (!initialized) {
                    throw new Error('Failed to initialize AGW Provider');
                }
            } else {
                throw new Error('AGW Provider not found');
            }

            console.log('✅ AGW + Privy system initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize AGW + Privy:', error);
            return false;
        }
    }

    // Connect to Abstract Global Wallet using official method
    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Initialize if not already done
            if (!agwProvider) {
                const initialized = await initializeAGW();
                if (!initialized) {
                    throw new Error('Failed to initialize AGW + Privy system');
                }
            }

            // Use the official useAbstractPrivyLogin hook
            if (window.useAbstractPrivyLogin) {
                const { login } = window.useAbstractPrivyLogin();
                const user = await login();

                if (user && user.wallet) {
                    // Connection successful
                    currentAccount = user.wallet.address;
                    isConnected = true;

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
                                                window.syncFishFromFirebase(); 
                                        } catch (e) {} 
                                    }, 200);
                                }, 500);
                            } else {
                                showNotification('Starting new game for this wallet', 'info');
                                
                                // Reset fishing system for new game
                                setTimeout(() => {
                                    if (window.resetFishingSystem) {
                                        console.log('resetting fishing system for new AGW wallet game');
                                        window.resetFishingSystem();
                                    }
                                    // For new wallet, also try to pull existing fish collection from Firebase
                                    setTimeout(() => { 
                                        try { 
                                            if (typeof window.syncFishFromFirebase === 'function') 
                                                window.syncFishFromFirebase(); 
                                        } catch (e) {} 
                                    }, 200);
                                }, 500);
                            }
                        }
                    }, 1000);

                } else {
                    throw new Error('Failed to get wallet from Privy user');
                }
            } else {
                throw new Error('useAbstractPrivyLogin hook not available');
            }

        } catch (error) {
            console.error('AGW connection error:', error);
            alert('Failed to connect Abstract Global Wallet: ' + error.message);
            setButtonState(button, false);
        }
    }

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
            button.title = 'Connect with Abstract Global Wallet';
            
            // Re-add hover effects when disconnected
            if (!button._hoverEnter) {
                button._hoverEnter = () => {
                    if (!button.disabled) {
                        button.style.background = 'linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%)';
                        button.style.transform = 'translateY(-1px)';
                        button.style.boxShadow = '0 4px 0 #654321, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                    }
                };
                button._hoverLeave = () => {
                    if (!button.disabled) {
                        button.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
                        button.style.transform = 'translateY(0)';
                        button.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
                    }
                };
            }
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
            top: 16px;
            right: 20px;
            z-index: 10000;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            color: white;
            border: 2px solid #654321;
            border-radius: 12px;
            padding: 10px 16px;
            font-family: 'Arial', sans-serif;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.2s ease;
            text-transform: uppercase;
        `;

        // Click handler
        button.addEventListener('click', (e) => {
            if (!button.disabled) {
                connectAGW();
            }
        });

        // Set initial state
        setButtonState(button, false);

        return button;
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

    // Initialize when the game starts
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        
        // Initialize AGW + Privy system
        setTimeout(async () => {
            try {
                await initializeAGW();
            } catch (error) {
                console.error('Failed to initialize AGW + Privy:', error);
            }
        }, 500);
        
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

    console.log('WalletConnect plugin loaded - Official AGW + Privy integration');
})();