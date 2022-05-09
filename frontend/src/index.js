import React from "react";
import ReactDOM from "react-dom";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import "bootstrap/dist/css/bootstrap.css";

import Cats from "./Cats.json";

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const web3Modal = new Web3Modal();

function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-12 text-center">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage 
              message={networkError} 
              dismiss={dismiss} 
            />
          )}
        </div>
        <div className="col-6 p-4 text-center">
          <p>Please connect to your wallet.</p>
          <button
            className="btn btn-warning"
            type="button"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

function NetworkErrorMessage({ message, dismiss }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message}
      <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
        onClick={dismiss}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}

function NoWalletDetected() {
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-6 p-4 text-center">
          <p>
            No Ethereum wallet was detected. <br />
            Please install{" "}
            <a
              href="http://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              MetaMask
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 2,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          top: "50%",
          left: "50%",
          width: "100px",
          height: "50px",
          marginLeft: "-50px",
          marginTop: " -25px",
          textAlign: "center",
        }}
      >
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
}

class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      tokenName: undefined,
      tokenSymbol: undefined,
      balance: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;

    this.mint = this.mint.bind(this)
  }

  async connectWallet() {
    const instance = await web3Modal.connect();

    if (!this._checkNetwork()) {
      return;
    }

    this.initialize(instance);

    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return this.resetState();
      }
      
      this.initialize(newAddress);
    });
    
    window.ethereum.on("chainChanged", ([networkId]) => {
      this.resetState();
    });
  }

  async initialize(instance) {
    const self = this;

    await this.initializeContract(instance);

    this.fetchData();

    this.provider.once("block", () => {
        this.contract.on('Transfer', (from, to, val, event) => {
            self.fetchData();
            alert('Congrats, you just minted a Cat with ID ' + val.toNumber())
        });
    });
  }

  async initializeContract(instance) {
    this.provider = new ethers.providers.Web3Provider(instance);

    this.setState({
      selectedAddress: await this.provider.getSigner().getAddress(),
    });

    this.contract = new ethers.Contract(
      contractAddress,
      Cats.abi,
      this.provider.getSigner()
    );
  }

  async fetchData() {
    const name = await this.contract.name();
    const symbol = await this.contract.symbol();
    const balance = await this.contract.balanceOf(this.state.selectedAddress);

    this.setState({ tokenName: name, tokenSymbol: symbol, balance });
  }

  resetState() {
    this.setState(this.initialState);
  }

  _checkNetwork() {
    const HARDHAT_NETWORK_ID = '31337';

    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }

  async mint(address) {
    let tx = await this.contract.mint(address);
    let res = await tx.wait();
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this.connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.tokenName || !this.state.balance) {
      return <Loading />;
    }

    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              Welcome to {this.state.tokenName} minting page
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.balance.toString()} {this.state.tokenSymbol}
              </b>
              .
            </p>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
              <button
                className="btn btn-warning"
                type="button"
                onClick={() => {this.mint(this.state.selectedAddress)}}
              >
                Mint
              </button>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
  document.getElementById("root")
);
