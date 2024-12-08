import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import RentalMarketplaceArtifact from "../contracts/RentalMarketplace.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Transfer } from "./Transfer";

// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '1337';


// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Transfers currencies by sending transactions
//   4. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      // Crowdfunding data
     // Example states for interacting with RentalMarketplace
      itemIdToView: "",  
      viewedItem: null,
      listItemForm: {
        description: "",
        name: "",
        location: "",
        rentalPrice: "",
        securityDeposit: "",
        rentalDuration: ""
      },
      rentItemId: "",
      payRentItemId: "",
      endRentalItemId: "",
      rentAmount: "", // for paying rent
      myRentedItems: [],
      myRentedItemsDetails: [],
      myAvailableItemsDetails: [],
      currentPage: 1 
    };

   this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }
  
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }
  
    const { balance, selectedAddress, myAvailableItemsDetails, currentPage } = this.state;
    const totalAvailableItems = myAvailableItemsDetails.length;
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    const itemsToDisplay = myAvailableItemsDetails.slice(startIndex, endIndex);
  
    return (
      <div className="bg-light" style={{ minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <a className="navbar-brand" href="#">Rental Marketplace</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" 
                  data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" 
                  aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
  
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto">
              {selectedAddress && (
                <li className="nav-item text-white">
                  <span className="nav-link">
                    {selectedAddress.substring(0, 6)}...
                    {selectedAddress.substring(selectedAddress.length - 4)}
                    &nbsp;| {balance} ETH
                  </span>
                </li>
              )}
            </ul>
          </div>
        </nav>
  
        <div className="container py-4">
          {/* Header */}
          <div className="row">
            <div className="col-12">
              <h1 className="mb-3">Welcome to the Rental Marketplace</h1>
              <p className="text-muted">
                Connected as: <b>{selectedAddress}</b><br/>
                Current Balance: <b>{balance} ETH</b>
              </p>
              <hr/>
            </div>
          </div>
  
          {/* List an Item Section */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">List a New Item</h2>
                  <form onSubmit={this._handleListItem}>
                    <div className="form-group">
                      <label>Description</label>
                      <input 
                        className="form-control" 
                        type="text"
                        value={this.state.listItemForm.description}
                        onChange={(e) => this._updateListItemForm('description', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Name</label>
                      <input 
                        className="form-control" 
                        type="text"
                        value={this.state.listItemForm.name}
                        onChange={(e) => this._updateListItemForm('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input 
                        className="form-control" 
                        type="text"
                        value={this.state.listItemForm.location}
                        onChange={(e) => this._updateListItemForm('location', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Rental Price (ETH)</label>
                      <input 
                        className="form-control" 
                        type="number"
                        step="0.01"
                        value={this.state.listItemForm.rentalPrice}
                        onChange={(e) => this._updateListItemForm('rentalPrice', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Security Deposit (ETH)</label>
                      <input 
                        className="form-control" 
                        type="number"
                        step="0.01"
                        value={this.state.listItemForm.securityDeposit}
                        onChange={(e) => this._updateListItemForm('securityDeposit', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Rental Duration (months)</label>
                      <input 
                        className="form-control" 
                        type="number"
                        step="1"
                        value={this.state.listItemForm.rentalDuration}
                        onChange={(e) => this._updateListItemForm('rentalDuration', e.target.value)}
                        required 
                      />
                    </div>
                    <button className="btn btn-primary" type="submit">List Item</button>
                  </form>
                </div>
              </div>
            </div>
  
            {/* My Rented Items Section */}
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">My Rented Items</h2>
                  <button className="btn btn-secondary mb-3" onClick={this._getMyRentedItems}>
                    Show My Rented Items
                  </button>
                  {this.state.myRentedItemsDetails.length > 0 ? (
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Item ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Rent (ETH)</th>
                            <th>Deposit (ETH)</th>
                            <th>Duration</th>
                            <th>Due Rent</th>
                            <th>State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.myRentedItemsDetails.map((item) => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td>{item.name}</td>
                              <td>{item.description}</td>
                              <td>{item.location}</td>
                              <td>{item.rentalPrice}</td>
                              <td>{item.securityDeposit}</td>
                              <td>{item.rentalDuration}</td>
                              <td>{item.dueRent}</td>
                              <td>{item.state}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No rented items currently.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Available Items Section */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">Available Items for Rent</h2>
                  {totalAvailableItems === 0 ? (
                    <p className="text-muted">No available items currently.</p>
                  ) : (
                    <div>
                      <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover table-striped">
                          <thead className="thead-dark">
                            <tr>
                              <th>Item ID</th>
                              <th>Name</th>
                              <th>Description</th>
                              <th>Location</th>
                              <th>Rent (ETH)</th>
                              <th>Deposit (ETH)</th>
                              <th>Duration (months)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsToDisplay.map((item) => (
                              <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>{item.location}</td>
                                <td>{item.rentalPrice}</td>
                                <td>{item.securityDeposit}</td>
                                <td>{item.rentalDuration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
  
                      {/* Pagination Controls */}
                      <div className="d-flex justify-content-between mt-3">
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={this._previousPage} 
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={this._nextPage} 
                          disabled={currentPage * 5 >= totalAvailableItems}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
  
          {/* Rent and Pay Rent Forms */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">Rent an Item</h2>
                  <form onSubmit={this._handleRentItem}>
                    <div className="form-group">
                      <label>Item ID</label>
                      <input 
                        className="form-control" 
                        type="number"
                        value={this.state.rentItemId}
                        onChange={(e) => this.setState({ rentItemId: e.target.value })}
                        required 
                      />
                    </div>
                    <button className="btn btn-primary" type="submit">Rent Item</button>
                  </form>
                </div>
              </div>
            </div>
  
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">Pay Rent</h2>
                  <form onSubmit={this._handlePayRent}>
                    <div className="form-group">
                      <label>Item ID</label>
                      <input 
                        className="form-control" 
                        type="number" 
                        value={this.state.payRentItemId}
                        onChange={(e) => this.setState({ payRentItemId: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Rent Amount (ETH)</label>
                      <input 
                        className="form-control" 
                        type="number"
                        step="0.01"
                        value={this.state.rentAmount}
                        onChange={(e) => this.setState({ rentAmount: e.target.value })}
                        required
                      />
                    </div>
                    <button className="btn btn-primary" type="submit">Pay Rent</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
  
          {/* End Rental Section */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">End Rental</h2>
                  <form onSubmit={this._handleEndRental}>
                    <div className="form-group">
                      <label>Item ID</label>
                      <input 
                        className="form-control" 
                        type="number" 
                        value={this.state.endRentalItemId}
                        onChange={(e) => this.setState({ endRentalItemId: e.target.value })}
                        required 
                      />
                    </div>
                    <button className="btn btn-danger" type="submit">End Rental</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  // componentWillUnmount() {
  //   // We poll the crowdfund data, so we have to stop doing that when Dapp
  //   // gets unmounted
  //   this._stopPollingData();
  // }

  componentWillUnmount() {
    // If you set up any polling or intervals, clear them here
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this._checkNetwork();
    this._initialize(selectedAddress);

    // Reloads the Dapp if user changes account
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        return this._resetState();
      }
      this._initialize(newAddress);
    });
  }

  async _initialize(userAddress) {
    this.setState({ selectedAddress: userAddress });
    this._initializeEthers();
    //balance
    const balanceWei = await window.ethereum.request({ 
      method: 'eth_getBalance', 
      params: [userAddress, 'latest']
    });
    const balance = ethers.utils.formatEther(balanceWei);
    this.setState({ balance });
    
    // Fetch available items
    await this._getAvailableItems();

  
  }

  async _initializeEthers() {
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
    this._rentalMarketplace = new ethers.Contract(
      contractAddress.RentalMarketplace, 
      RentalMarketplaceArtifact.abi, 
      this._provider.getSigner(0)
    );
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _resetState() {
    this.setState(this.initialState);
  }

  async _switchChain() {
    const chainIdHex = `0x${parseInt(HARDHAT_NETWORK_ID,10).toString(16)}`;
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await this._initialize(this.state.selectedAddress);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      this._switchChain();
    }
  }

  // Handle form inputs for listing items
  _updateListItemForm(field, value) {
    this.setState((prevState) => ({
      listItemForm: {
        ...prevState.listItemForm,
        [field]: value
      }
    }));
  }

  // Submit handler for listing an item
  _handleListItem = async (event) => {
    event.preventDefault();
    const { description, name, location, rentalPrice, securityDeposit, rentalDuration } = this.state.listItemForm;

    // Convert values to wei
    const rentalPriceWei = ethers.utils.parseEther(rentalPrice);
    const securityDepositWei = ethers.utils.parseEther(securityDeposit);

    const tx = await this._rentalMarketplace.listItem(
      description, 
      name, 
      location, 
      rentalPriceWei, 
      securityDepositWei, 
      rentalDuration
    );
    await tx.wait();
    alert("Item listed successfully!");
  }

  // Submit handler for viewing an item
  _handleViewItem = async (event) => {
    event.preventDefault();
    const itemId = this.state.itemIdToView;
    if(!itemId) return;

    const itemData = await this._rentalMarketplace.items(itemId);
    // itemData is a tuple: (id, owner, description, name, location, rentalPrice, securityDeposit, rentalDuration, state)
    const viewedItem = {
      id: itemData.id,
      owner: itemData.owner,
      description: itemData.description,
      name: itemData.name,
      location: itemData.location,
      rentalPrice: itemData.rentalPrice,
      securityDeposit: itemData.securityDeposit,
      rentalDuration: itemData.rentalDuration,
      state: itemData.state
    };
    this.setState({ viewedItem });
  }

  // Submit handler for renting an item
  _handleRentItem = async (event) => {
    event.preventDefault();
    const itemId = this.state.rentItemId;
    if(!itemId) return;

    // We must pay the security deposit to rent
    // First, fetch the item to know the deposit
    const itemData = await this._rentalMarketplace.items(itemId);
    const securityDepositWei = itemData.securityDeposit;

    const tx = await this._rentalMarketplace.rentItem(itemId, { value: securityDepositWei });
    await tx.wait();
    alert("Item rented successfully!");
  }

  // Submit handler for paying rent
  _handlePayRent = async (event) => {
    event.preventDefault();
    const itemId = this.state.payRentItemId;
    const rentAmount = this.state.rentAmount;
    if(!itemId || !rentAmount) return;

    const rentAmountWei = ethers.utils.parseEther(rentAmount);
    const tx = await this._rentalMarketplace.payRent(itemId, { value: rentAmountWei });
    await tx.wait();
    alert("Rent paid successfully!");
  }

  // Submit handler for ending a rental
  _handleEndRental = async (event) => {
    event.preventDefault();
    const itemId = this.state.endRentalItemId;
    if(!itemId) return;

    const tx = await this._rentalMarketplace.endRental(itemId);
    await tx.wait();
    alert("Rental ended successfully!");
  }

  _getMyRentedItems = async () => {
    // Call the contract to get the array of rented item IDs
    const rentedItemIds = await this._rentalMarketplace.getRentedItemsByUser(this.state.selectedAddress);
    
    // Fetch details for each item
    const myRentedItemsDetails = [];
    for (let i = 0; i < rentedItemIds.length; i++) {
      const itemId = rentedItemIds[i].toNumber();
      const itemData = await this._rentalMarketplace.items(itemId);
      const agreementData = await this._rentalMarketplace.rentalAgreements(itemId);

      const rentalPrice = itemData.rentalPrice;
      const rentalDuration = itemData.rentalDuration;
      const totalRent = rentalPrice.mul(rentalDuration);
      const dueRentWei = totalRent.sub(agreementData.totalRentPaid);

      myRentedItemsDetails.push({
        id: itemData.id.toString(),
        owner: itemData.owner,
        description: itemData.description,
        name: itemData.name,
        location: itemData.location,
        rentalPrice: ethers.utils.formatEther(itemData.rentalPrice),
        securityDeposit: ethers.utils.formatEther(itemData.securityDeposit),
        rentalDuration: itemData.rentalDuration.toString(),
        state: ["Available","Rented","Completed"][itemData.state],
        dueRent: ethers.utils.formatEther(dueRentWei)
      });
    }
  
    this.setState({ myRentedItemsDetails });
  }

  async _getAvailableItems() {
    // Get the highest item ID (itemCounter).
    const itemCounter = (await this._rentalMarketplace.itemCounter()).toNumber();
    
    const availableItems = [];
    for (let i = 1; i <= itemCounter; i++) {
      const itemData = await this._rentalMarketplace.items(i);
      // itemData.state: 0 = Available, 1 = Rented, 2 = Completed
      if (itemData.state === 0) {
        // Format data for easy display
        availableItems.push({
          id: itemData.id.toString(),
          owner: itemData.owner,
          description: itemData.description,
          name: itemData.name,
          location: itemData.location,
          rentalPrice: ethers.utils.formatEther(itemData.rentalPrice),
          securityDeposit: ethers.utils.formatEther(itemData.securityDeposit),
          rentalDuration: itemData.rentalDuration.toString(),
          state: "Available"
        });
      }
    }
  
    this.setState({ myAvailableItemsDetails: availableItems });
  }
  _nextPage = () => {
    const { currentPage, myAvailableItemsDetails } = this.state;
    const totalPages = Math.ceil(myAvailableItemsDetails.length / 5);
    if (currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };
  
  _previousPage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    }
  };
  

  
}