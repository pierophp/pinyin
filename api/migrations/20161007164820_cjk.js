exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.json('measure_words');
  });
};

exports.down = function(knex, Promise) {};
