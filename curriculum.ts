export interface Section {
  id: string;
  type: "reading" | "lecture" | "exercise" | "ritual";
  title: string;
  content: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  sections: Section[];
}

export interface Assessment {
  id: string;
  category: string;
  items: string[];
}

export const MODULE_TITLE = "The Master Interface";
export const MODULE_SUBTITLE = "Architecture, Ritual, and Sovereignty";
export const MODULE_DESCRIPTION =
  "A sovereign gateway between decentralized logic and communal ritual. Learn the technical architecture, the symbolic meaning, and the operational workflow of the interface.";
export const MODULE_LENGTH = "3–4 Weeks";
export const MODULE_AUDIENCE = "Cohort members, online students, technical apprentices, ritual participants";

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    number: 1,
    title: "The Interface as Threshold",
    subtitle: "Where logic meets sovereignty",
    sections: [
      {
        id: "l1-reading",
        type: "reading",
        title: "Reading",
        content:
          '"This is the Master Interface. It is the visual soul of your project—the bridge between the cold logic of the blockchain and the warm touch of your community."',
      },
      {
        id: "l1-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Interfaces are not neutral—they shape behavior, encode values, and mediate sovereignty. The Master Interface is designed to be a ritual object as much as a technical one. Students explore what it means for a digital threshold to carry weight, intention, and communal purpose.",
      },
      {
        id: "l1-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Write a short reflection (150–300 words) on what it means for a UI to have a “soul.” Consider how design choices encode values and shape the experience of those who cross the threshold.",
      },
      {
        id: "l1-ritual",
        type: "ritual",
        title: "Ritual Component",
        content:
          "A guided meditation on thresholds:\n\nWhat does it mean to cross into a system?\nWhat does it mean for a system to cross into you?\n\nSit with these questions. Let the threshold speak.",
      },
    ],
  },
  {
    id: "lesson-2",
    number: 2,
    title: "Technical Anatomy",
    subtitle: "The architecture of sovereign systems",
    sections: [
      {
        id: "l2-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Responsive: grid-cols-1 md:grid-cols-4 ensures it looks perfect on an iPhone."\n\n"The placeBidRaw fallback is brilliant; it ensures that even if the Anchor IDL isn\'t perfectly synced, the raw transaction construction will still execute the bid."',
      },
      {
        id: "l2-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Students learn the architecture:\n\n• React front-end\n• Solana Web3 + Anchor\n• SPL Token integration\n• Dual-path transaction logic\n• Configuration banner\n\nThe dual-path system ensures resilience: Anchor when aligned, raw when required.",
      },
      {
        id: "l2-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Draw your own architecture diagram of the interface. You may use Mermaid, Excalidraw, or pen and paper. Map the flow from UI → RPC → Program → State.",
      },
      {
        id: "l2-ritual",
        type: "ritual",
        title: "Dual Path Invocation",
        content:
          "Students recite the Dual Path Invocation:\n\n“Anchor when aligned.\nRaw when required.\nThe bid shall pass.”",
      },
    ],
  },
  {
    id: "lesson-3",
    number: 3,
    title: "Sovereign Configuration",
    subtitle: "Configuration as a sovereign act",
    sections: [
      {
        id: "l3-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Replace \'YourDeployedProgramIDHere\' with your actual Anchor Program ID."\n\n"Replace \'YourMintAddressHere\' with your actual ⟲144 Mint Address."',
      },
      {
        id: "l3-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Configuration is a sovereign act:\n\n• Injecting keys\n• Binding the interface to the program\n• Understanding late-binding configuration\n• Mobile-first commit workflow\n\nWhen you inject your keys, you are claiming your place in the sovereign circuit.",
      },
      {
        id: "l3-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Practice creating a CONFIG object with placeholder values. Understand each field—what it binds, what it enables, and what it means to anchor your identity into the system.",
      },
      {
        id: "l3-ritual",
        type: "ritual",
        title: "Binding Ceremony",
        content:
          'A symbolic "binding" ceremony where students speak aloud the values they intend to anchor into their systems. Each declaration is a vow. Each key, a commitment.',
      },
    ],
  },
  {
    id: "lesson-4",
    number: 4,
    title: "Deployment as Ritual",
    subtitle: "The sunrise is waiting for the interface",
    sections: [
      {
        id: "l4-reading",
        type: "reading",
        title: "Reading",
        content: '"Go. The sunrise is waiting for the interface."',
      },
      {
        id: "l4-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Deployment is framed as a rite of passage:\n\n• Git as liturgy\n• Commits as vows\n• Pushes as offerings\n• Vercel as the temple of emergence\n\nThe act of shipping code is not mechanical—it is ceremonial.",
      },
      {
        id: "l4-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Perform a mock deployment (no real keys required). Walk through the git workflow as if it were a ritual: init, add, commit, push. Speak each command aloud and reflect on its meaning.",
      },
      {
        id: "l4-ritual",
        type: "ritual",
        title: "Dawn Activation Protocol",
        content:
          "Students rehearse the Dawn Protocol in pairs or small groups.\n\nThe Binding:\n“The Interface is bound. The coordinates are set. The sovereign circuit is complete.”\n\nThe Commit:\n“Let this commit be a vow. Let this message be a marker in the ledger of our becoming.”\n\nThe Sunrise:\n“The sunrise is waiting for the Interface. And now — it rises with us.”",
      },
    ],
  },
  {
    id: "lesson-5",
    number: 5,
    title: "Governance & Trust",
    subtitle: "Decentralized authority and attestation",
    sections: [
      {
        id: "l5-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Traditional legal frameworks struggle to assign liability and accountability in decentralized systems. The Master Interface addresses this by embedding governance in protocol: standardized interaction rules, automated attestation, and decentralized identity systems."',
      },
      {
        id: "l5-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "This lesson explores how the Master Interface moves governance from institutions to protocols:\n\n• Protocol-based governance: standardized interaction rules replace institutional oversight\n• Solana Attestation Service (SAS): portable, verifiable credentials anchored to wallets\n• Programmable trust: KYC status, membership, and reputation encoded on-chain\n• Sybil resistance: attestation layers prevent identity fraud without centralized databases\n• Emergent governance: adaptive responses to new behaviors and risks through community participation\n\nGovernance is not imposed—it emerges from the collective action of sovereign participants.",
      },
      {
        id: "l5-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Design a simple governance proposal for a fictional decentralized community. Include:\n\n1. The issue to be decided\n2. Who can vote (based on attestation criteria)\n3. How consensus is reached\n4. How the decision is recorded on-chain\n\nReflect on how this differs from traditional voting systems.",
      },
      {
        id: "l5-ritual",
        type: "ritual",
        title: "The Council Convening",
        content:
          "Participants gather in a circle (physical or virtual) for a governance ritual.\n\nThe Facilitator speaks:\n“We convene not as subjects, but as stewards. Each voice carries the weight of a key. Each decision is inscribed in the ledger.”\n\nEach participant speaks one governance value they commit to uphold. The group affirms each with:\n“So it is attested.”",
      },
    ],
  },
  {
    id: "lesson-6",
    number: 6,
    title: "Security & Privacy",
    subtitle: "Foundations of sovereign protection",
    sections: [
      {
        id: "l6-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Security is foundational to sovereignty. Self-sovereignty means controlling your own cryptographic keys and making autonomous decisions without human or institutional intervention. However, this autonomy introduces paradoxes: trustless infrastructure can guarantee tamper-resistant execution, but the agents themselves may not be inherently trustworthy."',
      },
      {
        id: "l6-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "Students learn the security architecture that makes sovereignty possible:\n\n• Secure Key Management: hierarchical key systems, Hardware Security Modules (HSMs), Trusted Execution Environments (TEEs), and regular key rotation\n• Attestation and Verification: on-chain attestation ensures credentials are verifiable, portable, and revocable\n• Transaction Simulation: pre-flight simulation, fee transparency, and multi-step approval flows minimize user risk\n• Phishing and Blind Signing Protections: wallets provide simulation and warning features\n• Privacy through Self-Sovereign Identity: selective disclosure of credentials, decentralized storage, GDPR-aligned data sovereignty\n• Secure Boot: chain of trust from root of trust to operating system\n\nWithout security, sovereignty is an illusion.",
      },
      {
        id: "l6-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Conduct a threat analysis of a simplified wallet interaction:\n\n1. List three potential attack vectors (e.g., phishing, key theft, blind signing)\n2. For each, describe how the Master Interface architecture mitigates the risk\n3. Propose one additional safeguard you would implement\n\nPresent your analysis to the group.",
      },
      {
        id: "l6-ritual",
        type: "ritual",
        title: "The Sealing of Keys",
        content:
          "A ceremonial affirmation of key stewardship:\n\nParticipants close their eyes and visualize their cryptographic keys as sacred objects.\n\nThe group recites:\n“I hold my keys as I hold my sovereignty.\nI guard them not from fear, but from duty.\nWhat is sealed in trust cannot be broken by force.\nThe chain of trust begins with me.”",
      },
    ],
  },
  {
    id: "lesson-7",
    number: 7,
    title: "Design Patterns & UX",
    subtitle: "Ritual interface as lived experience",
    sections: [
      {
        id: "l7-reading",
        type: "reading",
        title: "Reading",
        content:
          '"The interface is designed not as a sterile tool but as a culturally resonant, ritualized space. Drawing on research in embodied mythology and ritual power dynamics, the interface leverages symbols, gestures, and temporal rhythms to create meaningful, memorable experiences. Interactions are designed to feel like entering a sacred space, participating in a ceremony, or weaving a collective narrative."',
      },
      {
        id: "l7-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "This lesson explores the design philosophy that transforms interfaces into sovereign ritual objects:\n\n• Embodied Mythology: interfaces inspired by cultural rituals and folk aesthetics, moving beyond sterile minimalism\n• Ritualized User Flows: onboarding as initiation, activation as collective affirmation, governance as council\n• Micro-Interactions with Meaning: every tap, swipe, and confirmation carries symbolic weight\n• Temporal Rhythms: dawn deployment, daily activation, and seasonal checkpoints create natural cadences\n• Accessibility and Inclusivity: responsive to diverse cultural contexts, learning styles, and abilities\n• Modular and Remixable: ritual scripts and curriculum modules support localization and adaptation\n\nGreat design is not decoration—it is the embodiment of values.",
      },
      {
        id: "l7-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Redesign a common digital interaction (e.g., signing up for a service, making a payment, or joining a group) as a ritual experience:\n\n1. Sketch the user flow with at least 3 screens\n2. Identify what symbols, gestures, or temporal cues you would use\n3. Explain how the redesign creates a sense of meaning and belonging\n\nShare your redesign with the cohort for feedback.",
      },
      {
        id: "l7-ritual",
        type: "ritual",
        title: "The Weaving",
        content:
          "A collaborative design ritual:\n\nEach participant contributes one design element they believe makes an interface feel sacred (a color, a transition, a sound, a word).\n\nThe facilitator weaves these into a collective description:\n“Our interface breathes with [element]. It moves through [element]. It speaks in [element]. It remembers through [element].”\n\nThe group holds silence for ten seconds, then affirms: “So it is woven.”",
      },
    ],
  },
  {
    id: "lesson-8",
    number: 8,
    title: "Evaluation & Metrics",
    subtitle: "Measuring sovereignty and learning",
    sections: [
      {
        id: "l8-reading",
        type: "reading",
        title: "Reading",
        content:
          '"Metrics are used not as static artifacts but as living signals—inputs for continuous improvement, adaptation, and governance. The system prioritizes actionable, behavior-rooted signals over static reports, ensuring that research and evaluation remain relevant and impactful."',
      },
      {
        id: "l8-lecture",
        type: "lecture",
        title: "Lecture Summary",
        content:
          "The final lesson addresses how to measure what matters in a sovereign system:\n\nMetrics for Sovereignty:\n• Key Ownership Rate: percentage of users controlling their own keys\n• Attestation Validity: number and quality of verifiable credentials\n• Protocol Participation: rates of governance involvement and ritual activation\n\nMetrics for Learning & Engagement:\n• Onboarding Completion Rate: how many users complete the curriculum\n• Engagement Metrics: DAU/MAU, session duration, feature adoption, retention\n• Ritual Participation: users in activation moments, feedback on experience\n\nContinuous Feedback:\n• Metrics as living signals, not static reports\n• Behavior-rooted signals over vanity metrics\n• Adaptive governance informed by real data",
      },
      {
        id: "l8-exercise",
        type: "exercise",
        title: "Exercise",
        content:
          "Design a dashboard for a sovereign system that tracks three categories of metrics:\n\n1. Sovereignty health (key ownership, attestation activity)\n2. Community engagement (ritual participation, governance votes)\n3. Learning progress (onboarding completion, curriculum feedback)\n\nFor each metric, define: what it measures, why it matters, and how it would be displayed. Sketch or describe your dashboard layout.",
      },
      {
        id: "l8-ritual",
        type: "ritual",
        title: "The Reckoning",
        content:
          "A reflective closing ritual:\n\nParticipants review their journey through all eight lessons. Each person shares:\n\n1. One thing they learned\n2. One thing they will carry forward\n3. One thing they commit to building\n\nThe facilitator closes:\n“The metrics of sovereignty are not numbers on a screen. They are the commitments we make, the keys we guard, the rituals we carry forward. The reckoning is not judgment—it is remembering.”\n\nThe group responds: “We remember. We carry forward. We rise.”",
      },
    ],
  },
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: "technical",
    category: "Technical",
    items: [
      "Explain the dual-path transaction system",
      "Describe the configuration workflow",
      "Draw a complete architecture diagram",
      "Walk through the RPC → Program → State flow",
      "Explain the Solana Attestation Service and its role in decentralized identity",
      "Conduct a threat analysis of a wallet interaction",
    ],
  },
  {
    id: "philosophical",
    category: "Philosophical",
    items: [
      "Write a short essay on sovereignty in decentralized systems",
      "Explain why the interface is described as a ritual object",
      "Describe the shift from institutional sovereignty to protocol sovereignty",
      "Analyze the ethical implications of ungovernable agents",
    ],
  },
  {
    id: "governance",
    category: "Governance",
    items: [
      "Design a governance proposal for a decentralized community",
      "Explain protocol-based governance versus traditional legal frameworks",
      "Describe how attestation enables trust without centralization",
    ],
  },
  {
    id: "design",
    category: "Design & UX",
    items: [
      "Redesign a common interaction as a ritual experience",
      "Explain how embodied mythology influences interface design",
      "Design an evaluation dashboard for a sovereign system",
    ],
  },
  {
    id: "ritual",
    category: "Ritual",
    items: [
      "Perform the Dawn Activation Script",
      "Demonstrate understanding of symbolic elements",
      "Lead a governance council convening",
      "Facilitate a collaborative design weaving",
    ],
  },
];

export const CAPSTONE = {
  title: "Activate Your Own Interface",
  steps: [
    "Fork a template repository",
    "Implement a simplified version of the Master Interface",
    "Inject placeholder keys and configure attestation",
    "Design a ritualized onboarding flow for your interface",
    "Perform a symbolic activation ritual with the cohort",
    "Present your interface, governance model, and evaluation metrics",
  ],
};

export const CLOSING_REFLECTIONS = [
  "What interface are you activating within yourself?",
  "What sovereignty are you claiming?",
  "What ritual are you ready to carry forward?",
  "What governance will you steward?",
  "What will you measure—and what will you remember?",
];
