SELECT * FROM user ORDER BY 1 DESC;

-- NOVOS USUARIOS POR MES

SELECT DATE_FORMAT(created_at,  '%Y-%m') mes, COUNT(*) total
FROM user
GROUP BY DATE_FORMAT(created_at,  '%Y-%m')
ORDER BY mes DESC;

-- USUARIOS TOP

SELECT u.id, u.name, u.email, 
  COUNT(*) total, 
  SUM(IF(c.type = 'C',1,0)) total_c,
  SUM(IF(c.type = 'W',1,0)) total_w
FROM user u
JOIN my_cjk  my ON my.user_id = u.id
JOIN cjk c ON c.id = my.cjk_id
GROUP BY u.id, u.name, u.email
ORDER BY total DESC;

