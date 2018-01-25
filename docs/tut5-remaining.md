# Beginner's Tutorial - Part 5: Remaining Endpoints and Request-Handler

To add the remaining URL-endpoints, open the file `api/swagger/swagger.yaml` and **replace its entire contents** with the following lines:

```yaml
swagger: "2.0"
info:
  version: "0.0.1"
  title: Document RestAPI
# during dev, should point to your local machine
host: localhost:10010
# basePath prefixes all resource paths 
basePath: /
# 
schemes:
  - http
# format of bodies a client can send (Content-Type)
consumes:
  - application/json
# format of the responses to the client (Accepts)
produces:
  - application/json
paths:
  /documents:
    x-swagger-router-controller: documents
    post:
      description: Add a new document
      operationId: create
      parameters:
        - name: newDocument
          description: Attributes of new document
          in: body
          required: true
          schema:
            $ref: "#/definitions/Document"
      responses:
        "201":
          description: Successfully created
          schema:
            $ref: "#/definitions/Document"
        default:
          $ref: "#/responses/ErrorResponse"
    get:
      description: Get all available documents
      operationId: readAll
      responses:
        "200":
          description: Success
          schema:
            type: array
            items:
              $ref: "#/definitions/Document"
        default:
          $ref: "#/responses/ErrorResponse"
  /documents/{id}:
    x-swagger-router-controller: documents
    get:
      description: Get a document by its ID
      operationId: readById
      parameters:
        - name: id
          description: Document id
          type: number
          in: path
          required: true
      responses:
        "200":
          description: Success
          schema:
            $ref: "#/definitions/Document"
        default:
          $ref: "#/responses/ErrorResponse"
    delete:
      description: Delete a document by its ID
      operationId: deleteById
      parameters:
        - name: id
          description: Document id
          type: number
          in: path
          required: true
      responses:
        "200":
          $ref: "#/responses/Response"
        default:
          $ref: "#/responses/ErrorResponse"
    put:
      description: Update an existing document by its ID or create a new one with the provided ID
      operationId: updateOrCreate
      parameters:
        - name: id
          description: Document id
          type: number
          in: path
          required: true
        - name: Document
          description: New properties of existing document or properties of new document
          in: body
          required: true
          schema:
            $ref: "#/definitions/Document"
      responses:
        "200":
          description: Successfully updated
          schema:
            $ref: "#/definitions/Document"
        "201":
          description: Successfully created
          schema:
            $ref: "#/definitions/Document"
        default:
          $ref: "#/responses/ErrorResponse"
    patch:
      description: Update some attributes of a document identified by its ID
      operationId: updateById
      parameters:
        - name: id
          description: Document id
          type: number
          in: path
          required: true
        - name: Document
          description: Only those attributes of existing document, that should change.
          in: body
          required: true
          schema:
            $ref: "#/definitions/DocumentOptional"
      responses:
        "200":
          description: Successfully updated
          schema:
            $ref: "#/definitions/Document"
        default:
          $ref: "#/responses/ErrorResponse"
  /swagger:
    x-swagger-pipe: swagger_raw
# complex objects have schema definitions
definitions:
  # Model definition for a Document
  Document:
    properties:
      # The Sequelize-ORM will add id, createdAt and updatedAt
      title:
        type: string
        description: Title of the document
      author:
        type: string
        description: Author of the document
      content:
        type: string
        description: Content of the document
    required:
      - title
      - author
      - content
  # Model definition for a Document with optional attributes (e.g. to patch some attributes)
  DocumentOptional:
    properties:
      title:
        type: string
        description: Title of the document
      author:
        type: string
        description: Author of the document
      content:
        type: string
        description: Content of the document
# response definitions:
responses:
  Response:
    description: Success
    schema:
      type: object
      properties:
        success:
          type: number
        description:
          type: string
      required:
        - success
        - description
  ErrorResponse:
    description: Error
    schema:
      required:
        - message
      properties:
        message:
          type: string

```

&nbsp;

You also need to open file `api/controllers/documents.js` and **replace its entire contents** with the following lines:

```js
'use strict';

// For sequelize and swagger-sequelize:
const swaggerSequelize = require("../models/swaggerSequelize");

// Setup Sequelize-ORM for "Document" based on Swagger API specification:
var DocumentModel =  swaggerSequelize.sequelize.define('Document', swaggerSequelize.swaggerSequelize.generate(swaggerSequelize.swaggerSpec.definitions.Document));

// Setup/sync database table:
// force: false => If table already exists, don't touch or update it.
// force: true  => Delete table if it exists. Then create a new table.
DocumentModel.sync({force: false})
.then(() => { console.log("==>> DocumentModel synched ====================================="); });


// Just for Reference: List of important http status codes:
// 200 OK
// 201 CREATED
// 204 NO CONTENT (Indicates success but nothing is in the response body, 
//                 often used for DELETE and PUT operations.)
// 400 BAD REQUEST (e.g. when data is missing or has wrong data type)
// 401 UNAUTHORIZED (e.g. missing or invalid authentication token)
// 403 FORBIDDEN (unlike a 401 Unauthorized response, 
//                authenticating will make no difference)
// 404 NOT FOUND
// 405 METHOD NOT ALLOWED (e.g. requested URL exists, but the requested 
//                         HTTP method is not applicable. The Allow HTTP 
//                         header must be set when returning a 405 to 
//                         indicate the HTTP methods that are supported.
// 409 CONFLICT (e.g. a resource conflict would be caused by fulfilling the request)
// 500 INTERNAL SERVER ERROR (given when no more specific message is suitable)
// 501 Not Implemented



// The following controller methods are exported to be used by the API:

module.exports.create = (req, res) => {
  console.time("<<<<<< create()"); // Start time measurement
  const reqDocument = req.body;
  console.log("\n>>>>>> create() in controller documents.js");
  console.log("reqDocument:", reqDocument);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});

  // Create a new document, put it into the database and respond with the newly created document:
  DocumentModel.create(reqDocument).then( (createdDocument) => {
    res.status(201).json(createdDocument);
    console.timeEnd("<<<<<< create()"); // End time measurement
  });
}


module.exports.readAll = (req, res) => {
  console.time("<<<<<< readAll()"); // Start time measurement
  console.log("\n>>>>>> readAll() in controller documents.js");
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});
  DocumentModel.findAll().then( (documents) => {
    console.log("Controller: documents.js; Function: readAll(): Responding with an array containing "+documents.length+" elements.");
    res.status(200).json(documents);
    console.timeEnd("<<<<<< readAll()"); // End time measurement
  });
}


module.exports.readById = (req, res) => {
  console.time("<<<<<< readById()"); // Start time measurement
  console.log("\n>>>>>> readById() in controller documents.js");
  const reqId = req.swagger.params.id.value;
  console.log("Requested id:", reqId);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});

  // Search document with provided reqId:
  DocumentModel
  .findById(reqId) /* Mor generic search .find( { where: { id: reqId } } ) */
  .then( (foundDocument) => {
    if(foundDocument==null) {
      // Document with reqId could not be found
      console.log("Document with requested id "+reqId+" could NOT be found.");
      res.status(404).json({message:"The requested document with id "+reqId+" could not be found. You may try another id."});
      console.timeEnd("<<<<<< readById()"); // End time measurement
    } else {
      console.log("Document with requested id "+reqId+" is found. Responding with object");
      console.log(foundDocument.dataValues);
      res.json(foundDocument);
      console.timeEnd("<<<<<< readById()"); // End time measurement
    }
  });
}


module.exports.deleteById = (req, res) => {
  console.time("<<<<<< deleteById()"); // Start time measurement
  console.log("\n>>>>>> deleteById() in controller documents.js");
  const reqId = req.swagger.params.id.value;
  console.log("Requested id:", reqId);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});

  DocumentModel
  .destroy( { where: { id: reqId } })
  .then( (destoryedCount) => {
    if(destoryedCount==0) {
      // Strange ... the document could not be deleted:
      console.log("Document with requested id "+reqId+" could NOT be deleted!");
      res.status(404).json({message:"The requested document with id "+reqId+" could not be deleted. You may try another id."});
      console.timeEnd("<<<<<< deleteById()"); // End time measurement
    } else {
      // Successfully deleted ...
      console.log("Document with requested id "+reqId+" is deleted! Number of deleted objects: "+destoryedCount);
      res.json( {
                  success: destoryedCount,
                  description: "Document with id "+reqId+" is deleted."
                });
      console.timeEnd("<<<<<< deleteById()"); // End time measurement
    }
  });
}


module.exports.updateOrCreate = (req, res) => {
  console.time("<<<<<< updateOrCreate()"); // Start time measurement
  console.log("\n>>>>>> updateOrCreate() in controller documents.js");
  const reqId = req.swagger.params.id.value;
  const reqDocument = req.body;
  console.log("Requested id:", reqId);
  console.log("Requested contents:", reqDocument);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});
  DocumentModel
  .findOrCreate( { where: { id: reqId }, defaults: reqDocument })
  .spread( (document, created) => {
    if(created) {
      // New document has been created, but most likely with wrong id:
      let createdId = document.id;
      if(createdId===reqId) {
        console.log("createdId AND reqId: "+createdId);
        // Status code 201: Successfully created
        console.log("New document has been created:", document.dataValues);
        res.status(201).json(document);
        console.timeEnd("<<<<<< updateOrCreate()"); // End time measurement
      } else {
        console.warn("createdId:"+createdId+" BUT reqId:"+reqId);
        // To change the id, document.updateAttributes() is not enough.
        // We need DocumentModle.update() for this:
        DocumentModel.update({id:reqId}, {where: {id:createdId}}).then( (affectedRowsCount) => {
          if(affectedRowsCount>0) {
            // Success: id has been changed. Need to read latest values from data base:
            DocumentModel
            .findById(reqId) /* Allgemeine Suche: .find( { where: { id: reqId } } ) */
            .then( (foundDocument) => {
              if(foundDocument==null) {
                // PROBLEM: Id could not be updated, even though affectedRowsCount indicates, it is:
                console.timeEnd("<<<<<< updateOrCreate()"); // End time measurement
                throw new Error("ERROR in updateOrCreate(): New document with id "+createdId+" should have been updated to new id "+reqId+", but is not ...");
              } else {
                // Status code 201: Successfully created (and updated)
                console.log("New document has been created, id has been corrected:", document.dataValues);
                console.log(foundDocument.dataValues);
                res.status(201).json(foundDocument);
                console.timeEnd("<<<<<< updateOrCreate()"); // End time measurement
              }
            })
          } else {
            // PROBLEM: Id could not be updated!
            console.timeEnd("<<<<<< updateOrCreate()"); // End time measurement
            throw new Error("ERROR in updateOrCreate(): New document with id "+createdId+" could not be updated to new id "+reqId);
          }
        })
      }
    } else {
      // Document has been found. Need to update:
      document.updateAttributes(reqDocument).then( (updatedDocument) => {
        // Status Code 200: Successfully updated
        console.log("Existing document has been updated:", updatedDocument.dataValues);
        res.json(updatedDocument);        
        console.timeEnd("<<<<<< updateOrCreate()"); // End time measurement
      });
    }
  });
}

module.exports.updateById = (req, res) => {
  console.time("<<<<<< updateById()"); // Start time measurement
  console.log("\n>>>>>> updateById() in controller documents.js");
  const reqId = req.swagger.params.id.value;
  const reqDocument = req.body;
  console.log("Requested id:", reqId);
  console.log("Requested contents:", reqDocument);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});

  DocumentModel
  .findById(reqId) /* More generic search would be: .find( { where: { id: id } } ) */
  .then( (foundDocument) => {
    if(foundDocument==null) {
      // Document with reqId could not be found
      console.log("Document with requested id "+reqId+" could NOT be found.");
      res.status(404).json({message:"The requested document with id "+reqId+" could not be found. You may try another id."});
      console.timeEnd("<<<<<< updateById()"); // End time measurement
    } else {
      foundDocument.updateAttributes(reqDocument).then( (updatedDocument) => {
        // Status Code 200: Successfully updated
        console.log("Existing document has been updated:", updatedDocument.dataValues);
        res.json(updatedDocument);        
        console.timeEnd("<<<<<< updateById()"); // End time measurement
      });
    }
  });
}

```

&nbsp;

Save both files. If the express server is still running, it will reload automatically. If not, start it with `swagger project start`.


Reload the **_Swagger&nbsp;UI_** in your browser and try all possible endpoints which are now available. Take a look at the debug outputs in the terminal and at the database file `db.sqlite`, e.g. with ["DB Browser for SQLite"](http://sqlitebrowser.org/).

## Where to go from here

Congratulations, you are done!

If you want, you can go back to the previous "[Part 4: Add a Database](./tut4-add-database.md)" or jump to the "[Beginner's Tutorial Overview Page](./tutorial.md)".
