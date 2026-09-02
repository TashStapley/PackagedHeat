"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

const Icon = ({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) => (
  <span className="field-icon" style={{ background: tone }}>
    {children}
  </span>
);

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "We couldn't save your entry.");
      }

      setStatus("success");
      setMessage("Your entry has been received. Good luck!");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <main className="page-shell">
      <a href="/admin" className="admin-page-button">
        ADMIN
      </a>

      <section className="competition-card" aria-labelledby="competition-title">
        <div className="decorative-hex hex-one" aria-hidden="true" />
        <div className="decorative-hex hex-two" aria-hidden="true" />
        <div className="decorative-hex hex-three" aria-hidden="true" />
        <div className="decorative-hex hex-four" aria-hidden="true" />
        <div className="decorative-hex hex-five" aria-hidden="true" />
        <div className="decorative-hex hex-six" aria-hidden="true" />

        <header className="hero-copy">
          <h1 id="competition-title">
            <span className="title-line title-black">PACKAGED</span>
            <span className="title-line title-red">HEAT</span>
            <span className="title-line title-black">COMPETITION</span>
          </h1>

          <div className="title-underlines" aria-hidden="true">
            <span className="navy-underline" />
            <span className="red-underline" />
          </div>

          <p className="eyebrow">
            Take a guess based on the displayed plate heat exchanger,
            <br />
            how many hotel rooms it could supply hot water to?
          </p>

          <p className="instruction">
            GUESS CORRECTLY AND <strong>WIN A PRIZE!</strong>
          </p>
        </header>

        <aside className="badge" aria-label="Guess correctly to win">
          <span className="gift">▥</span>
          <b>
            GUESS
            <br />
            CORRECTLY
            <br />
            <em>TO WIN!</em>
          </b>
        </aside>

        <div className="hero-brand">
          <img
            src="/image/packaged-heat-logo.png"
            alt="Packaged Heat Ltd logo"
          />
        </div>

        <form className="entry-form" onSubmit={submitEntry}>
          <div className="answer-block">
            <Icon tone="#18283d">▥</Icon>
            <label htmlFor="rooms">NUMBER OF HOTEL ROOMS</label>
            <input
              id="rooms"
              name="rooms"
              type="number"
              min="1"
              inputMode="numeric"
              required
              placeholder="Your answer"
            />
          </div>

          <div className="details-grid">
            <label className="form-field">
              <Icon tone="#c72535">♙</Icon>
              <span>CONTACT NAME</span>
              <input
                name="name"
                autoComplete="name"
                required
                placeholder="Your full name"
              />
            </label>

            <label className="form-field">
              <Icon tone="#18283d">▤</Icon>
              <span>COMPANY NAME</span>
              <input
                name="company"
                autoComplete="organization"
                required
                placeholder="Your company"
              />
            </label>

            <label className="form-field">
              <Icon tone="#294d75">✉</Icon>
              <span>EMAIL ADDRESS</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.co.uk"
              />
            </label>

            <label className="form-field">
              <Icon tone="#77716e">⌕</Icon>
              <span>PHONE NUMBER</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="Your contact number"
              />
            </label>
          </div>

          <div className="decider">
            <div className="decider-title">
              <Icon tone="#c72535">◒</Icon>
              <strong>DECIDER QUESTION</strong>
            </div>

            <label htmlFor="decider">
              If more than one entry guesses the correct number of rooms, the
              winner will be selected by the closest answer to:
            </label>

            <p className="decider-question-text">
              HOW LONG DOES IT TAKE THIS PLATE HEAT EXCHANGER TO FILL A 1000L
              VESSEL WITH 60°C WATER, STARTING FROM 10°C?
            </p>

            <div className="decider-input">
              <input
                id="decider"
                name="decider"
                required
                placeholder="Your answer"
              />
              <span>Seconds</span>
            </div>

            <p className="answer-guidance">
              Answers must be submitted in seconds and will be rounded to the
              nearest whole number.
            </p>
          </div>

          <label className="consent">
            <input type="checkbox" name="consent" value="yes" required />
            <span>
              I agree that my details can be used to administer this competition
              and contact the winner.
            </span>
          </label>

          <button className="submit-button" disabled={status === "sending"}>
            {status === "sending" ? "SUBMITTING…" : "SUBMIT MY ENTRY"}
          </button>

          {message && (
            <p className={`form-message ${status}`} role="status">
              {message}
            </p>
          )}
        </form>

        <footer className="card-footer">
          <div className="footer-message">
            <span>♕</span>
            <p>
              <strong>
                LEAVE YOUR DETAILS FOR
                <br />
                THE CHANCE TO WIN!
              </strong>
              <br />
              <small>The winner will be contacted after the event.</small>
            </p>
          </div>

        </footer>
      </section>
    </main>
  );
}
