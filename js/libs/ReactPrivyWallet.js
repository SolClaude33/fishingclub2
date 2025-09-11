// React Privy Wallet Component - Simple and Clean
// Based on the official Privy documentation

class ReactPrivyWallet {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onError: null
        };
    }

    // Initialize the React component
    initialize(containerId = 'wallet-connect-container') {
        console.log('🚀 Initializing React Privy Wallet...');
        
        // Wait for React and Privy to be available
        this.waitForDependencies().then(() => {
            this.createReactComponent(containerId);
        }).catch(error => {
            console.error('❌ Failed to initialize React Privy Wallet:', error);
        });
    }

    // Wait for React and Privy dependencies
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (window.React && window.ReactDOM && window.PrivyReactAuth) {
                    console.log('✅ All dependencies loaded');
                    resolve();
                } else {
                    console.log('⏳ Waiting for dependencies...');
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Dependencies loading timeout'));
            }, 10000);
        });
    }

    // Create the React component
    createReactComponent(containerId) {
        console.log('🎨 Creating React component...');
        
        const { React, ReactDOM } = window;
        const { PrivyProvider, usePrivy, useCrossAppAccounts } = window.PrivyReactAuth;
        
        // Login Button Component
        const LoginButton = () => {
            const { ready, authenticated, user, logout } = usePrivy();
            const { loginWithCrossAppAccount } = useCrossAppAccounts();
            const [isConnecting, setIsConnecting] = React.useState(false);
            const [error, setError] = React.useState(null);

            console.log('🎨 LoginButton state:', { ready, authenticated, user, isConnecting, error });

            // Handle connection
            const handleConnect = async () => {
                setIsConnecting(true);
                setError(null);
                
                try {
                    console.log('🔧 Starting cross-app login with AGW...');
                    
                    // Use loginWithCrossAppAccount with AGW App ID
                    await loginWithCrossAppAccount({ 
                        appId: 'cm04asygd041fmry9zmcyn5o5' // AGW App ID
                    });
                    
                    console.log('✅ Cross-app login successful');
                    setIsConnecting(false);
                    
                    // Update our state
                    this.isConnected = true;
                    if (user && user.wallet) {
                        this.walletAddress = user.wallet.address;
                        if (this.callbacks.onConnect) {
                            this.callbacks.onConnect(user.wallet.address, user);
                        }
                    }

                } catch (error) {
                    console.error('❌ Connection error:', error);
                    setError('Failed to connect wallet');
                    setIsConnecting(false);
                    
                    if (this.callbacks.onError) {
                        this.callbacks.onError(error);
                    }
                }
            };

            // Handle disconnection
            const handleDisconnect = async () => {
                try {
                    await logout();
                    this.isConnected = false;
                    this.walletAddress = null;
                    
                    if (this.callbacks.onDisconnect) {
                        this.callbacks.onDisconnect();
                    }
                } catch (error) {
                    console.error('❌ Disconnect error:', error);
                }
            };

            // Update connection state when user changes
            React.useEffect(() => {
                if (authenticated && user && user.wallet) {
                    this.isConnected = true;
                    this.walletAddress = user.wallet.address;
                    if (this.callbacks.onConnect) {
                        this.callbacks.onConnect(user.wallet.address, user);
                    }
                } else if (!authenticated) {
                    this.isConnected = false;
                    this.walletAddress = null;
                }
            }, [authenticated, user]);

            // Render the button
            return React.createElement('div', { 
                style: { 
                    padding: '10px',
                    textAlign: 'center'
                }
            },
                authenticated ? 
                    React.createElement('div', { className: 'wallet-connected' },
                        React.createElement('div', { 
                            style: { 
                                marginBottom: '10px',
                                fontSize: '14px',
                                color: '#4CAF50'
                            }
                        }, `Connected: ${user?.wallet?.address?.slice(0, 6)}...${user?.wallet?.address?.slice(-4)}`),
                        React.createElement('button', { 
                            className: 'wallet-button disconnect',
                            onClick: handleDisconnect,
                            style: {
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }
                        }, 'Disconnect Wallet')
                    ) :
                    React.createElement('div', { className: 'wallet-disconnected' },
                        React.createElement('button', { 
                            className: 'wallet-button connect',
                            onClick: handleConnect,
                            disabled: isConnecting || !ready,
                            style: {
                                background: isConnecting ? '#ccc' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: isConnecting ? 'not-allowed' : 'pointer'
                            }
                        }, isConnecting ? 'Connecting...' : 'Connect Abstract Global Wallet'),
                        error && React.createElement('div', { 
                            style: { 
                                color: '#f44336',
                                fontSize: '12px',
                                marginTop: '5px'
                            }
                        }, error)
                    )
            );
        };

        // Main App Component
        const App = () => {
            console.log('🔧 PrivyProvider available:', typeof PrivyProvider);
            console.log('🔧 Using App ID:', "cmfa4s0v800s8180b9c8eiatl");
            
            return React.createElement(PrivyProvider, { 
                appId: "cmfa4s0v800s8180b9c8eiatl", // Your Privy App ID
                config: {
                    loginMethodsAndOrder: {
                        primary: ['email', 'google', 'privy:cm04asygd041fmry9zmcyn5o5'], // Include AGW
                    },
                }
            }, React.createElement(LoginButton));
        };

        // Find or create container
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: rgba(255, 255, 255, 0.9);
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(container);
        }

        // Render the React app
        console.log('🎨 Rendering React app...');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
        
        console.log('✅ React Privy Wallet initialized successfully');
    }

    // Set callbacks
    onConnect(callback) {
        this.callbacks.onConnect = callback;
    }

    onDisconnect(callback) {
        this.callbacks.onDisconnect = callback;
    }

    onError(callback) {
        this.callbacks.onError = callback;
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            walletAddress: this.walletAddress
        };
    }
}

// Export for use
window.ReactPrivyWallet = ReactPrivyWallet;
