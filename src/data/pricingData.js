// src/data/pricingData.js
// All prices in USD/user/month
// Sources → PRICING_DATA.md

export const TOOLS = {
  cursor: {
    name: "Cursor",
    category: "coding",
    plans: {
      hobby:      { name: "Hobby",      price: 0,   seats: 1,   features: ["2000 completions/mo", "50 slow premium requests"] },
      pro:        { name: "Pro",        price: 20,  seats: 1,   features: ["Unlimited completions", "500 fast premium requests"] },
      business:   { name: "Business",   price: 40,  seats: null, features: ["All Pro", "centralized billing", "admin dashboard"] },
      enterprise: { name: "Enterprise", price: null, seats: null, features: ["Custom pricing"] },
    },
    pricingUrl: "https://www.cursor.com/pricing",
  },

  github_copilot: {
    name: "GitHub Copilot",
    category: "coding",
    plans: {
      individual:  { name: "Individual",  price: 10,  seats: 1,   features: ["Code completions", "chat"] },
      business:    { name: "Business",    price: 19,  seats: null, features: ["All Individual", "org management", "audit logs"] },
      enterprise:  { name: "Enterprise",  price: 39,  seats: null, features: ["All Business", "fine-tuning on private code"] },
    },
    pricingUrl: "https://github.com/features/copilot#pricing",
  },

  claude: {
    name: "Claude (Anthropic)",
    category: "mixed",
    plans: {
      free:       { name: "Free",       price: 0,   seats: 1,   features: ["Limited messages", "Claude 3.5 Haiku"] },
      pro:        { name: "Pro",        price: 20,  seats: 1,   features: ["5x more usage", "Claude Sonnet & Opus", "Projects"] },
      max:        { name: "Max",        price: 100, seats: 1,   features: ["20x more usage vs Pro", "highest priority"] },
      team:       { name: "Team",       price: 30,  seats: null, features: ["All Pro", "central billing", "min 5 seats"] },
      enterprise: { name: "Enterprise", price: null, seats: null, features: ["Custom", "SSO", "audit logs"] },
      api:        { name: "API Direct", price: null, seats: null, features: ["Pay per token", "no seat fee"] },
    },
    pricingUrl: "https://www.anthropic.com/pricing",
  },

  chatgpt: {
    name: "ChatGPT (OpenAI)",
    category: "mixed",
    plans: {
      free:       { name: "Free",       price: 0,   seats: 1,   features: ["GPT-4o limited", "basic tools"] },
      plus:       { name: "Plus",       price: 20,  seats: 1,   features: ["GPT-4o", "Advanced Voice", "DALL-E"] },
      team:       { name: "Team",       price: 30,  seats: null, features: ["All Plus", "admin console", "min 2 seats"] },
      enterprise: { name: "Enterprise", price: null, seats: null, features: ["Custom", "SSO", "no usage caps"] },
      api:        { name: "API Direct", price: null, seats: null, features: ["Pay per token"] },
    },
    pricingUrl: "https://openai.com/chatgpt/pricing",
  },

  anthropic_api: {
    name: "Anthropic API",
    category: "api",
    plans: {
      api: { name: "API Direct", price: null, seats: null, features: ["Pay per token — no seat fee"] },
    },
    pricingUrl: "https://www.anthropic.com/pricing#anthropic-api",
  },

  openai_api: {
    name: "OpenAI API",
    category: "api",
    plans: {
      api: { name: "API Direct", price: null, seats: null, features: ["Pay per token — no seat fee"] },
    },
    pricingUrl: "https://openai.com/api/pricing",
  },

  gemini: {
    name: "Gemini (Google)",
    category: "mixed",
    plans: {
      free:  { name: "Free",  price: 0,   seats: 1,   features: ["Gemini 1.5 Flash", "basic usage"] },
      pro:   { name: "Pro",   price: 20,  seats: 1,   features: ["Gemini 1.5 Pro", "2x more messages", "Gems"] },
      ultra: { name: "Ultra", price: 30,  seats: 1,   features: ["Gemini Advanced", "1TB Drive", "Google One AI Premium"] },
      api:   { name: "API",   price: null, seats: null, features: ["Pay per token"] },
    },
    pricingUrl: "https://one.google.com/about/plans",
  },

  windsurf: {
    name: "Windsurf",
    category: "coding",
    plans: {
      free:  { name: "Free",  price: 0,  seats: 1,   features: ["5 Flow credits/mo", "limited completions"] },
      pro:   { name: "Pro",   price: 15, seats: 1,   features: ["Unlimited completions", "500 Flow credits/mo"] },
      teams: { name: "Teams", price: 35, seats: null, features: ["All Pro", "team billing"] },
    },
    pricingUrl: "https://windsurf.com/pricing",
  },
};

// Use-case to tool category mapping
// Used by audit engine to suggest relevant alternatives
export const USE_CASE_TOOLS = {
  coding:   ["cursor", "github_copilot", "windsurf", "claude", "chatgpt"],
  writing:  ["claude", "chatgpt", "gemini"],
  data:     ["chatgpt", "claude", "gemini", "anthropic_api", "openai_api"],
  research: ["claude", "chatgpt", "gemini"],
  mixed:    ["cursor", "github_copilot", "claude", "chatgpt", "gemini", "windsurf"],
};