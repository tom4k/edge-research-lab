'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { PageGuard } from '@/components/PageGuard';

export default function ContactPage() {
  const { data } = useData();
  const { toast } = useToast();
  const s = data.settings;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissions = JSON.parse(localStorage.getItem('edgesys-contact-submissions') || '[]');
      submissions.push({
        name,
        email,
        subject,
        message,
        date: new Date().toISOString()
      });
      localStorage.setItem('edgesys-contact-submissions', JSON.stringify(submissions));

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      toast('Enquiry saved successfully!');
    } catch (err) {
      toast('Failed to save enquiry');
    }
  };

  return (
    <PageGuard pageKey="contact" title="Contact">
      <div className="page">
        <section className="page-heading">
          <span className="eyebrow">Contact</span>
          <h1>Start a research conversation.</h1>
          <p>
            Contact us regarding collaboration, doctoral research, internships, funded projects, invited talks, or access to research outputs.
          </p>
        </section>

        <section className="section">
          <div className="contact-layout">
            <div className="contact-panel">
              <span className="eyebrow">Lab information</span>
              <h2>{s.labName}</h2>
              <p>{s.location}</p>
              <p>
                <strong>Email</strong>
                <br />
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </p>
              <p>
                <strong>Phone</strong>
                <br />
                {s.phone}
              </p>
              <p>
                <strong>Research focus</strong>
                <br />
                Edge computing, fog computing, distributed systems, intelligent orchestration, IoT, and vehicular computing.
              </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    className="input"
                    id="contact-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    className="input"
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  className="input"
                  id="contact-subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  className="textarea"
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button className="button" type="submit">
                Send enquiry
              </button>
              <small style={{ color: 'var(--muted)' }}>
                Demo mode: form submissions are saved locally in this browser.
              </small>
            </form>
          </div>
        </section>
      </div>
    </PageGuard>
  );
}
