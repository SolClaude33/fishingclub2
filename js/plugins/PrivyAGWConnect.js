/*:
 * @target MZ
 * @plugindesc PrivyAGWConnect v2.0.0 - React-based Privy SDK integration for Abstract Global Wallet
 * @author SolClaude33
 * @url https://github.com/SolClaude33/fishingclub2
 * @help PrivyAGWConnect.js
 * 
 * This plugin integrates React-based Privy SDK with Abstract Global Wallet for seamless wallet connectivity.
 * 
 * @param appId
 * @text Privy App ID
 * @desc Your Privy application ID
 * @type text
 * @default cm04asygd041fmry9zmcyn5o5
 * 
 * @param buttonText
 * @text Button Text
 * @desc Text displayed on the connect button
 * @type text
 * @default Connect AGW
 * 
 * @param buttonPosition
 * @text Button Position
 * @desc Position of the connect button
 * @type select
 * @option Top Left
 * @value top-left
 * @option Top Right
 * @value top-right
 * @option Bottom Left
 * @value bottom-left
 * @option Bottom Right
 * @value bottom-right
 * @default top-right
 * 
 * @param useReact
 * @text Use React
 * @desc Use React-based wallet connection (recommended)
 * @type boolean
 * @default true
 */

(() => {
    'use strict';

    // Plugin parameters
    const parameters = PluginManager.parameters('PrivyAGWConnect');
    const appId = parameters['appId'] || 'cm04asygd041fmry9zmcyn5o5';
    const buttonText = parameters['buttonText'] || 'Connect AGW';
    const buttonPosition = parameters['buttonPosition'] || 'top-right';
    const useReact = parameters['useReact'] === 'true' || parameters['useReact'] === true;

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let reactWalletConnect = null;
    let walletContainer = null;

    console.log('🚀 PrivyAGWConnect: React-based AGW connection initialized');
    console.log('🔧 Plugin parameters:', { appId, buttonText, buttonPosition, useReact });
    console.log('🔥 FORZANDO ACTUALIZACION - VERSION 2.0.1');
    console.log('🔍 Raw useReact parameter:', parameters['useReact'], 'Type:', typeof parameters['useReact']);
    
    // Force useReact to true for debugging
    const forceUseReact = true;
    console.log('🚀 FORCING useReact to true for debugging');

    // Load React Wallet Connect library
    function loadReactWalletConnect() {
        console.log('📦 loadReactWalletConnect: Starting to load React library...');
        return new Promise((resolve, reject) => {
            if (window.ReactWalletConnect) {
                console.log('✅ ReactWalletConnect already loaded');
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = './js/libs/ReactWalletConnect.js';
            script.onload = () => {
                console.log('✅ ReactWalletConnect library loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load ReactWalletConnect library');
                reject(new Error('Failed to load ReactWalletConnect library'));
            };
            document.head.appendChild(script);
            console.log('📤 Script tag added to head');
        });
    }

    // Create wallet container
    function createWalletContainer() {
        if (walletContainer) return walletContainer;

        walletContainer = document.createElement('div');
        walletContainer.id = 'react-wallet-connect';
        walletContainer.style.cssText = `
            position: fixed;
            z-index: 10000;
            ${buttonPosition.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
            ${buttonPosition.includes('left') ? 'left: 20px;' : 'right: 20px;'}
            font-family: Arial, sans-serif;
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .wallet-connect-container {
                background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                color: white;
                min-width: 200px;
                text-align: center;
            }
            .wallet-button {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                margin: 5px;
                min-width: 150px;
            }
            .wallet-button:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .wallet-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .wallet-info {
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 10px;
                margin: 10px 0;
                font-size: 12px;
                word-break: break-all;
            }
            .wallet-error {
                color: #ff6b6b;
                font-size: 12px;
                margin-top: 5px;
            }
            .wallet-loading {
                color: #ffd93d;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(walletContainer);
        console.log('📦 Container appended to DOM:', walletContainer);
        console.log('📦 Container in DOM check:', document.getElementById('react-wallet-connect'));
        return walletContainer;
    }

    // Initialize React wallet connection
    async function initializeReactWallet() {
        console.log('🚀 initializeReactWallet: Starting...');
        try {
            console.log('📦 Loading React wallet connect...');
            await loadReactWalletConnect();
            
            console.log('🔧 Creating ReactWalletConnect instance...');
            reactWalletConnect = new window.ReactWalletConnect();
            
            console.log('📦 Creating wallet container...');
            const container = createWalletContainer();
            console.log('📦 Container created:', container.id);
            
            console.log('🎯 Initializing React wallet with container...');
            console.log('🔍 React available:', typeof window.React);
            console.log('🔍 ReactDOM available:', typeof window.ReactDOM);
            console.log('🔍 Privy available:', typeof window.PrivyReactAuth);
            await reactWalletConnect.initialize(container.id, {
                onConnect: (address, user) => {
                    console.log('✅ Wallet connected:', address);
                    currentAccount = address;
                    isConnected = true;
                    $gameMessage.add(`Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
                },
                onDisconnect: () => {
                    console.log('❌ Wallet disconnected');
                    currentAccount = null;
                    isConnected = false;
                    $gameMessage.add('Wallet disconnected');
                },
                onError: (error) => {
                    console.error('💥 Wallet error:', error);
                    $gameMessage.add('Wallet connection error');
                }
            });

            console.log('✅ React wallet connection initialized successfully');
            return true;
        } catch (error) {
            console.error('💥 Failed to initialize React wallet:', error);
            return false;
        }
    }

    // Fallback: Simple popup method
    async function connectAGWSimple() {
        try {
            const requesterOrigin = window.location.origin;
            const privyUrl = `https://privy.abs.xyz/cross-app/connect?` +
                `provider_app_id=${appId}&` +
                `requester_origin=${encodeURIComponent(requesterOrigin)}&` +
                `redirect_uri=${encodeURIComponent(requesterOrigin)}`;

            console.log('Opening Privy connection:', privyUrl);

            const popup = window.open(
                privyUrl,
                'privy-connect',
                'width=500,height=700,scrollbars=yes,resizable=yes'
            );

            if (!popup) {
                window.location.href = privyUrl;
                return;
            }

            // Listen for messages
            const messageHandler = (event) => {
                if (event.origin !== 'https://privy.abs.xyz' && event.origin !== 'https://dashboard.privy.io') {
                    return;
                }

                if (event.data.type === 'PRIVY_CONNECT_SUCCESS' || event.data.type === 'CONNECT_SUCCESS') {
                    currentAccount = event.data.account || event.data.walletAddress || event.data.address;
                    isConnected = true;
                    $gameMessage.add(`Wallet connected: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`);
                    popup.close();
                    window.removeEventListener('message', messageHandler);
                }
            };

            window.addEventListener('message', messageHandler);

            // Check if popup is closed
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                }
            }, 1000);

        } catch (error) {
            console.error('Connection error:', error);
            $gameMessage.add('Failed to connect wallet');
        }
    }

    // Main connection function
    async function connectAGW() {
        if (useReact && reactWalletConnect) {
            // React method - the component handles the connection
            console.log('Using React wallet connection');
        } else {
            // Fallback to simple popup method
            await connectAGWSimple();
        }
    }

    // Get wallet state
    function getWalletState() {
        if (useReact && reactWalletConnect) {
            return reactWalletConnect.getWalletState();
        }
        return {
            address: currentAccount,
            isConnected: isConnected
        };
    }

    // Initialize when scene starts
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        console.log('🎬 SceneManager.run called with:', sceneClass.name);
        _SceneManager_run.call(this, sceneClass);
        
        if (forceUseReact) {
            console.log('⏰ Setting timeout for React wallet initialization...');
            // Initialize React wallet connection
            setTimeout(async () => {
                console.log('⏰ Timeout triggered - initializing React wallet...');
                await initializeReactWallet();
            }, 2000);
        } else {
            console.log('❌ useReact is false, not initializing React wallet');
        }
    };

    // Plugin commands
    PluginManager.registerCommand('PrivyAGWConnect', 'connectWallet', () => {
        connectAGW();
    });

    PluginManager.registerCommand('PrivyAGWConnect', 'disconnectWallet', () => {
        if (useReact && reactWalletConnect) {
            // React component handles disconnection
            console.log('Disconnect handled by React component');
        } else {
            currentAccount = null;
            isConnected = false;
            $gameMessage.add('Wallet disconnected');
        }
    });

    PluginManager.registerCommand('PrivyAGWConnect', 'getWalletAddress', () => {
        const state = getWalletState();
        if (state.isConnected) {
            $gameMessage.add(`Wallet: ${state.address}`);
        } else {
            $gameMessage.add('No wallet connected');
        }
    });

    // Make functions globally available
    window.PrivyAGWConnect = {
        connect: connectAGW,
        disconnect: () => {
            if (useReact && reactWalletConnect) {
                // React component handles disconnection
            } else {
                currentAccount = null;
                isConnected = false;
            }
        },
        getState: getWalletState,
        isConnected: () => isConnected,
        getAddress: () => currentAccount
    };

})();