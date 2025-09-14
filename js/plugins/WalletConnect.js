//=============================================================================
// RPG Maker MZ - Abstract Global Wallet Connect Plugin (Adapted from AGW React)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Adds Abstract Global Wallet integration via Privy (adapted from AGW React version).
 * @author Assistant
 *
 * @help WalletConnect.js
 *
 * This plugin integrates Abstract Global Wallet using Privy authentication.
 * Adapted from a working React implementation to vanilla JS for RPG Maker MZ.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Global state
    let isConnected = false;
    let currentAccount = null;
    let userInfo = null;

    // Function to set button state
    function setButtonState(button, connected, account = null) {
        if (connected && account) {
            button.disabled = true;
            button.textContent = `AGW ${account.slice(0, 6)}...${account.slice(-4)}`;
            button.style.background = 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #2E7D32 100%)';
            button.style.border = '2px solid #2E7D32';
            button.style.boxShadow = '0 3px 0 #1B5E20, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'default';
            button.style.opacity = '0.8';
            button.title = `Connected via Abstract Global Wallet: ${account}`;
            button.removeEventListener('mouseenter', button._hoverEnter);
            button.removeEventListener('mouseleave', button._hoverLeave);
        } else {
            button.disabled = false;
            button.textContent = 'Connect AGW';
            button.style.background = 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
            button.style.border = '2px solid #654321';
            button.style.boxShadow = '0 3px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            button.title = 'Connect with Abstract Global Wallet';
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
        button.addEventListener('click', (e) => {
            if (!button.disabled) {
                connectAGW();
            }
        });
        setButtonState(button, false);
        return button;
    }

    // Inicializa Privy solo una vez
    let privyClient = null;
    function getPrivyClient() {
        if (!privyClient) {
            privyClient = new window.Privy.PrivyClient({
                appId: 'cm04asygd041fmry9zmcyn5o5'
            });
        }
        return privyClient;
    }

    async function connectAGW() {
        const button = document.getElementById('wallet-connect-btn');
        try {
            button.textContent = 'Redirigiendo...';
            button.disabled = true;

            const privy = getPrivyClient();
            // Esto abre el popup y maneja el flujo igual que React
            await privy.loginWithCrossAppAccount();

            // Espera a que el usuario esté autenticado
            const user = await privy.getUser();
            if (user && user.wallet && user.wallet.address) {
                currentAccount = user.wallet.address;
                userInfo = user;
                isConnected = true;
                setButtonState(button, true, currentAccount);
                showNotification('¡Abstract Global Wallet conectada!', 'success');
                if (window.setCurrentWalletAddress) window.setCurrentWalletAddress(currentAccount);
                if (window.resetFishingSystem) window.resetFishingSystem();
                window.dispatchEvent(new CustomEvent('walletConnected', {
                    detail: {
                        wallet: currentAccount,
                        provider: 'agw-privy',
                        user: userInfo
                    }
                }));
                setTimeout(() => {
                    if (window.walletSaveSystem && window.walletSaveSystem.loadWalletData) {
                        const savedData = window.walletSaveSystem.loadWalletData(currentAccount);
                        if (savedData) {
                            window.walletSaveSystem.applyGameState(savedData);
                            showNotification('¡Progreso cargado!', 'success');
                            setTimeout(() => {
                                if (window.resetFishingSystem) window.resetFishingSystem();
                                setTimeout(() => {
                                    try {
                                        if (typeof window.syncFishFromFirebase === 'function') window.syncFishFromFirebase();
                                    } catch (e) {}
                                }, 200);
                            }, 500);
                        } else {
                            showNotification('Nuevo juego para esta wallet', 'info');
                            setTimeout(() => {
                                if (window.resetFishingSystem) window.resetFishingSystem();
                                setTimeout(() => {
                                    try {
                                        if (typeof window.syncFishFromFirebase === 'function') window.syncFishFromFirebase();
                                    } catch (e) {}
                                }, 200);
                            }, 500);
                        }
                    }
                }, 1000);
            } else {
                showNotification('No se pudo obtener la wallet', 'error');
                setButtonState(button, false);
            }
        } catch (error) {
            showNotification('Error al conectar: ' + (error.message || error), 'error');
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
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Compatibilidad con otros sistemas del juego
    window.getPlayerWallet = function() {
        return currentAccount;
    };
    window.getAGWUserInfo = function() {
        return userInfo;
    };

    // Inicializar el botón de wallet al iniciar el juego
    const _SceneManager_run = SceneManager.run;
    SceneManager.run = function(sceneClass) {
        _SceneManager_run.call(this, sceneClass);
        setTimeout(() => {
            if (!document.getElementById('wallet-connect-btn')) {
                const walletButton = createWalletButton();
                document.body.appendChild(walletButton);
            }
        }, 1000);
        setTimeout(() => {
            if (window.resetFishingSystem) {
                window.resetFishingSystem();
            }
        }, 2000);
    };

    console.log('Abstract Global Wallet (Privy, AGW React logic) plugin loaded');
})();



