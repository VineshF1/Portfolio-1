/**
 * CONTENT SOURCE — edit this file to change site text, links, and projects.
 */

export const site = {
  identity: {
    name: 'Vinesh',
    role: 'AI Engineer',
    focus: 'LLMs · RAG · AI products',
    location: '',
    availability: '',
    availabilityShort: '',
  },

  links: {
    email: 'vinesharceus@gmail.com',
    github: 'https://github.com/VineshF1',
    linkedin: 'https://www.linkedin.com/in/vinesh007',
  },

  nav: [
    { label: 'Projects', href: '#work' },
    { label: 'Tech Stack', href: '#capabilities' },
    // { label: 'Experience', href: '#experience' }, // hidden until there is real experience to show
    { label: 'Contact', href: '#contact' },
  ],

  hero: {
    eyebrow: 'AI Engineer — LLMs · RAG · Agents',
    headline: 'Intelligence, engineered.',
    lede: 'I build AI systems that actually ship — multi-agent orchestration over live APIs, RAG that grounds every answer, and evals that gate every release. Measured, honest, and built to be used.',
    primaryCta: 'Projects',
    primaryHref: '#work',
    secondaryCta: 'GitHub',
  },

  approach: {
    index: '01',
    id: 'approach',
    title: 'Approach',
    statement:
      'Models are commodities. The product is the system around them — retrieval that grounds, evals that verify, interfaces that earn trust.',
    body: [
      'I build AI the way systems people build engines: measured, evaluated, honest about failure modes. A pipeline is only done when it behaves under real inputs — not demo inputs.',
      'That means grounding every answer in retrievable sources, testing with evals instead of vibes, and designing the human layer so uncertainty is visible, not hidden.',
    ],
    principles: [
      {
        title: 'Ground everything',
        body: 'An ungrounded answer is a liability. Retrieval, citations, sources attached — always show the work.',
      },
      {
        title: 'Eval, don’t vibe-check',
        body: 'If it isn’t measured it isn’t shipped. Datasets, regression suites, and honest error budgets.',
      },
      {
        title: 'Ship the whole product',
        body: 'The model is 20% of the work. Latency, streaming, state, edge cases — that’s where trust is built.',
      },
    ],
  },

  work: {
    index: '02',
    id: 'work',
    title: 'Projects',
    note: 'Shipped builds — live, working, and open to explore',
    projects: [
      {
        id: 'skytrace',
        num: '01',
        year: '2026',
        title: 'SkyTrace',
        summary:
          'Ask where any satellite is in plain English and get live orbital answers. Two agents split the job — one talks, one does the math — with one MCP server as the exclusive gateway to N2YO, Celestrak, and Nominatim. SGP4 propagation, ECEF/Haversine slant-range math, and token-bucket rate limiting; 14/14 tests pass.',
        stack: ['Python', 'Google ADK', 'MCP', 'N2YO'],
        metrics: [
          { k: 'Tests', v: '14/14 passing' },
          { k: 'Scope', v: '3 live APIs' },
        ],
        href: 'https://github.com/VineshF1/SkyTrace',
        hrefLabel: 'Source',
      },
      {
        id: 'halos-ai',
        num: '02',
        year: '2026',
        title: 'Halos AI',
        summary:
          'An F1 chatbot that routes every question to the right brain — hybrid RAG (BM25 + pgvector over 1,469 embeddings from 64 Wikipedia pages) for trivia, Text-to-SQL for stats — with prompt-injection detection, per-IP rate limiting, and a live React/TypeScript chat UI.',
        stack: ['Python', 'FastAPI', 'pgvector', 'React'],
        metrics: [
          { k: 'Routing', v: '27/30 correct' },
          { k: 'Text-to-SQL', v: '16/20 (80%)' },
        ],
        href: 'https://github.com/VineshF1/Halos-AI',
        hrefLabel: 'Source',
      },
      {
        id: 'suze',
        num: '03',
        year: '2026',
        title: 'Suze',
        summary:
          'A secure agentic RAG assistant for your own documents. Upload PDFs and ask — a 3-stage hybrid filter retrieves, then a LangGraph loop critiques and reformulates until the answer is grounded or safely refused.',
        stack: ['Python', 'LangGraph', 'ChromaDB', 'React'],
        metrics: [
          { k: 'Search', v: 'Hybrid BM25 + Dense + RRF' },
          { k: 'Pattern', v: 'Agentic self-correction' },
        ],
        href: 'https://github.com/VineshF1/Suze',
        hrefLabel: 'Source',
      },
      {
        id: 'eau-rouge',
        num: '04',
        year: '2026',
        title: 'EauRouge-F1',
        summary:
          'Qwen3-8B fine-tuned with QLoRA (r=32, 4-bit) on 5,872 rows from a 10,656-pair F1 Q&A dataset — race results, qualifying, driver bios, champions. Found 88.5% answer leakage in a random split, rebuilt by source with zero shared answers, and published the weights on Hugging Face.',
        stack: ['Unsloth', 'QLoRA', 'Qwen3-8B', 'Hugging Face'],
        metrics: [
          { k: 'Eval lift', v: '33 → 43 / 100' },
          { k: 'Training data', v: '5,872 rows' },
        ],
        href: 'https://github.com/VineshF1/EauRouge-F1',
        hrefLabel: 'Source',
      },
    ],
  },

  capabilities: {
    index: '03',
    id: 'capabilities',
    title: 'Tech Stack',
    groups: [
      {
        name: 'Languages & Frameworks',
        items: ['Python', 'SQL', 'TypeScript', 'JavaScript', 'FastAPI', 'React', 'LangChain', 'LangGraph', 'Google ADK', 'Unsloth'],
      },
      {
        name: 'Retrieval & Data',
        items: ['RAG pipelines', 'Hybrid search (BM25 + pgvector)', 'Text-to-SQL', 'PostgreSQL', 'pgvector', 'Vector databases', 'NVIDIA NV-Embed-v1'],
      },
      {
        name: 'Agents & Tooling',
        items: ['Multi-agent systems', 'MCP', 'Prompt engineering', 'LLM guardrails', 'QLoRA fine-tuning', 'SGP4 orbital mechanics', 'Web scraping'],
      },
      {
        name: 'Ship & Serve',
        items: ['Git · GitHub', 'Docker', 'Vercel · Render', 'AI-assisted development', 'Per-IP rate limiting', 'Eval harnesses'],
      },
    ],
    exploring: 'Multi-agent orchestration & production LLM serving',
  },

  experience: {
    index: '04',
    id: 'experience',
    title: 'Education',
    entries: [
      {
        period: '2027',
        role: 'B.Tech — Artificial Intelligence & Machine Learning',
        org: 'Sri Vasavi Inst. of Engg. & Tech., Nandamuru',
        body: 'CGPA: 7.94',
      },
      {
        period: '2023',
        role: 'Intermediate',
        org: 'Pavithra Co-Op Junior College, Machilipatnam',
        body: 'Percentage: 85.4%',
      },
      {
        period: '2021',
        role: 'SSC',
        org: 'Dr. KKR Gowtham School, Machilipatnam',
        body: 'Percentage: 99%',
      },
    ],
  },

  oss: {
    index: '04',
    id: 'oss',
    title: 'Repositories',
    note: 'Source code, datasets, and weights — open for the community',
    repos: [
      {
        name: 'SkyTrace',
        desc: 'Two-agent satellite tracking — one MCP gateway for Celestrak, N2YO & Nominatim; 14/14 tests passing.',
        stack: 'Python',
        metric: 'Multi-agent system',
      },
      {
        name: 'Halos-AI',
        desc: 'F1 chatbot — hybrid BM25 + pgvector RAG vs Text-to-SQL routing; 27/30 routing, 16/20 SQL queries correct.',
        stack: 'Python · React',
        metric: 'Deployed full-stack app',
      },
      {
        name: 'Suze',
        desc: 'Secure agentic RAG assistant — 3-stage hybrid filter, LangGraph self-correction.',
        stack: 'Python',
        metric: 'Hybrid search · Self-correcting',
      },
      {
        name: 'EauRouge-F1',
        desc: 'Qwen3-8B QLoRA fine-tune — leakage-safe split, answer-match lifted 33 → 43 / 100. Weights on Hugging Face.',
        stack: 'Jupyter',
        metric: 'Fine-tuned model on HF',
      },
    ],
    profileLabel: 'All repositories',
  },

  contact: {
    index: '05',
    id: 'contact',
    statement: 'Let’s build something intelligent.',
    sub: 'Open to collaborations, open-source work, and interesting side projects. If you are building with AI — models, retrieval, agents, or anything in between — let’s talk.',
    note: 'Usually replies within 24 h',
  },
};
