const test = require('ava');
const web3 = require('./web3Utils')
const deployInfo = require('./deployInfo');

var accounts = web3.eth.accounts
var lottery_issuer = accounts[0];
test.before("initialize a existing lottery contract", async t => {
	let lottery = deployInfo.getLottery(web3, t);
	t.context.lottery = lottery;
});

test("simple test", t => {
	let lottery = t.context.lottery;
	t.truthy(lottery);
})