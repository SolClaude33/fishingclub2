//=============================================================================
// RPG Maker MZ - Vending Machine Payment (Abstract Chain)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Opens a centered payment modal to send ETH on Abstract chain.
 * @author Assistant
 *
 * @help VendingMachinePayment.js
 *
 * Exposes a global function `openVendingPaymentModal()` that shows a modal
 * to collect a destination wallet and amount (ETH), then submits an
 * `eth_sendTransaction` on Abstract chain (chainId 2741, 0xab5).
 */

(() => {
	'use strict';

	const ABSTRACT_CHAIN_HEX = '0xab5'; // 2741
	const ABSTRACT_RPC_URL = 'https://api.mainnet.abs.xyz';
	const ABSTRACT_EXPLORER = 'https://abscan.org/tx/';

	async function ensureAbstractChain() {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask is not available');
		}
		const current = await window.ethereum.request({ method: 'eth_chainId' });
		if (current === ABSTRACT_CHAIN_HEX) return;
		try {
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: ABSTRACT_CHAIN_HEX }]
			});
		} catch (switchError) {
			if (switchError && switchError.code === 4902) {
				await window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: ABSTRACT_CHAIN_HEX,
						chainName: 'Abstract',
						nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
						rpcUrls: [ABSTRACT_RPC_URL],
						blockExplorerUrls: ['https://abscan.org/']
					}]
				});
			} else {
				throw new Error('failed to switch to abstract chain');
			}
		}
	}

	function isValidAddress(address) {
		return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
	}

	function parseEthToWei(ethString) {
		const trimmed = String(ethString || '').trim();
		if (!trimmed) throw new Error('amount is required');
		if (!/^[0-9]+(\.[0-9]{1,18})?$/.test(trimmed)) {
			throw new Error('invalid amount format');
		}
		const [whole, frac = ''] = trimmed.split('.');
		const fracPadded = (frac + '0'.repeat(18)).slice(0, 18);
		const weiStr = whole + fracPadded; // base 10 string
		const wei = BigInt(weiStr);
		if (wei <= 0n) throw new Error('amount must be greater than 0');
		return '0x' + wei.toString(16);
	}

	function createStylesOnce() {
		if (document.getElementById('vending-payment-styles')) return;
		const style = document.createElement('style');
		style.id = 'vending-payment-styles';
		style.textContent = `
			#vending-overlay {
				position: fixed;
				Top: 0; Left: 0; Width: 100%; Height: 100%;
				inset: 0;
				background: rgba(0, 0, 0, 0.9);
				display: flex; align-items: center; justify-content: center;
				z-index: 30000;
			}
			#vending-modal {
				position: relative;
				max-width: 80%;
				max-height: 80%;
				background: linear-gradient(135deg, #F5F5DC 0%, #F0E68C 50%, #F5F5DC 100%);
				border: 3px solid #8B4513;
				border-radius: 8px;
				padding: 20px;
				color: #2F4F2F;
				font-family: Arial, sans-serif;
				box-shadow:
					0 6px 0 #8B4513,
					0 4px 8px rgba(0,0,0,0.3),
					inset 0 1px 0 rgba(255,255,255,0.4);
				overflow: hidden;
			}
			#vending-modal h3 {
				margin: 0 0 16px 0;
				color: #8B4513;
				font-size: 20px; font-weight: bold; text-align: center;
				text-shadow: 1px 1px 0px #F5DEB3;
				border-bottom: 2px solid #8B4513; padding-bottom: 10px;
			}
			.vending-grid { display: grid; grid-template-columns: repeat(3, 160px); justify-content: center; gap: 16px; margin-top: 8px; }
			.vending-card { background: #F5F5DC; border: 3px solid #8B4513; border-radius: 8px; overflow: hidden; box-shadow: inset 0 1px 0 rgba(0,0,0,0.05); }
			.vending-card img { width: 160px; height: 160px; display: block; object-fit: cover; }
			.vending-actions { display: flex; gap: 12px; margin-top: 18px; }
			.vending-btn { flex: 1; padding: 12px 16px; border-radius: 8px; color: #fff; cursor: pointer; font-weight: bold; border: 3px solid #654321; box-shadow: 0 4px 0 #654321, 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2); transition: transform 0.1s ease, box-shadow 0.1s ease; }
			.vending-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #654321, 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
			.vending-btn.mint { background: linear-gradient(135deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%); text-shadow: 1px 1px 0px #2E7D32; }
			.vending-btn.close { background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%); text-shadow: 1px 1px 0px #654321; }
			.vending-note { font-size: 12px; opacity: 0.9; margin-top: 8px; text-align: center; color: #8B4513; font-weight: bold; }
		`;
		document.head.appendChild(style);
	}

	function showNotification(message, type = 'info') {
		try {
			if (typeof window.showNotification === 'function') {
				window.showNotification(message, type);
				return;
			}
		} catch (_) {}
		const note = document.createElement('div');
		note.style.cssText = 'position:fixed;top:80px;right:20px;z-index:10060;background:#2196F3;color:#fff;padding:10px 14px;border-radius:8px;font:14px Arial;box-shadow:0 4px 15px rgba(0,0,0,0.2)';
		note.textContent = message;
		document.body.appendChild(note);
		setTimeout(() => { if (note.parentNode) note.parentNode.removeChild(note); }, 3000);
	}

	async function submitTransaction(toAddress, amountEth) {
		await ensureAbstractChain();
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		if (!accounts || accounts.length === 0) throw new Error('no account available');
		const from = accounts[0];
		const value = parseEthToWei(amountEth);

		// Let MetaMask estimate and choose gas/fees
		const tx = { from, to: toAddress, value };
		const hash = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
		return { hash, explorerUrl: ABSTRACT_EXPLORER + hash };
	}

	function buildModal(onClose) {
		createStylesOnce();
		const overlay = document.createElement('div');
		overlay.id = 'vending-overlay';
		const modal = document.createElement('div');
		modal.id = 'vending-modal';
		modal.innerHTML = `
			<h3>Penguin Fishing Club - Mint</h3>
			<div class="vending-grid">
				<div class="vending-card"><img src="img/nft.gif" alt="nft preview 1" /></div>
				<div class="vending-card"><img src="img/nft.gif" alt="nft preview 2" /></div>
				<div class="vending-card"><img src="img/nft.gif" alt="nft preview 3" /></div>
			</div>
			<div class="vending-actions">
				<button id="vending-close" class="vending-btn close">Close</button>
				<button id="vending-mint" class="vending-btn mint">Mint</button>
			</div>
			<div class="vending-note">collection is not live yet. you will be able to mint here soon via this vendor machine.</div>
		`;
		overlay.appendChild(modal);
		function close() {
			if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
			if (typeof onClose === 'function') onClose();
		}
		overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
		modal.querySelector('#vending-close').addEventListener('click', close);
		return { overlay, modal, close };
	}

	function attachMintHandler(modalElements) {
		const mintBtn = modalElements.modal.querySelector('#vending-mint');
		mintBtn.addEventListener('click', () => {
			showNotification('the collection is being prepared. it will be mintable here soon.', 'info');
		});
	}

	window.openVendingPaymentModal = function openVendingPaymentModal() {
		const modal = buildModal();
		document.body.appendChild(modal.overlay);
		attachMintHandler(modal);
	};

})();


