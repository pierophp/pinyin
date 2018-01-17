exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.boolean('simplified').nullable();
    table.boolean('traditional').nullable();
    table.json('variants').nullable();
  });
};

exports.down = function(knex, Promise) {};
