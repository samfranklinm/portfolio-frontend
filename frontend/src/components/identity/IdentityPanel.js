import React from 'react';
import { LogoLink } from '../logo/LogoLink';
import { SocialLinks } from './SocialLinks';
import Resume from '../../settings/resume.json';
import './IdentityPanel.css';

const HIGHLIGHTS = [
  'AI systems — model serving, CI/CD, drift detection',
  'Team leadership — roadmaps, cross-functional delivery',
  'Cloud — Azure, infra-as-code, observability',
  '.NET 8 and Python services',
];

export const IdentityPanel = () => {
  const { name, label, summary } = Resume.basics;

  return (
    <aside className="identity-panel" aria-label="About Sam Franklin">
      <div className="identity-inner">
        <div className="identity-logo">
          <LogoLink />
        </div>

        <div className="identity-bio">
          <h1 className="identity-name">{name}</h1>
          <p className="identity-label">{label}</p>
          <p className="identity-location">{summary}</p>
        </div>

        <div className="identity-divider" />

        <ul className="identity-highlights" aria-label="Key skills">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="identity-highlight-item">
              <span className="identity-bullet" aria-hidden="true">—</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <div className="identity-divider" />

        <div className="identity-footer">
          <SocialLinks />
          <a href="/contact" className="identity-contact-link">
            Get in touch
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
};
