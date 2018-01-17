exports.up = function(knex, Promise) {
  return knex.schema.createTable('video_track', function(table) {
    table.increments();
    table.string('video', 100);
    table.unique('video');
    table.string('track_url', 255);
    table.string('description', 255);
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {};
