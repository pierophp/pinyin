exports.up = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.string('provider', 30).defaultTo('google');
  });
};

exports.down = function(knex, Promise) {};
