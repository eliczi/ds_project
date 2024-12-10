// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract RentalMarketplace {
    enum RentalState { Available, Rented, Completed }

    struct Item {
        uint256 id;
        address payable owner;
        string description;
        string name;
        string category;
        string location;
        uint256 rentalPrice;
        uint256 securityDeposit;
        uint256 rentalDuration;
        RentalState state;
    }

    struct RentalAgreement {
        uint256 itemId;
        address payable renter;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRentPaid; // Total rent payments made
        uint256 lastPaymentTime; // Timestamp of the last rent payment
        uint256 numberOfPaymentsMade; // Number of monthly payments made
        uint256 nextPaymentDue; // Timestamp when the next payment is duede
    }

    uint256 public itemCounter;
    mapping(uint256 => Item) public items;
    mapping(uint256 => RentalAgreement) public rentalAgreements;

    event ItemListed(uint256 indexed itemId, address owner);
    event RentalStarted(uint256 indexed itemId, address renter);
    event RentPaid(uint256 indexed itemId, address renter, uint256 amount);
    event RentalEnded(uint256 indexed itemId, address renter);
    event RentalOverdueResolved(uint256 indexed itemId, address owner);

    uint256 constant SECONDS_IN_DAY = 86400;
    uint256 constant DAYS_IN_MONTH = 30;
    uint256 constant SECONDS_IN_MONTH = SECONDS_IN_DAY * DAYS_IN_MONTH; // 2,592,000 seconds


    function listItem(string memory _description, string memory _name, string memory _category, string memory _location,uint256 _rentalPrice, uint256 _securityDeposit, uint256 _rentalDuration) public {
            require(_rentalDuration > 0, "Duration must be at least one month");
            itemCounter++;
            items[itemCounter] = Item(
                itemCounter,
                payable(msg.sender), // payable type, allowing it to receive Ether
                _description,
                _name,
                _category,
                _location,
                _rentalPrice,
                _securityDeposit,
                _rentalDuration,
                RentalState.Available
            );
            emit ItemListed(itemCounter, msg.sender);
        }
    function rentItem(uint256 _itemId) public payable { // allows the function to receive Ether
        Item storage item = items[_itemId];
        require(item.state == RentalState.Available, "Item not available");
        require(msg.value == item.securityDeposit, "Incorrect deposit amount");//amount of Wei sent with the transaction
        require(item.owner != msg.sender, "Cannot rent to itself"); // cannot rent to itself

        item.state = RentalState.Rented;
        rentalAgreements[_itemId] = RentalAgreement(
            _itemId,
            payable(msg.sender), // payable type, allowing it to receive Ether
            block.timestamp,
            //block.timestamp + item.rentalDuration
            block.timestamp + (item.rentalDuration * SECONDS_IN_MONTH),
            0,
            block.timestamp, // Initialize lastPaymentTime 
            0,
            block.timestamp + SECONDS_IN_MONTH // nextPaymentDue after first month
        );
        emit RentalStarted(_itemId, msg.sender);
    }

    function payRent(uint256 _itemId) public payable {
        Item storage item = items[_itemId];
        RentalAgreement storage agreement = rentalAgreements[_itemId];

        require(item.state == RentalState.Rented, "Item not rented");
        require(msg.sender == agreement.renter, "Not the renter");
        require(msg.value == item.rentalPrice, "Incorrect rental price");
        require(block.timestamp <= agreement.endTime, "Rental period ended");//prevents rental payments after the rental period has concluded
        uint256 expectedTotalRent = item.rentalPrice * (item.rentalDuration);//calculate expected total rent
        require(agreement.totalRentPaid < expectedTotalRent, "Cannot overpay");//prevents from overpaying


        agreement.totalRentPaid += msg.value;
        agreement.lastPaymentTime = block.timestamp;
        agreement.numberOfPaymentsMade += 1;
        agreement.nextPaymentDue += SECONDS_IN_MONTH;

        item.owner.transfer(msg.value);
        emit RentPaid(_itemId, msg.sender, msg.value);

    }   
    function endRental(uint256 _itemId) public {
        Item storage item = items[_itemId];
        RentalAgreement storage agreement = rentalAgreements[_itemId];

        require(item.state == RentalState.Rented, "Item not rented");
        require(
            msg.sender == item.owner || msg.sender == agreement.renter,
            "Not authorized"
        );
        //require(block.timestamp >= agreement.endTime, "Rental period not ended");

        uint256 expectedTotalRent = item.rentalPrice * (item.rentalDuration);//calculate expected total rent
        require(agreement.totalRentPaid >= expectedTotalRent, "Due rent has not been fully paid");

        agreement.renter.transfer(item.securityDeposit);

        item.state = RentalState.Completed;
        emit RentalEnded(_itemId, agreement.renter);
    }

    function getRentedItemsByUser(address _user) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCounter; i++) {
            if (rentalAgreements[i].renter == _user && items[i].state == RentalState.Rented) {
                count++;
            }
        }

        uint256[] memory rentedItemIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= itemCounter; i++) {
            if (rentalAgreements[i].renter == _user && items[i].state == RentalState.Rented) {
                rentedItemIds[index] = i;
                index++;
            }
        }

        return rentedItemIds;
    }

    function resolveOverdueRental(uint256 _itemId) public {
        Item storage item = items[_itemId];
        RentalAgreement storage agreement = rentalAgreements[_itemId];

        require(item.state == RentalState.Rented, "Item is not currently rented");
        require(block.timestamp > agreement.endTime, "Rental period not yet ended");

        uint256 expectedTotalRent = item.rentalPrice * item.rentalDuration;
        require(agreement.totalRentPaid < expectedTotalRent, "Rent has been fully paid");

        item.state = RentalState.Completed;

        item.owner.transfer(item.securityDeposit);

        emit RentalOverdueResolved(_itemId, item.owner);

    }
    function checkAndResolveOverdue(uint256 _itemId) public {

        RentalAgreement storage agreement = rentalAgreements[_itemId];
        Item storage item = items[_itemId];

        require(block.timestamp > agreement.nextPaymentDue, "Payment not overdue");
        require(agreement.totalRentPaid < agreement.numberOfPaymentsMade * items[_itemId].rentalPrice, "Rent fully paid");

        item.state = RentalState.Completed;
        item.owner.transfer(item.securityDeposit);
        emit RentalOverdueResolved(_itemId, item.owner);

    }

}







