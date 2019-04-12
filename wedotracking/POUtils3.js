var express = require('express');
var router = express.Router();
var xmljs = require('xml-js');
var bcUtils = require('./BCUtils').Utils;

exports.Utils = (function () {

  function cleanPoDetails(poData) {
    // Clean Details Element
    poData.Details = cleanPoDetailString(poData.Details);

    //Clean Shipment Element
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
    var buyerID = poData.BuyerID.replace(/, /g,'.').replace(/ /g,'.').toLowerCase();
    poData.BuyerID = buyerID;
    var supplierID = poData.SupplierID.replace(/, /g,'.').replace(/ /g,'.').toLowerCase();
    poData.SupplierID = supplierID;
    //console.log("CleanPO::details2="+JSON.stringify(poData))
    return poData;
  }



  function cleanPoDetailString(detailString) {
    // Change Single Quotes to Double Quotes
    var details = bcUtils.unescapeJSON(detailString);
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
        details.model
        poData.Details = details;
      } catch( err ) {
        // Error thrown if String cannot be parsed to JSON
        var arr = details.split(",");
        for(var i=0;i<arr.length;i++) {
          var iter = arr[i].split(":");
          //console.log("CleanPO::ARR="+iter[0]+":"+iter[1] );
        }
      }
    }

  }

  async function generateProductsForPO(po) {
    var products = [];
    try {
      var now = bcUtils.getNOW();

      console.log("generateProductsForPO : po="+po);
      var poAsset = await bcUtils.queryBlockchain("queryPO", [ po ]);
      if( poAsset!={} ) { poAsset = cleanPoDetails(poAsset); }
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
      var poAsset = await bcUtils.queryBlockchain("queryPO", [ po ]);
      if( poAsset!={} ) { poAsset = cleanPoDetails(poAsset); }
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
        poAsset = cleanPoDetails(poAsset);
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
    cleanPoDetails: cleanPoDetails,
    generateProductsForPO: generateProductsForPO,
    generateShipmentForPO: generateShipmentForPO
  }
})();
