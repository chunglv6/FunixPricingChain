pragma solidity ^0.4.17;

// // Interface of Main contract to call from Session contract
// contract Main {
//     address public admin;
//     function addSession(address session) public ;
//     function increNumSessionOfParticipant(address _address) public ;
//     function getDeviation(address _address) public view returns(uint) ;
//     function setDeviation(address _address,uint _devi) public;
//     function getAccountOfParticipant(address _address) public view returns(address);
// }
import "./Main.sol";

contract Session {
    // Variable to hold Main Contract Address when create new Session Contract
    address public mainContract;
    // Variable to hold Main Contract instance to call functions from Main
    Main MainContract;
    address public creator;
     enum State {CREATED,ONGOING,CLOSED,FINSHED,STOPPED}
    State public state;
    State public stateBefore;
    uint public timeStop;
    uint public timeOut;
    string public name;
    string public description;
    string public image;
    address[] public iParticipants;
    mapping(address => uint) public pricings;
    mapping(address => uint) public deviations;
    uint public proposedPrice;
    uint public nParticipants;
    function Session(address _mainContract,string _name,string _description,string _image) public{
        // Get Main Contract instance
        mainContract = _mainContract;
        MainContract = Main(_mainContract);
        // TODO: Init Session contract
        creator = MainContract.admin();
        state = State.CREATED;
        name = _name;
        description = _description;
        image = _image;
        // Call Main Contract function to link current contract.
        MainContract.addSession(address(this));
    }

    // modifier validState
    modifier validState(State _state){
        require(state == _state);
        _;
    }
    // modifier only admin can do action
    modifier onlyAdmin(){
        require(msg.sender == creator);
        _;
    }

    // modifier to check participants register or not
    modifier validRegister(){
        //require(msg.sender == MainContract.getAccountOfParticipant(msg.sender));
        require(msg.sender == MainContract.getAccountOfParticipant(msg.sender));
        _;
    }
    // function for admin start Session
    function startSession(uint _timeOut) public onlyAdmin{
        require(state == State.CREATED || state == State.STOPPED);
        if(state == State.CREATED){
            if(_timeOut == 0){
                timeOut = 0;
            }else{
                timeOut = now + _timeOut;
            }
            state = State.ONGOING;
        }else{
            state = stateBefore;
            if(timeOut > timeStop){
                timeOut = now + timeOut - timeStop;
            }
        }
    }
    function closeSession() public onlyAdmin validState(State.ONGOING){
        state = State.CLOSED;
    }
    //stop function to halt session a moment
    function stopSession() public onlyAdmin {
        require(state == State.CREATED || state == State.ONGOING || state == State.CLOSED);
        stateBefore = state;
        state = State.STOPPED;
        timeStop = now;
    }
    //function for participant price the product
    function priceProduct(uint _amount) public validState(State.ONGOING) validRegister{
        require(_amount > 0);
        if(timeOut > 0 && now >= timeOut){
            state = State.CLOSED;
        }else{
            if(pricings[msg.sender] > 0){
                pricings[msg.sender] = _amount;
            }else{
                pricings[msg.sender] = _amount;
                nParticipants = iParticipants.push(msg.sender);
                MainContract.increNumSessionOfParticipant(msg.sender);
            }
        }
    }

    //function to calculate proposed price and final price
    function calculateFinalPrice() public onlyAdmin validState(State.CLOSED){
        uint totalDeviation = 0;
        // calculate total Deviatin of all participant in a Session
        for(uint i = 0; i < nParticipants; i++){
            address tempPar = iParticipants[i];
            totalDeviation += MainContract.getDeviation(tempPar);
        }
        // caculate proposedPrice
        for(uint j = 0; j < nParticipants; j++){
            address _address = iParticipants[j];
            proposedPrice += pricings[_address]*(10000 - MainContract.getDeviation(_address));
        }
        proposedPrice = proposedPrice*100/(10000*nParticipants - totalDeviation);
        // update Deviation for each participant
        for(uint k = 0;k < nParticipants; k++){
            uint deviationNew = 0;
            address p = iParticipants[k];
            if(proposedPrice >= 100*pricings[p]){
                deviationNew = (proposedPrice - 100*pricings[p])*100;
            }else{
                deviationNew = (100*pricings[p] - proposedPrice)*100;
            }
            uint genDevi = (MainContract.getDeviation(p)*nParticipants*proposedPrice + 100*deviationNew);
            deviations[p] = genDevi/((nParticipants + 1)*proposedPrice);
            MainContract.setDeviation(p,address(this));
        }
        state = State.FINSHED;
    }

    function updateProduct(string _name,string _description) public onlyAdmin{
        name = _name;
        description = _description;
    }

}
