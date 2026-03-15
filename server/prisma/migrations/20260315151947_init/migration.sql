-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "pdfFilename" TEXT,
    "totalPages" INTEGER,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "currentChapter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "summary" TEXT,
    "notes" TEXT,
    "examples" TEXT,
    "confidenceLevel" INTEGER NOT NULL DEFAULT 5,
    "linkedBookId" INTEGER,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'learning',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Topic_linkedBookId_fkey" FOREIGN KEY ("linkedBookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'textbook',
    "linkedBookId" INTEGER,
    "topicId" INTEGER,
    "chapterOrSection" TEXT,
    "pageNumber" INTEGER,
    "problemStatement" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "attemptNotes" TEXT,
    "finalSolution" TEXT,
    "mistakesMade" TEXT,
    "revisitDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Problem_linkedBookId_fkey" FOREIGN KEY ("linkedBookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Problem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whatIStudied" TEXT NOT NULL,
    "whatConfusedMe" TEXT,
    "oneThingIUnderstood" TEXT,
    "pagesRead" INTEGER,
    "linkedBookId" INTEGER,
    "linkedTopicId" INTEGER,
    "durationMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_linkedBookId_fkey" FOREIGN KEY ("linkedBookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_linkedTopicId_fkey" FOREIGN KEY ("linkedTopicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "linkedBookId" INTEGER,
    "linkedTopicId" INTEGER,
    "pageNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_linkedBookId_fkey" FOREIGN KEY ("linkedBookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_linkedTopicId_fkey" FOREIGN KEY ("linkedTopicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
