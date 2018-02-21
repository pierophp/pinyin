UPDATE cjk c
SET c.main = 0
WHERE c.main IS NULL;

-- FIX NO MAIN

UPDATE cjk c 
SET c.main = 1
WHERE c.id IN(
	SELECT id FROM(
	SELECT MIN(c.id) id
	FROM cjk c
	LEFT JOIN cjk c2 ON c2.ideogram = c.ideogram AND c2.main = 1
	WHERE c.main = 0
	  AND c2.id IS NULL
	GROUP BY c.ideogram
    ) a
);

-- NO MAIN

SELECT c.id, c.ideogram
FROM cjk c
LEFT JOIN cjk c2 ON c2.ideogram = c.ideogram AND c2.main = 1
WHERE c.main = 0
  AND c2.id IS NULL;

-- MORE THAN ONE MAIN

SELECT ideogram, COUNT(*) total
FROM cjk
WHERE main = 1
GROUP BY ideogram
HAVING COUNT(*) > 1;

