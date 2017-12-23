exports.up = function(knex, Promise) {
  return Promise.join(
    knex('language').del(),

    knex('language').insert({
      code: 'cmn-hans',
      name: 'Chinês mandarin (simplificado)',
      created_at: new Date(),
    }),

    knex('language').insert({
      code: 'pt',
      name: 'Português',
      created_at: new Date(),
    }),

    knex('language').insert({
      code: 'en',
      name: 'Inglês',
      created_at: new Date(),
    }),
    knex('language').insert({
      code: 'es',
      name: 'Espanhol',
      created_at: new Date(),
    }),
  );
};

exports.down = function(knex, Promise) {};
