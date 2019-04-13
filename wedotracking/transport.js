var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var _ = require('lodash');
var Promise = require("Promise");


router.route('/:id').get(async function (req, res) {
  var products = [];
  try {
    products = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.params.id ]);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(products);
});

router.route('/:id/latestShipment').get(async function (req, res) {
//  var shipmentProducts = [];
  var orderedProducts = [];
  var shipment;
  try {
    var products = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.params.id ]);
    console.log(products);
    orderedProducts = _.orderBy(JSON.parse(products), ['Assembly_Date'], ['desc']);
    console.log(orderedProducts);
/**
    var ts;
    for(i = 0; i < products.length; i++) {
      if( products[i].Assembly_Date ) {
        var ts2 = Date.parse(products[i].Assembly_Date);
        if( !ts || ts2>ts ) {
          ts = ts2;
          shipment = products[i].Shipment;
          console.log("lastShipment : "+ts+" -- "+ shipment);
        }
      }
    };
    if( shipment ) {
      for(i = 0; i < products.length; i++) {
        if( products[i].Shipment == shipment ) {
          shipmentProducts.push(products[i]);
        }
      };
    }
**/
  } catch (error) {
    console.log("AssetError="+error);
  }
//  res.status("200").type('application/json').send(shipmentProducts);
  res.status("200").type('application/json').send(orderedProducts);
});

router.route('/:id/alert')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var shipment = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("alertForTransport", [ shipment, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
//  res.status(200).type("application/json").send(ret);
  res.status(200).type("application/json").send({"returnCode": "Success","result":"OK","info": null});
});


router.route('/:id/event')
    .post(async function (req, res) {
  var ret = "{}";
  try {
    var shipment = req.params.id;
    var msg = req.body.message;
    ret = await bcUtils.invokeBlockchain("eventForTransport", [ shipment, msg ] );
  } catch (error) {
    console.log("AssetError="+error);
  }
//  res.status(200).type("application/json").send(ret);
  res.status(200).type("application/json").send({"returnCode": "Success","result":"OK","info": null});
});

module.exports = router;
