import React from "react";
import { LogoLink } from '../components/logo/LogoLink';
import { makeStyles } from '@material-ui/core/styles';
import DisplacementSphere from '../components/background/DisplacementSphere';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { FooterText } from '../components/footer/FooterText';
import { Typography, Container } from "@material-ui/core";
import { TextDecrypt } from "../components/content/TextDecrypt";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    main: {
        marginTop: "auto",
        marginBottom: "auto",
        "@media (max-width: 768px)": {
            marginLeft: theme.spacing(4),
        },
    }
}));

export const PageNotFound = () => {
    const classes = useStyles();

    return (
        <>
            <div className={classes.root}>
                <DisplacementSphere />
                <LogoLink />
                <Container component="main" className={`${classes.main}`} maxWidth="sm">
                    <Typography variant="h2" component="h1" gutterBottom>
                        <TextDecrypt text="Oops, 404... what were you looking for?" />
                    </Typography>
                </Container>
                <ThemeToggle />
                <FooterText />
            </div>
        </>
    );
};
