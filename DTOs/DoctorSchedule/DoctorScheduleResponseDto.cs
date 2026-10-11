using System;

namespace Hospital.DTOs.DoctorSchedule
{
	public class DoctorScheduleResponseDto
	{
		public int Id { get; set; }
		public int DoctorId { get; set; }
		public string DoctorName { get; set; } = string.Empty;
		public DayOfWeek DayOfWeek { get; set; }
		public TimeSpan StartTime { get; set; }
		public TimeSpan EndTime { get; set; }
		public bool IsAvailable { get; set; }
	}
}