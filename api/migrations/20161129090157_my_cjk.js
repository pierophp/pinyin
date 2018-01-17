exports.up = function(knex, Promise) {
  return knex.schema.createTable('my_cjk', function(table) {
    table.increments();
    table
      .integer('cjk_id')
      .notNullable()
      .unsigned()
      .index()
      .references('cjk.id');
    table
      .integer('user_id')
      .notNullable()
      .unsigned()
      .index()
      .references('user.id');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {};
