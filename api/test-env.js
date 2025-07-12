// Archivo: api/test-env.js
export default function handler(request, response) {

  // Intenta leer la variable de entorno
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    // Si la encuentra, nos avisa y nos da las primeras 4 letras por seguridad
    const keyInfo = `Sí, la clave de API existe. Comienza con: ${apiKey.substring(0, 4)}`;
    return response.status(200).json({ status: 'Éxito', message: keyInfo });
  } else {
    // Si NO la encuentra, nos avisa
    const keyInfo = "No, la clave de API NO se encontró en el entorno (es undefined).";
    return response.status(404).json({ status: 'Fallo', message: keyInfo });
  }
}
