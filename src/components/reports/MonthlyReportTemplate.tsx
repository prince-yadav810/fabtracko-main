import React from 'react';
import { MonthlyReportData, formatCurrencyShort, formatPercentage, getStatusDisplayName } from '../../utils/reportUtils';

interface MonthlyReportTemplateProps {
  reportData: MonthlyReportData;
}

const MonthlyReportTemplate: React.FC<MonthlyReportTemplateProps> = ({ reportData }) => {
  const renderWorkerAvatar = (worker: any) => {
    if (worker.profilePicture) {
      return (
        <img
          src={worker.profilePicture}
          alt={worker.name}
          className="print-worker-avatar"
        />
      );
    } else {
      return (
        <div className="print-worker-avatar-placeholder">
          {worker.name.charAt(0)}
        </div>
      );
    }
  };

  const getCurrencyClass = (amount: number) => {
    return amount >= 0 ? 'print-currency positive' : 'print-currency negative';
  };

  return (
    <div className="print-container">
      {/* Header */}
      <div className="print-header print-no-break" style={{
        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
        borderBottom: '2pt solid rgba(251, 146, 60, 0.2)'
      }}>
        <h1 style={{ color: '#ea580c' }}>Vikas Fabrication Works</h1>
        <h2 style={{ color: '#dc2626' }}>Monthly Attendance & Wages Report - {reportData.month}</h2>
        <p style={{ margin: '10px 0 0 0', fontSize: '11pt', color: '#888' }}>
          Generated on {reportData.reportGeneratedAt}
        </p>
      </div>

      {/* Summary Section */}
      <div className="print-summary print-no-break">
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.08) 100%)',
          border: '1pt solid rgba(59, 130, 246, 0.2)'
        }}>
          <h3 style={{ color: '#1d4ed8' }}>Total Workers</h3>
          <div className="value" style={{ color: '#1e40af' }}>{reportData.totalWorkers}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1pt solid rgba(16, 185, 129, 0.2)'
        }}>
          <h3 style={{ color: '#047857' }}>Working Days</h3>
          <div className="value" style={{ color: '#059669' }}>{Math.round(reportData.totalWorkingDays)}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)',
          border: '1pt solid rgba(239, 68, 68, 0.2)'
        }}>
          <h3 style={{ color: '#b91c1c' }}>Total Advances</h3>
          <div className="value" style={{ color: '#dc2626' }}>{formatCurrencyShort(reportData.totalAdvances)}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)',
          border: '1pt solid rgba(16, 185, 129, 0.2)'
        }}>
          <h3 style={{ color: '#15803d' }}>Net Wages</h3>
          <div className={`value ${getCurrencyClass(reportData.totalNetWages)}`} style={{ 
            color: reportData.totalNetWages >= 0 ? '#059669' : '#dc2626' 
          }}>
            {formatCurrencyShort(reportData.totalNetWages)}
          </div>
        </div>
      </div>

      {/* Additional Summary Info */}
      <div className="print-no-break" style={{ marginBottom: '25px' }}>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Gross Wages (Before Advance)</td>
              <td className="print-currency positive">{formatCurrencyShort(reportData.totalGrossWages)}</td>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Overall Attendance</td>
              <td>{formatPercentage(reportData.overallAttendancePercentage)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Worker Details Table */}
      <div className="print-section-header" style={{ 
        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
        color: '#ea580c',
        borderBottom: '2pt solid rgba(251, 146, 60, 0.2)'
      }}>Worker Details</div>
      
      {reportData.workerSummaries.length > 0 ? (
        <table className="print-table" style={{ 
          border: '1pt solid rgba(251, 146, 60, 0.2)',
          borderRadius: '8pt',
          overflow: 'hidden' 
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)' }}>
              <th style={{ width: '25%', color: '#ea580c' }}>Worker</th>
              <th style={{ width: '8%', color: '#ea580c' }}>Present</th>
              <th style={{ width: '8%', color: '#ea580c' }}>Absent</th>
              <th style={{ width: '8%', color: '#ea580c' }}>Half Days</th>
              <th style={{ width: '10%', color: '#ea580c' }}>Attendance %</th>
              <th style={{ width: '12%', color: '#ea580c' }}>Gross Wages</th>
              <th style={{ width: '12%', color: '#ea580c' }}>Advance</th>
              <th style={{ width: '12%', color: '#ea580c' }}>Net Wages</th>
            </tr>
          </thead>
          <tbody>
            {reportData.workerSummaries.map((summary, index) => (
              <tr key={summary.worker.id} className="print-no-break">
                <td>
                  <div className="print-worker-profile">
                    {renderWorkerAvatar(summary.worker)}
                    <div className="print-worker-details">
                      <h4>{summary.worker.name}</h4>
                      <p>₹{summary.worker.dailyWage}/day</p>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#155724' }}>
                  {summary.presentDays}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#721c24' }}>
                  {summary.absentDays}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#856404' }}>
                  {summary.halfDays}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {formatPercentage(summary.attendancePercentage)}
                </td>
                <td className="print-currency positive">
                  {formatCurrencyShort(summary.grossWages)}
                </td>
                <td className="print-currency" style={{ color: '#721c24' }}>
                  {formatCurrencyShort(summary.totalAdvance)}
                </td>
                <td className={getCurrencyClass(summary.netWages)} style={{ fontWeight: 'bold' }}>
                  {formatCurrencyShort(summary.netWages)}
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Totals Row */}
          <tfoot>
            <tr style={{ borderTop: '2pt solid #333', fontWeight: 'bold', background: '#f9f9f9' }}>
              <td style={{ fontWeight: 'bold' }}>TOTALS</td>
              <td style={{ textAlign: 'center', color: '#155724' }}>
                {reportData.workerSummaries.reduce((sum, s) => sum + s.presentDays, 0)}
              </td>
              <td style={{ textAlign: 'center', color: '#721c24' }}>
                {reportData.workerSummaries.reduce((sum, s) => sum + s.absentDays, 0)}
              </td>
              <td style={{ textAlign: 'center', color: '#856404' }}>
                {reportData.workerSummaries.reduce((sum, s) => sum + s.halfDays, 0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                {formatPercentage(reportData.overallAttendancePercentage)}
              </td>
              <td className="print-currency positive">
                {formatCurrencyShort(reportData.totalGrossWages)}
              </td>
              <td className="print-currency" style={{ color: '#721c24' }}>
                {formatCurrencyShort(reportData.totalAdvances)}
              </td>
              <td className={getCurrencyClass(reportData.totalNetWages)} style={{ fontWeight: 'bold' }}>
                {formatCurrencyShort(reportData.totalNetWages)}
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No worker data available for {reportData.month}</p>
        </div>
      )}

      {/* Summary Analysis */}
      {reportData.workerSummaries.length > 0 && (
        <>
          <div className="print-page-break"></div>
          <div className="print-section-header">Monthly Analysis</div>
          
          <div className="print-no-break" style={{ marginBottom: '25px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '12pt' }}>Top Performing Workers (by Attendance)</h4>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Worker Name</th>
                  <th>Attendance %</th>
                  <th>Days Present</th>
                  <th>Net Wages</th>
                </tr>
              </thead>
              <tbody>
                {reportData.workerSummaries
                  .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
                  .slice(0, Math.min(5, reportData.workerSummaries.length))
                  .map((summary, index) => (
                    <tr key={summary.worker.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>#{index + 1}</td>
                      <td>{summary.worker.name}</td>
                      <td style={{ fontWeight: 'bold', color: summary.attendancePercentage >= 90 ? '#155724' : '#856404' }}>
                        {formatPercentage(summary.attendancePercentage)}
                      </td>
                      <td style={{ textAlign: 'center' }}>{summary.presentDays + summary.halfDays}</td>
                      <td className={getCurrencyClass(summary.netWages)}>
                        {formatCurrencyShort(summary.netWages)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          <div className="print-no-break">
            <h4 style={{ margin: '0 0 15px 0', fontSize: '12pt' }}>Payment Summary</h4>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Advance Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.workerSummaries
                  .filter(summary => summary.totalAdvance > 0)
                  .sort((a, b) => b.totalAdvance - a.totalAdvance)
                  .map((summary) => (
                    <tr key={summary.worker.id}>
                      <td>{summary.worker.name}</td>
                      <td className="print-currency" style={{ color: '#721c24', fontWeight: 'bold' }}>
                        {formatCurrencyShort(summary.totalAdvance)}
                      </td>
                      <td>
                        <span style={{ 
                          color: summary.netWages >= 0 ? '#155724' : '#721c24',
                          fontWeight: 'bold'
                        }}>
                          {summary.netWages >= 0 ? 'To Receive' : 'Excess Advance'}
                        </span>
                      </td>
                    </tr>
                  ))
                }
                {reportData.workerSummaries.filter(s => s.totalAdvance > 0).length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      No advance payments recorded for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="print-footer no-print">
        <p>
          This report was generated automatically by the Vikas Fabrication Works Management System.
          <br />
          For any discrepancies, please contact the administration.
        </p>
      </div>

      {/* Calculation Notes */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd' }} className="print-no-break">
        <h4 style={{ margin: '0 0 10px 0', fontSize: '11pt' }}>Calculation Notes:</h4>
        <ul style={{ margin: '0', padding: '0 0 0 20px', fontSize: '10pt', lineHeight: '1.6' }}>
          <li><strong>Working Days:</strong> Present days + (Half days × 0.5)</li>
          <li><strong>Gross Wages:</strong> Working days × Daily wage rate</li>
          <li><strong>Net Wages:</strong> Gross wages - Advance payments</li>
          <li><strong>Attendance %:</strong> (Present + Half days) ÷ Total days in month × 100</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthlyReportTemplate;