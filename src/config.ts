export const config = {
  postizUrl: import.meta.env.VITE_POSTIZ_URL || '',
  postizApiKey: import.meta.env.VITE_POSTIZ_API_KEY || '',
  claudeApiKey: import.meta.env.VITE_CLAUDE_API_KEY || '',
  canvaClientId: import.meta.env.VITE_CANVA_CLIENT_ID || '',
};

export const isConfigured = {
  postiz: !!config.postizUrl && !!config.postizApiKey,
  claude: !!config.claudeApiKey,
  canva: !!config.canvaClientId,
};
