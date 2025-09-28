import { useState } from 'react';

function checkBalance(amount, currentBalance) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error("Balance check failed - Service temporarily unavailable"));
        return;
      }
      
      if (currentBalance < amount) {
        reject(new Error("Insufficient funds"));
        return;
      }
      
      resolve(`Balance verified: $${currentBalance.toFixed(2)}`);
    }, 1500);
  });
}

function deductAmount(amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(new Error("Deduction failed - Database error"));
        return;
      }
      
      resolve(`Amount deducted: $${amount.toFixed(2)}`);
    }, 1500);
  });
}

function confirmTransaction() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error("Transaction confirmation failed - Network timeout"));
        return;
      }
      
      resolve("Transaction complete");
    }, 1500);
  });
}

export default function BankSimulator() {
  const [currentBalance, setCurrentBalance] = useState(1000);
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '', visible: false });
  
  const [steps, setSteps] = useState([
    { id: 1, text: 'Check Balance', status: 'pending' },
    { id: 2, text: 'Deduct Amount', status: 'pending' },
    { id: 3, text: 'Confirm Transaction', status: 'pending' }
  ]);

  const updateStepStatus = (stepNumber, status) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepNumber ? { ...step, status } : step
      )
    );
  };

  const updateStatus = (message, type, visible = true) => {
    setStatus({ message, type, visible });
  };

  const resetSteps = () => {
    setSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
  };

  const startTransfer = async () => {
    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      updateStatus('Please enter a valid amount', 'error');
      return;
    }

    if (transferAmount > 1000) {
      updateStatus('Amount cannot exceed $1000', 'error');
      return;
    }

    if (transferAmount > currentBalance) {
      updateStatus('Amount exceeds current balance', 'error');
      return;
    }

    setIsTransferring(true);
    resetSteps();
    setStatus({ message: '', type: '', visible: false });
    let tempBalance = currentBalance;

    try {
      updateStepStatus(1, 'processing');
      updateStatus('Checking balance...', 'processing');
      
      await checkBalance(transferAmount, currentBalance);
      updateStepStatus(1, 'completed');

      updateStepStatus(2, 'processing');
      updateStatus('Deducting amount...', 'processing');
      
      await deductAmount(transferAmount);
      updateStepStatus(2, 'completed');
      
      tempBalance = currentBalance - transferAmount;
      setCurrentBalance(tempBalance);

      updateStepStatus(3, 'processing');
      updateStatus('Confirming transaction...', 'processing');
      
      await confirmTransaction();
      updateStepStatus(3, 'completed');
      
      updateStatus('Transaction completed successfully!', 'success');
      setAmount('');

    } catch (error) {
      const currentSteps = steps;
      
      if (currentSteps.find(s => s.id === 1)?.status === 'processing') {
        updateStepStatus(1, 'failed');
      } else if (currentSteps.find(s => s.id === 2)?.status === 'processing') {
        updateStepStatus(2, 'failed');
        // Rollback balance if deduction failed
        setCurrentBalance(currentBalance);
      } else if (currentSteps.find(s => s.id === 3)?.status === 'processing') {
        updateStepStatus(3, 'failed');
        // Rollback balance if confirmation failed
        setCurrentBalance(currentBalance);
      }

      updateStatus(`Transaction failed: ${error.message}`, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isTransferring) {
      startTransfer();
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#333',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2rem'
        }}>
          🏦 Bank Transaction Simulator
        </h1>
        
        {/* Account Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div>Account Balance</div>
          <div style={{
            fontSize: '1.5rem',
            color: '#28a745',
            fontWeight: 'bold',
            margin: '10px 0'
          }}>
            ${currentBalance.toFixed(2)}
          </div>
        </div>

        {/* Input Group */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontWeight: '500'
          }}>
            Transfer Amount ($)
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            step="0.01"
            placeholder="Enter amount to transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
          />
        </div>

        {/* Transfer Button */}
        <button
          onClick={startTransfer}
          disabled={isTransferring}
          style={{
            width: '100%',
            padding: '15px',
            background: isTransferring 
              ? '#6c757d' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isTransferring ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            opacity: isTransferring ? 0.6 : 1
          }}
        >
          {isTransferring ? 'Processing...' : 'Start Transfer'}
        </button>

        {/* Status Message */}
        {status.visible && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontWeight: '500',
            backgroundColor: status.type === 'success' ? '#d4edda' :
                           status.type === 'error' ? '#f8d7da' : '#fff3cd',
            color: status.type === 'success' ? '#155724' :
                   status.type === 'error' ? '#721c24' : '#856404',
            border: `1px solid ${
              status.type === 'success' ? '#c3e6cb' :
              status.type === 'error' ? '#f5c6cb' : '#ffeaa7'
            }`
          }}>
            {status.message}
          </div>
        )}

        {/* Transaction Steps */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            Transaction Steps
          </h3>
          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: 
                  step.status === 'completed' ? '#d4edda' :
                  step.status === 'failed' ? '#f8d7da' :
                  step.status === 'processing' ? '#fff3cd' : '#e9ecef',
                color:
                  step.status === 'completed' ? '#155724' :
                  step.status === 'failed' ? '#721c24' :
                  step.status === 'processing' ? '#856404' : '#6c757d',
                animation: step.status === 'processing' ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor:
                  step.status === 'completed' ? '#28a745' :
                  step.status === 'failed' ? '#dc3545' :
                  step.status === 'processing' ? '#ffc107' : '#6c757d',
                color: 'white'
              }}>
                {step.status === 'completed' ? '✓' :
                 step.status === 'failed' ? '✗' : step.id}
              </div>
              <div>{step.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        input:focus {
          border-color: #667eea !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
