const fs = require('fs');
const path = require('path');

const agentId = process.env.AGENT_ID || 'default-agent-id';
const filePath = path.join(__dirname, 'index.html');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /<elevenlabs-convai id="elevenlabsConvai" class="elevenlabs-convai"(.*?)>/i;
    if (regex.test(content)) {
        content = content.replace(
            regex,
            `<elevenlabs-convai id="elevenlabsConvai" class="elevenlabs-convai" agent-id="${agentId}">`
        );
    } else {
        throw new Error('No se encontró el elemento <elevenlabs-convai> en index.html');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Agent ID injected successfully:', agentId);
} catch (error) {
    console.error('Error al inyectar el Agent ID:', error.message);
    process.exit(1);
}
