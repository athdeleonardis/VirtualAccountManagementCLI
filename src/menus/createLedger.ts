import { ELedgerLineType, TLedgerLine, TLedgerLineAddition, TLedgerLineDistribution, TLedgerLineDistributionEntry, TLedgerLineSubtraction, TLedgerLineTopUp, TLedgerLineTransfer } from "../../lib/VirtualAccountManagement/src/Ledger/Ledger";
import { logContext } from "../logging/logging";
import mainMenu from "./mainMenu";
import { inputMenu, optionsMenu } from "./menu";
import fs from "fs";

export default function createLedger() {
    type TContext = {
        path: string,
        filename: string,
        ledgerLines: TLedgerLine[]
    };

    getPath();

    function getPath() {
        logContext([]);
        inputMenu("# Enter path to folder: ", (input) => {
            getFilename({ path: input });
        });
    }

    function getFilename(context: { path: string }) {
        logContext([ context ]);
        inputMenu("# Enter filename (without file extension): ", (input) => {
            getLedgerLineType({ ...context, filename: input, ledgerLines: [] });
        });
    }

    function getLedgerLineType(context: TContext) {
        logContext([ context ]);
        optionsMenu("# Select ledger line type: ", [
            { name: "addition", callback: () => ledgerLineAdd(context) },
            { name: "subtraction", callback: () => ledgerLineSubtract(context) },
            { name: "transfer", callback: () => ledgerLineTransfer(context) },
            { name: "top-up", callback: () => ledgerLineTopUp(context) },
            { name: "distribute", callback: () => ledgerLineDistribute(context) },
            { name: ".save", callback: () => save(context), notNumberSelectable: true },
            { name: ".exit", callback: mainMenu, notNumberSelectable: true },
        ]);
    }

    function ledgerLineAdd(context: TContext) {
        getFromAccount(context);

        function getFromAccount(context: TContext) {
            logContext([ context ]);
            inputMenu("# Enter from-account name (Fake): ", (input) => {
                return getToAccount(context, { fromAccount: input });
            });
        }

        function getToAccount(context: TContext, ledgerLine: { fromAccount: string }) {
            logContext([ context, ledgerLine ]);
            inputMenu("# Enter to-account name:", (input) => {
                return getAmount(context, { ...ledgerLine, toAccount: input });
            });
        }

        function getAmount(context: TContext, ledgerLine: { fromAccount: string, toAccount: string }) {
            logContext([ context, ledgerLine ]);
            inputMenu("# Enter amount to add to to-account: ", (input) => {
                const amount = parseFloat(input);
                const ledgerLineAdd: TLedgerLineAddition = {
                    kind: ELedgerLineType.Addition,
                    ...ledgerLine,
                    amount: amount
                };
                context.ledgerLines.push(ledgerLineAdd);
                return getLedgerLineType(context);
            });
        }
    }

    function ledgerLineSubtract(context: TContext) {
        getFromAccount(context);

        function getFromAccount(context: TContext) {
            logContext([ context ]);
            return inputMenu("# Enter from-account name: ", (input) => {
                return getToAccount(context, { fromAccount: input });
            });
        }

        function getToAccount(context: TContext, ledgerLine: { fromAccount: string }) {
            logContext([ context, ledgerLine ]);
            return inputMenu("# Enter to-account name (Fake): ", (input) => {
                return getAmount(context, { ...ledgerLine, toAccount: input });
            });
        }

        function getAmount(context: TContext, ledgerLine: { fromAccount: string, toAccount: string }) {
            logContext([ context, ledgerLine ]);
            return inputMenu("# Enter amount to subtract from from-account: ", (input) => {
                const amount = parseFloat(input);
                const ledgerLineSubtract: TLedgerLineSubtraction = {
                    kind: ELedgerLineType.Subtraction,
                    ...ledgerLine,
                    amount: amount
                };
                context.ledgerLines.push(ledgerLineSubtract);
                return getLedgerLineType(context);
            });
        }
    }

    function ledgerLineTransfer(context: TContext) {
        getFromAccount(context);

        function getFromAccount(context: TContext) {
            logContext([ context ]);
            return inputMenu("# Enter from-account to transfer from: ", (input) => {
                return getToAccount(context, { fromAccount: input });
            });
        }

        function getToAccount(context: TContext, ledgerLine: { fromAccount: string }) {
            logContext([ context, ledgerLine ]);
            return inputMenu("# Enter to-account to transfer to: ", (input) => {
                return getAmount(context, { ...ledgerLine, toAccount: input });
            });
        }
        
        function getAmount(context: TContext, ledgerLine: { fromAccount: string, toAccount: string }) {
            logContext([ context, ledgerLine ]);
            return inputMenu("# Enter amount to transfer from from-account to to-account: ", (input) => {
                const amount = parseFloat(input);
                const ledgerLineTransfer: TLedgerLineTransfer = {
                    kind: ELedgerLineType.Transfer,
                    ...ledgerLine,
                    amount: amount
                };
                context.ledgerLines.push(ledgerLineTransfer);
                return getLedgerLineType(context);
            });
        }
    }

    function ledgerLineTopUp(context: TContext) {
        getFromAccount(context);

        function getFromAccount(context: TContext) {
            logContext([ context ]);
            return inputMenu("# Enter from-account to transfer top-up from: ", (input) => {
                getToAccount(context, { fromAccount: input });
            });
        }

        function getToAccount(context: TContext, ledgerLine: { fromAccount: string }) {
            logContext([ context, ledgerLine ]);
            return inputMenu("# Enter to-account to transfer top-up to: ", (input) => {
                return getAmount(context, { ...ledgerLine, toAccount: input });
            });
        }

        function getAmount(context: TContext, ledgerLine: { fromAccount: string, toAccount: string }) {
            logContext([ context, ledgerLine ]);
            inputMenu("# Enter amount for to-account to be topped up to: ", (input) => {
                const amount = parseFloat(input);
                const ledgerLineTopUp: TLedgerLineTopUp = {
                    kind: ELedgerLineType.TopUp,
                    ...ledgerLine,
                    amount: amount
                };
                context.ledgerLines.push(ledgerLineTopUp);
                return getLedgerLineType(context);
            });
        }
    }

    function ledgerLineDistribute(context: TContext) {
        getFromAccount(context);

        function getFromAccount(context: TContext) {
            logContext([ context ]);
            inputMenu("# Enter from-account to distribute from: ", (input) => {
                return getToAccounts(context, { fromAccount: input });
            });
        }

        function getToAccounts(context: TContext, ledgerLine: { fromAccount: string }) {
            logContext([ context, ledgerLine ]);
            inputMenu("# Enter to-accounts to distribute to (Comma separated): ", (input) => {
                const toAccounts = input.split(",").map(entry => entry.trim());
                return getToAccountProportion(context, { ...ledgerLine, toAccounts: [] }, toAccounts);
            });
        }

        function getToAccountProportion(context: TContext, ledgerLine: { fromAccount: string, toAccounts: TLedgerLineDistributionEntry[] }, toAccounts: string[]) {
            const toAccount = toAccounts.shift();
            if (toAccount === undefined) {
                return addLedgerLine(context, ledgerLine);
            }
            logContext([ context, ledgerLine, toAccounts ]);
            return inputMenu(`# Enter proportion for to-account '${toAccount}'`, (input) => {
                const proportion = parseFloat(input);
                const toAccountEntry: TLedgerLineDistributionEntry = {
                    name: toAccount,
                    proportion: proportion
                };
                ledgerLine.toAccounts.push(toAccountEntry);
                getToAccountProportion(context, ledgerLine, toAccounts);
            });
        }

        function addLedgerLine(context: TContext, ledgerLine: { fromAccount: string, toAccounts: TLedgerLineDistributionEntry[] }) {
            const ledgerLineDistribute: TLedgerLineDistribution = {
                kind: ELedgerLineType.Distribution,
                ...ledgerLine
            };
            context.ledgerLines.push(ledgerLineDistribute);
            return getLedgerLineType(context);
        }
    }

    function save(context: TContext) {
        const path = context.path + context.filename + ".ledger.json";
        const data = JSON.stringify(context.ledgerLines, null, "\t");
        fs.writeFileSync(path, data);
        getLedgerLineType(context);
        console.log(`Saved to '${path}'`);
    }
}