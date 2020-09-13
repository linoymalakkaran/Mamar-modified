using ADP.MG.Mamar.Web.ApiInfrastructure;
using ADP.MG.Mamar.Web.ApiInfrastructure.Client;
using ADP.MG.Pcs.Common.ApiHelper.Client;
using ADP.MG.Pcs.Models.CustomsModels;
using ApiHelper;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using ADP.MG.Mamar.Web.ReportHelper.DTO;

namespace ADP.MG.Mamar.Web.ReportHelper
{
    public class ReportHelper
    {
        string InternetService_URLS = System.Configuration.ConfigurationManager.AppSettings["MamarAppSysApiURL"];
        public List<Datum> GetChassisDetails(string centerCode, string jobNumber, string searchString, int pageNumber, int pageSize,string CCode, string UCode,string token)
        {
            var dtos = GetChassisDetailss(centerCode, jobNumber, searchString, pageNumber, pageSize, CCode,UCode, token);
            return dtos;
        }

        public List<Datum> GetChassisDetailss(string centerCode, string jobNumber, string searchString, int pageNumber, int pageSize, string CCode, string UCode,string token)
        {
            //ITokenContainer tokenContainer = new TokenContainer();
            //string targetUrl = "Customs/Chassis/GetChassisList";
            //string queryString = string.Empty;
            //queryString = "centerCode=" + centerCode + "&jobNumber=" + jobNumber + "&searchString=" + searchString + "&pageNumber=" + pageNumber + "&pageSize=" + pageSize;
            //ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, tokenContainer);
            //GenericClient cb = new GenericClient(client);
            //var responses = cb.Get(targetUrl + "?" + queryString);
            string urls = string.Empty;
            //List<Datum> responseFromWS = new List<Datum>();
            List<RootObject> responseFromWS = new List<RootObject>();

            try
            {

                //   http://10.0.131.21/MAMAR/apiappointment/api/Customs/Chassis/GetChassisList?centerCode=M&jobNumber=12577061&searchString=&pageNumber=0&pageSize=20
                //   http://10.0.131.21/MAMAR/apiappointment/api/Customs/Chassis/GetChassisList?centerCode=M&jobNumber=12577061&searchString=&pageNumber=0&pageSize=0
                //   http://10.0.131.21/MAMAR/apiappointment/api/Customs/Chassis/GetChassisList?centerCode=M&jobNumber=12577061&searchString=&pageNumber=0&pageSize=0
                string reference = "api/Customs/Chassis/GetChassisList";
                string url = InternetService_URLS + reference;
                urls = url + "?centerCode=" + centerCode + "&jobNumber=" + jobNumber + "&searchString=" + searchString + "&pageNumber=" + pageNumber + "&pageSize=" + pageSize;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                //webRequest.ContentType = "application/json";
                webRequest.Method = "GET";
                // webRequest.PreAuthenticate = true;
                webRequest.Headers.Add("Authorization", "Bearer " + token);// tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";

                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS.Add(JsonConvert.DeserializeObject<RootObject>(obj));
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            List<Datum> copy = new List<Datum>(responseFromWS.FirstOrDefault().Data);
            return copy;
        }
        public List<Exemptions> GetExemptionDetailListing(string jobNumber, string eLACode, string centerCode,string CCode, string UCode,string token)
        {
            //ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            List<ExemptionRootObject> responseFromWS = new List<ExemptionRootObject>();

            try
            {
                string reference = "api/Customs/Exemption/PrintExemption";
                string url = InternetService_URLS + reference;
                urls = url + "?centerCode=" + centerCode + "&jobNumber=" + jobNumber + "&eLACode=" + eLACode;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                webRequest.Method = "GET";
                webRequest.Headers.Add("Authorization", "Bearer " + token);// tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS.Add(JsonConvert.DeserializeObject<ExemptionRootObject>(obj));
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            List<Exemptions> Exemptions = new List<Exemptions>(responseFromWS.FirstOrDefault().Data);
            //List<Exemptions> Exemptionss = new List<Exemptions>(responseFromWS.FirstOrDefault().Data);
            //Exemptionss.Add(Exemptions.FirstOrDefault());
            return Exemptions;
        }

        public InspectRootObject GetInspectionDetail(string jobNumber, string inspectionRefNum,string CCode, string UCode,string token)
        {
            //ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            InspectRootObject responseFromWS = new InspectRootObject();
            try
            {
                string reference = "api/Customs/Invoice/GetInspectionReport";
                string url = InternetService_URLS + reference;
                string CenterCode = "V";
                urls = url + "?jobNumber=" + jobNumber + "&referenceNumber=" + inspectionRefNum + "&centerCode=" + CenterCode;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                webRequest.Method = "GET";
                webRequest.Headers.Add("Authorization", "Bearer " + token);// tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS = JsonConvert.DeserializeObject<InspectRootObject>(obj);//.Add(JsonConvert.DeserializeObject<InspectRootObject>(obj));
                    }
                }
            }


            catch (Exception ex)
            {
                throw ex;
            }
            // InspectRootObject Inspection = new InspectRootObject(responseFromWSS);
            return responseFromWS;
        }

        public List<InspectionDetail> GetInspectionDetailList(string jobNumber, string inspectionRefNum, string CCode, string UCode)
        {
            ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            InspectRootObject responseFromWS = new InspectRootObject();
            try
            {
                string reference = "api/Customs/Invoice/GetInspectionReport";
                string url = InternetService_URLS + reference;
                urls = url + "?jobNumber=" + jobNumber + "&referenceNumber=" + inspectionRefNum;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                webRequest.Method = "GET";
                webRequest.Headers.Add("Authorization", "Bearer " + tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS = JsonConvert.DeserializeObject<InspectRootObject>(obj);//.Add(JsonConvert.DeserializeObject<InspectRootObject>(obj));
                    }
                }
            }


            catch (Exception ex)
            {
                throw ex;
            }
            // InspectRootObject Inspection = new InspectRootObject(responseFromWSS);
            return responseFromWS.Data.InspectionDetail;
        }

        #region GMS Report Customs Internal User Methods

        //public List<GMSContainerStatusResponse> GetGMSReleaseReportData(string x)
        public List<GMSContainerStatusResponse> GetGMSReleaseReportData(CustomClearanceBIZSearchDTO arg)
        {
            ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            GMSStatRootResponse responseFromWS = new GMSStatRootResponse();

            try
            {
                string reference = "api/Customs/Dashboard/SearchContainerReleaseReport";
                string url = InternetService_URLS + reference;
                //CustomClearanceBIZSearchDTO arg = new CustomClearanceBIZSearchDTO();
                //arg.gmsDashboardSearchFilter = new GMSDashboardSearchFilter();
                //arg.gmsDashboardSearchFilter.pageNo = 1;
                //arg.gmsDashboardSearchFilter.pageSize = 100;
                //arg.gmsDashboardSearchFilter.toDT = "2018-11-02 00:00:00";

                //urls = url + "?centerCode=" + centerCode + "&jobNumber=" + jobNumber + "&eLACode=" + eLACode;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(url);
                webRequest.ContentType = "application/json";
                webRequest.Method = "POST";
                webRequest.Headers.Add("Authorization", "Bearer " + tokenContainer.ApiToken);
                webRequest.Accept = "application/json";
                using (var streamWriter = new StreamWriter(webRequest.GetRequestStream()))
                {
                    string json = JsonConvert.SerializeObject(arg);

                    streamWriter.Write(json);
                    streamWriter.Flush();
                    streamWriter.Close();
                }
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS = JsonConvert.DeserializeObject<GMSStatRootResponse>(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            List<GMSContainerStatusResponse> result = new List<GMSContainerStatusResponse>(responseFromWS.ServiceResponse.Content);
            //List<Exemptions> Exemptionss = new List<Exemptions>(responseFromWS.FirstOrDefault().Data);
            //Exemptionss.Add(Exemptions.FirstOrDefault());
            return result;
        }
        #endregion

        public Approval GetApprovalDetails(string centerCode, string jobNumber, string CCode, string UCode,string token)
        {
            //ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            ApprovalRootObject responseFromWS = new ApprovalRootObject();
            //jobNumber = "12582650";
            try
            {
                string reference = "api/Customs/Exemption/PrintApproval";
                string url = InternetService_URLS + reference;
                urls = url + "?centerCode=" + centerCode + "&jobNumber=" + jobNumber;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                webRequest.Method = "GET";
                webRequest.Headers.Add("Authorization", "Bearer " + token);// tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS = JsonConvert.DeserializeObject<ApprovalRootObject>(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            Approval approvalObject = new Approval()
            {
                CenterDescription = responseFromWS.Data.Approval.CenterDescription,
                HouseBLNumber = responseFromWS.Data.Approval.HouseBLNumber,
                ShippingAgent = responseFromWS.Data.Approval.ShippingAgent,
                DONumberDate = responseFromWS.Data.Approval.DONumberDate,
                Consignee = responseFromWS.Data.Approval.Consignee,
                VesselCode = responseFromWS.Data.Approval.VesselCode,
                VesselName = responseFromWS.Data.Approval.VesselName,
                VoyageNumber = responseFromWS.Data.Approval.VoyageNumber,
                LoadPort = responseFromWS.Data.Approval.LoadPort,
                ShipmentNumberType = responseFromWS.Data.Approval.ShipmentNumberType,
                MarksNo = responseFromWS.Data.Approval.MarksNo,
                Weight = responseFromWS.Data.Approval.Weight,
                Volume = responseFromWS.Data.Approval.Volume,
                CountryOfOrigion = responseFromWS.Data.Approval.CountryOfOrigion,
                Content = responseFromWS.Data.Approval.Content
            };
            return approvalObject;
        }
        public List<Container> GetContainersList(string centerCode, string jobNumber, string CCode, string UCode,string token)
        {
           // ITokenContainer tokenContainer = new TokenContainer();
            string urls = string.Empty;
            // jobNumber = "12582650";
            ApprovalRootObject responseFromWS = new ApprovalRootObject();

            try
            {
                string reference = "api/Customs/Exemption/PrintApproval";
                string url = InternetService_URLS + reference;
                urls = url + "?centerCode=" + centerCode + "&jobNumber=" + jobNumber;
                HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(urls);
                webRequest.Method = "GET";
                webRequest.Headers.Add("Authorization", "Bearer " + token);// tokenContainer.ApiToken);
                webRequest.Headers.Add("CCode", CCode);
                webRequest.Headers.Add("UCode", UCode);
                webRequest.Accept = "application/json";
                using (WebResponse response = webRequest.GetResponse())
                {
                    using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                    {
                        var obj = rd.ReadToEnd();
                        responseFromWS = JsonConvert.DeserializeObject<ApprovalRootObject>(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            List<Container> _ContainersList = new List<Container>();
            if (responseFromWS.Data.Containers != null)
            {

                List<Container> ContainersList = new List<Container>(responseFromWS.Data.Containers);
                string _cList = "";
                for (int i = 0; i < ContainersList.Count; i++)
                {

                    _cList += ContainersList[i].ContainerNumber;
                    //if ((i % 3) != 0 && i != 0 && (i % 4) != 0)
                    //{
                    for (int j = ContainersList[i].ContainerNumber.Length; j < 15; j++)
                    {

                        // _cList = _cList + "  ";
                        _cList = _cList + "  ";
                    }
                    //}
                    //if (i == 0)
                    //{
                    //    for (int j = ContainersList[i].ContainerNumber.Length; j < 30; j++)
                    //    {

                    //        _cList = _cList + " ";
                    //    }

                    //}
                    //if (i % 4 == 0 && i != 0)
                    //{
                    //    for (int j = ContainersList[i].ContainerNumber.Length; j < 30; j++)
                    //    {

                    //        _cList = _cList + " ";
                    //    }
                    //}

                    // _cList += ContainersList[i].ContainerNumber + "    ";
                    if ((i + 1) % 6 == 0 && i != 0)
                        _cList += '\n';
                    //if ((i + 1) % 6 == 0 && i != 0)
                    //{
                    //    _ContainersList.Add(new Container() { ContainerNumber = _cList });
                    //    _cList = "";

                    //}


                }
                _ContainersList.Add(new Container() { ContainerNumber = _cList });
            }
            return _ContainersList;
        }

    }

    public class Datum
    {
        public double RNum { get; set; }
        public int JobNumber { get; set; }
        public string ChassisNumber { get; set; }
        public string EngineNumber { get; set; }
        public string CountryCode { get; set; }
        public object CountryEngName { get; set; }
        public object CountryArbName { get; set; }
        public Nullable<int> ModelYear { get; set; }
        public object ColorCode { get; set; }
        public object ColorEngName { get; set; }
        public string ColorArbName { get; set; }
        public string PoliceColorCode { get; set; }
        public string PoliceColorEngName { get; set; }
        public object PoliceColorArbName { get; set; }
        public string ChassisIssueFlag { get; set; }
        public string ReExportFlag { get; set; }
        public object VehicleSpecification { get; set; }
        public object BodyTypeCode { get; set; }
        public object BodyTypeEng { get; set; }
        public object BodyTypeArb { get; set; }
        public object SubTypeCode { get; set; }
        public object SubEngName { get; set; }
        public object SubArbName { get; set; }
        public object CatgoryEng { get; set; }
        public object CategoryArb { get; set; }
        public object TrafficNumber { get; set; }
        public object UAEID { get; set; }
        public object Cylinders { get; set; }
        public object PayLoad { get; set; }
        public object Weight { get; set; }
        public object NumberOfChairs { get; set; }
        public object PatrolType { get; set; }
        public object NumberOfDoors { get; set; }
        public object NumberOfWheels { get; set; }
        public object TransmissionType { get; set; }
        public object NumberOfAxils { get; set; }
        public object EnginePower { get; set; }
        public object SteeringType { get; set; }
        public object VehicleRemarks { get; set; }
        public object AgentRemarks { get; set; }
        public object CurrencyCode { get; set; }
        public object PriceCIF { get; set; }
        public object CurrenyEng { get; set; }
        public object CurrencyArb { get; set; }
        public object ExchangeRate { get; set; }
        public object CompanyCode { get; set; }
        public object UserCode { get; set; }
        public object CenterCode { get; set; }
        public string TotalCount { get; set; }
    }
    public class RootObject
    {
        public List<Datum> Data { get; set; }
        public object Messages { get; set; }
        public bool IsValid { get; set; }
    }
    public class Exemptions
    {
        public int ElaCode { get; set; }
        public int JobNumber { get; set; }
        public int Serial { get; set; }
        public string Ref { get; set; }
        public DateTime ReferenceDate { get; set; }
        public int ImportCode { get; set; }
        public string ImportDesc { get; set; }
        public string Response { get; set; }
        public string AuthorityRemarks { get; set; }
        public string CustomsPosting { get; set; }
        public string CustomsRemarks { get; set; }
        public string ApproveUser { get; set; }
        public string ApproveUserDesc { get; set; }
        public DateTime ApproveDate { get; set; }
        public string Status { get; set; }
        public string StatusDesc { get; set; }
    }
    public class ExemptionRootObject
    {
        public List<Exemptions> Data { get; set; }
        public string Messages { get; set; }
        public bool IsValid { get; set; }
    }

    public class Approval
    {
        public string CenterDescription { get; set; }
        public string HouseBLNumber { get; set; }
        public string ShippingAgent { get; set; }
        public string DONumberDate { get; set; }
        public string Consignee { get; set; }
        public string VesselCode { get; set; }
        public string VesselName { get; set; }
        public string VoyageNumber { get; set; }
        public string LoadPort { get; set; }
        public double ShipmentNumberType { get; set; }
        public string MarksNo { get; set; }
        public double Weight { get; set; }
        public double Volume { get; set; }
        public string CountryOfOrigion { get; set; }
        public string Content { get; set; }
    }

    public class Container
    {
        public string ContainerNumber { get; set; }
    }

    public class Data
    {
        public Approval Approval { get; set; }
        public List<Container> Containers { get; set; }

    }

    public class ApprovalRootObject
    {
        public Data Data { get; set; }
        public object Messages { get; set; }
        public bool IsValid { get; set; }
    }
    #region inspection report

    public class InspectionReportHeader
    {
        public string ReferenceNumber { get; set; }
        public DateTime InspectionDate { get; set; }
        public string TranportNumber { get; set; }
        public string TransportOrigin { get; set; }
        public string CenterDescArb { get; set; }
        public string TransType { get; set; }
        public decimal JobNumber { get; set; }
        public string CenterCode { get; set; }
        public string OriginCoutnry { get; set; }
        public object TransportNat { get; set; }
        public string PassFee { get; set; }
        public string CenterName { get; set; }
        public string EngHeading { get; set; }
        public string ArbHeading { get; set; }
        public string TransportType { get; set; }
    }

    public class InspectionDetail
    {
        public decimal MVID_MVIH_REFERENCE_NUM { get; set; }
        public decimal MVID_SERIAL { get; set; }
        public decimal MVID_PARCELS { get; set; }
        public decimal MVID_ITEMS { get; set; }
        public decimal MVID_GROSS_WEIGHT { get; set; }
        public decimal MVID_NET_WEIGHT { get; set; }
        public string MVID_DESC { get; set; }
        public object MVID_INVOICE { get; set; }
        public string MVID_CERT_OF_ORIGIN { get; set; }
        public string MVID_CURRENCY { get; set; }
        public decimal MVID_EXCHANGE_RATE { get; set; }
        public decimal MVID_VALUE { get; set; }
        public string MVID_AMOUNT_TYPE { get; set; }
        public object MVID_USER_MODIFIED { get; set; }
        public string MVID_USER_MODIFIED_NAME { get; set; }
        public DateTime MVID_DATE_MODIFIED { get; set; }
    }

    public class InspectSign
    {
        public decimal MVIG_MVIH_REFERENCE_NUM { get; set; }
        public string MVIG_AUTHORIZE_USER_1 { get; set; }
        public string USER_1_NAME { get; set; }
        public DateTime MVIG_AUTHORIZE_DATE_1 { get; set; }
        public object MVIG_AUTHORIZE_USER_2 { get; set; }
        public string USER_2_NAME { get; set; }
        public DateTime MVIG_AUTHORIZE_DATE_2 { get; set; }
        public object MVIG_AUTHORIZE_USER_3 { get; set; }
        public string USER_3_NAME { get; set; }
        public DateTime MVIG_AUTHORIZE_DATE_3 { get; set; }
    }

    public class Seal
    {
        public decimal MVIS_MVIH_REFERENCE_NUM { get; set; }
        public string MVIS_SEAL_NUM { get; set; }
    }

    public class InspectData
    {
        public InspectionReportHeader InspectionReportHeader { get; set; }
        public List<InspectionDetail> InspectionDetail { get; set; }
        public InspectSign InspectSign { get; set; }
        public List<Seal> Seal { get; set; }
    }

    public class InspectRootObject
    {
        public InspectData Data { get; set; }
        public object Messages { get; set; }
        public bool IsValid { get; set; }
    }



    #endregion


}