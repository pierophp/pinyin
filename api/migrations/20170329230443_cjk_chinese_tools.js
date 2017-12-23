exports.up = function(knex, Promise) {
  return knex.schema.table('cjk', function(table) {
    table.text('definition_ct_pt', 255).collate('utf8mb4_general_ci');
    table.text('definition_ct_es', 255).collate('utf8mb4_general_ci');
    table.text('definition_ct_en', 255).collate('utf8mb4_general_ci');
  });
};

exports.down = function(knex, Promise) {};
