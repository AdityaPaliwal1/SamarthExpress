import React, { useState, useEffect } from "react";
import "../index.css";

async function getParcelDetails(trackingId: string) {
  const response = await fetch(
    `http://localhost:5000/api/parcels/${trackingId}`
  );
  return response.json();
}

// update the delivery status of a parcel
const updateDeliveryStatus = async (trackingId: string, delivered: boolean) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/parcels/${trackingId}/delivery`,
      {
        method: "PATCH", // Use PATCH instead of PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivered }),
      }
    );
    const updatedParcel = await response.json();
    console.log("Delivery status updated:", updatedParcel);
  } catch (error) {
    console.error("Error updating delivery status:", error);
  }
};

const Tracking = ({ trackingID }: any) => {
  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const fetchTrackingDetails = async () => {
    setLoading(true);
    try {
      const result = await getParcelDetails(trackingID);
      if (result?.created_at) {
        setCreatedAt(new Date(result.created_at));
      }
    } catch (error) {
      console.error("Error fetching parcel details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (createdAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsedHours = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        );

        if (elapsedHours >= 24) {
          setCurrentStep(4);
          updateDeliveryStatus(trackingID, true); // Mark as delivered
        } else if (elapsedHours >= 21) {
          setCurrentStep(3);
        } else if (elapsedHours >= 20) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [createdAt, trackingID]);

  useEffect(() => {
    if (trackingID) {
      fetchTrackingDetails();
    }
  }, [trackingID]);

  return (
    <>
      {loading ? (
        <div className="dot-loader"></div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 p-4">
            <h2
              className={currentStep >= 1 ? "text-green-600" : "text-red-600"}
            >
              Step1: Pickup/Drop Off
            </h2>
            <p className={currentStep >= 1 ? "text-green-400" : "text-red-400"}>
              Your Parcel was picked up successfully and is ready for delivery.
            </p>
          </div>

          <div className="border border-gray-200 p-4">
            <h2
              className={currentStep >= 2 ? "text-green-600" : "text-red-600"}
            >
              Step2: Out for Delivery
            </h2>
            <p className={currentStep >= 2 ? "text-green-400" : "text-red-400"}>
              {/* Your Parcel is out for delivery. */}
              {currentStep >= 2
                ? "Your Parcel is out for delivery "
                : "Your Parcel is ready to out after 20hrs of booking"}
            </p>
          </div>
          <div className="border border-gray-200 p-4">
            <h2
              className={currentStep >= 3 ? "text-green-600" : "text-red-600"}
            >
              Step3: In Transit
            </h2>
            <p className={currentStep >= 3 ? "text-green-400" : "text-red-400"}>
              Your Parcel is in transit.
            </p>
          </div>
          <div className="border border-gray-200 p-4">
            <h2
              className={currentStep >= 4 ? "text-green-500" : "text-red-500"}
            >
              Step4: Delivered
            </h2>
            <p className={currentStep >= 4 ? "text-green-400" : "text-red-400"}>
              Your Parcel was delivered successfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Tracking;
