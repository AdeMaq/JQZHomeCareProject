using System;
using System.Collections.Generic;
using System.Text;
namespace JQZHomeCareProject.Application.Common.Interfaces
{
    public interface IMapsService
    {
        Task<(double Latitude, double Longitude)> GeocodeAsync(string address);
    }
}
