var express = require('express');
var router = express.Router();
var axios = require("axios");
//var net = axios.create({ baseURL: "http://localhost:3000" });
var net = axios.create({ baseURL: "http://129.213.60.1:3100" });
var xmljs = require('xml-js');
var uniqid = require('uniqid');
var Promise = require("Promise");

const PREFIX = "users-";
var cache = require('persistent-cache');
var cats = cache({base: 'users'});


exports.Utils = (function () {


  function userExists(username) {
    var user = getUser( username );
    return (user != null);
  }

  function login(username, password) {
    var user = getUser( username );
    if(user) {
      if( user.password == password ) {
        return user;
      } else {
        return { error : "Password Incorrect." };
      }
    } else {
      return { error : "User not found." };
    }
  }

  function getUser(username) {
    return cats.getSync(PREFIX+username);
  }

  function saveUser(user) {
    cats.putSync(PREFIX+user.username,user);
  }

  function getAllUsers() {
    var userList = [];
    var keys = cats.keysSync();
    console.log("USERUTIL::keys="+JSON.stringify(keys));
    for( i=0; i<keys.length; i++ ) {
      console.log("USERUTIL::keys[i]="+keys[i]);
      userList.push( cats.getSync(keys[i]) );
    }
    return userList;
  }

  function saveUsers(userList) {
    for( i=0; i<userList.length; i++ ) {
      saveUser( userList[i] );
    }
    return "Loaded "+userList.length+" users";
  }


  function createUserObject(username, password, fullname, role, truckid, orgname, orgicon) {
    var userObj = {
      "$class": "com.oraclex.scm.User",
      "username": username.toLowerCase(),
      "password": password,
      "fullname": fullname,
      "role": role.toUpperCase(),
      "truckid": truckid,
      "orgname": orgname,
      "orgicon": orgicon
    };
    return userObj;
  }


  function createUserJSON(userArgs) {
    var userObj = userArgs;
    userObj.$class = "com.oraclex.scm.User";
    userObj.username = userObj.username.toLowerCase();
    userObj.role = userObj.role.toUpperCase();
    return userObj;
  }


  function findUniqueUsername(username) {
    if( getUser(username) ) {
      var mIdx = 0;
      while ( getUser(username+mIdx) ) {
        mIdx++;
      }
      username = username+mIdx;
    }
    return username;
  }



  return {
    getUser: getUser,
    saveUser: saveUser,
    getAllUsers: getAllUsers,
    saveUsers: saveUsers,
    userExists: userExists,
    createUserObject: createUserObject,
    createUserJSON: createUserJSON,
    findUniqueUsername: findUniqueUsername,
    login: login
  }
})();
