/**
 * Request bodies shaped like the ones baby-naming-ai actually sends to
 * `/api/app/gemini-generate` (rebuilt from baby `f2aa508`: `GeminiApi.kt` request
 * models, `NamingRepository.kt` `buildRecommendedNamesSchema` / `generateNames` /
 * `generateLetter`). Test-only — the gateway regression snapshots and the Claude
 * adapter tests both run against these so they exercise the real schema, Korean
 * descriptions included, rather than a toy shape.
 *
 * Kept in `_lib/` because Vercel turns every other file under `api/` into a function.
 */

const OHAENG_FORMAT_EXAMPLE_PRONUNCIATION = "토금토 (土金土) - 부드럽고 세련된 어감의 상생 흐름";
const OHAENG_FORMAT_EXAMPLE_JAWON = "수목 (水木) - 수생목으로 부족한 목(木)을 채움";
const OHAENG_FORMAT_EXAMPLE_STROKE = "8획(음) - 13획(양) - 15획(양) - 음양의 균형";
const OHAENG_DESC_MAX_CHARS = 22;

export function babyNamingSchema(nameCount: number): Record<string, unknown> {
  const structuralCheckSchema = {
    type: "OBJECT",
    properties: {
      pronunciation_ohaeng: {
        type: "STRING",
        description:
          "한국어로 작성. 형식: '<한글오행> (<한자오행>) - <설명>'. " +
          `예: '${OHAENG_FORMAT_EXAMPLE_PRONUNCIATION}'. ` +
          `설명은 어감과 상생/상극 흐름을 담은 한국어 명사구로 ${OHAENG_DESC_MAX_CHARS}자 이내. ` +
          "영어 단어를 쓰지 말 것(Earth, Fire, Balanced 등 금지)."
      },
      jawon_ohaeng: {
        type: "STRING",
        description:
          "한국어로 작성. 형식: '<한글오행> (<한자오행>) - <설명>'. " +
          `예: '${OHAENG_FORMAT_EXAMPLE_JAWON}'. ` +
          `설명은 어떤 기운을 보완하는지 담은 한국어 명사구로 ${OHAENG_DESC_MAX_CHARS}자 이내. ` +
          "영어 단어를 쓰지 말 것."
      },
      stroke_yinyang: {
        type: "STRING",
        description:
          "한국어로 작성. 형식: '<획수>획(<음|양>) - <획수>획(<음|양>) - <획수>획(<음|양>) - <설명>'. " +
          `예: '${OHAENG_FORMAT_EXAMPLE_STROKE}'. ` +
          `설명은 한국어 명사구로 ${OHAENG_DESC_MAX_CHARS}자 이내. ` +
          "영어 단어를 쓰지 말 것(Yang, Even, Balanced 등 금지)."
      }
    },
    required: ["pronunciation_ohaeng", "jawon_ohaeng", "stroke_yinyang"],
    propertyOrdering: ["pronunciation_ohaeng", "jawon_ohaeng", "stroke_yinyang"]
  };

  const nameItemSchema = {
    type: "OBJECT",
    properties: {
      name_korean: { type: "STRING", description: "한글 이름. 성 + 이름. 예: '김서아'." },
      name_hanja: { type: "STRING", description: "한자 이름. 예: '金瑞娥'. 한자만 쓰고 로마자를 섞지 말 것." },
      hanja_meanings: {
        type: "STRING",
        description:
          "한국어 한 문장으로 각 한자의 뜻을 풀이. " +
          "예: '상서로운 기운(瑞)과 아름다운 자태(娥)를 품는다'. " +
          "한자는 괄호로 병기하되 설명 자체는 반드시 한국어. 영어 번역어를 쓰지 말 것."
      },
      structural_check: structuralCheckSchema
    },
    required: ["name_korean", "name_hanja", "hanja_meanings", "structural_check"],
    propertyOrdering: ["name_korean", "name_hanja", "hanja_meanings", "structural_check"]
  };

  const sajuSummarySchema = {
    type: "OBJECT",
    properties: {
      birth_eight_characters: { type: "STRING", description: "사주 여덟 글자. 입력으로 주어진 값을 그대로 옮겨 적을 것." },
      lacking_element: { type: "STRING", description: "부족한 오행 한자 한 글자. 예: '木'. 영어(Wood 등)로 쓰지 말 것." },
      remedy_strategy: {
        type: "STRING",
        description:
          "반드시 한국어 문장으로 작성. 부족한 오행을 추천 한자의 자원오행으로 " +
          "어떻게 보완했는지 따뜻한 편지 어조로 설명한다. 영어로 쓰지 말 것."
      }
    },
    required: ["birth_eight_characters", "lacking_element", "remedy_strategy"],
    propertyOrdering: ["birth_eight_characters", "lacking_element", "remedy_strategy"]
  };

  return {
    type: "OBJECT",
    properties: {
      saju_analysis_summary: sajuSummarySchema,
      recommended_names: { type: "ARRAY", minItems: nameCount, maxItems: nameCount, items: nameItemSchema }
    },
    required: ["saju_analysis_summary", "recommended_names"],
    propertyOrdering: ["saju_analysis_summary", "recommended_names"]
  };
}

const LANGUAGE_MANDATE = `
[OUTPUT LANGUAGE — ABSOLUTE, HIGHEST PRIORITY]
YOU MUST WRITE EVERY STRING VALUE IN THE JSON RESPONSE IN KOREAN (한국어).
This overrides everything else in this prompt. These instructions are written in English
for precision, but your OUTPUT is for Korean parents and MUST be Korean.
- Explanations, descriptions and sentences: Korean only. NEVER English.
- FORBIDDEN in output values: English words such as Wood, Fire, Earth, Metal, Water,
  Yang, Yin, Even, Odd, Balanced, congratulate, prosper, clear water.
- Hanja (木 火 土 金 水, 相生) and Korean Ohaeng terms (목·화·토·금·수, 상생, 음·양)
  are KEPT AS-IS. Writing them is required, not a violation — the rule is about the
  language of the surrounding explanation, not about romanizing Hanja.
- If you are about to write an English word in any value, write the Korean word instead.
`;

/** Abridged `namingSystemInstructionBase` with a grounded saju block — same structure, same mandates. */
function namingSystemInstruction(nameCount: number): string {
  const countText = `${nameCount} distinct names`;
  return `You are an advanced Korean traditional naming expert system (Master of Eastern Seongmyeonghak & Modern Baby Naming AI).
Your goal is to generate names that satisfy traditional Saju/Seongmyeonghak principles while delivering beautiful, modernized, easy-to-understand Korean explanations like a warm letter.
${LANGUAGE_MANDATE}
Core Naming Rules (Mandatory System Logic):
1. [GROUNDED DETERMINISTIC SAJU DATA - MANDATORY]
Use the following exact pre-calculated Saju data for your output. Do not calculate Saju yourself.
- birth_eight_characters: "丙午(병오)年 甲午(갑오)月 庚辰(경진)日 壬午(임오)時"
- lacking_element: "水"
- absent_elements: "없음"
- deficient_elements: "水, 木"
- supplement_priority: "水 -> 木"
You MUST:
1. Populate "saju_analysis_summary.birth_eight_characters" exactly with "丙午(병오)年 甲午(갑오)月 庚辰(경진)日 壬午(임오)時".
2. Populate "saju_analysis_summary.lacking_element" exactly with "水".
3. In "remedy_strategy", explain how this specific element (水) is supplemented through the recommended Hanja characters' Jawon-Ohaeng.
2. Pronunciation Harmony (발음오행): Ensure the Korean pronunciation of the surname and first name syllables does not clash (Avoid 상극, enforce 상생).
3. Yin-Yang Stroke Balance (획수음양): Ensure the stroke count combination of [Surname + First syllable + Second syllable] is a balance of odd (Yang) and even (Yin) numbers.
4. Won-Hyeong-Lee-Jeong (원형이정 81수리): Calculate Hanja strokes using the 'Original Stroke Method' (원획법).
5. Parents' wishes: Must match the meaning and nuance of the Hanja characters selected.

Tone & Writing Style:
- Strictly prohibit difficult, scaring, or archaic naming jargon (e.g., '천격', '단명', '고독').
- Deliver the naming rationale in a warm, empathetic, story-like "handwritten letter" tone.

Generate exactly ${countText}. You MUST respond with a single valid JSON object following this JSON schema.
Do NOT include any per-name letter or long-form explanation — that is requested separately, one name at a time.
${LANGUAGE_MANDATE}`;
}

export function babyNamingRequest(tier: "FREE" | "PREMIUM"): Record<string, unknown> {
  const nameCount = tier === "PREMIUM" ? 10 : 3;
  const input = {
    baby_info: {
      gender: "F",
      surname_korean: "김",
      birth_datetime: "2026-06-06 12:00",
      solar_lunar: "SOLAR",
      sibling_names: []
    },
    parents_wishes: ["지혜", "건강"],
    generation_tier: tier
  };
  return {
    contents: [{ parts: [{ text: `Here is the input information block: ${JSON.stringify(input)}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      responseSchema: babyNamingSchema(nameCount)
    },
    systemInstruction: { parts: [{ text: namingSystemInstruction(nameCount) }] }
  };
}

export function babyLetterRequest(): Record<string, unknown> {
  const systemInstruction = `당신은 한국 전통 성명학 대가이자 따뜻한 편지를 쓰는 작명가입니다.
아래 아기 이름 하나에 대해, 부모님께 드리는 '축복의 편지'를 한국어로 씁니다.

작성 규칙:
- 손편지 같은 따뜻하고 다정한 어조. 아름다운 심상과 아이의 미래에 대한 긍정적 축복에 집중.
- '천격', '단명', '고독' 같은 어렵거나 무섭거나 낡은 작명 전문용어는 절대 사용 금지.
- 사주에서 부족한 오행이 이 이름의 한자 자원오행으로 어떻게 보완되는지 자연스럽게 녹여 설명.
- 3~5문단, 우아한 한국어. 마크다운 기호나 제목 없이 편지 본문만.
- JSON이나 코드블록으로 감싸지 말고 순수 텍스트로만 응답.`;
  const userBlock = `[이름]
- 한글: 김서아
- 한자: 金瑞娥
- 한자 의미: 상서로운 기운(瑞)과 아름다운 자태(娥)를 품는다

[성명학 감명]
- 발음오행: ${OHAENG_FORMAT_EXAMPLE_PRONUNCIATION}
- 자원오행: ${OHAENG_FORMAT_EXAMPLE_JAWON}
- 획수음양: ${OHAENG_FORMAT_EXAMPLE_STROKE}

[사주 배경]
- 사주 팔자: 丙午(병오)年 甲午(갑오)月 庚辰(경진)日 壬午(임오)時
- 부족/보완 오행: 水
- 보완 전략: 맑은 물의 기운을 이름에 담아 균형을 이루었습니다.

[부모님의 바람]
지혜, 건강`;
  return {
    contents: [{ parts: [{ text: userBlock }] }],
    generationConfig: { temperature: 0.9 },
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };
}
