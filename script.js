// XP rewards per tier (single kill) - Only T3 and T4 for Voidgloom Seraph
const xpPerKill = {
    voidgloom: [100, 500] // T3 = 100 XP, T4 = 500 XP (indexes 0, 1)
};

// XP needed to reach each level (not cumulative)
const xpToReachLevel = [
    0,        // Level 0: 0 XP
    5,        // Level 1: 5 XP
    15,       // Level 2: 15 XP
    200,      // Level 3: 200 XP
    1000,     // Level 4: 1000 XP
    5000,     // Level 5: 5000 XP
    20000,    // Level 6: 20000 XP
    100000,   // Level 7: 100000 XP
    400000,   // Level 8: 400000 XP
    1000000   // Level 9: 1000000 XP
];

// Carry prices in coins
const CARRY_PRICE_T3 = 800000;
const CARRY_PRICE_T4 = 1500000;

const quotes = [
    "Lightning fast carries, zero hassle! ⚡",
    "Professional carriers, premium service! 🎯",
    "Get your runs done reliably! 💪",
    "Expert team, best prices! 🏆",
    "Trusted by the Skyblock community! 🤝"
];

let currentQuote = 0;

// Quote rotation
function rotateQuote() {
    const quoteEl = document.getElementById('quote');
    currentQuote = (currentQuote + 1) % quotes.length;
    
    quoteEl.style.animation = 'none';
    void quoteEl.offsetWidth;
    quoteEl.textContent = quotes[currentQuote];
    quoteEl.style.animation = 'quoteSlideIn 0.6s ease-out, quoteSlideOut 0.6s ease-out 4.4s forwards';
}

setInterval(rotateQuote, 5000);

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

// Calculator functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
}

function getXpNeeded(currentLevel, targetLevel) {
    // Validate inputs
    if (currentLevel < 0 || currentLevel > 9 || targetLevel < 0 || targetLevel > 9) {
        return null;
    }
    if (currentLevel >= targetLevel) {
        return null;
    }
    
    // Calculate the difference in XP needed
    const currentXp = currentLevel === 0 ? 0 : xpToReachLevel[currentLevel];
    const targetXp = xpToReachLevel[targetLevel];
    
    return targetXp - currentXp;
}

function calculateCarries(slayerType, xpNeeded) {
    if (!xpPerKill[slayerType]) {
        return null;
    }
    
    const xpRewards = xpPerKill[slayerType];
    const carries = [];
    let remainingXp = xpNeeded;
    
    // Start from highest tier (T4) and work down to T3
    for (let tierIndex = xpRewards.length - 1; tierIndex >= 0 && remainingXp > 0; tierIndex--) {
        const xpPerRun = xpRewards[tierIndex];
        const numRuns = Math.floor(remainingXp / xpPerRun);
        
        if (numRuns > 0) {
            carries.push({
                tier: tierIndex + 3, // T3, T4 (indexes 0,1 -> tiers 3,4)
                count: numRuns,
                xpGained: numRuns * xpPerRun
            });
            remainingXp -= numRuns * xpPerRun;
        }
    }
    
    // Handle any remaining XP by adding to the lowest tier (T3) if needed
    if (remainingXp > 0) {
        // Check if we already have T3 runs
        const existingT3 = carries.find(carry => carry.tier === 3);
        
        if (existingT3) {
            // Add one more T3 run to the existing entry
            existingT3.count += 1;
            existingT3.xpGained += xpRewards[0]; // Add T3 XP
        } else {
            // Create a new T3 entry
            carries.push({
                tier: 3,
                count: 1,
                xpGained: xpRewards[0] // T3 XP
            });
        }
    }
    
    return carries;
}

function calculateTotalCost(carries) {
    let totalCost = 0;
    
    for (let carry of carries) {
        let pricePerRun;
        if (carry.tier === 3) {
            pricePerRun = CARRY_PRICE_T3;
        } else if (carry.tier === 4) {
            pricePerRun = CARRY_PRICE_T4;
        }
        totalCost += carry.count * pricePerRun;
    }
    
    return totalCost;
}

function calculateCheapest() {
    const currentLevel = parseInt(document.getElementById('current-level').value);
    const targetLevel = parseInt(document.getElementById('target-level').value);
    const resultsDiv = document.getElementById('calc-results');
    
    // Validate levels
    if (currentLevel >= targetLevel) {
        document.getElementById('xp-needed').textContent = 'Error: Target level must be higher than current level!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate XP needed
    const xpNeeded = getXpNeeded(currentLevel, targetLevel);
    
    if (xpNeeded === null || xpNeeded <= 0) {
        document.getElementById('xp-needed').textContent = 'Error: Invalid level range!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate optimal carries
    const carries = calculateCarries('voidgloom', xpNeeded);
    
    if (!carries || carries.length === 0) {
        document.getElementById('xp-needed').textContent = 'Error: Could not calculate carries!';
        document.getElementById('cost-info').textContent = '';
        document.getElementById('carry-breakdown').textContent = '';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Calculate total cost
    const totalCost = calculateTotalCost(carries);
    
    // Build breakdown string
    let breakdownStr = '';
    for (let i = 0; i < carries.length; i++) {
        const carry = carries[i];
        let price;
        if (carry.tier === 3) price = CARRY_PRICE_T3;
        else if (carry.tier === 4) price = CARRY_PRICE_T4;
        
        const subtotal = carry.count * price;
        
        if (i > 0) breakdownStr += ' + ';
        breakdownStr += `T${carry.tier}: ${carry.count}x (${formatNumber(subtotal)})`;
    }
    
    // Display results
    document.getElementById('xp-needed').textContent = `XP Needed: ${formatNumber(xpNeeded)}`;
    document.getElementById('cost-info').textContent = `Total Cost: ${formatNumber(totalCost)}`;
    document.getElementById('carry-breakdown').textContent = `Breakdown: ${breakdownStr}`;
    
    resultsDiv.style.display = 'block';
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    // Set default values
    document.getElementById('current-level').value = 0;
    document.getElementById('target-level').value = 5;
    
    const inputs = document.querySelectorAll('#current-level, #target-level');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateCheapest();
            }
        });
    });
});