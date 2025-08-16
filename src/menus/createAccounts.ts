import { EVirtualAccountType, TAccount, TAccountGroup } from "../../lib/VirtualAccountManagement/src/Account/VirtualAccount";
import { logContext } from "../logging/logging";
import mainMenu from "./mainMenu";
import { inputMenu, optionsMenu } from "./menu";
import fs, { access } from "fs";

export default function createAccounts() {
    getPath();

    function getPath() {
        logContext([]);
        inputMenu("# Enter path to folder: ", (input) => getFileName({ path: input }));
    }

    function getFileName(context: { path: string }) {
        logContext([ context ]);
        inputMenu("Enter filename (without file extension): ", (input) => {
            getAccountType({ ...context, filename: input });
        });
    }

    function getAccountType(context: { path: string, filename: string }) {
        logContext([ context ]);
        optionsMenu(
            "# Account type:",
            [
                { name: "account",  callback: () => getAccountName({ ...context, accounts: [] }) },
                { name: "group", callback: () => getAccountGroupName({ ...context, accounts: [] }) }
            ]
        );
    }

    function getAccountName(context: { path: string, filename: string, accounts: TAccount[] }) {
        logContext([ context ]);
        inputMenu("# Enter account name:\n  ('.exit', '.save')", (input) => {
            if (input == ".exit") {
                return mainMenu();
            }
            if (input == ".save") {
                return saveAccounts(context);
            }
            getAccountValue(context, { name: input });
        });
    }

    function getAccountValue(context: { path: string, filename: string, accounts: TAccount[] }, account: { name: string }) {
        logContext([ context, account ]);
        inputMenu(`# Enter value for account '${account.name}'\n  ('.exit'): `, (input) => {
            if (input == ".exit") {
                return mainMenu();
            }
            const value = parseFloat(input);
            const accountNew: TAccount = { kind: EVirtualAccountType.Account, name: account.name, amount: value };
            context.accounts.push(accountNew);
            getAccountName({ path: context.path, filename: context.filename, accounts: context.accounts });
        })
    }

    function getAccountGroupName(context: { path: string, filename: string, accounts: TAccountGroup[] }) {
        logContext([ context ]);
        inputMenu("# Enter account group name:\n  ('.exit', '.save')", (input) => {
            if (input == '.exit') {
                return mainMenu();
            }
            if (input == '.save') {
                return saveAccountGroups(context);
            }
            getAccountGroupChildren({ ...context }, { name: input });
        });
    }

    function getAccountGroupChildren(context: { path: string, filename: string, accounts: TAccountGroup[] }, accountGroup: { name: string }) {
        logContext([ context, accountGroup ]);
        inputMenu("# Enter comma-separated child account names:\n  ('.exit')", (input) => {
            if (input == '.exit') {
                return mainMenu();
            }
            const childNames = input.split(",").map(name => name.trim());
            const accountGroupNew: TAccountGroup = { kind: EVirtualAccountType.Group, name: accountGroup.name, accounts: childNames };
            context.accounts.push(accountGroupNew);
            getAccountGroupName(context);
        });
    }

    function saveAccounts(context: { path: string, filename: string, accounts: TAccount[] }) {
        const path = context.path + context.filename + ".accounts.json";
        const data = JSON.stringify(context.accounts, null, "\t");
        fs.writeFileSync(path, data);
        getAccountName(context);
        console.log("Saved to '" + path + "'");
    }

    function saveAccountGroups(context: { path: string, filename: string, accounts: TAccountGroup[] }) {
        const path = context.path + context.filename + ".groups.json";
        const data = JSON.stringify(context.accounts, null, "\t");
        fs.writeFileSync(path, data);
        getAccountGroupName(context);
        console.log("Saved to '" + path + "'");
    }
}