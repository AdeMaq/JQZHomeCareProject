using JQZHomeCareProject.Application.Common.Interfaces;
using JQZHomeCareProject.Application.Common.Exceptions;
using JQZHomeCareProject.Application.DTOs;
using JQZHomeCareProject.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Application.Services
{
    public class PaymentService:IPaymentService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly IPractitionerRepository _practitionerRepository;

        public PaymentService(IVisitRepository visitRepository, IPractitionerRepository practitionerRepository)
        {
            _visitRepository = visitRepository;
            _practitionerRepository = practitionerRepository;
        }

        public async Task<WeeklySettlementDto> GetWeeklySummaryAsync(Guid practitionerId, DateTime weekStart)
        {
            var practitioner = await _practitionerRepository.GetByIdAsync(practitionerId);
            if(practitioner == null)
            {
                throw new NotFoundException($"Practitioner with ID {practitionerId} not found.");
            }

            var weekStartDate = weekStart.Date;
            var weekEndDate = weekStartDate.AddDays(6);

            var visits = await _visitRepository.GetInRangeAsync(weekStartDate, weekEndDate);

            var practitionerVisits = visits.Where(v => v.PractitionerId == practitionerId && v.Status == VisitStatus.Completed);

            var totalDue = practitionerVisits.Sum(v => v.AmountDue);

            var totalReceivedByPractitioner = practitionerVisits.Where(v=>v.ReceivedBy==ReceivedByType.Practitioner).Sum(v=>v.AmountReceived);

            var totalReceivedByCompany = practitionerVisits.Where(v => v.ReceivedBy == ReceivedByType.Company).Sum(v => v.AmountReceived);

            return new WeeklySettlementDto
            {
                PractitionerId = practitionerId,
                WeekStart = weekStartDate,
                WeekEnd = weekEndDate,
                TotalDue = totalDue,
                TotalReceivedByPractitioner = totalReceivedByPractitioner,
                TotalReceivedByCompany = totalReceivedByCompany
            };
        }
    }
}
