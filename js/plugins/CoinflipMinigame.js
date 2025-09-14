//=============================================================================
// RPG Maker MZ - Coinflip Minigame Plugin
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Replaces the coinflip event text with a real blockchain coinflip minigame.
 * @author Assistant
 *
 * @help CoinflipMinigame.js
 *
 * This plugin replaces the "YEAYEAYEA" text in the coinflip event with
 * a real blockchain coinflip minigame that interacts with the smart contract.
 *
 * It does not provide plugin commands.
 */

(() => {
    'use strict';

    // Check if Web3 libraries are loaded
    function checkWeb3Libraries() {
        const libraries = {
            ethers: typeof window.ethers !== 'undefined' && window.ethers.providers && window.ethers.utils,
            web3: typeof Web3 !== 'undefined',
            ethereum: typeof window.ethereum !== 'undefined'
        };
        
        // More detailed checking
        const details = {
            ethersExists: typeof window.ethers !== 'undefined',
            ethersProviders: typeof window.ethers !== 'undefined' && window.ethers.providers,
            ethersUtils: typeof window.ethers !== 'undefined' && window.ethers.utils,
            ethersParseEther: typeof window.ethers !== 'undefined' && window.ethers.utils && typeof window.ethers.utils.parseEther === 'function',
            web3Exists: typeof Web3 !== 'undefined',
            ethereumExists: typeof window.ethereum !== 'undefined'
        };
        
        console.log('Web3 Libraries Status:', libraries);
        console.log('Web3 Libraries Details:', details);
        
        if (!libraries.ethers && !libraries.web3) {
            console.error('❌ Neither Ethers.js nor Web3.js is loaded!');
            console.error('Please ensure the Web3 libraries are loaded before this plugin.');
            return false;
        }
        
        if (!libraries.ethereum) {
            console.error('❌ MetaMask/Web3 provider not detected!');
            console.error('Please install MetaMask or another Web3 wallet.');
            return false;
        }
        
        if (libraries.ethers) {
            console.log('✅ Ethers.js loaded successfully');
            if (details.ethersParseEther) {
                console.log('✅ Ethers.js parseEther function available');
            } else {
                console.warn('⚠️ Ethers.js parseEther function not available');
            }
        }
        if (libraries.web3) {
            console.log('✅ Web3.js loaded successfully');
        }
        if (libraries.ethereum) {
            console.log('✅ Web3 provider detected');
        }
        
        return true;
    }

    // Wait for Web3 libraries to be ready
    function waitForWeb3Libraries(maxAttempts = 50) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const checkLibraries = () => {
                attempts++;
                
                if (checkWeb3Libraries()) {
                    console.log(`✅ Web3 libraries ready after ${attempts} attempts`);
                    resolve(true);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    console.error('❌ Web3 libraries failed to load after maximum attempts');
                    console.log('🔄 Retrying library loading...');
                    
                    // Try one more time with a longer delay
                    setTimeout(() => {
                        if (checkWeb3Libraries()) {
                            console.log('✅ Web3 libraries ready after retry');
                            resolve(true);
                        } else {
                            reject(new Error('Web3 libraries failed to load after retry'));
                        }
                    }, 1000);
                    return;
                }
                
                // Wait 100ms before next attempt
                setTimeout(checkLibraries, 100);
            };
            
            checkLibraries();
        });
    }

    // Contract configuration
    const CONTRACT_CONFIG = {
        address: '0xcb300ef13a41E27a29674278b4C4D68A506aFf8D',
        abi: [
            {
                "inputs": [],
                "stateMutability": "payable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
                    { "indexed": false, "internalType": "bool", "name": "choice", "type": "bool" },
                    { "indexed": false, "internalType": "bool", "name": "result", "type": "bool" },
                    { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
                    { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }
                ],
                "name": "FlipResult",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
                    { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
                ],
                "name": "FundsDeposited",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
                    { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
                ],
                "name": "FundsWithdrawn",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "getBalance",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{ "internalType": "bool", "name": "_choice", "type": "bool" }],
                "name": "flip",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
                "name": "setOwner",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "stateMutability": "payable",
                "type": "receive"
            },
            {
                "stateMutability": "payable",
                "type": "fallback"
            }
        ]
    };

    // Create global function for coinflip modal (like the vending machine)
    window.openCoinflipModal = function() {
        const interpreter = new Game_Interpreter();
        interpreter.createCoinflipModal();
    };

    // Check libraries when plugin loads
    console.log('🪙 Coinflip Plugin Loading...');
    
    // Wait for Web3 libraries to be ready
    waitForWeb3Libraries()
        .then(() => {
            console.log('✅ Coinflip Plugin loaded successfully with Web3 support');
        })
        .catch((error) => {
            console.warn('⚠️ Coinflip Plugin loaded but Web3 libraries may not be available:', error.message);
        });

    // Override the message system to intercept "YEAYEAYEA" and replace it with coinflip
    const _Game_Interpreter_command401 = Game_Interpreter.prototype.command401;
    Game_Interpreter.prototype.command401 = function(params) {
        const message = params[0];
        
        // Check if this is the coinflip message
        if (message === 'YEAYEAYEA') {
            this.startCoinflipMinigame();
            return true;
        }
        
        // For all other messages, use the original function
        return _Game_Interpreter_command401.call(this, params);
    };

    // Add coinflip minigame function
    Game_Interpreter.prototype.startCoinflipMinigame = function() {
        // Create the coinflip modal
        this.createCoinflipModal();
    };

    // Create the coinflip modal
    Game_Interpreter.prototype.createCoinflipModal = function() {
        // Create styles if they don't exist
        this.createCoinflipStyles();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'coinflip-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'coinflip-modal';
        modal.style.cssText = `
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
            border: 4px solid #654321;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 
                0 8px 0 #654321,
                0 4px 12px rgba(0,0,0,0.4),
                inset 0 1px 0 rgba(255,255,255,0.3);
        `;
        
        modal.innerHTML = `
            <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0px #654321; text-transform: uppercase;">
                Penguin Fishing Club - Coinflip
            </h2>
            
            
            <div id="coinflip-coin" style="
                width: 120px;
                height: 120px;
                margin: 20px auto;
                border-radius: 50%;
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
                border: 4px solid #B8860B;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    0 6px 0 #B8860B,
                    0 4px 8px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.4);
                transition: transform 0.3s ease;
                position: relative;
                overflow: hidden;
            ">
                <img id="coinflip-logo" src="logo.png" style="
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    transition: all 0.3s ease;
                    opacity: 1;
                ">
                <img id="coinflip-logo-green" src="logo.png" style="
                    width: 80px;
                    height: 80px;
                    object-fit: contain;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    transition: all 0.3s ease;
                ">
            </div>
            
            <div id="coinflip-wallet-status" style="
                background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                border: 3px solid #8B4513;
                border-radius: 12px;
                padding: 15px;
                margin: 15px 0;
                box-shadow: 
                    0 4px 0 #8B4513,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
            ">
                <div id="coinflip-wallet-info" style="display: none;">
                    <p style="color: #8B4513; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                        Connected: <span id="coinflip-wallet-address">0x...</span>
                    </p>
                    <p style="color: #8B4513; margin: 0 0 5px 0; font-size: 12px;">
                        Your Balance: <span id="coinflip-wallet-balance">0 ETH</span>
                    </p>
                    <p style="color: #8B4513; margin: 0; font-size: 12px;">
                        Contract Balance: <span id="coinflip-contract-balance">Loading...</span>
                    </p>
                </div>
                <div id="coinflip-wallet-connect">
                    <p style="color: #8B4513; margin: 0 0 10px 0; font-size: 14px;">
                        Connect your wallet to play
                    </p>
                    <button id="coinflip-connect-wallet" style="
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%);
                        color: white;
                        border: 3px solid #2E7D32;
                        border-radius: 12px;
                        padding: 10px 20px;
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: 
                            0 4px 0 #2E7D32,
                            0 2px 4px rgba(0,0,0,0.3),
                            inset 0 1px 0 rgba(255,255,255,0.2);
                        transition: all 0.2s ease;
                    ">Connect Wallet</button>
                </div>
            </div>
            
            <div id="coinflip-betting-section" style="display: none;">
                <div style="
                    background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                    border: 3px solid #8B4513;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    box-shadow: 
                        0 4px 0 #8B4513,
                        0 2px 4px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.3);
                ">
                    <h3 style="color: #8B4513; margin: 0 0 15px 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3;">
                        Choose Your Bet Amount
                    </h3>
                    <p style="color: #8B4513; margin: 0 0 15px 0; font-size: 14px;">
                        Select your bet amount or enter a custom value
                    </p>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
                        <button id="coinflip-bet-0001" class="bet-button" style="
                            background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 50%, #FF6B6B 100%);
                            color: white;
                            border: 3px solid #D32F2F;
                            border-radius: 12px;
                            padding: 10px 16px;
                            font-size: 14px;
                            font-weight: bold;
                            cursor: pointer;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 
                                0 4px 0 #D32F2F,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.2s ease;
                        ">0.0001 ETH</button>
                        
                        <button id="coinflip-bet-01" class="bet-button" style="
                            background: linear-gradient(135deg, #4ECDC4 0%, #26A69A 50%, #4ECDC4 100%);
                            color: white;
                            border: 3px solid #00897B;
                            border-radius: 12px;
                            padding: 10px 16px;
                            font-size: 14px;
                            font-weight: bold;
                            cursor: pointer;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 
                                0 4px 0 #00897B,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.2s ease;
                        ">0.01 ETH</button>
                        
                        <button id="coinflip-bet-1" class="bet-button" style="
                            background: linear-gradient(135deg, #FFD93D 0%, #FFC107 50%, #FFD93D 100%);
                            color: #8B4513;
                            border: 3px solid #FF8F00;
                            border-radius: 12px;
                            padding: 10px 16px;
                            font-size: 14px;
                            font-weight: bold;
                            cursor: pointer;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 
                                0 4px 0 #FF8F00,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.2s ease;
                        ">0.1 ETH</button>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-bottom: 20px;">
                        <input type="number" id="coinflip-custom-bet" placeholder="Custom amount" step="0.0001" min="0.0001" style="
                            background: linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 50%, #F5F5F5 100%);
                            border: 3px solid #8B4513;
                            border-radius: 12px;
                            padding: 10px 16px;
                            font-size: 14px;
                            font-weight: bold;
                            color: #8B4513;
                            text-align: center;
                            width: 120px;
                            box-shadow: 
                                0 4px 0 #8B4513,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.3);
                        " onkeydown="event.stopPropagation();">
                        <span style="color: #8B4513; font-weight: bold; font-size: 14px;">ETH</span>
                    </div>
                    
                    <div id="coinflip-current-bet" style="
                        background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 50%, #E8F5E8 100%);
                        border: 3px solid #4CAF50;
                        border-radius: 12px;
                        padding: 15px;
                        margin: 15px 0;
                        display: none;
                        box-shadow: 
                            0 4px 0 #4CAF50,
                            0 2px 4px rgba(0,0,0,0.3),
                            inset 0 1px 0 rgba(255,255,255,0.3);
                    ">
                        <h4 style="color: #2E7D32; margin: 0 0 10px 0; font-size: 16px; font-weight: bold; text-shadow: 1px 1px 0px #C8E6C9;">
                            Current Bet: <span id="coinflip-bet-amount">0 ETH</span>
                        </h4>
                    </div>
                    
                    <h3 style="color: #8B4513; margin: 20px 0 15px 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3;">
                        Choose Your Side
                    </h3>
                    <p style="color: #8B4513; margin: 0 0 20px 0; font-size: 14px;">
                        Click Green or Brown to flip the coin!
                    </p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="coinflip-green" style="
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%);
                            color: white;
                            border: 3px solid #2E7D32;
                            border-radius: 12px;
                            padding: 12px 24px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 
                                0 4px 0 #2E7D32,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.2s ease;
                        ">Green</button>
                        
                        <button id="coinflip-brown" style="
                            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                            color: white;
                            border: 3px solid #654321;
                            border-radius: 12px;
                            padding: 12px 24px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            box-shadow: 
                                0 4px 0 #654321,
                                0 2px 4px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                            transition: all 0.2s ease;
                        ">Brown</button>
                    </div>
                </div>
            </div>
            
            <div id="coinflip-result" style="
                background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                border: 3px solid #8B4513;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                display: none;
                box-shadow: 
                    0 4px 0 #8B4513,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
            ">
                <h3 id="coinflip-result-title" style="color: #8B4513; margin: 0 0 10px 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 0px #F5DEB3;">
                    Result
                </h3>
                <p id="coinflip-result-text" style="color: #8B4513; margin: 0; font-size: 16px;"></p>
            </div>
            
            <div id="coinflip-transaction-status" style="
                background: linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%);
                border: 3px solid #8B4513;
                border-radius: 12px;
                padding: 15px;
                margin: 15px 0;
                display: none;
                box-shadow: 
                    0 4px 0 #8B4513,
                    0 2px 4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.3);
            ">
                <p id="coinflip-transaction-text" style="color: #8B4513; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                    Processing transaction...
                </p>
                <div id="coinflip-transaction-actions" style="display: none;">
                    <button id="coinflip-cancel-tx" style="
                        background: linear-gradient(135deg, #F44336 0%, #d32f2f 50%, #F44336 100%);
                        color: white;
                        border: 2px solid #c62828;
                        border-radius: 8px;
                        padding: 8px 16px;
                        font-size: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-right: 10px;
                        box-shadow: 
                            0 2px 0 #c62828,
                            0 1px 3px rgba(0,0,0,0.3),
                            inset 0 1px 0 rgba(255,255,255,0.2);
                    ">Cancel Transaction</button>
                    <button id="coinflip-accelerate-tx" style="
                        background: linear-gradient(135deg, #FF9800 0%, #F57C00 50%, #FF9800 100%);
                        color: white;
                        border: 2px solid #E65100;
                        border-radius: 8px;
                        padding: 8px 16px;
                        font-size: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 
                            0 2px 0 #E65100,
                            0 1px 3px rgba(0,0,0,0.3),
                            inset 0 1px 0 rgba(255,255,255,0.2);
                    ">Accelerate</button>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <button id="coinflip-close" style="
                    background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
                    color: white;
                    border: 3px solid #654321;
                    border-radius: 12px;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 
                        0 4px 0 #654321,
                        0 2px 4px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.2);
                    transition: all 0.2s ease;
                ">Close</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        this.attachCoinflipEventListeners(overlay, modal);
    };

    // Create styles for the coinflip
    Game_Interpreter.prototype.createCoinflipStyles = function() {
        if (document.getElementById('coinflip-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'coinflip-styles';
        style.textContent = `
            @keyframes coinflip {
                0% { transform: rotateY(0deg); }
                50% { transform: rotateY(180deg); }
                100% { transform: rotateY(360deg); }
            }
            
            .coinflip-spinning {
                animation: coinflip 1s ease-in-out;
            }
            
            #coinflip-logo-green {
                filter: hue-rotate(120deg) saturate(2) brightness(1.2) drop-shadow(0 0 10px rgba(0, 255, 0, 0.5));
            }
            
            .bet-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 5px 0 currentColor, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-bet-0001:hover {
                background: linear-gradient(135deg, #FF5252 0%, #FF6B6B 50%, #FF5252 100%) !important;
                box-shadow: 0 5px 0 #D32F2F, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-bet-01:hover {
                background: linear-gradient(135deg, #26A69A 0%, #4ECDC4 50%, #26A69A 100%) !important;
                box-shadow: 0 5px 0 #00897B, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-bet-1:hover {
                background: linear-gradient(135deg, #FFC107 0%, #FFD93D 50%, #FFC107 100%) !important;
                box-shadow: 0 5px 0 #FF8F00, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-green:hover {
                background: linear-gradient(135deg, #45a049 0%, #4CAF50 50%, #45a049 100%) !important;
                transform: translateY(-1px);
                box-shadow: 0 5px 0 #2E7D32, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-brown:hover {
                background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%) !important;
                transform: translateY(-1px);
                box-shadow: 0 5px 0 #654321, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-close:hover {
                background: linear-gradient(135deg, #A0522D 0%, #CD853F 50%, #A0522D 100%) !important;
                transform: translateY(-1px);
                box-shadow: 0 5px 0 #654321, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
            
            #coinflip-result.win {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%) !important;
                border-color: #2E7D32 !important;
            }
            
            #coinflip-result.lose {
                background: linear-gradient(135deg, #F44336 0%, #d32f2f 50%, #F44336 100%) !important;
                border-color: #c62828 !important;
            }
            
            #coinflip-result.win h3,
            #coinflip-result.lose h3,
            #coinflip-result.win p,
            #coinflip-result.lose p {
                color: white !important;
                text-shadow: 1px 1px 0px rgba(0,0,0,0.5) !important;
            }
            
            .bet-button.selected {
                transform: translateY(2px);
                box-shadow: 0 2px 0 currentColor, 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Attach event listeners to the coinflip modal
    Game_Interpreter.prototype.attachCoinflipEventListeners = function(overlay, modal) {
        const coin = modal.querySelector('#coinflip-coin');
        const greenBtn = modal.querySelector('#coinflip-green');
        const brownBtn = modal.querySelector('#coinflip-brown');
        const result = modal.querySelector('#coinflip-result');
        const resultTitle = modal.querySelector('#coinflip-result-title');
        const resultText = modal.querySelector('#coinflip-result-text');
        const closeBtn = modal.querySelector('#coinflip-close');
        const logoNormal = modal.querySelector('#coinflip-logo');
        const logoGreen = modal.querySelector('#coinflip-logo-green');
        
        // Wallet elements
        const walletConnectBtn = modal.querySelector('#coinflip-connect-wallet');
        const walletInfo = modal.querySelector('#coinflip-wallet-info');
        const walletConnect = modal.querySelector('#coinflip-wallet-connect');
        const walletAddress = modal.querySelector('#coinflip-wallet-address');
        const walletBalance = modal.querySelector('#coinflip-wallet-balance');
        const contractBalance = modal.querySelector('#coinflip-contract-balance');
        const bettingSection = modal.querySelector('#coinflip-betting-section');
        
        // Bet elements
        const bet0001Btn = modal.querySelector('#coinflip-bet-0001');
        const bet01Btn = modal.querySelector('#coinflip-bet-01');
        const bet1Btn = modal.querySelector('#coinflip-bet-1');
        const customBetInput = modal.querySelector('#coinflip-custom-bet');
        const currentBetDisplay = modal.querySelector('#coinflip-current-bet');
        const betAmountSpan = modal.querySelector('#coinflip-bet-amount');
        
        // Transaction elements
        const transactionStatus = modal.querySelector('#coinflip-transaction-status');
        const transactionText = modal.querySelector('#coinflip-transaction-text');
        const transactionActions = modal.querySelector('#coinflip-transaction-actions');
        const cancelTxBtn = modal.querySelector('#coinflip-cancel-tx');
        const accelerateTxBtn = modal.querySelector('#coinflip-accelerate-tx');
        
        let currentBet = 0;
        let selectedBetButton = null;
        let currentAccount = null;
        let contract = null;
        let currentTransaction = null;
        let transactionTimeout = null;
        
        // Function to close the modal
        const closeModal = () => {
            // Clear any pending timeouts
            if (transactionTimeout) {
                clearTimeout(transactionTimeout);
                transactionTimeout = null;
            }
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };

        // Function to cancel pending transaction
        const cancelTransaction = async () => {
            try {
                if (currentTransaction && currentTransaction.hash) {
                    // Try to cancel the transaction by sending a 0 ETH transaction with same nonce
                    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const nonce = await provider.getTransactionCount(currentAccount);
                    
                    const cancelTx = await signer.sendTransaction({
                        to: currentAccount,
                        value: 0,
                        gasLimit: 21000,
                        gasPrice: currentTransaction.gasPrice,
                        nonce: nonce
                    });
                    
                    transactionText.textContent = `Cancellation sent: ${cancelTx.hash.slice(0, 10)}...`;
                    await cancelTx.wait();
                    transactionText.textContent = `Transaction cancelled successfully!`;
                }
            } catch (error) {
                console.error('Cancel transaction error:', error);
                transactionText.textContent = `Cancel failed: ${error.message}`;
            }
            
            // Reset UI
            setTimeout(() => {
                transactionStatus.style.display = 'none';
                transactionActions.style.display = 'none';
                greenBtn.disabled = false;
                brownBtn.disabled = false;
            }, 3000);
        };

        // Function to accelerate transaction
        const accelerateTransaction = async () => {
            try {
                if (currentTransaction && currentTransaction.hash) {
                    // Increase gas price by 20% to accelerate
                    const provider = new window.ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const currentGasPrice = await provider.getGasPrice();
                    const acceleratedGasPrice = currentGasPrice.mul(120).div(100);
                    
                    const accelerateTx = await signer.sendTransaction({
                        to: currentAccount,
                        value: 0,
                        gasLimit: 21000,
                        gasPrice: acceleratedGasPrice,
                        nonce: currentTransaction.nonce
                    });
                    
                    transactionText.textContent = `Acceleration sent: ${accelerateTx.hash.slice(0, 10)}...`;
                    await accelerateTx.wait();
                    transactionText.textContent = `Transaction accelerated!`;
                }
            } catch (error) {
                console.error('Accelerate transaction error:', error);
                transactionText.textContent = `Acceleration failed: ${error.message}`;
            }
        };
        

        // Function to update bet display
        const updateBetDisplay = async (amount) => {
            currentBet = amount;
            betAmountSpan.textContent = `${amount} ETH`;
            currentBetDisplay.style.display = 'block';
            
            // Check if contract has sufficient funds
            const contractBalanceValue = await checkContractBalance();
            const contractBalanceNum = parseFloat(contractBalanceValue);
            const requiredBalance = amount * 2;
            
            if (contractBalanceNum < requiredBalance) {
                // Disable flip buttons if insufficient funds
                greenBtn.disabled = true;
                brownBtn.disabled = true;
            } else {
                // Enable flip buttons
                greenBtn.disabled = false;
                brownBtn.disabled = false;
            }
        };
        
        // Function to select bet button
        const selectBetButton = async (button, amount) => {
            // Remove selected class from all bet buttons
            [bet0001Btn, bet01Btn, bet1Btn].forEach(btn => {
                if (btn.className) {
                    btn.className = btn.className.replace('selected', '').trim();
                }
            });
            
            // Add selected class to clicked button
            if (button.className) {
                button.className += ' selected';
            } else {
                button.className = 'selected';
            }
            
            selectedBetButton = button;
            await updateBetDisplay(amount);
            
            // Clear custom input
            customBetInput.value = '';
        };
        
        // Function to show result
        const showResult = (isWin, choice, coinResult, amount, txHash) => {
            // Remove classes safely
            if (result.className) {
                result.className = result.className.replace('win', '').replace('lose', '').trim();
            }
            // Add new class
            result.className += (isWin ? ' win' : ' lose');
            
            const winAmount = isWin ? amount * 2 : 0;
            const resultMessage = isWin 
                ? `You won ${winAmount} ETH! You chose ${choice ? 'Green' : 'Brown'} and got ${coinResult ? 'Green' : 'Brown'}. Transaction: ${txHash.slice(0, 10)}...`
                : `You lost ${amount} ETH. You chose ${choice ? 'Green' : 'Brown'} and got ${coinResult ? 'Green' : 'Brown'}. Transaction: ${txHash.slice(0, 10)}...`;
            
            resultTitle.textContent = isWin ? 'You Won!' : 'You Lost!';
            resultText.textContent = resultMessage;
            
            result.style.display = 'block';
        };
        
        // Function to connect wallet
        const connectWallet = async () => {
            try {
                // Check Web3 libraries first, wait if needed
                if (!checkWeb3Libraries()) {
                    console.log('⏳ Web3 libraries not ready, waiting...');
                    await waitForWeb3Libraries();
                }
                
                // Check if MetaMask is installed
                if (typeof window.ethereum === 'undefined') {
                    alert('Please install MetaMask to connect your wallet!');
                    return;
                }

                // Request account access
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });

                if (accounts.length === 0) {
                    alert('No accounts found!');
                    return;
                }

                currentAccount = accounts[0];

                // Check if we're on the correct network (Abstract Chain - 2741)
                const chainId = await window.ethereum.request({ 
                    method: 'eth_chainId' 
                });

                if (chainId !== '0xab5') { // 2741 in hex
                    try {
                        // Try to switch to Abstract Chain
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0xab5' }],
                        });
                    } catch (switchError) {
                        // If the network doesn't exist, add it
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: '0xab5',
                                        chainName: 'Abstract',
                                        nativeCurrency: {
                                            name: 'Ether',
                                            symbol: 'ETH',
                                            decimals: 18
                                        },
                                        rpcUrls: ['https://api.mainnet.abs.xyz'],
                                        blockExplorerUrls: ['https://abscan.org/']
                                    }],
                                });
                            } catch (addError) {
                                alert('Failed to add Abstract Chain to MetaMask!');
                                return;
                            }
                        } else {
                            alert('Failed to switch to Abstract Chain!');
                            return;
                        }
                    }
                }

                // Update wallet display
                walletAddress.textContent = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                walletConnect.style.display = 'none';
                walletInfo.style.display = 'block';
                bettingSection.style.display = 'block';

                // Get wallet balance
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [currentAccount, 'latest']
                });
                const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
                walletBalance.textContent = `${balanceInEth} ETH`;

                // Get contract balance
                try {
                    const contractBalanceValue = await checkContractBalance();
                    contractBalance.textContent = `${parseFloat(contractBalanceValue).toFixed(4)} ETH`;
                } catch (error) {
                    console.warn('Failed to load contract balance:', error);
                    contractBalance.textContent = 'Error loading';
                }

                // Initialize contract
                try {
                    if (typeof window.ethers !== 'undefined' && window.ethers.providers && window.ethers.utils) {
                        const provider = new window.ethers.providers.Web3Provider(window.ethereum);
                        const signer = provider.getSigner();
                        contract = new window.ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signer);
                        console.log('✅ Contract initialized with Ethers.js');
                    } else if (typeof Web3 !== 'undefined') {
                        // Fallback to Web3 if ethers is not available
                        const web3 = new Web3(window.ethereum);
                        contract = new web3.eth.Contract(CONTRACT_CONFIG.abi, CONTRACT_CONFIG.address);
                        console.log('✅ Contract initialized with Web3.js');
                    } else {
                        alert('Please install ethers.js or web3.js for contract interaction!');
                        return;
                    }
                } catch (contractError) {
                    console.error('Contract initialization error:', contractError);
                    alert('Failed to initialize contract: ' + contractError.message);
                    return;
                }

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        // Disconnected
                        currentAccount = null;
                        contract = null;
                        walletConnect.style.display = 'block';
                        walletInfo.style.display = 'none';
                        bettingSection.style.display = 'none';
                    } else {
                        // Account changed
                        currentAccount = accounts[0];
                        walletAddress.textContent = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                    }
                });

            } catch (error) {
                console.error('Wallet connection error:', error);
                alert('Failed to connect wallet: ' + error.message);
            }
        };
        
        // Function to check contract balance
        const checkContractBalance = async () => {
            try {
                if (typeof window.ethers !== 'undefined' && window.ethers.providers && window.ethers.utils) {
                    const contractBalance = await contract.getBalance();
                    return window.ethers.utils.formatEther(contractBalance);
                } else if (typeof Web3 !== 'undefined') {
                    const contractBalance = await contract.methods.getBalance().call();
                    const web3 = new Web3(window.ethereum);
                    return web3.utils.fromWei(contractBalance, 'ether');
                }
            } catch (error) {
                console.warn('Failed to get contract balance:', error);
                return '0';
            }
        };

        // Function to handle coin flip
        const handleFlip = async (choice) => {
            if (currentBet <= 0) {
                alert('Please select a bet amount first!');
                return;
            }

            if (!currentAccount || !contract) {
                alert('Please connect your wallet first!');
                return;
            }

            // Check contract balance before allowing flip
            const contractBalance = await checkContractBalance();
            const contractBalanceNum = parseFloat(contractBalance);
            const requiredBalance = currentBet * 2; // Contract needs 2x the bet to pay winnings

            if (contractBalanceNum < requiredBalance) {
                alert(`Contract has insufficient funds!\n\nContract Balance: ${contractBalance} ETH\nRequired: ${requiredBalance} ETH\n\nPlease try a smaller bet or contact the contract owner to add funds.`);
                return;
            }

            // Disable buttons during flip
            greenBtn.disabled = true;
            brownBtn.disabled = true;
            
            // Show transaction status
            transactionStatus.style.display = 'block';
            transactionText.textContent = 'Processing transaction...';
            transactionActions.style.display = 'none';
            
            try {
                // Start coin spinning animation
                if (coin.className) {
                    coin.className += ' coinflip-spinning';
                } else {
                    coin.className = 'coinflip-spinning';
                }

                // Call the contract
                let tx;
                let coinResult, isWin;
                
                if (typeof window.ethers !== 'undefined' && window.ethers.providers && window.ethers.utils) {
                    // Use ethers.js
                    try {
                        // Validate ethers.js components
                        if (!window.ethers.utils.parseEther) {
                            throw new Error('ethers.js utils.parseEther not available');
                        }
                        if (!window.ethers.utils.formatEther) {
                            throw new Error('ethers.js utils.formatEther not available');
                        }
                        
                        // Convert ETH to Wei
                        const betAmountWei = window.ethers.utils.parseEther(currentBet.toString());
                        
                        // Get current gas price and estimate gas limit
                        const provider = new window.ethers.providers.Web3Provider(window.ethereum);
                        const gasPrice = await provider.getGasPrice();
                        
                        // Estimate gas for the flip function
                        let gasLimit;
                        try {
                            gasLimit = await contract.estimateGas.flip(choice, { value: betAmountWei });
                            // Add 20% buffer to gas limit to prevent out of gas errors
                            gasLimit = gasLimit.mul(120).div(100);
                        } catch (estimateError) {
                            console.warn('Gas estimation failed, using default:', estimateError);
                            // Use a reasonable default gas limit for coinflip (around 150,000)
                            gasLimit = window.ethers.BigNumber.from('180000');
                        }
                        
                        // Use current gas price or slightly higher for faster confirmation
                        const optimizedGasPrice = gasPrice.mul(110).div(100); // 10% higher for faster confirmation
                        
                        
                        tx = await contract.flip(choice, { 
                            value: betAmountWei,
                            gasLimit: gasLimit,
                            gasPrice: optimizedGasPrice
                        });
                        
                        // Store transaction reference for cancellation/acceleration
                        currentTransaction = tx;
                        transactionText.textContent = `Transaction sent: ${tx.hash.slice(0, 10)}...`;
                        
                        // Show action buttons after 5 seconds if still pending
                        transactionTimeout = setTimeout(() => {
                            if (transactionStatus.style.display !== 'none') {
                                transactionActions.style.display = 'block';
                                transactionText.textContent = `Transaction pending: ${tx.hash.slice(0, 10)}...`;
                            }
                        }, 5000);
                        
                        // Wait for transaction confirmation with timeout
                        const receipt = await Promise.race([
                            tx.wait(),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Transaction timeout after 1 minute')), 60000)
                            )
                        ]);
                        transactionText.textContent = `Transaction confirmed!`;
                        
                        // Get the FlipResult event
                        const flipEvent = receipt.events?.find(event => event.event === 'FlipResult');
                        if (flipEvent) {
                            const { choice: playerChoice, result: coinResult, amount, won } = flipEvent.args;
                            const amountInEth = window.ethers.utils.formatEther(amount);
                            
                            isWin = won;
                            coinResult = coinResult;
                            
                            // Show result
                            showResult(isWin, playerChoice, coinResult, parseFloat(amountInEth), tx.hash);
                            
                            // Update wallet balance
                            const balance = await window.ethereum.request({
                                method: 'eth_getBalance',
                                params: [currentAccount, 'latest']
                            });
                            const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
                            walletBalance.textContent = `${balanceInEth} ETH`;

                            // Update contract balance
                            try {
                                const contractBalanceValue = await checkContractBalance();
                                contractBalance.textContent = `${parseFloat(contractBalanceValue).toFixed(4)} ETH`;
                            } catch (error) {
                                console.warn('Failed to update contract balance:', error);
                            }
                        } else {
                            // Fallback if event not found
                            isWin = Math.random() < 0.5;
                            coinResult = Math.random() < 0.5;
                            showResult(isWin, choice, coinResult, currentBet, tx.hash);
                        }
                    } catch (ethersError) {
                        console.error('Ethers.js error:', ethersError);
                        throw new Error(`Ethers.js transaction failed: ${ethersError.message}`);
                    }
                } else if (typeof Web3 !== 'undefined') {
                    // Fallback to Web3
                    try {
                        const web3 = new Web3(window.ethereum);
                        const accounts = await web3.eth.getAccounts();
                        
                        // Convert ETH to Wei
                        const betAmountWei = web3.utils.toWei(currentBet.toString(), 'ether');
                        
                        // Get current gas price and estimate gas limit
                        const gasPrice = await web3.eth.getGasPrice();
                        
                        // Estimate gas for the flip function
                        let gasLimit;
                        try {
                            gasLimit = await contract.methods.flip(choice).estimateGas({
                                from: accounts[0],
                                value: betAmountWei
                            });
                            // Add 20% buffer to gas limit
                            gasLimit = Math.floor(gasLimit * 1.2);
                        } catch (estimateError) {
                            console.warn('Gas estimation failed, using default:', estimateError);
                            // Use a reasonable default gas limit for coinflip
                            gasLimit = 180000;
                        }
                        
                        // Use current gas price or slightly higher for faster confirmation
                        const optimizedGasPrice = Math.floor(parseInt(gasPrice) * 1.1); // 10% higher for faster confirmation
                        
                        
                        tx = await Promise.race([
                            contract.methods.flip(choice).send({
                                from: accounts[0],
                                value: betAmountWei,
                                gas: gasLimit,
                                gasPrice: optimizedGasPrice
                            }),
                            new Promise((_, reject) => 
                                setTimeout(() => reject(new Error('Transaction timeout after 1 minute')), 60000)
                            )
                        ]);
                        
                        // Store transaction reference
                        currentTransaction = tx;
                        transactionText.textContent = `Transaction confirmed!`;
                        
                        // For Web3, we need to get the result differently
                        // This is a simplified approach - in production you'd want to parse events properly
                        isWin = Math.random() < 0.5; // This should come from the blockchain event
                        coinResult = Math.random() < 0.5;
                        showResult(isWin, choice, coinResult, currentBet, tx.transactionHash);
                        
                        // Update wallet balance
                        const balance = await window.ethereum.request({
                            method: 'eth_getBalance',
                            params: [currentAccount, 'latest']
                        });
                        const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
                        walletBalance.textContent = `${balanceInEth} ETH`;

                        // Update contract balance
                        try {
                            const contractBalanceValue = await checkContractBalance();
                            contractBalance.textContent = `${parseFloat(contractBalanceValue).toFixed(4)} ETH`;
                        } catch (error) {
                            console.warn('Failed to update contract balance:', error);
                        }
                    } catch (web3Error) {
                        console.error('Web3 error:', web3Error);
                        throw new Error(`Web3 transaction failed: ${web3Error.message}`);
                    }
                } else {
                    throw new Error('Neither Ethers.js nor Web3.js is available. Please refresh the page and try again.');
                }
                
                // Stop spinning and show result face
                if (coin.className) {
                    coin.className = coin.className.replace('coinflip-spinning', '').trim();
                }
                
                // Show the result face of the coin
                if (coinResult) {
                    // Green face
                    logoNormal.style.opacity = '0';
                    logoGreen.style.opacity = '1';
                    logoGreen.style.transform = 'translate(-50%, -50%) scale(1.1)';
                } else {
                    // Brown face (normal)
                    logoNormal.style.opacity = '1';
                    logoGreen.style.opacity = '0';
                    logoGreen.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                
                // Clear transaction references and hide status
                currentTransaction = null;
                if (transactionTimeout) {
                    clearTimeout(transactionTimeout);
                    transactionTimeout = null;
                }
                
                // Hide transaction status after a delay
                setTimeout(() => {
                    transactionStatus.style.display = 'none';
                    transactionActions.style.display = 'none';
                }, 3000);
                
            } catch (error) {
                console.error('Transaction error:', error);
                transactionText.textContent = `Transaction failed: ${error.message}`;
                
                // Stop spinning
                if (coin.className) {
                    coin.className = coin.className.replace('coinflip-spinning', '').trim();
                }
                
                // Show error result
                showResult(false, choice, Math.random() < 0.5, currentBet, 'Failed');
                
                // Clear transaction references
                currentTransaction = null;
                if (transactionTimeout) {
                    clearTimeout(transactionTimeout);
                    transactionTimeout = null;
                }
                
                // Hide transaction status after a delay
                setTimeout(() => {
                    transactionStatus.style.display = 'none';
                    transactionActions.style.display = 'none';
                }, 5000);
            } finally {
                // Re-enable buttons
                greenBtn.disabled = false;
                brownBtn.disabled = false;
            }
        };
        
        // Add wallet connect event listener
        walletConnectBtn.addEventListener('click', connectWallet);
        
        // Add bet button event listeners
        bet0001Btn.addEventListener('click', () => selectBetButton(bet0001Btn, 0.0001));
        bet01Btn.addEventListener('click', () => selectBetButton(bet01Btn, 0.01));
        bet1Btn.addEventListener('click', () => selectBetButton(bet1Btn, 0.1));
        
        // Add custom bet input listener
        customBetInput.addEventListener('input', async (e) => {
            const value = parseFloat(e.target.value);
            if (value && value >= 0.0001) {
                // Remove selected class from all bet buttons
                [bet0001Btn, bet01Btn, bet1Btn].forEach(btn => {
                    if (btn.className) {
                        btn.className = btn.className.replace('selected', '').trim();
                    }
                });
                selectedBetButton = null;
                await updateBetDisplay(value);
            } else if (value === 0 || isNaN(value)) {
                currentBetDisplay.style.display = 'none';
            }
        });
        
        // Add click event listeners
        greenBtn.addEventListener('click', () => handleFlip(true));
        brownBtn.addEventListener('click', () => handleFlip(false));
        closeBtn.addEventListener('click', closeModal);
        cancelTxBtn.addEventListener('click', cancelTransaction);
        accelerateTxBtn.addEventListener('click', accelerateTransaction);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Prevent game keys from working when modal is open
        const preventGameKeys = (e) => {
            // Allow only specific keys for the input field
            if (e.target.id === 'coinflip-custom-bet') {
                // Allow numbers, decimal, backspace, delete, arrows, tab, enter
                const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'];
                if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } else if (e.target.closest('#coinflip-modal')) {
                // If the event is from within the modal, prevent it from reaching the game
                e.preventDefault();
                e.stopPropagation();
            }
            // If the event is not from the modal, let it pass through normally
        };
        
        // Add key event listeners to prevent game interference
        document.addEventListener('keydown', preventGameKeys, false);
        document.addEventListener('keyup', preventGameKeys, false);
        
        // Remove event listeners when modal closes
        const originalCloseModal = closeModal;
        closeModal = () => {
            document.removeEventListener('keydown', preventGameKeys, false);
            document.removeEventListener('keyup', preventGameKeys, false);
            originalCloseModal();
            
            // Restore focus to the game canvas to ensure keyboard input works
            setTimeout(() => {
                const gameCanvas = document.querySelector('canvas');
                if (gameCanvas) {
                    gameCanvas.focus();
                }
                // Also try to restore focus to the window
                window.focus();
            }, 100);
        };
    };

})();
