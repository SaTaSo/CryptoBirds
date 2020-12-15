import React, { Component } from "react";
import CryptoBirds from "./contracts/CryptoBirds.json";
import getWeb3 from "./getWeb3";
import { Table, Button, ToggleButton, Form, InputGroup, FormControl } from 'react-bootstrap';


import "./App.css";

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageValue: 0, web3: null, accounts: null,
      contract: null, birds: [], message: null, currentUserBirdIds: [],
      firstParent: null, secondParent: null, priceToSell: 0
    };
    this.loadBirds = this.loadBirds.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toSell = this.toSell.bind(this);
  }
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = CryptoBirds.networks[networkId];
      const instance = new web3.eth.Contract(
        CryptoBirds.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.loadBirds);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  loadBirds = async () => {
    var initialbirdsList = [];
    for (var i = 1; i <= 50; i++) {
      let bird = await this.state.contract.methods.birds(i).call();
      bird.id = i;
      if (bird.gene > 0)
        initialbirdsList.push(bird)
    }
    // console.log(initialbirdsList);
    this.setState({ birds: initialbirdsList });
    this.loadCurrentUserBirds();
  }

  loadCurrentUserBirds = async () => {
    const { birds, accounts, web3, contract } = this.state;
    let birdsCount = await contract.methods.balanceOf(accounts[0]).call();
    console.log(birdsCount);
    var userBirdsId = [];
    for (var i = 0; i < birdsCount; i++) {
      let birdId = await contract.methods.tokenOfOwnerByIndex(accounts[0], i).call();
      console.log(birdId + " Birddddd ID User");
      userBirdsId.push(birdId - 1);
    }
    this.setState({ currentUserBirdIds: userBirdsId });
  }

  buyBird = async (bird) => {
    const { contract, accounts, web3 } = this.state;
    let newMessage = "Buying Bird number: " + bird.id + " for  " + bird.price + " wei.";
    this.setState({ message: newMessage });
    console.log(newMessage);
    await contract.methods.buy(bird.id).send({
      from: accounts[0],
      value: bird.price
    });
    newMessage = "The Bird number " + bird.id + "is now bought for  " + bird.price + " wei.";
    this.setState({ message: newMessage });
    console.log(newMessage);
    this.loadBirds();
  }
  setParents = async (id) => {
    console.log(id);
    const { firstParent, secondParent } = this.state;
    if (firstParent == null) {
      this.setState({ firstParent: id });
      console.log(firstParent);
    }
    else if (secondParent == null) {
      this.setState({ secondParent: id });
      console.log(secondParent);
    }
  }

  breedBirds = async () => {
    console.log("breed");
    const { accounts, contract, message, firstParent, secondParent } = this.state;
    if (firstParent == null || secondParent == null) {
      let newMessage = "You should select two birds to breed!";
      this.setState({ message: newMessage });
      console.log(newMessage);
    }
    console.log(firstParent);
    let child = await contract.methods.breed(firstParent, secondParent).send({
      from: accounts[0]
    });
    console.log(child);

    this.loadBirds();
  }

  handleInputChange(event) {
    const target = event.target;

    const value = target.value;
    const name = target.name;
    console.log(name);
    this.setState({
      [name]: value
    });
  }

  toSell = async (event) => {
    event.preventDefault();
    console.log("Ready to sell...");
    const { web3, contract, accounts } = this.state;
    console.log(event.target.id + "********************");
    console.log(this.state.priceToSell + "********************");
    await contract.methods.setForSale(event.target.id, web3.utils.toWei
      (this.state.priceToSell, 'ether')).send({ from: accounts[0] });
    this.setState({ priceToSell: '' });
    this.loadBirds();
  }

  stopContratc = async () => {
    const { accounts,contract } = this.state;
    console.log("Stop Contract has been called!");

    await contract.methods.stop().send({
      from: accounts[0]
    });
  }
  startContratc = async () => {
    const { accounts,contract } = this.state;
    console.log("Start Contract has been called!");

    await contract.methods.start().send({
      from: accounts[0]
    });
  }
  redeem = async () => {
    const { accounts,contract } = this.state;
    console.log("Redeem All Balance!");

    await contract.methods.redeemAllBalance(accounts[0]).send({
      from: accounts[0]
    });
  }
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (

      <div className="App">

        <h1>Crypto Birds</h1>
        <div ><Button  className="header" variant="danger" onClick={this.stopContratc.bind()}>Stop Contract
                          </Button>
          <Button className="header" variant="success" onClick={this.startContratc.bind()}>Start Contract
                          </Button>
          <Button className="header" variant="primary" onClick={this.redeem.bind()}>Redeem All Balance
                          </Button></div>
                          <br></br>
        <p>Account: {this.state.accounts[0]}</p>

        <p>{this.state.message}</p>
        <Table>
          <tbody>
            <tr>
              <td>
                <div className="container">
                  <Table variant="dark">
                    <tbody>
                      <tr>
                        <td><strong>Gene</strong></td>
                        <td><strong>Birth</strong></td>
                        <td><strong>Generation</strong></td>
                        <td><strong>Price</strong></td>
                        <td><strong>Actions</strong></td>
                        <td></td>
                      </tr>
                      {this.state.birds.map((bird) => {

                        return [

                          <tr key={bird.id}>
                            <td>{bird.gene}</td>
                            <td>{bird.birth}</td>
                            <td>{bird.generation}</td>
                            <td>{this.state.web3.utils.fromWei(bird.price, 'ether')}</td>
                            <td><Button disabled={(bird.price <= 0 ? true : false)}
                              onClick={this.buyBird.bind(this, bird)}>Buy
                          </Button></td>
                          </tr>
                        ];
                      })}
                    </tbody>
                  </Table>
                </div>
              </td>
              <td >
                {/*  */}
                <div className="container">
                <div className="box1">My Birds</div>
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td><strong><Button onClick={this.breedBirds.bind(this)}>Breed
                          </Button></strong></td>
                        <td><strong>Gene</strong></td>
                        <td><strong>Birth</strong></td>
                        <td><strong>Generation</strong></td>
                        <td><strong>Price</strong></td>
                        <td><strong>Actions</strong></td>
                        <td></td>
                      </tr>
                      {this.state.currentUserBirdIds.map((b) => {
                        var bird = this.state.birds[b];
                        return [
                          <tr key={bird.id}>
                            <Form.Check className="breedCell"
                              type='checkbox'
                              key={bird.id}
                              onChange={this.setParents.bind(this, bird.id)}
                            />

                            <td>{bird.gene}</td>
                            <td>{bird.birth}</td>
                            <td>{bird.generation}</td>
                            <td>{this.state.web3.utils.fromWei(bird.price, 'ether')}</td>
                            <td>
                              <InputGroup className="mb-3" >
                                <FormControl onChange={this.handleInputChange}
                                  placeholder="Price to Sell (ether)"
                                  name="priceToSell"
                                  disabled={bird.price > 0}
                                />
                                <InputGroup.Append>
                                  <Button variant="success" id={bird.id} type="submit"
                                    onClick={this.toSell} disabled={bird.price > 0}>Set for Sale</Button>
                                </InputGroup.Append>
                              </InputGroup>
                            </td>
                          </tr>
                        ];
                      })}
                    </tbody>
                  </Table>
                </div>

              </td>
            </tr>
          </tbody>
        </Table>


      </div>
    );


  }
}

export default App;
