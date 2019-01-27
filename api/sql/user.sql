SELECT * FROM user ORDER BY 1 DESC;

-- NOVOS USUARIOS POR MES

SELECT DATE_FORMAT(created_at,  '%Y-%m') mes, COUNT(*) total
FROM user
GROUP BY DATE_FORMAT(created_at,  '%Y-%m')
ORDER BY mes DESC;

-- USUARIOS TOP

SELECT u.id, u.name, u.email, 
  COUNT(*) total, 
  SUM(IF(c.type = 'C' AND c.simplified = 1,1,0)) total_c_simplified,
  SUM(IF(c.type = 'W' AND c.simplified = 1,1,0)) total_w_simplified,
  SUM(IF(c.type = 'C' AND c.traditional = 1,1,0)) total_c_traditional,
  SUM(IF(c.type = 'W' AND c.traditional = 1,1,0)) total_w_traditional
FROM user u
JOIN my_cjk  my ON my.user_id = u.id
LEFT JOIN cjk c ON c.ideogram = my.ideogram
GROUP BY u.id, u.name, u.email
ORDER BY total DESC;

