const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileLotteryContract(...interestedContracts /** Array of contract name with lower case */)
{
    const solFiles = ["../contracts/EIP20Interface.sol", "../contracts/EIP20.sol", "../contracts/AbstractFileToken.sol", "../contracts/FileToken.sol", "../contracts/SimpleFileToken.sol", "../contracts/Lottery.sol", "../contracts/Lottery0.sol"];

    const compiled = compile(solFiles);
    {
        let jsonStr = JSON.stringify(compiled);
        // console.log(`compiled object: ${jsonStr}`);
         const folder = path.resolve("..", "build", "contracts");
         if (!fs.existsSync(path.resolve("..", "build"))) {
             fs.mkdirSync(path.resolve("..", "build"));
         }
         if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
         const compiledFile = path.resolve(folder, "compiled.json");
         fs.writeFile(compiledFile, jsonStr, err => {if(err) console.log(err)});
    }
    const applyInterestedContracts = interestedContracts.length > 0;
    const ret = {};

    try {
        solFiles.forEach(item => {
            let baseName = path.basename(item);
            let contractName = baseName.substr(0, baseName.length - 4);
            if (applyInterestedContracts && interestedContracts.indexOf(contractName) === -1) return;
            let key = baseName + ":" + contractName;
            console.log(`Adding compiled contract ${key}`);
            const contractItem = {abi: JSON.parse(compiled.contracts[key].interface), bytecode: "0x" + compiled.contracts[key].bytecode};
            ret[contractName.toLowerCase()] = contractItem;
        });
        return ret;
    } catch(err) {
        console.log(compiled);
        throw err;
    }
}

function compile(solFiles) {
    let sources = {};
    solFiles.forEach(item => {
        let baseName = path.basename(item);
        sources[baseName] = fs.readFileSync(path.normalize(item)).toString();
    });
    try {
        const compiled = solc.compile({sources: sources}, 1);
        return compiled;
    } catch(err) {
        console.log(`Compilation Error: ${err}`);
    }
   
}

module.exports.compileLotteryContract = compileLotteryContract;