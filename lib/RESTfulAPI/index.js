var _ = require('lodash');

var RESTFulAPI = Class({}, 'RESTFulAPI')({

  OPERATORS : {
    '$eq' : '=',
    '$ne' : '<>',
    '$lt' : '<',
    '$lte' : '<=',
    '$gt' : '>',
    '$gte' : '>=',
    '$in' : 'IN',
    '$nin' : 'NOT IN',
    '$like' : 'LIKE',
    '$ilike' : 'ILIKE'
  },
  OPERATORS_KNEX : {
    '$and' : 'where',
    '$or' : 'orWhere'
  },

  prototype : {
    queryBuilder : null,
    req : null,

    paginate : null,
    order : null,
    filters : null,

    responseHeaders : null,

    init : function(config) {
      this.paginate = {
        perPage : 50
      }

      this.filters = {
        allowedFields : []
      }

      Object.keys(config || {}).forEach(function (propertyName) {
          this[propertyName] = config[propertyName];
      }, this);

      this.responseHeaders = {};

      return this;
    },

    _buildOrder : function() {
      if (this.req.query && this.req.query.order) {
        var order = this.req.query.order;
        var dir, field;

        if (order.indexOf('-') === 0) {
          dir = 'DESC';
          field = order.substr(1, order.length - 1);
        } else {
          field = order;
          dir = 'ASC';
        }

        this.queryBuilder.orderBy(field, dir);
      }

      return this;
    },

    _buildFilter : function() {
      var filterBuilder = this._applyFilterToKnex(this.req.query.filters || {});

      return this;
    },

    _applyFilterToKnex : function(query, parentKey) {
      var that = this;

      Object.keys(query).forEach(function(key) {
        var value = query[key];
        var methodName = that.constructor.OPERATORS_KNEX[key];

        if (methodName) {
          return that._applyFilterToKnex(value, key);  // key === '$and' || '$or'
        } else {
          if (_.isPlainObject(value)) {
            return that._applyFilterToKnex(value, key); // key === 'columnName'
          } else {
            var column,
              methodName,
              operator;

            if (parentKey) {
              if (that.constructor.OPERATORS_KNEX[key]) {
                methodName = parentKey;
                column = key;
              } else {
                if (that.constructor.OPERATORS[key]) {
                  operator = that.constructor.OPERATORS[key];
                  column = parentKey;

                } else {
                  methodName = that.constructor.OPERATORS_KNEX[parentKey];
                  column = key;
                }
              }
            }

            column = column || key;
            operator = operator || '=';
            methodName = methodName || 'where';

            if (_.includes(that.filters.allowedFields, column)) {
              that.queryBuilder[methodName](column, operator, value);
            }
          }
        }
      });
    },

    _buildPagination : function() {
      var that = this;
      var tempQueryBuilder = Object.create(this.queryBuilder);

      this.queryBuilder.page(_.parseInt(this.req.query.page) || 0, this.pagination.perPage);

      var queryMethodCalls = [];

      this.queryBuilder._queryMethodCalls.forEach(function(item) {
        if (item.method !== 'offset' && item.method !== 'limit' && item.method !== 'orderBy') {
          queryMethodCalls.push(item);
        }
      });

      tempQueryBuilder._queryMethodCalls = queryMethodCalls;

      return tempQueryBuilder
        .count('*')
        .then(function(result) {
          var totalCount = result[0].count
            that.responseHeaders.total_count = totalCount;

            var totalPages = _.parseInt(Math.round(totalCount / _.parseInt(that.pagination.perPage)));

            that.responseHeaders.total_pages = totalPages;

            return that.queryBuilder;
        })
    },

    build : function() {
      this._buildOrder()._buildFilter();

      return this._buildPagination().then(function(qb) {
        return qb;
      });
    }
  }
});

module.exports = RESTFulAPI;
