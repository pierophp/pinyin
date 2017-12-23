exports.up = function(knex, Promise) {
  return knex.schema.table('my_cjk', function(table) {
    table.unique(['user_id', 'cjk_id']);
  });
};

exports.down = function(knex, Promise) {};
