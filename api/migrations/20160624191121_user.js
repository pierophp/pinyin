exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', function(table) {
    table.increments();
    table.string('name');
    table.string('email', 100);
    table.unique('email');
    table.string('profile_id', 180);
    table.unique('profile_id');
    table.string('token');
    table.index('token');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {};
