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
                console.log('✅ React script loaded');
                console.log('🔍 window.React:', typeof window.React, window.React);
                console.log('🔍 Available globals with "react":', Object.keys(window).filter(k => k.toLowerCase().includes('react')));
                
                // Check if React is available in global scope
                if (typeof window.React === 'undefined') {
                    console.error('❌ React not available in window after script load');
                    console.log('🔍 All window properties:', Object.keys(window).slice(0, 20));
                    reject(new Error('React not available in window'));
                    return;
                }
                
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
            };
            reactScript.onerror = () => {
                console.error('❌ React failed to load from unpkg, trying jsdelivr...');
                // Fallback to jsdelivr
                const fallbackScript = document.createElement('script');
                fallbackScript.src = 'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js';
                fallbackScript.crossOrigin = 'anonymous';
                fallbackScript.onload = () => {
                    console.log('✅ React loaded from fallback:', typeof window.React);
                    console.log('🔍 window.React from fallback:', window.React);
                    // Wait a bit for React to be available
                    setTimeout(() => {
                        console.log('🔍 React fallback after timeout:', typeof window.React);
                        console.log('🔍 window.React fallback after timeout:', window.React);
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

    // Load Privy SDK directly
    async loadPrivySDK() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Loading Privy SDK and AGW...');
            
            // Load AGW React first
            this.loadAGWReact().then(() => {
                // Then load Privy
                this.loadPrivyDirect().then(resolve).catch(reject);
            }).catch(() => {
                // If AGW fails, just load Privy
                this.loadPrivyDirect().then(resolve).catch(reject);
            });
        });
    }

    // Load AGW React SDK
    loadAGWReact() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Loading AGW React SDK...');
            
            const agwScript = document.createElement('script');
            agwScript.src = 'https://unpkg.com/@abstract-foundation/agw-react@latest/dist/index.umd.js';
            agwScript.async = true;
            agwScript.onload = () => {
                console.log('✅ AGW React SDK loaded');
                resolve();
            };
            agwScript.onerror = (error) => {
                console.log('❌ Failed to load AGW React SDK:', error);
                reject(error);
            };
            document.head.appendChild(agwScript);
        });
    }

    // Load Privy directly
    loadPrivyDirect() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Loading Privy SDK directly...');
            
            // Create Privy SDK script
            const privyScript = document.createElement('script');
            privyScript.src = 'https://sdk.privy.io/privy-js.js';
            privyScript.async = true;
            privyScript.onload = () => {
                console.log('✅ Privy SDK loaded directly');
                // Set up Privy provider
                window.PrivyProvider = ({ children, appId }) => {
                    console.log('🔧 Direct PrivyProvider rendering with appId:', appId);
                    return React.createElement('div', { 
                        id: 'privy-provider-direct',
                        'data-privy-app-id': appId 
                    }, children);
                };
                
                window.usePrivy = () => {
                    return {
                        ready: true,
                        authenticated: false,
                        user: null,
                        login: () => {
                            console.log('🔧 Direct Privy login called - opening popup');
                            // Open Privy login popup directly
                            const popup = window.open(
                                'https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=' + 
                                encodeURIComponent(window.location.origin) + 
                                '&response_type=code&scope=openid',
                                'privy-login',
                                'width=500,height=700,scrollbars=yes,resizable=yes'
                            );
                            
                            if (!popup) {
                                console.log('🔧 Popup blocked, redirecting instead');
                                window.location.href = 'https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=' + 
                                    encodeURIComponent(window.location.origin) + 
                                    '&response_type=code&scope=openid';
                            }
                        },
                        logout: () => {
                            console.log('🔧 Direct Privy logout called');
                            // Clear any stored auth data
                            localStorage.removeItem('privy-auth');
                        }
                    };
                };
                
                resolve();
            };
            privyScript.onerror = (error) => {
                console.error('❌ Failed to load Privy SDK directly:', error);
                reject(error);
            };
            document.head.appendChild(privyScript);
        });
    }

    // Load Privy SDK
    async loadPrivy() {
        if (this.isPrivyLoaded) return;

        // Try direct SDK first
        try {
            await this.loadPrivySDK();
            this.isPrivyLoaded = true;
            console.log('✅ Privy loaded via direct SDK');
            return;
        } catch (error) {
            console.warn('⚠️ Direct Privy SDK failed, trying CDNs:', error);
        }

        const cdnUrls = [
            'https://unpkg.com/@privy-io/react-auth@2.24.0/dist/index.umd.js',
            'https://cdn.jsdelivr.net/npm/@privy-io/react-auth@2.24.0/dist/index.umd.js'
        ];

        for (let i = 0; i < cdnUrls.length; i++) {
            try {
                console.log(`🔄 Attempting to load Privy from CDN ${i + 1}:`, cdnUrls[i]);
                await this.loadPrivyFromUrl(cdnUrls[i]);
                this.isPrivyLoaded = true;
                console.log(`✅ Successfully loaded Privy from CDN ${i + 1}`);
                return;
            } catch (error) {
                console.warn(`⚠️ Failed to load Privy from CDN ${i + 1}:`, cdnUrls[i], error);
                if (i === cdnUrls.length - 1) {
                    console.error('❌ All Privy loading methods failed, creating fallback provider...');
                    // Create a fallback provider instead of throwing an error
                    this.createFallbackProvider();
                    this.isPrivyLoaded = true;
                    return;
                }
            }
        }
    }

    async loadPrivyFromUrl(url) {
        return new Promise((resolve, reject) => {
            const privyScript = document.createElement('script');
            privyScript.src = url;
            privyScript.onload = () => {
                console.log('✅ Privy loaded from:', url);
                console.log('🔍 window.PrivyReactAuth:', typeof window.PrivyReactAuth);
                console.log('🔍 window.Privy:', typeof window.Privy);
                console.log('🔍 Available Privy objects:', Object.keys(window).filter(key => key.toLowerCase().includes('privy')));
                
                // Wait a bit for Privy to be available
                setTimeout(() => {
                    console.log('🔍 Privy after timeout:', typeof window.PrivyReactAuth);
                    console.log('🔍 window.Privy after timeout:', typeof window.Privy);
                    console.log('🔍 window.PrivyReactAuth after timeout:', window.PrivyReactAuth);
                    console.log('🔍 window.Privy after timeout:', window.Privy);
                    
                    // Try different Privy loading approaches
                    if (window.AbstractPrivyProvider) {
                        // Official AGW React version
                        window.PrivyProvider = window.AbstractPrivyProvider;
                        window.usePrivy = window.useAbstractPrivyLogin || (() => ({
                            ready: true,
                            authenticated: false,
                            user: null,
                            login: () => console.log('AGW Login not implemented'),
                            logout: () => console.log('AGW Logout not implemented')
                        }));
                        console.log('✅ AbstractPrivyProvider extracted from AGW React:', typeof window.PrivyProvider);
                        resolve();
                    } else if (window.PrivyReactAuth && window.PrivyReactAuth.PrivyProvider) {
                        // React Auth version
                        window.PrivyProvider = window.PrivyReactAuth.PrivyProvider;
                        window.usePrivy = window.PrivyReactAuth.usePrivy;
                        console.log('✅ PrivyProvider extracted from PrivyReactAuth:', typeof window.PrivyProvider);
                        resolve();
                    } else if (window.Privy && window.Privy.PrivyProvider) {
                        // Direct Privy version
                        window.PrivyProvider = window.Privy.PrivyProvider;
                        window.usePrivy = window.Privy.usePrivy;
                        console.log('✅ PrivyProvider extracted from Privy:', typeof window.PrivyProvider);
                        resolve();
                    } else if (window.Privy) {
                        // Try to create a simple provider wrapper
                        console.log('🔧 Creating simple Privy provider wrapper...');
                        window.PrivyProvider = ({ children }) => {
                            return React.createElement('div', { id: 'privy-provider' }, children);
                        };
                        window.usePrivy = () => ({
                            ready: true,
                            authenticated: false,
                            user: null,
                            login: () => console.log('Login not implemented'),
                            logout: () => console.log('Logout not implemented')
                        });
                        console.log('✅ Simple Privy provider wrapper created');
                        resolve();
                    } else {
                        console.error('❌ No Privy objects found');
                        console.error('❌ Available window objects:', Object.keys(window).filter(key => key.toLowerCase().includes('privy')));
                        console.error('❌ Available AGW objects:', Object.keys(window).filter(key => key.toLowerCase().includes('abstract')));
                        console.error('❌ All window objects:', Object.keys(window).slice(0, 20)); // Show first 20 for debugging
                        reject(new Error('PrivyProvider not found'));
                        return;
                    }
                }, 100);
            };
            privyScript.onerror = (error) => {
                console.error('❌ Privy script failed to load from:', url);
                console.error('❌ Error details:', {
                    type: error.type,
                    target: error.target,
                    currentTarget: error.currentTarget,
                    eventPhase: error.eventPhase,
                    bubbles: error.bubbles,
                    cancelable: error.cancelable,
                    defaultPrevented: error.defaultPrevented,
                    isTrusted: error.isTrusted,
                    timeStamp: error.timeStamp
                });
                console.error('❌ Script src:', privyScript.src);
                console.error('❌ Script readyState:', privyScript.readyState);
                console.error('❌ Script crossOrigin:', privyScript.crossOrigin);
                reject(error);
            };
            document.head.appendChild(privyScript);
        });
    }

    // Create fallback provider when Privy fails to load
    createFallbackProvider() {
        console.log('🔧 Creating fallback PrivyProvider with correct App ID...');
        
        // Create a fallback provider that uses the correct App ID
        window.PrivyProvider = ({ children, appId }) => {
            console.log('🔧 Fallback PrivyProvider rendering with appId:', appId);
            
            // Just render the children - the button will be created by the WalletConnectButton component
            return React.createElement('div', { 
                id: 'privy-provider-fallback',
                style: { padding: '10px' }
            }, children);
        };
        
        window.usePrivy = () => {
            return {
                ready: true,
                authenticated: false,
                user: null,
                login: () => {
                    console.log('🔧 Fallback login called - opening popup');
                    // Open Privy login popup directly
                    const popup = window.open(
                        'https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=' + 
                        encodeURIComponent(window.location.origin) + 
                        '&response_type=code&scope=openid',
                        'privy-login',
                        'width=500,height=700,scrollbars=yes,resizable=yes'
                    );
                    
                    if (!popup) {
                        console.log('🔧 Popup blocked, redirecting instead');
                        window.location.href = 'https://auth.privy.io/oauth/authorize?client_id=cmfa4s0v800s8180b9c8eiatl&redirect_uri=' + 
                            encodeURIComponent(window.location.origin) + 
                            '&response_type=code&scope=openid';
                    }
                },
                logout: () => {
                    console.log('🔧 Fallback logout called');
                }
            };
        };
        
        console.log('✅ Fallback PrivyProvider created successfully');
    }

    // Create wallet connect component
    createWalletConnectComponent(containerId) {
        const { useState, useEffect } = React;
        const AbstractPrivyProvider = window.PrivyProvider; // This will be AbstractPrivyProvider if loaded
        const usePrivy = window.usePrivy;
        
        // Fix containerId if it's undefined
        const actualContainerId = containerId || 'react-wallet-connect';
        console.log('🔧 Fixed containerId:', actualContainerId);

        const WalletConnectButton = () => {
            console.log('🎨 WalletConnectButton component rendering...');
            const { ready, authenticated, user, logout } = usePrivy();
            
            // Check if useAbstractPrivyLogin is available
            console.log('🔧 Checking for useAbstractPrivyLogin:', typeof window.useAbstractPrivyLogin);
            console.log('🔧 Available AGW functions:', Object.keys(window).filter(key => key.includes('Abstract') || key.includes('AGW')));
            
            const useAbstractPrivyLogin = window.useAbstractPrivyLogin || (() => ({ 
                login: () => {
                    console.log('❌ useAbstractPrivyLogin not available, using manual Privy login');
                    // Use the standard Privy login method
                    const { login } = usePrivy();
                    return login();
                }, 
                link: () => console.log('useAbstractPrivyLogin not available') 
            }));
            
            const { login: agwLogin, link: agwLink } = useAbstractPrivyLogin();
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
                    console.log('🔧 Starting AGW login using useAbstractPrivyLogin...');
                    
                    // Use the AGW login method from the hook
                    await agwLogin();
                    
                    console.log('✅ AGW login initiated successfully');
                    setIsConnecting(false);

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
            console.log('🔧 AbstractPrivyProvider available:', typeof AbstractPrivyProvider);
            console.log('🔧 Using App ID:', "cmfa4s0v800s8180b9c8eiatl");
            
            return React.createElement(AbstractPrivyProvider, { 
                appId: "cmfa4s0v800s8180b9c8eiatl" // Your actual Privy app ID
            }, React.createElement(WalletConnectButton));
        };

        // Render the component
        console.log('🎨 Looking for container:', actualContainerId);
        const container = document.getElementById(actualContainerId);
        if (container) {
            console.log('✅ Container found, creating React root...');
            const root = ReactDOM.createRoot(container);
            console.log('🎨 Rendering React component...');
            root.render(React.createElement(App));
            console.log('✅ React component rendered successfully!');
        } else {
            console.error('❌ Container not found:', actualContainerId);
            console.error('❌ Available containers:', Array.from(document.querySelectorAll('[id*="react"]')).map(el => el.id));
            // Try to find the container by partial match
            const fallbackContainer = document.querySelector('[id*="react-wallet"]');
            if (fallbackContainer) {
                console.log('🔧 Found fallback container:', fallbackContainer.id);
                const root = ReactDOM.createRoot(fallbackContainer);
                root.render(React.createElement(App));
                console.log('✅ React component rendered in fallback container');
            } else {
                console.error('❌ No suitable container found for React component');
            }
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
        
        try {
            console.log('🔄 Loading React and ReactDOM...');
            await this.loadReact();
            console.log('🔄 Loading Privy...');
            await this.loadPrivy();
            console.log('🔄 Creating wallet connect component...');
            await this.createWalletConnectComponent();
            console.log('✅ ReactWalletConnect: Initialization complete');
        } catch (error) {
            console.error('❌ ReactWalletConnect: Initialization failed:', error);
            throw error;
        }
    }
}

// Make it globally available
window.ReactWalletConnect = ReactWalletConnect;
