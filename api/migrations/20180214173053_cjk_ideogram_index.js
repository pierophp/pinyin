exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.index('ideogram');
  });
};

exports.down = function(knex, Promise) {};
