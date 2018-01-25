# Beginner's Tutorial: RestAPI with Swagger, Express, Sequelize and SQLite

The following links provide a step-by-step tutorial to develop the document server of this project from scratch and your own.

* [Part 1: A new Swagger Project](./tut1-new-project.md)
* [Part 2: Start your own API](./tut2-start-your-own-api.md)
* [Part 3: Add Swagger UI](./tut3-add-swagger-ui.md)
* [Part 4: Add a Database](./tut4-add-database.md)
* [Part 5: Remaining Endpoints and Request-Handler](./tut5-remaining.md)

<!-- 

## Add additional Modules

Add Sequelize and SQLite3:

```
npm install --save sequelize
npm install --save sqlite3
```

Add Swagger-Sequelize and js-yaml

```
npm install --save swagger-sequelize
npm install --save js-yaml
```

Swagger-Sequelize is needed to auto-generate the Sequelize-Definitions from the Swagger file.

js-yaml is needed to read the Swagger YAML file and parse it into a JavaScript Object.


Add Swagger UI Express: This allows you to exercise the API without running the Swagger Editor Server

```
npm install --save swagger-ui-express
```


Patch von **swagger-sequelize**:

In Datei `node_modules/swagger-sequelize/index.js` die Funktion `generate()` erweitern von:

```JavaScript
function generate (schema) {
	//poor mans deep-clone
	var result = JSON.parse(JSON.stringify(schema.properties));

	Object.keys(result).forEach((propertyName) => {
		var propertySchema = result[propertyName];
		propertySchema.type = getSequalizeType(propertySchema);
		if (propertySchema.default) {
			propertySchema.defaultValue = propertySchema.default;
		}
	});

	return result;
}
```

nach

```JavaScript
function generate (schema) {
	//poor mans deep-clone
	var result = JSON.parse(JSON.stringify(schema.properties));

	Object.keys(result).forEach((propertyName) => {
		var propertySchema = result[propertyName];
		// BEGIN: Promote Attribute to primaryKey with autoIncrement
		if(propertySchema["x-primary-key"]==true) {
			propertySchema.primaryKey = true;
			propertySchema.autoIncrement = true;
		}
		// END: Promote Attribute to primaryKey with autoIncrement

		propertySchema.type = getSequalizeType(propertySchema);
		if (propertySchema.default) {
			propertySchema.defaultValue = propertySchema.default;
		}
	});

	return result;
}
```


## Documentation Ressources

* HTTP and RestAPIs:
  * REST API Quick Tips: http://www.restapitutorial.com/lessons/restquicktips.html
  * Using HTTP Methods for RESTful Services: http://www.restapitutorial.com/lessons/httpmethods.html
  * Resource Naming: http://www.restapitutorial.com/lessons/restfulresourcenaming.html
  * HTTP Status Codes: http://www.restapitutorial.com/httpstatuscodes.html
* Swagger
  * HomePage: https://swagger.io/
  * Swagger 2.0 documentation: https://swagger.io/docs/specification/2-0/basic-structure/
* Sequelize
  * Documenation: http://docs.sequelizejs.com/
  * GitHub: https://github.com/sequelize/sequelize.git
-->
