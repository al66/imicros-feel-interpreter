const Decimal = require('decimal.js');

const context = {Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100};

//(p*r/12)/(1-(1+r/12)**-n)
//PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment
//2878.6935494327667680885203...



const result = (context.Loan.amount*context.Loan.rate/12)/(1-(1+context.Loan.rate/12)**-context.Loan.term) + context.fee;

console.log("2878.6935494327667680885203...");
console.log(result);
console.log(new Decimal(context.Loan.amount).mul(new Decimal(context.Loan.rate).div(12)).div(new Decimal(1).minus(Decimal.pow(new Decimal(1).plus(new Decimal(context.Loan.rate).div(12)),new Decimal(context.Loan.term).neg()))).plus(new Decimal(context.fee)));
