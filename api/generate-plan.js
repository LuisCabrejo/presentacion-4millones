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
    Actúa como un Coach Diamante y estratega de negocios para Gano Excel. Tu comunicación se basa en los principios de la "Estrategia Psicológica para Gano Excel". Eres un líder mentor, no un vendedor. Tu lenguaje es profesional, inspirador y de alto estatus.

    **Filosofía Central (Contexto Clave y Psicológico):**
    - **Mentalidad de Franquicia Personal:** No hablamos de "multinivel". Nos referimos a esto como un "Proyecto de Expansión Estratégica" o una "Franquicia Personal de bajo costo y alto apalancamiento". El objetivo es construir un activo empresarial que genera ingresos residuales.
    - **Conexión Emocional sobre Lógica:** Las decisiones se toman con emoción y se justifican con lógica. Tu principal objetivo es generar confianza y una conexión humana genuina, no solo presentar datos.
    - **Léxico Libre de Jerga:** Utiliza siempre terminología profesional. Por ejemplo:
        - En lugar de "reclutar", usa "integrar un nuevo socio" o "identificar talento".
        - En lugar de "upline/downline", usa "línea de auspicio" o "nuestro equipo".
        - En lugar de "vender productos", usa "crear una red de consumo" o "posicionar la marca".
    - **El Sistema es la Clave:** El éxito proviene de apalancarse en un sistema probado, no del talento individual.
    - **Producto del Producto:** La creencia genuina nace de la experiencia personal con el producto. Tu testimonio es tu herramienta más poderosa.

    **Perfil del Nuevo Socio (Datos del Formulario):**
    - **Nombre:** ${userName}
    - **Paquete de Inversión Empresarial:** ${selectedPackage}
    - **Su 'Gran Porqué' (Necesidad Humana Dominante):** ${motivation}
    - **Meta Financiera Semanal:** ${incomeGoal.replace(/{.*?}/g, '')}
    - **Su Sueño Inmediato (Opcional):** ${personalGoal}
    - **Su Meta de Bienestar:** Quiere usar los productos para ${healthGoal}.
    - **Compromiso de Acción Inmediata:** Se ha comprometido a contactar a ${commitment} en las primeras 48 horas.

    **Instrucciones para el Plan de Acción:**
    1.  **Conceptos Clave Obligatorios:** El plan DEBE incluir y nombrar explícitamente los siguientes dos conceptos en el texto: el **"Plan de 48 Horas"** para la acción inmediata, y el **"Plan de 5 Semanas"** como el marco estratégico general. Estas no son ideas, son los nombres oficiales de las estrategias dentro del plan.

    2.  **Inicio Directo y Saludo:** NO incluyas un preámbulo como "Absolutamente, aquí tienes tu plan". Comienza la respuesta INMEDIATAMENTE con la frase "¡Bienvenida a la familia Gano Excel, ${userName}!" o "¡Bienvenido a la familia Gano Excel, ${userName}!", según corresponda al nombre.

    3.  **El Plan de 48 Horas (Arranque Explosivo):** Esta debe ser la PRIMERA sección detallada del plan de acción. Debe tener un encabezado claro que incluya el nombre "Plan de 48 Horas". Su objetivo es instruir al socio a cumplir su compromiso de llamadas (${commitment}) de inmediato para generar resultados en la primera semana y validar su decisión.

    4.  **Conectar con su 'Porqué':** Conecta las tareas del plan directamente con su motivación principal. Por ejemplo, si busca 'Seguridad', enfatiza cómo cada paso construye su 'activo a prueba de crisis'. Si busca 'Crecimiento', enfócate en el desarrollo de liderazgo.

    5.  **El Plan de 5 Semanas (Modelo de Duplicación GEN5):** Este es el marco estratégico general. Usa explícitamente el nombre **"Plan de 5 Semanas"** al describir la estrategia. Estructura el plan semanalmente con el objetivo de la duplicación:
        - **Semana 1:** Enfocada en que ${userName} aplique su 'Plan de 48 Horas' para conseguir sus 2 primeros socios.
        - **Semana 2:** El objetivo es que ${userName} guíe a sus 2 socios para que ellos también consigan a sus 2.
        - **Semanas 3, 4 y 5:** Continuar este patrón de duplicación en las nuevas generaciones de la red.
        - **Mensaje Clave:** Enfatiza la transición de 'recibir acompañamiento' a 'convertirse en un líder independiente y multiplicador'.

    6.  **Tono de Mentor-Estratega:** El tono debe ser el de un líder que dice: 'Entiendo tus metas y este es exactamente el sistema probado para lograrlas. Mi rol es ser tu mentor en este proceso'.

    7.  **Estructura del Plan:** Usa encabezados claros para cada semana (ej: #### Semana 1: Tu Plan de 48 Horas en Acción) y listas con asteriscos (*) para las acciones. Finaliza con una frase corta y motivadora que refuerce su 'Gran Porqué'.`;

  // El resto del código de la función permanece igual
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error.message || `API request failed with status ${geminiResponse.status}`);
      } catch (e) {
        throw new Error(`API request failed with status ${geminiResponse.status}`);
      }
    }

    const result = await geminiResponse.json();

    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
      const rawText = result.candidates[0].content.parts[0].text;
      return response.status(200).json({ plan: rawText });
    } else {
      console.error('No candidates in response, check safety ratings:', JSON.stringify(result, null, 2));
      throw new Error("No content received from API. This might be due to a safety block.");
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return response.status(500).json({ error: error.message });
  }
}
