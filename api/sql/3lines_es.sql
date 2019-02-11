UPDATE cjk c SET c.definition_3lines_es = null;

ALTER TABLE tmp_three_lines
 RENAME TO  tmp_three_lines_es;

ALTER TABLE tmp_three_lines_es
 CONVERT TO CHARACTER SET utf8mb4
 COLLATE utf8mb4_general_ci;


-- MAIN UPDATE

UPDATE tmp_three_lines_es tl
JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.pronunciation = REPLACE(REPLACE(REPLACE(tl.pronunciation_case, '-', ''), '_', ''), "'", '')
 AND c.simplified = tl.simplified
SET c.definition_3lines_es = tl.definition;

UPDATE tmp_three_lines_es tl
LEFT JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.pronunciation = REPLACE(REPLACE(REPLACE(tl.pronunciation_case, '-', ''), '_', ''), "'", '')
 AND c.simplified = tl.simplified
JOIN cjk c2
  ON c2.ideogram = tl.ideogram
 AND c2.pronunciation != tl.pronunciation_case
 AND c2.simplified = tl.simplified
 AND c2.definition_3lines_es IS NULL
SET c2.definition_3lines_es = tl.definition
WHERE c.id IS NULL;

-- INSERT NEW

INSERT cjk (ideogram, ideogram_raw, pronunciation, pronunciation_unaccented, pronunciation_spaced, language_id, created_at, type, definition_3lines_en, simplified, traditional, variants, main, source)
SELECT
tl.ideogram,
tl.ideogram_raw,
REPLACE(REPLACE(REPLACE(tl.pronunciation_case, '-', ''), '_', ''), "'", '') pronunciation,
REPLACE(REPLACE(REPLACE(tl.pronunciation_unaccented, '-', ''), '_', ''), "'", '') pronunciation_unaccented,
REPLACE(REPLACE(REPLACE(tl.pronunciation_spaced, '-', ''), '_', ''), "'", '') pronunciation_spaced,
1 language_id,
NOW() created_at,
'W' type,
tl.definition definition_3lines_en,
tl.simplified,
tl.traditional,
tl.variants,
1 main,
'3lines' source
FROM tmp_three_lines_es tl
LEFT JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.simplified = tl.simplified
WHERE c.id IS NULL
LIMIT 10000000000000;

