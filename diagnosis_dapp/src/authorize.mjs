import Web3 from 'web3';
import DiagnosisStorageABI from './DiagnosisStorage.json' assert { type: 'json' };

const CONTRACT_ADDRESS = '0xd7325Cef2e27D60397f8F2B0D0690E9234c5D912';
const DOCTOR_ADDRESS = '0x571eDCa0FCb312fB6E5fF94Be2d3A44B9a0e2A3b'; // Replace with the doctor's address
const ADMIN_ADDRESS = '0xd7325Cef2e27D60397f8F2B0D0690E9234c5D912';
const PRIVATE_KEY = '0x1b273ba1172984c8747dc1a4de3f8d7a062ca10ace1b822c3516f42c9c60106e'; // ⚠️ Never expose this publicly

const web3 = new Web3('http://127.0.0.1:7545');
const contract = new web3.eth.Contract(DiagnosisStorageABI.abi, CONTRACT_ADDRESS);

const run = async () => {
  try {
    const tx = contract.methods.authorizeDoctor(DOCTOR_ADDRESS);
    const gas = await tx.estimateGas({ from: ADMIN_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(ADMIN_ADDRESS);
    const chainId = await web3.eth.net.getId();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: CONTRACT_ADDRESS,
        data,
        gas,
        gasPrice,
        nonce,
        chainId
      },
      PRIVATE_KEY
    );

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('✅ Doctor authorized!', receipt.transactionHash);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

run();
