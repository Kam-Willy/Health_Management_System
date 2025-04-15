import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import DiagnosisStorage from './DiagnosisStorage.json';
import DiagnosisForm from './DiagnosisForm';
import DiagnosisList from './DiagnosisList';

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DiagnosisStorage.networks[networkId];

          const instance = new web3Instance.eth.Contract(
            DiagnosisStorage.abi,
            deployedNetwork && deployedNetwork.address
          );

          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setContract(instance);
        } catch (error) {
          console.error("Error connecting to web3:", error);
        }
      } else {
        alert("Please install MetaMask to use this application.");
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchDiagnoses();
    }
  }, [contract]);

  const fetchDiagnoses = async () => {
    if (!contract) return;
  
    try {
      const count = await contract.methods.getDiagnosisCount().call();
      const list = [];
  
      for (let i = 0; i < count; i++) {
        const d = await contract.methods.allDiagnoses(i).call();
        list.push({
          patientId: d.patientId,
          symptoms: d.symptoms,
          predictionLR: d.predictionLR,
          predictionNN: d.predictionNN,
          confidenceNN: d.confidenceNN,
          recordedBy: d.recordedBy,
        });
      }
  
      setDiagnoses(list);
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
    }
  };

  return (
    <div className="App">
      <h1>🩺 Doctor Diagnosis Portal</h1>
      <DiagnosisForm web3={web3} account={account} contract={contract} onDiagnosisSubmit={fetchDiagnoses} />
      <DiagnosisList diagnoses={diagnoses} />
    </div>
  );
}

export default App;
