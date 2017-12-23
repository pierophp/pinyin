exports.up = function(knex, Promise) {
  return knex.schema.createTable('tmp_phrase_reference', function(table) {
    table
      .integer('from_phrase_id')
      .notNullable()
      .unsigned()
      .index();
    table
      .integer('to_phrase_id')
      .notNullable()
      .unsigned()
      .index();
    table.primary(['from_phrase_id', 'to_phrase_id']);
  });
};

exports.down = function(knex, Promise) {};
