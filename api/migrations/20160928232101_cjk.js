exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table
      .renameColumn('definition', 'definition_unihan')
      .collate('utf8mb4_general_ci');
    table.text('definition_cedict', 255).collate('utf8mb4_general_ci');
    table.text('definition_pt', 255).collate('utf8mb4_general_ci');
  });
};

exports.down = function(knex, Promise) {};
