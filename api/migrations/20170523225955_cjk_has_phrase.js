exports.up = function(knex, Promise) {
  return knex.schema.createTable('cjk_has_phrase', function(table) {
    table
      .integer('cjk_id')
      .notNullable()
      .unsigned()
      .index();
    table
      .integer('phrase_id')
      .notNullable()
      .unsigned()
      .index();
    table.primary(['cjk_id', 'phrase_id']);
  });
};

exports.down = function(knex, Promise) {};
