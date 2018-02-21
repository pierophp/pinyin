-- Frequency

SELECT code, COUNT(*)  total
FROM publication_frequency
GROUP BY code
ORDER BY code;

-- Frequency Total words

SELECT COUNT(DISTINCT ideogram)  total
FROM publication_frequency;

-- Frequency not found

SELECT a.ideogram, a.total
FROM (
	SELECT ideogram, SUM(total) total
	FROM publication_frequency
	GROUP BY ideogram
) a
LEFT JOIN cjk c ON c.ideogram = a.ideogram
WHERE c.id IS NULL
ORDER BY a.total DESC;

-- Frequency PT not found

SELECT a.total, c.*
FROM (
	SELECT ideogram, SUM(total) total
	FROM publication_frequency
	GROUP BY ideogram
) a
JOIN cjk c ON c.ideogram = a.ideogram
WHERE c.definition_pt IS NULL
ORDER BY a.total DESC;