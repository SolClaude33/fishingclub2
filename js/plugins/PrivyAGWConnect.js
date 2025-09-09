(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;

    console.log('PrivyAGWConnect: Simple popup method for AGW connection');

    // Generate a unique requester public key for Privy cross-app connect
    function generateRequesterKey() {
        // Generate a random key for this session
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        // Convert to base64 properly
        return btoa(String.fromCharCode.apply(null, Array.from(array)));
    }


    // Connect to Abstract Global Wallet via Privy popup
    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Generate a unique requester public key for this session
            const requesterPublicKey = generateRequesterKey();
            
            // Get the current origin
            const requesterOrigin = window.location.origin;
            
            // Create the Privy connection URL - using the correct format
            const privyUrl = `https://privy.abs.xyz/cross-app/connect?` +
                `requester_public_key=${encodeURIComponent(requesterPublicKey)}&` +
                `connect=true&` +
                `provider_app_id=cm04asygd041fmry9zmcyn5o5&` +
                `requester_origin=${encodeURIComponent(requesterOrigin)}&` +
                `smart_wallet_mode=false&` +
                `redirect_uri=${encodeURIComponent(requesterOrigin)}`;

            console.log('Opening Privy connection:', privyUrl);

            // Open Privy connection in a popup window
            const popup = window.open(
                privyUrl,
                'privy-connect',
                'width=500,height=700,scrollbars=yes,resizable=yes'
            );

            if (!popup) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }

            // Listen for messages from the popup
            const messageHandler = (event) => {
                console.log('Received message from popup:', event.origin, event.data);
                
                if (event.origin !== 'https://privy.abs.xyz') {
                    return;
                }

                if (event.data.type === 'PRIVY_CONNECT_SUCCESS' || event.data.type === 'CONNECT_SUCCESS') {
                    // Connection successful
                    currentAccount = event.data.account || event.data.walletAddress;
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

                    // Clean up
                    window.removeEventListener('message', messageHandler);
                    popup.close();

                } else if (event.data.type === 'PRIVY_CONNECT_ERROR') {
                    // Connection failed
                    throw new Error(event.data.error || 'Connection failed');
                }
            };

            window.addEventListener('message', messageHandler);

            // Handle popup close and check for URL changes
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                    
                    if (!isConnected) {
                        setButtonState(button, false);
                        showNotification('Connection cancelled', 'info');
                    }
                } else {
                    // Check if popup redirected back to our site
                    try {
                        if (popup.location.href.includes(window.location.origin)) {
                            // Popup redirected back, check for wallet data
                            const urlParams = new URLSearchParams(popup.location.search);
                            const walletAddress = urlParams.get('wallet') || urlParams.get('address');
                            
                            if (walletAddress) {
                                currentAccount = walletAddress;
                                isConnected = true;
                                
                                // Update button state
                                setButtonState(button, true, currentAccount);
                                showNotification('Abstract Global Wallet connected successfully!', 'success');
                                
                                // Set current wallet address for save system
                                if (window.setCurrentWalletAddress) {
                                    window.setCurrentWalletAddress(currentAccount);
                                }
                                
                                // Clean up
                                clearInterval(checkClosed);
                                window.removeEventListener('message', messageHandler);
                                popup.close();
                            }
                        }
                    } catch (e) {
                        // Cross-origin error, ignore
                    }
                }
            }, 1000);
            
            // Timeout after 5 minutes
            setTimeout(() => {
                if (!isConnected) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                    popup.close();
                    setButtonState(button, false);
                    showNotification('Connection timeout', 'error');
                }
            }, 300000); // 5 minutes

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
        console.log('Creating wallet connect button...');
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
            console.log('Wallet connect button clicked!');
            if (!button.disabled) {
                connectAGW();
            }
        });

        // Set initial state
        setButtonState(button, false);
        
        console.log('Wallet connect button created successfully:', button);
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
                console.log('Creating wallet connect button...');
                const walletButton = createWalletButton();
                document.body.appendChild(walletButton);
                console.log('Wallet connect button created and added to DOM');
            } else {
                console.log('Wallet connect button already exists');
            }
        }, 1000);
        
        // Also try to add button immediately if DOM is ready
        if (document.readyState === 'complete') {
            setTimeout(() => {
                if (!document.getElementById('wallet-connect-btn')) {
                    console.log('Creating wallet connect button (immediate)...');
                    const walletButton = createWalletButton();
                    document.body.appendChild(walletButton);
                    console.log('Wallet connect button created immediately');
                }
            }, 100);
        }
        
        // Reset fishing system when game starts
        setTimeout(() => {
            if (window.resetFishingSystem) {
                console.log('resetting fishing system when game starts');
                window.resetFishingSystem();
            }
        }, 2000);
    };

    // Also initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (!document.getElementById('wallet-connect-btn')) {
                    console.log('Creating wallet connect button (DOMContentLoaded)...');
                    const walletButton = createWalletButton();
                    document.body.appendChild(walletButton);
                    console.log('Wallet connect button created on DOMContentLoaded');
                }
            }, 500);
        });
    } else {
        // DOM is already ready
        setTimeout(() => {
            if (!document.getElementById('wallet-connect-btn')) {
                console.log('Creating wallet connect button (DOM ready)...');
                const walletButton = createWalletButton();
                document.body.appendChild(walletButton);
                console.log('Wallet connect button created on DOM ready');
            }
        }, 500);
    }

    console.log('PrivyAGWConnect plugin loaded - Simple popup method for AGW');
})();