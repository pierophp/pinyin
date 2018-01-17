const express = require('express');
const knex = require('../services/knex');
const UnihanSearch = require('../services/UnihanSearch');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', async (req, res) => {
  const result = await knex('my_cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.frequency', 'cjk.pronunciation')
    .join('cjk', 'cjk.id', '=', 'my_cjk.cjk_id')
    .where({
      user_id: req.user.id,
    })
    .orderBy('frequency', 'ASC')
    .orderBy('usage', 'DESC');

  const ideograms = [];
  result.forEach(item => {
    item.ideogram = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report', (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    type: 'C',
    main: 1,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  knex('cjk')
    .select(
      knex.raw(
        'cjk.frequency, COUNT(*) as total, COUNT(my_cjk.id) total_my, round(COUNT(my_cjk.id) / COUNT(*) * 100) percent',
      ),
    )
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .groupBy('cjk.frequency')
    .then(report => {
      let total = 0;
      report.forEach(item => {
        total += item.total_my;
      });
      res.send({ total, report });
    });
});

router.get('/report_words', async (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    main: 1,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const report = await knex('cjk')
    .select(
      knex.raw(
        'cjk.hsk, COUNT(cjk.id) as total, COUNT(my_cjk.id) total_my, round(COUNT(my_cjk.id) / COUNT(*) * 100) percent',
      ),
    )
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .groupBy('cjk.hsk');

  let total = 0;
  report.forEach(item => {
    total += item.total_my;
  });

  res.send({ total, report });
});

router.get('/report_unknown', async (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    type: 'C',
    main: 1,
    frequency: req.query.frequency,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const result = await knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.frequency', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .whereNull('my_cjk.id')
    .limit(2500);

  const ideograms = [];
  result.forEach(item => {
    item.ideogram = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_known', async (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    type: 'C',
    main: 1,
    frequency: req.query.frequency,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const result = await knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.frequency', 'cjk.pronunciation')
    .join('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .limit(2500);

  const ideograms = [];
  result.forEach(item => {
    item.ideogram = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_unknown_words', async (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    main: 1,
    hsk: req.query.hsk,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const result = await knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.hsk', 'cjk.pronunciation')
    .leftJoin('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .whereNull('my_cjk.id')
    .limit(2500);

  const ideograms = [];
  result.forEach(item => {
    item.ideogram = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.get('/report_known_words', async (req, res) => {
  let ideogramType = 's';
  if (req.query.ideogramType) {
    ideogramType = req.query.ideogramType;
  }

  const where = {
    main: 1,
    hsk: req.query.hsk,
  };

  if (ideogramType === 's') {
    where.simplified = 1;
  } else {
    where.traditional = 1;
  }

  const result = await knex('cjk')
    .select('my_cjk.id', 'cjk.ideogram', 'cjk.hsk', 'cjk.pronunciation')
    .join('my_cjk', function leftJoin() {
      this.on('my_cjk.cjk_id', '=', 'cjk.id').on(
        'my_cjk.user_id',
        '=',
        req.user.id,
      );
    })
    .where(where)
    .limit(2500);

  const ideograms = [];
  result.forEach(item => {
    item.ideogram = UnihanSearch.convertUtf16ToIdeograms(item.ideogram);
    ideograms.push(item);
  });

  res.send({ ideograms });
});

router.post('/', async (req, res) => {
  try {
    const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(
      req.body.ideogram,
    );

    let result = await knex('cjk')
      .where({
        main: 1,
        ideogram: ideogramConverted,
        type: 'C',
      })
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select('id');

    if (result.length === 0) {
      result = await knex('cjk')
        .where({
          ideogram: ideogramConverted,
        })
        .orderBy('frequency', 'ASC')
        .orderBy('usage', 'DESC')
        .select('id');
    }

    await knex('my_cjk').insert({
      cjk_id: result[0].id,
      user_id: req.user.id,
    });

    res.send({ status: 'SUCCESS' });
  } catch (e) {
    res.status(500);
    res.send({
      status: 'ERROR',
      message: e.message,
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    const ideogramConverted = UnihanSearch.convertIdeogramsToUtf16(
      req.body.ideogram,
    );
    const result = await knex('cjk')
      .where({
        ideogram: ideogramConverted,
      })
      .orderBy('frequency', 'ASC')
      .orderBy('usage', 'DESC')
      .select('id');

    const ids = [];
    result.forEach(item => {
      ids.push(item.id);
    });

    await knex('my_cjk')
      .whereIn('cjk_id', ids)
      .where({
        user_id: req.user.id,
      })
      .del();

    res.send({ status: 'SUCCESS' });
  } catch (e) {
    res.status(500);
    res.send({
      status: 'ERROR',
      message: e.message,
    });
  }
});

module.exports = router;
