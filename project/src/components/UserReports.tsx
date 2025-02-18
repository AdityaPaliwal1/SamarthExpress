import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const UserReports = () => {
  const details = JSON.parse(Cookies.get("user_details") || "{}");
  const userId = details.id;
  const userRole = details.role;

  interface ParcelDetails {
    sender_name: string;
    receiver_name: string;
    sender_city: string;
    receiver_city: string;
    parcel_type: string;
    created_at: string;
    declared_value: number;
    tracking_id: string;
    delivered: boolean;
    DOD: string;
  }

  const [parcels, setParcels] = useState<ParcelDetails[]>([]);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/getparcels/${userId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch parcels: ${response.statusText}`);
      }
      const data = await response.json();
      setParcels(data.parcels || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch parcels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID is missing");
      return;
    }
    if (userRole === "Customer") {
      fetchParcels();
      const intervalId = setInterval(fetchParcels, 60000);

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [userId, userRole]);

  const filterParcelsbyDate = (
    parcels: ParcelDetails[],
    selectedDate: string
  ) => {
    return parcels.filter(
      (parcel) => parcel.created_at.split("T")[0] === selectedDate
    );
  };

  const filteredParcels = filterParcelsbyDate(parcels, date);

  const formatToIST = (utcDate: string) => {
    return new Date(utcDate).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredParcels);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parcels");
    XLSX.writeFile(workbook, "user_parcels.xlsx");
  };

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const npage = Math.ceil(filteredParcels.length / itemsPerPage);

  return (
    <div className="p-6">
      <p className="text-gray-400 cursor-pointer">
        <span>
          {" "}
          <Link to="/" className="text-blue-500 ">
            {"<"} Home
          </Link>
        </span>
        /user-report
      </p>
      <h2 className="text-2xl text-center font-bold my-4 text-blue-400">
        YOUR PARCEL RECORDS
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
                <th className="py-2 px-4 border-b">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((parcel) => (
                  <tr key={parcel.tracking_id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{parcel.sender_name}</td>
                    <td className="py-2 px-4 border-b">
                      {parcel.receiver_name}
                    </td>
                    <td className="py-2 px-4 border-b">{parcel.sender_city}</td>
                    <td className="py-2 px-4 border-b">
                      {parcel.receiver_city}
                    </td>
                    <td className="py-2 px-4 border-b">{parcel.parcel_type}</td>
                    <td className="py-2 px-4 border-b">
                      {formatToIST(parcel.created_at).split(",")[0]}
                    </td>
                    <td className="py-2 px-4 border-b">
                      ₹{parcel.declared_value}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div>
                        {parcel.delivered ? (
                        <span className="text-green-600">
                          Delivered on {parcel.DOD}
                        </span>
                      ) : (
                        <span className="text-red-600">Not Delivered</span>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    No parcels found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      <div className="flex justify-end items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 mx-3">
          Page {currentPage} of {npage}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, npage))}
          disabled={currentPage === npage}
          className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserReports;
