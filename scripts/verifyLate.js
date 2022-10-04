const { verify } = require('../utils/verify');
const { networkConfig } = require('../helper-hardhat-config');
const fs = require('fs');

const chainId = 5;

async function main() {
	await verify('0xd5cbfbdffe6b23a20fab6511bc8eae909f841aa7', []);
	await verify('0xbb2c9c0747cece528c3ec2aa93db8b8c4f941d5d', [
		networkConfig[chainId].vrfCoordinatorV2,
		networkConfig[chainId].subscriptionId,
		networkConfig[chainId].gasLane,
		networkConfig[chainId].callbackGasLimit,
		[
			'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
			'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
			'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm',
		],
		networkConfig[chainId].mintFee,
	]);
	await verify('0xe7ff533b53bac3023b732e577dd370f8ba35d8ca', [
		networkConfig[chainId].ethUsdPriceFeed,
		fs.readFileSync('./images/dynamicNft/frown.svg', {
			encoding: 'utf8',
		}),
		fs.readFileSync('./images/dynamicNft/happy.svg', {
			encoding: 'utf8',
		}),
	]);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
