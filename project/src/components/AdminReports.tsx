import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { X } from "lucide-react";

async function getAllParcels() {
  const response = await fetch("http://localhost:5000/api/getAll");
  return response.json();
}

const updateDeliveryStatus = async (trackingId: string, delivered: boolean) => {
  const timestamp = Date.now();
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-based (0 = January)
  const day = date.getDate();

  const DOD = delivered ? `${day}/${month}/${year}` : "";

  try {
    const response = await fetch(
      `http://localhost:5000/api/parcels/${trackingId}/delivery`,
      {
        method: "PATCH", // Use PATCH instead of PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivered, DOD }),
      }
    );
    const updatedParcel = await response.json();
    console.log("Delivery status updated:", updatedParcel);
  } catch (error) {
    console.error("Error updating delivery status:", error);
  }
};

const AdminReports = ({ userRole }: { userRole: string }) => {
  interface ParcelDetails {
    sender_name: string;
    sender_city: string;
    sender_address: string;
    receiver_name: string;
    receiver_city: string;
    receiver_address: string;
    weight: number;
    declared_value: number;
    parcel_type: string;
    description: string;
    tracking_id: string;
    created_at: string;
    delivered: boolean;
    DOD: string;
  }

  const [allParcels, setAllParcels] = useState<ParcelDetails[]>([]);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (userRole === "Admin") {
      fetchAllParcels();
      const intervalId = setInterval(fetchAllParcels, 60000);
      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [userRole]);

  const fetchAllParcels = async () => {
    try {
      const parcels = await getAllParcels();
      setAllParcels(parcels);
    } catch (err) {
      toast.error("Failed to fetch parcels.");
      console.error(err);
    }
  };

  const filterParcelsbyDate = (
    parcels: ParcelDetails[],
    selectedDate: string
  ) => {
    if (selectedDate === "") {
      return parcels;
    }
    return parcels.filter((parcel) => {
      const parcelDate = new Date(parcel.created_at)
        .toISOString()
        .split("T")[0];
      return parcelDate === selectedDate;
    });
  };
  const filteredParcels = filterParcelsbyDate(allParcels, date);

  const formatToIST = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filterParcelsbyDate(allParcels, date)
    ); // Convert the data to Excel sheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parcels"); // Append the sheet to the workbook
    XLSX.writeFile(workbook, "parcels.xlsx"); // Download the Excel file
  };

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const npage = Math.ceil(filteredParcels.length / itemsPerPage);

  const handlePrevChange = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextChange = () => {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  };

  //Return Starts
  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl text-center font-bold mb-6 text-blue-400">
          BOOKING RECORDS
        </h2>
        <button
          onClick={downloadExcel}
          className="mb-4 p-2 bg-blue-500 text-white rounded"
        >
          Download Excel
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded border mx-3 cursor-pointer"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Sender</th>
                <th className="py-2 px-4 border-b">Receiver</th>
                <th className="py-2 px-4 border-b">Sender City</th>
                <th className="py-2 px-4 border-b">Receiver City</th>
                <th className="py-2 px-4 border-b">Parcel Type</th>
                <th className="py-2 px-4 border-b">Booking Date</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Delivered</th>{" "}
                {/* New Column */}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((parcel) => (
                <tr key={parcel.tracking_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{parcel.sender_name}</td>
                  <td className="py-2 px-4 border-b">{parcel.receiver_name}</td>
                  <td className="py-2 px-4 border-b">{parcel.sender_city}</td>
                  <td className="py-2 px-4 border-b">{parcel.receiver_city}</td>
                  <td className="py-2 px-4 border-b">{parcel.parcel_type}</td>
                  <td className="py-2 px-4 border-b">
                    {formatToIST(parcel.created_at).split(",")[0]}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₹{parcel.declared_value}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {parcel.delivered ? (
                      <div className="flex justify-center items-center gap-1">
                        <span className="text-green-600 text-sm">
                          Delivered
                        </span>
                        <X
                          className="text-red-500 h-5 w-5 cursor-pointer"
                          onClick={() =>
                            updateDeliveryStatus(parcel.tracking_id, false)
                          }
                        />
                      </div>
                    ) : (
                      <label className="flex gap-2 justify-center items-center text-red-600">
                        <input
                          type="checkbox"
                          onClick={() =>
                            updateDeliveryStatus(parcel.tracking_id, true)
                          }
                        />
                        Delivered
                      </label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrevChange()}
              disabled={currentPage === 1 || currentItems.length === 0}
              className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {npage}
            </span>
            <button
              onClick={() => handleNextChange()}
              disabled={currentPage === npage || currentItems.length === 0}
              className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminReports;
