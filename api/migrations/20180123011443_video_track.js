exports.up = function(knex, Promise) {
  return knex.schema.table('video_track', function(table) {
    table.text('videos');
    table.text('images');
    table.string('code', 100).index();
    table.string('language', 100);
  });
};

exports.down = function(knex, Promise) {};
