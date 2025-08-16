import { accountMapToArray, calculateAccountGroups as calculateAccountGroupsLib, createAccountMap, TAccount, TAccountGroup } from "../../lib/VirtualAccountManagement/src/Account/VirtualAccount";
import { logContext } from "../logging/logging";
import mainMenu from "./mainMenu";
import { inputMenu, optionsMenu } from "./menu";
import fs from "fs";

export default function calculateAccountGroups() {
    return getPath();

    function getPath() {
        logContext([]);
        return inputMenu("# Enter path to folder to output to: ", (input) => {
            return getFilename({ path: input });
        });
    }

    function getFilename(context: { path: string }) {
        logContext([ context ]);
        return inputMenu("# Enter filename to output to (without file extension): ", (input) => {
            return getAccounts({ ...context, filename: input });
        });
    }

    function getAccounts(context: { path: string, filename: string }) {
        logContext([ context ]);
        return inputMenu("# Enter filepath to accounts (without file extension): ", (input) => {
            const path = input + ".accounts.json";
            const accountsString = fs.readFileSync(path, { encoding: "utf-8" });
            const accounts = JSON.parse(accountsString) as TAccount[];
            return getAccountGroups(context, accounts);
        });
    }

    function getAccountGroups(context: { path: string, filename: string }, accounts: TAccount[]) {
        logContext([ context, accounts ]);
        return inputMenu("# Enter filepath to account groups (without file extension): ", (input) => {
            const path = input + ".groups.json";
            const accountGroupsString = fs.readFileSync(path, { encoding: "utf-8" });
            const accountGroups = JSON.parse(accountGroupsString) as TAccountGroup[];
            const accountMap = createAccountMap(accounts);
            const accountGroupsMap = calculateAccountGroupsLib(accountGroups, accountMap);
            const accountGroupValues = accountMapToArray(accountGroupsMap);
            return saveMenu(context, accounts, accountGroups, accountGroupValues);
        });
    }

    function saveMenu(context: { path: string, filename: string }, accounts: TAccount[], accountGroups: TAccountGroup[], accountGroupValues: TAccount[]) {
        logContext([ context, accounts, accountGroups, accountGroupValues ]);
        return optionsMenu("# Save or exit:", [
            {
                name: ".save", callback: () => save(context, accounts, accountGroups, accountGroupValues), notNumberSelectable: true },
            { name: ".exit", callback: mainMenu, notNumberSelectable: true }
        ]);
    }

    function save(context: { path: string, filename: string }, accounts: TAccount[], accountGroups: TAccountGroup[], accountGroupValues: TAccount[]): void {
        const dataObject = {} as any;
        dataObject.accounts = accounts;
        dataObject.accountGroups = accountGroups;
        dataObject.accountGroupValues = accountGroupValues;
        const path = context.path + context.filename + ".groups.summary.json";
        const data = JSON.stringify(dataObject);
        fs.writeFileSync(path, data);
        saveMenu(context, accounts, accountGroups, accountGroupValues);
        console.log(`Saved to '${path}'`);
    }
}
