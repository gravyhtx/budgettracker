let purchases = [];
let myChart;

fetch("/api/purchasing")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    purchases = data;
    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce purchasing amounts to a single total value
  const total = purchases.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  const totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  const tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  purchases.forEach(purchasing => {
    // create and populate a table row
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${purchasing.name}</td>
      <td>${purchasing.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  const reversed = purchases.slice().reverse();
  let sum = 0;

  // create date labels for chart
  const labels = reversed.map(t => {
    const date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  const data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById("my-chart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#6666ff",
          data
        }
      ]
    }
  });
}

function sendTransaction(isAdding) {
  const nameEl = document.querySelector("#t-name");
  const amountEl = document.querySelector("#t-amount");
  const errorEl = document.querySelector("form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  } else {
    errorEl.textContent = "";
  }

  // create record
  const purchasing = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    purchasing.value *= -1;
  }

  // add to beginning of current array of data
  purchases.unshift(purchasing);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();
  function populateTotal() {
    // reduce purchasing amounts to a single total value
    const total = purchases.reduce((total, t) => {
      return total + parseInt(t.value);
    }, 0);
  
    const totalEl = document.querySelector("#total");
    totalEl.textContent = total;
  }

  // also send to server
  fetch("/api/purchasing", {
    method: "POST",
    body: JSON.stringify(purchasing),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {


      // clear form
      nameEl.value = "";
      amountEl.value = "";
    })

}

document.querySelector("#add-btn").onclick = function() {
  event.preventDefault()
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  event.preventDefault()
  sendTransaction(false);
};