import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { easeIn, motion } from "framer-motion";
import Tracking from "./Tracking";
import Cookies from "js-cookie";
import "../index.css";
import { Country, State, City } from "country-state-city";

import { FiPackage, FiSearch, FiMapPin, FiBox, FiLoader } from "react-icons/fi";

import AdminReports from "./AdminReports";

declare global {
  interface Window {
    Razorpay: any;
  }
}

async function getRazorpayKey() {
  const response = await fetch("http://localhost:5000/api/razorpay-key");
  return response.json();
}

async function getParcelByTrackingId(trackingId: string) {
  const response = await fetch(
    `http://localhost:5000/api/parcels/${trackingId}`
  );
  return response.json();
}

const Booking = ({ userRole }: { userRole: string }) => {
  const animations = {
    div: {
      initial: {
        y: "20%",
        opacity: 0,
      },
      whileInView: {
        y: "0",
        opacity: 1,
      },
      transition: {
        duration: 0.5,
        easeIn,
      },
    },
  };
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
  interface CityType {
    name: string;
    isoCode: string;
  }

  interface StateType {
    name: string;
    isoCode: string;
    countryIsoCode: string;
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
  const [countries, setCountries] = useState(Country.getAllCountries());
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [selectedCountry, setSelectedCountry] = useState([]);
  const [selectedState, setSelectedState] = useState<StateType[]>([]);
  const [SenderCity, setSenderCity] = useState("");
  const [ReceiverCity, setReceiverCity] = useState("");

  useEffect(() => {
    // Fetch Razorpay Key ID when the component mounts
    getRazorpayKey().then((data) => {
      setRazorpayKey(data.key);
    });
  }, []);

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
    setStates(State.getStatesOfCountry(country.isoCode));
    setCities([]);
  };
  const handleStateChange = (state: StateType) => {
    setSelectedState(state);
    setCities(City.getCitiesOfState(selectedCountry.isoCode, state.isoCode));
  };
  // Function to handle items per page change
  const formatToIST = (utcDate: string) => {
    const date = new Date(utcDate);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!Cookies.get("user_details")) {
      toast.error("Please Log in to book a parcel.");
      setLoading(false);
      return;
    }

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
        sender_city: SenderCity,
        receiver_name: formData.get("receiver_name") as string,
        receiver_phone: formData.get("receiver_phone") as string,
        receiver_address: formData.get("receiver_address") as string,
        receiver_city: ReceiverCity,
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

      // Fetch user email from Cookie

      const paymentResponse = await fetch(
        "http://localhost:5000/api/payment/order",
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
          try {
            const { razorpay_payment_id, razorpay_order_id } = response;
            const user = JSON.parse(Cookies.get("user_details") || "{}");
            const user_id = user.id || null;
            if (!user_id) {
              throw new Error("User ID missing in cookie");
            }
            const parcelResponse = await fetch(
              "http://localhost:5000/api/parcels",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id,
                  trackingDetails: parcelData,
                  razorpay_order_id,
                  user_id,
                }),
              }
            );

            if (!parcelResponse.ok) {
              const errorRes = await parcelResponse.json();
              throw new Error(errorRes.message || "Parcel booking failed");
            }

            const parcelDataRes = await parcelResponse.json();
            console.log("Parcel API Response:", parcelDataRes);

            if (!parcelDataRes.item || !parcelDataRes.item.tracking_id) {
              throw new Error("Invalid parcel booking response");
            }

            toast.success(
              `Booking successful! Your tracking ID is: ${parcelDataRes.item.tracking_id}`
            );
            setTrackingId(parcelDataRes.item.tracking_id);
            setbook(true);
            (e.target as HTMLFormElement).reset();
          } catch (error: any) {
            toast.error(error.message);
            console.error(error);
          }
        },

        prefill: {
          name: parcelData.sender_name,
          email: "abc@gmail.com", // Corrected: Use user's email from Cookie
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
      if (!trackingId.startsWith("SE")) {
        toast.error("Invalid Tracking ID");
        return;
      }
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
        <motion.div {...animations.div}>
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
                          ? "bg-tabColor text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      onClick={() => setActiveTab("book")}
                    >
                      Book a Parcel
                    </button>
                    <button
                      className={`flex-1 py-4 text-center font-semibold ${
                        activeTab === "track"
                          ? "bg-tabColor text-white"
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
                      <form
                        onSubmit={handleBookingSubmit}
                        className="space-y-6"
                      >
                        {/* Booking form inputs */}
                        <div className="grid md:grid-rows-2 gap-6">
                          {/* Sender Details */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-iconColor">
                              <FiBox className="h-5 w-5 text-iconColor" />
                              Sender Details
                            </h3>
                            <div className="input-group required">
                              <input
                                required
                                type="text"
                                name="sender_name"
                                autoComplete="off"
                                className="input"
                              />
                              <label className="user-label">
                                Sender's Name
                              </label>
                            </div>
                            <div className="input-group required">
                              <input
                                name="sender_phone"
                                type="number"
                                autoComplete="off"
                                className="input "
                                required
                              />
                              <label className="user-label">
                                Sender's Phone
                              </label>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400 "
                                name="sender_country"
                                onChange={(e) =>
                                  handleCountryChange(
                                    countries.find(
                                      (c) => c.isoCode === e.target.value
                                    )
                                  )
                                }
                              >
                                <option selected value="">
                                  Select Country
                                </option>
                                {countries.map((Country) => (
                                  <option
                                    key={Country.isoCode}
                                    value={Country.isoCode}
                                  >
                                    {Country.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400"
                                name="sender_state"
                                disabled={selectedCountry === null}
                                onChange={(e) => {
                                  const selectedState =
                                    states.find(
                                      (s) => s.isoCode === e.target.value
                                    ) || null;
                                  handleStateChange(selectedState);
                                }}
                              >
                                <option selected value="">
                                  Select State
                                </option>
                                {states.map((State) => (
                                  <option
                                    key={State.isoCode}
                                    value={State.isoCode}
                                  >
                                    {State.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400"
                                name="sender_city"
                                value={SenderCity}
                                onChange={(e) => setSenderCity(e.target.value)}
                                disabled={selectedState === null}
                              >
                                <option selected value="">
                                  Select City
                                </option>
                                {cities.map((City) => (
                                  <option key={City.name} value={City.name}>
                                    {City.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="input-group required">
                              <input
                                name="sender_address"
                                type="text"
                                autoComplete="off"
                                className="input"
                                required
                              />
                              <label className="user-label">
                                Pickup Address
                              </label>
                            </div>
                          </div>

                          {/* Receiver Details */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-iconColor ">
                              <FiMapPin className="h-5 w-5 text-iconColor" />
                              Receiver Details
                            </h3>
                            <div className="input-group required">
                              <input
                                name="receiver_name"
                                type="text"
                                autoComplete="off"
                                className="input"
                                required
                              />
                              <label className="user-label">
                                Receiver's Name
                              </label>
                            </div>
                            <div className="input-group required">
                              <input
                                name="receiver_phone"
                                type="tel"
                                autoComplete="off"
                                className="input"
                                required
                              />
                              <label className="user-label">
                                Receiver's Phone
                              </label>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400"
                                name="sender_country"
                                onChange={(e) =>
                                  handleCountryChange(
                                    countries.find(
                                      (c) => c.isoCode === e.target.value
                                    )
                                  )
                                }
                              >
                                <option selected value="">
                                  Select Country
                                </option>
                                {countries.map((Country) => (
                                  <option
                                    key={Country.isoCode}
                                    value={Country.isoCode}
                                  >
                                    {Country.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400"
                                name="sender_state"
                                disabled={selectedCountry === null}
                                onChange={(e) =>
                                  handleStateChange(
                                    states.find(
                                      (s) => s.isoCode === e.target.value
                                    )
                                  )
                                }
                              >
                                <option selected value="">
                                  Select State
                                </option>
                                {states.map((State) => (
                                  <option
                                    key={State.isoCode}
                                    value={State.isoCode}
                                  >
                                    {State.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full px-4 py-2 rounded border focus:outline-none focus:border-blue-500">
                              <select
                                className="w-full text-gray-400"
                                name="receiver_city"
                                value={ReceiverCity}
                                onChange={(e) =>
                                  setReceiverCity(e.target.value)
                                }
                                disabled={selectedState === null}
                              >
                                <option selected value="">
                                  Select City
                                </option>
                                {cities.map((City) => (
                                  <option key={City.name} value={City.name}>
                                    {City.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="input-group required">
                              <input
                                name="receiver_address"
                                autoComplete="off"
                                className="input "
                                required
                              ></input>
                              <label className="user-label">
                                Delivery Address
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Parcel Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-iconColor">
                            <FiPackage className="h-5 w-5 text-iconColor" />
                            Parcel Details
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className=" input-group required ">
                              <input
                                name="weight"
                                type="number"
                                step="0.01"
                                className="input"
                                required
                              />
                              <label className="user-label">Weight (kg)</label>
                            </div>
                            <div className=" input-group required ">
                              <input
                                name="declared_value"
                                type="number"
                                step="0.01"
                                className="input"
                                required
                              />
                              <label className="user-label">
                                DeclaredValue (₹)
                              </label>
                            </div>
                            <div className="input-group required ">
                              <input
                                name="parcel_type"
                                type="text"
                                autoComplete="off"
                                className="input"
                                required
                              />
                              <label className="user-label">Parcel Type</label>
                            </div>
                          </div>
                          <div className="input-group ">
                            <input
                              name="description"
                              type="text"
                              className="input"
                              required
                            />
                            <label className="user-label">Description</label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-button text-white py-3 rounded-lg hover:bg-black transition duration-300 flex items-center justify-center"
                        >
                          {loading ? (
                            <>
                              <FiLoader className="h-5 w-5 animate-spin mr-2" />
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
                              className="bg-button text-white py-2 px-6 rounded hover:bg-black transition duration-300"
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
                          <div className="flex items-center rounded-lg overflow-hidden p-4 ">
                            <div className="px-4">
                              <FiSearch className="h-6 w-6 text-iconColor" />
                            </div>

                            <div className=" input-group required w-full">
                              <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                className="input "
                                required
                              />
                              <label className="user-label">Tracking ID</label>
                            </div>
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-button text-white px-6 py-3 hover:bg-black transition duration-300 flex items-center"
                            >
                              {loading ? (
                                <>
                                  <FiLoader className="h-5 w-5 animate-spin mr-2" />
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
                                  <p>
                                    {formatToIST(trackingResult.created_at)}
                                  </p>
                                </div>
                                {trackingId && (
                                  <div className="mt-4">
                                    <a
                                      href={`http://localhost:5000/api/receipt/${trackingId}`}
                                      download={`receipt-${trackingId}.pdf`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-button text-white py-2 px-6 rounded hover:bg-black transition duration-300"
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
                <AdminReports userRole={userRole} />
              ) : null}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Booking;
