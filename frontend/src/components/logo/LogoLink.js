import React from 'react';
import './Logo.css';
import { Logo } from './Logo';
import Resume from '../../settings/resume.json';

export const LogoLink = () => (
  <a
    href={Resume.basics.url}
    className="logo-link"
    aria-label="Sam Franklin — home"
  >
    <Logo />
  </a>
);
