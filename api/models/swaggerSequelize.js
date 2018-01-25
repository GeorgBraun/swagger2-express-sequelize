'use strict';

const Sequelize = require('sequelize');
const swaggerSequelize = require('swagger-sequelize');
const fs        = require('fs');
const jsyaml    = require('js-yaml');
const path      = require("path");

// For Sequelize with SQLite:
const sequelizeOptions = {
  dialect: 'sqlite', 
  storage: './db.sqlite', 
  operatorsAliases: false
};

const sequelize = new Sequelize(
                       /*database*/ null,
                       /*username*/ null, 
                       /*password*/ null, 
                       /*options */ sequelizeOptions);
swaggerSequelize.setDialect(sequelize.options.dialect);

// Read Swagger-API-Spec as YAML and convert it to an object:
const swaggerSpec = jsyaml.safeLoad(fs.readFileSync(path.join(__dirname, '../swagger/swagger.yaml'), 'utf8'));

module.exports = {
  sequelize,
  swaggerSequelize,
  swaggerSpec
};
