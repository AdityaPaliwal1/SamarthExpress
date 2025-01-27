import React from "react";

const Tracking = () => {
  return (
    <>
      <div className="space-y-4">
        <div className="border border-gray-200 p-4">
          <h2 className="text-green-500 font-bold">Step1: Pickup/Drop Off</h2>
          <p className="text-green-400">
            Your Parcel was picked up successfully and is ready for delivery.
          </p>
        </div>

        <div className="border border-gray-200 p-4">
          <h2 className="text-red-500 font-bold">Step2: Out for Delivery</h2>
          <p className="text-red-500">Your Parcel is out for delivery.</p>
        </div>
        <div className="border border-gray-200 p-4">
          <h2 className="text-red-500 font-bold">Step3: In Transit</h2>
          <p className="text-red-500">Your Parcel is in transit.</p>
        </div>
        <div className="border border-gray-200 p-4">
          <h2 className="text-red-500 font-bold">Step4: Delivered</h2>
          <p className="text-red-500">
            Your Parcel was delivered successfully.
          </p>
        </div>
      </div>
    </>
  );
};

export default Tracking;
