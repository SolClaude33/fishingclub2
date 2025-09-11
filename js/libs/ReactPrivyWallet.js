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
                console.log('🔍 Checking dependencies...');
                console.log('🔍 window.React:', typeof window.React);
                console.log('🔍 window.ReactDOM:', typeof window.ReactDOM);
                console.log('🔍 window.PrivyReactAuth:', typeof window.PrivyReactAuth);
                console.log('🔍 window.PrivyProvider:', typeof window.PrivyProvider);
                console.log('🔍 window.usePrivy:', typeof window.usePrivy);
                console.log('🔍 window.useCrossAppAccounts:', typeof window.useCrossAppAccounts);
                
                if (window.React && window.ReactDOM) {
                    console.log('✅ React dependencies loaded');
                    if (window.PrivyReactAuth || window.PrivyProvider) {
                        console.log('✅ Privy dependencies loaded');
                        resolve();
                    } else {
                        console.log('⚠️ Privy not loaded, creating fallback button');
                        resolve(); // Continue with fallback
                    }
                } else {
                    console.log('⏳ Waiting for dependencies...');
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                console.log('⚠️ Timeout reached, creating fallback button');
                resolve(); // Continue with fallback instead of rejecting
            }, 10000);
        });
    }

    // Create the React component
    createReactComponent(containerId) {
        console.log('🎨 Creating React component...');
        
        const { React, ReactDOM } = window;
        
        // Get Privy components from the correct window object
        let PrivyProvider, usePrivy, useCrossAppAccounts;
        
        if (window.PrivyReactAuth) {
            console.log('🔧 Using PrivyReactAuth');
            ({ PrivyProvider, usePrivy, useCrossAppAccounts } = window.PrivyReactAuth);
        } else if (window.PrivyProvider) {
            console.log('🔧 Using exposed PrivyProvider');
            PrivyProvider = window.PrivyProvider;
            usePrivy = window.usePrivy;
            useCrossAppAccounts = window.useCrossAppAccounts;
        } else {
            console.log('⚠️ No Privy components found, creating fallback button');
            this.createFallbackButton(containerId);
            return;
        }
        
        console.log('🔧 PrivyProvider:', typeof PrivyProvider);
        console.log('🔧 usePrivy:', typeof usePrivy);
        console.log('🔧 useCrossAppAccounts:', typeof useCrossAppAccounts);
        
        // Login Button Component
        const LoginButton = () => {
            const { ready, authenticated, user, logout } = usePrivy();
            const crossAppAccounts = useCrossAppAccounts ? useCrossAppAccounts() : null;
            const loginWithCrossAppAccount = crossAppAccounts ? crossAppAccounts.loginWithCrossAppAccount : null;
            const [isConnecting, setIsConnecting] = React.useState(false);
            const [error, setError] = React.useState(null);

            console.log('🎨 LoginButton state:', { ready, authenticated, user, isConnecting, error });

            // Handle connection
            const handleConnect = async () => {
                setIsConnecting(true);
                setError(null);
                
                try {
                    console.log('🔧 Starting wallet connection...');
                    
                    if (loginWithCrossAppAccount) {
                        console.log('🔧 Using cross-app login with AGW...');
                        // Use loginWithCrossAppAccount with AGW App ID
                        await loginWithCrossAppAccount({ 
                            appId: 'cm04asygd041fmry9zmcyn5o5' // AGW App ID
                        });
                    } else {
                        console.log('🔧 Using standard Privy login...');
                        // Fallback to standard Privy login
                        const { login } = usePrivy();
                        await login();
                    }
                    
                    console.log('✅ Login successful');
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

    // Create fallback button when Privy is not available
    createFallbackButton(containerId) {
        console.log('🔧 Creating fallback wallet button...');
        
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

        // Create simple HTML button
        container.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                    Wallet Connection
                </div>
                <button id="fallback-wallet-button" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Connect Wallet</button>
                <div id="wallet-status" style="
                    margin-top: 10px;
                    font-size: 12px;
                    color: #666;
                ">Not connected</div>
            </div>
        `;

        // Add click handler
        const button = document.getElementById('fallback-wallet-button');
        const status = document.getElementById('wallet-status');
        
        button.addEventListener('click', () => {
            if (this.isConnected) {
                // Disconnect
                this.isConnected = false;
                this.walletAddress = null;
                button.textContent = 'Connect Wallet';
                status.textContent = 'Not connected';
                status.style.color = '#666';
                
                if (this.callbacks.onDisconnect) {
                    this.callbacks.onDisconnect();
                }
            } else {
                // Connect - open Privy popup
                this.openPrivyPopup();
            }
        });

        console.log('✅ Fallback wallet button created');
    }

    // Open Privy popup for connection
    openPrivyPopup() {
        console.log('🔧 Opening Privy popup...');
        
        const privyUrl = `https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=openid`;
        
        const popup = window.open(
            privyUrl,
            'privy-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
            console.error('❌ Failed to open popup - popup blocked');
            return;
        }

        // Listen for popup messages
        const messageListener = (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'PRIVY_AUTH_SUCCESS') {
                console.log('✅ Privy authentication successful');
                this.isConnected = true;
                this.walletAddress = event.data.address || '0x...';
                
                // Update UI
                const button = document.getElementById('fallback-wallet-button');
                const status = document.getElementById('wallet-status');
                if (button) button.textContent = 'Disconnect Wallet';
                if (status) {
                    status.textContent = `Connected: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
                    status.style.color = '#4CAF50';
                }
                
                if (this.callbacks.onConnect) {
                    this.callbacks.onConnect(this.walletAddress, { wallet: { address: this.walletAddress } });
                }
                
                popup.close();
                window.removeEventListener('message', messageListener);
            } else if (event.data.type === 'PRIVY_AUTH_ERROR') {
                console.error('❌ Privy authentication failed:', event.data.error);
                if (this.callbacks.onError) {
                    this.callbacks.onError(new Error(event.data.error));
                }
                popup.close();
                window.removeEventListener('message', messageListener);
            }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageListener);
            }
        }, 1000);
    }
}

// Export for use
window.ReactPrivyWallet = ReactPrivyWallet;
