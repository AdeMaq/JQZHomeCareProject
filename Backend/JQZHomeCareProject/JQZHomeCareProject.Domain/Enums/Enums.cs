using System;
using System.Collections.Generic;
using System.Text;

namespace JQZHomeCareProject.Domain.Enums
{
    public enum UserRole { SuperAdmin, MiddlePowerAdmin, SimpleAdmin, Practitioner }

    public enum VisitStatus { Scheduled, InProgress, Completed, Cancelled }

    public enum RefusedBy { Patient, Practitioner }

    public enum ReceivedByType { Practitioner, Company }

    public enum PackagePaymentType { FullAdvance, Installment }

    public enum PatientPackageStatus { Active, Completed, Cancelled }

    public enum CollectionStatus { Pending, Received, InstallmentPending }
}
