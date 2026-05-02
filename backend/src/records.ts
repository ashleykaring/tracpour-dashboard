export type PourRecord = {
  id: string;
  name: string;
  expected_yardage: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LoadRecord = {
  id: string;
  job_id: string;
  sequence_number: number;
  status: string;
  completed_at: string | null;
  yardage: number;
  yardage_source: string;
  created_at: string;
};

export type ActivityEventRecord = {
  id: string;
  job_id: string;
  type: string;
  timestamp: string;
  created_at: string;
};

export type TruckingTicketRecord = {
  id: string;
  job_id: string | null;
  status: string;
  truck_label: string | null;
  ticket_number: string | null;
  delivered_at: string | null;
  yardage: number | null;
  download_url: string | null;
  created_at: string;
};

export type RawEventRecord = {
  id: string;
  job_id: string | null;
  type: string;
  timestamp: string;
  received_at: string;
  payload_json: unknown;
};
