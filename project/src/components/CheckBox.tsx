const DeliveryStatusCheckbox = ({ parcelId }:any) => {
  const updateDeliveryStatus = async (
    trackingId: string,
    delivered: boolean
  ) => {
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

  return (
    <label>
      <input
        type="checkbox"
        onClick={() => updateDeliveryStatus(parcelId, true)}
      />
      Delivered
    </label>
  );
};

export default DeliveryStatusCheckbox;
