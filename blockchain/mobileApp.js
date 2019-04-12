var express = require('express')
var router = express.Router()
var bcUtils = require('../wedotracking/BCUtils').Utils;
var poUtils = require('../wedotracking/POUtils').Utils;
var userUtils = require('../users/LocalUserHelper').Utils;

/*
router.post('/login', function (req, res) {
  var username = req.body.username.toLowerCase();
  var password = req.body.password;
  var user = userUtils.login( username, password );
  if(user.error) {
    res.status(401).send(user.error);
  } else {
    res.status(200).send(JSON.stringify(user));
  }
})

router.post('/export', function (req, res) {
  var userList = userUtils.getAllUsers();
  console.log("USERS.EXPORT::USERLIST="+JSON.stringify(userList));
  if(userList && userList.length>0) {
     res.status(200).send(JSON.stringify(userList));
  } else {
     res.status(401).send("Error exporting users");
  }
})
*/

router.get('/productDetailByShipment/:id', async function (req, res) {
  var sn = req.params.id;
  console.log('TRACK::productDetailByShipment');
  var txns = [];
  try {
    var XXX = await bcUtils.queryBlockchain("queryProductsByShipment", [ sn ]);
    txns = JSON.parse(XXX);
    //res.status(200).send(JSON.stringify(txns));
    res.status(200).send(txns);
  } catch (error) {
    res.status(401).send("Error in queryProductsByShipment");
    console.log("AssetError="+error);
  }
  //res.render('track/productDetail', { user: req.user, txns: txns, opts: getOptions(req.user.role) } )
})

router.get('/productDetail/:id', async function (req, res) {
  var sn = req.params.id;
  console.log('TRACK::productDetail');
  var txns = [];
  try {
    //txns = await bcUtils.queryBlockchain("getHistoryForProduct", [ sn ]);
    var XXX = await bcUtils.queryBlockchain("getHistoryForProduct", [ sn ]);
    txns = JSON.parse(XXX);
    //res.status(200).send(JSON.stringify(txns));
    res.status(200).send(txns);
  } catch (error) {
    res.status(401).send("Error in getHistoryForProduct");
    console.log("AssetError="+error);
  }
  //res.render('track/productDetail', { user: req.user, txns: txns, opts: getOptions(req.user.role) } )
})

router.post('/product/incident/:id', async function (req, res) {
  var sn = req.params.id;
  var args = [
    sn,
    req.body.message
  ]
  console.log('TRACK::incident');
  var txns = [];
  try {
    var response = await bcUtils.invokeBlockchain("incidentForProduct", args);
    res.status(200).send(response);
  } catch (error) {
    res.status(401).send("Error in incidentForProduct");
    console.log("AssetError="+error);
  }
})

router.post('/changeCustodian', async function (req, res) {
  try {
    //var id = bcUtils.getUUID();
    //var dt = bcUtils.getNOW();
    var args = [
      req.body.sn,
      req.body.custodianID,
      req.body.transportID,
      req.body.role
    ]
    //var ret = await bcUtils.invokeBlockchain("createPO", args);
    var XXX = await bcUtils.invokeBlockchain("takeCustodyOfProduct", args);
    var ret = JSON.parse(XXX);
console.log("*****************************123******************************");
console.log(ret);
console.log("*****************************456******************************");
  } catch (error) {
    console.log("TRACK::AssetError="+error);
    res.status(500).send(error);
  }
  res.status(200).send('Custodian changed for sn: '+req.body.sn+" to be custodied by: "+req.body.custodianID+".")
})

module.exports = router
