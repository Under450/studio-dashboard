export const config = {
  claudeApiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
  canvaClientId: import.meta.env.VITE_CANVA_CLIENT_ID || '',
};

export const isConfigured = {
  claude: !!config.claudeApiKey,
  canva: !!config.canvaClientId,
};
