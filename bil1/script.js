// Personal Finance App JavaScript

// Global variables
let currentTransactionType = '';
let currentTransactionCategory = '';
let currentPeriod = 'month';
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let transactions = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    initializeDateSelectors();
    updateSummary();
    displayTransactions();
    setCurrentDate();
    
    // Period selector event listeners - removed old ones
});

// Initialize date selectors
function initializeDateSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    // Populate years (current year ± 5 years)
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + 543; // Thai Buddhist year
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    // Set current month
    document.getElementById('monthSelect').value = selectedMonth;
    
    // Add event listeners
    document.getElementById('monthSelect').addEventListener('change', function() {
        selectedMonth = parseInt(this.value);
        updateSummary();
        displayTransactions();
    });
    
    document.getElementById('yearSelect').addEventListener('change', function() {
        selectedYear = parseInt(this.value);
        updateSummary();
        displayTransactions();
    });
}

// Show period selector
function showPeriodSelector(period) {
    // Update active button
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        }
    });
    
    currentPeriod = period;
    const dateSelector = document.getElementById('dateSelector');
    const monthSelect = document.getElementById('monthSelect');
    
    if (period === 'month') {
        dateSelector.style.display = 'flex';
        monthSelect.style.display = 'block';
    } else if (period === 'year') {
        dateSelector.style.display = 'flex';
        monthSelect.style.display = 'none';
    }
    
    updateSummary();
    displayTransactions();
}

// Set current date in date input
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Load transactions from localStorage
function loadTransactions() {
    const saved = localStorage.getItem('personalFinanceTransactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('personalFinanceTransactions', JSON.stringify(transactions));
}

// Show income menu
function showIncomeMenu() {
    document.getElementById('incomeModal').style.display = 'block';
}

// Show expense menu
function showExpenseMenu() {
    document.getElementById('expenseModal').style.display = 'block';
}

// Show credit card submenu
function showCreditCardMenu() {
    closeModal('expenseModal');
    document.getElementById('creditCardModal').style.display = 'block';
}

// Show Shopee submenu
function showShopeeMenu() {
    closeModal('expenseModal');
    document.getElementById('shopeeModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add transaction
function addTransaction(type, category, categoryId) {
    currentTransactionType = type;
    currentTransactionCategory = category;
    
    // Close all modals
    closeModal('incomeModal');
    closeModal('expenseModal');
    closeModal('creditCardModal');
    closeModal('shopeeModal');
    
    // Set up transaction modal
    document.getElementById('transactionTitle').textContent = 
        type === 'income' ? 'เพิ่มรายรับ' : 'เพิ่มรายจ่าย';
    document.getElementById('transactionType').textContent = category;
    
    // Clear form
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    setCurrentDate();
    
    // Show transaction modal
    document.getElementById('transactionModal').style.display = 'block';
    
    // Focus on amount input
    setTimeout(() => {
        document.getElementById('amount').focus();
    }, 100);
}

// Save transaction
function saveTransaction() {
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    if (!amount || amount <= 0) {
        alert('กรุณาใส่จำนวนเงินที่ถูกต้อง');
        return;
    }
    
    if (!date) {
        alert('กรุณาเลือกวันที่');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: currentTransactionType,
        category: currentTransactionCategory,
        amount: amount,
        description: description,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    transactions.unshift(transaction); // Add to beginning of array
    saveTransactions();
    updateSummary();
    displayTransactions();
    closeModal('transactionModal');
    
    // Show success message
    showNotification(`บันทึก${currentTransactionType === 'income' ? 'รายรับ' : 'รายจ่าย'}เรียบร้อยแล้ว`);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4ade80, #22c55e);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update summary
function updateSummary() {
    const filteredTransactions = getFilteredTransactions();
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
    document.getElementById('balance').textContent = formatCurrency(balance);
    
    // Update balance color
    const balanceElement = document.getElementById('balance');
    if (balance > 0) {
        balanceElement.style.color = '#4ade80';
    } else if (balance < 0) {
        balanceElement.style.color = '#ef4444';
    } else {
        balanceElement.style.color = '#3b82f6';
    }
}

// Get filtered transactions based on current period
function getFilteredTransactions() {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        if (currentPeriod === 'month') {
            return transactionDate.getFullYear() === selectedYear && 
                   transactionDate.getMonth() === selectedMonth;
        } else if (currentPeriod === 'year') {
            return transactionDate.getFullYear() === selectedYear;
        }
        
        return true;
    });
}

// Display transactions
function displayTransactions() {
    const filteredTransactions = getFilteredTransactions();
    const transactionList = document.getElementById('transactionList');
    
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>ยังไม่มีรายการในช่วงเวลานี้</p>
            </div>
        `;
        return;
    }
    
    transactionList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-type">${transaction.category}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
                ${transaction.description ? `<div style="font-size: 12px; color: #9ca3af; margin-top: 2px;">${transaction.description}</div>` : ''}
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

// Show income total
function showIncomeTotal() {
    const filteredTransactions = getFilteredTransactions();
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    closeModal('incomeModal');
    
    alert(`รวมรายรับ${currentPeriod === 'month' ? 'ประจำเดือน' : 'ประจำปี'}: ${formatCurrency(total)} บาท\n\nจำนวนรายการ: ${incomeTransactions.length} รายการ`);
}

// Show expense total
function showExpenseTotal() {
    const filteredTransactions = getFilteredTransactions();
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    closeModal('expenseModal');
    
    alert(`รวมรายจ่าย${currentPeriod === 'month' ? 'ประจำเดือน' : 'ประจำปี'}: ${formatCurrency(total)} บาท\n\nจำนวนรายการ: ${expenseTransactions.length} รายการ`);
}

// Clear all data
function clearAllData() {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมดหรือไม่?\n\n⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
        transactions = [];
        saveTransactions();
        updateSummary();
        displayTransactions();
        showNotification('ล้างข้อมูลเรียบร้อยแล้ว');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = ['incomeModal', 'expenseModal', 'creditCardModal', 'shopeeModal', 'transactionModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
}

// Handle Enter key in transaction form
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const transactionModal = document.getElementById('transactionModal');
        if (transactionModal.style.display === 'block') {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT') {
                if (activeElement.id === 'amount') {
                    document.getElementById('description').focus();
                } else if (activeElement.id === 'description') {
                    document.getElementById('date').focus();
                } else if (activeElement.id === 'date') {
                    saveTransaction();
                }
            }
        }
    }
    
    // Close modals with Escape key
    if (event.key === 'Escape') {
        const modals = ['incomeModal', 'expenseModal', 'creditCardModal', 'shopeeModal', 'transactionModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal.style.display === 'block') {
                closeModal(modalId);
            }
        });
    }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

