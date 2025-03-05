const fs = require('fs');
const path = require('path');

const agentId = process.env.AGENT_ID || 'default-agent-id';
const filePath = path.join(__dirname, 'index.html');

let content = fs.readFileSync(filePath, 'utf8');
content = content.replace("'#######'", `'${agentId}'`);
fs.writeFileSync(filePath, content, 'utf8');

console.log('Agent ID injected successfully:', agentId);
