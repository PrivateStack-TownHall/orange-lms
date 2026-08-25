const authentication = require("./authentication");

const authorization = require("./authorization");

const ErrorHandling = require("./ErrorHandling");

const upload = require("./multer");

module.exports = { authentication, authorization, ErrorHandling, upload };
