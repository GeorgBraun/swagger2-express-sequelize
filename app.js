'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

// Für Swagger UI Express
const yaml      = require('js-yaml');
const path      = require("path");
const fs        = require('fs');
const swaggerUi = require('swagger-ui-express');
// Read Swagger-API-Spec as YAML and convert it to Object:
const swaggerSpec = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './api/swagger/swagger.yaml'), 'utf8'));

// For sequelize:
const mySequelize = require("./api/models/swaggerSequelize");

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  // Für Swagger UI Express
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  var port = process.env.PORT || 10010;
  app.listen(port);

  console.log('Server fired up on http://localhost:' + port);
  console.log("===================================================");
});
