const fs = require('fs');
const path = require('path');

const agentId = process.env.AGENT_ID || 'default-agent-id';
const filePath = path.join(__dirname, 'index.html');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Usar una expresión regular más precisa y eficiente
    const updatedContent = content.replace(
        /<elevenlabs-convai id="elevenlabsConvai" class="elevenlabs-convai"([^>]*)>/i,
        `<elevenlabs-convai id="elevenlabsConvai" class="elevenlabs-convai" agent-id="${agentId}">`
    );
    
    // Verificar si hubo cambios antes de escribir
    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log('Agent ID inyectado correctamente:', agentId);
    } else {
        console.log('No se encontró el elemento <elevenlabs-convai> o ya tiene el agent-id correcto');
    }
} catch (error) {
    console.error('Error al inyectar el Agent ID:', error.message);
    process.exit(1);
}
