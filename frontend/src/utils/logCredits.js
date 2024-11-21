import { primary } from "../components/theme/Themes";

export const logCredits = () => {
    const logStyle = [
        `color: ${primary}`,
        "font-size: 3em",
        "font-weight: 300",
        "padding: 100px 0px 100px 0px",
    ].join(";");

    return console.log(
        `%c © ${new Date().getFullYear()} samfranklin.dev`,
        logStyle
    );
};
