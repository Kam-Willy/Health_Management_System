import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import './DiagnosisList.css';

function DiagnosisList({ diagnoses }) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Diagnosis Report', 14, 10);

    const tableColumn = ['Patient ID', 'Symptoms', 'LR Prediction', 'NN Prediction', 'Confidence NN', 'Doctor'];
    const tableRows = diagnoses.map(d => [
      d.patientId,
      d.symptoms?.join(', ') || '',
      d.predictionLR,
      d.predictionNN,
      (Number(d.confidenceNN) / 100).toFixed(2) + '%',
      d.recordedBy
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save('diagnosis_report.pdf');
  };

  const exportToCSV = () => {
    const csvData = diagnoses.map(d => ({
      patientId: d.patientId,
      symptoms: d.symptoms?.join(', ') || '',
      predictionLR: d.predictionLR,
      predictionNN: d.predictionNN,
      confidenceNN: (Number(d.confidenceNN) / 100).toFixed(2) + '%',
      doctor: d.recordedBy
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'diagnosis_report.csv');
  };

  return (
    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Stored Diagnoses</h2>
      <button onClick={exportToPDF} style={{ marginBottom: '10px' }}>📄 Export PDF</button>
      <button onClick={exportToCSV}>📁 Export CSV</button>

      {diagnoses.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%' }}>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Symptoms</th>
              <th>Logistic Regression</th>
              <th>Neural Network</th>
              <th>Confidence (NN)</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((d, idx) => (
              <tr key={idx}>
                <td>{d.patientId}</td>
                <td>{d.symptoms?.join(', ') || ''}</td>
                <td>{d.predictionLR}</td>
                <td>{d.predictionNN}</td>
                <td>{(Number(d.confidenceNN) / 100).toFixed(2)}%</td>
                <td>{d.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DiagnosisList;
