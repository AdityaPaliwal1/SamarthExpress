 module.exports = (parcel) => `
<html>
  <head>
    <style>
      h1 { text-align: center; font-size: 24px; }
      .section { margin-bottom: 20px; }
      .bold { font-weight: bold; }
      .table { width: 100%; border-collapse: collapse; }
      .table td, .table th { border: 1px solid #ddd; padding: 8px; }
    </style>
  </head>
  <body>
    <h1>Parcel Receipt</h1>
    <div class="section">
      <p><span class="bold">Tracking ID:</span> ${parcel.tracking_id}</p>
      <p><span class="bold">Sender:</span> ${parcel.sender_name}</p>
      <p><span class="bold">Receiver:</span> ${parcel.receiver_name}</p>
      <p><span class="bold">Weight:</span> ${parcel.weight} kg</p>
      <p><span class="bold">Declared Value:</span> ₹${parcel.declared_value}</p>
    </div>
    <div class="section">
      <table class="table">
        <tr>
          <th>Details</th>
          <th>Value</th>
        </tr>
        <tr><td>Sender Address</td><td>${parcel.sender_address}</td></tr>
        <tr><td>Receiver Address</td><td>${parcel.receiver_address}</td></tr>
        <tr><td>Description</td><td>${parcel.description}</td></tr>
      </table>
    </div>
  </body>
</html>
`;
