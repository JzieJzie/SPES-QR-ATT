export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'leader' | 'co-leader' | 'developer'
          program_batch: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'leader' | 'co-leader' | 'developer'
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          role?: 'leader' | 'co-leader' | 'developer'
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
          updated_at?: string
        }
      }
      barangays: {
        Row: { id: string; name: string; created_at: string }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { name?: string }
      }
      beneficiaries: {
        Row: {
          id: string
          beneficiary_id: string
          last_name: string
          first_name: string
          middle_name: string | null
          barangay_id: string
          program_batch: 'batch1' | 'batch2' | 'batch3' | 'batch4'
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          beneficiary_id?: string
          last_name: string
          first_name: string
          middle_name?: string | null
          barangay_id: string
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4'
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          last_name?: string
          first_name?: string
          middle_name?: string | null
          barangay_id?: string
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4'
          is_archived?: boolean
          updated_at?: string
        }
      }
      beneficiary_qr_codes: {
        Row: {
          id: string
          beneficiary_ref: string
          qr_value: string
          qr_image_path: string
          generated_at: string
        }
        Insert: {
          id?: string
          beneficiary_ref: string
          qr_value: string
          qr_image_path: string
          generated_at?: string
        }
        Update: { qr_image_path?: string }
      }
      attendance_events: {
        Row: {
          id: string
          beneficiary_ref: string
          attendance_date: string
          scanned_at: string
          event_type: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
          session_name: 'MORNING' | 'AFTERNOON' | null
          is_late: boolean
          is_early_out: boolean
          is_extra_punch: boolean
          punch_sequence: number
          remarks: string | null
          scanned_by: string | null
          device_info: string | null
          status: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          beneficiary_ref: string
          attendance_date: string
          scanned_at: string
          event_type?: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
          session_name?: 'MORNING' | 'AFTERNOON' | null
          is_late?: boolean
          is_early_out?: boolean
          is_extra_punch?: boolean
          punch_sequence?: number
          remarks?: string | null
          scanned_by?: string | null
          device_info?: string | null
          status?: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
          created_at?: string
        }
        Update: {
          status?: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
          remarks?: string | null
          is_extra_punch?: boolean
          punch_sequence?: number
        }
      }
      attendance_daily: {
        Row: {
          id: string
          beneficiary_ref: string
          attendance_date: string
          am_time_in: string | null
          am_time_in_late: boolean
          am_time_out: string | null
          am_time_out_early: boolean
          pm_time_in: string | null
          pm_time_in_late: boolean
          pm_time_out: string | null
          pm_time_out_early: boolean
          extra_am_in_count: number
          extra_am_out_count: number
          extra_pm_in_count: number
          extra_pm_out_count: number
          remarks: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          beneficiary_ref: string
          attendance_date: string
          am_time_in?: string | null
          am_time_in_late?: boolean
          am_time_out?: string | null
          am_time_out_early?: boolean
          pm_time_in?: string | null
          pm_time_in_late?: boolean
          pm_time_out?: string | null
          pm_time_out_early?: boolean
          extra_am_in_count?: number
          extra_am_out_count?: number
          extra_pm_in_count?: number
          extra_pm_out_count?: number
          remarks?: string | null
          updated_at?: string
        }
        Update: {
          am_time_in?: string | null
          am_time_in_late?: boolean
          am_time_out?: string | null
          am_time_out_early?: boolean
          pm_time_in?: string | null
          pm_time_in_late?: boolean
          pm_time_out?: string | null
          pm_time_out_early?: boolean
          extra_am_in_count?: number
          extra_am_out_count?: number
          extra_pm_in_count?: number
          extra_pm_out_count?: number
          remarks?: string | null
          updated_at?: string
        }
      }
      imports: {
        Row: {
          id: string
          file_name: string
          file_type: string
          total_rows: number
          success_rows: number
          failed_rows: number
          program_batch: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
          imported_by: string | null
          imported_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_type: string
          total_rows: number
          success_rows: number
          failed_rows: number
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
          imported_by?: string | null
          imported_at?: string
        }
        Update: {
          success_rows?: number
          failed_rows?: number
          program_batch?: 'batch1' | 'batch2' | 'batch3' | 'batch4' | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          action: string
          entity_name: string
          entity_id: string
          old_values: Json | null
          new_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          action: string
          entity_name: string
          entity_id: string
          old_values?: Json | null
          new_values?: Json | null
          created_at?: string
        }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: {
      record_attendance_scan: {
        Args: {
          p_beneficiary_id: string
          p_device_info?: string
        }
        Returns: {
          event_id: string
          status: 'accepted' | 'duplicate' | 'invalid_window' | 'manual' | 'rejected'
          message: string
          event_type: 'AM_IN' | 'AM_OUT' | 'PM_IN' | 'PM_OUT' | null
          scanned_at: string
        }[]
      }
      recompute_attendance_daily: {
        Args: {
          p_beneficiary_ref: string
          p_attendance_date: string
        }
        Returns: string
      }
      set_user_role: {
        Args: {
          p_user_id: string
          p_role: 'leader' | 'co-leader' | 'developer'
        }
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
