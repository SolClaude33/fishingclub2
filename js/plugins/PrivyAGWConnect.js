(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let privyClient = null;

    console.log('PrivyAGWConnect: Official Privy SDK with cross-app login for AGW');

    // Initialize Privy client
    async function initializePrivy() {
        try {
            // Load Privy SDK dynamically
            if (!window.Privy) {
                console.log('Loading Privy SDK...');
                await loadScript('https://sdk.privy.io/privy-js.js');
                
                // Wait for SDK to load
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (!window.Privy || !window.Privy.PrivyClient) {
                throw new Error('Privy SDK not loaded properly');
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

    // Connect to Abstract Global Wallet via Privy cross-app login
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

            // Use Privy's cross-app login for AGW
            const user = await privyClient.loginWithCrossAppAccount({
                appId: 'cm04asygd041fmry9zmcyn5o5'
            });

            if (user && user.linkedAccounts) {
                // Find the cross-app account
                const crossAppAccount = user.linkedAccounts.find(
                    (account) => account.type === 'cross_app' && account.providerApp.id === 'cm04asygd041fmry9zmcyn5o5'
                );

                if (crossAppAccount && crossAppAccount.embeddedWallets && crossAppAccount.embeddedWallets.length > 0) {
                    currentAccount = crossAppAccount.embeddedWallets[0].address;
                    isConnected = true;

                    console.log('AGW Connection successful!');
                    console.log('Connected wallet address:', currentAccount);
                    console.log('Cross-app account:', crossAppAccount);

                    // Update button state
                    setButtonState(button, true, currentAccount);

                    // Show success message
                    showNotification(`Abstract Global Wallet connected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`, 'success');

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
                            provider: 'agw-privy-cross-app'
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
                    throw new Error('No embedded wallet found in cross-app account');
                }

            } else {
                throw new Error('Failed to get user data from Privy');
            }

        } catch (error) {
            console.error('AGW connection error:', error);
            
            // More specific error handling
            let errorMessage = 'Failed to connect Abstract Global Wallet';
            if (error.message.includes('Privy SDK')) {
                errorMessage = 'Failed to load Privy SDK. Please refresh and try again.';
            } else if (error.message.includes('embedded wallet')) {
                errorMessage = 'No wallet found. Please make sure you have an AGW wallet.';
            } else {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
            setButtonState(button, false);
        }
    }

    // Generate a unique requester public key for Privy cross-app connect
    async function generateRequesterKey() {
        try {
            // Generate a proper ECDH P-256 key pair for Privy
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: 'ECDH',
                    namedCurve: 'P-256'
                },
                true,
                ['deriveKey', 'deriveBits']
            );

            // Export the public key in raw format (uncompressed)
            const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
            
            // Convert to hex string (uncompressed public key format)
            const publicKeyHex = Array.from(new Uint8Array(publicKeyBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            console.log('Generated ECDH P-256 public key for Privy:', publicKeyHex);
            console.log('Key length:', publicKeyHex.length);
            
            return publicKeyHex;
        } catch (error) {
            console.error('Error generating ECDH key:', error);
            
            // Fallback: Generate a simple random key
            try {
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const hex = Array.from(array)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                
                console.log('Using fallback random key:', hex);
                return hex;
            } catch (fallbackError) {
                console.error('Error generating fallback key:', fallbackError);
                
                // Final fallback: Use a fixed test key
                const fallbackKey = 'dGVzdC1rZXktZm9yLXByaXZ5LWNvbm5lY3Rpb24tdGVzdA==';
                console.log('Using final fallback key:', fallbackKey);
                return fallbackKey;
            }
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
        return null; // No client needed for popup method
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

    console.log('PrivyAGWConnect plugin loaded - Simple popup method');
})();