var express = require('express');
var router = express.Router();
var xmljs = require('xml-js');
var bcUtils = require('./BCUtils').Utils;

exports.Utils = (function () {

  function cleanPO(poData) {
    // Clean PO Details
    var details = bcUtils.unescapeJSON(poData.Details);
    details = createJSONFromString(details);

    for( var i=0; i<details.length; i++ ) {
      if( details[i].item_number && !details[i].model ) {
        details[i].model = details[i].item_number
      }
    }
    poData.Details = details;

    //Clean Shipment Data
    var shipment = bcUtils.unescapeJSON(poData.Shipment);
    console.log("CleanPO::shipment.len="+shipment.length );
    if( shipment.length<=2 ) {
      shipment = {"shipment":"","products":[] }
    } else {
      try {
        shipment = createJSONFromString(shipment);
      } catch( err ) {
        // Error thrown if String cannot be parsed to JSON
      }
    }
    poData.Shipment = shipment;
    //Clean up buyer and seller IDs to remove uppercase letters and spaces
    var buyerID = cleanID(poData.BuyerID);
    poData.BuyerID = buyerID;
    var supplierID = cleanID(poData.SupplierID);
    poData.SupplierID = supplierID;
    return poData;
  }


  function cleanCreatePOArgs(args) {

    // Clean PO Details
    var details = bcUtils.unescapeJSON(args[4]);
    //console.log("CleanPO::details="+details );
    details = createJSONFromString(details);
    for( var i=0; i<details.length; i++ ) {
      if( details[i].item_number && !details[i].model ) {
        details[i].model = details[i].item_number
      }
    }
    //console.log("CleanPO::details2="+details );
    args[4] = bcUtils.escapeJSON(details);
    //console.log("CleanPO::details3="+JSON.stringify(args) );

    //Clean Shipment Data

    //Clean up buyer and seller IDs to remove uppercase letters and spaces
    var buyerID = cleanID(args[2]);
    args[2] = buyerID;
    var supplierID = cleanID(args[3]);
    args[3] = supplierID;
    return args;
  }


  function createJSONFromString(jstring) {
    var firstArrChar = jstring.indexOf("[");
    var firstObjChar = jstring.indexOf("{");
    if( firstArrChar!=0 && firstObjChar!=0 ) {
      if( firstArrChar != -1 && firstArrChar<firstObjChar ) {
        jstring = trimJSONString(jstring, "[", "]");
      } else if( firstObjChar != -1 && firstObjChar<firstArrChar ) {
        jstring = trimJSONString(jstring, "{", "}");
      }
    }
    return JSON.parse(jstring);
  }

  function trimJSONString(jstring, startChar, endChar) {
    var dS = jstring.indexOf(startChar);
    if( dS > -1) {
      var dE = jstring.lastIndexOf(endChar);
      if( dE > dS ) { jstring = jstring.substring(dS, dE+1) }
    }
    return jstring;
  }


  function cleanPODetailsBak(poData) {
    var det = []
    // Change Single Quotes to Double Quotes
    var details = bcUtils.unescapeJSON(poData.Details);
    var dS = details.indexOf("[");
    // Eliminate any escape characters around JSON Array
    if( dS > -1) {
      var dE = details.lastIndexOf("]");
      if( dE > dS ) { details = details.substring(dS, dE+1) }
    }
    // Check if it looks like a JSON Array
    if( details.indexOf("[") == 0 ) {
      try {
        details = JSON.parse(details);
        for( var i=0; i<details.length; i++ ) {
          if( details[i].item_number ) {
            details[i].model = details[i].item_number
          }
        }
        poData.Details = details;
      } catch( err ) {
        // Error thrown if String cannot be parsed to JSON
        var arr = details.split(",");
        for(var i=0;i<arr.length;i++) {
          var iter = arr[i].split(":");
          //console.log("CleanPO::ARR="+iter[0]+":"+iter[1] );
        }
      }
    } else {
      // Older code from when SCM data was sent in separate fields.  Should no longer be necessary.
      var models = poData.Details.trim().split(" ");
      var quantities = poData.Accept_Sign.trim().split(" ");

      var details = [];
      for( i=0; i<models.length; i++ ) {
        if( models[i].length > 0 ) {
          var item = {
            model : models[i],
            quantity : quantities[i]
          }
          details.push(item);
        }
      }
      poData.Details = details;
    }
    //Clean Shipment Data
    var shipment = poData.Shipment;
    //console.log("CleanPO::details1.1="+shipment)
    if( shipment == "" ) { shipment = "{'shipment':'','products':[]}" }
    shipment = shipment.replace(/'/g, '"');
    try {
      poData.Shipment = JSON.parse(shipment);
    } catch( err ) {
      // Error thrown if String cannot be parsed to JSON
    }

    //Clean up buyer and seller IDs to remove uppercase letters and spaces
    var buyerID = cleanID(poData.BuyerID);
    poData.BuyerID = buyerID;
    var supplierID = cleanID(poData.SupplierID);
    poData.SupplierID = supplierID;
    //console.log("CleanPO::details2="+JSON.stringify(poData))
    return poData;
  }

  function cleanID(id) {
    return id.replace(/, /g,'.').replace(/ /g,'.').toLowerCase();
  }

  async function generateProductsForPO(po) {
    var products = [];
    try {
      var now = bcUtils.getNOW();

      console.log("generateProductsForPO : po="+po);
      //var poAsset  = await bcUtils.queryBlockchain("queryPO", [ po ]);
      var XXX  = await bcUtils.queryBlockchain("queryPO", [ po ]);
      var poAsset = JSON.parse(XXX);
      if( poAsset!={} ) { poAsset = cleanPO(poAsset); }
      var details = poAsset.Details;
      for(j = 0; j < details.length; j++) {
        var model = details[j].model;
        var q = +details[j].quantity;
        for( var i=0; i<q; i++ ) {
          var newSN = bcUtils.getUUID();
          var args = [ newSN, model, poAsset.SupplierID, now, po ];
          //console.log("createProduct : "+args);
          var productAsset = await bcUtils.invokeBlockchain("createProduct", args);
          //console.log("createProduct: "+JSON.stringify(productAsset));
          var product = { model: model, sn : newSN };
          products.push( product );
        }
      };
    } catch (e) { console.log(e); }
    return products;
  };


  async function generateShipmentForPO(po, products) {
    try {
      var now = bcUtils.getNOW()
      var newShipmentID = bcUtils.getUUID();
      var poShipment = bcUtils.escapeJSON({ shipment : newShipmentID, products : products });

      console.log("generateShipmentForPO : poShipment="+poShipment);
      //var poAsset = await bcUtils.queryBlockchain("queryPO", [ po ]);
      var XXX = await bcUtils.queryBlockchain("queryPO", [ po ]);
      var poAsset = JSON.parse(XXX);
      if( poAsset!={} ) { poAsset = cleanPO(poAsset); }
      var productList = [];
      for(j = 0; j < products.length; j++) {
        productList.push(products[j].sn);
      }

      var args = [ newShipmentID, po, poAsset.BuyerID, poAsset.DeliveryLocation, productList.join("~") ];
      console.log("generateShipmentForPO : createShipment args="+args);
      var shipment = await bcUtils.invokeBlockchain("createShipment", args);

      args = [ po, poShipment, now ];
      console.log("generateShipmentForPO : updatePOWithShipment args="+args);
      var poAsset = await bcUtils.invokeBlockchain("updatePOWithShipment", args);
      return poShipment;
    } catch (e) { console.log(e); }
    return poShipment;
  };


  // TODO:  Add logic to update SCM with shipment details
  async function updateShipmentInSCM(po) {
    var ret = {};
    try {
      poAsset = await bcUtils.queryBlockchain("queryPO", [ po ]);
      if( poAsset!={} ) {
        poAsset = cleanPO(poAsset);
      }

      var ts = getNOW();
      var options = {compact: true, ignoreComment: true, spaces: 1};

      var modelArray = [];
      var details = poAsset.Details;

      var scmPayload = {
       "proc:TransactionType": "NEW",
       "proc:VendorId": "300000047414503",
       "proc:ASNType": "300000047414503",
       "proc:ShipmentNumber": poAsset.shipment,
       "proc:ReceiptSourceCode": "VENDOR",
       "proc:ShipToOrganizationCode": "001",
       "proc:VendorName": "Lee Supplies",
       "proc:VendorSiteCode": "Lee US1",
       "proc:ShippedDate": poAsset.Supplier_Shipped_Date,
       "proc:ExpectedReceiptDate": ts,
       "proc:BillOfLading": "BOL1",
       "proc:WaybillAirbillNumber": "WAYBILL1"
      };
      for(j = 0; j < details.length; j++) {
        var item = details[j];
        var m = item.model;
        var q = +item.quantity;

        var scmModel = {
          "proc:ReceiptSourceCode": "VENDOR",
          "proc:SourceDocumentCode": "PO",
          "proc:TransactionType": "SHIP",
          "proc:VendorId": "300000047414503",
          "proc:TransactionDate": poAsset.Supplier_Shipped_Date,
          "proc:DocumentNumber": "163321",
          "proc:DocumentLineNumber": "2",
          "proc:DocumentShipmentLineNumber": "1",
          "proc:ItemNumber": m,
          "proc:Quantity": {
            "_attributes" : {
              "unitCode" : ""
            },
            "_text":q
          }
        };
        modelArray.push(scmModel);
      }
      scmPayload["proc:StagedReceivingTransaction"] = modelArray;
      scmPayload = createSCMEnvelope(scmPayload);

      var result = xmljs.json2xml(scmPayload, options);
      console.log("updateShipment : "+result);

      // TODO:  CALL SCM WITH XML

      ret = scmPayload;

    } catch (error) {
      console.log("AssetError="+error);
    }

    return ret;
  }


  function createSCMEnvelope(payload) {
    var envelope = {
      "soapenv:Envelope": {
        "_attributes" : {
          "xmlns:soapenv" : "http://schemas.xmlsoap.org/soap/envelope/",
          "xmlns:typ" : "http://xmlns.oracle.com/apps/scm/receiving/receiptsInterface/transactions/processorServiceV2/types/",
          "xmlns:proc" : "http://xmlns.oracle.com/apps/scm/receiving/receiptsInterface/transactions/processorServiceV2/"
        },
        "soapenv:Header": { },
        "soapenv:Body": {
          "typ:processorAsync": {
            "typ:Receipt": payload,
          }
        }
      }
    };
    return envelope;
  }



  return {
    updateShipmentInSCM: updateShipmentInSCM,
    cleanPO: cleanPO,
    cleanCreatePOArgs: cleanCreatePOArgs,
    generateProductsForPO: generateProductsForPO,
    generateShipmentForPO: generateShipmentForPO,
    createJSONFromString: createJSONFromString,
    cleanID: cleanID
  }
})();
