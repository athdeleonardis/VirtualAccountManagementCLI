import createAccounts from "./createAccounts";
import { optionsMenu } from "./menu";

export default function mainMenu() {
    console.clear();
    optionsMenu(
        "# What would you like to do:",
        [
            { name: "create-accounts", callback: createAccounts },
            { name: "create-ledger", callback: mainMenu },
            { name: "quit", callback: process.exit }
        ]
    )
}
