
exports.up = function(knex, Promise) {
  return knex.schema.createTable('Users', function(t) {
    t.increments('id');
    t.string('name');
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('Users');
};
