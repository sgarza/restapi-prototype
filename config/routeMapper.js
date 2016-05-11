var routeMapper = new RouteMapper();;

routeMapper
  .root('Home#index')
  .get('/rest', { to: 'Home#rest' })

module.exports = routeMapper;
