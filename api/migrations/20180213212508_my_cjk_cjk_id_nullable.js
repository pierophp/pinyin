exports.up = function(knex, Promise) {
  return knex.schema.table('my_cjk', function(table) {
    table
      .integer('cjk_id')
      .nullable()
      .unsigned()
      .references('cjk.id')
      .alter();
  });
};

exports.down = function(knex, Promise) {};
