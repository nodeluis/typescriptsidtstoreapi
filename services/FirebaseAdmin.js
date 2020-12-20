"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var serviceAccount = require("../mercadoxpress-abe77-firebase-adminsdk-1h4ev-392da77afa.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mercadoxpress-abe77.firebaseio.com"
});
exports.default = admin;
