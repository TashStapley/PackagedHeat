import { neon } from "@neondatabase/serverless";

function xml(value: unknown) {
  return String(value ?? "").replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!
  );
}

type Submission = {
  name: string;
  email: string;
  phone: string;
  company: string;
  submission_date: string;
  submission_time: string;
  rooms: number;
  decider: string;
};

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured.");
    }

    const { code } = (await request.json()) as { code?: string };

    const adminCode = process.env.ADMIN_EXPORT_CODE;

    if (!adminCode || code !== adminCode) {
      return Response.json(
        { error: "The administrator code is incorrect." },
        { status: 401 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
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

    const result = (await sql`
      SELECT
        name,
        email,
        phone,
        company,
        submission_date,
        submission_time,
        rooms,
        decider
      FROM submissions
      ORDER BY id DESC
    `) as Submission[];

    const headers = [
      "Name",
      "Email",
      "Phone number",
      "Company name",
      "Date of submission",
      "Time of submission",
      "How many rooms can this PHE heat?",
      "Decider answer (kg CO₂)",
    ];

    const rows = [
      headers,
      ...result.map((r) => [
        r.name,
        r.email,
        r.phone,
        r.company,
        r.submission_date,
        r.submission_time,
        r.rooms,
        r.decider,
      ]),
    ];

    const table = rows
      .map(
        (row, i) =>
          `<Row>${row
            .map(
              (v) =>
                `<Cell${i === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="${
                  typeof v === "number" ? "Number" : "String"
                }">${xml(v)}</Data></Cell>`
            )
            .join("")}</Row>`
      )
      .join("");

    const workbook = `<?xml version="1.0"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#BE2231" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Competition Entries">
    <Table>${table}</Table>
  </Worksheet>
</Workbook>`;

    return new Response(workbook, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="packaged-heat-competition-results-${new Date()
          .toISOString()
          .slice(0, 10)}.xls"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    return Response.json(
      { error: "Unable to export competition entries." },
      { status: 500 }
    );
  }
}