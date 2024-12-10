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
      listItemForm: {
        description: "",
        name: "",
        category: "",
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
      myRentedOutItemsDetails: [],
      currentPage: 1,
      priceSortOrder: "asc",
      locationFilter: "",
      categoryFilter: "",
      categories: []
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

    const { balance, selectedAddress, myAvailableItemsDetails, currentPage, priceSortOrder, locationFilter, categoryFilter, categories } = this.state;


    const filteredItems = myAvailableItemsDetails.filter(item => {
      const matchesLocation = item.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
      return matchesLocation && matchesCategory;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
      const priceA = parseFloat(a.rentalPrice);
      const priceB = parseFloat(b.rentalPrice);
      return priceSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    const totalAvailableItems = sortedItems.length;
    const startIndex = (currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    const itemsToDisplay = sortedItems.slice(startIndex, endIndex);

    return (
      <div className="bg-light" style={{ minHeight: '100vh' }}>
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
          <div className="row">
            <div className="col-12">
              <h1 className="mb-3">Welcome to the Rental Marketplace</h1>
              <p className="text-muted">
                Connected as: <b>{selectedAddress}</b><br />
                Current Balance: <b>{balance} ETH</b>
              </p>
              <hr />
            </div>
          </div>

          <div className="row mt-4">

            <div className="col-md-3">
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
                      <label>Category</label>
                      <input
                        className="form-control"
                        type="text"
                        value={this.state.listItemForm.category}
                        onChange={(e) => this._updateListItemForm('category', e.target.value)}
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

            <div className="col-md-9">
              <div className="row">
                <div className="col-md-12">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h2 className="card-title mb-3">My Rented Items</h2>
                      <button className="btn btn-secondary mb-3" onClick={this._getMyRentedItems}>
                        Show My Rented Items
                      </button>
                      {this.state.myRentedItemsDetails.length > 0 ? (
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table className="table table-sm table-striped w-100"> 
                            <thead>
                              <tr>
                                <th>Item ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Rent (ETH)</th>
                                <th>Deposit (ETH)</th>
                                <th>Duration</th>
                                <th>Total Due Rent</th>
                                <th>Next Payment Deadline</th>
                                <th>State</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.myRentedItemsDetails.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.id}</td>
                                  <td>{item.name}</td>
                                  <td>{item.category}</td>
                                  <td>{item.description}</td>
                                  <td>{item.location}</td>
                                  <td>{item.rentalPrice}</td>
                                  <td>{item.securityDeposit}</td>
                                  <td>{item.rentalDuration}</td>
                                  <td>{item.dueRent}</td>
                                  <td>{item.nextPaymentDate}</td>
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

                <div className="col-md-12">
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <h2 className="card-title mb-3">My Rented-Out Items</h2>
                      <button className="btn btn-secondary mb-3" onClick={this._getMyRentedOutItems.bind(this)}>
                        Show My Rented-Out Items
                      </button>
                      {this.state.myRentedOutItemsDetails && this.state.myRentedOutItemsDetails.length > 0 ? (
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table className="table table-sm table-striped w-100"> 
                            <thead>
                              <tr>
                                <th>Item ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Location</th>
                                <th>Rent (ETH)</th>
                                <th>Deposit (ETH)</th>
                                <th>Duration (months)</th>
                                <th>State</th>
                                <th>Actions</th> 
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.myRentedOutItemsDetails.map((item) => {
                                const { rentalAgreement } = item;
                                const currentTime = Math.floor(Date.now() / 1000);
                                const expectedRentUpToNow = rentalAgreement.numberOfPaymentsMade * parseFloat(item.rentalPrice);
                                const isOverdue = currentTime > rentalAgreement.nextPaymentDue &&
                                  rentalAgreement.totalRentPaid < expectedRentUpToNow;

                                return (
                                  <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.description}</td>
                                    <td>{item.location}</td>
                                    <td>{item.rentalPrice}</td>
                                    <td>{item.securityDeposit}</td>
                                    <td>{item.rentalDuration}</td>
                                    <td>{item.state}</td>
                                    <td>
                                      <button
                                        className={`btn btn-sm ${isOverdue ? 'btn-danger' : 'btn-secondary'}`}
                                        onClick={() => {
                                          if (isOverdue) {
                                            this._resolveOverdueRental(item.id);
                                          }
                                        }}
                                        disabled={!isOverdue || this.state.txBeingSent === item.id}
                                        title={isOverdue ? "Click to resolve overdue rental" : "Rent is up to date"}
                                      >
                                        {this.state.txBeingSent === item.id
                                          ? "Resolving..."
                                          : isOverdue ? "Resolve Overdue" : "Up to Date"
                                        }
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No items currently rented out.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="card-title mb-3">Available Items for Rent</h2>

                  <div className="d-flex mb-3">
                    <div className="btn-group" role="group" aria-label="Sort by price">
                      <button
                        type="button"
                        className={`btn btn-outline-secondary ${this.state.priceSortOrder === 'asc' ? 'active' : ''}`}
                        onClick={() => this._setPriceSortOrder('asc')}
                      >
                        Price: Low to High
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-secondary ${this.state.priceSortOrder === 'desc' ? 'active' : ''}`}
                        onClick={() => this._setPriceSortOrder('desc')}
                      >
                        Price: High to Low
                      </button>
                    </div>
                    <div className="input-group" style={{ maxWidth: "300px" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Filter by location"
                        value={this.state.locationFilter}
                        onChange={(e) => this.setState({ locationFilter: e.target.value })}
                      />
                    </div>
                    <div className="input-group" style={{ maxWidth: "200px" }}>
                      <select
                        className="form-control"
                        value={this.state.categoryFilter}
                        onChange={(e) => this.setState({ categoryFilter: e.target.value })}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                              <th>Category</th>
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
                                <td>{item.category}</td>
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


  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this._checkNetwork();
    this._initialize(selectedAddress);

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

    await this._getAvailableItems();
    await this._fetchUniqueCategories();

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
    const chainIdHex = `0x${parseInt(HARDHAT_NETWORK_ID, 10).toString(16)}`;
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

  _updateListItemForm(field, value) {
    this.setState((prevState) => ({
      listItemForm: {
        ...prevState.listItemForm,
        [field]: value
      }
    }));
  }

  _handleListItem = async (event) => {
    event.preventDefault();
    const { description, name, category, location, rentalPrice, securityDeposit, rentalDuration } = this.state.listItemForm;

    const rentalPriceWei = ethers.utils.parseEther(rentalPrice);
    const securityDepositWei = ethers.utils.parseEther(securityDeposit);

    const tx = await this._rentalMarketplace.listItem(
      description,
      name,
      category,
      location,
      rentalPriceWei,
      securityDepositWei,
      rentalDuration
    );
    await tx.wait();
    alert("Item listed successfully!");
    await this._fetchUniqueCategories();

  }

  _handleRentItem = async (event) => {
    event.preventDefault();
    const itemId = this.state.rentItemId;
    if (!itemId) return;

    const itemData = await this._rentalMarketplace.items(itemId);
    const securityDepositWei = itemData.securityDeposit;

    const tx = await this._rentalMarketplace.rentItem(itemId, { value: securityDepositWei });
    await tx.wait();
    alert("Item rented successfully!");
  }

  _handlePayRent = async (event) => {
    event.preventDefault();
    const itemId = this.state.payRentItemId;
    const rentAmount = this.state.rentAmount;
    if (!itemId || !rentAmount) return;

    const rentAmountWei = ethers.utils.parseEther(rentAmount);
    const tx = await this._rentalMarketplace.payRent(itemId, { value: rentAmountWei });
    await tx.wait();
    alert("Rent paid successfully!");
    await this._getMyRentedItems();
  }

  _handleEndRental = async (event) => {
    event.preventDefault();
    const itemId = this.state.endRentalItemId;
    if (!itemId) return;

    const tx = await this._rentalMarketplace.endRental(itemId);
    await tx.wait();
    alert("Rental ended successfully!");
  }

  _getMyRentedItems = async () => {
    const rentedItemIds = await this._rentalMarketplace.getRentedItemsByUser(this.state.selectedAddress);

    const myRentedItemsDetails = [];
    for (let i = 0; i < rentedItemIds.length; i++) {
      const itemId = rentedItemIds[i].toNumber();
      const itemData = await this._rentalMarketplace.items(itemId);
      const agreementData = await this._rentalMarketplace.rentalAgreements(itemId);

      const monthsPaid = agreementData.totalRentPaid.div(itemData.rentalPrice).toNumber();

      const SECONDS_IN_MONTH = 30 * 24 * 60 * 60;
      const nextPaymentTimestamp = agreementData.startTime.add((monthsPaid + 1) * SECONDS_IN_MONTH);
      const nextPaymentDate = new Date(nextPaymentTimestamp.toNumber() * 1000).toLocaleString();

      const rentalPrice = itemData.rentalPrice;
      const rentalDuration = itemData.rentalDuration;
      const totalRent = rentalPrice.mul(rentalDuration);
      const dueRentWei = totalRent.sub(agreementData.totalRentPaid);

      myRentedItemsDetails.push({
        id: itemData.id.toString(),
        owner: itemData.owner,
        description: itemData.description,
        name: itemData.name,
        category: itemData.category,
        location: itemData.location,
        rentalPrice: ethers.utils.formatEther(itemData.rentalPrice),
        securityDeposit: ethers.utils.formatEther(itemData.securityDeposit),
        rentalDuration: itemData.rentalDuration.toString(),
        state: ["Available", "Rented", "Completed"][itemData.state],
        dueRent: ethers.utils.formatEther(dueRentWei),
        nextPaymentDate
      });
    }

    this.setState({ myRentedItemsDetails });
  }

  async _getAvailableItems() {
    const itemCounter = (await this._rentalMarketplace.itemCounter()).toNumber();

    const availableItems = [];
    for (let i = 1; i <= itemCounter; i++) {
      const itemData = await this._rentalMarketplace.items(i);
      if (itemData.state === 0) {
        availableItems.push({
          id: itemData.id.toString(),
          owner: itemData.owner,
          description: itemData.description,
          name: itemData.name,
          category: itemData.category,
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

  async _getMyRentedOutItems() {
    const itemCounter = (await this._rentalMarketplace.itemCounter()).toNumber();
    const myRentedOutItemsDetails = [];

    for (let i = 1; i <= itemCounter; i++) {
      const itemData = await this._rentalMarketplace.items(i);
      if (itemData.owner.toLowerCase() === this.state.selectedAddress.toLowerCase() && itemData.state === 1) {
        const agreementData = await this._rentalMarketplace.rentalAgreements(i);
        myRentedOutItemsDetails.push({
          id: itemData.id.toString(),
          owner: itemData.owner,
          description: itemData.description,
          name: itemData.name,
          category: itemData.category,
          location: itemData.location,
          rentalPrice: ethers.utils.formatEther(itemData.rentalPrice),
          securityDeposit: ethers.utils.formatEther(itemData.securityDeposit),
          rentalDuration: itemData.rentalDuration.toString(),
          state: "Rented",
          rentalAgreement: {
            nextPaymentDue: agreementData.nextPaymentDue.toNumber(),
            totalRentPaid: parseFloat(ethers.utils.formatEther(agreementData.totalRentPaid)),
            numberOfPaymentsMade: agreementData.numberOfPaymentsMade.toNumber()
          }

        });
      }
    }

    this.setState({ myRentedOutItemsDetails });
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

  _setPriceSortOrder = (order) => {
    this.setState({ priceSortOrder: order });
  };

  async _fetchUniqueCategories() {
  
    const itemCounter = (await this._rentalMarketplace.itemCounter()).toNumber();
    const categoriesSet = new Set();

    for (let i = 1; i <= itemCounter; i++) {
      const item = await this._rentalMarketplace.items(i);
      if (item.category) { 
        categoriesSet.add(item.category);
      }
    }

    const uniqueCategories = Array.from(categoriesSet);
    this.setState({ categories: uniqueCategories });
   
  }
  _resolveOverdueRental = async (itemId) => {
  
    this.setState({ txBeingSent: itemId });
    const tx = await this._rentalMarketplace.checkAndResolveOverdue(itemId);
    await tx.wait();
    alert("Overdue rental resolved!");
    this.setState({ txBeingSent: undefined });
    await this._getMyRentedOutItems();
  
  }

}