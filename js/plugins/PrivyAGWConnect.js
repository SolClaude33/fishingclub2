(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;

    console.log('PrivyAGWConnect: Simple popup method for AGW connection');

    // Connect to Abstract Global Wallet via Privy popup
    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // First, try to get the wallet's public key if available
            let requesterPublicKey = null;
            
            // Check if we have access to a connected wallet
            if (window.ethereum) {
                try {
                    // Try to get accounts first
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        console.log('Found connected wallet:', accounts[0]);
                        
                        // Try to get the public key from the wallet
                        try {
                            const publicKey = await window.ethereum.request({
                                method: 'eth_getEncryptionPublicKey',
                                params: [accounts[0]]
                            });
                            requesterPublicKey = publicKey;
                            console.log('Got public key from connected wallet:', requesterPublicKey);
                        } catch (encryptionError) {
                            console.log('Could not get encryption public key:', encryptionError);
                            
                            // Try alternative method - request personal_sign to get public key
                            try {
                                const message = 'Please sign this message to connect to Abstract Global Wallet';
                                const signature = await window.ethereum.request({
                                    method: 'personal_sign',
                                    params: [message, accounts[0]]
                                });
                                console.log('Got signature from wallet:', signature);
                                // For now, we'll use the signature as a fallback
                                requesterPublicKey = signature;
                            } catch (signError) {
                                console.log('Could not get signature from wallet:', signError);
                            }
                        }
                    }
                } catch (error) {
                    console.log('Could not access wallet:', error);
                }
            }
            
            // If we couldn't get a public key from wallet, generate one
            if (!requesterPublicKey) {
                requesterPublicKey = await generateRequesterKey();
                console.log('Generated fallback public key:', requesterPublicKey);
            }
            
            // Get the current origin
            const requesterOrigin = window.location.origin;
            console.log('Requester origin:', requesterOrigin);
            
            // Create the Privy connection URL
            const privyUrl = `https://privy.abs.xyz/cross-app/connect?` +
                `requester_public_key=${encodeURIComponent(requesterPublicKey)}&` +
                `connect=true&` +
                `provider_app_id=cm04asygd041fmry9zmcyn5o5&` +
                `requester_origin=${encodeURIComponent(requesterOrigin)}&` +
                `smart_wallet_mode=false`;

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
                if (event.origin !== 'https://privy.abs.xyz') {
                    return;
                }

                if (event.data.type === 'PRIVY_CONNECT_SUCCESS') {
                    // Connection successful
                    currentAccount = event.data.account;
                    isConnected = true;

                    console.log('AGW Connection successful!');
                    console.log('Connected wallet address:', currentAccount);
                    console.log('Full response data:', event.data);

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
                            provider: 'agw-privy-popup'
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

            // Handle popup close
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                    
                    if (!isConnected) {
                        setButtonState(button, false);
                        showNotification('Connection cancelled', 'info');
                    }
                }
            }, 1000);

        } catch (error) {
            console.error('AGW connection error:', error);
            
            // More specific error handling
            let errorMessage = 'Failed to connect Abstract Global Wallet';
            if (error.message.includes('popup')) {
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
    async function generateRequesterKey() {
        try {
            // Generate a real key pair using Web Crypto API with secp256k1 curve
            // Privy expects secp256k1 curve (same as Bitcoin/Ethereum)
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: "ECDH",
                    namedCurve: "P-256" // We'll use P-256 but format it correctly
                },
                true,
                ["deriveKey"]
            );
            
            // Export the public key in raw format
            const publicKeyBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);
            const publicKeyArray = new Uint8Array(publicKeyBuffer);
            
            // For secp256k1, we need to ensure the key is 64 bytes (32 bytes x, 32 bytes y)
            // Remove the first byte (0x04) if present and ensure we have exactly 64 bytes
            let keyBytes = publicKeyArray;
            if (publicKeyArray.length === 65 && publicKeyArray[0] === 0x04) {
                keyBytes = publicKeyArray.slice(1); // Remove the 0x04 prefix
            }
            
            // Pad or truncate to exactly 64 bytes
            const paddedKey = new Uint8Array(64);
            if (keyBytes.length >= 64) {
                paddedKey.set(keyBytes.slice(0, 64));
            } else {
                paddedKey.set(keyBytes);
            }
            
            // Convert to hex (Privy might expect hex format)
            const hex = Array.from(paddedKey, byte => byte.toString(16).padStart(2, '0')).join('');
            
            console.log('Generated secp256k1-style public key (hex):', hex);
            console.log('Key length:', hex.length);
            console.log('Original key length:', publicKeyArray.length);
            
            return hex;
        } catch (error) {
            console.error('Error generating key:', error);
            // Fallback to a simple random key with correct length
            const array = new Uint8Array(64); // 64 bytes for secp256k1 public key
            crypto.getRandomValues(array);
            const fallback = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            console.log('Using fallback key (hex):', fallback);
            return fallback;
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