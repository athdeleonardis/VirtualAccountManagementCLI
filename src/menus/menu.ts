import readline from "readline";

const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export type TOption = {
    name: string,
    callback: () => void,
    notNumberSelectable?: boolean,
};

export function optionsMenu(text: string, options: TOption[]) {
    console.log(text);
    options.forEach((option, index) => {
        const number = `${option.notNumberSelectable ? ' ' : (index+1)}`
        console.log(`  |-[${number}]: ${option.name}`)}
    );
    getInput();

    function getInput() {
        read.question("", (input) => {
            const n = parseInt(input);
            if (!Number.isNaN(n)) {
                if (n < 1 || n > options.length) {
                    console.log(`[${n}] is not an option.`);
                    return getInput();
                }

                const option = options[n-1];
                if (option.notNumberSelectable) {
                    console.log(`[${n}] is not selectable by number.`);
                    return getInput();
                }

                return options[n-1].callback();
            }

            input = input.trim().toLowerCase();
            const option = options.find(option => option.name == input);
            if (option !== undefined) {
                return option.callback();
            }

            console.log(`'${input}' is not an option.`);
            getInput();
        });
    }
}

export function inputMenu(text: string, callback: (input: string) => void) {
    console.log(text);
    read.question("", (input) => {
        input = input.trim();
        callback(input);
    });
}