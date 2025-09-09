// React Wallet Connect Component for RPG Maker MZ
// This file provides React-based wallet connection functionality

class ReactWalletConnect {
    constructor() {
        this.isReactLoaded = false;
        this.isPrivyLoaded = false;
        this.walletAddress = null;
        this.isConnected = false;
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onError: null
        };
    }

    // Load React and dependencies
    async loadReact() {
        if (this.isReactLoaded) return;

        return new Promise((resolve, reject) => {
            // Load React
            const reactScript = document.createElement('script');
            reactScript.src = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
            reactScript.crossOrigin = 'anonymous';
            reactScript.onload = () => {
                // Load React DOM
                const reactDOMScript = document.createElement('script');
                reactDOMScript.src = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
                reactDOMScript.crossOrigin = 'anonymous';
                reactDOMScript.onload = () => {
                    this.isReactLoaded = true;
                    resolve();
                };
                reactDOMScript.onerror = reject;
                document.head.appendChild(reactDOMScript);
            };
            reactScript.onerror = reject;
            document.head.appendChild(reactScript);
        });
    }

    // Load Privy SDK
    async loadPrivy() {
        if (this.isPrivyLoaded) return;

        return new Promise((resolve, reject) => {
            const privyScript = document.createElement('script');
            privyScript.src = 'https://unpkg.com/@privy-io/react-auth@2.24.0/dist/index.umd.js';
            privyScript.onload = () => {
                this.isPrivyLoaded = true;
                resolve();
            };
            privyScript.onerror = reject;
            document.head.appendChild(privyScript);
        });
    }

    // Create wallet connect component
    createWalletConnectComponent(containerId) {
        const { useState, useEffect } = React;
        const { PrivyProvider, usePrivy } = window.PrivyReactAuth;

        const WalletConnectButton = () => {
            const { ready, authenticated, user, login, logout } = usePrivy();
            const [isConnecting, setIsConnecting] = useState(false);
            const [error, setError] = useState(null);

            useEffect(() => {
                if (authenticated && user && user.wallet) {
                    this.walletAddress = user.wallet.address;
                    this.isConnected = true;
                    if (this.callbacks.onConnect) {
                        this.callbacks.onConnect(user.wallet.address, user);
                    }
                }
            }, [authenticated, user]);

            const handleConnect = async () => {
                setIsConnecting(true);
                setError(null);
                
                try {
                    // Force Privy cross-app connect instead of default login
                    const requesterOrigin = window.location.origin;
                    const privyUrl = `https://privy.abs.xyz/cross-app/connect?` +
                        `provider_app_id=cm04asygd041fmry9zmcyn5o5&` +
                        `requester_origin=${encodeURIComponent(requesterOrigin)}&` +
                        `redirect_uri=${encodeURIComponent(requesterOrigin)}`;

                    // Open in popup
                    const popup = window.open(
                        privyUrl,
                        'privy-connect',
                        'width=500,height=700,scrollbars=yes,resizable=yes'
                    );

                    if (!popup) {
                        // Fallback to redirect
                        window.location.href = privyUrl;
                        return;
                    }

                    // Listen for messages from Privy
                    const messageHandler = (event) => {
                        if (event.origin !== 'https://privy.abs.xyz' && event.origin !== 'https://dashboard.privy.io') {
                            return;
                        }

                        if (event.data.type === 'PRIVY_CONNECT_SUCCESS' || event.data.type === 'CONNECT_SUCCESS' || event.data.type === 'WALLET_CONNECTED') {
                            const address = event.data.account || event.data.walletAddress || event.data.address;
                            this.walletAddress = address;
                            this.isConnected = true;
                            
                            if (this.callbacks.onConnect) {
                                this.callbacks.onConnect(address, event.data.user);
                            }
                            
                            popup.close();
                            window.removeEventListener('message', messageHandler);
                            setIsConnecting(false);
                        }
                    };

                    window.addEventListener('message', messageHandler);

                    // Check if popup is closed
                    const checkClosed = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(checkClosed);
                            window.removeEventListener('message', messageHandler);
                            setIsConnecting(false);
                        }
                    }, 1000);

                } catch (error) {
                    console.error('Connection error:', error);
                    setError('Failed to connect wallet');
                    if (this.callbacks.onError) {
                        this.callbacks.onError(error);
                    }
                    setIsConnecting(false);
                }
            };

            const handleDisconnect = async () => {
                try {
                    await logout();
                    this.walletAddress = null;
                    this.isConnected = false;
                    if (this.callbacks.onDisconnect) {
                        this.callbacks.onDisconnect();
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    if (this.callbacks.onError) {
                        this.callbacks.onError(error);
                    }
                }
            };

            if (!ready) {
                return React.createElement('div', { className: 'wallet-loading' }, 'Loading...');
            }

            return React.createElement('div', { className: 'wallet-connect-container' },
                authenticated && this.walletAddress ? 
                    React.createElement('div', { className: 'wallet-connected' },
                        React.createElement('div', { className: 'wallet-info success' },
                            React.createElement('strong', null, 'Connected!'),
                            React.createElement('br'),
                            this.walletAddress
                        ),
                        React.createElement('button', { 
                            className: 'wallet-button disconnect',
                            onClick: handleDisconnect 
                        }, 'Disconnect Wallet')
                    ) :
                    React.createElement('div', { className: 'wallet-disconnected' },
                        React.createElement('button', { 
                            className: 'wallet-button connect',
                            onClick: handleConnect,
                            disabled: isConnecting
                        }, isConnecting ? 'Connecting...' : 'Connect Abstract Global Wallet'),
                        error && React.createElement('div', { className: 'wallet-error' }, error)
                    )
            );
        };

        const App = () => {
            return React.createElement(PrivyProvider, { 
                appId: "cm04asygd041fmry9zmcyn5o5",
                config: {
                    loginMethods: ['email', 'sms'], // Remove 'wallet' to avoid MetaMask
                    appearance: {
                        theme: 'light',
                        accentColor: '#676FFF',
                    },
                    embeddedWallets: {
                        createOnLogin: 'users-without-wallets'
                    }
                }
            }, React.createElement(WalletConnectButton));
        };

        // Render the component
        const container = document.getElementById(containerId);
        if (container) {
            const root = ReactDOM.createRoot(container);
            root.render(React.createElement(App));
        }
    }

    // Initialize wallet connection
    async initialize(containerId, callbacks = {}) {
        try {
            this.callbacks = { ...this.callbacks, ...callbacks };
            
            // Load dependencies
            await this.loadReact();
            await this.loadPrivy();
            
            // Wait a bit for everything to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create the component
            this.createWalletConnectComponent(containerId);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize React Wallet Connect:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            return false;
        }
    }

    // Get current wallet state
    getWalletState() {
        return {
            address: this.walletAddress,
            isConnected: this.isConnected
        };
    }

    // Initialize method for compatibility with the plugin
    async initialize(containerId, callbacks = {}) {
        console.log('🎯 ReactWalletConnect: Initializing with container:', containerId);
        this.containerId = containerId;
        this.callbacks = callbacks;
        this.init();
    }
}

// Make it globally available
window.ReactWalletConnect = ReactWalletConnect;
