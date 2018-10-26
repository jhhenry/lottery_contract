#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Web3 = require('web3')
const web3 = new Web3();
const meow = require('meow');

const cli = meow(`Accept one or more json file in the  "files" arg
    Usage
		  lottery_generator [<file|directory|glob> ...]`, {
    flags: {
        extensions: {
            type: 'string',
            alias: 'e',
            default: ".json"
        }
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


generate(0, filePaths);
generate(1, filePaths, {winner_address: "0x7c8c7a481a3dac2431745ce9b18b3bb8b6c526e7", token_addr: "0x1000000000000000000000000000000000000011", faceValue: 1000, probability: 10});

function generate(version, filePaths, options = {winner_address: "0x7c8c7a481a3dac2431745ce9b18b3bb8b6c526e7" }) {
    // read file
    console.log(`-----Generating lottery fo version ${version}`)
    filePaths.forEach(fp => {
        const c = fs.readFileSync(fp);
        const json = JSON.parse(c);
        json.forEach(obj => {
            console.log(assembleLottery(obj.str1, obj.str2, version, options.winner_address, options));
        });
    });
}

function assembleLottery(rs1, rs2, ver, winner_address, others) {
    const hashRs1 = web3.sha3(web3.toHex(rs1), { encoding: "hex" });
    var nowString = "00000" + web3.toHex(1540535081065).substring(2);
    const ver0 = "0x" + intToHex(ver) + intToHex(rs2.length) + web3.toHex(rs2).substring(2) + hashRs1.substring(2) + winner_address.substring(2) + nowString;
    if (ver === 0) {
        return ver0;
    } else if (ver === 1) {
        if (others.token_addr && Number.isInteger(others.faceValue) && Number.isInteger(others.probability)) {
            const ver1 = ver0 + others.token_addr.substring(2) + intToHex(others.faceValue, 32) + intToHex(others.probability);
            return ver1;
        } else {
            throw new Error(`unsupported arguments in ${others}`);
        }
    }
}

function intToHex(i, bytes = 1) {
    const rawHex = web3.toHex(i);
    const len = rawHex.length - 2;
    const expectedLen = bytes * 2;
    if (len > expectedLen) throw new Error(`Insufficient space to cover the original integer value. len: ${len}, expectedLen: ${expectedLen}, i: ${i}`);
    return "0".repeat(expectedLen - len) + rawHex.substring(2);
}