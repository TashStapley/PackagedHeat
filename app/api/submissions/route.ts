import { env } from "cloudflare:workers";

const schema = `
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT NOT NULL,
    rooms INTEGER NOT NULL,
    decider TEXT NOT NULL,
    submission_date TEXT NOT NULL,
    submission_time TEXT NOT NULL,
    submitted_at TEXT NOT NULL
  )
`;

function clean(value: unknown, max = 200) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = clean(body.name);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const company = clean(body.company);
    const decider = clean(body.decider);
    const rooms = Number(body.rooms);

    // Check both consent boxes
    const consentAccepted = body.consent === "yes";
    const termsAccepted = body.termsAccepted === "yes";

    // Check all required fields
    if (
      !name ||
      !email ||
      !phone ||
      !company ||
      !decider ||
      !Number.isInteger(rooms) ||
      rooms < 1
    ) {
      return Response.json(
        {
          error: "Please complete every field before submitting.",
        },
        { status: 400 }
      );
    }

    // Check consent
    if (!consentAccepted || !termsAccepted) {
      return Response.json(
        {
          error:
            "Please accept both the data consent statement and the competition terms and conditions.",
        },
        { status: 400 }
      );
    }

    // Check email address
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const db = (env as unknown as { DB: D1Database }).DB;

    // Make sure submissions table exists
    await db.prepare(schema).run();

    const now = new Date();

    const submissionDate = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);

    const submissionTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    // Save competition entry
    await db
      .prepare(
        `
          INSERT INTO submissions (
            name,
            email,
            phone,
            company,
            rooms,
            decider,
            submission_date,
            submission_time,
            submitted_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        name,
        email.toLowerCase(),
        phone,
        company,
        rooms,
        decider,
        submissionDate,
        submissionTime,
        now.toISOString()
      )
      .run();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Submission error:", error);

    return Response.json(
      {
        error: "We couldn't save your entry. Please try again.",
      },
      { status: 500 }
    );
  }
}