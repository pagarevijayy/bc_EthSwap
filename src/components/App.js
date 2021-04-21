import React, { Component } from 'react';
import Web3 from 'web3';

import EthSwap from '../abis/EthSwap.json';
import Token from '../abis/Token.json';

import Navbar from './Navbar'
import Main from './Main'

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      ethBalance: '0',
      tokenBalance: '0',
      token: {},
      ethSwap: {},
      loading: true
    };
  }


  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    let ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    const networkId = await web3.eth.net.getId();

    // load token contract
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({ token });

      let tokenBalance = await token.methods.balanceOf(this.state.account).call();
      this.setState({ tokenBalance: tokenBalance.toString() });

    } else {
      window.alert('Token contract not deployed to the detected network')
    }

    // load EthSwap contract
    const ethSwapData = EthSwap.networks[networkId];

    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap });

    } else {
      window.alert('EthSwap contract not deployed to the detected network')
    }

    this.setState({ loading: false })
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.refreshTokensState();
    });
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.refreshTokensState();
      })
    })
  }

  refreshTokensState(){
    // blocking some time for txn to settle down - bad ux! (ideal: instead of reloading, fetch tokens and update the state)
    setTimeout(async () => { window.location.reload()}, 1500);
  }

  render() {
    let content;
    if (this.state.loading) {
      content = <p id="loader" className="text-center p-5">Loading...</p>;
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />;
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
