exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.string('type');
    table.index('type');
  });
};

exports.down = function(knex, Promise) {};
