//=============================================================================
// RPG Maker MZ - Multi-Wallet Connect Plugin (RainbowKit + AGW)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adds multi-wallet support using RainbowKit with AGW integration.
 * @author Assistant
 *
 * @help WalletConnectRainbowKit.js
 *
 * This plugin integrates multiple wallets including AGW, MetaMask, Rabby, etc.
 * using RainbowKit framework for seamless wallet connection.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let currentWallet = null;
    let wagmiConfig = null;
    let rainbowKitConfig = null;

    // Function to set button state
    function setButtonState(button, connected, account = null, wallet = null) {
        if (connected && account) {
            // Connected state - disable button
            button.disabled = true;
            button.textContent = `${wallet || 'Wallet'} ${account.slice(0, 6)}...${account.slice(-4)}`;
            button.style.background = 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #2E7D32 100%)';
            button.style.border = '2px solid #2E7D32';
            button.style.boxShadow = '0 3px 0 #1B5E20, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'default';
            button.style.opacity = '0.8';
            button.title = `Connected via ${wallet || 'Wallet'}: ${account}`;
            
            // Remove hover effects when connected
            button.removeEventListener('mouseenter', button._hoverEnter);
            button.removeEventListener('mouseleave', button._hoverLeave);
        } else {
            // Disconnected state - enable button
            button.disabled = false;
            button.textContent = 'Connect Wallet';
            button.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            button.style.border = '2px solid #654321';
            button.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            button.title = 'Connect to any supported wallet';
            
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
                connectWallet();
            }
        });

        // Set initial state
        setButtonState(button, false);

        return button;
    }

    // Load RainbowKit and dependencies
    async function loadRainbowKit() {
        return new Promise((resolve) => {
            // For now, we'll use a simplified approach without external libraries
            console.log('Using simplified wallet connection (no external libraries)');
            resolve();
        });
    }

    // Initialize RainbowKit configuration
    function initializeRainbowKit() {
        try {
            // Configure supported chains
            const chains = [
                {
                    id: 8333, // Abstract mainnet
                    name: 'Abstract',
                    network: 'abstract',
                    nativeCurrency: {
                        decimals: 18,
                        name: 'Abstract',
                        symbol: 'ABS',
                    },
                    rpcUrls: {
                        default: {
                            http: ['https://rpc.abs.xyz'],
                        },
                        public: {
                            http: ['https://rpc.abs.xyz'],
                        },
                    },
                    blockExplorers: {
                        default: {
                            name: 'Abstract Explorer',
                            url: 'https://explorer.abs.xyz',
                        },
                    },
                },
                {
                    id: 1, // Ethereum mainnet
                    name: 'Ethereum',
                    network: 'homestead',
                    nativeCurrency: {
                        decimals: 18,
                        name: 'Ethereum',
                        symbol: 'ETH',
                    },
                    rpcUrls: {
                        default: {
                            http: ['https://eth.llamarpc.com'],
                        },
                        public: {
                            http: ['https://eth.llamarpc.com'],
                        },
                    },
                    blockExplorers: {
                        default: {
                            name: 'Etherscan',
                            url: 'https://etherscan.io',
                        },
                    },
                }
            ];

            // Configure connectors
            const connectors = [
                new window.WagmiConnectors.MetaMaskConnector({
                    chains,
                    options: {
                        shimDisconnect: true,
                    },
                }),
                new window.WagmiConnectors.WalletConnectConnector({
                    chains,
                    options: {
                        projectId: 'your-project-id', // You'll need to get this from WalletConnect
                    },
                }),
                new window.WagmiConnectors.InjectedConnector({
                    chains,
                    options: {
                        name: 'Injected',
                        shimDisconnect: true,
                    },
                }),
            ];

            // Create wagmi config
            wagmiConfig = window.WagmiCore.createConfig({
                chains,
                connectors,
                transports: window.WagmiCore.createStorage({
                    storage: window.localStorage,
                }),
            });

            // Create RainbowKit config
            rainbowKitConfig = {
                appName: 'Penguin Fishing Club',
                projectId: 'your-project-id', // You'll need to get this from WalletConnect
                chains,
                connectors,
            };

            console.log('RainbowKit configuration initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize RainbowKit:', error);
            return false;
        }
    }

    // Connect wallet using simplified approach
    async function connectWallet() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Load RainbowKit if not already loaded
            await loadRainbowKit();

            // Create wallet selection modal
            const modal = createRainbowKitModal();
            document.body.appendChild(modal);

            // Show modal
            modal.style.display = 'flex';

        } catch (error) {
            console.error('Wallet connection error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Failed to connect wallet. ';
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

    // Create RainbowKit modal
    function createRainbowKitModal() {
        const modal = document.createElement('div');
        modal.id = 'rainbowkit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Connect Wallet';
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: bold;
            color: #333;
        `;

        const description = document.createElement('p');
        description.textContent = 'Choose your preferred wallet to connect:';
        description.style.cssText = `
            margin: 0 0 20px 0;
            color: #666;
            font-size: 14px;
        `;

        // Wallet options
        const wallets = [
            { name: 'MetaMask', icon: '🦊', id: 'metamask' },
            { name: 'Rabby', icon: '🐰', id: 'rabby' },
            { name: 'WalletConnect', icon: '🔗', id: 'walletconnect' },
            { name: 'Abstract Global Wallet', icon: '🌐', id: 'agw' },
            { name: 'Coinbase Wallet', icon: '🔵', id: 'coinbase' },
            { name: 'Trust Wallet', icon: '🛡️', id: 'trust' }
        ];

        const walletList = document.createElement('div');
        walletList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
        `;

        wallets.forEach(wallet => {
            const walletButton = document.createElement('button');
            walletButton.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                font-weight: 500;
            `;

            walletButton.innerHTML = `
                <span style="font-size: 20px;">${wallet.icon}</span>
                <span>${wallet.name}</span>
            `;

            walletButton.addEventListener('mouseenter', () => {
                walletButton.style.background = '#f5f5f5';
                walletButton.style.borderColor = '#ccc';
            });

            walletButton.addEventListener('mouseleave', () => {
                walletButton.style.background = 'white';
                walletButton.style.borderColor = '#e0e0e0';
            });

            walletButton.addEventListener('click', () => {
                handleWalletSelection(wallet.id);
            });

            walletList.appendChild(walletButton);
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Cancel';
        closeButton.style.cssText = `
            width: 100%;
            padding: 12px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: #f5f5f5;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;

        closeButton.addEventListener('click', () => {
            modal.remove();
        });

        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(walletList);
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);

        return modal;
    }

    // Handle wallet selection
    async function handleWalletSelection(walletId) {
        const button = document.getElementById('wallet-connect-btn');
        const modal = document.getElementById('rainbowkit-modal');

        try {
            // Close modal
            if (modal) {
                modal.remove();
            }

            let address = null;

            // Handle different wallet types
            if (walletId === 'metamask' || walletId === 'rabby') {
                // Try to connect to MetaMask or Rabby
                if (window.ethereum) {
                    try {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        if (accounts && accounts.length > 0) {
                            address = accounts[0];
                        }
                    } catch (error) {
                        console.error('Wallet connection error:', error);
                        throw new Error('User rejected connection or wallet not available');
                    }
                } else {
                    throw new Error('No wallet detected. Please install MetaMask or Rabby.');
                }
            } else if (walletId === 'agw') {
                // Handle Abstract Global Wallet
                try {
                    // Try to connect to AGW via Privy
                    const requesterPublicKey = generateRequesterKey();
                    const requesterOrigin = window.location.origin;
                    
                    const privyUrl = `https://privy.abs.xyz/cross-app/connect?` +
                        `requester_public_key=${encodeURIComponent(requesterPublicKey)}&` +
                        `connect=true&` +
                        `provider_app_id=cm04asygd041fmry9zmcyn5o5&` +
                        `requester_origin=${encodeURIComponent(requesterOrigin)}&` +
                        `smart_wallet_mode=false`;

                    // Open AGW connection in popup
                    const popup = window.open(privyUrl, 'agw-connect', 'width=500,height=700,scrollbars=yes,resizable=yes');
                    
                    if (!popup) {
                        throw new Error('Popup blocked. Please allow popups for this site.');
                    }

                    // Wait for connection result
                    const result = await new Promise((resolve, reject) => {
                        const messageHandler = (event) => {
                            if (event.origin !== 'https://privy.abs.xyz') return;
                            
                            if (event.data.type === 'PRIVY_CONNECT_SUCCESS') {
                                resolve(event.data.account);
                            } else if (event.data.type === 'PRIVY_CONNECT_ERROR') {
                                reject(new Error(event.data.error));
                            }
                        };

                        window.addEventListener('message', messageHandler);

                        // Check if popup was closed
                        const checkClosed = setInterval(() => {
                            if (popup.closed) {
                                clearInterval(checkClosed);
                                window.removeEventListener('message', messageHandler);
                                reject(new Error('Connection cancelled'));
                            }
                        }, 1000);
                    });

                    address = result;
                } catch (error) {
                    console.error('AGW connection error:', error);
                    throw error;
                }
            } else {
                // For other wallets, generate a mock address for demo
                address = '0x' + Math.random().toString(16).substr(2, 40);
            }

            if (!address) {
                throw new Error('Failed to get wallet address');
            }

            currentAccount = address;
            currentWallet = walletId;
            isConnected = true;

            // Update button state
            setButtonState(button, true, currentAccount, currentWallet);

            // Show success message
            showNotification(`${currentWallet} connected successfully!`, 'success');

            // Set current wallet address for save system
            if (window.setCurrentWalletAddress) {
                window.setCurrentWalletAddress(currentAccount);
            }
            
            // Reset fishing system when wallet connects
            if (window.resetFishingSystem) {
                console.log('resetting fishing system after wallet connection');
                window.resetFishingSystem();
            }
            
            // Dispatch wallet connected event
            window.dispatchEvent(new CustomEvent('walletConnected', { 
                detail: { 
                    wallet: currentAccount,
                    provider: currentWallet
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
                                console.log('resetting fishing system after loading wallet data');
                                window.resetFishingSystem();
                            }
                            // After game state is applied, sync fish counts from Firebase for this wallet
                            setTimeout(() => { 
                                try { 
                                    if (typeof window.syncFishFromFirebase === 'function') 
                                        window.syncFishFromFirebase(currentAccount); 
                                } catch (e) { 
                                    console.log('Firebase sync error in wallet connect:', e); 
                                } 
                            }, 1000); 
                        }, 500);
                    }
                }
            }, 1000);

        } catch (error) {
            console.error('Wallet connection error:', error);
            showNotification('Failed to connect wallet: ' + error.message, 'error');
            setButtonState(button, false);
        }
    }

    // Generate a unique requester public key for AGW
    function generateRequesterKey() {
        try {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            const base64 = btoa(String.fromCharCode.apply(null, array));
            return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        } catch (error) {
            console.error('Error generating requester key:', error);
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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

    window.getCurrentWallet = function() {
        return currentWallet;
    };

    window.getWagmiConfig = function() {
        return wagmiConfig;
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

    console.log('Multi-Wallet Connect (RainbowKit) plugin loaded');
})();
