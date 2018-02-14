exports.up = function(knex, Promise) {
  return knex.schema.table('my_cjk', function(table) {
    table.string('ideogram', 100).nullable();
    table.string('source', 100).nullable();
    table.string('type', 100).nullable();
    table.dropUnique([`user_id`, `cjk_id`]);
    table.unique([`user_id`, `source`, `type`, `ideogram`]);
  });
};

exports.down = function(knex, Promise) {};
