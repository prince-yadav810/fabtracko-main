import React from 'react';
import { WorkerMonthlySummary, formatCurrencyShort, formatPercentage, getStatusDisplayName } from '../../utils/reportUtils';
import { format } from 'date-fns';

interface WorkerReportTemplateProps {
  workerSummary: WorkerMonthlySummary;
  month: string;
  reportGeneratedAt: string;
  monthlyPayments: any[]; // Add this to get payment data
}

const WorkerReportTemplate: React.FC<WorkerReportTemplateProps> = ({ 
  workerSummary, 
  month, 
  reportGeneratedAt,
  monthlyPayments = [] // Default to empty array
}) => {
  const { worker, dailyAttendance } = workerSummary;

  const renderWorkerAvatar = () => {
    if (worker.profilePicture) {
      return (
        <img
          src={worker.profilePicture}
          alt={worker.name}
          className="print-worker-avatar"
          style={{ width: '80px', height: '80px' }}
        />
      );
    } else {
      return (
        <div 
          className="print-worker-avatar-placeholder"
          style={{ 
            width: '80px', 
            height: '80px', 
            fontSize: '32px',
            border: '2px solid #ddd'
          }}
        >
          {worker.name.charAt(0)}
        </div>
      );
    }
  };

  const getCurrencyClass = (amount: number) => {
    return amount >= 0 ? 'print-currency positive' : 'print-currency negative';
  };

  // Helper function to get advance payment for a specific date
  const getAdvanceForDate = (date: string) => {
    const payment = monthlyPayments.find(p => p.date === date && p.type === 'advance');
    return payment ? payment.amount : 0;
  };

  return (
    <div className="print-container">
      {/* Header */}
      <div className="print-header print-no-break" style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        borderBottom: '2pt solid rgba(99, 102, 241, 0.2)'
      }}>
        <h1 style={{ color: '#4f46e5' }}>Vikas Fabrication Works</h1>
        <h2 style={{ color: '#7c3aed' }}>Individual Worker Report - {month}</h2>
        <p style={{ margin: '10px 0 0 0', fontSize: '11pt', color: '#888' }}>
          Generated on {reportGeneratedAt}
        </p>
      </div>

      {/* Worker Profile Header */}
      <div className="print-worker-header print-no-break" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)',
        border: '1pt solid rgba(59, 130, 246, 0.1)',
        borderRadius: '8pt'
      }}>
        {renderWorkerAvatar()}
        <div className="print-worker-info">
          <h3 style={{ color: '#1e40af' }}>{worker.name}</h3>
          <p><strong>Daily Wage:</strong> {formatCurrencyShort(worker.dailyWage)} per day</p>
          <p><strong>Joining Date:</strong> {format(new Date(worker.joiningDate), 'dd MMM yyyy')}</p>
          <p><strong>Employee ID:</strong> {worker.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="print-summary print-no-break">
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1pt solid rgba(16, 185, 129, 0.2)'
        }}>
          <h3>Present Days</h3>
          <div className="value" style={{ color: '#059669' }}>{workerSummary.presentDays}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)',
          border: '1pt solid rgba(239, 68, 68, 0.2)'
        }}>
          <h3>Absent Days</h3>
          <div className="value" style={{ color: '#dc2626' }}>{workerSummary.absentDays}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.08) 100%)',
          border: '1pt solid rgba(245, 158, 11, 0.2)'
        }}>
          <h3>Half Days</h3>
          <div className="value" style={{ color: '#d97706' }}>{workerSummary.halfDays}</div>
        </div>
        <div className="print-summary-card" style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1pt solid rgba(99, 102, 241, 0.2)'
        }}>
          <h3>Attendance</h3>
          <div className="value" style={{ color: '#7c3aed' }}>{formatPercentage(workerSummary.attendancePercentage)}</div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="print-no-break" style={{ marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14pt', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
          Financial Summary
        </h3>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9', width: '40%' }}>Working Days</td>
              <td style={{ fontWeight: 'bold' }}>{workerSummary.totalWorkingDays} days</td>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Daily Rate</td>
              <td>{formatCurrencyShort(worker.dailyWage)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Gross Wages</td>
              <td className="print-currency positive" style={{ fontWeight: 'bold' }}>
                {formatCurrencyShort(workerSummary.grossWages)}
              </td>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Advance Taken</td>
              <td className="print-currency" style={{ color: '#721c24', fontWeight: 'bold' }}>
                {formatCurrencyShort(workerSummary.totalAdvance)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #333' }}>
              <td style={{ fontWeight: 'bold', background: '#f0f8ff', fontSize: '12pt' }}>NET WAGES</td>
              <td className={getCurrencyClass(workerSummary.netWages)} style={{ fontWeight: 'bold', fontSize: '14pt' }}>
                {formatCurrencyShort(workerSummary.netWages)}
              </td>
              <td style={{ fontWeight: 'bold', background: '#f0f8ff' }}>Status</td>
              <td style={{ 
                fontWeight: 'bold',
                color: workerSummary.netWages >= 0 ? '#155724' : '#721c24',
                fontSize: '12pt'
              }}>
                {workerSummary.netWages >= 0 ? 'TO RECEIVE' : 'EXCESS ADVANCE'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detailed Attendance List */}
      <div className="print-section-header" style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        color: '#4f46e5',
        borderBottom: '2pt solid rgba(99, 102, 241, 0.2)'
      }}>Detailed Daily Attendance & Payments</div>
      <div className="print-section-header" style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        color: '#4f46e5',
        borderBottom: '2pt solid rgba(99, 102, 241, 0.2)'
      }}>Detailed Daily Attendance & Payments</div>
      
      {dailyAttendance.length > 0 ? (
        <table className="print-table" style={{ 
          border: '1pt solid rgba(99, 102, 241, 0.2)',
          borderRadius: '8pt',
          overflow: 'hidden' 
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)' }}>
              <th style={{ width: '12%', color: '#4f46e5' }}>Date</th>
              <th style={{ width: '12%', color: '#4f46e5' }}>Day</th>
              <th style={{ width: '15%', color: '#4f46e5' }}>Status</th>
              <th style={{ width: '15%', color: '#4f46e5' }}>Wage Earned</th>
              <th style={{ width: '15%', color: '#4f46e5' }}>Advance Taken</th>
              <th style={{ width: '31%', color: '#4f46e5' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dailyAttendance
              .filter(day => day.status !== null)
              .map((day) => {
                const dayDate = new Date(day.date);
                const dayName = format(dayDate, 'EEEE');
                const wage = day.status === 'present' ? worker.dailyWage :
                            day.status === 'halfday' ? worker.dailyWage * 0.5 : 0;
                const advanceAmount = getAdvanceForDate(day.date);
                
                return (
                  <tr key={day.date} style={{ 
                    background: day.status === 'present' ? 'rgba(16, 185, 129, 0.02)' :
                               day.status === 'absent' ? 'rgba(239, 68, 68, 0.02)' :
                               'rgba(245, 158, 11, 0.02)'
                  }}>
                    <td style={{ fontWeight: 'bold', color: '#374151' }}>
                      {format(dayDate, 'dd MMM')}
                    </td>
                    <td style={{ color: '#6b7280' }}>{dayName}</td>
                    <td>
                      <span className={`print-status ${day.status}`} style={{
                        padding: '4px 8px',
                        borderRadius: '6pt',
                        fontSize: '10pt',
                        fontWeight: 'bold',
                        background: day.status === 'present' ? 'rgba(16, 185, 129, 0.1)' :
                                   day.status === 'absent' ? 'rgba(239, 68, 68, 0.1)' :
                                   'rgba(245, 158, 11, 0.1)',
                        color: day.status === 'present' ? '#059669' :
                               day.status === 'absent' ? '#dc2626' :
                               '#d97706',
                        border: `1pt solid ${day.status === 'present' ? 'rgba(16, 185, 129, 0.3)' :
                                day.status === 'absent' ? 'rgba(239, 68, 68, 0.3)' :
                                'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {getStatusDisplayName(day.status)}
                      </span>
                    </td>
                    <td className="print-currency positive" style={{ fontWeight: 'bold', color: '#059669' }}>
                      {formatCurrencyShort(wage)}
                    </td>
                    <td style={{ 
                      fontWeight: 'bold', 
                      color: advanceAmount > 0 ? '#dc2626' : '#6b7280' 
                    }}>
                      {advanceAmount > 0 ? formatCurrencyShort(advanceAmount) : '-'}
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '10pt' }}>
                      {day.status === 'halfday' ? 'Half day calculation applied' : 
                       day.status === 'absent' ? 'No wage for absent day' :
                       'Full day wage'}
                      {advanceAmount > 0 && ` • Advance payment taken`}
                    </td>
                  </tr>
                );
              })}
          </tbody>
          <tfoot>
            <tr style={{ 
              borderTop: '2px solid rgba(99, 102, 241, 0.3)', 
              fontWeight: 'bold', 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)' 
            }}>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', color: '#4f46e5' }}>TOTALS:</td>
              <td className="print-currency positive" style={{ fontWeight: 'bold', fontSize: '12pt', color: '#059669' }}>
                {formatCurrencyShort(workerSummary.grossWages)}
              </td>
              <td style={{ fontWeight: 'bold', fontSize: '12pt', color: '#dc2626' }}>
                {formatCurrencyShort(workerSummary.totalAdvance)}
              </td>
              <td style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                Net: {formatCurrencyShort(workerSummary.netWages)}
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No attendance recorded for this month</p>
        </div>
      )}

      {/* Performance Analysis */}
      <div className="print-no-break" style={{ marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14pt', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
          Performance Analysis
        </h3>
        <table className="print-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Attendance Rate</td>
              <td style={{ 
                fontWeight: 'bold',
                color: workerSummary.attendancePercentage >= 90 ? '#155724' :
                       workerSummary.attendancePercentage >= 75 ? '#856404' : '#721c24'
              }}>
                {formatPercentage(workerSummary.attendancePercentage)}
                {workerSummary.attendancePercentage >= 90 ? ' (Excellent)' :
                 workerSummary.attendancePercentage >= 75 ? ' (Good)' : ' (Needs Improvement)'}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Total Days Worked</td>
              <td style={{ fontWeight: 'bold' }}>
                {workerSummary.totalWorkingDays} out of {dailyAttendance.length} days
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', background: '#f9f9f9' }}>Average Daily Earning</td>
              <td className="print-currency positive" style={{ fontWeight: 'bold' }}>
                {formatCurrencyShort(dailyAttendance.length > 0 ? workerSummary.grossWages / dailyAttendance.length : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd' }} className="print-no-break">
        <h4 style={{ margin: '0 0 10px 0', fontSize: '11pt' }}>Important Notes:</h4>
        <ul style={{ margin: '0', padding: '0 0 0 20px', fontSize: '10pt', lineHeight: '1.6' }}>
          <li>Half days are calculated as 0.5 working days for wage calculation</li>
          <li>Advance payments are deducted from gross wages to calculate net wages</li>
          <li>This report is generated automatically and reflects data up to {reportGeneratedAt}</li>
          <li>For any discrepancies, please contact the administration immediately</li>
        </ul>
      </div>

      <div className="print-footer no-print">
        <p>
          This is an official document from Vikas Fabrication Works Management System.
          <br />
          Report generated on {reportGeneratedAt}
        </p>
      </div>
    </div>
  );
};

export default WorkerReportTemplate;