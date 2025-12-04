import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.static("public")); // Aquí vivirá el index.html
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SISTEMA_SIMULADOR = `
Eres un simulador de entrenamiento para Gerentes de Punto de Venta
en una cadena de retail. Vas a actuar como un CLIENTE EXIGENTE que
ha tenido malas experiencias.

Reglas:
- Responde SIEMPRE en español.
- Mantén respuestas de 2 a 5 líneas.
- Expresa emociones realistas (frustración, duda, alivio).
- NO des feedback técnico, solo reacciones del cliente.
- A medida que el gerente responda, revela más detalles del problema.
`;

app.post("/api/simular", async (req, res) => {
  const { mensajeUsuario } = req.body;

  if (!OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "Falta OPENAI_API_KEY en las variables del servidor" });
  }

  try {
    const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SISTEMA_SIMULADOR },
          { role: "user", content: mensajeUsuario }
        ]
      })
    });

    const completionData = await completionRes.json();

    if (completionData.error) {
      console.error("Error IA:", completionData.error);
      return res.status(500).json({ error: completionData.error.message });
    }

    const respuestaIA = completionData.choices?.[0]?.message?.content || "Sin respuesta.";
    res.json({ respuestaIA });

  } catch (err) {
    console.error("Error servidor:", err);
    res.status(500).json({ error: "Error conectando con la IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Simulador IA iniciado en puerto", PORT));
