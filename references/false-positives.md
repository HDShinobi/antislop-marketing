# false positives: what not to flag

Read only by `antislop-check`. When generating text there is nothing to
false-accuse.

A clean human writer hits several of the patterns in `core.md` without any
machine involvement. Before reporting anything, check you are not gutting good
prose.

**The governing principle: report a cluster, never an isolated tell.** One em
dash means nothing. Em dashes plus rule-of-three plus a stock metaphor plus a
"Conclusion" section is a confession.

---

## Not evidence on its own

### Polished grammar and consistent style
Many writers are professional, or were edited. Polish is not authorship.

### Mixed casual and formal register
Usually signals a person in a technical field, a young writer, or someone whose
prose habits simply run that way. Not a chatbot.

### Bland or dry prose
Machine prose has *specific* tells. Dryness without those tells is just dry
writing, and plenty of good reports are dry.

### Formal or academic vocabulary
The tells involve *particular* inflated words, not all long words. Do not
flatten a precise term because it sounds elevated.

### A letter-style opening or closing
Salutations and sign-offs predate chatbots by centuries.

### One transition word
"However", "moreover", "consequently" are machine-coded only when piled up. A
single "however" is a sentence connector.

### Curly quotation marks alone
Word, Google Docs and most editors curl quotes automatically. They count only
when stacked with other tells.

### An em dash alone in quoted material
The dash rule applies to text this tool produces. A quotation from a source that
uses em dashes is a quotation.

### A single short emphatic sentence
People use clipped sentences to land a point. Flag staccato only when several
short fragments run together and inflate the tone.

### A candid opener used mid-sentence
"Honestly" and "look" are ordinary in casual writing. The tell is the theatrical
standalone pause, not the word.

### An unsourced claim in informal text
Most writing is unsourced. Absence of citation proves nothing by itself. This is
separate from the evidence rules, which apply to tiers R and P by design and are
not a detection heuristic.

### Correct, complex formatting
Visual editors and templates produce clean tables and nested lists without help.

---

## A loanword is never a finding

A term in the pack's `loanwords` list is never reported, even when it looks like
puffery in the other language. `insight`, `creative`, `performance` are the
names of things in this industry, not claims about them.

This entry does not come from the upstream sources. It exists because a
Vietnamese marketing report is full of English terms, and a tool that flagged
them all would be unusable on the first document it saw.

---

## Signs of a real person, worth preserving

Seeing these, lean toward leaving the prose alone. Over-editing destroys exactly
what makes a piece sound human.

**Specific, hard-to-fabricate detail.** A real address. An odd quote. "The
lawyer who used to work upstairs from my dentist." Models round specifics off;
people hoard them.

**Mixed feelings and unresolved tension.** "I think this is mostly good, but it
bothers me and I cannot fully explain why." Models default to clean takes.

**Dated, era-bound references.** Slang, memes and in-jokes that pin to a
particular year and subculture.

**A first-person editorial choice the writer can defend.** If they can explain
why they cut that word, that is a strong human signal.

**Genuine asides and self-corrections.** "(I keep wanting to say almost here,
but it really was certain.)" Models rarely interrupt themselves.

**Variation in sentence length that is not a pattern.** Real writing alternates
irregularly. Machine writing either sits at one length or seesaws between two.

**Anything written before 30 November 2022.** With very rare exceptions, not
machine-written.

---

## When you are unsure

Report it as `chưa xác định` rather than as a violation. The three-verdict
system exists for exactly this, and the asymmetry is deliberate: a false
accusation costs the user's trust in the tool, while a missed line costs one
line.
