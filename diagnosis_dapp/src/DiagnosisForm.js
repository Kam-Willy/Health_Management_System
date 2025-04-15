import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { CONTRACT_ADDRESS } from './config';
import DiagnosisStorageABI from './DiagnosisStorage.json';
import './DiagnosisForm.css';

const DiagnosisForm = () => {
  const [form, setForm] = useState({
    doctorName: '',
    patientName: '',
    patientId: '',
    patientAddress: '',
    symptoms: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('⏳ Checking...');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        const contractInstance = new web3Instance.eth.Contract(
          DiagnosisStorageABI.abi,
          CONTRACT_ADDRESS
        );

        const admin = await contractInstance.methods.admin().call();
        const isAuthorized = await contractInstance.methods.authorizedDoctors(accounts[0]).call();

        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);

        if (accounts[0].toLowerCase() === admin.toLowerCase()) {
          setRole('👑 Admin');
        } else if (isAuthorized) {
          setRole('✅ Authorized Doctor');
        } else {
          setRole('❌ Not Authorized');
        }
      } else {
        alert('Please install MetaMask to use this app.');
      }
    };

    init();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleDiagnosis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setResult(null);

    try {
      const symptomsList = form.symptoms.split(',').map((s) => s.trim());

      const res = await axios.post('http://127.0.0.1:5000/predict', {
        doctorName: form.doctorName,
        patientName: form.patientName,
        patientId: form.patientId,
        symptoms: symptomsList
      });

      const {
        predictionLR,
        predictionNN,
        confidenceNN,
        diseaseLR,
        diseaseNN,
        timestamp
      } = res.data;

      const isAuthorized = await contract.methods.authorizedDoctors(account).call();

      if (!isAuthorized && role !== '👑 Admin') {
        setMessage('❌ You are not an authorized doctor. Please ask the admin to authorize your address.');
        setLoading(false);
        return;
      }

      await contract.methods
        .recordDiagnosis(
          parseInt(form.patientId),
          symptomsList,
          predictionLR.toString(),
          predictionNN.toString(),
          Math.round(confidenceNN),
          form.patientAddress
        )
        .send({ from: account });

      const diagnosis = {
        doctor: form.doctorName,
        patient: form.patientName,
        patientId: form.patientId,
        patientAddress: form.patientAddress,
        symptoms: symptomsList,
        predictionLR,
        predictionNN,
        confidenceNN,
        diseaseLR,
        diseaseNN,
        timestamp
      };

      setResult(diagnosis);
      setMessage('✅ Diagnosis recorded on blockchain!');
      setShowTable(true);
    } catch (err) {
      console.error('Smart contract error:', err);
      if (err && err.message) {
        if (err.message.includes('Not an authorized doctor')) {
          setMessage('❌ You are not authorized. Please ask admin to authorize you.');
        } else if (err.message.includes('Diagnosis already exists')) {
          setMessage('⚠️ Diagnosis already exists for this patient ID.');
        } else {
          setMessage('❌ Unexpected error: ' + err.message);
        }
      } else {
        setMessage('❌ Unknown error occurred');
      }
    }

    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.text('Diagnosis Report', 14, 10);

    const tableColumn = [
      'Doctor', 'Patient', 'Patient ID', 'Symptoms',
      'LR Prediction', 'LR Disease',
      'NN Prediction', 'NN Disease',
      'Confidence (%)', 'Timestamp'
    ];

    const tableRows = [[
      result.doctor,
      result.patient,
      result.patientId,
      result.symptoms.join(', '),
      result.predictionLR,
      result.diseaseLR || 'N/A',
      result.predictionNN,
      result.diseaseNN || 'N/A',
      result.confidenceNN.toFixed(2),
      new Date(result.timestamp).toLocaleString()
    ]];

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save(`diagnosis_${result.patientId}.pdf`);
  };

  const handleExportCSV = () => {
    if (!result) return;

    const csvData = [{
      ...result,
      timestamp: new Date(result.timestamp).toLocaleString()
    }];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `diagnosis_${result.patientId}.csv`);
  };

  return (
    <div>
      <h2>🩺 Submit Diagnosis</h2>

      <div className="user-status">
        <p><strong>Connected Account:</strong> {account}</p>
        <p><strong>Role:</strong> {role}</p>
      </div>

      <form onSubmit={handleDiagnosis}>
        <input type="text" name="doctorName" placeholder="Doctor Name" value={form.doctorName} onChange={handleChange} required />
        <input type="text" name="patientName" placeholder="Patient Name" value={form.patientName} onChange={handleChange} required />
        <input type="number" name="patientId" placeholder="Patient ID" value={form.patientId} onChange={handleChange} required />
        <input type="text" name="patientAddress" placeholder="Patient Wallet Address" value={form.patientAddress} onChange={handleChange} required />
        <input type="text" name="symptoms" placeholder="Symptoms (comma-separated)" value={form.symptoms} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Diagnose'}</button>
      </form>

      {message && <p>{message}</p>}

      {result && (
        <div className="result-section">
          <div className="export-buttons">
            <h3>Export Diagnosis</h3>
            <button onClick={handleExportPDF}>📄 Export PDF</button>
            <button onClick={handleExportCSV}>📁 Export CSV</button>
          </div>

          <div className="toggle-button-container">
            <button onClick={() => setShowTable(!showTable)}>
              {showTable ? 'Hide Diagnosis Result' : 'Show Diagnosis Result'}
            </button>
          </div>

          {showTable && (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Symptoms</th>
                  <th>LR Prediction</th>
                  <th>LR Disease</th>
                  <th>NN Prediction</th>
                  <th>NN Disease</th>
                  <th>Confidence (%)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.doctor}</td>
                  <td>{result.patient}</td>
                  <td>{result.patientId}</td>
                  <td>{result.symptoms.join(', ')}</td>
                  <td>{result.predictionLR}</td>
                  <td>{result.diseaseLR || 'N/A'}</td>
                  <td>{result.predictionNN}</td>
                  <td>{result.diseaseNN || 'N/A'}</td>
                  <td>{result.confidenceNN.toFixed(2)}</td>
                  <td>{new Date(result.timestamp).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosisForm;
