/*:
 * @target MZ
 * @plugindesc PrivyAGWConnect - Simple React-based Abstract Global Wallet connection
 * @author Your Name
 * @url https://your-website.com
 * @help PrivyAGWConnect.js
 * 
 * This plugin provides a simple React-based wallet connection using Privy and Abstract Global Wallet.
 * 
 * @param appId
 * @text Privy App ID
 * @desc Your Privy App ID
 * @type string
 * @default cmfa4s0v800s8180b9c8eiatl
 * 
 * @param buttonText
 * @text Button Text
 * @desc Text to display on the connect button
 * @type string
 * @default Connect Abstract Global Wallet
 * 
 * @param buttonPosition
 * @text Button Position
 * @desc Position of the wallet button
 * @type select
 * @option top-right
 * @option top-left
 * @option bottom-right
 * @option bottom-left
 * @default top-right
 * 
 * @param useReact
 * @text Use React
 * @desc Use React-based wallet connection
 * @type boolean
 * @default true
 */

(() => {
    'use strict';

    // Plugin parameters
    const parameters = PluginManager.parameters('PrivyAGWConnect');
    const appId = parameters['appId'] || 'cmfa4s0v800s8180b9c8eiatl';
    const buttonText = parameters['buttonText'] || 'Connect Abstract Global Wallet';
    const buttonPosition = parameters['buttonPosition'] || 'top-right';
    const useReact = parameters['useReact'] === 'true' || parameters['useReact'] === true;

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let reactPrivyWallet = null;
    let walletContainer = null;

    console.log('🚀 PrivyAGWConnect: Simple React-based AGW connection initialized');
    console.log('🔧 Plugin parameters:', { appId, buttonText, buttonPosition, useReact });
    console.log('🔥 VERSION 2.0.2 - Simple React Implementation');

    // Load React Privy Wallet library
    function loadReactPrivyWallet() {
        console.log('📦 Loading React Privy Wallet library...');
        return new Promise((resolve, reject) => {
            if (window.ReactPrivyWallet) {
                console.log('✅ ReactPrivyWallet already loaded');
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = './js/libs/ReactPrivyWallet.js';
            script.onload = () => {
                console.log('✅ ReactPrivyWallet loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load ReactPrivyWallet');
                reject(new Error('Failed to load ReactPrivyWallet'));
            };
            document.head.appendChild(script);
        });
    }

    // Initialize the wallet connection
    async function initializeWalletConnection() {
        try {
            console.log('🔄 Initializing wallet connection...');
            
            // Load the React library
            await loadReactPrivyWallet();
            
            // Create the wallet container
            createWalletContainer();
            
            // Initialize the React wallet
            reactPrivyWallet = new window.ReactPrivyWallet();
            
            // Set up callbacks
            reactPrivyWallet.onConnect((address, user) => {
                console.log('✅ Wallet connected:', address);
                isConnected = true;
                currentAccount = address;
                
                // Update UI
                updateWalletUI();
                
                // Trigger game events
                $gameMessage.add('Wallet connected: ' + address.slice(0, 6) + '...' + address.slice(-4));
            });
            
            reactPrivyWallet.onDisconnect(() => {
                console.log('❌ Wallet disconnected');
                isConnected = false;
                currentAccount = null;
                
                // Update UI
                updateWalletUI();
                
                // Trigger game events
                $gameMessage.add('Wallet disconnected');
            });
            
            reactPrivyWallet.onError((error) => {
                console.error('❌ Wallet error:', error);
                $gameMessage.add('Wallet connection error: ' + error.message);
            });
            
            // Initialize the React component
            reactPrivyWallet.initialize('privy-wallet-container');
            
            console.log('✅ Wallet connection initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize wallet connection:', error);
            $gameMessage.add('Failed to initialize wallet connection');
        }
    }

    // Create wallet container
    function createWalletContainer() {
        // Remove existing container if any
        const existing = document.getElementById('privy-wallet-container');
        if (existing) {
            existing.remove();
        }
        
        // Create new container
        walletContainer = document.createElement('div');
        walletContainer.id = 'privy-wallet-container';
        
        // Set position based on parameter
        const position = buttonPosition.split('-');
        const vertical = position[0];
        const horizontal = position[1];
        
        walletContainer.style.cssText = `
            position: fixed;
            ${vertical}: 20px;
            ${horizontal}: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: 2px solid #4CAF50;
            font-family: Arial, sans-serif;
            min-width: 200px;
        `;
        
        document.body.appendChild(walletContainer);
        console.log('✅ Wallet container created at', buttonPosition);
    }

    // Update wallet UI
    function updateWalletUI() {
        if (!walletContainer) return;
        
        // This will be handled by the React component
        console.log('🔄 Wallet UI updated');
    }

    // Scene Manager hook
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        console.log('🎬 SceneManager.run called with:', sceneClass.name);
        
        // Initialize wallet connection when the game starts
        if (sceneClass === Scene_Boot) {
            console.log('⏰ Setting timeout for wallet initialization...');
            setTimeout(() => {
                initializeWalletConnection();
            }, 2000); // Wait 2 seconds for the game to load
        }
        
        return _SceneManager_run.call(this, sceneClass);
    };

    // Game events
    window.$gameWallet = {
        isConnected: () => isConnected,
        getAccount: () => currentAccount,
        connect: () => {
            if (reactPrivyWallet) {
                // The React component handles the connection
                console.log('🔧 Connect requested');
            }
        },
        disconnect: () => {
            if (reactPrivyWallet) {
                // The React component handles the disconnection
                console.log('🔧 Disconnect requested');
            }
        }
    };

    console.log('✅ PrivyAGWConnect plugin loaded successfully');
})();