import React, { useState } from "react";
import { toast } from "react-toastify";
import Tracking from "./Tracking";
import {
  Package,
  Search,
  MapPin,
  DollarSign,
  Weight,
  Box,
  Loader2,
} from "lucide-react";

async function createParcel(parcelData: any) {
  const response = await fetch("http://localhost:5000/api/parcels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcelData),
  });
  return response.json();
}

async function getParcelByTrackingId(trackingId: string) {
  const response = await fetch(
    `http://localhost:5000/api/parcels/${trackingId}`
  );
  return response.json();
}

const Booking = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState("");
  const [book, setbook] = useState(false);

  const formatToIST = (utcDate:string) => {
    const date = new Date(utcDate); // Convert UTC date string to Date object
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }); // Format date
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      // Only create the parcel if the user is logged in
      const parcel = await createParcel(parcelData);
      toast.success(
        `Booking successful! Your tracking ID is: ${parcel.tracking_id}`
      );
      setTrackingId(parcel.tracking_id);
      setbook(true);
      (e.target as HTMLFormElement).reset();
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
      console.log(trackingResult);
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
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
                        href={`http://localhost:5000/api/receipt/${trackingId}`}
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
                  <div>
                    {trackingResult && (
                      <div className="space-y-6">
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
                                  href={`http://localhost:5000/api/receipt/${trackingId}`}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Booking;
