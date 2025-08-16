import { EVirtualAccountType, TAccount, TAccountGroup } from "../../lib/VirtualAccountManagement/src/Account/VirtualAccount";
import mainMenu from "./mainMenu";
import { inputMenu, optionsMenu } from "./menu";
import fs from "fs";

export default function createAccounts() {
    console.clear();
    getPath();

    function getPath() {
        inputMenu("# Enter path to folder: ", (input) => getFileName({ path: input }));
    }

    function getFileName(context: { path: string }) {
        inputMenu("Enter filename (without file extension): ", (input) => {
            getAccountType({ ...context, filename: input });
        });
    }

    function getAccountType(context: { path: string, filename: string }) {
        optionsMenu(
            "# Account type:",
            [
                { name: "account",  callback: () => getAccountName({ ...context, accounts: [] }) },
                { name: "group", callback: () => getAccountGroupName({ ...context, accounts: [] }) }
            ]
        );
    }

    function getAccountName(context: { path: string, filename: string, accounts: TAccount[] }) {
        inputMenu("# Enter account name:\n  ('.exit', '.save')", (input) => {
            if (input == ".exit") {
                return mainMenu();
            }
            if (input == ".save") {
                saveAccounts(context);
                return getAccountName(context);
            }
            getAccountValue({ ...context, name: input });
        });
    }

    function getAccountValue(context: { path: string, filename: string, accounts: TAccount[], name: string }) {
        inputMenu("# Enter account value\n  ('.exit'): ", (input) => {
            if (input == ".exit") {
                return mainMenu();
            }
            const value = parseFloat(input);
            const account: TAccount = { kind: EVirtualAccountType.Account, name: context.name, amount: value };
            context.accounts.push(account);
            getAccountName({ path: context.path, filename: context.filename, accounts: context.accounts });
        })
    }

    function getAccountGroupName(context: { path: string, filename: string, accounts: TAccountGroup[] }) {
        inputMenu("# Enter account group name:\n  ('.exit', '.save')", (input) => {
            if (input == '.exit') {
                return mainMenu();
            }
            if (input == '.save') {
                saveAccountGroups(context);
                return getAccountGroupName(context);
            }
            getAccountGroupChildren({ ...context, name: input });
        });
    }

    function getAccountGroupChildren(context: { path: string, filename: string, accounts: TAccountGroup[], name: string }) {
        inputMenu("# Enter comma-separated child account names:\n  ('.exit)", (input) => {
            if (input == '.exit') {
                return mainMenu();
            }
            const childNames = input.split(",").map(name => name.trim());
            const accountGroup: TAccountGroup = { kind: EVirtualAccountType.Group, name: context.name, accounts: childNames };
            context.accounts.push(accountGroup);
            getAccountGroupName({ path: context.path, filename: context.filename, accounts: context.accounts });
        });
    }

    function saveAccounts(context: { path: string, filename: string, accounts: TAccount[] }) {
        const path = context.path + context.filename + ".accounts.json";
        const data = JSON.stringify(context.accounts, null, "\t");
        fs.writeFileSync(path, data);
        console.log("Saved to '" + path + "'");
    }

    function saveAccountGroups(context: { path: string, filename: string, accounts: TAccountGroup[] }) {
        const path = context.path + context.filename + ".groups.json";
        const data = JSON.stringify(context.accounts, null, "\t");
        fs.writeFileSync(path, data);
        console.log("Saved to '" + path + "'");
    }
}