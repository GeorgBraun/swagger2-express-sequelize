# Beginner's Tutorial - Part 3: Add Swagger UI

The **_Swagger Editor_** is great during development: You can edit your specification YAML file and imediately see the impact on the RestAPI via the integrated graphical user interface on the right half of the window.

During production, you usually do **not** want to provide editing capabilities for the specification of your server. Therefore, you usually do not start _Swagger&nbsp;Editor_. 

In order to still have a nice UI which explains your API and allows you to exercise it, we need to add the **_Swagger UI_** to the project:

```
npm install --save swagger-ui-express
npm install --save js-yaml
```

<!-- This increases the footprint of your project on your hard drive from 22.9&nbsp;MByte to 37.5&nbsp;MByte. -->

Open file `app.js`. After 

```js
var config = {
  appRoot: __dirname // required config
};
```

add the following lines:

```js
// For Swagger UI Express
const jsyaml    = require('js-yaml');
const path      = require("path");
const fs        = require('fs');
const swaggerUi = require('swagger-ui-express');
// Read Swagger-API-Spec as YAML and convert it to a JavaScript object:
const swaggerSpec = jsyaml.safeLoad(fs.readFileSync(path.join(__dirname, './api/swagger/swagger.yaml'), 'utf8'));
```

In addition, after

```js
  // install middleware
  swaggerExpress.register(app);
```

add the following two lines:

```js
  // For Swagger UI Express
  app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

