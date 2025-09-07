//=============================================================================
// RPG Maker MZ - Abstract Global Wallet + RainbowKit Integration (Official)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Official AGW + RainbowKit integration using @abstract-foundation/agw-react
 * @author Assistant
 *
 * @help WalletConnectAGWRainbowKit.js
 *
 * This plugin integrates Abstract Global Wallet with RainbowKit using the official
 * @abstract-foundation/agw-react package for seamless multi-wallet support.
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
    function setButtonState(button, connected, account = null, walletName = '') {
        if (connected) {
            button.textContent = `${walletName} Connected`;
            button.style.backgroundColor = '#10b981';
            button.style.borderColor = '#10b981';
            button.disabled = false;
            
            if (account) {
                const shortAddress = account.slice(0, 6) + '...' + account.slice(-4);
                button.title = `Connected: ${shortAddress}`;
            }
        } else {
            button.textContent = 'Connect Wallet';
            button.style.backgroundColor = '#3b82f6';
            button.style.borderColor = '#3b82f6';
            button.disabled = false;
            button.title = 'Click to connect your wallet';
        }
    }

    // Load required libraries dynamically
    async function loadLibraries() {
        return new Promise((resolve, reject) => {
            const libraries = [
                'https://unpkg.com/@tanstack/react-query@latest/dist/index.umd.js',
                'https://unpkg.com/viem@2.x/dist/index.umd.js',
                'https://unpkg.com/wagmi@latest/dist/index.umd.js',
                'https://unpkg.com/@rainbow-me/rainbowkit@latest/dist/index.umd.js',
                'https://unpkg.com/@abstract-foundation/agw-client@latest/dist/index.umd.js',
                'https://unpkg.com/@abstract-foundation/agw-react@latest/dist/index.umd.js'
            ];

            let loadedCount = 0;
            const totalLibraries = libraries.length;

            libraries.forEach((src, index) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loadedCount++;
                    console.log(`Loaded library ${index + 1}/${totalLibraries}: ${src}`);
                    if (loadedCount === totalLibraries) {
                        console.log('All AGW + RainbowKit libraries loaded successfully');
                        resolve();
                    }
                };
                script.onerror = () => {
                    console.error(`Failed to load library: ${src}`);
                    reject(new Error(`Failed to load library: ${src}`));
                };
                document.head.appendChild(script);
            });
        });
    }

    // Initialize Wagmi configuration
    function initializeWagmiConfig() {
        try {
            if (!window.viem || !window.wagmi) {
                throw new Error('Required libraries not loaded');
            }

            const { createConfig, http } = window.wagmi;

            // Configure supported chains from config - Solo Abstract Mainnet
            const chains = window.AGWRainbowKitConfig?.chains || [
                {
                    id: 8333,
                    name: 'Abstract Mainnet',
                    network: 'abstract',
                    nativeCurrency: { name: 'Abstract Token', symbol: 'ABS', decimals: 18 },
                    rpcUrls: {
                        default: 'https://api.abs.xyz',
                        public: 'https://api.abs.xyz'
                    },
                    blockExplorers: {
                        default: { name: 'Abstract Explorer', url: 'https://explorer.abs.xyz' }
                    }
                }
            ];

            // Configure transports - Solo Abstract Mainnet
            const transports = {
                [8333]: http('https://api.abs.xyz')
            };

            // Create wagmi config
            wagmiConfig = createConfig({
                chains,
                transports,
                connectors: [
                    // Abstract Global Wallet connector (Principal)
                    new window.wagmi.connectors.abstractWallet({
                        chains,
                    }),
                    // MetaMask connector (Para usuarios que quieran usar MetaMask en Abstract)
                    new window.wagmi.connectors.metaMask({
                        chains,
                        options: {
                            shimDisconnect: true,
                        },
                    }),
                    // WalletConnect connector (Para otras wallets via WalletConnect)
                    new window.wagmi.connectors.walletConnect({
                        chains,
                        options: {
                            projectId: window.AGWRainbowKitConfig?.projectId || 'your-project-id',
                        },
                    }),
                ],
            });

            console.log('Wagmi configuration initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Wagmi config:', error);
            return false;
        }
    }

    // Initialize RainbowKit configuration
    function initializeRainbowKitConfig() {
        try {
            if (!window.RainbowKitProvider) {
                throw new Error('RainbowKit not loaded');
            }

            rainbowKitConfig = {
                appName: window.AGWRainbowKitConfig?.appName || 'Penguin Fishing Club',
                projectId: window.AGWRainbowKitConfig?.projectId || 'your-project-id',
                chains: wagmiConfig.chains,
                connectors: wagmiConfig.connectors,
            };

            console.log('RainbowKit configuration initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize RainbowKit config:', error);
            return false;
        }
    }

    // Create wallet connect button
    function createWalletButton() {
        const button = document.createElement('button');
        button.id = 'wallet-connect-btn';
        button.textContent = 'Connect Wallet';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 24px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;

        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }
        });

        button.addEventListener('click', connectWallet);

        return button;
    }

    // Connect wallet using RainbowKit
    async function connectWallet() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Load libraries if not already loaded
            if (!window.wagmi || !window.RainbowKitProvider) {
                await loadLibraries();
            }

            // Initialize configurations
            if (!wagmiConfig) {
                if (!initializeWagmiConfig()) {
                    throw new Error('Failed to initialize Wagmi configuration');
                }
            }

            if (!rainbowKitConfig) {
                if (!initializeRainbowKitConfig()) {
                    throw new Error('Failed to initialize RainbowKit configuration');
                }
            }

            // Create RainbowKit modal
            const modal = createRainbowKitModal();
            document.body.appendChild(modal);

            // Show modal
            modal.style.display = 'flex';

        } catch (error) {
            console.error('Wallet connection error:', error);
            
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
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(8px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: linear-gradient(135deg, #1f2937, #374151);
            border-radius: 20px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid #4b5563;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Connect Wallet';
        title.style.cssText = `
            color: white;
            text-align: center;
            margin-bottom: 24px;
            font-size: 24px;
            font-weight: 700;
        `;

        const wallets = [
            { id: 'agw', name: 'Abstract Global Wallet', icon: '🌐' },
            { id: 'metamask', name: 'MetaMask', icon: '🦊' },
            { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' }
        ];

        wallets.forEach(wallet => {
            const walletButton = document.createElement('button');
            walletButton.innerHTML = `
                <span style="font-size: 24px; margin-right: 12px;">${wallet.icon}</span>
                <span>${wallet.name}</span>
            `;
            walletButton.style.cssText = `
                width: 100%;
                padding: 16px;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #374151, #4b5563);
                color: white;
                border: 1px solid #6b7280;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            walletButton.addEventListener('mouseenter', () => {
                walletButton.style.background = 'linear-gradient(135deg, #4b5563, #6b7280)';
                walletButton.style.transform = 'translateY(-2px)';
            });

            walletButton.addEventListener('mouseleave', () => {
                walletButton.style.background = 'linear-gradient(135deg, #374151, #4b5563)';
                walletButton.style.transform = 'translateY(0)';
            });

            walletButton.addEventListener('click', () => handleWalletSelection(wallet.id));
            modalContent.appendChild(walletButton);
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        closeButton.addEventListener('click', () => {
            modal.remove();
            const button = document.getElementById('wallet-connect-btn');
            setButtonState(button, false);
        });

        modalContent.appendChild(title);
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

            // Handle different wallet types using official connectors
            if (walletId === 'agw') {
                // Use Abstract Global Wallet connector (Principal)
                try {
                    const connector = wagmiConfig.connectors.find(c => c.id === 'abstractWallet');
                    if (connector) {
                        const result = await connector.connect();
                        address = result.accounts[0];
                    } else {
                        throw new Error('Abstract Global Wallet connector not found');
                    }
                } catch (error) {
                    console.error('AGW connection error:', error);
                    throw error;
                }
            } else if (walletId === 'metamask') {
                // Use MetaMask connector para Abstract
                if (window.ethereum) {
                    try {
                        // Cambiar a Abstract Mainnet si es necesario
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x2085' }], // 8333 en hex
                        });
                        
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                        if (accounts && accounts.length > 0) {
                            address = accounts[0];
                        }
                    } catch (error) {
                        console.error('MetaMask connection error:', error);
                        throw new Error('User rejected connection or failed to switch to Abstract network');
                    }
                } else {
                    throw new Error('MetaMask not detected. Please install MetaMask.');
                }
            } else if (walletId === 'walletconnect') {
                // Use WalletConnect connector
                try {
                    const connector = wagmiConfig.connectors.find(c => c.id === 'walletConnect');
                    if (connector) {
                        const result = await connector.connect();
                        address = result.accounts[0];
                    } else {
                        throw new Error('WalletConnect connector not found');
                    }
                } catch (error) {
                    console.error('WalletConnect error:', error);
                    throw error;
                }
            } else {
                throw new Error('Unsupported wallet type');
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

    // Show notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10002;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 12px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Compatibility functions
    window.getPlayerWallet = function() { return currentAccount; };
    window.getWalletProvider = function() { return currentWallet; };

    // Initialize wallet button when the game starts
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        
        // Load libraries and initialize
        loadLibraries().then(() => {
            setTimeout(() => {
                if (!document.getElementById('wallet-connect-btn')) {
                    const walletButton = createWalletButton();
                    document.body.appendChild(walletButton);
                }
            }, 1000);
            setTimeout(() => {
                if (window.resetFishingSystem) {
                    console.log('resetting fishing system when game starts');
                    window.resetFishingSystem();
                }
            }, 2000);
        }).catch(error => {
            console.error('Failed to load AGW + RainbowKit libraries:', error);
            showNotification('Failed to initialize wallet connection.', 'error');
        });
    };

    console.log('Abstract Global Wallet + RainbowKit (Official) plugin loaded');
})();
