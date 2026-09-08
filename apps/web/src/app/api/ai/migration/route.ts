import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data_payload = await request.json();
    const asset = data_payload;
    const findings = data_payload.related_findings || [];
    
    // Extract file paths from findings
    const filePaths = Array.from(new Set(findings.map((f: any) => f.file_path).filter(Boolean)));
    const filesStr = filePaths.length > 0 ? filePaths.join(", ") : "Unknown (Check dependencies/requirements.txt)";

    const prompt = `
    You are a Cryptographic Security Architect. I need a migration plan to upgrade a vulnerable cryptographic asset to a Post-Quantum Cryptography (PQC) standard or a secure modern equivalent.
    
    Asset Details:
    - Name: ${asset.name}
    - Type: ${asset.type}
    - Algorithm: ${asset.algorithm}
    - Key Size: ${asset.key_size || 'N/A'}
    
    Affected Files / Locations identified by our scanner:
    ${filesStr}
    
    Return the migration roadmap as a STRICT JSON array of objects. Each object must have a "title" and a "desc".
    In the description, you MUST explicitly mention the affected files and how to modify them. Provide actionable steps.
    
    Do not include any other text outside the JSON array. Do not use markdown blocks like \`\`\`json. Just return the raw JSON array.
    Example:
    [
      { "title": "Phase 1: Codebase Analysis", "desc": "Identify usage of ${asset.algorithm} in ${filesStr}." },
      { "title": "Phase 2: Upgrade", "desc": "Switch to Kyber-768." }
    ]
    `;

    const groqKey = process.env.GROQ_API_KEY;
    const model = "openai/gpt-oss-120b"; // Using requested Groq proxy model

    if (!groqKey) {
        throw new Error("GROQ_API_KEY is not configured in the environment");
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.error?.message || "Groq API Failed");
    }

    let parsed = [];
    try {
        let text = data.choices[0].message.content.trim();
        if (text.startsWith("\`\`\`json")) text = text.replace(/\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        if (text.startsWith("\`\`\`")) text = text.replace(/\`\`\`/, "").replace(/\`\`\`$/, "").trim();
        
        const obj = JSON.parse(text);
        parsed = Array.isArray(obj) ? obj : (obj.phases || obj.steps || obj.plan || []);
    } catch (e) {
        console.error("Failed to parse LLM JSON", e);
        parsed = [
            { title: "Error", desc: "Failed to parse AI response into structured plan." },
            { title: "Raw Response", desc: data.choices[0]?.message?.content || "No content" }
        ];
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
