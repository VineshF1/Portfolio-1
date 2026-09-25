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
          'Ask where any satellite is in plain English and get live orbital answers. Two agents split the job — one talks, one does the math — with an MCP server as the exclusive gateway to N2YO, Celestrak, and Nominatim, plus true 3D slant-range distance.',
        stack: ['Python', 'Google ADK', 'MCP', 'N2YO'],
        metrics: [
          { k: 'Architecture', v: 'Multi-agent + MCP' },
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
          'An F1 chatbot that routes every question to the right brain — RAG over 1,469 Wikipedia chunks for trivia, Text-to-SQL for stats — with hybrid BM25 + pgvector search, prompt-injection detection, and a live React chat UI.',
        stack: ['Python', 'FastAPI', 'pgvector', 'React'],
        metrics: [
          { k: 'Data scale', v: '1,469 chunks indexed' },
          { k: 'Deployed', v: 'Live demo online' },
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
          'Qwen3-8B fine-tuned on 10,656 F1 question-answer pairs — race results, qualifying, driver bios, champions. QLoRA on a Colab T4, weights published on Hugging Face, training notebook in the repo.',
        stack: ['Unsloth', 'QLoRA', 'Qwen3-8B', 'Hugging Face'],
        metrics: [
          { k: 'Training data', v: '10,656 QA pairs' },
          { k: 'Published', v: 'Model on Hugging Face' },
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
        name: 'Models & Frameworks',
        items: ['Python', 'JavaScript', 'LangChain', 'LLM fine-tuning (QLoRA / Unsloth)', 'Google ADK', 'MCP', 'Prompt engineering'],
      },
      {
        name: 'Retrieval & Data',
        items: ['RAG pipelines', 'Hybrid search (BM25 + dense)', 'pgvector', 'Supabase', 'PostgreSQL', 'Embeddings + re-ranking', 'NLP'],
      },
      {
        name: 'Agents & Tools',
        items: ['Multi-agent systems', 'Agentic AI', 'Function calling / tool use', 'SGP4 orbital mechanics', 'Web scraping'],
      },
      {
        name: 'Ship & Serve',
        items: ['FastAPI', 'Eval harnesses', 'Docker · CI/CD', 'Vercel', 'React · Next.js · Astro', 'Git · GitHub'],
      },
    ],
    exploring: 'Multi-agent orchestration & production LLM serving',
  },

  experience: {
    index: '04',
    id: 'experience',
    title: 'Experience',
    entries: [
      {
        period: '2024 — Now',
        role: 'Frontend Engineer',
        org: 'Nexline Systems', // [REPLACE]
        body: 'Own the interface layer of a real-time logistics platform — a WebGL fleet map and ops surfaces used daily by 2k+ operators; cut median interaction latency 38%.', // [REPLACE]
      },
      {
        period: '2023 — 2024',
        role: 'Creative Developer',
        org: 'Independent', // [REPLACE]
        body: 'Interactive sites and product surfaces for studio clients. Three launches, all shipping under 1 s LCP on mid-tier phones.', // [REPLACE]
      },
      {
        period: '2019 — 2023',
        role: 'B.E. Computer Science',
        org: 'Pune Institute of Engineering', // [REPLACE]
        body: 'Thesis: real-time neural rendering in the browser. Graduated first class with distinction.', // [REPLACE]
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
        desc: 'Multi-agent satellite tracking — ADK agents, MCP gateway, real-time orbital mechanics.',
        stack: 'Python',
        metric: 'Multi-agent system',
      },
      {
        name: 'Halos-AI',
        desc: 'F1 chatbot — dual RAG + Text-to-SQL pipelines with query classification.',
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
        desc: 'Qwen3-8B fine-tuned on 10,656 F1 QA pairs — QLoRA via Unsloth, weights on Hugging Face.',
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
