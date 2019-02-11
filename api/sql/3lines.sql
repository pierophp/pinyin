ALTER TABLE tmp_three_lines_en
 CONVERT TO CHARACTER SET utf8mb4
 COLLATE utf8mb4_general_ci;


-- MAIN UPDATE

UPDATE tmp_three_lines_en tl
JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.pronunciation = REPLACE(REPLACE(tl.pronunciation_case, '-', ''), '_', '')
 AND c.simplified = tl.simplified
SET c.definition_3lines_en = tl.definition;

UPDATE tmp_three_lines_en tl
LEFT JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.pronunciation = REPLACE(REPLACE(tl.pronunciation_case, '-', ''), '_', '')
 AND c.simplified = tl.simplified
JOIN cjk c2
  ON c2.ideogram = tl.ideogram
 AND c2.pronunciation != tl.pronunciation_case
 AND c2.simplified = tl.simplified
 AND c2.definition_3lines_en IS NULL
SET c2.definition_3lines_en = tl.definition
WHERE c.id IS NULL;

-- INSERT NEW

INSERT cjk (ideogram, ideogram_raw, pronunciation, pronunciation_unaccented, pronunciation_spaced, language_id, created_at, type, definition_3lines_en, simplified, traditional, variants, main)
SELECT
ce.ideogram,
ce.ideogram_raw,
ce.pronunciation_case pronunciation,
ce.pronunciation_unaccented,
ce.pronunciation_spaced,
1 language_id,
NOW() created_at,
'W' type,
ce.definition definition_3lines_en,
ce.simplified,
ce.traditional,
ce.variants,
1 main,
ce.erhua,
FROM tmp_three_lines_en tl
LEFT JOIN cjk c
  ON c.ideogram = tl.ideogram
 AND c.simplified = tl.simplified
WHERE c.id IS NULL
LIMIT 10000000000000;

