exports.up = function(knex, Promise) {
  return knex.schema.createTable('video_history', function(table) {
    table.increments();
    table.string('video', 100).index();
    table.string('url', 255).index();
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
