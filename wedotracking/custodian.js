var express = require('express');
var router = express.Router();
var bcUtils = require('./BCUtils').Utils;
var Promise = require("Promise");


router.route('/:id').get(async function (req, res) {
  var products = [];
  try {
    products = await bcUtils.queryBlockchain("queryProductsByCustodian", [ req.params.id ]);
  } catch (error) {
    console.log("AssetError="+error);
  }
  res.status("200").type('application/json').send(products);
});


module.exports = router;
