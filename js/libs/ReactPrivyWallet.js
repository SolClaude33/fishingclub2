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
                    margin-right: 5px;
                ">Connect Wallet</button>
                <button id="test-config-button" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Test Config</button>
                <div id="wallet-status" style="
                    margin-top: 10px;
                    font-size: 12px;
                    color: #666;
                ">Not connected</div>
                <div id="config-status" style="
                    margin-top: 5px;
                    font-size: 10px;
                    color: #999;
                "></div>
            </div>
        `;

        // Add click handlers
        const button = document.getElementById('fallback-wallet-button');
        const status = document.getElementById('wallet-status');
        const configButton = document.getElementById('test-config-button');
        const configStatus = document.getElementById('config-status');
        
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

        configButton.addEventListener('click', () => {
            this.testPrivyConfiguration(configStatus);
        });

        console.log('✅ Fallback wallet button created');
    }

    // Open Privy popup for connection
    openPrivyPopup() {
        console.log('🔧 Opening Privy popup...');
        
        // Get current origin
        const currentOrigin = window.location.origin;
        console.log('🔧 Current origin:', currentOrigin);
        
        // Usa solo auth.privy.io como endpoint
        const privyUrl = `https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=${encodeURIComponent(currentOrigin)}&response_type=code&scope=openid`;
        console.log('🔧 Using Privy URL:', privyUrl);
        
        const popup = window.open(
            privyUrl,
            'privy-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
            console.error('❌ Failed to open popup - popup blocked');
            alert('Please allow popups for this site to connect your wallet');
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

        // Check for popup errors
        const checkPopupError = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(checkPopupError);
                    window.removeEventListener('message', messageListener);
                    return;
                }
                
                // Check if popup has navigated to an error page
                try {
                    const popupUrl = popup.location.href;
                    if (popupUrl.includes('error') || popupUrl.includes('something-went-wrong')) {
                        console.error('❌ Popup shows error page');
                        popup.close();
                        clearInterval(checkPopupError);
                        window.removeEventListener('message', messageListener);
                        
                        // Show user-friendly error message
                        alert('Wallet connection failed. Please check your Privy dashboard configuration:\n\n1. Make sure your App ID is correct\n2. Add tu dominio a "Allowed Origins"\n3. Add tu dominio a "Redirect URIs"');
                    }
                } catch (e) {
                    // Cross-origin error, ignore
                }
            } catch (e) {
                // Popup might be closed
            }
        }, 1000);

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageListener);
            }
        }, 1000);
    }

    // Test Privy configuration
    testPrivyConfiguration(configStatusElement) {
        console.log('🔧 Testing Privy configuration...');
        
        if (configStatusElement) {
            configStatusElement.textContent = 'Testing configuration...';
            configStatusElement.style.color = '#2196F3';
        }

        const currentOrigin = window.location.origin;
        const appId = 'cmfa4s0v800s8180b9c8eiatl';
        
        console.log('🔧 Current origin:', currentOrigin);
        console.log('🔧 App ID:', appId);
        
        // Test different Privy endpoints
        const testUrls = [
            `https://dashboard.privy.io/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(currentOrigin)}&response_type=code&scope=openid`,
            `https://auth.privy.io/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(currentOrigin)}&response_type=code&scope=openid`
        ];

        let testIndex = 0;
        const testNextUrl = () => {
            if (testIndex >= testUrls.length) {
                if (configStatusElement) {
                    configStatusElement.textContent = 'All tests failed - check Privy dashboard';
                    configStatusElement.style.color = '#f44336';
                }
                return;
            }

            const testUrl = testUrls[testIndex];
            console.log(`🔧 Testing URL ${testIndex + 1}:`, testUrl);
            
            // Create a hidden iframe to test the URL
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = testUrl;
            
            iframe.onload = () => {
                console.log(`✅ URL ${testIndex + 1} loaded successfully`);
                if (configStatusElement) {
                    configStatusElement.textContent = `URL ${testIndex + 1} works - try connecting`;
                    configStatusElement.style.color = '#4CAF50';
                }
                document.body.removeChild(iframe);
            };
            
            iframe.onerror = () => {
                console.log(`❌ URL ${testIndex + 1} failed`);
                testIndex++;
                testNextUrl();
            };
            
            document.body.appendChild(iframe);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
                testIndex++;
                testNextUrl();
            }, 5000);
        };

        testNextUrl();
    }
}

// Export for use
window.ReactPrivyWallet = ReactPrivyWallet;
