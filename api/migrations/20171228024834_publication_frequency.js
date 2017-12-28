exports.up = function(knex, Promise) {
  return knex.schema.createTable('publication_frequency', function(table) {
    table.increments();
    table.string('code', 100);
    table.string('ideogram');
    table.string('total');
    table.unique(['code', 'ideogram']);
    table.timestamps();
    table.charset('utf8');
  });
};

exports.down = function(knex, Promise) {};
