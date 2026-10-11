using AutoMapper;
using Hospital.Models;
using Hospital.DTOs.DoctorSchedule;

namespace Hospital.Mappings
{
    public class DoctorScheduleProfile : Profile
    {
        public DoctorScheduleProfile()
        {
            // Verilənlər bazasından qayıdan məlumatı UI üçün Response DTO-ya çevirir
            CreateMap<DoctorSchedule, DoctorScheduleResponseDto>()
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor != null ? src.Doctor.FullName : string.Empty));

            // Frontend-dən gələn məlumatı verilənlər bazası modelinə çevirir
            CreateMap<DoctorScheduleCreateDto, DoctorSchedule>();
            CreateMap<DoctorScheduleUpdateDto, DoctorSchedule>();
        }
    }
}