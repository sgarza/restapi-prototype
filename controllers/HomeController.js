var path = require('path');
var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

var HomeController = Class('HomeController').inherits(BaseController)({
  beforeActions : [
    {
      before : function(req, res, next) {
        var api = new RESTFulAPI({
          req: req,
          queryBuilder : User.query(),
          pagination : {
            perPage : 50
          },
          filters : {
            allowedFields : ['name', 'id']
          },
          order : '-createdAt'
        });

        api.build().then(function(result) {
          res.locals.result = result;
          return next();
        }).catch(next);
      },
      actions : ['rest']
    }
  ],
  prototype : {
    index : function(req, res, next) {
      res.render('home/index.html')
    },

    rest : function(req, res, next) {
      res.json(res.locals.result);
    }
  }
});

module.exports = new HomeController();
