-- UPDATE IDEOGRAM RAW

UPDATE tmp_cedict ce
JOIN cjk c ON c.ideogram = ce.ideogram
SET c.ideogram_raw = ce.ideogram_raw
WHERE c.ideogram_raw IS NULL;

-- DELETE REMOVED

DELETE c 
FROM cjk c 
LEFT JOIN tmp_cedict ce
  ON ce.ideogram = c.ideogram
 AND ce.pronunciation_case = c.pronunciation
WHERE ce.ideogram IS NULL
  AND c.definition_cedict IS NOT NULL
  AND c.definition_unihan IS NULL
  AND c.definition_pt IS NULL;

-- UPDATE PINYIN

UPDATE tmp_cedict ce
JOIN cjk c 
  ON c.ideogram = ce.ideogram
 AND c.pronunciation = ce.pronunciation
LEFT JOIN cjk c2 
  ON c2.ideogram = ce.ideogram
 AND c2.pronunciation = ce.pronunciation_case
SET c.pronunciation = ce.pronunciation_case
WHERE c2.id IS NULL
AND ce.simplified = 1
AND ce.id NOT IN(175173, 175175, 212941)
AND ce.ideogram_raw NOT IN('乐'); 

-- MAIN UPDATE

UPDATE tmp_cedict ce
JOIN cjk c 
  ON c.ideogram = ce.ideogram
 AND c.pronunciation = ce.pronunciation_case
 AND c.simplified = ce.simplified
SET c.pronunciation_spaced = ce.pronunciation_spaced,
    c.pronunciation_taiwan = ce.pronunciation_taiwan,
    c.erhua = ce.erhua,
    c.measure_words = ce.measure_words,
    c.variants = ce.variants,
    c.traditional = ce.traditional,
    c.definition_cedict = ce.definition;

-- INSERT NEW

INSERT cjk
SELECT 
NULL id,
ce.ideogram,
ce.ideogram_raw,
ce.pronunciation_case pronunciation,
ce.pronunciation_unaccented,
ce.pronunciation_spaced,
ce.pronunciation_taiwan,
NULL definition_unihan,
NULL frequency,
NULL `usage`,
1 language_id,
NOW() created_at,
NULL updated_at,
'W' type,
ce.definition definition_cedict,
NULL definition_pt,
ce.measure_words,
ce.simplified,
ce.traditional,
ce.variants,
NULL definition_ct_pt,
NULL definition_ct_es,
NULL definition_ct_en,
NULL hsk,
0 main,
ce.erhua,
NULL definition_glosbe_pt,
NULL definition_glosbe_es,
NULL definition_glosbe_en,
NULL definition_2pinyin_pt,
NULL definition_2pinyin_es,
NULL definition_2pinyin_en  
FROM tmp_cedict ce
LEFT JOIN cjk c 
  ON c.ideogram = ce.ideogram
 AND c.pronunciation = ce.pronunciation_case
 AND c.simplified = ce.simplified
WHERE c.id IS NULL
LIMIT 100000000;


-- Invert Main Upper

DROP TABLE IF EXISTS  tmp_invert_ideogram;

CREATE TABLE tmp_invert_ideogram
SELECT c.ideogram_raw,
       c.id id_1, 
       c2.pronunciation pronunciation_1,
       c2.id id_2,
       c.pronunciation pronunciation_2
FROM cjk c
JOIN cjk c2 
  ON c2.ideogram = c.ideogram
 AND c2.main = 0
 AND c2.simplified = c.simplified
 AND c2.pronunciation_unaccented = c.pronunciation_unaccented
 AND SUBSTR(c2.pronunciation, 2) = SUBSTR(c.pronunciation, 2)
WHERE c.main = 1
  AND SUBSTR(c.pronunciation,1 , 1) = UCASE(SUBSTR(c.pronunciation,1 , 1));


UPDATE tmp_invert_ideogram tmp
JOIN cjk c ON c.id = tmp.id_1
SET c.pronunciation = tmp.pronunciation_1;

UPDATE tmp_invert_ideogram tmp
JOIN cjk c ON c.id = tmp.id_2
SET c.pronunciation = tmp.pronunciation_2;
  