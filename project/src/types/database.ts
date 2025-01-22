export type ParcelStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'warehouse' | 'delivery_center';
  created_at: string;
}

export interface Parcel {
  id: string;
  tracking_id: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight: number;
  declared_value: number;
  description: string | null;
  current_status: ParcelStatus;
  current_location_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrackingUpdate {
  id: string;
  parcel_id: string;
  status: ParcelStatus;
  location_id: string;
  notes: string | null;
  created_at: string;
}