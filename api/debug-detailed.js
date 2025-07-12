// api/debug-detailed.js
// Función para debugging exhaustivo de variables de entorno
export default function handler(request, response) {

  // 1. Verificar todas las variables de entorno disponibles
  const allEnvVars = Object.keys(process.env);

  // 2. Buscar variables que contengan "GEMINI" o "API"
  const relevantVars = allEnvVars.filter(key =>
    key.includes('GEMINI') || key.includes('API')
  );

  // 3. Verificar específicamente GEMINI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY;

  // 4. Información del entorno de ejecución
  const executionInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    totalEnvVars: allEnvVars.length,
    relevantVars: relevantVars,
    geminiKeyExists: !!geminiKey,
    geminiKeyLength: geminiKey ? geminiKey.length : 0,
    geminiKeyStart: geminiKey ? geminiKey.substring(0, 4) : 'N/A'
  };

  return response.status(200).json({
    status: 'Debug Info',
    executionInfo,
    recommendation: geminiKey ?
      'API Key encontrada - el problema podría estar en otro lugar' :
      'API Key NO encontrada - confirmar problema de plataforma'
  });
}
