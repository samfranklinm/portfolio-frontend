import React from "react";
import { Link } from '@mui/material'; 
import Zoom from '@mui/material/Zoom';
import './Logo.css';
import Resume from "../../settings/resume.json";
import { Logo } from "./Logo";

export const LogoLink = () => {
    return (
            <Link
                variant="h6"
                href={Resume.basics.url}
                underline="none"
                color="inherit"
                noWrap
                className="svg container" // Ensure container class is included
            >
                <Logo />
            </Link>
    );
};