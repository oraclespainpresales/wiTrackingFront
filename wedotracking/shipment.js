var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var Promise = require("Promise");


router.route('/:id').get(async function (req, res) {
  var products = [];
  try {
    products = await bcUtils.queryBlockchain("queryProductsByShipment", [ req.params.id ]);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(products);
});

router.route('/:id/alert')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var shipment = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("alertForShipment", [ shipment, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status(200).type("application/json").send(ret);
});

router.route('/:id/event')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var shipment = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("eventForShipment", [ shipment, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status(200).type("application/json").send(ret);
});

router.route('/:id/review')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    console.log("1");
    var shipment = req.params.id;
    console.log("2");
    var cutodian = req.body.custodian;
    console.log("3");
    var msg = req.body.message;
    console.log("4");
    console.log([ shipment, custodian, msg ]);
    ret = await bcUtils.invokeBlockchain("enterShipmentReview", [ shipment, custodian, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status(200).type("application/json").send(ret);
});

module.exports = router;
