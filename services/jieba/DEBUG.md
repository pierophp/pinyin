# Debug AWS Lambda

Add this to the function:

```typescript
import { exec } from 'node:child_process';

const cmds = [
  `ls -la /var/task`,
  `ls -la /var/task/services`,
  `ls -la /var/task/services/jieba`,
  `ls -la /var/task/services/jieba/netlify`,
  `ls -la /var/task/services/jieba/netlify/functions`,
];

let response = '';

for (const cmd of cmds) {
  response += `\n\n${cmd}\n`;
  response += await new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve(stdout);
    });
  });
}

response += `\n\nENV:\n`;
response += JSON.stringify(process.env);

return {
  statusCode: 200,
  body: response,
};
```
