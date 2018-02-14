exports.up = function(knex, Promise) {
  return knex.schema.table('my_cjk', function(table) {
    table
      .integer('cjk_id')
      .nullable()
      .unsigned()
      .alter();
  });
};

exports.down = function(knex, Promise) {};
