import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/TuniCoin.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  privateKey: null,

  start: async function () {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address
      );
      const ethaccounts = await web3.eth.getAccounts();
      this.account = ethaccounts[0];
      console.log(this.account);
      var privateKey =
        "389be22c4d9c7c13de94cc4efadece0d4fc53e80082e4d45a2c455c6109c4de7";
      let accountInfo = web3.eth.accounts.privateKeyToAccount(privateKey);
      console.log(accountInfo);
      //Execute test functions
      this.refreshBalance();
      this.getGasPrice().then(console.log);
      this.getTransaction(
        "0x8d9ccce3acb2daa80a9651caf69f610d40b7b8e52abf6c0e855348c6db2d9cd0"
      ).then(console.log);
      var history = this.getHistory(this.account);
      console.log(history);
      this.getEthBalance;
    } catch (error) {
      console.log(error);
      //console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function () {
    const { balanceOf } = this.meta.methods;
    const balance = await balanceOf(this.account).call();

    const balanceElement = document.getElementsByClassName("balance")[0];
    balanceElement.innerHTML = balance;
  },

  getHistory: async function (address) {
    let array = [];
    this.web3.eth
      .getPastLogs({
        fromBlock: "0x0",
        address: "0xb886dd58fad4c35c1dfa27ebe52b8e2131de4370",
      })
      .then((res) => {
        res.forEach((rec) => {
          //console.log(rec.blockNumber, rec.transactionHash, rec.topics);
          this.getTransaction(rec.transactionHash).then((tx) => {
            if (tx.from == address || tx.to == address) array.push(tx);
          });
        });
      })
      .catch((err) => console.log("getPastLogs failed", err));
    return array;
  },

  getGasPrice: async function () {
    return this.web3.eth.getGasPrice();
  },

  getEthBalance: async function (address) {
    return this.web3.eth.getBalance(address);
  },

  getTransaction: async function (transaction) {
    return this.web3.eth.getTransaction(transaction);
  },

  sendCoin: async function () {
    const amount = parseInt(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    const { transfer } = this.meta.methods;
    await transfer(receiver, amount)
      .send({ from: this.account })
      .then((transfer) => {
        //this.web3.eth.accounts.signTransaction(transfer, this.privateKey);
        console.log(transfer);
      });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function () {
  /*if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
    console.log("Got MetaMask access");
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live"
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    );
  }*/
  App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  App.start();
});
