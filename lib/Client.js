var assert = require("assert");
var _ = require("underscore");
var Promise = require('es6-promise').Promise;
var SocketClient = require("socket.io-client");

module.exports = Client;

function Client (host) {
  assert(host, "host required");
  this.socket = new SocketClient(host);
  this.waitingResponses = {};
  this.watchCallbacks = {};
  this.bindEvents();
}

Client.prototype = {

  bindEvents: function () {
    this.socket.on("connect", _.bind(this.onConnect, this));
    this.socket.on("response", _.bind(this.onResponse, this));
  },

  disconnect: function () {
    this.socket.disconnect();
  },

  onConnect: function () {
    console.log("Client connected");
  },

  call: function (methodName) {
    var self = this;
    var params = _.toArray(arguments).slice(1);
    return new Promise(function (resolve, reject) {
      var id = _.uniqueId("call-");
      self.waitingResponses[id] = function (data) {
        delete self.waitingResponses[id];
        if (data.error) {
          console.error("Socket client error", data.error);
          reject(data.error);
        } else {
          resolve(data.data);
        }
      };
      self.socket.emit("call", {id: id, methodName: methodName, params: params});
    });
  },
  onResponse: function (data) {
    if (this.waitingResponses[data.id]) {
      this.waitingResponses[data.id](data);
    } else {
      console.error("Response call without callback");
    }
  },
  watch: function watch ($scope, remoteKey, varName) {
    var self = this;
    this.socket.emit("watch", {key: remoteKey});
    var eventName = "watchUpdate:" + remoteKey;
    this.socket.on(eventName, function (data) {
      $scope.$apply(function () {
        $scope[varName] = data;
      });
    });
    $scope.$on("$destroy", function () {
      delete self.watchCallbacks[remoteKey];
      self.socket.off(eventName);
      self.socket.emit("stopWatch", {key: remoteKey});
    });
  }

};