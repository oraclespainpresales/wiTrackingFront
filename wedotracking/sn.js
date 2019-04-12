var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var Promise = require("Promise");


router.route('/:id').get(async function (req, res) {
  var poAsset = {};
  try {
    poAsset = await bcUtils.queryBlockchain("queryProduct", [ req.params.id ]);
    if( poAsset!={} ) {
      poAsset = cleanPoDetails(poAsset);
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(poAsset);
});


router.route('/:id/history').get(async function (req, res) {
  var products = [];
  try {
    products = await bcUtils.queryBlockchain("getHistoryForProduct", [ req.params.id ]);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(products);
});


router.route('/:id/alert')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var sn = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("alertForProduct", [ sn, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status(200).type("application/json").send(ret);
});


router.route('/:id/event')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var sn = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("eventForProduct", [ sn, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status(200).type("application/json").send(ret);
});


module.exports = router;
