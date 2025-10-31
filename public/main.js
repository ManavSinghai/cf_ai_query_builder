alert('main.js was loaded!');

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const naturalQueryInput = document.getElementById('natural-query');
    const resultsOutput = document.getElementById('results-output');
    const historyList = document.getElementById('history-list');

    //  1. Function to fetch and display history ---
    const fetchHistory = async () => {
        historyList.innerHTML = '<p>Loading history...</p>';
        try {
            // This calls our Worker's /api/history endpoint
            const response = await fetch('/api/history');
            const history = await response.json();
            
            if (!Array.isArray(history) || history.length === 0) {
                historyList.innerHTML = '<p>No queries made yet.</p>';
                return;
            }
            
            historyList.innerHTML = ''; 
            
            
            history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <p><strong>Natural:</strong> ${item.natural}</p>
                    <pre><code>${item.boolean}</code></pre>
                `;
                historyList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching history:', error);
            historyList.innerHTML = '<p>Error loading history.</p>';
        }
    };
    
    // 2. Function to handle query generation ---
    const handleGenerate = async () => {
        const query = naturalQueryInput.value;
        if (!query) {
            alert('Please enter a description of your job.');
            return;
        }
        
        
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
        resultsOutput.textContent = '...thinking...';
        
        try {
            // This calls our Worker's /api/generate-query endpoint
            const response = await fetch('/api/generate-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ natural_query: query }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                resultsOutput.textContent = data.boolean_query;
               
                await fetchHistory();
            } else {
                 resultsOutput.textContent = `Error: ${data.error || 'Unknown error'}`;
            }

        } catch (error) {
            console.error('Error generating query:', error);
            resultsOutput.textContent = 'An error occurred. Please try again.';
        } finally {
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Query';
        }
    };

    //  3. Attach event listener and load initial data ---
    generateButton.addEventListener('click', handleGenerate);
    fetchHistory(); 
});