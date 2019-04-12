var express = require('express');
var router = express.Router();
var axios = require("axios");
var net = axios.create({ baseURL: "http://soa.wedoteam.io" });
var Promise = require("Promise");
var qrGen = require('qr-image');


router.get('/:id', function (req, res) {
  res.writeHead(200, {'Content-Type': 'image/png' });
  var qrOut = qrGen.image(req.params.id, { type: 'png' });
  qrOut.pipe(res);
})


router.route('/:id/printLabel').get(function (req, res) {
  var id = req.params.id;
  var payload = {
    "ImageURL"  : "http://infra.wedoteam.io:3005/qr/"+id,
    "dataFormat" : ".png",
    "ProductId" : id
  };
  console.log("** ABOUT TO PRINT **");
  return net({
      method: "post",
      url: "/wedoindustry/printer/print/MADRID",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: payload
  })
  .then((http) => {
      res.status(http.status).send(http.data);
  })
  .catch((http) => {
      try {
          var err = http.response.data.error.message.split('Error: ').reverse()[0].split(")")[0];
          res.status(500).send({ 'error': err });
      } catch (er) {
          res.status(500).send({ 'error': 'there are problems' });
      }
  });
});



module.exports = router;
