import React from "react";
import ReactDOM from "react-dom/client";
import WalletConnect from "./WalletConnect";
import { PrivyProvider } from '@privy-io/react-auth';
import "./widget.css";

window.renderWalletWidget = (targetId = "react-wallet-root") => {
  ReactDOM.createRoot(document.getElementById(targetId)).render(
    <React.StrictMode>
      <PrivyProvider
        appId="cmfis25nk00c0kw0chjt4a4cl"
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#667eea',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          loginMethods: ['wallet', 'email'],
          showWalletLoginFirst: false,
        }}
      >
        <WalletConnect />
      </PrivyProvider>
    </React.StrictMode>
  );
};
