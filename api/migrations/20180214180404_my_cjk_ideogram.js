exports.up = function(knex, Promise) {
  return knex.schema.table('my_cjk', function(table) {
    table
      .string('ideogram', 255)
      .nullable()
      .alter();
  });
};

exports.down = function(knex, Promise) {};
