"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.createServer = exports.Utils = void 0;
exports.Utils = require("utils");
var server_1 = require("server");
Object.defineProperty(exports, "createServer", { enumerable: true, get: function () { return server_1.createShareable; } });
var client_1 = require("client");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return client_1.createClient; } });
