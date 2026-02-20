document.addEventListener('DOMContentLoaded', () => {
    const medicineList = document.getElementById('medicinesList');
    const addMedBtn = document.getElementById('addMedicine');
    const form = document.getElementById('prescriptionForm');
    const previewBtn = document.getElementById('previewBtn');
    const template = document.getElementById('prescriptionTemplate');
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const historyBody = document.getElementById('historyBody');

    // --- LOGIN LOGIC ---
    const checkLogin = () => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            loginOverlay.classList.add('hidden');
        } else {
            loginOverlay.classList.remove('hidden');
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        // Hardcoded credentials as requested
        if (user === 'doctor' && pass === 'doctor123') {
            localStorage.setItem('isLoggedIn', 'true');
            loginOverlay.classList.add('hidden');
            renderHistory();
        } else {
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        window.location.reload();
    });

    checkLogin();

    // --- HISTORY LOGIC ---
    const saveToHistory = (data) => {
        let history = JSON.parse(localStorage.getItem('patientHistory') || '[]');
        history.unshift(data); // Add to beginning
        localStorage.setItem('patientHistory', JSON.stringify(history));
        renderHistory();
    };

    const renderHistory = () => {
        let history = JSON.parse(localStorage.getItem('patientHistory') || '[]');
        historyBody.innerHTML = history.length ? history.map((item, index) => `
            <tr>
                <td>${item.date}</td>
                <td>${item.name}</td>
                <td>${item.age} / ${item.gender}</td>
                <td>${item.diagnosis}</td>
                <td>
                    <button class="btn-add" onclick="loadHistoryItem(${index})">Re-fill</button>
                    <button class="btn-remove" onclick="deleteHistoryItem(${index})" style="margin-left: 5px;">Delete</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align:center;">No history found.</td></tr>';
    };

    window.deleteHistoryItem = (index) => {
        if (confirm('Are you sure you want to delete this record?')) {
            let history = JSON.parse(localStorage.getItem('patientHistory') || '[]');
            history.splice(index, 1);
            localStorage.setItem('patientHistory', JSON.stringify(history));
            renderHistory();
        }
    };

    window.loadHistoryItem = (index) => {
        const history = JSON.parse(localStorage.getItem('patientHistory') || '[]');
        const item = history[index];
        if (!item) return;

        document.getElementById('patientName').value = item.name;
        document.getElementById('patientAge').value = item.age;
        document.getElementById('patientGender').value = item.gender;
        document.getElementById('symptoms').value = item.symptoms;
        document.getElementById('diagnosis').value = item.diagnosis;
        document.getElementById('labTests').value = item.labTests;

        // Clear and refill medicines
        medicineList.innerHTML = '';
        item.medicines.forEach(m => {
            addMedicineRow(m);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- MEDICINE LOGIC ---
    const addMedicineRow = (data = {}) => {
        const div = document.createElement('div');
        div.className = 'medicine-item';
        div.style.marginBottom = '1rem';
        div.style.padding = '1rem';
        div.style.border = '1px solid #eee';
        div.style.borderRadius = '8px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-weight:700;">Medicine Details</span>
                <button type="button" class="remove-med btn-remove">Remove</button>
            </div>
            <input type="text" class="med-name" placeholder="Drug Name" value="${data.name || ''}" required>
            <div class="grid-2" style="margin-top:0.5rem;">
                <input type="text" class="med-dosage" placeholder="1-0-1" value="${data.dose || ''}">
                <input type="text" class="med-duration" placeholder="5 Days" value="${data.duration || ''}">
            </div>
            <input type="text" class="med-instructions" placeholder="Note (e.g. After food)" value="${data.note || ''}" style="margin-top:0.5rem;">
        `;
        medicineList.appendChild(div);
        div.querySelector('.remove-med').addEventListener('click', () => div.remove());
    };

    addMedBtn.addEventListener('click', () => addMedicineRow());

    const updatePDFData = () => {
        // Patient Header
        document.getElementById('pdfPatientName').innerText = document.getElementById('patientName').value.toUpperCase();
        document.getElementById('pdfAge').innerText = document.getElementById('patientAge').value;
        document.getElementById('pdfGender').innerText = document.getElementById('patientGender').value;

        const now = new Date();
        document.getElementById('pdfDateTime').innerText = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('pdfRefNo').innerText = 'PR-' + Math.floor(Math.random() * 900000 + 100000);

        // Clinical
        document.getElementById('pdfSymptoms').innerText = document.getElementById('symptoms').value || 'Reported symptoms as per consultation';
        document.getElementById('pdfDiagnosis').innerText = document.getElementById('diagnosis').value || 'Clinical Evaluation';

        // Lab Tests
        const labs = document.getElementById('labTests').value;
        const labDiv = document.getElementById('pdfLabTests');
        labDiv.innerHTML = labs ? labs.split('\n').map(l => `<p style="font-size:13px; margin:4px 0;">• ${l}</p>`).join('') : '<p style="color:#aaa;">None</p>';

        // Medications
        const medDiv = document.getElementById('pdfMedicines');
        medDiv.innerHTML = '';
        document.querySelectorAll('.medicine-item').forEach((item, i) => {
            const name = item.querySelector('.med-name').value;
            const dose = item.querySelector('.med-dosage').value;
            const dur = item.querySelector('.med-duration').value;
            const note = item.querySelector('.med-instructions').value;

            if (name) {
                medDiv.innerHTML += `
                    <div class="pdf-med-item">
                        <div class="name-row"><span>${i + 1}. ${name}</span> <span>${dose}</span></div>
                        <div class="instr-row"><span>Tab/Cap</span> <span>${dur}${note ? ' (' + note + ')' : ''}</span></div>
                    </div>
                `;
            }
        });
    };

    previewBtn.addEventListener('click', () => {
        updatePDFData();
        template.classList.toggle('hidden');
        if (!template.classList.contains('hidden')) {
            template.scrollIntoView({ behavior: 'smooth' });
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        updatePDFData();

        // Save to history
        const formData = {
            date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            name: document.getElementById('patientName').value,
            age: document.getElementById('patientAge').value,
            gender: document.getElementById('patientGender').value,
            symptoms: document.getElementById('symptoms').value,
            diagnosis: document.getElementById('diagnosis').value,
            labTests: document.getElementById('labTests').value,
            medicines: Array.from(document.querySelectorAll('.medicine-item')).map(item => ({
                name: item.querySelector('.med-name').value,
                dose: item.querySelector('.med-dosage').value,
                duration: item.querySelector('.med-duration').value,
                note: item.querySelector('.med-instructions').value
            }))
        };
        saveToHistory(formData);

        // Show template for capture
        template.classList.remove('hidden');

        const opt = {
            margin: 0,
            filename: `Prescription_${document.getElementById('patientName').value || 'Patient'}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(template).save().then(() => {
            console.log("PDF Downloaded");
        });
    });

    renderHistory();
});

