import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { ethers } from 'ethers';

import Cats from './Cats.json';

const CATS_NFT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const HARDHAT_NETWORK_ID = '31337';

const App = (props) => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [tokenName, setTokenName] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState(null);

  const checkNetwork = () => {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    setMsg('Please connect Metamask to Localhost:8545');

    return false;
  }

  const initialize = () => {
    const _provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(_provider);
    setContract(new ethers.Contract(
      CATS_NFT,
      Cats.abi,
      _provider.getSigner(0)
    ))
  }

  const fetchData = useCallback(async () => {
    if(!contract) return
    try {
      const name = await contract.name();
      const balance = await contract.balanceOf(address);

      setTokenName(name);
      setBalance(balance);
    } catch (e) {
      setMsg('Something went wrong, are you sure you deployed a contract?')
    }
  }, [address, contract])

  useEffect(() => {
    fetchData();
  }, [fetchData])

  const resetState = () => {
    setAddress(null)
    setTokenName(null)
    setBalance(0)
    setMsg(null)
  }

  const mint = async () => {
    let receipt;
    try {
      const tx = await contract.mint();
      receipt = await tx.wait();
    } catch (e) {
      const error = e.reason || e.message;
      setMsg(`Error: ${error}`)
      return;
    }

    fetchData();

    receipt.events.forEach((e) => {
      if(e.event === 'Transfer'){
        setMsg(`You just minted a ${tokenName} #${e.args.tokenId}`)
        return;
      }
    });
  }

  const connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    setAddress(selectedAddress);

    if (!checkNetwork()) {
      return;
    }

    initialize();

    window.ethereum.on('accountsChanged', ([newAddress]) => {
      setAddress(newAddress);
      if (newAddress === undefined) {
        return resetState();
      }
      initialize();
    });
    
    window.ethereum.on('chainChanged', ([networkId]) => {
      resetState();
    });
  }

  if (window.ethereum === undefined) {
      return (
        <div>
          No Ethereum wallet was detected. <br />
          Please install{" "}
          <a href="http://metamask.io">
            MetaMask
          </a>
        </div>
      )
    }

  if (!address) {
    return (
      <div>
        {msg && (
          <div>{msg}</div>
        )}
        <div>
          <p>Please connect to your wallet.</p>
          <button type="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!tokenName || !balance) {
    return (
      <>
        {msg ? (
          <div>{msg}</div>
        ) : (
          <div>Loading...</div>
        )}
      </>
    );
  }

  return (
    <div>
      <div>
        <h1>
          Welcome to {tokenName} minting page
        </h1>
        {msg && (
          <div>{msg}</div>
        )}
        <p>
          Welcome <b>{address}</b>, you have{" "}
          <b>
            {balance.toString()} {tokenName}
          </b>
        </p>
      </div>

      <hr />

      <div>
        <button type="button"
          onClick={mint}
        >
          Mint
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
