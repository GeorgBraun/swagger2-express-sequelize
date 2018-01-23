'use strict';

// Begin swagger-sequelize
// An dieser Stelle UNSCHÖN, aber es funktioniert.
var swaggerSequelize = require('swagger-sequelize');
var fs        = require('fs');
var Sequelize = require('sequelize');
var yaml      = require('js-yaml');
var path      = require("path");
// var env       = process.env.NODE_ENV || "development";
// var config    = require(path.join(__dirname, './sequelize_config', 'sequelize_config.json'))[env];
// console.log("=======================config======================");
// console.log(config);
// console.log("===================================================");

// Für SQLite:
const sequelize = new Sequelize(/*database*/ undefined, /*username*/ undefined, /*password*/ undefined, { dialect: 'sqlite', storage: './db.sqlite', operatorsAliases: false });

// Read Swagger-API-Spec as YAML and convert it to Object:
const swaggerSpec = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../../api/swagger/swagger.yaml'), 'utf8'));
//var swaggerSpec = JSON.parse(fs.readFileSync(__dirname + '/../../api/swagger/swagger.json', 'utf-8'));

swaggerSequelize.setDialect('sqlite');

// ORM für "Document" einrichten:
var DocumentModel =  sequelize.define('Document', swaggerSequelize.generate(swaggerSpec.definitions.Document));
console.log("===================================================");

// ... do stuff with MyModel e.g. to setup your tables:
DocumentModel.sync({force: false})
.then(() => { console.log("==================================================="); });
// End swagger-sequelize

module.exports = {
  create,
  readAll,
  readById,
  deleteById,
  updateOrCreate,
  updateById
};
  
function create(req, res) {
  const newDocument = req.body;
  console.log("Controller: documents.js; Function: create() mit newDocument:");
  console.log(newDocument);

  // HIER: Datenbank-aufruf
  DocumentModel.create(newDocument).then( (createdDocument) => {
    res.status(201).json(createdDocument);
  });
}

function readAll(req, res) {
  console.log("Controller: documents.js; Function: readAll()");
  DocumentModel.findAll().then( (documents) => {
    console.log("Controller: documents.js; Function: readAll(): Liefere Array mit",documents.length,"Elementen.");
    res.json(documents);
  });
}

function readById(req, res) {
  const id = req.swagger.params.id.value;
  console.log("Controller: documents.js; Function: readById() mit id:", id);
  // Search document with provided id:
  DocumentModel
    .findById(id) /* Allgemeine Suche: .find( { where: { id: id } } ) */
    .then( (result) => {
      if(result==null) {
        // Document with id could not be found
        console.log("Controller: documents.js; Function: readById() mit id:", id, "konnte NICHT gefunden werden.");
        res.status(404).json({message:"The requested document with id "+id+" could not be found. Please try another id."});
      } else {
        console.log("Controller: documents.js; Function: readById(): Liefere Objekt");
        console.log(result.dataValues);
        res.json(result);
      }
    })
    .catch( (error) => {
      console.error("Controller: documents.js; Function: readById(): FEHLER");
      console.error(error);
    });
}

function deleteById(req, res) {
  const id = req.swagger.params.id.value;
  console.log("Controller: documents.js; Function: deleteById() mit id:", id);
  DocumentModel
    .destroy( { where: { id: id } })
    .then( (destoryedCount) => {
      if(destoryedCount==0) {
        // Es wurde nichts gelöscht
        console.log("Controller: documents.js; Function: deleteById() mit id:", id, "konnte NICHT gefunden werden.");
        res.status(404).json({message:"The requested document with id "+id+" could not be found and is not deleted. Please try another id."});
      } else {
        // Es wurde gelöscht
        console.log("Controller: documents.js; Function: deleteById(): Anzahl der gelöschten Objekte: "+destoryedCount);
        res.json({ success:destoryedCount, description:"Document with id "+id+" is deleted." });
      }
    });

  // // Search document with provided id:
  // DocumentModel
  //   .findById(id) /* Allgemeine Suche: .find( { where: { id: id } } ) */
  //   .then( (result) => {
  //     if(result==null) {
  //       // Document with id could not be found
  //       console.log("Controller: documents.js; Function: deleteById() mit id:", id, "konnte NICHT gefunden werden.");
  //       res.status(404).json({message:"The requested document with id "+id+" could not be found. Please try another id."});
  //     } else {
  //       console.log("Controller: documents.js; Function: deleteById(): Lösche Objekt");
  //       console.log(result.dataValues);
  //       result.destroy();
  //       res.json({ success:1, description:"Document with id "+id+" is deleted." });
  //     }
  //   })
  //   .catch( (error) => {
  //     console.error("Controller: documents.js; Function: readById(): FEHLER");
  //     console.error(error);
  //   });
}

function updateOrCreate(req, res) {
  const reqId = req.swagger.params.id.value;
  const reqDocument = req.body;
  console.log("Controller: documents.js; Function: updateOrCreate() mit reqDocument:");
  console.log(reqDocument);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});
  DocumentModel
    .findOrCreate( { where: { id: reqId }, defaults: reqDocument })
    .spread( (document, created) => {
      if(created) {
        // Neues Document wurde erzeugt, aber vermutlich mit falscher id:
        let createdId = document.id;
        if(createdId===reqId) {
          console.log("createdId AND reqId: "+createdId);
          // Status code 201: Successfully created
          console.log("Controller: documents.js; Function: updateOrCreate(), neues document wurde erzeugt:");
          console.log(document.dataValues);
          res.status(201).json(document);
        } else {
          console.warn("createdId:"+createdId+" BUT reqId:"+reqId);
          // To change the id, document.updateAttributes() is not enough.
          // We need DocumentModle.update() for this:
          DocumentModel.update({id:reqId}, {where: {id:createdId}}).then( (affectedRowsCount) => {
            if(affectedRowsCount>0) {
              // Success: id has been changed. Need to read latest values from data base:
              DocumentModel
              .findById(reqId) /* Allgemeine Suche: .find( { where: { id: reqId } } ) */
              .then( (result) => {
                if(result==null) {
                  // PROBLEM: Id could not be updated, even though affectedRowsCount indicates, it is:
                  throw new Error("ERROR in updateOrCreate(): New document with id "+createdId+" should have been updated to new id "+reqId+", but is not ...");
                } else {
                  // Status code 201: Successfully created (and updated)
                  console.log("Controller: documents.js; Function: updateOrCreate(), neues document wurde erzeugt, id wurde korrigiert:");
                  console.log(result.dataValues);
                  res.status(201).json(result);
                }
              })
            } else {
              // PROBLEM: Id could not be updated!
              throw new Error("ERROR in updateOrCreate(): New document with id "+createdId+" could not be updated to new id "+reqId);
            }
          })
        }
      } else {
        // Document wurde gefunden. Jetzt muss es noch aktualisiert werden:
        document.updateAttributes(reqDocument).then( (updatedDocument) => {
          // Status Code 200: Successfully updated
          console.log("Controller: documents.js; Function: updateOrCreate(), existierendes document wurde geändert:");
          console.log(updatedDocument.dataValues);
          res.json(updatedDocument);        
        });
      }
    })
}

function updateById(req, res) {
  const reqId = req.swagger.params.id.value;
  const reqDocument = req.body;
  console.log("Controller: documents.js; Function: updateById() mit reqId "+reqId+" und reqDocument:");
  console.log(reqDocument);
  //res.status(501).json({message:"NOT YET IMPLEMENTED"});

  DocumentModel
    .findById(reqId) /* Allgemeine Suche: .find( { where: { id: id } } ) */
    .then( (foundDocument) => {
      if(foundDocument==null) {
        // Document with reqId could not be found
        console.log("Controller: documents.js; Function: updateById() mit reqId:", reqId, "konnte NICHT gefunden werden.");
        res.status(404).json({message:"The requested document with id "+reqId+" could not be found. Please try another id."});
      } else {
        foundDocument.updateAttributes(reqDocument).then( (updatedDocument) => {
          // Status Code 200: Successfully updated
          console.log("Controller: documents.js; Function: updateById(), existierendes document wurde geändert:");
          console.log(updatedDocument.dataValues);
          res.json(updatedDocument);        
        });
      }
    })
}
