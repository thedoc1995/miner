const config = require('./config.js');
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider(config.RPC);
const miner = new ethers.Wallet(config.PRIVATE_KEY, provider);
const HYPERSOUND_ADDRESS = '0x22B309977027D4987C3463774D7046d5136CB14a';
const HYEPRSOUND_ABI = require('./abi.json')
const hypersound = new ethers.Contract(HYPERSOUND_ADDRESS, HYEPRSOUND_ABI, miner);


async function mine (_nonce) {
	try {
		let tx

		if (config.CALLS_PER_MINE_TX === 1) {
			tx = await hypersound.connect(miner).mine('0x', { nonce: _nonce, gasLimit: config.GAS_LIMIT })
		} else {
			tx = await hypersound.connect(miner).mineBatch(config.CALLS_PER_MINE_TX, '0x', { nonce: _nonce, gasLimit: config.GAS_LIMIT })
		}
		
		console.log('Mine transaction sent with the nonce', _nonce)
		
		tx.wait().then(result => {
    		console.log('Mine transaction confirmed with the nonce', _nonce)
    	})
	} catch (e) {
		console.error('An error occurred while executing the transaction with the nonce', _nonce, e)
        console.log(e.code, e.info, e?.data.info)
	}
}

provider.getTransactionCount(miner.address).then(nonce => {
	mine(nonce)

	setInterval(() => {
		mine(++nonce)
	}, 60000 / config.MINE_TX_PER_MINUTE)
})

