import React from "react";
import { Link } from '@mui/material'; 
import Zoom from '@mui/material/Zoom';
import './Logo.css';
import Resume from "../../settings/resume.json";
import { Logo } from "./Logo";

export const LogoLink = () => {
    return (
        <Zoom in={true} timeout={1300}>
            <Link
                variant="h6"
                href={Resume.basics.url}
                underline="none"
                color="inherit"
                noWrap
                className="svg container"
                sx={{ 
                    display: 'block', // Ensures block-level rendering
                    '&:hover': {
                        backgroundColor: 'transparent' // Prevents MUI hover background
                    }
                }}
            >
                <Logo />
            </Link>
        </Zoom>
    );
};