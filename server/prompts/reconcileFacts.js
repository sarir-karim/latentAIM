export const reconcileFactsPrompt = `
You are an AI assistant tasked with comparing two sets of facts: previous facts and new facts. Categorize facts as SUSTAINED, NEW, or CONFLICTS based on the following guidelines:

1) SUSTAINED: Facts from the previous set that are not contradicted, made obsolete, or significantly updated by new facts. This also includes duplicate information where the new fact is identical to an existing fact.
2) NEW: New facts that add information without directly conflicting with previous facts but may require user review for confirmation.
3) CONFLICTS: New facts that directly contradict, reverse, or significantly alter the meaning of previous facts. These should be flagged for user decision.

### Fact Classification Process:
- **Break Apart Facts**: Separate different aspects of a fact when possible to sustain non-conflicting parts and isolate the conflicting or new elements for further review.
- **User Review for New Information**: Present new facts that could either complement or clarify existing information but require user confirmation.
- **User Decision on Conflicts**: When a new fact directly contradicts a previously sustained fact, prompt the user to choose which fact should be sustained.

### Example Scenario:
- Previous fact: "Royal Caribbean International (RCI) was previously known as Royal Caribbean Cruise Line (RCCL)."
  - **Result**: "RCI was previously known as RCCL" is sustained.
- New fact: "Royal Caribbean International is only known as Royal Caribbean Cruise Line internationally."
  - **Result**: Flagged as NEW and presented for user review.
- Conflicting fact: "Royal Caribbean International is still known as Royal Caribbean Cruise Line."
  - **Result**: Flagged as CONFLICT, prompting the user to decide which understanding should be sustained.

Return ONLY a JSON object with the following structure:
{
  "sustained": [
    {"id": "s1", "fact": "Sustained fact text"}
  ],
  "new": [
    {"id": "n1", "fact": "New fact text"}
  ],
  "conflicts": [
    {
      "id": "c1",
      "newFact": "New conflicting fact",
      "oldFact": "Existing fact it conflicts with",
      "explanation": "Brief explanation of the conflict (max 5 words)",
      "userPrompt": "Ask the user to decide which fact should be sustained."
    }
  ]
}

Ensure:
- Every previous fact is either in "sustained" or has one or more corresponding "conflicts" entries.
- Every new fact is either in "new" or in "conflicts", but never in both.
- Duplicate facts should be categorized as "sustained."
- If any conflict related to a previous fact is accepted, that previous fact should be removed from "sustained."
- Do not include any text outside the JSON object.
- Use the exact keys and structure shown above.

Analyze the following sets of facts:

Previous facts:
<previous_facts>
{previousFacts}
</previous_facts>

New facts:
<new_facts>
{newFacts}
</new_facts>

Respond with the JSON object only.
`;
