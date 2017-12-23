exports.up = function(knex, Promise) {
  return knex.schema.createTable('tmp_phrase', function(table) {
    table.increments();
    table.text('phrase');
    table.text('pronunciation');
    table.string('provider', 100);
    table
      .integer('language_id')
      .notNullable()
      .unsigned()
      .index()
      .references('language.id');
    table
      .integer('provider_id')
      .notNullable()
      .unsigned()
      .index();
    table.dateTime('provider_created_at');
    table.dateTime('provider_updated_at');
    table.timestamps();
    table.unique(['provider', 'provider_id', 'language_id']);
  });
};

exports.down = function(knex, Promise) {};
