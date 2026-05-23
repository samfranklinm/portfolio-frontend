import React, { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { LogoLink } from '../components/logo/LogoLink';
import './Contact.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID  || '';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY  || '';

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Name is required.';
  if (!fields.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(fields.email)) errors.email = 'Enter a valid email address.';
  if (fields.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  if (fields.message.trim().length > 2000) errors.message = 'Message must be under 2000 characters.';
  return errors;
}

function Contact() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    setServerError('');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { from_name: fields.name, from_email: fields.email, message: fields.message },
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
    } catch {
      setStatus('error');
      setServerError('Something went wrong. Please try again or email me directly.');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <LogoLink />
        <a href="/" className="contact-back">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back
        </a>
      </div>

      <main className="contact-main">
        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="contact-title">Get in touch</h1>
          <p className="contact-subtitle">
            I'm open to new opportunities, collaborations, and conversations.
          </p>

          {status === 'success' ? (
            <motion.div
              className="contact-success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="28" height="28" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="var(--color-accent)" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-5" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>Message sent! I'll get back to you soon.</p>
            </motion.div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  className={`contact-input ${errors.name ? 'contact-input--error' : ''}`}
                  type="text"
                  value={fields.name}
                  onChange={set('name')}
                  autoComplete="name"
                  disabled={status === 'loading'}
                />
                {errors.name && <span className="contact-error">{errors.name}</span>}
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  className={`contact-input ${errors.email ? 'contact-input--error' : ''}`}
                  type="email"
                  value={fields.email}
                  onChange={set('email')}
                  autoComplete="email"
                  disabled={status === 'loading'}
                />
                {errors.email && <span className="contact-error">{errors.email}</span>}
              </div>

              <div className="contact-field">
                <label className="contact-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  className={`contact-input contact-textarea ${errors.message ? 'contact-input--error' : ''}`}
                  value={fields.message}
                  onChange={set('message')}
                  rows={5}
                  disabled={status === 'loading'}
                />
                {errors.message && <span className="contact-error">{errors.message}</span>}
              </div>

              {serverError && (
                <p className="contact-server-error">{serverError}</p>
              )}

              <button
                type="submit"
                className="contact-submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default Contact;
