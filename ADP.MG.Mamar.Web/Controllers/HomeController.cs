using ADP.MG.Mamar.Web.ApiInfrastructure;
using ApiHelper;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using ADP.MG.Mamar.Web.ApiInfrastructure.Client;
using System.Web.Compilation;
using Newtonsoft.Json;
using System.Web.Script.Serialization;
using Telerik.Reporting;
using System.Configuration;
using ADP.MG.Mamar.Web.ReportHelper;
using ADP.MG.Mamar.Web.ReportHelper.DTO;
using System.Web.Http;
using System.IO;
using System.Net;
using System.Data.OleDb;
using Hangfire;
using System.Data;
using ADP.MG.Mamar.Web.Models;
using Microsoft.Office.Interop.Excel;
using Microsoft.AspNet.SignalR;
using ADP.MG.Mamar.Web.Content;
using System.Text.RegularExpressions;
using ADP.MG.Pcs.Common.ApiHelper.Client;
using ADP.MG.Pcs.Models.CustomsModels;
using Microsoft.AspNet.Identity;

namespace ADP.MG.Mamar.Web.Controllers
{
	//[SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
	public class HomeController : Controller
	{
		//private readonly IHostingEnvironment hh;
		public ActionResult Index()
		{
			ViewBag.UserName = User.Identity.Name;
            ViewBag.ApiURL = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["MamarBaseUrl"]);
			ViewBag.SurveyIframeUrl = ViewBag.ApiURL + "/Survey/Index"; //Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["SurveyIframeUrl"]);
			return View();
		}
		public ActionResult ConsolidatedIndex()
		{
			ViewBag.UserName = User.Identity.Name;
            ViewBag.ApiURL = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["MamarBaseUrl"]);
            return View();
		}

		public ActionResult GMSDashboard()
		{
			ViewBag.UserName = User.Identity.Name;
			return View();
		}

		[OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
		[HttpGet]
		public async Task<JsonResult> Get(string targetUrl, dynamic data)
		{
			try
			{


				string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
				ViewBag.LoginURL = Convert.ToString(System.Configuration.ConfigurationManager.AppSettings["MamarBaseUrl"]);
                var customHeadersList = new Dictionary<string, string>();
				var cCodeVal = !string.IsNullOrEmpty(Request.Headers["CCode"]) ? Request.Headers["CCode"].ToString() : string.Empty;
				var uCodeVal = !string.IsNullOrEmpty(Request.Headers["UCode"]) ? Request.Headers["UCode"].ToString() : string.Empty;
				customHeadersList.Add("CCode", cCodeVal);
				customHeadersList.Add("UCode", uCodeVal);

				//ITokenContainer tokenContainer = new TokenContainer();

				
				if (token == null)
				{
					return Json(new
					{
						redirectUrl = Url.Action("LogOff", "Account"),
						isRedirect = true
					}, JsonRequestBehavior.AllowGet);
				}

				string queryString = string.Empty;
				string dataString = ((string[])data)[0];
				if (!string.IsNullOrEmpty(dataString))
				{
					var dataParams = JObject.Parse(dataString);
					string[] properties = new string[dataParams.Count];
					var i = 0;
					foreach (var param in dataParams)
					{
						properties[i] = (string.Format("{0}={1}", param.Key, HttpUtility.JavaScriptStringEncode(param.Value.Value<string>())));
						i++;
					}
					queryString = string.Join("&", properties);
				}
				ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
				GenericClient cb = new GenericClient(client);

				var response = await cb.Get(targetUrl + "?" + queryString, customHeadersList);
				return new JsonResult() { Data = response, ContentType = "application/json", MaxJsonLength = Int32.MaxValue, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
				//  Json(response, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}

		[OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
		[HttpPost]
		public async Task<JsonResult> Post(Models.ApiModel apiModel)
		{
			var customHeadersList = new Dictionary<string, string>();
			var cCodeVal = !string.IsNullOrEmpty(Request.Headers["CCode"]) ? Request.Headers["CCode"].ToString() : string.Empty;
			var uCodeVal = !string.IsNullOrEmpty(Request.Headers["UCode"]) ? Request.Headers["UCode"].ToString() : string.Empty;
			customHeadersList.Add("CCode", cCodeVal);
			customHeadersList.Add("UCode", uCodeVal);
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			//ITokenContainer tokenContainer = new TokenContainer();

			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			var data = GetTargetData(apiModel);
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);

			var response = await cb.Post(apiModel.ApiUrl, data, customHeadersList);
			return Json(response, JsonRequestBehavior.AllowGet);
		}

		
		

		private static dynamic GetTargetData(Models.ApiModel apiModel)
		{
			if (apiModel.Data != null)
			{
				var targetTypeValue = string.Format("{0}.{1}", "ADP.MG.Pcs.Models", apiModel.TargetType);

				var targetType = BuildManager.GetType(targetTypeValue, false);

				var data = JsonConvert.DeserializeObject(apiModel.Data, targetType);
				return data;
			}
			else
				return null;
		}

        #region LC Report
        public async Task<ActionResult> ExportLCToExcel(string targetUrl, string CCode, string UCode, string ReportParameter)
        {
            string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
            if (token == null)
            {
                return Json(new
                {
                    redirectUrl = Url.Action("LogOff", "Account"),
                    isRedirect = true
                }, JsonRequestBehavior.AllowGet);
            }
            ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
            GenericClient cb = new GenericClient(client);
            var response = await cb.Get(targetUrl);
            JavaScriptSerializer j = new JavaScriptSerializer();
            ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
            if (!string.IsNullOrEmpty((response.ResponseResult)))
                reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
            var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "LCReport.trdx") };
            string[] parameters;
            parameters = ReportParameter.ToString().Split(';');
            typeReportSource.Parameters.Add("centerCode", parameters[0]);
            typeReportSource.Parameters.Add("jobNumber", parameters[1]);
            typeReportSource.Parameters.Add("searchString", parameters[2]);
            typeReportSource.Parameters.Add("pageNumber", parameters[3]);
            typeReportSource.Parameters.Add("pageSize", parameters[4]);
            typeReportSource.Parameters.Add("CCode", CCode);
            typeReportSource.Parameters.Add("UCode", UCode);
            typeReportSource.Parameters.Add("token", token);


            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
            Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("XLS", typeReportSource, null);
            byte[] contents = result.DocumentBytes;
            string mimeType = "vnd.ms-excel"; 
            return File(contents, string.Format("application/{0}", mimeType), "Chassis Details.xls");
        }
        #endregion

        public async Task<ActionResult> DownloadReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{
		//	ITokenContainer tokenContainer = new TokenContainer();
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance,token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			//var typeReportSource = new UriReportSource { Uri = string.Format("Reports/{0}", reportModel.ReportFileName) };
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "CustomReport.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("centerCode", parameters[0]);
			typeReportSource.Parameters.Add("jobNumber", parameters[1]);
			typeReportSource.Parameters.Add("searchString", parameters[2]);
			typeReportSource.Parameters.Add("pageNumber", parameters[3]);
			typeReportSource.Parameters.Add("pageSize", parameters[4]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
            typeReportSource.Parameters.Add("token", token);


            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			//Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport(reportModel.DownloadType.ToUpper(), typeReportSource, null);
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("XLS", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			//string mimeType = reportModel.DownloadType == "xls" ? "vnd.ms-excel" : "vnd.ms-excel";//reportModel.DownloadType;
			string mimeType = "vnd.ms-excel";//reportModel.DownloadType;
											 //return File(contents, string.Format("application/{0}", mimeType), reportModel.DownloadFileName);
			return File(contents, string.Format("application/{0}", mimeType), "Chassis Details.xls");
		}

		public async Task<ActionResult> DownloadExemptionReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
		//	ITokenContainer tokenContainer = new TokenContainer();
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Examptions.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("eLACode", parameters[1]);
			typeReportSource.Parameters.Add("centerCode", parameters[2]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
            typeReportSource.Parameters.Add("token", token);
            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Exemptions.pdf");
		}

		#region GMSDashboard Report Download
		[HttpGet]
		public async Task<ActionResult> DownloadPDFGMSStatusReport(string obj)
		{
			var arg = JsonConvert.DeserializeObject<CustomClearanceBIZSearchDTO>(obj);

			ITokenContainer tokenContainer = new TokenContainer();
			if (tokenContainer.ApiToken == null)
			{
				string token = Request.Cookies["mta"] != null ? Request.Cookies["mta"].Value : null;
				if (!String.IsNullOrEmpty(token))
					tokenContainer.ApiToken = token;
			}
			if (tokenContainer.ApiToken == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			const string FILE_TYPE = "PDF";
			var helper = new GMSDashboardHelper();
			var path = Server.MapPath(@"~/");
			var contents = await helper.GetReport(FILE_TYPE, path, arg);
			//return  Json( new { data= contents});
			string mimeType = "pdf";
			return File(contents, string.Format("application/{0}", mimeType), "StatusReport.pdf");
		}

		[HttpGet]
		public async Task<ActionResult> DownloadExcelGMSStatusReport(string obj)
		{
			var arg = JsonConvert.DeserializeObject<CustomClearanceBIZSearchDTO>(obj);

			ITokenContainer tokenContainer = new TokenContainer();
			if (tokenContainer.ApiToken == null)
			{
				string token = Request.Cookies["mta"] != null ? Request.Cookies["mta"].Value : null;
				if (!String.IsNullOrEmpty(token))
					tokenContainer.ApiToken = token;
			}
			if (tokenContainer.ApiToken == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			const string FILE_TYPE = "XLS";
			var helper = new GMSDashboardHelper();
			var path = Server.MapPath(@"~/");
			var contents = await helper.GetReport(FILE_TYPE, path, arg);
			string mimeType = "vnd.ms-excel";
			return File(contents, string.Format("application/{0}", mimeType), "StatusReport.xls");
		}
		#endregion

		public async Task<ActionResult> DownloadInspectionReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance,token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Inspections.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("eLACode", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
			Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Inspections.pdf");
		}

		public async Task<ActionResult> DownloadApprovalReport(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

            //ITokenContainer tokenContainer = new TokenContainer();
            string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;//Used this as Per Mudassar on 4-July-2019

            if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}

			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);

			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Approval.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("centerCode", parameters[0]);
			typeReportSource.Parameters.Add("jobNumber", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
            typeReportSource.Parameters.Add("token", token);
            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Approval.pdf");
		}

		public async Task<ActionResult> DownloadInspectionReports(string targetUrl, string CCode, string UCode, string ReportParameter)
		{

			//ITokenContainer tokenContainer = new TokenContainer();
			string token = Request.Cookies["MAQTA-LOCAL-TOKEN"].Value;
			if (token == null)
			{
				return Json(new
				{
					redirectUrl = Url.Action("LogOff", "Account"),
					isRedirect = true
				}, JsonRequestBehavior.AllowGet);
			}
			ApiHelper.Client.ApiClient client = new ApiHelper.Client.ApiClient(HttpClientInstance.Instance, token);
			GenericClient cb = new GenericClient(client);
			var response = await cb.Get(targetUrl);
			JavaScriptSerializer j = new JavaScriptSerializer();
			ADP.MG.Pcs.Models.EntityModels.Report reportModel = default(ADP.MG.Pcs.Models.EntityModels.Report);
			if (!string.IsNullOrEmpty((response.ResponseResult)))
				reportModel = Newtonsoft.Json.JsonConvert.DeserializeObject<ADP.MG.Pcs.Models.EntityModels.Report>(response.ResponseResult);
			var typeReportSource = new UriReportSource { Uri = string.Format("Report/{0}", "Inspection.trdx") };
			string[] parameters;
			parameters = ReportParameter.ToString().Split(';');
			typeReportSource.Parameters.Add("jobNumber", parameters[0]);
			typeReportSource.Parameters.Add("inspectionRefNum", parameters[1]);
			typeReportSource.Parameters.Add("CCode", CCode);
			typeReportSource.Parameters.Add("UCode", UCode);
            typeReportSource.Parameters.Add("token", token);
            Telerik.Reporting.Processing.ReportProcessor reportProcessor = new Telerik.Reporting.Processing.ReportProcessor();
			Telerik.Reporting.Processing.RenderingResult result = reportProcessor.RenderReport("PDF", typeReportSource, null);
			byte[] contents = result.DocumentBytes;
			string mimeType = "PDF";
			return File(contents, string.Format("application/{0}", mimeType), "Inspection.pdf");
		}
		public ActionResult DownLoadEIDSetup()
		{
			return File(Server.MapPath("~/ClientSetup/EIDReaderSetup.zip"),
						"application/zip", "EIDReaderSetup.zip");
		}
		[HttpGet]
		public JsonResult RedirectToOtherService(string service, dynamic data)
		{
			try
			{
				string url = string.Empty;
				switch (service)
				{
					case "transport":
						url = ConfigurationManager.AppSettings["TransportOrderUrl"];
						break;
					case "appointment":
						url = ConfigurationManager.AppSettings["AppointmentUrl"];
						break;
					case "kizad":
						url = ConfigurationManager.AppSettings["KizadUrl"];
						break;
                    case "pcs":
                        url = ConfigurationManager.AppSettings["DefaultURL"];
                        break;
                    default:
						break;
				}
				return Json(url, JsonRequestBehavior.AllowGet);
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				throw ex;
			}
		}
		

		[HttpGet]
		public ActionResult GetClientComputerName()
		{
			string addr, host, pc1, pc2, pc3, pc4, pc5, pc6;
			addr = Request.ServerVariables["REMOTE_ADDR"];
			host = Request.ServerVariables["REMOTE_HOST"];
			pc6 = this.HttpContext.Request.UserHostName;

			try
			{
				pc1 = System.Net.Dns.GetHostEntry(addr).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc1 = ex.Message;
			}
			try
			{
				pc2 = System.Net.Dns.GetHostEntry(host).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc2 = ex.Message;
			}
			try
			{
				pc3 = System.Net.Dns.GetHostByName(addr).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc3 = ex.Message;
			}
			try
			{
				pc4 = System.Net.Dns.GetHostByName(host).HostName;
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc4 = ex.Message;
			}
			try
			{
				pc5 = System.Net.Dns.GetHostName();
			}
			catch (Exception ex)
			{
				CentralELKLogger._errorlog.Error(ex, "MAMAR modul Error: " + ex.Message + " User Name " + User.Identity.GetUserName());
				pc5 = ex.Message;
			}

			return Json(new { addr, host, pc1, pc2, pc3, pc4, pc5, pc6 }, JsonRequestBehavior.AllowGet);

		}


        [HttpPost]
        public string SendSubDOManifestToBizTalk(HttpPostedFileBase manifestFile,  string uCode, string cCode, string centerCode, string billType)
        {
            var response = string.Empty;
            IWebClientHelper helper = new WebClientHelper();
            SubmitSubDOManifest subDOManifestRequest = new SubmitSubDOManifest();
            SubDOMF manifest = new SubDOMF();
            SubDOMFHeader header = new SubDOMFHeader();
            SubDOMFBody body = new SubDOMFBody();

            byte[] fileBytes;
            using (Stream inputStream = manifestFile.InputStream)
            {
                MemoryStream memoryStream = inputStream as MemoryStream;
                if (memoryStream == null)
                {
                    memoryStream = new MemoryStream();
                    inputStream.CopyTo(memoryStream);
                }
                fileBytes = memoryStream.ToArray();
            }

            header.DocumentReference = Guid.NewGuid().ToString();
            header.Sender = "Mamar";
            header.Receiver = "Customs";
            header.MessageType = "SubmitManifest";

            body.CenterCode = centerCode;
            body.UserCode = uCode;
            body.CompanyCode = cCode;
            body.ManifestBase64 = fileBytes;
            body.BillType = billType;

            manifest.Header = header;
            manifest.Body = body;

            subDOManifestRequest.SubmitManifest = manifest;

            response = helper.SendSubDOManifestToBizTalk(subDOManifestRequest, header.DocumentReference);

            return response;
        }

	}

}