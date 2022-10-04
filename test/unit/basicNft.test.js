const { assert } = require('chai');
const { network, ethers, deployments, getNamedAccounts } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
	? describe.skip
	: describe('BasicNft unit tests', () => {
			let deployer, basicNft;
			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['basicnft']);
				basicNft = await ethers.getContract('BasicNft', deployer);
			});

			describe('constructor', async () => {
				it('Initializes the NFT correctly', async () => {
					const name = await basicNft.name();
					const symbol = await basicNft.symbol();
					const tokenCounter = await basicNft.getTokenCounter();

					assert.equal(name.toString(), 'Dogie');
					assert.equal(symbol.toString(), 'DOG');
					assert.equal(tokenCounter.toString(), '0');
				});
			});

			describe('mintNft', () => {
				it('Allows users to mint an NFT, and updates appropriately', async () => {
					const tokenCounter = await basicNft.getTokenCounter();
					const tx = await basicNft.mintNft();
					await tx.wait(1);
					const newCounter = await basicNft.getTokenCounter();

					assert.equal(
						(tokenCounter.add(1)).toString(),
						newCounter.toString()
					);
				});
			});
	  });
