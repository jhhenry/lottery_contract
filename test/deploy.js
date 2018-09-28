const fs = require('fs')
const web3 = require('./web3Utils');
const txnUtils = require('./txnUtils');
const deployInfo = require('./deployInfo');

const deployedFolder = deployInfo.deployedFolder;
const fn = deployInfo.fn;

/* create the 'deployed' folder */
if (!fs.existsSync(deployedFolder)) {
	fs.mkdirSync(deployedFolder);
}

if (fs.existsSync(fn)) {
	fs.unlinkSync(fn);
}

deloyLotteryContract();


function deloyLotteryContract() {
	console.log('Start deploying the lottery contract...');
	const accounts = web3.eth.accounts;
	for (let acc of accounts) {
		web3.personal.unlockAccount(acc, 'highsharp', 36000);
	}
	console.log("Initialing a new contract...");
	let lotteryAbi = [{ "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "lottery", "type": "bytes" }], "name": "splitLottery", "outputs": [{ "name": "ver", "type": "bytes1" }, { "name": "rs2", "type": "bytes" }, { "name": "hashRs1", "type": "bytes32" }, { "name": "addr", "type": "address" }, { "name": "time", "type": "uint64" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "unLock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "account", "type": "address" }], "name": "getEscrow", "outputs": [{ "name": "deposite", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "ver", "type": "uint8" }, { "name": "hashRs1Rs2", "type": "bytes32" }, { "name": "rs2", "type": "bytes" }], "name": "verifyLottery", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "lottery", "type": "bytes" }, { "name": "signature", "type": "bytes" }, { "name": "winningData", "type": "bytes" }], "name": "verify", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "increase", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "withdrawAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "lottery", "type": "bytes" }, { "indexed": false, "name": "sig", "type": "bytes" }, { "indexed": false, "name": "winningData", "type": "bytes" }, { "indexed": false, "name": "sender", "type": "address" }], "name": "VerifyLottery", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "lottery", "type": "bytes" }, { "indexed": false, "name": "issuingTime", "type": "uint64" }, { "indexed": false, "name": "faceValue", "type": "uint256" }, { "indexed": false, "name": "issuer", "type": "address" }, { "indexed": false, "name": "winner", "type": "address" }], "name": "RedeemedLotttery", "type": "event" }];
	lotteryContract = web3.eth.contract(lotteryAbi);
	lottery = lotteryContract.new(
		{
			from: web3.eth.accounts[0],
			data: '0x60806040526012600460006101000a81548160ff021916908360ff160217905550662386f26fc1000060055567016345785d8a000060065534801561004357600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550611e7d806100936000396000f300608060405260043610610099576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632e1a7d4d1461009e5780635d9906d1146100e357806376e6d2b41461026d578063a26d494d146102b0578063be46bffb14610307578063de8f50a1146103a3578063e8927fbc146104b0578063f435f5a7146104ba578063fa09e630146104fd575b600080fd5b3480156100aa57600080fd5b506100c960048036038101908080359060200190929190505050610540565b604051808215151515815260200191505060405180910390f35b3480156100ef57600080fd5b5061014a600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610621565b60405180867effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681526020018060200185600019166000191681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018367ffffffffffffffff1667ffffffffffffffff168152602001828103825286818151815260200191508051906020019080838360005b8381101561022e578082015181840152602081019050610213565b50505050905090810190601f16801561025b5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390f35b34801561027957600080fd5b506102ae600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506108f1565b005b3480156102bc57600080fd5b506102f1600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610a65565b6040518082815260200191505060405180910390f35b34801561031357600080fd5b50610389600480360381019080803560ff1690602001909291908035600019169060200190929190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610ab6565b604051808215151515815260200191505060405180910390f35b3480156103af57600080fd5b50610496600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610b63565b604051808215151515815260200191505060405180910390f35b6104b86110b4565b005b3480156104c657600080fd5b506104fb600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061110c565b005b34801561050957600080fd5b5061053e600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611280565b005b6000806000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002091508160010160009054906101000a900460ff161561061a578390506006548260000154038411156105bc5760065482600001540390505b8082600001600082825403925050819055503373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050158015610614573d6000803e3d6000fd5b50600192505b5050919050565b6000606060008060008060008088600081518110151561063d57fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f010000000000000000000000000000000000000000000000000000000000000002975060007f010000000000000000000000000000000000000000000000000000000000000002887effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141515610746576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4f6e6c792076657273696f6e203020697320737570706f727465642e0000000081525060200191505060405180910390fd5b88600181518110151561075557fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f0100000000000000000000000000000000000000000000000000000000000000027f0100000000000000000000000000000000000000000000000000000000000000900492508260ff166040519080825280601f01601f1916602001820160405280156107fb5781602001602082028038833980820191505090505b509650600091505b8260ff168260ff1610156108be57886002830160ff1681518110151561082557fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f010000000000000000000000000000000000000000000000000000000000000002878360ff1681518110151561088157fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053508180600101925050610803565b60028301905080602001890151955060348101905080890151945060088101905080890151935050505091939590929450565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610a03576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260428152602001807f4f6e6c792061646d696e6973747261746f722c20616b612074686520636f6e7481526020017f726163742063726561746f722c2063616e2063616c6c2074686973206d65746881526020017f6f6400000000000000000000000000000000000000000000000000000000000081525060600191505060405180910390fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160010160006101000a81548160ff0219169083151502179055505050565b600080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090508060000154915050919050565b60008060008560ff16141515610b34576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f56657273696f6e206d757374206265203000000000000000000000000000000081525060200191505060405180910390fd5b610b3d83611430565b9050610b598482600460009054906101000a900460ff1661149c565b9150509392505050565b6000806000606060008060008060007fb1b59f589e7157bc0345b6d7a9c70c87f80a1f776427ad35eea9cb4751d762e38c8c8c33604051808060200180602001806020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001848103845288818151815260200191508051906020019080838360005b83811015610c11578082015181840152602081019050610bf6565b50505050905090810190601f168015610c3e5780820380516001836020036101000a031916815260200191505b50848103835287818151815260200191508051906020019080838360005b83811015610c77578082015181840152602081019050610c5c565b50505050905090810190601f168015610ca45780820380516001836020036101000a031916815260200191505b50848103825286818151815260200191508051906020019080838360005b83811015610cdd578082015181840152602081019050610cc2565b50505050905090810190601f168015610d0a5780820380516001836020036101000a031916815260200191505b5097505050505050505060405180910390a1610d268b8d6116b3565b975060008873ffffffffffffffffffffffffffffffffffffffff1614151515610db7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601d8152602001807f5369676e617475726520766572696669636174696f6e206661696c656400000081525060200191505060405180910390fd5b610dc08c610621565b9650965096509650965060008473ffffffffffffffffffffffffffffffffffffffff161415610ded573393505b610df78a87611736565b9150610e0485838a611907565b905080151515610e7c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f546865206c6f747465727920686173206265656e2072656465656d65642e000081525060200191505060405180910390fd5b610e868a866119ec565b1515610f20576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b8152602001807f48617368206f66207468652072616e646f6d20737472696e67203120646f657381526020017f206e6f74206d617463682e00000000000000000000000000000000000000000081525060400191505060405180910390fd5b610f4e877f010000000000000000000000000000000000000000000000000000000000000090048388610ab6565b156110a057610f5d8885611a12565b9850881561109b57610f70888684611ad7565b7fd0388e332e12dd251f9872b8e669ca8552d184ecd1fa3ee7d59877eadb7e76af8c846005548b8860405180806020018667ffffffffffffffff1667ffffffffffffffff1681526020018581526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828103825287818151815260200191508051906020019080838360005b8381101561105c578082015181840152602081019050611041565b50505050905090810190601f1680156110895780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a15b6110a5565b600098505b50505050505050509392505050565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905034816000016000828254019250508190555050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561121e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260428152602001807f4f6e6c792061646d696e6973747261746f722c20616b612074686520636f6e7481526020017f726163742063726561746f722c2063616e2063616c6c2074686973206d65746881526020017f6f6400000000000000000000000000000000000000000000000000000000000081525060600191505060405180910390fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160010160006101000a81548160ff0219169083151502179055505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515611392576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260428152602001807f4f6e6c792061646d696e6973747261746f722c20616b612074686520636f6e7481526020017f726163742063726561746f722c2063616e2063616c6c2074686973206d65746881526020017f6f6400000000000000000000000000000000000000000000000000000000000081525060600191505060405180910390fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060008160000154111561142c578173ffffffffffffffffffffffffffffffffffffffff166108fc82600001549081150290604051600060405180830381858888f1935050505015801561142a573d6000803e3d6000fd5b505b5050565b6000816040518082805190602001908083835b6020831015156114685780518252602082019150602081019050602083039250611443565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209050919050565b60008060008060008060408760ff1611151515611547576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260378152602001807f5468652070726f626162696c69747920706172616d657465722073686f756c6481526020017f206e6f742062652067726561746572207468616e20302e00000000000000000081525060400191505060405180910390fd5b87891894506001955060088760ff1681151561155f57fe5b04935060088760ff1681151561157157fe5b069250600091505b8360ff168260ff16101561160357848260ff1660208110151561159857fe5b1a7f01000000000000000000000000000000000000000000000000000000000000000290506000817f0100000000000000000000000000000000000000000000000000000000000000900460ff161415156115f65760009550611603565b8180600101925050611579565b858015611614575060008360ff1614155b156116a75760008360080360ff16868660ff1660208110151561163357fe5b1a7f0100000000000000000000000000000000000000000000000000000000000000027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060020a027f0100000000000000000000000000000000000000000000000000000000000000900460ff161495505b50505050509392505050565b600080611721836040518082805190602001908083835b6020831015156116ef57805182526020820191506020810190506020830392506116ca565b6001836020036101000a0380198251168184511680821785525050505050509050019150506040518091039020611c29565b905061172d8185611ce4565b91505092915050565b6000606060008084518651016040519080825280601f01601f1916602001820160405280156117745781602001602082028038833980820191505090505b509250600091505b85518260ff16101561183257858260ff1681518110151561179957fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f010000000000000000000000000000000000000000000000000000000000000002838360ff168151811015156117f557fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350818060010192505061177c565b85519050600091505b84518260ff1610156118f357848260ff1681518110151561185857fe5b9060200101517f010000000000000000000000000000000000000000000000000000000000000090047f0100000000000000000000000000000000000000000000000000000000000000028382840160ff168151811015156118b657fe5b9060200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350818060010192505061183b565b6118fc83611430565b935050505092915050565b6000806000806000600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002093506000925060009450600091505b600a8260ff1610156119e157838260ff16600a8110151561197a57fe5b6003020190508060000160009054906101000a900460ff1615156119a157600192506119e1565b87600019168160010154600019161480156119c757508660001916816002015460001916145b945084156119d4576119e1565b818060010192505061195d565b505050509392505050565b600080600091506119fc84611430565b9050806000191683600019161491505092915050565b600080600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506005548160000154101515611ad0576005548160000160008282540392505081905550600554600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160008282540192505081905550600191505b5092915050565b600080600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169150600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208260ff16600a81101515611b7857fe5b60030201905060018160000160006101000a81548160ff0219169083151502179055508381600101816000191690555082816002018160001916905550600a6001830160ff16811515611bc757fe5b06915081600360008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908360ff1602179055505050505050565b60008160405160200180807f19457468657265756d205369676e6564204d6573736167653a0a333200000000815250601c0182600019166000191681526020019150506040516020818303038152906040526040518082805190602001908083835b602083101515611cb05780518252602082019150602081019050602083039250611c8b565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390209050919050565b600080600080611cf385611d85565b925092509250600186848484604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af1158015611d70573d6000803e3d6000fd5b50505060206040510351935050505092915050565b600080600060418451141515611e29576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001807f73696761747572652073686f756c6420616c776179732062652036352062797481526020017f6573206c6f6e672e00000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b6020840151915060408401519050606084015160001a925082828292509250925091939092505600a165627a7a72305820bd8dbcd42e7b67e6addfa3aa0746491ea4306e42fb80bab44a5b20b321593fe90029',
			gas: '4700000'
		}, function (e, contract) {
			//console.log(e, contract);
			console.log("Creating the contract callback.");
			if (typeof contract.address !== 'undefined') {
				console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
				fs.appendFile(fn, JSON.stringify({abi: lotteryAbi, addr: contract.address}), err => {
					if (err) throw err;
					console.log("Written addr to the delpoyed file.")
				})

				increaseEscrow();

			}

			

		});
}

async function increaseEscrow()
{
	var accounts = web3.eth.accounts
	var lottery_issuer = accounts[0];
	const initE = lottery.getEscrow(lottery_issuer);
	const txn = lottery.increase({from: lottery_issuer, value: web3.toWei('10', 'ether')});
	const r =  await txnUtils.getReceiptPromise(web3, txn, 60);
	console.log(`txn: ${txn}, r: ${r}`);

	const gap =  await txnUtils.retryPromise(
		() => {
			let e2 = lottery.getEscrow(lottery_issuer);
			console.log(`e2: ${e2}`);
			return web3.fromWei(e2.minus(initE), "ether").toNumber() === 10;
		},
		15);
	if (!gap) {
		console.error("Failed to increase escrow for account 1 during deploy.");
	}
}

