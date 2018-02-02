// The following URLs have been used to build this:
// * Please add example how to implement security handler:
//     https://github.com/swagger-api/swagger-node/issues/228
// * JWT security and scopes - my working solution:
//     https://github.com/swagger-api/swagger-node/issues/481
// * Why the security handler function does not have (rq, res, next) signature:
//     https://github.com/apigee-127/swagger-tools/issues/203 ganz unten.
// * response object in swagger security:
//     https://github.com/apigee-127/swagger-tools/issues/214

// A quite interesting source file: node_modules/swagger-tools/middleware/swagger-security.js
// And a minimum of documentation: https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-security

// To enable debug-output, see https://github.com/apigee-127/swagger-tools/blob/master/docs/Middleware.md#swagger-middleware-debugging

module.exports = {
  // The following method name 'UserSecurity' needs to be identical 
  // to the 'securityDefinitions' entry inside swagger.yaml: 
  UserSecurity: (req, authOrSecDef, scopesOrApiKey, callback) => {
    console.log('======> auth:',req.headers.authorization);
    console.log('======> authOrSecDef:',authOrSecDef);
    console.log('======> scopesOrApiKey:',scopesOrApiKey);

    if(scopesOrApiKey=="ttt") {
      // Auth is okay, therefore continue...
      callback();
    } else {
      // Auth is not okay. Respond with error status code...
      // cb(new Error('access denied!')); // Erzeugt Fehler "Error: Can't set headers after they are sent."
      // Source: https://github.com/apigee-127/swagger-tools/issues/203 at the bottom:
      req.res.status(403).json( { message: 'Invalid token' } );
      //req.res.end();
    }
  }
}
