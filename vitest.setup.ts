// Tests must not inherit a real Anthropic key from the developer's shell. The P1 regression
// lock «503 when the Gemini key is missing, before anything else» relies on no engine key
// being present (the pre-check now fires only when both are missing — llm-routing design).
delete process.env["ANTHROPIC_API_KEY"];
delete process.env["ANTHROPIC_AUTH_TOKEN"];
delete process.env["CLAUDE_ROUTING_ENABLED"];
delete process.env["LLM_ROUTING_OVERRIDE"];
delete process.env["GLOBAL_CONFIG"];
delete process.env["EDGE_CONFIG"];
