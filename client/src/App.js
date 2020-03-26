import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs';

import "./App.css";


class App extends Component {

  constructor(props){
    super(props);

    this.state={
       web3: null,
        accounts: null,
         contract: null,
         buffer:null,
         ipfsHash:null
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  //state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      console.log("web3...",web3);
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log("net Id",networkId);
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      console.log(SimpleStorageContract);
      console.log("network",deployedNetwork);
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set("hasjdfhkjsd").send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const ipfsHash = await contract.methods.get().call();
    console.log("hash",ipfsHash)

    // Update state with the result.
    this.setState({ ipfsHash});
  };

  captureFile(event){
    console.log("capture file.....");
    event.preventDefault();
    const file = event.target.files[0]
    const reader =  new window.FileReader()
    reader.readAsArrayBuffer(file);
    reader.onloadend = () =>{
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer',this.state.buffer);
    } 
  }

  onSubmit(event){
    event.preventDefault();
    console.log("submit file......");
    const { accounts, contract } = this.state;
    ipfs.files.add(this.state.buffer,async (error,result) => {
      if(error){
        console.log(error);
        return;
      }
      let transaction = await contract.methods.set(result[0].hash).send({ from: accounts[0] });
      console.log(transaction);
      let hash = await contract.methods.get().call();
      console.log( hash);
      this.setState({ipfsHash:result[0].hash});
      console.log('ipfsHash',this.state.ipfsHash);

    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Your image</h1>
        <p>This image is stored on ipfs and ethereum blockchain.</p>
        <h2>Smart Contract Example</h2>

        <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""></img>
        <h2>upload image</h2>
        <form onSubmit={this.onSubmit} >
      <input type="file" onChange={this.captureFile}></input>
      <input type="submit" ></input>

        </form>
       
      </div>
    );
  }
}

export default App;
