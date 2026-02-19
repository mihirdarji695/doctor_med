document.addEventListener('DOMContentLoaded', () => {
    const medicineList = document.getElementById('medicinesList');
    const addMedBtn = document.getElementById('addMedicine');
    const form = document.getElementById('prescriptionForm');
    const previewBtn = document.getElementById('previewBtn');
    const template = document.getElementById('prescriptionTemplate');

    // Add Medicine Row
    addMedBtn.addEventListener('click', () => {
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
            <input type="text" class="med-name" placeholder="Drug Name" required>
            <div class="grid-2" style="margin-top:0.5rem;">
                <input type="text" class="med-dosage" placeholder="1-0-1">
                <input type="text" class="med-duration" placeholder="5 Days">
            </div>
            <input type="text" class="med-instructions" placeholder="Note (e.g. After food)" style="margin-top:0.5rem;">
        `;
        medicineList.appendChild(div);
        div.querySelector('.remove-med').addEventListener('click', () => div.remove());
    });

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
                scrollY: 0 // Reset scroll offset
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Standard generation logic
        html2pdf().set(opt).from(template).save().then(() => {
            console.log("PDF Downloaded");
            // Hide if you want to clean up UI after download
            // template.classList.add('hidden');
        });
    });
});
