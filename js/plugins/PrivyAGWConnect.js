(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let privyClient = null;

    console.log('PrivyAGWConnect: Official Privy SDK integration');

    // Initialize Privy client
    async function initializePrivy() {
        try {
            // Load Privy SDK dynamically
            if (!window.Privy) {
                await loadScript('https://sdk.privy.io/privy-js.js');
            }

            // Initialize Privy client
            privyClient = new window.Privy.PrivyClient({
                appId: 'cm04asygd041fmry9zmcyn5o5',
                config: {
                    appearance: {
                        theme: 'light',
                        accentColor: '#676FFF',
                        logo: 'https://fishingclub2-5f4o.vercel.app/logo.png'
                    },
                    embeddedWallets: {
                        createOnLogin: 'users-without-wallets',
                        requireUserPasswordOnCreate: false
                    }
                }
            });

            console.log('✅ Privy client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Privy:', error);
            return false;
        }
    }

    // Load external script
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Connect to Abstract Global Wallet via Privy
    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Initialize Privy if not already done
            if (!privyClient) {
                const initialized = await initializePrivy();
                if (!initialized) {
                    throw new Error('Failed to initialize Privy SDK');
                }
            }

            // Login with cross-app account (AGW)
            const user = await privyClient.loginWithCrossAppAccount({
                requesterPublicKey: generateRequesterKey(),
                requesterOrigin: window.location.origin,
                providerAppId: 'cm04asygd041fmry9zmcyn5o5',
                smartWalletMode: false
            });

            if (user && user.wallet) {
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
                
                // Dispatch wallet connected event
                window.dispatchEvent(new CustomEvent('walletConnected', { 
                    detail: { 
                        wallet: currentAccount,
                        provider: 'agw-privy'
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
                throw new Error('Failed to get wallet address from Privy');
            }

        } catch (error) {
            console.error('AGW connection error:', error);
            
            // More specific error handling
            let errorMessage = 'Failed to connect Abstract Global Wallet';
            if (error.message.includes('window.ethereum')) {
                errorMessage = 'Wallet conflict detected. Please try:\n1. Disable MetaMask temporarily\n2. Or use incognito mode\n3. Or try a different browser';
            } else if (error.message.includes('popup')) {
                errorMessage = 'Popup blocked. Please allow popups for this site.';
            } else if (error.message.includes('public key')) {
                errorMessage = 'Connection error. Please try again.';
            } else {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
            setButtonState(button, false);
        }
    }

    // Generate a unique requester public key
    function generateRequesterKey() {
        // Generate a random key for this session
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        // Convert to base64 properly
        return btoa(String.fromCharCode.apply(null, Array.from(array)));
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
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10001;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
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
        return privyClient;
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

    console.log('PrivyAGWConnect plugin loaded - Official Privy SDK integration');
})();
