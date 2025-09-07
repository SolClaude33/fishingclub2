//=============================================================================
// RPG Maker MZ - Simple Wallet Connect Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Simple wallet connection for Abstract Mainnet
 * @author Assistant
 *
 * @help SimpleWalletConnect.js
 *
 * This plugin provides simple wallet connection for Abstract Mainnet.
 * It supports MetaMask, WalletConnect, and other wallets.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let currentWallet = null;

    // Function to set button state
    function setButtonState(button, connected, account = null, walletName = '') {
        if (connected && account) {
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

    // Connect wallet
    async function connectWallet() {
        const button = document.getElementById('wallet-connect-btn');
        
        try {
            button.textContent = 'Connecting...';
            button.disabled = true;

            // Check if MetaMask is available
            if (window.ethereum) {
                try {
                    // Request account access
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    
                    if (accounts && accounts.length > 0) {
                        // Switch to Abstract Mainnet
                        try {
                            await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x2085' }], // 8333 in hex
                            });
                        } catch (switchError) {
                            // If the chain doesn't exist, add it
                            if (switchError.code === 4902) {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: '0x2085',
                                        chainName: 'Abstract Mainnet',
                                        nativeCurrency: {
                                            name: 'Abstract Token',
                                            symbol: 'ABS',
                                            decimals: 18,
                                        },
                                        rpcUrls: ['https://api.abs.xyz'],
                                        blockExplorerUrls: ['https://explorer.abs.xyz'],
                                    }],
                                });
                            } else {
                                throw switchError;
                            }
                        }

                        currentAccount = accounts[0];
                        currentWallet = 'MetaMask';
                        isConnected = true;

                        // Update button state
                        setButtonState(button, true, currentAccount, currentWallet);

                        // Show success message
                        showNotification('Wallet connected successfully!', 'success');

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

                    } else {
                        throw new Error('No accounts found');
                    }
                } catch (error) {
                    console.error('Wallet connection error:', error);
                    throw error;
                }
            } else {
                throw new Error('No wallet detected. Please install MetaMask or another wallet.');
            }

        } catch (error) {
            console.error('Wallet connection error:', error);
            
            let errorMessage = 'Failed to connect wallet. ';
            if (error.message.includes('User rejected')) {
                errorMessage += 'Connection was cancelled by user.';
            } else if (error.message.includes('No wallet')) {
                errorMessage += 'Please install a wallet like MetaMask.';
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

    console.log('Simple Wallet Connect plugin loaded - DISABLED');
    return; // Disable this plugin
})();
