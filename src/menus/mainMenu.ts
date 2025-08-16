import applyLedger from "./applyLedger";
import calculateAccountGroups from "./calculateAccountGroups";
import createAccounts from "./createAccounts";
import createLedger from "./createLedger";
import { optionsMenu } from "./menu";

export default function mainMenu() {
    console.clear();
    optionsMenu(
        "# What would you like to do:",
        [
            { name: "create-accounts", callback: createAccounts },
            { name: "create-ledger", callback: createLedger },
            { name: "apply-ledger", callback: applyLedger },
            { name: "calculate-account-groups", callback: calculateAccountGroups },
            { name: ".quit", callback: process.exit, notNumberSelectable: true }
        ]
    )
}
