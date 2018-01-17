exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.boolean('main');
  });
};

exports.down = function(knex, Promise) {};
