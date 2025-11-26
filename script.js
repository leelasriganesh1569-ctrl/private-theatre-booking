let packageData = {};

// Load packages.json
fetch("packages.json")
  .then(res => res.json())
  .then(data => {
    packageData = data;
    loadPackages();
    updateSummary();
  });

const packageSelect = document.getElementById("package");

function loadPackages() {
  Object.keys(packageData).forEach(key => {
    let p = packageData[key];
    let opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${p.name} – ₹${p.price} (${p.details})`;
    packageSelect.appendChild(opt);
  });
}

function updateSummary() {
  let pkgKey = document.getElementById("package").value;
  if (!pkgKey) return;

  let pkg = packageData[pkgKey];

  let people = parseInt(document.getElementById("people").value) || 1;
  let date = document.getElementById("date").value;
  let start = document.getElementById("startTime").value;
  let endField = document.getElementById("endTime");

  // Auto-calc end time
  if (start) {
    let t = new Date(`2000-01-01T${start}`);
    t.setHours(t.getHours() + pkg.hours);
    endField.value = t.toTimeString().substring(0,5);
  }

  let extra = people > 15 ? (people - 15) * 100 : 0;
  let total = pkg.price + extra;

  document.getElementById("sumDate").textContent = date || "—";
  document.getElementById("sumPackage").textContent = `₹${pkg.price}`;
  document.getElementById("sumGuests").textContent = people;
  document.getElementById("sumExtra").textContent = extra ? `${people - 15} x 100 = ₹${extra}` : "0";
  document.getElementById("sumHours").textContent = pkg.hours + " Hr";

  document.getElementById("sumStart").textContent = start ? `${date} | ${start}` : "—";
  document.getElementById("sumEnd").textContent = endField.value ? `${date} | ${endField.value}` : "—";

  document.getElementById("payTotal").textContent = `₹${total}`;

  // QR Generator
  const upiId = "9052651447@naviaxis";
  const upiName = "TAMATAM VIJAYA KUMARI";
  const upiUri =
    `upi://pay?pa=${upiId}&pn=${upiName}&am=${total}&cu=INR&tn=Party Hall Booking`;

  document.getElementById("qrImgSmall").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(upiUri);
}

document.querySelectorAll("#package, #people, #date, #startTime")
  .forEach(el => el.addEventListener("change", updateSummary));

// Receipt
document.getElementById("downloadReceipt").addEventListener("click", () => {
  let pkgKey = document.getElementById("package").value;
  let pkg = packageData[pkgKey];

  let receipt =
`Receipt - Party Hall Booking

Name: ${document.getElementById("name").value}
Phone: ${document.getElementById("phone").value}
Date: ${document.getElementById("date").value}

Package: ${pkg.name}
Price: ₹${pkg.price}
Details: ${pkg.details}

People: ${document.getElementById("people").value}
Extra Charges: ${document.getElementById("sumExtra").textContent}

Start Time: ${document.getElementById("sumStart").textContent}
End Time: ${document.getElementById("sumEnd").textContent}

Total Paid: ${document.getElementById("payTotal").textContent}

Transaction ID: ${document.getElementById("txnId").value}

Thank you for booking!`;

  const blob = new Blob([receipt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Booking_Receipt.txt";
  a.click();
  URL.revokeObjectURL(url);
});
