var User = Class('User').inherits(Krypton.Model)({
  tableName : 'Users',
  attributes : ['id', 'name', 'createdAt', 'updatedAt'],
  prototype : {}
});

module.exports = User;
