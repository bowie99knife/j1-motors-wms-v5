export type StaffRole = "admin" | "workshop_manager" | "mechanic" | "apprentice";

export interface Profile {
  id: string;
  staff_id: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
}

export interface JobCard {
  id: string;
  job_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  rego: string;
  make: string;
  model: string;
  year?: number;
  odometer?: number;
  engine_code?: string;
  transmission?: string;
  customer_concern?: string;
  findings?: string;
  fault_codes?: string;
  diagnosis?: string;
  rectification?: string;
  recommendations?: string;
  assigned_to?: string;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
}