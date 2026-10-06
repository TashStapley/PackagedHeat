"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

type FormErrors = {
  rooms?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  decider?: string;
  consent?: string;
  termsAccepted?: string;
};

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
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const newErrors: FormErrors = {};

    const rooms = String(formData.get("rooms") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const decider = String(formData.get("decider") ?? "").trim();
    const consent = formData.get("consent");
    const termsAccepted = formData.get("termsAccepted");

    if (!rooms) {
      newErrors.rooms = "Please enter the number of hotel rooms.";
    } else if (!Number.isInteger(Number(rooms)) || Number(rooms) < 1) {
      newErrors.rooms = "Please enter a valid number of hotel rooms.";
    }

    if (!name) {
      newErrors.name = "Please enter your contact name.";
    }

    if (!company) {
      newErrors.company = "Please enter your company name.";
    }

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!phone) {
      newErrors.phone = "Please enter your phone number.";
    }

    if (!decider) {
      newErrors.decider = "Please enter your answer in seconds.";
    }

    if (consent !== "yes") {
      newErrors.consent = "Please tick this box to continue.";
    }

    if (termsAccepted !== "yes") {
      newErrors.termsAccepted = "Please accept the terms and conditions.";
    }

    return newErrors;
  }

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const updated = { ...current };
      delete updated[field];
      return updated;
    });
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus("error");
      setMessage("Please complete the highlighted fields before submitting.");

      const firstError = Object.keys(validationErrors)[0];

      const firstInvalidField = form.elements.namedItem(firstError);

      if (
        firstInvalidField instanceof HTMLInputElement ||
        firstInvalidField instanceof HTMLTextAreaElement ||
        firstInvalidField instanceof HTMLSelectElement
      ) {
        firstInvalidField.focus();
      }

      return;
    }

    setErrors({});
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "We couldn't save your entry.");
      }

      setStatus("success");
      setMessage("Your entry has been received. Good luck!");
      setErrors({});
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save your entry. Please try again."
      );
    }
  }

  return (
    <main className="page-shell">
      <a href="/admin" className="admin-page-button">
        ADMIN
      </a>

      <section
        className="competition-card"
        aria-labelledby="competition-title"
      >
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

        <div className="hero-brand">
          <img
            src="/image/packaged-heat-logo.png"
            alt="Packaged Heat Ltd logo"
          />
        </div>

        <form
          className="entry-form"
          onSubmit={submitEntry}
          noValidate
        >
          <div className="answer-block">
            <Icon tone="#18283d">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 4h8" />
                <path d="M12 2v5" />
                <path d="M7 7h10v5H7z" />
                <path d="M7 9H4" />
                <path d="M17 9h2a3 3 0 0 1 3 3v2" />
                <path d="M22 16.5c0 1.4-.9 2.5-2 2.5s-2-1.1-2-2.5c0-1.1 2-3.5 2-3.5s2 2.4 2 3.5z" />
              </svg>
            </Icon>

            <label htmlFor="rooms">NUMBER OF HOTEL ROOMS</label>

            <input
              id="rooms"
              name="rooms"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Your answer"
              className={errors.rooms ? "input-error" : ""}
              aria-invalid={!!errors.rooms}
              onChange={() => clearError("rooms")}
            />

            {errors.rooms && (
              <p className="field-error">{errors.rooms}</p>
            )}
          </div>

          <div className="details-grid">
            <label className="form-field">
              <Icon tone="#c72535">♙</Icon>
              <span>CONTACT NAME</span>

              <input
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                className={errors.name ? "input-error" : ""}
                aria-invalid={!!errors.name}
                onChange={() => clearError("name")}
              />

              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </label>

            <label className="form-field">
              <Icon tone="#18283d">▤</Icon>
              <span>COMPANY NAME</span>

              <input
                name="company"
                autoComplete="organization"
                placeholder="Your company"
                className={errors.company ? "input-error" : ""}
                aria-invalid={!!errors.company}
                onChange={() => clearError("company")}
              />

              {errors.company && (
                <span className="field-error">{errors.company}</span>
              )}
            </label>

            <label className="form-field">
              <Icon tone="#294d75">✉</Icon>
              <span>EMAIL ADDRESS</span>

              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.co.uk"
                className={errors.email ? "input-error" : ""}
                aria-invalid={!!errors.email}
                onChange={() => clearError("email")}
              />

              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </label>

            <label className="form-field">
              <Icon tone="#77716e">⌕</Icon>
              <span>PHONE NUMBER</span>

              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Your contact number"
                className={errors.phone ? "input-error" : ""}
                aria-invalid={!!errors.phone}
                onChange={() => clearError("phone")}
              />

              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
            </label>
          </div>

          <div className="decider-column">
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
                  placeholder="Your answer"
                  className={errors.decider ? "input-error" : ""}
                  aria-invalid={!!errors.decider}
                  onChange={() => clearError("decider")}
                />
                <span>Seconds</span>
              </div>

              {errors.decider && (
                <p className="field-error">{errors.decider}</p>
              )}

              <p className="answer-guidance">
                Answers must be submitted in seconds and will be rounded to the
                nearest whole number.
              </p>
            </div>
          </div>

          <div className="consent-group">
            <div className="consent-wrapper">
              <label className="consent">
                <input
                  type="checkbox"
                  name="consent"
                  value="yes"
                  onChange={() => clearError("consent")}
                />

                <span>
                  I agree that my details can be used to administer this
                  competition and contact the winner.
                </span>
              </label>

              {errors.consent && (
                <p className="field-error consent-error">
                  {errors.consent}
                </p>
              )}
            </div>

            <div className="consent-wrapper">
              <label className="consent">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  value="yes"
                  onChange={() => clearError("termsAccepted")}
                />

                <span>
                  I agree to the terms and conditions of the competition as
                  displayed.
                </span>
              </label>

              {errors.termsAccepted && (
                <p className="field-error consent-error">
                  {errors.termsAccepted}
                </p>
              )}
            </div>
          </div>

          <div className="submit-row">
            <button
              type="submit"
              className="submit-button"
              disabled={status === "sending"}
            >
              {status === "sending" ? "SUBMITTING…" : "SUBMIT MY ENTRY"}
            </button>
          </div>

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