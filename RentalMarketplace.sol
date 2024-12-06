// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract RentalMarketplace {
    enum RentalState { Available, Rented, Completed }

    struct Item {
        uint256 id;
        address payable owner;
        string description;
        string name;
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
        uint256 totalRentPaid; // variable to track total rent payments
    }

    uint256 public itemCounter;
    mapping(uint256 => Item) public items;
    mapping(uint256 => RentalAgreement) public rentalAgreements;

    event ItemListed(uint256 indexed itemId, address owner);
    event RentalStarted(uint256 indexed itemId, address renter);
    event RentPaid(uint256 indexed itemId, address renter, uint256 amount);
    event RentalEnded(uint256 indexed itemId, address renter);

    uint256 constant SECONDS_IN_DAY = 86400;
    uint256 constant DAYS_IN_MONTH = 30;
    uint256 constant SECONDS_IN_MONTH = SECONDS_IN_DAY * DAYS_IN_MONTH; // 2,592,000 seconds


    function listItem(string memory _description, string memory _name, string memory _location,uint256 _rentalPrice, uint256 _securityDeposit, uint256 _rentalDuration) public {
            require(_rentalDuration > 0, "Duration must be at least one month");
            itemCounter++;
            items[itemCounter] = Item(
                itemCounter,
                payable(msg.sender), // payable type, allowing it to receive Ether
                _description,
                _name,
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

        item.state = RentalState.Rented;
        rentalAgreements[_itemId] = RentalAgreement(
            _itemId,
            payable(msg.sender), // payable type, allowing it to receive Ether
            block.timestamp,
            //block.timestamp + item.rentalDuration
            block.timestamp + (item.rentalDuration * SECONDS_IN_MONTH),
            0
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

        agreement.totalRentPaid += msg.value; //update the rentPaid variable

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
        require(block.timestamp >= agreement.endTime, "Rental period not ended");

        uint256 expectedTotalRent = item.rentalPrice * (item.rentalDuration);//calculate expected total rent
        require(agreement.totalRentPaid >= expectedTotalRent, "Due rent has not been fully paid");

        agreement.renter.transfer(item.securityDeposit);

        item.state = RentalState.Completed;
        emit RentalEnded(_itemId, agreement.renter);
    }


}







