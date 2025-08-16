import { accountMapToArray, createAccountMap, TAccount, TAccountMap } from "../../lib/VirtualAccountManagement/src/Account/VirtualAccount";
import { createLedgerLine, TLedgerLine } from "../../lib/VirtualAccountManagement/src/Ledger/Ledger";
import { logContext } from "../logging/logging";
import mainMenu from "./mainMenu";
import { inputMenu } from "./menu";
import fs from "fs";

export default function applyLedger() {
    return getPath();

    function getPath() {
        logContext([]);
        return inputMenu("# Enter path to the folder to output to: ", (input) => {
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
        return inputMenu("# Enter filename for starting account values (without file extension):\n  ('.skip')", (input) => {
            if (input == '.skip') {
                const accountMap = createAccountMap([]);
                return getLedger(context, accountMap);
            }
            const path = input + ".accounts.json";
            const accountsString = fs.readFileSync(path, { encoding: "utf-8" });
            const accounts = JSON.parse(accountsString) as TAccount[];
            const accountMap = createAccountMap(accounts);
            return getLedger(context, accountMap);
        });
    }

    function getLedger(context: { path: string, filename: string }, accountMap: TAccountMap) {
        logContext([ context, accountMap ]);
        return inputMenu("# Enter filename for ledger to apply to the account values (without file extension):\n  ('.save', '.exit')", (input) => {
            if (input == '.exit') {
                return mainMenu();
            }
            if (input == '.save') {
                return save(context, accountMap);
            }

            const path = input + ".ledger.json";
            const ledgerString = fs.readFileSync(path, { encoding: "utf-8" });
            const ledger = JSON.parse(ledgerString) as TLedgerLine[];
            ledger.forEach(ledgerLineData => {
                const ledgerLine = createLedgerLine(ledgerLineData);
                ledgerLine.apply(accountMap);
            });
            return getLedger(context, accountMap);
        });
    }

    function save(context: { path: string, filename: string }, accountMap: TAccountMap) {
        const accounts: TAccount[] = accountMapToArray(accountMap);
        const path = context.path + context.filename + ".accounts.json";
        const data = JSON.stringify(accounts, null, "\t");
        fs.writeFileSync(path, data);
        getLedger(context, accountMap);
        console.log(`Saved to '${path}'`);
    }
}