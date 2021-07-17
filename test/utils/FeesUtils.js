const { BN } = require('@openzeppelin/test-helpers');
const {toBN} = require('./BNUtils.js');
const {getContracts} = require('./DeployUtils.js');

const RATIO_DECIMALS = 1e10;
const RATIO_DECIMALS_BN = new BN(RATIO_DECIMALS);
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = 24 * 60 * 60;

const MAX_PREMIUM_FEE = new BN(1000);
const MAX_PERCENTAGE = new BN(10000);

const calculateSingleUnitFee = (cviValue, period) => {
    const coefficients = [100000, 114869, 131950, 151571, 174110];

    if (cviValue === 0 || period === 0) {
        return new BN(0);
    }

    const intCVIValue = Math.floor(cviValue / 100);

    let fundingFeeRate = null;
    if (intCVIValue <= 55) {
        fundingFeeRate = new BN(100000);
    } else if (intCVIValue >= 150) {
        fundingFeeRate = new BN(2000);
    } else {
        const coefficient = new BN(coefficients[(intCVIValue - 55) % 5]);
        fundingFeeRate = RATIO_DECIMALS_BN.div(new BN(2).pow(new BN(intCVIValue).sub(new BN(55)).div(new BN(5)))).div(coefficient).add(new BN(3000));
    }

    return (new BN(cviValue)).mul(RATIO_DECIMALS_BN).mul(fundingFeeRate).mul(new BN(period)).div(new BN(SECONDS_PER_DAY)).div(getContracts().maxCVIValue).div(new BN(1000000));
};

const calculateNextTurbulence = (currTurbulence, periods) => {
	let nextTurbulence = currTurbulence;
    for (let i = 0; i < periods.length; i++) {
        if (periods[i] >= SECONDS_PER_HOUR) {
            nextTurbulence = currTurbulence.div(new BN(2));
        } else {
            nextTurbulence = currTurbulence.add(new BN(100));
        }
    }

    if (nextTurbulence.gt(new BN(1000))) {
        nextTurbulence = new BN(1000);
    }

    return nextTurbulence;
};

const calculateNextAverageTurbulence = (currTurbulence, timeDiff, heartbeat, rounds, lastCVI, currCVI) => {
    const hours = timeDiff.div(new BN(heartbeat)).toNumber();
    let nextTurbulence = currTurbulence;

    const delta = lastCVI.lt(currCVI) ? currCVI.sub(lastCVI) : lastCVI.sub(currCVI);
    const absDeviationPercent = delta.mul(new BN(10000)).div(lastCVI);
    const allowedTimes = absDeviationPercent.mul(new BN(10000)).div(new BN(7000).mul(new BN(500)));

    let decayTimes = 0;
    let increaseTimes = 0;

    if (hours >= rounds) {
        decayTimes = rounds;
    } else {
        increaseTimes = rounds - hours;

        if (increaseTimes > allowedTimes) {
            increaseTimes = allowedTimes;
        }

        decayTimes = rounds - increaseTimes;
    }

    for (let i = 0; i < decayTimes; i++) {
        nextTurbulence = nextTurbulence.div(new BN(2));
    }

    for (let i = 0; i < increaseTimes; i++) {
        nextTurbulence = nextTurbulence.add(new BN(100));
    }

    if (nextTurbulence.gt(new BN(1000))) {
        nextTurbulence = new BN(1000);
    }

    if (nextTurbulence.lt(new BN(100))) {
        nextTurbulence = new BN(0);
    }

    return nextTurbulence;
};

const calculatePremiumFee = (units, ratio, lastRatio, trubulence) => {
    let premiumFee = new BN(0);

    const minFeeRatio = new BN(8).mul(toBN(1, 10)).div(new BN(10));

    if (ratio.gte(toBN(1, 10))) {
        premiumFee = MAX_PREMIUM_FEE;
    } else if (ratio.gte(minFeeRatio)) {
        const complementRatio = RATIO_DECIMALS_BN.sub(ratio);
        premiumFee = RATIO_DECIMALS_BN.mul(RATIO_DECIMALS_BN).div(complementRatio).div(complementRatio);
    }

    if (premiumFee.gt(new BN(0))) {
        if (lastRatio.lt(minFeeRatio)) {
            premiumFee = premiumFee.mul(ratio.sub(minFeeRatio)).div(ratio.sub(lastRatio));
        }
    }

    /*if (!premiumFee.gt(new BN(0))) {
        premiumFee = premiumFee.add(new BN(15));
    }*/

    premiumFee = premiumFee.add(trubulence);
    if (premiumFee.gt(MAX_PREMIUM_FEE)) {
        premiumFee = MAX_PREMIUM_FEE;
    }

    return {fee: premiumFee.mul(units).div(MAX_PERCENTAGE), feePercentage: premiumFee};
};

exports.calculateSingleUnitFee = calculateSingleUnitFee;
exports.calculateNextTurbulence = calculateNextTurbulence;
exports.calculateNextAverageTurbulence = calculateNextAverageTurbulence;
exports.calculatePremiumFee =  calculatePremiumFee;

exports.MAX_PERCENTAGE = MAX_PERCENTAGE;
