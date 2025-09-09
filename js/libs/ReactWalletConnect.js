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
                console.log('✅ React loaded:', typeof window.React);
                console.log('🔍 window.React:', window.React);
                // Wait a bit for React to be available
                setTimeout(() => {
                    console.log('🔍 React after timeout:', typeof window.React);
                    // Load React DOM
                const reactDOMScript = document.createElement('script');
                reactDOMScript.src = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
                reactDOMScript.crossOrigin = 'anonymous';
                reactDOMScript.onload = () => {
                    console.log('✅ ReactDOM loaded:', typeof window.ReactDOM);
                    console.log('🔍 window.ReactDOM:', window.ReactDOM);
                    this.isReactLoaded = true;
                    resolve();
                };
                reactDOMScript.onerror = () => {
                    console.error('❌ ReactDOM failed to load from unpkg, trying jsdelivr...');
                    // Fallback to jsdelivr
                    const fallbackScript = document.createElement('script');
                    fallbackScript.src = 'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js';
                    fallbackScript.crossOrigin = 'anonymous';
                    fallbackScript.onload = () => {
                        console.log('✅ ReactDOM loaded from fallback:', typeof window.ReactDOM);
                        this.isReactLoaded = true;
                        resolve();
                    };
                    fallbackScript.onerror = reject;
                    document.head.appendChild(fallbackScript);
                };
                document.head.appendChild(reactDOMScript);
                }, 100); // Wait 100ms for React to be available
            };
            reactScript.onerror = () => {
                console.error('❌ React failed to load from unpkg, trying jsdelivr...');
                // Fallback to jsdelivr
                const fallbackScript = document.createElement('script');
                fallbackScript.src = 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js';
                fallbackScript.crossOrigin = 'anonymous';
                fallbackScript.onload = () => {
                    console.log('✅ React loaded from fallback:', typeof window.React);
                    // Wait a bit for React to be available
                    setTimeout(() => {
                        console.log('🔍 React fallback after timeout:', typeof window.React);
                        // Load React DOM
                        const reactDOMScript = document.createElement('script');
                        reactDOMScript.src = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
                        reactDOMScript.crossOrigin = 'anonymous';
                        reactDOMScript.onload = () => {
                            console.log('✅ ReactDOM loaded:', typeof window.ReactDOM);
                            this.isReactLoaded = true;
                            resolve();
                        };
                        reactDOMScript.onerror = reject;
                        document.head.appendChild(reactDOMScript);
                    }, 100);
                };
                fallbackScript.onerror = reject;
                document.head.appendChild(fallbackScript);
            };
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
                console.log('✅ Privy loaded:', typeof window.PrivyReactAuth);
                console.log('🔍 window.PrivyReactAuth:', window.PrivyReactAuth);
                // Wait a bit for Privy to be available
                setTimeout(() => {
                    console.log('🔍 Privy after timeout:', typeof window.PrivyReactAuth);
                    this.isPrivyLoaded = true;
                    resolve();
                }, 100);
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
            console.log('🎨 WalletConnectButton component rendering...');
            const { ready, authenticated, user, login, logout } = usePrivy();
            const [isConnecting, setIsConnecting] = useState(false);
            const [error, setError] = useState(null);
            
            console.log('🎨 WalletConnectButton state:', { ready, authenticated, user, isConnecting, error });

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
        console.log('🎨 Looking for container:', containerId);
        const container = document.getElementById(containerId);
        if (container) {
            console.log('✅ Container found, creating React root...');
            const root = ReactDOM.createRoot(container);
            console.log('🎨 Rendering React component...');
            root.render(React.createElement(App));
            console.log('✅ React component rendered successfully!');
        } else {
            console.error('❌ Container not found:', containerId);
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
            
            // Create and render the component
            this.createWalletConnectComponent(containerId);
            console.log('🎨 Component created, attempting to render...');
            
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
        // No need to call this.init() as it's already called in constructor
        console.log('✅ ReactWalletConnect: Initialization complete');
    }
}

// Make it globally available
window.ReactWalletConnect = ReactWalletConnect;
