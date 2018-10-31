#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const meow = require('meow');
const generate = require('./lottery_generator').generate;


const cli = meow(`Accept one or more json file in the  "files" arg
    Usage
		  lottery_generator [<file|directory|glob> ...]`, {
    flags: {
        targetsVersions: {
            type: 'string',
            alias: 'v',
            default: '1'
        },
        extensions: {
            type: 'string',
            alias: 'e',
            default: ".json"
        },
        winnerAddress: {
            type: 'string',
            alias: 'w',
            default: "0x7c8c7a481a3dac2431745ce9b18b3bb8b6c526e7"
        },
        tokenAddr: {
            type: 'string',
            alias: 't',
            default: '0x1000000000000000000000000000000000000011'
        },
        faceValue: {
            type: 'string',
            alias: 'f', 
            default: '1000'
        },
        power: {
            type: 'string',
            alias: 'p',
            default: '10'
        },
    }
});

let filePaths = [];
const extensions = cli.flags.extensions ? cli.flags.extensions.split(','): [".json"]
const cwd = process.cwd();
if (cli.input.length > 0) {
    cli.input.forEach(item => {
        if (!path.isAbsolute(item)) {
            item = path.join(cwd, item);
        }
        let lstat = fs.lstatSync(item);
        if (lstat.isDirectory()) {
            // add or files with the specfied extensions under that directory
            const files = fs.readdirSync(item);
            files.forEach(file => {
                console.log(`Found ${file} under directory ${item}`);
                const fullPath = path.join(item, file);
                if (fs.lstatSync(fullPath).isFile()) {
                    const ext = path.extname(file);
                    if (extensions.indexOf(ext) >= 0 ) {
                        console.log(`Adding file: ${fullPath}.`);
                        filePaths.push(fullPath);
                    }
                }
            });

        } else if (lstat.isFile()) {
            console.log(`Adding file: ${item}.`);
            filePaths.push(item);
        }
    });
}


const winner_address = cli.flags.winnerAddress;
const token_addr = cli.flags.tokenAddr;
const faceValue = parseInt(cli.flags.faceValue);
const power = parseInt(cli.flags.power);

console.log(`Using random strings in the files ${filePaths}`);

const targets = cli.flags.targetsVersions.split(',');

// generate(0, filePaths);
targets.forEach(i => {
    generate(parseInt(i), filePaths, {winner_address: winner_address, token_addr: token_addr, faceValue: faceValue, probability: power});
})
