var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var poUtils = require('./POUtils').Utils;
var Promise = require("Promise");


router.route('/create').post(async function (req, res) {
  var asset = {};
  try {
    var payload = req.body;
    var args = bcUtils.replaceVariables(payload.args);
    args = poUtils.cleanCreatePOArgs(args);

    asset = await bcUtils.invokeBlockchainRaw(payload.method, args);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(asset);
});


router.route('/:po').get(async function (req, res) {
  var poAsset = {};
  try {
    poAsset = await bcUtils.queryBlockchain("queryPO", [ req.params.po ]);
    if( poAsset!={} ) { poAsset = poUtils.cleanPO(poAsset); }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(poAsset);
});


router.route('/:po/products').get(async function (req, res) {
  var products = [];
  try {
    products = await bcUtils.queryBlockchain("queryProductsByPO", [ req.params.po ]);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(products);
});



router.route('/:po/updateShipmentInSCM')
    .get(async function(req, res) {

  var scmRet = updateShipmentInSCM(req.params.po);

  res.status(200).type("application/json").send(scmRet);
});

router.route('/:po/generateShipment')
    .get(async function(req, res) {
  var ret = "{}";
  try {
    var now = bcUtils.getNOW()
    var po = req.params.po;
    var shipment = bcUtils.getUUID();
    console.log("queryPO : "+po);
    var poAsset = await bcUtils.queryBlockchain("queryPO", [ po ]);
    if( poAsset!={} ) { poAsset = poUtils.cleanPO(poAsset); }
    console.log("queryPO DONE : "+JSON.stringify(poAsset));
    var details = poAsset.Details;
    var productList = "";
    for(j = 0; j < details.length; j++) {
      var item = details[j];
      var model = item.model;
      var q = +item.quantity;
      for( var i=0; i<q; i++ ) {
        var id = bcUtils.getUUID();
        var args = [ id, model, poAsset.SupplierID, now ];
        console.log("createProduct : "+args);
        var productAsset = await bcUtils.invokeBlockchain("createProduct", args);
        console.log("createProduct DONE: "+JSON.stringify(productAsset));
        if( productList.length!=0 ) { productList += "~"}
        productList += id;
      }
    };
    var sid = bcUtils.getUUID();
    var args = [ sid, po, poAsset.BuyerID, "", productList ];
    console.log("createShipment : "+args);
    var shipment = await bcUtils.invokeBlockchain("createShipment", args);
    console.log("createShipment DONE: "+JSON.stringify(shipment));

    ret = shipment;
  } catch (e) { console.log(e); }
  res.status(200).type("application/json").send(ret);
});



module.exports = router;
