// AGW + Privy Provider Component
// This creates a React-like component structure for RPG Maker MZ

window.AGWPrivyProvider = {
    // Initialize the AGW + Privy system
    init: function() {
        console.log('AGW + Privy Provider initializing...');
        
        // Check if we have the required dependencies
        if (!window.React || !window.ReactDOM) {
            console.error('React and ReactDOM are required for AGW + Privy');
            return false;
        }
        
        // Create the provider component
        this.createProvider();
        return true;
    },
    
    // Create the AbstractPrivyProvider component
    createProvider: function() {
        const { createElement, useState, useEffect } = window.React;
        
        // AbstractPrivyProvider component
        window.AbstractPrivyProvider = function({ appId, children }) {
            const [isInitialized, setIsInitialized] = useState(false);
            
            useEffect(() => {
                // Initialize Privy with the app ID
                if (window.Privy && appId) {
                    try {
                        window.privyClient = new window.Privy({
                            appId: appId,
                            config: {
                                appearance: {
                                    theme: 'light',
                                    accentColor: '#8B4513',
                                    logo: `${window.location.origin}/logo.png`
                                },
                                embeddedWallets: {
                                    createOnLogin: 'users-without-wallets'
                                }
                            }
                        });
                        setIsInitialized(true);
                        console.log('Privy client initialized with app ID:', appId);
                    } catch (error) {
                        console.error('Failed to initialize Privy:', error);
                    }
                }
            }, [appId]);
            
            if (!isInitialized) {
                return createElement('div', { style: { display: 'none' } }, 'Initializing...');
            }
            
            return children;
        };
        
        // useAbstractPrivyLogin hook
        window.useAbstractPrivyLogin = function() {
            const [isLoading, setIsLoading] = useState(false);
            const [error, setError] = useState(null);
            
            const login = async () => {
                if (!window.privyClient) {
                    throw new Error('Privy client not initialized');
                }
                
                setIsLoading(true);
                setError(null);
                
                try {
                    const user = await window.privyClient.loginWithCrossAppAccount({
                        crossAppAccountProvider: 'abstract',
                        crossAppAccountProviderConfig: {
                            chainId: 2741, // Abstract Mainnet
                            rpcUrl: 'https://api.mainnet.abs.xyz'
                        }
                    });
                    
                    if (user && user.wallet) {
                        // Dispatch wallet connected event
                        window.dispatchEvent(new CustomEvent('walletConnected', { 
                            detail: { 
                                wallet: user.wallet.address,
                                provider: 'agw-privy'
                            } 
                        }));
                        
                        return user;
                    } else {
                        throw new Error('Failed to get wallet from Privy user');
                    }
                } catch (err) {
                    setError(err);
                    throw err;
                } finally {
                    setIsLoading(false);
                }
            };
            
            const link = async () => {
                if (!window.privyClient) {
                    throw new Error('Privy client not initialized');
                }
                
                setIsLoading(true);
                setError(null);
                
                try {
                    const user = await window.privyClient.linkCrossAppAccount({
                        crossAppAccountProvider: 'abstract',
                        crossAppAccountProviderConfig: {
                            chainId: 2741, // Abstract Mainnet
                            rpcUrl: 'https://api.mainnet.abs.xyz'
                        }
                    });
                    
                    return user;
                } catch (err) {
                    setError(err);
                    throw err;
                } finally {
                    setIsLoading(false);
                }
            };
            
            return { login, link, isLoading, error };
        };
        
        console.log('AGW + Privy Provider components created');
    }
};
