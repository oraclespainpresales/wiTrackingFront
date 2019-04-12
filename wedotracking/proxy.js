var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var Promise = require("Promise");


router.route('/queryJSON').post(async function (req, res) {
  var asset = {};
  try {
    var payload = req.body;
    var args = bcUtils.replaceVariables(payload.args);

    asset = await bcUtils.queryBlockchain(payload.method, args);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(asset);
});


router.route('/query').post(async function (req, res) {
  var asset = {};
  try {
    var payload = req.body;
    var args = bcUtils.replaceVariables(payload.args);

    asset = await bcUtils.queryBlockchainRaw(payload.method, args);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(asset);
});


router.route('/invokeJSON').post(async function (req, res) {
  var asset = {};
  try {
    var payload = req.body;
    var args = bcUtils.replaceVariables(payload.args);

    asset = await bcUtils.invokeBlockchain(payload.method, args);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(asset);
});

router.route('/invocation').post(async function (req, res) {
  var asset = {};
  try {
    var payload = req.body;
    var args = bcUtils.replaceVariables(payload.args);

    asset = await bcUtils.invokeBlockchainRaw(payload.method, args);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(asset);
});


router.route('/generateUUID')
    .get(function (req, res) {
  var id = bcUtils.getUUID();
  res.status(200).send(JSON.stringify({ id : id }));
});


router.route('/generateTimestamp')
    .get(function (req, res) {
  var ts = bcUtils.getNOW();
  res.status(200).send(JSON.stringify({ now : ts }));
});



module.exports = router;
