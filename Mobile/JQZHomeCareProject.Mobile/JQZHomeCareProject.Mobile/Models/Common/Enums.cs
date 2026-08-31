namespace JQZHomeCareProject.Mobile.Models.Common
{
    public enum UserRole
    {
        SuperAdmin,
        MiddlePowerAdmin,
        SimpleAdmin,
        Practitioner
    }

    public enum VisitStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }

    public enum RefusedBy
    {
        Patient,
        Practitioner
    }

    public enum ReceivedByType
    {
        Practitioner,
        Company
    }

    public enum CollectionStatus
    {
        Pending,
        Received
    }
}