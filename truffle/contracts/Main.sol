pragma solidity ^0.4.17;
//import "./Session.sol";
contract Main {

    // Structure to hold details of Bidder
    struct IParticipant {
        address  account ;
        string fullname;
        string email;
        uint nSessions;
        uint deviation;
    }

    address public admin;

    // TODO: Variables
    // nSession contain number of session init
    uint public nSessions;
    // nParticipant contain number of participant
    uint public nParticipants;
    address[] public iParticipants;
    // array contain address of session contract
    address[] public sessions;
    // mapping address of participant to struct participant
    mapping(address => IParticipant) public participants;
    // constructor of main contract
    function Main() public{
        admin = msg.sender;
        participants[admin].account = admin;
        participants[admin].fullname = 'admin';
        participants[admin].email = 'admin@funix.edu.vn';
        participants[admin].nSessions = 0;
        participants[admin].deviation = 0;
        nParticipants = iParticipants.push(admin);
    }
    // Add a Session Contract address into Main Contract. Use to link Session with Main
    function addSession(address session) public {
        nSessions = sessions.push(session);
    }
    // function allow participant register to system pricing
    function register(string _fullname,string _email) public {
        if(participants[msg.sender].account == address(0)){
            participants[msg.sender].account = msg.sender;
            participants[msg.sender].fullname = _fullname;
            participants[msg.sender].email = _email;
            participants[msg.sender].nSessions = 0;
            participants[msg.sender].deviation = 0;
            nParticipants = iParticipants.push(msg.sender);
        }
    }
    // function to increment number of Session that participant joined

    function increNumSessionOfParticipant(address _address) public{
        participants[_address].nSessions += 1;
    }
    //function to get deviation of participant
    function getDeviation(address _address) public view returns(uint){
        return participants[_address].deviation;
    }
    //function to update deviation of participant
    function setDeviation(address _address,uint _devi) public {
        participants[_address].deviation = _devi;
    }

}
