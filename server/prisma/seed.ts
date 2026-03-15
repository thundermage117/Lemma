import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.question.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.book.deleteMany()

  // ── Books ────────────────────────────────────────────────────────────────
  const analysis = await prisma.book.create({
    data: {
      title: 'Understanding Analysis',
      author: 'Stephen Abbott',
      subject: 'Real Analysis',
      description: 'Accessible intro to real analysis — builds intuition alongside rigour.',
      pdfFilename: 'UnderstandingAnalysis.pdf',
      totalPages: 312,
      currentPage: 42,
      currentChapter: 'Chapter 2: Sequences and Series',
      status: 'reading',
      isActive: true,
    },
  })

  const proof = await prisma.book.create({
    data: {
      title: 'Book of Proof',
      author: 'Richard Hammack',
      subject: 'Proof Writing',
      description: 'Introduction to mathematical proof techniques — logic, sets, induction.',
      pdfFilename: 'BookOfProof.pdf',
      totalPages: 314,
      currentPage: 28,
      currentChapter: 'Chapter 2: Logic',
      status: 'reading',
      isActive: false,
    },
  })

  await prisma.book.create({
    data: {
      title: 'Abstract Algebra',
      author: 'David S. Dummit & Richard M. Foote',
      subject: 'Abstract Algebra',
      description: 'Comprehensive treatment of groups, rings, and fields.',
      pdfFilename: 'AbstractAlgebra.pdf',
      totalPages: 932,
      currentPage: 0,
      status: 'not_started',
      isActive: false,
    },
  })

  // ── Topics ───────────────────────────────────────────────────────────────
  const realNumbers = await prisma.topic.create({
    data: {
      title: 'The Real Numbers',
      subject: 'Real Analysis',
      summary: 'Axiom of Completeness, Archimedean Property, and density of ℚ in ℝ.',
      notes:
        'The Axiom of Completeness: every non-empty set of real numbers that is bounded above has a least upper bound (supremum) in ℝ. This is what distinguishes ℝ from ℚ.\n\nArchimedean Property: for any x ∈ ℝ, there exists n ∈ ℕ with n > x.\n\nDensity of ℚ: between any two real numbers there is a rational number.',
      examples:
        'sup{1 − 1/n : n ∈ ℕ} = 1 (in ℝ, not in the set itself). The set {x ∈ ℚ : x² < 2} is bounded above in ℚ but has no supremum in ℚ.',
      confidenceLevel: 7,
      linkedBookId: analysis.id,
      pageStart: 1,
      pageEnd: 20,
      status: 'revised',
    },
  })

  const sequences = await prisma.topic.create({
    data: {
      title: 'Sequences and Limits',
      subject: 'Real Analysis',
      summary: 'Epsilon-N definition of convergence, limit laws, squeeze theorem.',
      notes:
        'A sequence (aₙ) converges to L if for every ε > 0 there exists N ∈ ℕ such that n ≥ N implies |aₙ − L| < ε.\n\nLimit laws: if (aₙ) → a and (bₙ) → b then (aₙ + bₙ) → a + b, (aₙbₙ) → ab, and (aₙ/bₙ) → a/b when b ≠ 0.\n\nSqueeze theorem: if aₙ ≤ bₙ ≤ cₙ and aₙ → L and cₙ → L then bₙ → L.',
      examples:
        'lim(1/n) = 0. lim(n/(n+1)) = 1. The sequence (−1)ⁿ diverges.',
      confidenceLevel: 6,
      linkedBookId: analysis.id,
      pageStart: 23,
      pageEnd: 55,
      status: 'learning',
    },
  })

  const setsLogic = await prisma.topic.create({
    data: {
      title: 'Sets and Set Operations',
      subject: 'Proof Writing',
      summary: 'Set builder notation, unions, intersections, subsets, power sets.',
      notes:
        'A set is a collection of objects. Key operations: A ∪ B (union), A ∩ B (intersection), A \\ B (difference), Aᶜ (complement), 𝒫(A) (power set).\n\nDe Morgan\'s laws: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ and (A ∩ B)ᶜ = Aᶜ ∪ Bᶜ.',
      examples:
        'If A = {1,2,3} and B = {2,3,4} then A ∪ B = {1,2,3,4} and A ∩ B = {2,3}.\n𝒫({1,2}) = {∅, {1}, {2}, {1,2}}.',
      confidenceLevel: 8,
      linkedBookId: proof.id,
      pageStart: 1,
      pageEnd: 18,
      status: 'strong',
    },
  })

  const logic = await prisma.topic.create({
    data: {
      title: 'Logic and Propositions',
      subject: 'Proof Writing',
      summary: 'Propositional logic, truth tables, conditional statements, contrapositive.',
      notes:
        'A statement is a sentence that is either true or false. Key connectives: ∧ (and), ∨ (or), ¬ (not), → (if...then), ↔ (iff).\n\nContrapositive: P → Q is logically equivalent to ¬Q → ¬P.\nConverse: Q → P (not equivalent to P → Q).\nNegation of ∀x P(x) is ∃x ¬P(x).',
      examples:
        '"If n is even then n² is even" — contrapositive is "if n² is odd then n is odd".',
      confidenceLevel: 9,
      linkedBookId: proof.id,
      pageStart: 19,
      pageEnd: 40,
      status: 'strong',
    },
  })

  // ── Problems ─────────────────────────────────────────────────────────────
  await prisma.problem.create({
    data: {
      title: 'Abbott 1.2.1 — Supremum of a set',
      sourceType: 'textbook',
      linkedBookId: analysis.id,
      topicId: realNumbers.id,
      chapterOrSection: 'Chapter 1',
      pageNumber: 14,
      problemStatement:
        'Let A ⊆ ℝ be nonempty and bounded above. Show that if s = sup A, then for every ε > 0 there exists a ∈ A with s − ε < a ≤ s.',
      difficulty: 'easy',
      tags: 'supremum,completeness',
      status: 'solved',
      finalSolution:
        'Since s − ε < s, and s = sup A, s − ε is not an upper bound for A. So there exists a ∈ A with a > s − ε. Since s is an upper bound, a ≤ s. Thus s − ε < a ≤ s.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Abbott 1.2.6 — sup and inf relationship',
      sourceType: 'textbook',
      linkedBookId: analysis.id,
      topicId: realNumbers.id,
      chapterOrSection: 'Chapter 1',
      pageNumber: 15,
      problemStatement:
        'Given sets A and B with the property that a ≤ b for all a ∈ A and b ∈ B, show that sup A ≤ inf B.',
      difficulty: 'medium',
      tags: 'supremum,infimum,completeness',
      status: 'solved',
      finalSolution:
        'For any fixed b ∈ B, b is an upper bound for A, so sup A ≤ b. Since this holds for all b ∈ B, sup A is a lower bound for B, so sup A ≤ inf B.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Abbott 2.2.2 — Convergence of 1/√n',
      sourceType: 'textbook',
      linkedBookId: analysis.id,
      topicId: sequences.id,
      chapterOrSection: 'Chapter 2',
      pageNumber: 37,
      problemStatement:
        'Using the ε-N definition, prove that the sequence (1/√n) converges to 0.',
      difficulty: 'easy',
      tags: 'sequences,convergence,epsilon-N',
      status: 'solved',
      finalSolution:
        'Given ε > 0, choose N > 1/ε². Then for n ≥ N: |1/√n − 0| = 1/√n ≤ 1/√N < ε.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Abbott 2.3.1 — Limit of (2n+1)/(n+3)',
      sourceType: 'textbook',
      linkedBookId: analysis.id,
      topicId: sequences.id,
      chapterOrSection: 'Chapter 2',
      pageNumber: 46,
      problemStatement: 'Find lim(2n+1)/(n+3) and prove it using the definition of convergence.',
      difficulty: 'easy',
      tags: 'sequences,limit laws',
      status: 'attempted',
      attemptNotes:
        'Dividing numerator and denominator by n gives (2 + 1/n)/(1 + 3/n) → 2/1 = 2. Need to make this rigorous with the ε-N definition.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Hammack 2.6 — Negate a quantified statement',
      sourceType: 'textbook',
      linkedBookId: proof.id,
      topicId: logic.id,
      chapterOrSection: 'Chapter 2',
      pageNumber: 35,
      problemStatement:
        'Write the negation of the statement: "For every real number x, there exists a real number y such that y³ = x."',
      difficulty: 'easy',
      tags: 'logic,quantifiers,negation',
      status: 'solved',
      finalSolution:
        'Negation: "There exists a real number x such that for all real numbers y, y³ ≠ x." (The original is actually true since cube root always exists in ℝ, so the negation is false.)',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Prove A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)',
      sourceType: 'textbook',
      linkedBookId: proof.id,
      topicId: setsLogic.id,
      chapterOrSection: 'Chapter 1',
      pageNumber: 12,
      problemStatement:
        'Prove the distributive law: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C) for sets A, B, C.',
      difficulty: 'easy',
      tags: 'sets,distributive law,proof',
      status: 'solved',
      finalSolution:
        '(⊆) Let x ∈ A ∩ (B ∪ C). Then x ∈ A and x ∈ B ∪ C. Case 1: x ∈ B → x ∈ A ∩ B. Case 2: x ∈ C → x ∈ A ∩ C. Either way x ∈ (A∩B) ∪ (A∩C). (⊇) Reverse inclusion is symmetric.',
    },
  })

  // ── Journal entries — last 5 days ────────────────────────────────────────
  const today = new Date()
  const entries = [
    {
      daysAgo: 4,
      whatIStudied: 'Chapter 1 of Understanding Analysis — Axiom of Completeness and supremum definition.',
      whatConfusedMe: 'Why ℚ fails completeness — had to re-read the √2 example twice.',
      oneThingIUnderstood: 'The supremum doesn\'t need to be in the set — that was the key insight.',
      pagesRead: 14,
      durationMinutes: 60,
      linkedBookId: analysis.id,
      linkedTopicId: realNumbers.id,
    },
    {
      daysAgo: 3,
      whatIStudied: 'Finished Chapter 1 and started Chapter 2 of Abbott. Also read Chapter 1 of Book of Proof.',
      whatConfusedMe: null,
      oneThingIUnderstood: 'Set builder notation and how to read ∀ and ∃ properly.',
      pagesRead: 18,
      durationMinutes: 75,
      linkedBookId: proof.id,
      linkedTopicId: setsLogic.id,
    },
    {
      daysAgo: 2,
      whatIStudied: 'Sequences in Abbott Ch2 — epsilon-N definition and first examples.',
      whatConfusedMe: 'How to choose N given ε — the algebra of working backwards from |aₙ − L| < ε.',
      oneThingIUnderstood: 'You\'re always working backwards: assume the conclusion, find what N needs to be, then write the proof forwards.',
      pagesRead: 12,
      durationMinutes: 90,
      linkedBookId: analysis.id,
      linkedTopicId: sequences.id,
    },
    {
      daysAgo: 1,
      whatIStudied: 'Logic chapter in Book of Proof — truth tables, conditionals, contrapositive.',
      whatConfusedMe: 'The difference between converse and contrapositive — kept mixing them up.',
      oneThingIUnderstood: 'P → Q and ¬Q → ¬P are the same statement. P → Q and Q → P are NOT.',
      pagesRead: 16,
      durationMinutes: 70,
      linkedBookId: proof.id,
      linkedTopicId: logic.id,
    },
    {
      daysAgo: 0,
      whatIStudied: 'Limit laws and squeeze theorem in Abbott. Worked through practice problems.',
      whatConfusedMe: 'The squeeze theorem proof — why both outer sequences must converge to the SAME limit.',
      oneThingIUnderstood: 'Algebraic limit theorem: once you know two sequences converge you get convergence of sums/products for free.',
      pagesRead: 8,
      durationMinutes: 55,
      linkedBookId: analysis.id,
      linkedTopicId: sequences.id,
    },
  ]

  for (const entry of entries) {
    const entryDate = new Date(today)
    entryDate.setDate(today.getDate() - entry.daysAgo)
    entryDate.setHours(12, 0, 0, 0)

    const { daysAgo, ...data } = entry
    await prisma.journalEntry.create({
      data: { ...data, date: entryDate },
    })
  }

  // ── Questions ────────────────────────────────────────────────────────────
  await prisma.question.create({
    data: {
      text: 'Does the Archimedean Property follow from the Axiom of Completeness, or is it a separate axiom?',
      linkedBookId: analysis.id,
      linkedTopicId: realNumbers.id,
      pageNumber: 11,
      status: 'open',
    },
  })

  await prisma.question.create({
    data: {
      text: 'When choosing N in an epsilon-N proof, does N have to be an integer or can it be any real number?',
      linkedBookId: analysis.id,
      linkedTopicId: sequences.id,
      pageNumber: 32,
      status: 'open',
    },
  })

  await prisma.question.create({
    data: {
      text: 'Is every conditional statement with a false hypothesis vacuously true? That seems weird.',
      linkedBookId: proof.id,
      linkedTopicId: logic.id,
      pageNumber: 24,
      status: 'understood',
    },
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
