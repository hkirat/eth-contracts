import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

let pool = {
  ETH: 100,
  USDC: 10000
};

let k = pool.ETH * pool.USDC;

app.post('/addLiquidity', (req, res) => {
  const { ethAmount, usdcAmount } = req.body;

  const currentRatio = pool.ETH / pool.USDC;
  const providedRatio = ethAmount / usdcAmount;

  const tolerance = 0.01;

  if (Math.abs(currentRatio - providedRatio) > tolerance) {
    return res.status(400).send("Provided ratio does not match the pool's ratio.");
  }

  pool.ETH += ethAmount;
  pool.USDC += usdcAmount;

  // Update the k constant
  k = pool.ETH * pool.USDC;

  res.send(`Added ${ethAmount} ETH and ${usdcAmount} USDC to the pool. New balances: ${pool.ETH} ETH, ${pool.USDC} USDC`);
});

// Users swap ETH to USDC
app.post('/swapEthToUSDC', (req, res) => {
  const { ethAmount } = req.body;

  const usdcAmount = (pool.USDC - (k / (pool.ETH + ethAmount)));

  pool.ETH += ethAmount;
  pool.USDC -= usdcAmount;

  res.send(`Swapped ${ethAmount} ETH for ${usdcAmount} USDC. The price you bought it at is ${usdcAmount / ethAmount} USDC/ETH. New pool balances: ${pool.ETH} ETH, ${pool.USDC} USDC`);
});

// Users swap USDC to ETH
app.post('/swapUSDCToEth', (req, res) => {
  const { userId, usdcAmount } = req.body;

  const ethAmount = (pool.ETH - (k / (pool.USDC + usdcAmount)));

  pool.USDC += usdcAmount;
  pool.ETH -= ethAmount;

  res.send(`Swapped ${usdcAmount} USDC for ${ethAmount} ETH. The price you bought it at is ${usdcAmount / ethAmount} USDC/ETH. New pool balances: ${pool.ETH} ETH, ${pool.USDC} USDC`);
});

app.get('/pool', (req, res) => {
  res.json(pool);
});

app.listen(port, () => {
  console.log(`AMM simulator app listening on http://localhost:${port}`);
});
