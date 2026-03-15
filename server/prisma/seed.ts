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

  // Books
  const rudin = await prisma.book.create({
    data: {
      title: 'Principles of Mathematical Analysis',
      author: 'Walter Rudin',
      subject: 'Real Analysis',
      description: 'The classic baby Rudin — rigorous intro to real analysis.',
      totalPages: 342,
      currentPage: 87,
      currentChapter: 'Chapter 4: Continuity',
      status: 'reading',
      isActive: true,
    },
  })

  const axler = await prisma.book.create({
    data: {
      title: 'Linear Algebra Done Right',
      author: 'Sheldon Axler',
      subject: 'Linear Algebra',
      description: 'A clean, determinant-free approach to linear algebra.',
      totalPages: 340,
      currentPage: 0,
      status: 'not_started',
      isActive: false,
    },
  })

  // Topics
  const metricSpaces = await prisma.topic.create({
    data: {
      title: 'Metric Spaces',
      subject: 'Real Analysis',
      summary: 'Generalisation of the real line — distance functions and open sets.',
      notes:
        'A metric space is a set X together with a function d: X×X → ℝ satisfying positivity, symmetry, and the triangle inequality. Key examples: ℝⁿ with Euclidean distance, C[a,b] with sup-norm distance.',
      examples:
        'Example 1: ℝ with d(x,y)=|x−y|. Example 2: Discrete metric. Example 3: Sequence spaces.',
      confidenceLevel: 7,
      linkedBookId: rudin.id,
      pageStart: 30,
      pageEnd: 52,
      status: 'revised',
    },
  })

  const continuity = await prisma.topic.create({
    data: {
      title: 'Continuity',
      subject: 'Real Analysis',
      summary: 'Epsilon-delta definition and topological characterisation.',
      notes:
        'f: X→Y is continuous at p if for every ε>0 there exists δ>0 such that d(x,p)<δ implies d(f(x),f(p))<ε. Equivalent characterisation: f is continuous iff the preimage of every open set is open.',
      confidenceLevel: 5,
      linkedBookId: rudin.id,
      pageStart: 83,
      pageEnd: 101,
      status: 'learning',
    },
  })

  const sequences = await prisma.topic.create({
    data: {
      title: 'Sequences and Series',
      subject: 'Real Analysis',
      summary: 'Convergence, Cauchy sequences, completeness.',
      notes:
        'A sequence {pₙ} converges to p if for every ε>0 there exists N such that n≥N implies d(pₙ,p)<ε. Cauchy sequences: for every ε>0 there exists N such that n,m≥N implies d(pₙ,pₘ)<ε.',
      confidenceLevel: 8,
      linkedBookId: rudin.id,
      pageStart: 47,
      pageEnd: 78,
      status: 'strong',
    },
  })

  const vectorSpaces = await prisma.topic.create({
    data: {
      title: 'Vector Spaces',
      subject: 'Linear Algebra',
      summary: 'Axiomatic definition, subspaces, span, independence.',
      notes: 'A vector space over F is a set V with addition and scalar multiplication satisfying 8 axioms. Key concepts: subspace (closed under addition and scalar multiplication), span, linear independence.',
      confidenceLevel: 9,
      linkedBookId: axler.id,
      pageStart: 1,
      pageEnd: 28,
      status: 'strong',
    },
  })

  // Problems
  await prisma.problem.create({
    data: {
      title: 'Show that every open ball is an open set',
      sourceType: 'textbook',
      linkedBookId: rudin.id,
      topicId: metricSpaces.id,
      chapterOrSection: 'Chapter 2',
      pageNumber: 34,
      problemStatement:
        'Let (X, d) be a metric space and let p ∈ X, r > 0. Show that the open ball B(p, r) = {x ∈ X : d(x, p) < r} is an open set.',
      difficulty: 'easy',
      tags: 'metric spaces,open sets,topology',
      status: 'solved',
      attemptNotes: 'Pick any q ∈ B(p,r). Need to find δ such that B(q,δ) ⊂ B(p,r).',
      finalSolution:
        'Let h = r − d(p, q) > 0. Set δ = h. For any x ∈ B(q, δ), by triangle inequality d(x, p) ≤ d(x, q) + d(q, p) < δ + d(q,p) = h + d(q,p) = r. So x ∈ B(p,r).',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Prove that the intersection of two open sets is open',
      sourceType: 'textbook',
      linkedBookId: rudin.id,
      topicId: metricSpaces.id,
      chapterOrSection: 'Chapter 2',
      pageNumber: 36,
      problemStatement:
        'Let G₁ and G₂ be open sets in a metric space X. Prove that G₁ ∩ G₂ is open.',
      difficulty: 'easy',
      tags: 'metric spaces,open sets',
      status: 'solved',
      finalSolution:
        'Let p ∈ G₁ ∩ G₂. Since G₁ open, ∃r₁>0 with B(p,r₁)⊂G₁. Since G₂ open, ∃r₂>0 with B(p,r₂)⊂G₂. Set r=min(r₁,r₂). Then B(p,r)⊂G₁∩G₂.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Rudin Ch4 Ex 1: Continuity of |f|',
      sourceType: 'textbook',
      linkedBookId: rudin.id,
      topicId: continuity.id,
      chapterOrSection: 'Chapter 4',
      pageNumber: 98,
      problemStatement:
        'Suppose f is a real function defined on ℝ¹ and ε > 0. If f is continuous at x₀, prove that |f| is also continuous at x₀.',
      difficulty: 'easy',
      tags: 'continuity,absolute value',
      status: 'solved_with_help',
      attemptNotes: 'Tried using the definition directly but got confused with the absolute value inside.',
      finalSolution:
        '||f(x)| − |f(x₀)|| ≤ |f(x) − f(x₀)|. Since f is continuous, for any ε>0 there exists δ such that |f(x)−f(x₀)|<ε whenever |x−x₀|<δ. The same δ works for |f|.',
      mistakesMade: 'Forgot the reverse triangle inequality ||a|−|b|| ≤ |a−b|.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Show limit of x·sin(1/x) as x→0 is 0',
      sourceType: 'self',
      topicId: continuity.id,
      problemStatement: 'Evaluate lim_{x→0} x·sin(1/x) using the squeeze theorem.',
      difficulty: 'medium',
      tags: 'limits,squeeze theorem,continuity',
      status: 'solved',
      finalSolution:
        '−|x| ≤ x·sin(1/x) ≤ |x| since |sin(1/x)| ≤ 1. As x→0, both −|x|→0 and |x|→0. By squeeze theorem, the limit is 0.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Cauchy sequence that does not converge in ℚ',
      sourceType: 'textbook',
      linkedBookId: rudin.id,
      topicId: sequences.id,
      chapterOrSection: 'Chapter 3',
      pageNumber: 59,
      problemStatement:
        'Construct a Cauchy sequence of rationals that does not converge in ℚ, demonstrating that ℚ is not complete.',
      difficulty: 'medium',
      tags: 'Cauchy sequences,completeness,rationals',
      status: 'attempted',
      attemptNotes:
        'Idea: use decimal approximations of √2. Define xₙ as the truncation of √2 to n decimal places.',
    },
  })

  await prisma.problem.create({
    data: {
      title: 'Prove uniform continuity on compact sets',
      sourceType: 'textbook',
      linkedBookId: rudin.id,
      topicId: continuity.id,
      chapterOrSection: 'Chapter 4',
      problemStatement:
        'Let f: K → ℝ be continuous where K is compact. Prove that f is uniformly continuous on K.',
      difficulty: 'hard',
      tags: 'uniform continuity,compactness,continuity',
      status: 'revisit',
      attemptNotes:
        'Idea: use open cover by balls of radius ε/2 around each point, extract finite subcover, take minimum δ. Details unclear.',
      revisitDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  })

  // Journal entries — last 5 days to create a streak
  const today = new Date()
  for (let i = 4; i >= 0; i--) {
    const entryDate = new Date(today)
    entryDate.setDate(today.getDate() - i)
    entryDate.setHours(12, 0, 0, 0)

    await prisma.journalEntry.create({
      data: {
        date: entryDate,
        whatIStudied: i === 0
          ? 'Continuity at a point — epsilon-delta definition. Worked through Rudin Ch4 opening examples.'
          : i === 1
          ? 'Revisited compact sets and Heine-Borel theorem. Re-read the proof twice.'
          : i === 2
          ? 'Worked on problems from Chapter 3 — Cauchy sequences and completeness.'
          : i === 3
          ? 'Introduction to continuity chapter. Read pages 83–90 and took notes.'
          : 'Finished metric spaces chapter. Reviewed all definitions and theorems.',
        whatConfusedMe: i === 0
          ? 'The topological characterisation of continuity — how preimages of open sets connect to epsilon-delta.'
          : i === 1
          ? 'Why exactly sequential compactness implies compactness in metric spaces but not general topological spaces.'
          : i === 2
          ? 'The diagonal argument in the proof that ℝ is uncountable.'
          : null,
        oneThingIUnderstood: i === 0
          ? 'The intuition behind delta depending on both epsilon AND the point p (non-uniform continuity).'
          : i === 1
          ? 'Heine-Borel: closed + bounded ↔ compact, but only works in ℝⁿ, not general metric spaces.'
          : i === 2
          ? 'Cauchy sequences capture convergence without knowing the limit — powerful for proving completeness.'
          : 'The triangle inequality is what makes distance functions useful — it bounds how indirect paths can be.',
        pagesRead: [8, 6, 7, 9, 5][i],
        linkedBookId: rudin.id,
        linkedTopicId: i <= 1 ? continuity.id : i === 2 ? sequences.id : metricSpaces.id,
        durationMinutes: [90, 75, 60, 80, 45][i],
      },
    })
  }

  // Questions
  await prisma.question.create({
    data: {
      text: 'Why does the proof of Heine-Borel only work in ℝⁿ and not in general metric spaces?',
      linkedBookId: rudin.id,
      linkedTopicId: metricSpaces.id,
      pageNumber: 45,
      status: 'open',
    },
  })

  await prisma.question.create({
    data: {
      text: 'Is uniform continuity equivalent to the function extending continuously to the closure of its domain?',
      linkedBookId: rudin.id,
      linkedTopicId: continuity.id,
      pageNumber: 91,
      status: 'open',
    },
  })

  await prisma.question.create({
    data: {
      text: 'What is the difference between a limit point and an accumulation point? Are they always the same?',
      linkedBookId: rudin.id,
      linkedTopicId: metricSpaces.id,
      pageNumber: 38,
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
