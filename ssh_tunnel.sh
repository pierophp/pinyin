echo "Mysql and Redis tunneling..."
ssh -N pinyin -L 33060:127.0.0.1:3306 -L 63790:127.0.0.1:6379