var StackEtherBallot = artifacts.require("StackEtherBallot");

module.exports = function(deployer)
{
	deployer.deploy(StackEtherBallot, 5);
};