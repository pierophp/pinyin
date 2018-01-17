exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.integer('hsk');
  });
};

exports.down = function(knex, Promise) {};
