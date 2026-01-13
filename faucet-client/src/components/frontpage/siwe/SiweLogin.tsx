import React from 'react';
import { IFaucetConfig } from '../../../common/FaucetConfig';
import { IFaucetContext } from '../../../common/FaucetContext';
import { BrowserProvider, getAddress } from 'ethers';

import './SiweLogin.css';

export interface ISiweLoginProps {
  faucetContext: IFaucetContext;
  faucetConfig: IFaucetConfig;
  targetAddr: string;
  onAddressAutofill?: (address: string) => void;
}

export interface ISiweLoginState {
  connecting: boolean;
  authInfo: ISiweAuthInfo | null;
  error: string | null;
}

export interface ISiweAuthInfo {
  address: string;
  token: string;
  time: number;
}

export class SiweLogin extends React.PureComponent<ISiweLoginProps, ISiweLoginState> {
  constructor(props: ISiweLoginProps) {
    super(props);

    this.state = {
      connecting: false,
      authInfo: null,
      error: null,
    };
  }

  public componentDidMount() {
    // Intentar recuperar sesión SIWE del localStorage
    const stored = localStorage.getItem('siwe.AuthInfo');
    if (stored) {
      try {
        const authInfo = JSON.parse(stored) as ISiweAuthInfo;
        this.loadAuthInfo(authInfo);
      } catch (ex) {
        console.error('Error parsing SIWE auth info:', ex);
        localStorage.removeItem('siwe.AuthInfo');
      }
    }
  }

  public render(): React.ReactElement {
    const siweConfig = this.props.faucetConfig.modules.siwe;
    
    return (
      <div className="faucet-auth faucet-auth-siwe">
        <div className="auth-icon">
          <div className="logo logo-siwe"></div>
        </div>
        {this.state.authInfo ? this.renderAuthState() : this.renderLoginButton()}
        {this.state.error && (
          <div className="auth-error">{this.state.error}</div>
        )}
        {siweConfig?.rewardFactor && siweConfig.rewardFactor > 1 && !this.state.authInfo && (
          <div className="siwe-bonus">
            Sign in to get <span className="bonus-value">{((siweConfig.rewardFactor - 1) * 100).toFixed(0)}% bonus</span> rewards!
          </div>
        )}
      </div>
    );
  }

  private renderLoginButton(): React.ReactElement {
    return (
      <div className="auth-field auth-noauth" onClick={() => this.onLoginClick()}>
        <div>Verify wallet ownership for bonus rewards</div>
        <div>
          <a href="#" onClick={(evt) => evt.preventDefault()}>
            {this.state.connecting && (
              <span className="inline-spinner">
                <img
                  src={(this.props.faucetContext.faucetUrls.imagesUrl || '/images') + '/spinner.gif'}
                  className="spinner"
                  alt="Loading"
                />
              </span>
            )}
            Sign-In with Ethereum
          </a>
        </div>
      </div>
    );
  }

  private renderAuthState(): React.ReactElement {
    const address = this.state.authInfo!.address;
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <div className="auth-field auth-profile">
        <div className="auth-info">
          Verified wallet: <span className="wallet-address">{shortAddr}</span>
        </div>
        <div>
          <a href="#" onClick={(evt) => { evt.preventDefault(); this.onLogoutClick(); }}>
            Disconnect
          </a>
        </div>
      </div>
    );
  }

  public getAuthInfo(): { address: string; token: string } | null {
    return this.state.authInfo;
  }

  private async onLoginClick() {
    if (this.state.connecting) return;

    this.setState({ connecting: true, error: null });

    try {
      // Verificar que MetaMask u otro provider esté disponible
      if (!(window as any).ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask.');
      }

      const provider = new BrowserProvider((window as any).ethereum);
      
      // Solicitar conexión de wallet
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No account selected');
      }

      const address = accounts[0];
      const signer = await provider.getSigner();
      
      // Obtener dirección con checksum (EIP-55)
      const checksumAddress = getAddress(address);

      // Obtener nonce del servidor
      const nonceResponse = await fetch(
        this.props.faucetContext.faucetApi.getApiUrl('/siweNonce')
      );
      const nonceData = await nonceResponse.json();

      if (!nonceData.nonce) {
        throw new Error('Failed to get nonce from server');
      }

      // Construir mensaje SIWE
      const siweConfig = this.props.faucetConfig.modules.siwe;
      const domain = siweConfig?.domain || window.location.host;
      const uri = siweConfig?.uri || window.location.origin;
      const issuedAt = new Date().toISOString();
      
      // Obtener chainId de la red conectada
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const message = this.createSiweMessage({
        domain,
        address: checksumAddress,
        statement: 'Sign in to PoWFaucet to verify wallet ownership.',
        uri,
        version: '1',
        chainId: chainId,
        nonce: nonceData.nonce,
        issuedAt,
      });

      // Solicitar firma
      const signature = await signer.signMessage(message);

      // Verificar firma en el servidor
      const verifyResponse = await fetch(
        this.props.faucetContext.faucetApi.getApiUrl('/siweVerify'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature }),
        }
      );
      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Verification failed');
      }

      // Guardar autenticación
      const authInfo: ISiweAuthInfo = {
        address: verifyData.address,
        token: verifyData.token,
        time: Math.floor(Date.now() / 1000),
      };

      localStorage.setItem('siwe.AuthInfo', JSON.stringify(authInfo));
      
      this.setState({
        authInfo,
        connecting: false,
      });

      // Auto-fill address if callback is provided
      if (this.props.onAddressAutofill) {
        this.props.onAddressAutofill(authInfo.address);
      }

    } catch (ex: any) {
      console.error('SIWE login error:', ex);
      this.setState({
        connecting: false,
        error: ex.message || 'Authentication failed',
      });
    }
  }

  private createSiweMessage(params: {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: string;
    chainId: number;
    nonce: string;
    issuedAt: string;
  }): string {
    return [
      `${params.domain} wants you to sign in with your Ethereum account:`,
      params.address,
      '',
      params.statement,
      '',
      `URI: ${params.uri}`,
      `Version: ${params.version}`,
      `Chain ID: ${params.chainId}`,
      `Nonce: ${params.nonce}`,
      `Issued At: ${params.issuedAt}`,
    ].join('\n');
  }

  private onLogoutClick() {
    localStorage.removeItem('siwe.AuthInfo');
    this.setState({ authInfo: null });
  }

  private loadAuthInfo(authInfo: ISiweAuthInfo) {
    const siweConfig = this.props.faucetConfig.modules.siwe;
    const sessionExpiration = siweConfig?.sessionExpiration || 86400;
    const now = Math.floor(Date.now() / 1000);
    
    // Verificar que la sesión no haya expirado
    if (now - authInfo.time > sessionExpiration) {
      localStorage.removeItem('siwe.AuthInfo');
      return;
    }

    this.setState({ authInfo });
  }
}
