exports.up = function(knex, Promise) {
  return knex.schema.createTable('cjk', function(table) {
    table.increments();
    table.string('ideogram', 100);
    table.index('ideogram');
    table.string('pronunciation', 100).collate('utf8_bin');
    table.index('pronunciation');
    table.string('pronunciation_unaccented', 100);
    table.index('pronunciation_unaccented');
    table.text('definition');
    table.integer('frequency');
    table.integer('usage');
    table
      .integer('language_id')
      .notNullable()
      .unsigned()
      .index()
      .references('language.id');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {};
