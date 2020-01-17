import { app, h } from 'hyperapp';
import { Link, Route, location } from '@hyperapp/router';
import { Products } from './pages/products';
import { Sidebar } from './pages/sidebar';
import { Participants } from './pages/participants';
import { config } from './config';
import { promisify } from 'util';
import './css/vendor/bootstrap.css';
import './css/vendor/coreui.css';
import './css/index.css';

const Fragment = (props, children) => children;

const Web3 = require('web3');
let web3js;

// if (typeof web3js !== 'undefined') {
//   web3js = new Web3(web3.currentProvider);
// } else {
//   web3js = new Web3('ws://localhost:7545');
// }
 // Modern dapp browsers...
 if (window.ethereum) {
  web3js = new Web3(window.ethereum);
  try {
    // Request account access
     window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3js) {
  web3js = new Web3(window.web3.currentProvider);
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  web3js = new Web3('https://ropsten.infura.io/v3/672d4ad6f9324fb8a15f2c062bf826f8');
  //web3js = new Web3('ws://localhost:7545');
}

window.ethereum.on('accountsChanged', function (accounts) {
  document.location.reload();
})

import Main from './truffle/build/contracts/Main.json';
import Session from './truffle/build/contracts/Session.json';

const mainContract = new web3js.eth.Contract(Main.abi, config.mainContract);
var state = {
  count: 1,
  location: location.state,
  products: [],
  dapp: {},
  balance: 0,
  account: 0,
  admin: null,
  profile: null,
  fullname: '',
  email: ''.replace,
  newProduct: {},
  sessions: [],
  currentProductIndex: 0
};

// Functions of Main Contract
const contractFunctions = {
  getAccounts: promisify(web3js.eth.getAccounts),
  getBalance: promisify(web3js.eth.getBalance),
  // Get Admin address of Main contract
  getAdmin: mainContract.methods.admin().call,

  // Get participant by address
  participants: address => mainContract.methods.participants(address).call,

  // Get number of participants
  nParticipants: mainContract.methods.nParticipants().call,

  // Get address of participant by index (use to loop through the list of participants) 
  iParticipants: index => mainContract.methods.iParticipants(index).call,

  // Register new participant
  register: (fullname, email) =>
    mainContract.methods.register(fullname, email).send,
  
  // Get number of sessions  
  nSessions: mainContract.methods.nSessions().call,

  // Get address of session by index (use to loop through the list of sessions) 
  sessions: index => mainContract.methods.sessions(index).call
};

const actions = {

  inputProfile: ({ field, value }) => state => {
    let profile = state.profile || {};
    profile[field] = value;
    return {
      ...state,
      profile
    };
  },
 

  inputNewProduct: ({ field, value }) => state => {
    let newProduct = state.newProduct || {};
    newProduct[field] = value;
    return {
      ...state,
      newProduct
    };
  },

  createProduct: () => async (state, actions) => {
    let contract = new web3js.eth.Contract(Session.abi, {
      data: Session.bytecode
    });
    await contract
      .deploy({
        arguments: [
          config.mainContract,
          state.newProduct.name,
          state.newProduct.description,
          state.newProduct.image
        ]
      })
      .send({ from: state.account });
    actions.getSessions();
  },

  selectProduct: i => state => {
    return {
      currentProductIndex: i
    };
  },

  sessionFn: (data) => async (state, actions) => {
    if(!data.data){
      data.data = 0;
    }
    let sessionContract = state.sessions[state.currentProductIndex].contract;
    let stateOfSession;
    switch (data.action) {
      case 'start':
        stateOfSession = await sessionContract.methods.state().call();
        if(stateOfSession == 0){
          await sessionContract.methods.startSession(data.data).send({from:state.account});
        }else if(stateOfSession == 1){
          alert('session already started');
        }else if(stateOfSession == 4){
          await sessionContract.methods.startSession(0).send({from:state.account});
        }else{
          alert('session already closed');
        }
        // if(data.data > 0){
        //   actions.setExpireTimeOut({_timeout:data.data,_session:sessionContract});
        // }
        
        actions.getSessions();
        break;
      case 'stop':
        stateOfSession = await sessionContract.methods.state().call();
        if(stateOfSession == 3){
          alert('can not stop session finshed');
        }else if(stateOfSession == 4){
          alert('session already stopped');
        }else{
          try{
            await sessionContract.methods.stopSession().send({from:state.account});
          }catch(e){
            alert('Fail to stop session');
          }
        }
        actions.getSessions();
        break;
      case 'pricing':
        //The inputed Price is stored in `data`
        stateOfSession = await sessionContract.methods.state().call();
       
        if(stateOfSession == 1){
          try{
            await sessionContract.methods.priceProduct(data.data).send({from: state.account});
          }catch(e){
            alert('account not yet register');
          }
        }else if(stateOfSession == 0){
          alert('session not yet start');
        }else{
          alert('session already closed');
        }
        let profile = await contractFunctions.participants(state.account)(); 
        actions.setProfile(profile);
        actions.getSessions();
        actions.getParticipants();
        break;
      case 'close':
        //The inputed Price is stored in `data`
        stateOfSession = await sessionContract.methods.state().call();
        if(stateOfSession == 2){
          await sessionContract.methods.calculateFinalPrice().send({from:state.account});
        }else if(stateOfSession == 1){
          await sessionContract.methods.closeSession().send({from:state.account});
          await sessionContract.methods.calculateFinalPrice().send({from:state.account});
        }else if(stateOfSession == 0){
          alert('session not yet start');
        }else if(stateOfSession == 4){
          alert('session already STOPPED');
        }else{
          alert('Final price already set');
        }
        actions.getSessions();
        actions.getParticipants();
        break;

      case 'update' :
        console.log(data.name +"  "+data.description);
        if(data.name == undefined){
          data.name = data._name;
        }
        if(data.description == undefined){
          data.description = data._description;
        }
        console.log(data.name +"  "+data.description);
        if(data.name !== data._name || data.description !== data._description){
          await sessionContract.methods.updateProduct(data.name,data.description).send({from:state.account});
        }else{
          alert('product\'information does not need to change');
        }

        myfunction();
        actions.getSessions();
        break;
    }
  },

  location: location.actions,

  getAccount: () => async (state, actions) => {
    let accounts = await contractFunctions.getAccounts();
    let balance = await contractFunctions.getBalance(accounts[0]);
    let admin = await contractFunctions.getAdmin();
    let profile = await contractFunctions.participants(accounts[0])();

    actions.setAccount({
      account: accounts[0],
      balance,
      isAdmin: admin === accounts[0],
      profile
    });
  },
  setAccount: ({ account, balance, isAdmin, profile }) => state => {
    return {
      ...state,
      account: account,
      balance: balance,
      isAdmin: isAdmin,
      profile
    };
  },

  getParticipants: () => async (state, actions) => {
    let participants = [];
    let nParticipants = await contractFunctions.nParticipants();
    for(let index = 0; index < nParticipants; index++){
      let _address = await contractFunctions.iParticipants(index)();
      let par = await contractFunctions.participants(_address)();
      // let count = 0;
      // for(let i = 0;i < nSession;i++){
      //   // Get session address
      //   let session = await contractFunctions.sessions(i)();
      //   // Load the session contract on network
      //   let contract = new web3js.eth.Contract(Session.abi, session);
      //   if(await contract.methods.pricings(_address) > 0){
      //     count++;
      //   }
      // }
      // par[3] = count;
      participants.push(par);
    }
    actions.setParticipants(participants);
  },

  setParticipants: participants => state => {
    return {
      ...state,
      participants: participants
    };
  },

  setProfile: profile => state => {
    return {
      ...state,
      profile: profile
    };
  },

  register: () => async (state, actions) => {
    state.fullname = state.profile.fullname;
    state.email = state.profile.email;
    await mainContract.methods.register(state.fullname,state.email).send({from:state.account});
    //const profile = {};
    let profile = await contractFunctions.participants(state.account)(); 
    actions.setProfile(profile);
    actions.getParticipants();
  },

  edit:(_account) =>async (state,actions) =>{
    var check = false;
    if(_account == state.account){
      check = true;
    }
    myfunction2(check);
  },
  updateParticipantInfo:() =>async (state,actions) => {
    state.fullname = state.profile.fullname;
    state.email = state.profile.email;
    let _profile = await contractFunctions.participants(state.account)(); 
    if(_profile[1] !== state.fullname || _profile[2] !== state.email){
      await mainContract.methods.updateParticipantInfo(state.fullname,state.email,state.account).send({from:state.account});
    }else{
      alert('Participant\'information does not need to change');
    }
    _profile = await contractFunctions.participants(state.account)(); 
    actions.setProfile(_profile);
    myfunction2(false);
    actions.getParticipants();
  },

  getSessions: () => async (state, actions) => {
    let nSession = await contractFunctions.nSessions();
    let sessions = [];

    for (let index = 0; index < nSession; index++) {
      // Get session address
      let session = await contractFunctions.sessions(index)();
      // Load the session contract on network
      let contract = new web3js.eth.Contract(Session.abi, session);

      let id = session;
      let name = await contract.methods.name().call() ; // TODO
      let description = await contract.methods.description().call(); // TODO
      let price = await contract.methods.proposedPrice().call(); // TODO
      let image = await contract.methods.image().call(); // TODO
      let _status = await contract.methods.state().call();
      let status;
      if(_status == 0){
        status = 'CREATED';
      }else if(_status == 1){
        status = 'ONGOING';
      }else if(_status == 2){
        status = 'CLOSED';
      }else if(_status == 3){
        status = 'FINSHED';
      }else{
        status = 'STOPPED';
      }
      sessions.push({ id, name, description, price, contract, image ,status});
    }
    actions.setSessions(sessions);
  },

  setSessions: sessions => state => {
    return {
      ...state,
      sessions: sessions
    };
  }

  // setExpireTimeOut:(obj)=> async (state,actions)=>{
  //   console.log(obj._timeout);
  //   console.log(obj._session);
  //   setTimeout(async()=>{
  //    let creator = await obj._session.methods.creator().call();
  //     await obj._session.methods.setStateTimeOut().send({from:creator});
  //     console.log(await obj._session.methods.state().call());
  //   },obj._timeout*1000);
  // }
};

const view = (
  state,
  { getAccount, getParticipants, register, inputProfile, getSessions,updateParticipantInfo}
) => {
  return (
    <body
      class='app sidebar-show sidebar-fixed'
      oncreate={() => {
        getAccount();
        getParticipants();
        getSessions();
      }}
    >
      <div class='app-body'>
        <Sidebar
          balance={state.balance}
          account={state.account}
          isAdmin={state.isAdmin}
          profile={state.profile}
          register={register}
          inputProfile={inputProfile}
          updateParticipantInfo={updateParticipantInfo}
        ></Sidebar>
        <main class='main d-flex p-3'>
          <div class='h-100  w-100'>
            <Route path='/products' render={Products}></Route>
            <Route path='/participants' render={Participants}></Route>
          </div>
        </main>
      </div>
    </body>
  );
};
const el = document.body;

const main = app(state, actions, view, el);
const unsubscribe = location.subscribe(main.location);
