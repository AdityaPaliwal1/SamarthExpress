import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Tracking from "./Tracking";
import { io, Socket } from "socket.io-client";
import {
  Package,
  Search,
  MapPin,
  DollarSign,
  Weight,
  Box,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// async function createParcel(parcelData: any) {
//   const response = await fetch("http://localhost:5000/api/parcels", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(parcelData),
//   });
//   return response.json();
// }

async function getRazorpayKey() {
  const response = await fetch(
    "https://samarthexpress.onrender.com/api/razorpay-key"
  );
  return response.json();
}

async function getParcelByTrackingId(trackingId: string) {
  const response = await fetch(
    `https://samarthexpress.onrender.com/api/parcels/${trackingId}`
  );
  return response.json();
}

async function getAllParcels() {
  const response = await fetch(
    "https://samarthexpress.onrender.com/api/getAll"
  );
  return response.json();
}

const Booking = ({ userRole }: { userRole: string }) => {
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
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("book");
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<ParcelDetails | null>(
    null
  );
  const [book, setbook] = useState(false);
  const [allParcels, setAllParcels] = useState<ParcelDetails[]>([]);

  useEffect(() => {
    if (userRole === "Admin") {
      fetchAllParcels();
      setInterval(fetchAllParcels, 60000); // Fetch parcels every minute
    }
  }, [userRole]);

  useEffect(() => {
    // Fetch Razorpay Key ID when the component mounts
    getRazorpayKey().then((data) => {
      setRazorpayKey(data.key);
    });
  }, []);

  const socket: Socket = io("https://samarthexpress.onrender.com", {
    autoConnect: false, // Do not connect automatically
  });

  useEffect(() => {
    socket.connect(); // Connect to the WebSocket server
    console.log("Connected to WebSocket server");
    // Listen for delivery status updates
    socket.on("deliveryStatusUpdated", (updatedParcel: ParcelDetails) => {
      setAllParcels((prevParcels) =>
        prevParcels.map((parcel) =>
          parcel.tracking_id === updatedParcel.tracking_id
            ? updatedParcel
            : parcel
        )
      );
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchAllParcels = async () => {
    try {
      const parcels = await getAllParcels();
      setAllParcels(parcels);
    } catch (err) {
      toast.error("Failed to fetch parcels.");
      console.error(err);
    }
  };

  const formatToIST = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(allParcels); // Convert the data to Excel sheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parcels"); // Append the sheet to the workbook
    XLSX.writeFile(workbook, "parcels.xlsx"); // Download the Excel file
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!razorpayKey) {
      toast.error("Razorpay key not available. Please try again later.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const parcelData = {
        sender_name: formData.get("sender_name") as string,
        sender_phone: formData.get("sender_phone") as string,
        sender_address: formData.get("sender_address") as string,
        sender_city: formData.get("sender_city") as string,
        receiver_name: formData.get("receiver_name") as string,
        receiver_phone: formData.get("receiver_phone") as string,
        receiver_address: formData.get("receiver_address") as string,
        receiver_city: formData.get("receiver_city") as string,
        weight: Number(formData.get("weight")),
        declared_value: Number(formData.get("declared_value")),
        parcel_type: formData.get("parcel_type") as string,
        description: formData.get("description") as string,
      };

      let Actualamount = 0;
      if (parcelData.weight <= 50) {
        Actualamount = 100;
      } else {
        Actualamount = 100 + (parcelData.weight - 50) * 2;
      }
      const paymentResponse = await fetch(
        "https://samarthexpress.onrender.com/api/payment/order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ declared_value: Actualamount }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Failed to create Razorpay order");
      }

      const { order_id, amount, currency } = await paymentResponse.json();

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "Samarth Express",
        description: "Parcel Booking Payment",
        order_id: order_id,
        handler: async (response: any) => {
          const { razorpay_payment_id, razorpay_order_id } = response;

          const parcelResponse = await fetch(
            "https://samarthexpress.onrender.com/api/parcels",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id, // Pass payment ID
                trackingDetails: parcelData,
                razorpay_order_id, // Pass parcel details
              }),
            }
          );

          if (!parcelResponse.ok) {
            throw new Error("Parcel booking failed after payment");
          }

          const parcelDataRes = await parcelResponse.json();
          toast.success(
            `Booking successful! Your tracking ID is: ${parcelDataRes.parcel.tracking_id}`
          );

          setTrackingId(parcelDataRes.parcel.tracking_id);
          setbook(true);
          (e.target as HTMLFormElement).reset();
        },

        prefill: {
          name: parcelData.sender_name,
          email: "customer@example.com",
          contact: parcelData.sender_phone,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to create booking. Please Log in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await getParcelByTrackingId(trackingId);
      if (result) {
        toast.success(`Parcel found with tracking ID: ${trackingId}`);
      }

      setTrackingResult(result);
    } catch (err) {
      toast.error("Failed to fetch tracking information.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section id="booking" className="py-20 bg-gray-50">
        <div
          className={
            userRole === "Customer"
              ? "max-w-4xl mx-auto px-4"
              : "max-w-7xl mx-auto px-4"
          }
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {userRole === "Customer" ? (
              <>
                <div className="flex border-b">
                  <button
                    className={`flex-1 py-4 text-center font-semibold ${
                      activeTab === "book"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    onClick={() => setActiveTab("book")}
                  >
                    Book a Parcel
                  </button>
                  <button
                    className={`flex-1 py-4 text-center font-semibold ${
                      activeTab === "track"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    onClick={() => setActiveTab("track")}
                  >
                    Track Parcel
                  </button>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                      {error}
                    </div>
                  )}

                  {activeTab === "book" ? (
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      {/* Booking form inputs */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Sender Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Box className="h-5 w-5 text-blue-600" />
                            Sender Details
                          </h3>
                          <input
                            name="sender_name"
                            type="text"
                            placeholder="Sender's Name"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500 focus:z-10"
                            required
                          />
                          <input
                            name="sender_phone"
                            type="tel"
                            placeholder="Sender's Phone"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            required
                          />
                          <input
                            name="sender_city"
                            type="text"
                            placeholder="Sender's City"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            required
                          />
                          <textarea
                            name="sender_address"
                            placeholder="Pickup Address"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            rows={3}
                            required
                          ></textarea>
                        </div>

                        {/* Receiver Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Receiver Details
                          </h3>
                          <input
                            name="receiver_name"
                            type="text"
                            placeholder="Receiver's Name"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            required
                          />
                          <input
                            name="receiver_phone"
                            type="tel"
                            placeholder="Receiver's Phone"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            required
                          />
                          <input
                            name="receiver_city"
                            type="text"
                            placeholder="Receiver's City"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            required
                          />
                          <textarea
                            name="receiver_address"
                            placeholder="Delivery Address"
                            className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                            rows={3}
                            required
                          ></textarea>
                        </div>
                      </div>

                      {/* Parcel Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          Parcel Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center border rounded px-4 py-2">
                            <Weight className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                              name="weight"
                              type="number"
                              step="0.01"
                              placeholder="Weight (kg)"
                              className="w-full focus:outline-none"
                              required
                            />
                          </div>
                          <div className="flex items-center border rounded px-4 py-2">
                            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                              name="declared_value"
                              type="number"
                              step="0.01"
                              placeholder="Declared Value (₹)"
                              className="w-full focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <input
                              name="parcel_type"
                              type="text"
                              placeholder="Parcel Type"
                              className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <textarea
                          name="description"
                          placeholder="Parcel Description"
                          className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500"
                          rows={2}
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          "Book Parcel"
                        )}
                      </button>
                      {book && (
                        <div className="mt-4">
                          <a
                            href={`https://samarthexpress.onrender.com/api/receipt/${trackingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition duration-300"
                          >
                            Download Receipt
                          </a>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <form onSubmit={handleTracking} className="space-y-6">
                        {/* Tracking form inputs */}
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <div className="px-4">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Enter Tracking ID"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="flex-1 px-4 py-3 focus:outline-none"
                            required
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition duration-300 flex items-center"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Tracking...
                              </>
                            ) : (
                              "Track"
                            )}
                          </button>
                        </div>
                      </form>
                      {trackingResult && (
                        <div className="space-y-6">
                          {/* Parcel tracking details */}
                          <Tracking trackingID={trackingId} />
                          <div className="border rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">
                              Parcel Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Sender
                                </h4>
                                <p>{trackingResult.sender_name}</p>
                                <p>{trackingResult.sender_city}</p>
                                <p>{trackingResult.sender_address}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Receiver
                                </h4>
                                <p>{trackingResult.receiver_name}</p>
                                <p>{trackingResult.receiver_city}</p>
                                <p>{trackingResult.receiver_address}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Weight
                                </h4>
                                <p>{trackingResult.weight}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Parcel Type
                                </h4>
                                <p>{trackingResult.parcel_type}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Declared Value
                                </h4>
                                <p>{trackingResult.declared_value}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Description
                                </h4>
                                <p>{trackingResult.description}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-600">
                                  Booked Time
                                </h4>
                                <p>{formatToIST(trackingResult.created_at)}</p>
                              </div>
                              {trackingId && (
                                <div className="mt-4">
                                  <a
                                    href={`https://samarthexpress.onrender.com/api/receipt/${trackingId}`}
                                    download={`receipt-${trackingId}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition duration-300"
                                  >
                                    Download Receipt
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : userRole === "Admin" ? (
              <div className="p-6">
                <h2 className="text-2xl text-center font-bold mb-6 text-blue-400">
                  ADMIN DASHBOARD
                </h2>
                <button
                  onClick={downloadExcel}
                  className="mb-4 p-2 bg-blue-500 text-white rounded"
                >
                  Download Excel
                </button>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">Sender</th>
                        <th className="py-2 px-4 border-b">Receiver</th>
                        <th className="py-2 px-4 border-b">Sender City</th>
                        <th className="py-2 px-4 border-b">Receiver City</th>
                        <th className="py-2 px-4 border-b">Parcel Type</th>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Amount</th>
                        <th className="py-2 px-4 border-b">Delivered</th>{" "}
                        {/* New Column */}
                      </tr>
                    </thead>
                    <tbody>
                      {allParcels.map((parcel) => (
                        <tr
                          key={parcel.tracking_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-2 px-4 border-b">
                            {parcel.sender_name}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {parcel.receiver_name}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {parcel.sender_city}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {parcel.receiver_city}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {parcel.parcel_type}
                          </td>
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
                              <span className="text-red-600">
                                Not Delivered
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
};

export default Booking;
