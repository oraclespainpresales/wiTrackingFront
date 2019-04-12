var express = require('express');
var router = express.Router();
var userUtils = require('./LocalUserHelper').Utils;


router.post('/', function (req, res) {
  var username = userUtils.findUniqueUsername(req.body.username);
  var userArgs = req.body;
  userArgs.username = username;
  var newUser = userUtils.createUserJSON(userArgs);
  userUtils.saveUser(newUser);
  res.status(200).send(JSON.stringify(newUser));
})

router.put('/', function (req, res) {
  var newUser = userUtils.createUserJSON(req.body);
  userUtils.saveUser(newUser);
  res.status(200).send(JSON.stringify(newUser));
})

router.get('/:id/setTransport/:transportId/', function (req, res) {
  var user = userUtils.getUser(req.params.id.toLowerCase());
  user.truckid = req.params.transportId;
  userUtils.saveUser(user);
  res.status(200).send(JSON.stringify(user));
})

router.post('/bak', function (req, res) {
  var username = userUtils.findUniqueUsername(req.body.username);
  var newUser = userUtils.createUserObject(username, req.body.password, req.body.fullname,
    req.body.role, req.body.truckid, req.body.orgname, req.body.orgicon);
  userUtils.saveUser(newUser);
  res.status(200).send(JSON.stringify(newUser));
})

router.put('/bak', function (req, res) {
  var newUser = userUtils.createUserObject(req.body.username, req.body.password, req.body.fullname,
    req.body.role, req.body.truckid, req.body.orgname, req.body.orgicon);
  userUtils.saveUser(newUser);
  res.status(200).send(JSON.stringify(newUser));
})

router.get('/:id', function (req, res) {
  var user = userUtils.getUser(req.params.id.toLowerCase());
  if(user) {
    res.status(200).send(JSON.stringify(user));
  } else {
    res.status(404).end();
  }
})

router.post('/login', function (req, res) {
  var username = req.body.username.toLowerCase();
  var password = req.body.password;
  var user = userUtils.login( username, password );
  if(user.error) {
    res.status(401).send(user.error);
  } else {
    res.status(200).send(JSON.stringify(user));
  }
})
router.post('/export', function (req, res) {
  var userList = userUtils.getAllUsers();
  //console.log("USERS.EXPORT::USERLIST="+JSON.stringify(userList));
  if(userList && userList.length>0) {
    res.status(200).send(JSON.stringify(userList));
  } else {
    res.status(401).send("Error exporting users");
  }
})

router.post('/import', function (req, res) {
  try {
    var userList = req.body;
    //console.log("USERS.IMPORT::USERLIST="+JSON.stringify(userList));
    var ret = userUtils.saveUsers(userList);
    res.status(200).send(ret);
  } catch( err ) {
    res.status(401).send("Error importing users = "+err);
  }
})

module.exports = router;
