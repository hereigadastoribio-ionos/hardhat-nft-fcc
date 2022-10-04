const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
const {
	storeImages,
	storeTokenUriMetadata,
} = require('../utils/uploadToPinata');

const imagesLocation = './images/randomNft';

const metadataTemplate = {
	name: '',
	description: '',
	image: '',
	attributes: [
		{
			trait_type: 'Cuteness',
			value: 100,
		},
	],
};

const FUND_AMOUNT = ethers.utils.parseEther('30');

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	let tokenUris = [
		'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
		'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
		'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm',
	];

	if (process.env.UPLOAD_TO_PINATA == 'True') {
		tokenUris = await handleTokenUris();
	}

	let vrfCoodinatorV2Address, subscriptionId, vrfCoordinatorV2Mock;

	if (developmentChains.includes(network.name)) {
		vrfCoordinatorV2Mock = await ethers.getContract(
			'VRFCoordinatorV2Mock'
		);
		vrfCoodinatorV2Address = vrfCoordinatorV2Mock.address;
		const tx = await vrfCoordinatorV2Mock.createSubscription();
		const txReceipt = await tx.wait();
		subscriptionId = txReceipt.events[0].args.subId;
		await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
		
		
	} else {
		vrfCoodinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
		subscriptionId = networkConfig[chainId].subscriptionId;
	}

	log('--------------------------------------------------');

	const args = [
		vrfCoodinatorV2Address,
		subscriptionId,
		networkConfig[chainId].gasLane,
		networkConfig[chainId].callbackGasLimit,
		tokenUris,
		networkConfig[chainId].mintFee,
	];

	const randomIpfsNft = await deploy('RandomIpfsNft', {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if(developmentChains.includes(network.name)) {
		await vrfCoordinatorV2Mock.addConsumer(1, randomIpfsNft.address);
	}

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log('Verifying...');
		await verify(randomIpfsNft.address, args);
	}
	log('--------------------------------------------------');
};

async function handleTokenUris() {
	let tokenUris = [];
	const { responses: imageUploadResponses, files } = await storeImages(
		imagesLocation
	);
	for (imageUploadResponseIndex in imageUploadResponses) {
		let tokenUriMetadata = { ...metadataTemplate };
		tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
			'.png',
			''
		);
		tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
		tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
		console.log(`Uploading ${tokenUriMetadata.name}...`);

		const metadataUploadResponse = await storeTokenUriMetadata(
			tokenUriMetadata
		);
		tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
	}
	console.log('Token URIs Uploaded! They are:');
	console.log(tokenUris);

	return tokenUris;
}

module.exports.tags = ['all', 'randomipfs', 'main'];
module.exports.dependencies = ['mocks'];
