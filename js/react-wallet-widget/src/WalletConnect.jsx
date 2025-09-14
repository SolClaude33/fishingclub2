import React, { useState } from 'react'
import { usePrivy, useCrossAppAccounts } from '@privy-io/react-auth'

function WalletConnect() {
  const { ready, authenticated, user, logout } = usePrivy()
  const { loginWithCrossAppAccount } = useCrossAppAccounts()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      if (!ready) throw new Error('Privy aún no está listo. Intenta de nuevo en unos segundos.')
      await loginWithCrossAppAccount({ appId: 'cm04asygd041fmry9zmcyn5o5' })
    } catch (error) {
      setErrorMessage(error.message || 'Error al conectar con Abstract Global Wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Error al desconectar')
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Comunicar al juego vanilla cuando se conecta
  React.useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      window.dispatchEvent(new CustomEvent('walletConnected', {
        detail: {
          wallet: user.wallet.address,
          user
        }
      }))
    }
  }, [authenticated, user])

  if (!ready) {
    return (
      <div className="wallet-container">
        <div className="wallet-card">
          <div className="connect-section">
            <h2>Inicializando...</h2>
            <p>Preparando la conexión con Abstract Global Wallet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-container">
      <div className="wallet-card">
        {!authenticated ? (
          <div className="connect-section">
            <h2>Conectar Abstract Global Wallet</h2>
            <p>Haz clic para redirigir a la página de Abstract Global Wallet y conectar</p>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button
              className="connect-button"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Redirigiendo...' : 'Conectar Abstract Global Wallet'}
            </button>
          </div>
        ) : (
          <div className="connected-section">
            <h2>Abstract Global Wallet Conectada</h2>
            <div className="wallet-info">
              <div className="info-item">
                <span className="label">Usuario:</span>
                <span className="value">{user?.id ? formatAddress(user.id) : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user?.email?.address || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Wallets:</span>
                <span className="value">{user?.linkedAccounts?.length || 0}</span>
              </div>
            </div>
            <button
              className="disconnect-button"
              onClick={handleLogout}
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletConnect
