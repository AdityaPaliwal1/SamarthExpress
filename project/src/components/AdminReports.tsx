import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
async function getAllParcels() {
  const response = await fetch(
    "https://samarthexpress.onrender.com/api/getAll"
  );
  return response.json();
}

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
  }

  const [allParcels, setAllParcels] = useState<ParcelDetails[]>([]);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (userRole === "Admin") {
      fetchAllParcels();
      setInterval(fetchAllParcels, 60000);
      // Fetch parcels every minute
    }
  }, [userRole]);

  const fetchAllParcels = async () => {
    const now = new Date();
    try {
      const parcels = await getAllParcels();
      for (const parcel of parcels) {
        const createdAt = new Date(parcel.created_at);
        const elapsedHours = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        );
        if (elapsedHours >= 24) {
          parcel.delivered = true;
        }
      }
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
                      <span className="text-green-600">Delivered</span>
                    ) : (
                      <span className="text-red-600">Not Delivered</span>
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
