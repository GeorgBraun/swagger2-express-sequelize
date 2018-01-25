# Beginner's Tutorial - Step 4: Add a Database

For the sake of simplicity, this project uses SQLite3. It comes with a local database file which is used solely by this project. It does not require any database installation like MySQL, MariaDB or PostgreSQL.

When working with a database, you usually have two options:
* Use the database directly via SQL commands.
* Use an Object Relational Management (ORM) library that offers you plain JavaScript objects and methods to interact with the database. The SQL stuff is done by the libary behind the scenes.

This project uses the ORM "Sequelize". This library is of great help because you can interact with the database without a need to learn SQL.

But even with an ORM like **_Sequelize_**, you need to define the columns of your tables and map them to the properties of your objects. If we do this, we have two different sources for out data structure:
1. The properties of our documents in the API is defined by the Swagger specification file `swagger.yaml`
1. The columns of our documents in the database is defined the ORM configuration.

Such a setup may turn out to be quite dangerous: If you add a property in the API specification, you need to remember to add it to the database as well.

To mitigate such risk, we need to automatically adjust the columns of the document database to the Swagger specification file: If we add or remove properties in the API spec, the corresponding columns should be added or removed automatically in the database, too.

Luckily, there is a node module "Swagger-Sequelize" which takes care of this.


## Node Modules for your Database

Execute the following commands in a terminal within your project folder:

```
npm install --save sequelize
npm install --save sqlite3
npm install --save swagger-sequelize
npm install --save js-yaml
```

This adds the following modules to your project:
* sequelize: An ORM that supports MySQL, SQLite, PostgreSQL and MSSQL (details: http://docs.sequelizejs.com)
* sqlite3: Bindings and binaries for SQLite3 for most Node versions and platforms (details at https://github.com/mapbox/node-sqlite3 are not really relevant since SQLite3 is hidden behind Sequelize)
* swagger-sequelize: Automatically adjust the database columns in Sequelize to the data models defined in the Swagger specification file (details: https://github.com/kingsquare/swagger-sequelize)
* js-yaml: Helper library to allow swagger-sequelize to import Swagger specification file in YAML format rather than JSON format (details: https://github.com/nodeca/js-yaml)


## Setting up Sequelize and Swagger-Sequelize

Create a new folder `api/models` and a new file `api/models/swaggerSequelize.js` with the following content:

```js
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
```

To use Sequelize and Swagger-Sequelize modify file `app.js` as follows:

Before the line

```js
SwaggerExpress.create(config, function(err, swaggerExpress) {
```

add the following two lines

```js
// Initialize sequelize and swagger-sequelize:
const swaggerSequelize = require("./api/models/swaggerSequelize");
```

... to be continued ...
