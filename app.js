'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

const swaggerSecurityHandlers = require(__dirname+'/api/auth/swaggerSecurityHandlers');

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: swaggerSecurityHandlers
};

// For Swagger UI Express
const jsyaml    = require('js-yaml');
const path      = require("path");
const fs        = require('fs');
const swaggerUi = require('swagger-ui-express');
// Read Swagger-API-Spec as YAML and convert it to a JavaScript object:
const swaggerSpec = jsyaml.safeLoad(fs.readFileSync(path.join(__dirname, './api/swagger/swagger.yaml'), 'utf8'));

// Initialize sequelize and swagger-sequelize:
const swaggerSequelize = require("./api/models/swaggerSequelize");

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  // For Swagger UI Express
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // // Serve the Swagger documents on URL-endpoint /api-docs 
  // // and the new Swagger UI at URL-endpoit /docs
  // // through "swagger-express-mw" -> "swagger-node-runner" -> "swagger-tools"
  // app.use(swaggerExpress.runner.swaggerTools.swaggerUi( {swaggerUiDir: "node_modules/swagger-ui/dist" } ));
  // // A `npm i -S swagger-ui@2.2.10` is needed for the options `{swaggerUiDir: "swagger-ui/dist" }`

  var port = process.env.PORT || 10010;
  app.listen(port);

  console.log('Server fired up on http://localhost:' + port);
  console.log("===================================================");
});
