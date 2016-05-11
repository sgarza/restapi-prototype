var path = require('path');

// Custom Errors
global.NotFoundError = function NotFoundError(message) {
  this.name = 'NotFoundError';
  this.message = message || 'Not Found';
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

// Load LithiumEngine
if (CONFIG[CONFIG.environment].enableLithium) {
  require(path.join(process.cwd(), 'lib', 'LithiumEngine.js'));
}

// Load RouteMapper
CONFIG.router = require(path.join(process.cwd(), 'config', 'routeMapper.js'));

// Comment the following 2 lines to disable database access
var knex = require('knex')(CONFIG.database[CONFIG.environment]);

knex.on('query', function(data) {
  console.log(data)
});

Krypton.QueryBuilder.prototype.page = function(page, pageSize) {
  return this.range(page * pageSize, (page + 1) * pageSize - 1);
}

Krypton.QueryBuilder.prototype.range = function(start, end) {
  return this
    .limit(end - start + 1)
    .offset(start)
}

Krypton.Model.knex(knex); // Bind a knex instance to all Krypton Models
