exports.up = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.boolean('admin');
  });
};

exports.down = function(knex, Promise) {};
