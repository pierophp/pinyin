exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.dropIndex('ideogram');
    table.unique('ideogram');
  });
};

exports.down = function(knex, Promise) {};
