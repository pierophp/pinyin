-- DICIONARIO

SELECT 
 SUM(IF(definition_unihan IS NOT NULL AND definition_unihan != 'null', 1, 0)) definition_unihan,
 SUM(IF(definition_cedict IS NOT NULL AND definition_cedict != 'null', 1, 0)) definition_cedict,
 SUM(IF(definition_pt IS NOT NULL AND definition_pt != 'null', 1, 0)) definition_pt,
 SUM(IF(definition_ct_pt IS NOT NULL AND definition_ct_pt != '[]', 1, 0)) definition_ct_pt,
 SUM(IF(definition_ct_pt IS NOT NULL, 1, 0)) definition_ct_pt_null,
 SUM(IF(definition_ct_es IS NOT NULL AND definition_ct_es != '[]', 1, 0)) definition_ct_es,
 SUM(IF(definition_ct_es IS NOT NULL, 1, 0)) definition_ct_es_null,
 SUM(IF(definition_ct_en IS NOT NULL AND definition_ct_en != '[]', 1, 0)) definition_ct_en,
 SUM(IF(definition_ct_en IS NOT NULL, 1, 0)) definition_ct_en_null,
 SUM(IF(definition_glosbe_pt IS NOT NULL AND definition_glosbe_pt != '[]', 1, 0)) definition_glosbe_pt,
 SUM(IF(definition_glosbe_pt IS NOT NULL, 1, 0)) definition_glosbe_pt_null,
 SUM(IF(definition_glosbe_es IS NOT NULL AND definition_glosbe_es != '[]', 1, 0)) definition_glosbe_es,
 SUM(IF(definition_glosbe_en IS NOT NULL AND definition_glosbe_en!= '[]', 1, 0)) definition_glosbe_en
FROM cjk
WHERE simplified = 1;