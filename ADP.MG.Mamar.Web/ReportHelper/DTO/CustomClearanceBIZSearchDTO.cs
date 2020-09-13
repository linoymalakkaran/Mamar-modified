using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace ADP.MG.Mamar.Web.ReportHelper.DTO
{
    public class CustomClearanceBIZSearchDTO
    {
        public GMSDashboardSearchFilter gmsDashboardSearchFilter { get; set; }
    }
    public class GMSDashboardSearchFilter
    {
        private Int32 pageNo_;
        private Int32 perPage_;
        private Int32? daysToRetrieve_;
        public Int32 pageNo
        {
            get { return pageNo_; }
            set { pageNo_ = value; }
        }
        public Int32 pageSize
        {
            get { return perPage_; }
            set { perPage_ = value; }
        }
        public Int32? daysToRetrieve
        {
            get { return daysToRetrieve_; }
            set { daysToRetrieve_ = value; }
        }
        public string containerNumber { get; set; }
        public string customsStatus { get; set; } //HOLD,RELEASE,NA
        public string inspectionDetails { get; set; } //Release for Inspection
        public string plateNumber { get; set; }
        public string terminal { get; set; }
        public string frieghtKind { get; set; } //Full, EMpty
        public string category { get; set; } //IMP,EXP,STRGE
        public string fromDT { get; set; } //yyyy-MM-dd HH:mm:ss
        public string toDT { get; set; }//yyyy-MM-dd HH:mm:ss

    }
    public class GMSStatRootResponse
    {
        public ServiceResponse ServiceResponse { get; set; }
    }


    public class ServiceResponse
    {
        public string Status { get; set; }
        public string ErrorDescription { get; set; }

        public List<GMSContainerStatusResponse> Content { get; set; }

    }


    public class GMSContainerStatusResponse
    {
        public string containerNumber { get; set; }
        public string customsStatus { get; set; } //HOLD,RELEASE,blank
        public string inspectionDetails { get; set; } //RELEASE, RELEASE - CUSTOMS INSPECTION
        public string plateNumber { get; set; }
        public string customsReceivedDT { get; set; } //yyyy-MM-dd HH:mm:ss

        public string customsDTFormated
        {
            get
            {
                DateTime date;
                if (DateTime.TryParseExact(this.customsReceivedDT,
                           "yyyy-MM-dd HH:mm:ss",
                           System.Globalization.CultureInfo.InvariantCulture,
                           System.Globalization.DateTimeStyles.None,
                           out date))
                {
                    return date.ToString("dd-MM-yyyy HH:mm:ss");
                }
                else
                    return this.customsReceivedDT;

            }
        }
        public string terminalDepartureDT { get; set; } //yyyy-MM-dd HH:mm:ss
        public string terminalDTFormated
        {
            get
            {
                DateTime date;
                if (DateTime.TryParseExact(this.terminalDepartureDT,
                           "yyyy-MM-dd HH:mm:ss",
                           System.Globalization.CultureInfo.InvariantCulture,
                           System.Globalization.DateTimeStyles.None,
                           out date))
                {
                    return date.ToString("dd-MM-yyyy HH:mm:ss");
                }
                else
                    return this.terminalDepartureDT;

                //var newDate = DateTime.ParseExact(this.terminalDepartureDT,
                //                  "yyyy-MM-dd HH:mm:ss",
                //                   CultureInfo.InvariantCulture);

            }
        }
        public string tagID { get; set; }
        public string category { get; set; } //IMP,EXP,STRGE,Blank
        public string transType { get; set; } //DM,RE,DI,RM,DE
        public string frieghtKind { get; set; }//FCL,MTY
        public string CustomRefNr { get; set; }
        public string holdType { get; set; }//OFF-S, ON-S
        public string messageID { get; set; }
        public string senderID { get; set; }//ADT,CUSTOMS
        public string receipientID { get; set; }//ADPC,CUSTOMS


    }
}