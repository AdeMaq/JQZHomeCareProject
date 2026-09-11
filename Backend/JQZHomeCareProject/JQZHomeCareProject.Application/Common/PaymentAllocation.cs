using JQZHomeCareProject.Domain.Entities;
using JQZHomeCareProject.Domain.Enums;

namespace JQZHomeCareProject.Application.Common
{
    public static class PaymentAllocation
    {
        // Applies a lump sum collected by the office (not tied to a specific visit) across
        // the earliest unpaid visits first, marking each fully-covered visit PaidToCompany.
        public static void ApplyOfficePayment(IEnumerable<Payment> paymentsInVisitOrder, decimal amountToApply, DateTime timestamp)
        {
            var remaining = amountToApply;
            foreach (var payment in paymentsInVisitOrder)
            {
                if (remaining <= 0) break;

                var owed = payment.Amount - payment.AmountPaid;
                if (owed <= 0) continue;

                var portion = Math.Min(owed, remaining);
                payment.AmountPaid += portion;
                remaining -= portion;

                if (payment.AmountPaid >= payment.Amount)
                    payment.Status = PaymentStatus.PaidToCompany;

                payment.DateTime = timestamp;
            }
        }

        public static CollectionStatus ComputeCollectionStatus(IEnumerable<Payment> payments)
        {
            var list = payments.ToList();
            if (list.Count == 0) return CollectionStatus.Pending;
            if (list.All(p => p.AmountPaid >= p.Amount)) return CollectionStatus.AllReceived;
            if (list.Any(p => p.AmountPaid > 0)) return CollectionStatus.InstallmentPending;
            return CollectionStatus.Pending;
        }
    }
}