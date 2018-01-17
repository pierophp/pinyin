exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.dropUnique('ideogram');
    table.unique(['ideogram', 'pronunciation']);
  });
};

exports.down = function(knex, Promise) {};
