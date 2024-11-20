import React from "react";
import { Link, Tooltip, Zoom } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Resume from "../../settings/resume.json";
import { Logo } from "./Logo";

const useStyles = makeStyles((theme) => ({
    svg: {
        width: "120px",
        height: "120px",
        position: "absolute",
        top: theme.spacing(6),
        left: theme.spacing(6),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignItems: "center",   
        "&:hover": {
            transition: "all 0.5s ease",
            zIndex: 1000,
            color: "inherit"
        },
        transition: "all 0.5s ease",
    },
}));

export const LogoLink = () => {
    const classes = useStyles();

    return (
        <Tooltip
            title={Resume.basics.name}
            placement="right"
            TransitionComponent={Zoom}
        >
            <Link
                variant="h6"
                href={Resume.basics.url}
                underline="none"
                color="inherit"
                noWrap
                className={`${classes.svg} ${classes.container}`} // Ensure container class is included
            >
                <Logo />
            </Link>
        </Tooltip>
    );
};