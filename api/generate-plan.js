// Este archivo debe estar en la carpeta /api de tu proyecto.
// Nombre del archivo: generate-plan.js

export default async function handler(request, response) {
  // Solo permitir peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // Obtener la clave de API de forma segura desde las variables de entorno de Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured.' });
  }

  const {
    userName,
    selectedPackage,
    motivation,
    incomeGoal,
    personalGoal,
    healthGoal,
    commitment,
  } = request.body;
  
  // Construir el prompt con los datos recibidos del formulario
  const prompt = `
    Actúa como un coach Diamante de Gano Excel, experto en lanzamientos rápidos. Tu misión es crear un plan de acción de 30 días, hiper-personalizado y motivador, basado en la "Estrategia Psicológica para Gano Excel". Usa un lenguaje profesional y evita la jerga de bajo estatus.

    **Filosofía Central (Contexto Clave):**
    - El éxito ama la velocidad. El objetivo es un "arranque explosivo" para generar resultados en la primera semana.
    - No vendemos, conectamos y compartimos una experiencia. Resolvemos problemas de bienestar y construimos activos empresariales.
    - El sistema es el que produce el resultado, no el talento individual. Nos apalancamos en un sistema probado.
    - El objetivo final es construir un activo de ingreso residual, no un simple trabajo de ventas.
    - La base del negocio es ser "producto del producto". Un testimonio genuino es la herramienta más poderosa.

    **Perfil del Nuevo Socio (Datos del Formulario):**
    - **Nombre:** ${userName}
    - **Paquete de Inicio:** ${selectedPackage}
    - **Su 'Gran Porqué' (Motivación):** ${motivation}
    - **Meta Financiera Semanal:** ${incomeGoal.replace(/{.*?}/g, '')}
    - **Su Sueño Inmediato (Opcional):** ${personalGoal}.
    - **Su Meta de Bienestar:** Quiere usar los productos para ${healthGoal}.
    - **Compromiso de Acción Inmediata:** Se ha comprometido a contactar a ${commitment} en las primeras 48 horas.

    **Instrucciones para el Plan:**
    1.  **Saludo Personalizado:** Inicia con un saludo cálido y profesional para ${userName}.
    2.  **Enfoque en la Velocidad:** El plan debe estar diseñado para un "arranque explosivo".
    3.  **Personaliza la Motivación:** Conecta las acciones con su 'Gran Porqué' (${motivation}) y su 'Sueño Inmediato' (${personalGoal}).
    4.  **Integra el Producto:** Incluye recordatorios para que use los productos consistentemente para lograr su meta de bienestar (${healthGoal}).
    5.  **Crea un 'Plan de 48 Horas':** La primera acción debe ser cumplir con su compromiso de llamadas (${commitment}).
    6.  **Tono:** El tono debe ser el de un líder que dice: 'Entiendo tus metas y este es exactamente el camino para lograrlas. Vamos a hacerlo juntos'.
    7.  **Estructura:** Usa encabezados para cada semana (ej: #### Semana 1: Cimientos del Negocio) y listas con asteriscos (*) para las acciones. Finaliza con una frase corta y motivadora.`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`API request failed with status ${geminiResponse.status}`);
    }

    const result = await geminiResponse.json();

    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      const rawText = result.candidates[0].content.parts[0].text;
      return response.status(200).json({ plan: rawText });
    } else {
      throw new Error("No content received from API.");
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return response.status(500).json({ error: 'Failed to generate action plan.' });
  }
}
