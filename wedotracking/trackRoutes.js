var express = require('express')
var router = express.Router()
var bcUtils = require('./BCUtils').Utils;
var poUtils = require('./POUtils').Utils;

router.get('/index', async function (req, res) {
  console.log('TRACK::index');
  var opts = getOptions(req.user.role);
  res.redirect( opts.menu[0].url );
})

router.get('/customer', async function (req, res) {
  console.log('TRACK::CUSTOMER')
  var poAssets = [];
  var poAsset = {};
  try {
    var XXX = await bcUtils.queryBlockchain("queryPOByBuyer", [ req.user.username ]);
    var items = JSON.parse(XXX);
    for( i in items ) {
      console.log( "GET::item="+JSON.stringify(items[i]));
      poAsset = poUtils.cleanPO(items[i]);
      poAssets.push(poAsset);
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/customer', { user: req.user, POs: poAssets, opts: getOptions(req.user.role) } )
})

router.get('/poBuyer', async function (req, res) {
  console.log('TRACK::poBuyer');
  var poAssets = [];
  var poAsset = {};
  try {
    var XXX = await bcUtils.queryBlockchain("queryPOByBuyer", [ req.user.username, "open" ]);
    // JVP: Volvemos a hacer JSON.parse de lo que devuelve BCUtils.js::queryPOByBuyer, porque nos viene reconvertido a String
    var items = JSON.parse(XXX);
    for( i in items ) {
      console.log( "GET::item="+JSON.stringify(items[i]));
      poAsset = poUtils.cleanPO(items[i]);
      //poAsset.PODate = bcUtils.getNOW();
      //poAsset.EstDeliveryDate = bcUtils.getNOW();
      //poAsset.AcceptDate = bcUtils.getNOW();
      poAssets.push(poAsset);
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/poBuyer', { user: req.user, POs: poAssets, opts: getOptions(req.user.role) } )
})


router.get('/poSupplier', async function (req, res) {
  console.log('TRACK::poSupplier');
  var poAssets = [];
  var poAsset = {};
  try {
    var XXX = await bcUtils.queryBlockchain("queryPOBySupplier", [ req.user.username, "open" ]);
    var items = JSON.parse(XXX);
    for( i in items ) {
      console.log( "GET::item="+JSON.stringify(items[i]));
      poAsset = poUtils.cleanPO(items[i]);
      //poAsset.PODate = bcUtils.getNOW();
      //poAsset.EstDeliveryDate = bcUtils.getNOW();
      //poAsset.AcceptDate = bcUtils.getNOW();
      poAssets.push(poAsset);
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/poSupplier', { user: req.user, POs: poAssets, opts: getOptions(req.user.role) } )
})


router.get('/poCreate', async function (req, res) {
  console.log('TRACK::poCreate')
  res.render('track/poCreate', { user: req.user, opts: getOptions(req.user.role) } )
})

router.get('/poDetail/:id', async function (req, res) {
  console.log('TRACK::poDetail='+req.params.id)
  var poAsset = {};
  try {
    var XXX = await bcUtils.queryBlockchain("queryPO", [ req.params.id ]);
    var item = JSON.parse(XXX);
    poAsset = poUtils.cleanPO(item);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/poDetail', { user: req.user, opts: getOptions(req.user.role), PO: poAsset } )
})

router.get('/generateShipmentFromPO/:id', async function (req, res) {
  var po = req.params.id;
  console.log('TRACK::generateShipmentFromPO='+po)
  try {
    var products = await poUtils.generateProductsForPO(po);
    console.log('TRACK::generateShipmentFromPO..products='+products);
    if( !products || products.length==0 ) {
      res.redirect( 'track/index' );
    }

    var shipment = await poUtils.generateShipmentForPO(po, products);
    console.log('TRACK::generateShipmentFromPO..shipment='+shipment);

    //var item = await bcUtils.queryBlockchain("queryPO", [ po ]);
    var XXX = await bcUtils.queryBlockchain("queryPO", [ po ]);
    var item = JSON.parse(XXX);
    poAsset = poUtils.cleanPO(item);

  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/poDetail', { user: req.user, opts: getOptions(req.user.role), PO: poAsset } )
})

router.get('/shipmentDetail/:id', async function (req, res) {
  var shipmentID = req.params.id;
  console.log('TRACK::shipmentDetail');
  var products = [];
  try {
    //products = await bcUtils.queryBlockchain("queryProductsByShipment", [ shipmentID ]);
    var XXX = await bcUtils.queryBlockchain("queryProductsByShipment", [ shipmentID ]);
    products = JSON.parse(XXX);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/shipmentDetail', { user: req.user, products: products, opts: getOptions(req.user.role) } )
})

router.get('/productDetail/:id', async function (req, res) {
  var sn = req.params.id;
  console.log('TRACK::productDetail');
  var txns = [];
  try {
    //txns = await bcUtils.queryBlockchain("getHistoryForProduct", [ sn ]);
    var XXX = await bcUtils.queryBlockchain("getHistoryForProduct", [ sn ]);
    txns = JSON.parse(XXX);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/productDetail', { user: req.user, txns: txns, opts: getOptions(req.user.role) } )
})


router.get('/inventory', async function (req, res) {
  console.log('TRACK::inventory');

  var inv = { "shipments" : {}, "models" : {} };
  var items = [];
  try {
    //items = await bcUtils.queryBlockchain("queryProductsByCustodian", [ req.user.username ]);
    var XXX = await bcUtils.queryBlockchain("queryProductsByCustodian", [ req.user.username ]);
    items = JSON.parse(XXX);
    for( i in items ) {
      var model = items[i].Model;
      if( inv.models[model] ) {
        inv.models[model].push(items[i]);
      } else {
        inv.models[model] = [ items[i] ];
      }
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/stockByModel', { user: req.user, inventory: inv, opts: getOptions(req.user.role) } )
})


router.get('/shipments', async function (req, res) {
  console.log('TRACK::shipments');

  var inv = { "shipments" : {}, "models" : {} };
  var items = [];
  try {
    //items = await bcUtils.queryBlockchain("queryProductsByCustodian", [ req.user.username ]);
    var XXX = await bcUtils.queryBlockchain("queryProductsByCustodian", [ req.user.username ]);
    items = JSON.parse(XXX);
    for( i in items ) {
      var shipment = items[i].Shipment;
      if( inv.shipments[shipment] ) {
        inv.shipments[shipment].push(items[i]);
      } else {
        inv.shipments[shipment] = [ items[i] ];
      }
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/shipments', { user: req.user, inventory: inv, opts: getOptions(req.user.role) } )
})


router.get('/transport', async function (req, res) {
  console.log('TRACK::transport');

  var inv = { "shipments" : {}, "models" : {} };
  var items = [];
  try {
    //items = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.user.truckid ]);
    var XXX = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.user.truckid ]);
    items = JSON.parse(XXX);
    for( i in items ) {
      var shipment = items[i].Shipment;
      if( inv.shipments[shipment] ) {
        inv.shipments[shipment].push(items[i]);
      } else {
        inv.shipments[shipment] = [ items[i] ];
      }
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/transport', { user: req.user, inventory: inv, opts: getOptions(req.user.role) } )
})


router.get('/logistics', async function (req, res) {
  console.log('TRACK::logistics');

  var inv = { "shipments" : {}, "models" : {} };
  var items = [];
  try {
    //items = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.user.truckid ]);
    var XXX = await bcUtils.queryBlockchain("queryProductsByTransport", [ req.user.truckid ]);
    items = JSON.parse(XXX);
    for( i in items ) {
      var shipment = items[i].Shipment;
      if( inv.shipments[shipment] ) {
        inv.shipments[shipment].push(items[i]);
      } else {
        inv.shipments[shipment] = [ items[i] ];
      }
    }
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.render('track/logistics', { user: req.user, inventory: inv, opts: getOptions(req.user.role) } )
})


router.post('/doPOCreate', async function (req, res) {
  try {
    var details = "[{'model':'"+req.body.model+"', 'quantity':"+req.body.quantity+"}]"
    var estDelDate = req.body.estDeliveryDate + "T09:00:00Z"
    var id = bcUtils.getUUID();
    var dt = bcUtils.getNOW();
    var args = [
      id,
      dt,
      req.user.username,
      req.body.supplierID,
      details,
      "",
      "",
      estDelDate,
      req.body.deliveryLocation
    ]
    //var ret = await bcUtils.invokeBlockchain("createPO", args);
    var XXX = await bcUtils.invokeBlockchain("createPO", args);
    var ret = JSON.parse(XXX);
  } catch (error) {
    console.log("TRACK::AssetError="+error);
    res.status(500).send(error);
  }
  res.status(200).send('Created Order '+id+".")
})

function getOptions(role) {
  var opts = {}
  var menu = []
  if( role == "BUYER" ) {
    opts.style="info";
    menu.push( { url : "/tracker/poBuyer", label : "Orders" } )
    menu.push( { url : "/tracker/shipments", label : "Shipments" } )
    menu.push( { url : "/tracker/inventory", label : "Inventory" } )
  } else if( role == "SUPPLIER" ) {
    opts.style="primary";
    menu.push( { url : "/tracker/poSupplier", label : "Incoming Orders" } )
    menu.push( { url : "/tracker/shipments", label : "Shipments" } )
    menu.push( { url : "/tracker/inventory", label : "Inventory" } )
  } else if( role == "LOGISTICS" ) {
    opts.style="secondary";
    menu.push( { url : "/tracker/transport", label : "Transport" } )
    menu.push( { url : "/tracker/logistics", label : "Events" } )
  } else if( role == "DISTRIBUTOR" ) {
    opts.style="success";
    menu.push( { url : "/tracker/shipments", label : "Shipments" } )
    menu.push( { url : "/tracker/inventory", label : "Inventory" } )
  } else {
    opts.style="dark";
    menu.push( { url : "/tracker/inventory", label : "Inventory" } )
  }
  opts.menu = menu;
  return opts;
}

module.exports = router
