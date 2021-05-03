var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 4000;
const GracefulShutdownManager = require("@moebius/http-graceful-shutdown")
  .GracefulShutdownManager;
var Web3 = require("web3");
var metaCoinArtifact = require("../build/contracts/TuniCoin.json");

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    );
    try {
      // get contract instance
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new this.web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address
      );
      const ethaccounts = await this.web3.eth.getAccounts();
      console.log(ethaccounts);
      this.account = ethaccounts[0];
      this.refreshBalance(this.account);
    } catch (error) {
      console.log(error);
      //console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function (address) {
    const { balanceOf } = this.meta.methods;
    const balance = await balanceOf(address).call();
    console.log(balance);
    return balance;
  },

  createAccount: async function () {
    let account = this.web3.eth.accounts.create();
    return account.address;
  },

  sendCoin: async function (receiver, amount) {
    const { transfer } = this.meta.methods;
    await transfer(receiver, amount)
      .send({ from: this.account })
      .then(console.log);
    return true;
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

  getAccount: async function () {
    return this.account;
  },

  getHistory: async function (address) {
    let array = [];
    return this.web3.eth.getPastLogs({
      fromBlock: "0x0",
      address: "0xb886dd58fad4c35c1dfa27ebe52b8e2131de4370",
    });
  },
};

App.start();

app.get("/", (req, res) => {
  balance = App.refreshBalance(App.account);
  balance.then((value) => {
    res.send("Current balance : " + value);
  });
});

app.get("/create", (req, res) => {
  address = App.createAccount();
  console.log(address);
  address.then((value) => {
    res.send(value);
  });
});

app.post("/send", (req, res) => {
  console.log(req);
  Success = App.sendCoin(req.body.receiver, req.body.amount);
  if (Success) {
    App.refreshBalance(App.account).then((value) => {
      res.send("Success new balance is : " + value);
    });
  } else {
    res.send("Failed");
  }
});

app.get("/balance", (req, res) => {
  balance = App.refreshBalance(req.query.address);
  balance.then((value) => {
    res.send(value);
  });
});

app.get("/gas", (req, res) => {
  gas = App.getGasPrice();
  gas.then((value) => {
    res.send(value);
  });
});

app.get("/ethbalance", (req, res) => {
  balance = App.getEthBalance(App.account);
  balance.then((value) => {
    res.send(value);
  });
});

app.get("/transaction", (req, res) => {
  transaction = App.getTransaction(req.query.transaction);
  transaction.then((value) => {
    res.send(value);
  });
});

app.get("/account/get", (req, res) => {
  App.getAccount().then((value) => {
    res.send(value);
  });
});

app.post("/account/set", (req, res) => {
  App.account = req.body.account;
  res.send("Success");
});

app.get("/history", (req, res) => {
  var history = App.getHistory(App.account);
  history.then((value) => {
    value.forEach((rec) => {
      var array = [];
      App.getTransaction(rec.transactionHash).then((value) => {
        if (value.from == App.account) array.push(value);
      });
      console.log(array);
    });
    res.send(value);
  });
});

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const shutdownManager = new GracefulShutdownManager(server);

process.on("SIGTERM", () => {
  shutdownManager.terminate(() => {
    console.log("Server is gracefully terminated");
  });
});
